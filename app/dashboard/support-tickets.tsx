"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import {
  IconPlus, IconTrash, IconAlertTriangle, IconCircleDot,
  IconProgress, IconCircleCheck, IconCircleX,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { api } from "../../convex/_generated/api";
import type { Doc, Id } from "../../convex/_generated/dataModel";

type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
type TicketPriority = "low" | "medium" | "high" | "urgent";
type TicketSource = "telegram" | "email" | "whatsapp" | "manual";

const PRIORITY_STYLES: Record<TicketPriority, string> = {
  low:    "bg-slate-100 text-slate-500",
  medium: "bg-blue-100 text-blue-600",
  high:   "bg-orange-100 text-orange-600",
  urgent: "bg-red-100 text-red-600 font-bold",
};

const STATUS_CONFIG: Record<TicketStatus, { label: string; icon: React.ElementType; color: string; next: TicketStatus }> = {
  open:        { label: "Open",        icon: IconCircleDot,   color: "text-blue-500",   next: "in_progress" },
  in_progress: { label: "In Progress", icon: IconProgress,    color: "text-yellow-500", next: "resolved"    },
  resolved:    { label: "Resolved",    icon: IconCircleCheck, color: "text-green-500",  next: "closed"      },
  closed:      { label: "Closed",      icon: IconCircleX,     color: "text-slate-400",  next: "open"        },
};

