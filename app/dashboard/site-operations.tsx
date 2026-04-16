"use client";

import { TokenUsageTracker } from "./token-usage-tracker";
import { SiteKanbanBoard } from "./site-kanban-board";
import { LeadsKanbanBoard } from "./leads-kanban-board";
import { CommsHub } from "./comms-hub";
import { MarketingEngine } from "./marketing-engine";
import { SupportTickets } from "./support-tickets";
import { SocialCalendar } from "./social-calendar";

export function SiteOperations() {
  return (
    <div className="px-4 lg:px-6 mb-8 space-y-10">

      {/* Sales Pipeline */}
      <div><LeadsKanbanBoard /></div>

      {/* Communications */}
      <div><CommsHub /></div>

      {/* Marketing Engine */}
      <div><MarketingEngine /></div>

      {/* Support Tickets */}
      <div><SupportTickets /></div>

      {/* Social Media + Calendar */}
      <div><SocialCalendar /></div>

      {/* Voice Notes Board */}
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
