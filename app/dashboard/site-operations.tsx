"use client";

import { TokenUsageTracker } from "./token-usage-tracker";
import { SiteKanbanBoard } from "./site-kanban-board";
import { LeadsKanbanBoard } from "./leads-kanban-board";
import { CommsHub } from "./comms-hub";

export function SiteOperations() {
  return (
    <div className="px-4 lg:px-6 mb-8 space-y-10">

      {/* Sales Pipeline — Mission Control */}
      <div>
        <LeadsKanbanBoard />
      </div>

      {/* Communications — Unified Inbox */}
      <div>
        <CommsHub />
      </div>

      {/* Voice Notes — Task Board */}
      <div>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-800">Voice Notes Board</h2>
        </div>
        <SiteKanbanBoard />
      </div>

      {/* System */}
      <div>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-800">System</h2>
        </div>
        <TokenUsageTracker />
      </div>

    </div>
  );
}
