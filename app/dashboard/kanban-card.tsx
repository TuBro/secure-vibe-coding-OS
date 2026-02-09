"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IconTrash } from "@tabler/icons-react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type { Doc } from "../../convex/_generated/dataModel";

interface KanbanCardProps {
  note: Doc<"notes">;
  onDelete: (noteId: string) => void;
}

export function KanbanCard({ note, onDelete }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: note._id,
    data: { status: note.status || "todo" },
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
            <p className="text-sm text-slate-700 flex-1">{note.text}</p>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-slate-400 hover:text-red-600"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(note._id);
              }}
            >
              <IconTrash size={14} />
            </Button>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>👷🏽‍♂️</span>
            <span>{note.telegramUsername || "Unknown"}</span>
            <span>•</span>
            <span>{new Date(note._creationTime).toLocaleString()}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
