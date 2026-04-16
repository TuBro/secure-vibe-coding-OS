"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IconTrash, IconPhone, IconMail, IconBuilding } from "@tabler/icons-react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type { Doc } from "../../convex/_generated/dataModel";

interface LeadsKanbanCardProps {
  lead: Doc<"leads">;
  onDelete: (leadId: string) => void;
}

const sourceColors: Record<string, string> = {
  voice: "bg-purple-100 text-purple-700",
  email: "bg-blue-100 text-blue-700",
  referral: "bg-green-100 text-green-700",
  manual: "bg-slate-100 text-slate-700",
};

export function LeadsKanbanCard({ lead, onDelete }: LeadsKanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: lead._id,
    data: { status: lead.status },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card className="p-3 bg-white border border-slate-200 rounded-lg shadow-sm cursor-grab active:cursor-grabbing transition-all duration-200 hover:shadow-md">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold text-slate-800 flex-1">{lead.name}</p>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-slate-400 hover:text-red-600 shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(lead._id);
              }}
            >
              <IconTrash size={14} />
            </Button>
          </div>

          {lead.company && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <IconBuilding size={12} />
              <span>{lead.company}</span>
            </div>
          )}

          <div className="flex flex-wrap gap-1.5 text-xs text-slate-500">
            {lead.phone && (
              <span className="flex items-center gap-1">
                <IconPhone size={11} />
                {lead.phone}
              </span>
            )}
            {lead.email && (
              <span className="flex items-center gap-1">
                <IconMail size={11} />
                {lead.email}
              </span>
            )}
          </div>

          {lead.notes && (
            <p className="text-xs text-slate-500 line-clamp-2">{lead.notes}</p>
          )}

          <div className="flex items-center justify-between pt-1">
            {lead.source && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${sourceColors[lead.source] ?? "bg-slate-100 text-slate-600"}`}>
                {lead.source}
              </span>
            )}
            <span className="text-xs text-muted-foreground ml-auto">
              {new Date(lead.createdAt).toLocaleDateString("en-NZ", { day: "numeric", month: "short" })}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
