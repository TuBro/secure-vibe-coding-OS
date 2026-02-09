"use client";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function SiteNotesFeed() {
  const notes = useQuery(api.notes.list);

  return (
    <div className="px-4 lg:px-6 mb-8">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h2 className="font-semibold text-slate-800 flex items-center gap-2">
            <span className="text-blue-500">🎤</span> Latest Site Notes
          </h2>
          <a href="/notes" className="text-xs text-blue-600 hover:underline font-medium">View All</a>
        </div>
        <div className="p-4">
          {notes === undefined ? (
            <p className="text-sm text-slate-500">Loading site feed...</p>
          ) : notes.length === 0 ? (
            <p className="text-sm text-slate-500 italic">No notes yet. Talk to Te Ra on Telegram!</p>
          ) : (
            <div className="space-y-4">
              {notes.slice(0, 3).map((note: any) => (
                <div key={note._id} className="flex gap-3 items-start pb-3 border-b border-slate-50 last:border-0 last:pb-0">
                  <div className="min-w-[40px] h-10 rounded-full bg-slate-100 flex items-center justify-center text-lg">
                    👷🏽‍♂️
                  </div>
                  <div>
                    <p className="text-sm text-slate-700 leading-relaxed">"{note.text}"</p>
                    <p className="text-[10px] text-slate-400 mt-1 font-medium uppercase tracking-wider">
                      {new Date(note._creationTime).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}