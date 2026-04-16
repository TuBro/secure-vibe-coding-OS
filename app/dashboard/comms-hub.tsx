"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import {
  IconBrandTelegram,
  IconBrandWhatsapp,
  IconMail,
  IconPhone,
  IconMessage,
  IconArrowDown,
  IconArrowUp,
  IconPlus,
  IconX,
  IconCheck,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "../../convex/_generated/api";
import type { Doc, Id } from "../../convex/_generated/dataModel";

type Channel = "telegram" | "whatsapp" | "email" | "call" | "other";
type Direction = "inbound" | "outbound";

const CHANNEL_CONFIG: Record<Channel, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  telegram: { label: "Telegram", icon: IconBrandTelegram, color: "text-blue-500", bg: "bg-blue-50" },
  whatsapp: { label: "WhatsApp", icon: IconBrandWhatsapp, color: "text-green-500", bg: "bg-green-50" },
  email: { label: "Email", icon: IconMail, color: "text-orange-500", bg: "bg-orange-50" },
  call: { label: "Call", icon: IconPhone, color: "text-purple-500", bg: "bg-purple-50" },
  other: { label: "Other", icon: IconMessage, color: "text-slate-500", bg: "bg-slate-50" },
};

function ChannelBadge({ channel }: { channel: Channel }) {
  const cfg = CHANNEL_CONFIG[channel];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide ${cfg.bg} ${cfg.color}`}>
      <Icon size={10} />
      {cfg.label}
    </span>
  );
}

function MessageRow({
  message,
  leads,
  onMarkRead,
}: {
  message: Doc<"messages">;
  leads: Doc<"leads">[] | undefined;
  onMarkRead: (id: Id<"messages">) => void;
}) {
  const linkedLead = leads?.find((l) => l._id === message.leadId);
  const isInbound = message.direction === "inbound";

  return (
    <div
      className={`flex gap-3 items-start pb-4 border-b border-slate-50 last:border-0 last:pb-0 ${
        !message.isRead && isInbound ? "bg-blue-50/40 -mx-4 px-4 py-3 rounded-lg" : ""
      }`}
    >
      <div className="shrink-0 mt-0.5">
        {isInbound ? (
          <IconArrowDown size={14} className="text-blue-400" />
        ) : (
          <IconArrowUp size={14} className="text-slate-400" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2 flex-wrap mb-1">
          <ChannelBadge channel={message.channel} />
          {linkedLead && (
            <span className="text-[10px] text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded-full">
              {linkedLead.name}
              {linkedLead.company ? ` · ${linkedLead.company}` : ""}
            </span>
          )}
          {message.from && !linkedLead && (
            <span className="text-[10px] text-slate-400">{message.from}</span>
          )}
        </div>

        <p className="text-sm text-slate-700 leading-relaxed">{message.body}</p>

        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-[10px] text-slate-400">
            {new Date(message.timestamp).toLocaleString("en-NZ", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          {!message.isRead && isInbound && (
            <button
              onClick={() => onMarkRead(message._id)}
              className="text-[10px] text-blue-500 hover:text-blue-700 font-medium flex items-center gap-0.5 ml-auto"
            >
              <IconCheck size={10} /> Mark read
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function LogForm({
  leads,
  onClose,
}: {
  leads: Doc<"leads">[] | undefined;
  onClose: () => void;
}) {
  const createMessage = useMutation(api.messages.create);
  const [channel, setChannel] = useState<Channel>("whatsapp");
  const [direction, setDirection] = useState<Direction>("outbound");
  const [body, setBody] = useState("");
  const [to, setTo] = useState("");
  const [leadId, setLeadId] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    setSubmitting(true);
    await createMessage({
      channel,
      direction,
      body: body.trim(),
      to: to.trim() || undefined,
      leadId: leadId ? (leadId as Id<"leads">) : undefined,
    });
    setSubmitting(false);
    onClose();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-4 p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-700">Log Outreach</p>
        <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
          <IconX size={16} />
        </button>
      </div>

      {/* Channel + Direction */}
      <div className="flex gap-2 flex-wrap">
        {(Object.keys(CHANNEL_CONFIG) as Channel[]).map((ch) => {
          const cfg = CHANNEL_CONFIG[ch];
          const Icon = cfg.icon;
          return (
            <button
              key={ch}
              type="button"
              onClick={() => setChannel(ch)}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-all ${
                channel === ch
                  ? `${cfg.bg} ${cfg.color} border-current font-semibold`
                  : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
              }`}
            >
              <Icon size={13} />
              {cfg.label}
            </button>
          );
        })}
      </div>

      <div className="flex gap-2">
        {(["outbound", "inbound"] as Direction[]).map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => setDirection(d)}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-all ${
              direction === d
                ? "bg-slate-800 text-white border-slate-800 font-semibold"
                : "bg-white text-slate-500 border-slate-200"
            }`}
          >
            {d === "outbound" ? <IconArrowUp size={12} /> : <IconArrowDown size={12} />}
            {d.charAt(0).toUpperCase() + d.slice(1)}
          </button>
        ))}
      </div>

      {/* Link to lead */}
      {leads && leads.length > 0 && (
        <select
          value={leadId}
          onChange={(e) => setLeadId(e.target.value)}
          className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">No lead linked</option>
          {leads.map((l) => (
            <option key={l._id} value={l._id}>
              {l.name}{l.company ? ` — ${l.company}` : ""}
            </option>
          ))}
        </select>
      )}

      <Input
        placeholder={direction === "outbound" ? "Sent to (name / number)" : "Received from"}
        value={to}
        onChange={(e) => setTo(e.target.value)}
        className="h-8 text-sm"
      />

      <textarea
        placeholder="Message or call notes..."
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={3}
        className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
      />

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
        <Button type="submit" size="sm" disabled={submitting || !body.trim()}>
          Log Message
        </Button>
      </div>
    </form>
  );
}

export function CommsHub() {
  const messages = useQuery(api.messages.list, { limit: 30 });
  const leads = useQuery(api.leads.list);
  const stats = useQuery(api.messages.getStats);
  const markRead = useMutation(api.messages.markRead);
  const markAllRead = useMutation(api.messages.markAllRead);
  const [showForm, setShowForm] = useState(false);
  const [channelFilter, setChannelFilter] = useState<Channel | "all">("all");

  const handleMarkRead = async (id: Id<"messages">) => {
    await markRead({ messageId: id });
  };

  const filtered =
    messages && channelFilter !== "all"
      ? messages.filter((m) => m.channel === channelFilter)
      : messages;

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayMs = todayStart.getTime();
  const todayMessages = filtered?.filter((m) => m.timestamp >= todayMs) ?? [];
  const earlierMessages = filtered?.filter((m) => m.timestamp < todayMs) ?? [];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-slate-800">Communications</h2>
          {stats && stats.unread > 0 && (
            <Badge className="bg-blue-500 text-white text-xs">{stats.unread} unread</Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {stats && stats.unread > 0 && (
            <Button
              size="sm"
              variant="ghost"
              className="text-xs h-7"
              onClick={() => markAllRead()}
            >
              Mark all read
            </Button>
          )}
          <Button size="sm" variant="outline" className="gap-1.5 h-8" onClick={() => setShowForm((v) => !v)}>
            <IconPlus size={14} />
            Log
          </Button>
        </div>
      </div>

      {/* Channel filter */}
      <div className="flex gap-1.5 mb-4 flex-wrap">
        <button
          onClick={() => setChannelFilter("all")}
          className={`text-xs px-3 py-1 rounded-full border transition-all ${
            channelFilter === "all"
              ? "bg-slate-800 text-white border-slate-800"
              : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
          }`}
        >
          All {stats ? `(${stats.total})` : ""}
        </button>
        {(Object.keys(CHANNEL_CONFIG) as Channel[]).map((ch) => {
          const cfg = CHANNEL_CONFIG[ch];
          const Icon = cfg.icon;
          const count = stats?.byChannel[ch] ?? 0;
          if (count === 0) return null;
          return (
            <button
              key={ch}
              onClick={() => setChannelFilter(ch)}
              className={`flex items-center gap-1 text-xs px-3 py-1 rounded-full border transition-all ${
                channelFilter === ch
                  ? `${cfg.bg} ${cfg.color} border-current font-semibold`
                  : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
              }`}
            >
              <Icon size={11} />
              {cfg.label} ({count})
            </button>
          );
        })}
      </div>

      {showForm && <LogForm leads={leads} onClose={() => setShowForm(false)} />}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-4">
          {messages === undefined ? (
            <p className="text-sm text-slate-500">Loading communications...</p>
          ) : messages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-slate-500 mb-2">No messages yet.</p>
              <p className="text-xs text-slate-400">Log your first outreach using the button above.</p>
            </div>
          ) : (
            <div>
              {todayMessages.length > 0 && (
                <div className="mb-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Today</p>
                  <div className="space-y-0">
                    {todayMessages.map((m) => (
                      <MessageRow key={m._id} message={m} leads={leads} onMarkRead={handleMarkRead} />
                    ))}
                  </div>
                </div>
              )}
              {earlierMessages.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 mt-2">Earlier</p>
                  <div className="space-y-0">
                    {earlierMessages.map((m) => (
                      <MessageRow key={m._id} message={m} leads={leads} onMarkRead={handleMarkRead} />
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
