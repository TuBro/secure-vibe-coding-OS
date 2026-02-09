"use client";

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function TokenUsageTracker() {
  const mockData = [
    {
      provider: "OpenAI",
      model: "whisper-1",
      tokensUsed: 15420,
      totalTokens: 100000,
      cost: 0.31,
    },
    {
      provider: "Claude",
      model: "sonnet-4",
      tokensUsed: 8500,
      totalTokens: 50000,
      cost: 0.85,
    },
  ];

  return (
    <Card className="p-6">
      <CardHeader className="p-0 mb-4">
        <CardTitle className="text-lg">Token Usage Tracker</CardTitle>
        <CardDescription>AI API consumption overview</CardDescription>
      </CardHeader>
      <div className="space-y-4">
        {mockData.map((item) => {
          const percentage = Math.round((item.tokensUsed / item.totalTokens) * 100);
          return (
            <div key={item.provider} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{item.provider}</span>
                  <span className="text-xs text-muted-foreground">({item.model})</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{percentage}%</Badge>
                  <span className="text-sm font-medium">${item.cost.toFixed(2)}</span>
                </div>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-primary h-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{item.tokensUsed.toLocaleString()} tokens used</span>
                <span>{item.totalTokens.toLocaleString()} total</span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
