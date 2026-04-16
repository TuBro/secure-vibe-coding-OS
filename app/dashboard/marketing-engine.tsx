"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import {
  IconPlus, IconMail, IconShare, IconAd, IconFileText,
  IconDots, IconSparkles, IconTrash,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { api } from "../../convex/_generated/api";
import type { Doc, Id } from "../../convex/_generated/dataModel";

type CampaignChannel = "email" | "social" | "ad" | "content" | "other";
type CampaignStatus = "draft" | "active" | "paused" | "complete";

const CHANNEL_CONFIG: Record<CampaignChannel, { label: string; icon: React.ElementType; color: string }> = {
  email:   { label: "Email",   icon: IconMail,     color: "text-orange-500" },
  social:  { label: "Social",  icon: IconShare,    color: "text-blue-500"   },
  ad:      { label: "Ad",      icon: IconAd,       color: "text-purple-500" },
  content: { label: "Content", icon: IconFileText, color: "text-green-500"  },
  other:   { label: "Other",   icon: IconDots,     color: "text-slate-400"  },
};

const STATUS_STYLES: Record<CampaignStatus, string> = {
  draft:    "bg-slate-100 text-slate-600",
  active:   "bg-green-100 text-green-700",
  paused:   "bg-yellow-100 text-yellow-700",
  complete: "bg-blue-100 text-blue-700",
};

const STATUS_NEXT: Record<CampaignStatus, CampaignStatus> = {
  draft: "active", active: "paused", paused: "active", complete: "draft",
};

