"use client";

import { Badge } from "@/components/ui/badge";
import { useDroppable } from "@dnd-kit/core";
import { IconClipboard, IconProgress, IconCheck } from "@tabler/icons-react";
import { KanbanCard } from "./kanban-card";
import type { Doc } from "../../convex/_generated/dataModel";

interface KanbanColumnProps {
  title: string;
  notes: Doc<"notes">[];
  status: string;
  onDelete: (noteId: string) => void;
}

const statusIcons = {
  todo: IconClipboard,
  in_progress: IconProgress,
  done: IconCheck,
};

export function KanbanColumn({ title, notes, status, onDelete }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const Icon = statusIcons[status as keyof typeof statusIcons];

  return (
    <div
      ref={setNodeRef}
      className={`bg-slate-50 border rounded-lg p-4 min-h-[400px] transition-all duration-200 ${
        isOver ? "border-blue-500 bg-blue-50" : "border-slate-200"
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {Icon && <Icon size={18} className="text-slate-600" />}
          <h3 className="font-semibold text-slate-700">{title}</h3>
        </div>
        <Badge variant="secondary">{notes.length}</Badge>
      </div>
      <div className="space-y-3">
        {notes.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No {status.replace("_", " ")} notes
          </p>
        ) : (
          notes.map((note) => (
            <KanbanCard key={note._id} note={note} onDelete={onDelete} />
          ))
        )}
      </div>
    </div>
  );
}
