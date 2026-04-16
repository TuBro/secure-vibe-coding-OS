"use client";

import { useQuery } from "convex/react";
import { IconTrendingUp, IconUsers, IconMicrophone, IconStar } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api } from "../../convex/_generated/api";

export function SectionCards() {
  const leadStats = useQuery(api.leads.getStats);
  const notes = useQuery(api.notes.list);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const voiceToday = notes
    ? notes.filter((n) => n.timestamp >= todayStart.getTime()).length
    : null;

  const activeLeads = leadStats
    ? leadStats.byStatus.new + leadStats.byStatus.contacted + leadStats.byStatus.qualified
    : null;

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">

      {/* Active Leads */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Active Leads</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {activeLeads ?? "—"}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconUsers size={12} />
              Pipeline
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {leadStats ? `${leadStats.byStatus.qualified} qualified` : "Loading..."}
            <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            {leadStats ? `${leadStats.newToday} added today` : "New / Contacted / Qualified"}
          </div>
        </CardFooter>
      </Card>

      {/* New Leads Today */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>New Today</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {leadStats ? leadStats.newToday : "—"}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconUsers size={12} />
              Today
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {leadStats ? `${leadStats.total} total leads` : "Loading..."}
          </div>
          <div className="text-muted-foreground">Leads added since midnight</div>
        </CardFooter>
      </Card>

      {/* Voice Messages Today */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Voice Messages Today</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {voiceToday ?? "—"}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconMicrophone size={12} />
              Telegram
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {notes ? `${notes.length} total messages` : "Loading..."}
          </div>
          <div className="text-muted-foreground">Via Telegram voice notes</div>
        </CardFooter>
      </Card>

      {/* Qualified Leads */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Qualified</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {leadStats ? leadStats.byStatus.qualified : "—"}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconStar size={12} />
              Ready
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {leadStats ? `${leadStats.byStatus.closed} closed` : "Loading..."}
            <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">Leads ready to close</div>
        </CardFooter>
      </Card>

    </div>
  );
}
