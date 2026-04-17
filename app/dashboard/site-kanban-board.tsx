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
import { useDroppable, useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  IconClipboard,
  IconProgress,
  IconCheck,
  IconPlus,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { api } from "../../convex/_generated/api";
import type { Id, Doc } from "../../convex/_generated/dataModel";

type TaskStatus = "todo" | "in_progress" | "done";

const COLUMNS: { status: TaskStatus; title: string; icon: React.ElementType }[] = [
  { status: "todo", title: "To Do", icon: IconClipboard },
  { status: "in_progress", title: "In Progress", icon: IconProgress },
  { status: "done", title: "Done", icon: IconCheck },
];

function TaskCard({
  task,
  onDelete,
}: {
  task: Doc<"tasks">;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task._id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card className="p-3 bg-white border border-slate-200 rounded-lg shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition-all duration-200">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-slate-700">{task.title}</p>
            {task.notes && (
              <p className="text-xs text-muted-foreground mt-1">{task.notes}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {new Date(task.createdAt).toLocaleDateString()}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-slate-400 hover:text-red-600 shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task._id);
            }}
          >
            <IconTrash size={14} />
          </Button>
        </div>
      </Card>
    </div>
  );
}

function TaskColumn({
  title,
  icon: Icon,
  status,
  tasks,
  onDelete,
}: {
  title: string;
  icon: React.ElementType;
  status: TaskStatus;
  tasks: Doc<"tasks">[];
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
          <Icon size={16} className="text-slate-600" />
          <h3 className="font-semibold text-slate-700 text-sm">{title}</h3>
        </div>
        <Badge variant="secondary">{tasks.length}</Badge>
      </div>
      <div className="space-y-3">
        {tasks.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-6">No tasks</p>
        ) : (
          tasks.map((task) => (
            <TaskCard key={task._id} task={task} onDelete={onDelete} />
          ))
        )}
      </div>
    </div>
  );
}

function AddTaskForm({ onClose }: { onClose: () => void }) {
  const createTask = useMutation(api.tasks.create);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    await createTask({ title: title.trim(), notes: notes.trim() || undefined });
    setSubmitting(false);
    onClose();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-end gap-2 mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg"
    >
      <div className="flex flex-col gap-1.5 flex-1">
        <Input
          placeholder="Task title *"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="h-8 text-sm"
          autoFocus
        />
        <Input
          placeholder="Notes (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="h-8 text-sm"
        />
      </div>
      <div className="flex gap-1.5 shrink-0">
        <Button type="submit" size="sm" disabled={submitting || !title.trim()} className="h-8">
          Add
        </Button>
        <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onClose}>
          <IconX size={14} />
        </Button>
      </div>
    </form>
  );
}

export function SiteKanbanBoard() {
  const tasks = useQuery(api.tasks.list);
  const updateStatus = useMutation(api.tasks.updateStatus);
  const removeTask = useMutation(api.tasks.remove);
  const [showAddForm, setShowAddForm] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor));

  if (tasks === undefined) {
    return <p className="text-center text-muted-foreground py-8">Loading tasks...</p>;
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    await updateStatus({
      taskId: active.id as Id<"tasks">,
      status: over.id as TaskStatus,
    });
  };

  const handleDelete = async (taskId: string) => {
    if (window.confirm("Delete this task?")) {
      await removeTask({ taskId: taskId as Id<"tasks"> });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-800">Task Board</h2>
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5"
          onClick={() => setShowAddForm((v) => !v)}
        >
          <IconPlus size={15} />
          Add Task
        </Button>
      </div>

      {showAddForm && <AddTaskForm onClose={() => setShowAddForm(false)} />}

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 @xl/main:grid-cols-2 @5xl/main:grid-cols-3 gap-4">
          {COLUMNS.map(({ status, title, icon }) => (
            <TaskColumn
              key={status}
              status={status}
              title={title}
              icon={icon}
              tasks={tasks.filter((t) => t.status === status)}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </DndContext>
    </div>
  );
}
