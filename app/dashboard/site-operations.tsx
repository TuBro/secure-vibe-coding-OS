"use client";

import { TokenUsageTracker } from "./token-usage-tracker";
import { SiteKanbanBoard } from "./site-kanban-board";

export function SiteOperations() {
  return (
    <div className="px-4 lg:px-6 mb-8">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">Site Operations</h2>
        <TokenUsageTracker />
      </div>
      <SiteKanbanBoard />
    </div>
  );
}
