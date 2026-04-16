"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import { useDroppable } from "@dnd-kit/core";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  IconUserPlus,
  IconCircleDot,
  IconPhone,
  IconStar,
  IconCircleCheck,
  IconX,
} from "@tabler/icons-react";
import { api } from "../../convex/_generated/api";
import { LeadsKanbanCard } from "./leads-kanban-card";
import type { Id, Doc } from "../../convex/_generated/dataModel";

type LeadStatus = "new" | "contacted" | "qualified" | "closed";

const COLUMNS: { status: LeadStatus; title: string; icon: React.ElementType; color: string }[] = [
  { status: "new", title: "New", icon: IconCircleDot, color: "text-blue-500" },
  { status: "contacted", title: "Contacted", icon: IconPhone, color: "text-yellow-500" },
  { status: "qualified", title: "Qualified", icon: IconStar, color: "text-green-500" },
  { status: "closed", title: "Closed", icon: IconCircleCheck, color: "text-slate-400" },
];

function LeadColumn({
  title,
  icon: Icon,
  color,
  status,
  leads,
  onDelete,
}: {
  title: string;
  icon: React.ElementType;
  color: string;
  status: LeadStatus;
  leads: Doc<"leads">[];
  onDelete: (id: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={`bg-slate-50 border rounded-lg p-4 min-h-[300px] transition-all duration-200 ${
        isOver ? "border-blue-500 bg-blue-50" : "border-slate-200"
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon size={16} className={color} />
          <h3 className="font-semibold text-slate-700 text-sm">{title}</h3>
        </div>
        <Badge variant="secondary">{leads.length}</Badge>
      </div>
      <div className="space-y-3">
        {leads.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-6">No {title.toLowerCase()} leads</p>
        ) : (
          leads.map((lead) => (
            <LeadsKanbanCard key={lead._id} lead={lead} onDelete={onDelete} />
          ))
        )}
      </div>
    </div>
  );
}

function AddLeadForm({ onClose }: { onClose: () => void }) {
  const createLead = useMutation(api.leads.create);
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    await createLead({
      name: name.trim(),
      company: company.trim() || undefined,
      phone: phone.trim() || undefined,
      source: "manual",
    });
    setSubmitting(false);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2 mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex flex-col gap-1.5 flex-1">
        <Input
          placeholder="Lead name *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-8 text-sm"
          autoFocus
        />
        <div className="flex gap-2">
          <Input
            placeholder="Company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="h-8 text-sm"
          />
          <Input
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="h-8 text-sm"
          />
        </div>
      </div>
      <div className="flex gap-1.5 shrink-0">
        <Button type="submit" size="sm" disabled={submitting || !name.trim()} className="h-8">
          Add
        </Button>
        <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onClose}>
          <IconX size={14} />
        </Button>
      </div>
    </form>
  );
}

export function LeadsKanbanBoard() {
  const leads = useQuery(api.leads.list);
  const updateStatus = useMutation(api.leads.updateStatus);
  const removeLead = useMutation(api.leads.remove);
  const [showAddForm, setShowAddForm] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor));

  if (leads === undefined) {
    return <p className="text-center text-muted-foreground py-8">Loading pipeline...</p>;
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const leadId = active.id as Id<"leads">;
    const newStatus = over.id as LeadStatus;

    await updateStatus({ leadId, status: newStatus });
  };

  const handleDelete = async (leadId: string) => {
    if (window.confirm("Remove this lead?")) {
      await removeLead({ leadId: leadId as Id<"leads"> });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-800">Sales Pipeline</h2>
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5"
          onClick={() => setShowAddForm((v) => !v)}
        >
          <IconUserPlus size={15} />
          Add Lead
        </Button>
      </div>

      {showAddForm && <AddLeadForm onClose={() => setShowAddForm(false)} />}

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 gap-4">
          {COLUMNS.map(({ status, title, icon, color }) => (
            <LeadColumn
              key={status}
              status={status}
              title={title}
              icon={icon}
              color={color}
              leads={leads.filter((l) => l.status === status)}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </DndContext>
    </div>
  );
}
