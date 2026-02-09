"use client";

import { useQuery, useMutation } from "convex/react";
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import { api } from "../../convex/_generated/api";
import { KanbanColumn } from "./kanban-column";
import type { Id } from "../../convex/_generated/dataModel";

export function SiteKanbanBoard() {
  const notes = useQuery(api.notes.list);
  const updateStatus = useMutation(api.notes.updateNoteStatus);
  const deleteNote = useMutation(api.notes.deleteNote);

  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor));

  if (notes === undefined) {
    return <p className="text-center text-muted-foreground py-8">Loading kanban...</p>;
  }

  // Filter notes by status
  const todoNotes = notes.filter((n) => !n.status || n.status === "todo");
  const inProgressNotes = notes.filter((n) => n.status === "in_progress");
  const doneNotes = notes.filter((n) => n.status === "done");

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const noteId = active.id as Id<"notes">;
    const newStatus = over.id as "todo" | "in_progress" | "done";

    await updateStatus({ noteId, status: newStatus });
  };

  const handleDelete = async (noteId: string) => {
    if (window.confirm("Are you sure you want to delete this note?")) {
      await deleteNote({ noteId: noteId as Id<"notes"> });
    }
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 @xl/main:grid-cols-2 @5xl/main:grid-cols-3 gap-4">
        <KanbanColumn title="To Do" notes={todoNotes} status="todo" onDelete={handleDelete} />
        <KanbanColumn
          title="In Progress"
          notes={inProgressNotes}
          status="in_progress"
          onDelete={handleDelete}
        />
        <KanbanColumn title="Done" notes={doneNotes} status="done" onDelete={handleDelete} />
      </div>
    </DndContext>
  );
}