function CampaignCard({ campaign, leads, onDelete }: {
  campaign: Doc<"campaigns">;
  leads: Doc<"leads">[] | undefined;
  onDelete: (id: Id<"campaigns">) => void;
}) {
  const updateStatus = useMutation(api.campaigns.updateStatus);
  const saveBrief = useMutation(api.campaigns.saveBrief);
  const [generating, setGenerating] = useState(false);
  const [showBrief, setShowBrief] = useState(false);

  const cfg = CHANNEL_CONFIG[campaign.channel];
  const Icon = cfg.icon;

  const handleGenerateBrief = async () => {
    setGenerating(true);
    const prompt = [
      `Campaign: ${campaign.name}`,
      `Channel: ${campaign.channel}`,
      campaign.goal ? `Goal: ${campaign.goal}` : "",
      campaign.targetAudience ? `Audience: ${campaign.targetAudience}` : "",
      campaign.budget ? `Budget: $${campaign.budget}` : "",
    ].filter(Boolean).join("\n");

    const res = await fetch("/api/generate-brief", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    const data = await res.json();
    if (data.brief) {
      await saveBrief({ campaignId: campaign._id, brief: data.brief });
      setShowBrief(true);
    }
    setGenerating(false);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <Icon size={15} className={cfg.color} />
          <p className="text-sm font-semibold text-slate-800">{campaign.name}</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => updateStatus({ campaignId: campaign._id, status: STATUS_NEXT[campaign.status] })}
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full cursor-pointer transition-colors ${STATUS_STYLES[campaign.status]}`}
          >
            {campaign.status}
          </button>
          <button onClick={() => onDelete(campaign._id)} className="text-slate-300 hover:text-red-500 transition-colors">
            <IconTrash size={13} />
          </button>
        </div>
      </div>

      {campaign.goal && <p className="text-xs text-slate-500">{campaign.goal}</p>}

      <div className="flex flex-wrap gap-2 text-xs text-slate-400">
        {campaign.targetAudience && <span>Audience: {campaign.targetAudience}</span>}
        {campaign.budget && <span>Budget: ${campaign.budget.toLocaleString()}</span>}
      </div>

      {campaign.brief && showBrief && (
        <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-600 leading-relaxed border border-slate-100">
          {campaign.brief}
        </div>
      )}

      <div className="flex gap-2 pt-1">
        {!campaign.brief ? (
          <Button size="sm" variant="outline" className="gap-1.5 h-7 text-xs" onClick={handleGenerateBrief} disabled={generating}>
            <IconSparkles size={12} />
            {generating ? "Generating..." : "Generate Brief"}
          </Button>
        ) : (
          <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setShowBrief((v) => !v)}>
            {showBrief ? "Hide Brief" : "View Brief"}
          </Button>
        )}
      </div>
    </div>
  );
}

function NewCampaignDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const createCampaign = useMutation(api.campaigns.create);
  const [name, setName] = useState("");
  const [channel, setChannel] = useState<CampaignChannel>("social");
  const [goal, setGoal] = useState("");
  const [audience, setAudience] = useState("");
  const [budget, setBudget] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    await createCampaign({
      name: name.trim(),
      channel,
      goal: goal.trim() || undefined,
      targetAudience: audience.trim() || undefined,
      budget: budget ? parseFloat(budget) : undefined,
    });
    setSubmitting(false);
    setName(""); setGoal(""); setAudience(""); setBudget("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Campaign</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3 pt-1">
          <Input placeholder="Campaign name *" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          <div className="flex gap-2 flex-wrap">
            {(Object.keys(CHANNEL_CONFIG) as CampaignChannel[]).map((ch) => {
              const cfg = CHANNEL_CONFIG[ch];
              const Icon = cfg.icon;
              return (
                <button key={ch} type="button" onClick={() => setChannel(ch)}
                  className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-all ${
                    channel === ch ? "bg-slate-800 text-white border-slate-800 font-semibold" : "bg-white text-slate-500 border-slate-200"
                  }`}>
                  <Icon size={12} />{cfg.label}
                </button>
              );
            })}
          </div>
          <Input placeholder="Goal (e.g. 50 leads this month)" value={goal} onChange={(e) => setGoal(e.target.value)} />
          <Input placeholder="Target audience" value={audience} onChange={(e) => setAudience(e.target.value)} />
          <Input type="number" placeholder="Budget ($)" value={budget} onChange={(e) => setBudget(e.target.value)} />
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={submitting || !name.trim()}>Create Campaign</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function MarketingEngine() {
  const campaigns = useQuery(api.campaigns.list);
  const leads = useQuery(api.leads.list);
  const stats = useQuery(api.campaigns.getStats);
  const removeCampaign = useMutation(api.campaigns.remove);
  const [showNew, setShowNew] = useState(false);
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | "all">("all");

  const filtered = campaigns && statusFilter !== "all"
    ? campaigns.filter((c) => c.status === statusFilter)
    : campaigns;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-slate-800">Marketing Engine</h2>
          {stats && stats.byStatus.active > 0 && (
            <Badge className="bg-green-500 text-white text-xs">{stats.byStatus.active} active</Badge>
          )}
        </div>
        <Button size="sm" variant="outline" className="gap-1.5 h-8" onClick={() => setShowNew(true)}>
          <IconPlus size={14} /> New Campaign
        </Button>
      </div>

      <div className="flex gap-1.5 mb-4 flex-wrap">
        {(["all", "draft", "active", "paused", "complete"] as const).map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`text-xs px-3 py-1 rounded-full border transition-all capitalize ${
              statusFilter === s ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-500 border-slate-200"
            }`}>
            {s}{s !== "all" && stats ? ` (${stats.byStatus[s as CampaignStatus]})` : ""}
          </button>
        ))}
      </div>

      {campaigns === undefined ? (
        <p className="text-sm text-slate-500">Loading campaigns...</p>
      ) : filtered?.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-xl border border-slate-200">
          <p className="text-sm text-slate-500 mb-1">No campaigns yet.</p>
          <p className="text-xs text-slate-400">Create your first campaign to generate a brief.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 @xl/main:grid-cols-2 @5xl/main:grid-cols-3 gap-4">
          {filtered?.map((c) => (
            <CampaignCard key={c._id} campaign={c} leads={leads}
              onDelete={(id) => { if (window.confirm("Delete campaign?")) removeCampaign({ campaignId: id }); }} />
          ))}
        </div>
      )}

      <NewCampaignDialog open={showNew} onClose={() => setShowNew(false)} />
    </div>
  );
}