function TicketRow({ ticket, leads, onDelete }: {
  ticket: Doc<"tickets">;
  leads: Doc<"leads">[] | undefined;
  onDelete: (id: Id<"tickets">) => void;
}) {
  const updateStatus = useMutation(api.tickets.updateStatus);
  const cfg = STATUS_CONFIG[ticket.status];
  const Icon = cfg.icon;
  const linkedLead = leads?.find((l) => l._id === ticket.leadId);

  return (
    <div className="flex gap-3 items-start p-3 bg-white border border-slate-100 rounded-xl hover:border-slate-200 transition-all">
      <button
        onClick={() => updateStatus({ ticketId: ticket._id, status: cfg.next })}
        className={`mt-0.5 shrink-0 ${cfg.color} hover:opacity-70 transition-opacity`}
        title={`Mark as ${cfg.next.replace("_", " ")}`}
      >
        <Icon size={16} />
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2 flex-wrap mb-1">
          <p className="text-sm font-medium text-slate-800 flex-1">{ticket.title}</p>
          <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize shrink-0 ${PRIORITY_STYLES[ticket.priority]}`}>
            {ticket.priority === "urgent" && <IconAlertTriangle size={9} className="inline mr-0.5" />}
            {ticket.priority}
          </span>
        </div>

        <p className="text-xs text-slate-500 line-clamp-2 mb-1.5">{ticket.body}</p>

        <div className="flex items-center gap-2 text-[10px] text-slate-400 flex-wrap">
          <span className="capitalize">{ticket.source}</span>
          {linkedLead && <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">{linkedLead.name}</span>}
          {ticket.assignedTo && <span>→ {ticket.assignedTo}</span>}
          <span className="ml-auto">{new Date(ticket.createdAt).toLocaleDateString("en-NZ", { day: "numeric", month: "short" })}</span>
        </div>
      </div>

      <button onClick={() => onDelete(ticket._id)} className="text-slate-200 hover:text-red-400 transition-colors shrink-0">
        <IconTrash size={13} />
      </button>
    </div>
  );
}

function NewTicketDialog({ open, onClose, leads }: {
  open: boolean;
  onClose: () => void;
  leads: Doc<"leads">[] | undefined;
}) {
  const createTicket = useMutation(api.tickets.create);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [priority, setPriority] = useState<TicketPriority>("medium");
  const [source, setSource] = useState<TicketSource>("manual");
  const [leadId, setLeadId] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    setSubmitting(true);
    await createTicket({
      title: title.trim(),
      body: body.trim(),
      priority,
      source,
      leadId: leadId ? (leadId as Id<"leads">) : undefined,
      assignedTo: assignedTo.trim() || undefined,
    });
    setSubmitting(false);
    setTitle(""); setBody(""); setPriority("medium"); setSource("manual"); setLeadId(""); setAssignedTo("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>New Support Ticket</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3 pt-1">
          <Input placeholder="Title *" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
          <textarea
            placeholder="Describe the issue *"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <div className="flex gap-2 flex-wrap">
            {(["low", "medium", "high", "urgent"] as TicketPriority[]).map((p) => (
              <button key={p} type="button" onClick={() => setPriority(p)}
                className={`text-xs px-3 py-1 rounded-full border capitalize transition-all ${
                  priority === p ? "bg-slate-800 text-white border-slate-800 font-semibold" : "bg-white text-slate-500 border-slate-200"
                }`}>{p}</button>
            ))}
          </div>
          <div className="flex gap-2 flex-wrap">
            {(["manual", "telegram", "whatsapp", "email"] as TicketSource[]).map((s) => (
              <button key={s} type="button" onClick={() => setSource(s)}
                className={`text-xs px-3 py-1 rounded-full border capitalize transition-all ${
                  source === s ? "bg-slate-800 text-white border-slate-800 font-semibold" : "bg-white text-slate-500 border-slate-200"
                }`}>{s}</button>
            ))}
          </div>
          {leads && leads.length > 0 && (
            <select value={leadId} onChange={(e) => setLeadId(e.target.value)}
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">No lead linked</option>
              {leads.map((l) => <option key={l._id} value={l._id}>{l.name}{l.company ? ` — ${l.company}` : ""}</option>)}
            </select>
          )}
          <Input placeholder="Assign to" value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} />
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={submitting || !title.trim() || !body.trim()}>Create Ticket</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function SupportTickets() {
  const tickets = useQuery(api.tickets.list);
  const leads = useQuery(api.leads.list);
  const stats = useQuery(api.tickets.getStats);
  const removeTicket = useMutation(api.tickets.remove);
  const [showNew, setShowNew] = useState(false);
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "all">("all");

  const filtered = tickets && statusFilter !== "all"
    ? tickets.filter((t) => t.status === statusFilter)
    : tickets;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-slate-800">Support Tickets</h2>
          {stats && stats.urgent > 0 && (
            <Badge className="bg-red-500 text-white text-xs gap-1">
              <IconAlertTriangle size={10} /> {stats.urgent} urgent
            </Badge>
          )}
          {stats && stats.open > 0 && (
            <Badge variant="outline" className="text-xs">{stats.open} open</Badge>
          )}
        </div>
        <Button size="sm" variant="outline" className="gap-1.5 h-8" onClick={() => setShowNew(true)}>
          <IconPlus size={14} /> New Ticket
        </Button>
      </div>

      <div className="flex gap-1.5 mb-4 flex-wrap">
        {(["all", "open", "in_progress", "resolved", "closed"] as const).map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`text-xs px-3 py-1 rounded-full border transition-all ${
              statusFilter === s ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-500 border-slate-200"
            }`}>
            {s === "in_progress" ? "In Progress" : s.charAt(0).toUpperCase() + s.slice(1)}
            {s !== "all" && stats ? ` (${stats.byStatus[s as TicketStatus]})` : ""}
          </button>
        ))}
      </div>

      {tickets === undefined ? (
        <p className="text-sm text-slate-500">Loading tickets...</p>
      ) : filtered?.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-xl border border-slate-200">
          <p className="text-sm text-slate-500">No tickets. All clear.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered?.map((t) => (
            <TicketRow key={t._id} ticket={t} leads={leads}
              onDelete={(id) => { if (window.confirm("Delete ticket?")) removeTicket({ ticketId: id }); }} />
          ))}
        </div>
      )}

      <NewTicketDialog open={showNew} onClose={() => setShowNew(false)} leads={leads} />
    </div>
  );
}
