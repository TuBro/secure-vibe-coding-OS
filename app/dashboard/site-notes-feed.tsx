"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Doc, Id } from "../../convex/_generated/dataModel";

type NoteStatus = "todo" | "in_progress" | "done";

const STATUS_CONFIG: Record<NoteStatus, { label: string; classes: string; next: NoteStatus }> = {
  todo: {
    label: "To Do",
    classes: "bg-slate-100 text-slate-600 hover:bg-yellow-100 hover:text-yellow-700",
    next: "in_progress",
  },
  in_progress: {
    label: "In Progress",
    classes: "bg-yellow-100 text-yellow-700 hover:bg-green-100 hover:text-green-700",
    next: "done",
  },
  done: {
    label: "Done",
    classes: "bg-green-100 text-green-700 hover:bg-slate-100 hover:text-slate-600",
    next: "todo",
  },
};

function StatusBadge({ note, onUpdate }: { note: Doc<"notes">; onUpdate: (id: Id<"notes">, status: NoteStatus) => void }) {
  const status: NoteStatus = (note.status as NoteStatus) || "todo";
  const config = STATUS_CONFIG[status];

  return (
    <button
      onClick={() => onUpdate(note._id, config.next)}
      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full transition-colors cursor-pointer uppercase tracking-wide ${config.classes}`}
      title={`Click to mark as ${config.next.replace("_", " ")}`}
    >
      {config.label}
    </button>
  );
}

function NoteRow({ note, onUpdate }: { note: Doc<"notes">; onUpdate: (id: Id<"notes">, status: NoteStatus) => void }) {
  const durationStr = note.audioDuration
    ? note.audioDuration >= 60
      ? `${Math.floor(note.audioDuration / 60)}m ${note.audioDuration % 60}s`
      : `${note.audioDuration}s`
    : null;

  return (
    <div className="flex gap-3 items-start pb-4 border-b border-slate-50 last:border-0 last:pb-0">
      <div className="min-w-[36px] h-9 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-base shrink-0">
        🎤
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-700 leading-relaxed">"{note.text}"</p>
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <StatusBadge note={note} onUpdate={onUpdate} />
          {note.telegramUsername && (
            <span className="text-[10px] text-slate-400 font-medium">@{note.telegramUsername}</span>
          )}
          {durationStr && (
            <span className="text-[10px] text-slate-400">{durationStr}</span>
          )}
          <span className="text-[10px] text-slate-400 ml-auto">
            {new Date(note.timestamp).toLocaleTimeString("en-NZ", { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
      </div>
    </div>
  );
}

export function SiteNotesFeed() {
  const notes = useQuery(api.notes.list);
  const updateStatus = useMutation(api.notes.updateNoteStatus);

  const handleStatusUpdate = async (noteId: Id<"notes">, status: NoteStatus) => {
    await updateStatus({ noteId, status });
  };

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayMs = todayStart.getTime();

  const todayNotes = notes?.filter((n) => n.timestamp >= todayMs) ?? [];
  const earlierNotes = notes?.filter((n) => n.timestamp < todayMs).slice(0, 5) ?? [];

  return (
    <div className="px-4 lg:px-6 mb-8">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h2 className="font-semibold text-slate-800 flex items-center gap-2">
            <span>🎤</span> Voice Activity
          </h2>
          <div className="flex items-center gap-3">
            {notes !== undefined && (
              <span className="text-xs text-slate-500">
                {todayNotes.length} today · {notes.length} total
              </span>
            )}
          </div>
        </div>

        <div className="p-4">
          {notes === undefined ? (
            <p className="text-sm text-slate-500">Loading voice feed...</p>
          ) : notes.length === 0 ? (
            <p className="text-sm text-slate-500 italic">No voice notes yet. Send a voice message to Te Rā on Telegram.</p>
          ) : (
            <div className="space-y-0">

              {todayNotes.length > 0 && (
                <div className="mb-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Today</p>
                  <div className="space-y-4">
                    {todayNotes.map((note) => (
                      <NoteRow key={note._id} note={note} onUpdate={handleStatusUpdate} />
                    ))}
                  </div>
                </div>
              )}

              {earlierNotes.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 mt-2">Earlier</p>
                  <div className="space-y-4">
                    {earlierNotes.map((note) => (
                      <NoteRow key={note._id} note={note} onUpdate={handleStatusUpdate} />
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
