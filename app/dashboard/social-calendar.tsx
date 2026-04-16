"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import {
  IconPlus, IconTrash, IconCalendar, IconBrandInstagram,
  IconBrandLinkedin, IconBrandFacebook, IconBrandX,
  IconBrandTelegram, IconDots, IconBulb, IconClock, IconCheck,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { api } from "../../convex/_generated/api";
import type { Doc, Id } from "../../convex/_generated/dataModel";

type ContentPlatform = "instagram" | "linkedin" | "facebook" | "twitter" | "telegram" | "other";
type ContentStatus = "idea" | "scheduled" | "posted";

const PLATFORM_CONFIG: Record<ContentPlatform, { label: string; icon: React.ElementType; color: string }> = {
  instagram: { label: "Instagram", icon: IconBrandInstagram, color: "text-pink-500"   },
  linkedin:  { label: "LinkedIn",  icon: IconBrandLinkedin,  color: "text-blue-600"   },
  facebook:  { label: "Facebook",  icon: IconBrandFacebook,  color: "text-blue-500"   },
  twitter:   { label: "X / Twitter", icon: IconBrandX,       color: "text-slate-700"  },
  telegram:  { label: "Telegram",  icon: IconBrandTelegram,  color: "text-sky-500"    },
  other:     { label: "Other",     icon: IconDots,           color: "text-slate-400"  },
};

const STATUS_CONFIG: Record<ContentStatus, { label: string; icon: React.ElementType; color: string; bg: string; next: ContentStatus }> = {
  idea:      { label: "Idea",      icon: IconBulb,  color: "text-yellow-600", bg: "bg-yellow-50",  next: "scheduled" },
  scheduled: { label: "Scheduled", icon: IconClock, color: "text-blue-600",   bg: "bg-blue-50",    next: "posted"    },
  posted:    { label: "Posted",    icon: IconCheck, color: "text-green-600",  bg: "bg-green-50",   next: "idea"      },
};

function ContentCard({ item, onDelete }: {
  item: Doc<"content">;
  onDelete: (id: Id<"content">) => void;
}) {
  const updateStatus = useMutation(api.content.updateStatus);
  const pcfg = PLATFORM_CONFIG[item.platform];
  const scfg = STATUS_CONFIG[item.status];
  const PIcon = pcfg.icon;
  const SIcon = scfg.icon;

  return (
    <div className="bg-white border border-slate-100 rounded-xl p-3 shadow-sm space-y-2 hover:border-slate-200 transition-all">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <PIcon size={14} className={pcfg.color} />
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">{pcfg.label}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => updateStatus({ contentId: item._id, status: scfg.next })}
            className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full cursor-pointer ${scfg.bg} ${scfg.color}`}
          >
            <SIcon size={9} />{scfg.label}
          </button>
          <button onClick={() => onDelete(item._id)} className="text-slate-200 hover:text-red-400 transition-colors">
            <IconTrash size={12} />
          </button>
        </div>
      </div>
      <p className="text-sm text-slate-700 leading-relaxed line-clamp-3">{item.body}</p>
      {item.scheduledAt && (
        <p className="text-[10px] text-slate-400 flex items-center gap-1">
          <IconClock size={10} />
          {new Date(item.scheduledAt).toLocaleString("en-NZ", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
        </p>
      )}
    </div>
  );
}

function BookingRow({ booking, leads, onDelete }: {
  booking: Doc<"bookings">;
  leads: Doc<"leads">[] | undefined;
  onDelete: (id: Id<"bookings">) => void;
}) {
  const updateStatus = useMutation(api.bookings.updateStatus);
  const linkedLead = leads?.find((l) => l._id === booking.leadId);
  const isPast = booking.date < Date.now();

  const statusColors = {
    confirmed: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    cancelled: "bg-slate-100 text-slate-500 line-through",
  };

  return (
    <div className={`flex gap-3 items-center p-3 rounded-xl border transition-all ${isPast && booking.status !== "cancelled" ? "border-slate-100 opacity-60" : "border-slate-100 bg-white hover:border-slate-200"}`}>
      <div className="shrink-0 text-center min-w-[40px]">
        <p className="text-lg font-bold text-slate-700 leading-none">
          {new Date(booking.date).getDate()}
        </p>
        <p className="text-[10px] text-slate-400 uppercase">
          {new Date(booking.date).toLocaleString("en-NZ", { month: "short" })}
        </p>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800">{booking.title}</p>
        <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5 flex-wrap">
          <span className="capitalize">{booking.type}</span>
          {booking.contact && <span>{booking.contact}</span>}
          {linkedLead && <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 text-[10px]">{linkedLead.name}</span>}
          <span>{new Date(booking.date).toLocaleTimeString("en-NZ", { hour: "2-digit", minute: "2-digit" })}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => {
            const next = booking.status === "confirmed" ? "pending" : booking.status === "pending" ? "cancelled" : "confirmed";
            updateStatus({ bookingId: booking._id, status: next });
          }}
          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full cursor-pointer ${statusColors[booking.status]}`}
        >
          {booking.status}
        </button>
        <button onClick={() => onDelete(booking._id)} className="text-slate-200 hover:text-red-400 transition-colors">
          <IconTrash size={13} />
        </button>
      </div>
    </div>
  );
}

function NewContentDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const createContent = useMutation(api.content.create);
  const [body, setBody] = useState("");
  const [platform, setPlatform] = useState<ContentPlatform>("instagram");
  const [scheduledAt, setScheduledAt] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    setSubmitting(true);
    await createContent({
      body: body.trim(),
      platform,
      scheduledAt: scheduledAt ? new Date(scheduledAt).getTime() : undefined,
    });
    setSubmitting(false);
    setBody(""); setScheduledAt("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>New Content</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3 pt-1">
          <div className="flex gap-2 flex-wrap">
            {(Object.keys(PLATFORM_CONFIG) as ContentPlatform[]).map((p) => {
              const cfg = PLATFORM_CONFIG[p];
              const Icon = cfg.icon;
              return (
                <button key={p} type="button" onClick={() => setPlatform(p)}
                  className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-all ${
                    platform === p ? "bg-slate-800 text-white border-slate-800 font-semibold" : "bg-white text-slate-500 border-slate-200"
                  }`}>
                  <Icon size={12} />{cfg.label}
                </button>
              );
            })}
          </div>
          <textarea placeholder="Post content *" value={body} onChange={(e) => setBody(e.target.value)}
            rows={4} className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Schedule for (optional)</label>
            <Input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={submitting || !body.trim()}>Add to Queue</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function NewBookingDialog({ open, onClose, leads }: {
  open: boolean;
  onClose: () => void;
  leads: Doc<"leads">[] | undefined;
}) {
  const createBooking = useMutation(api.bookings.create);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"meeting" | "call" | "event" | "other">("meeting");
  const [date, setDate] = useState("");
  const [contact, setContact] = useState("");
  const [leadId, setLeadId] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;
    setSubmitting(true);
    await createBooking({
      title: title.trim(),
      type,
      date: new Date(date).getTime(),
      contact: contact.trim() || undefined,
      leadId: leadId ? (leadId as Id<"leads">) : undefined,
      notes: notes.trim() || undefined,
    });
    setSubmitting(false);
    setTitle(""); setDate(""); setContact(""); setLeadId(""); setNotes("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Book a Meeting / Call</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3 pt-1">
          <Input placeholder="Title *" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
          <div className="flex gap-2 flex-wrap">
            {(["meeting", "call", "event", "other"] as const).map((t) => (
              <button key={t} type="button" onClick={() => setType(t)}
                className={`text-xs px-3 py-1 rounded-full border capitalize transition-all ${
                  type === t ? "bg-slate-800 text-white border-slate-800 font-semibold" : "bg-white text-slate-500 border-slate-200"
                }`}>{t}</button>
            ))}
          </div>
          <Input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} required />
          <Input placeholder="Contact name" value={contact} onChange={(e) => setContact(e.target.value)} />
          {leads && leads.length > 0 && (
            <select value={leadId} onChange={(e) => setLeadId(e.target.value)}
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">No lead linked</option>
              {leads.map((l) => <option key={l._id} value={l._id}>{l.name}{l.company ? ` — ${l.company}` : ""}</option>)}
            </select>
          )}
          <Input placeholder="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={submitting || !title.trim() || !date}>Book</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function SocialCalendar() {
  const contentItems = useQuery(api.content.list);
  const bookings = useQuery(api.bookings.upcoming);
  const leads = useQuery(api.leads.list);
  const contentStats = useQuery(api.content.getStats);
  const removeContent = useMutation(api.content.remove);
  const removeBooking = useMutation(api.bookings.remove);
  const [showNewContent, setShowNewContent] = useState(false);
  const [showNewBooking, setShowNewBooking] = useState(false);
  const [contentFilter, setContentFilter] = useState<ContentStatus | "all">("all");

  const filteredContent = contentItems && contentFilter !== "all"
    ? contentItems.filter((c) => c.status === contentFilter)
    : contentItems;

  return (
    <div className="space-y-8">
      {/* Social Media Queue */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-slate-800">Social Media Queue</h2>
            {contentStats && contentStats.byStatus.scheduled > 0 && (
              <Badge className="bg-blue-500 text-white text-xs">{contentStats.byStatus.scheduled} scheduled</Badge>
            )}
          </div>
          <Button size="sm" variant="outline" className="gap-1.5 h-8" onClick={() => setShowNewContent(true)}>
            <IconPlus size={14} /> Add Content
          </Button>
        </div>

        <div className="flex gap-1.5 mb-4 flex-wrap">
          {(["all", "idea", "scheduled", "posted"] as const).map((s) => (
            <button key={s} onClick={() => setContentFilter(s)}
              className={`text-xs px-3 py-1 rounded-full border capitalize transition-all ${
                contentFilter === s ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-500 border-slate-200"
              }`}>
              {s}{s !== "all" && contentStats ? ` (${contentStats.byStatus[s as ContentStatus]})` : ""}
            </button>
          ))}
        </div>

        {contentItems === undefined ? (
          <p className="text-sm text-slate-500">Loading content queue...</p>
        ) : filteredContent?.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-xl border border-slate-200">
            <p className="text-sm text-slate-500">No content yet. Add your first post idea.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 @xl/main:grid-cols-2 @5xl/main:grid-cols-3 gap-3">
            {filteredContent?.map((item) => (
              <ContentCard key={item._id} item={item}
                onDelete={(id) => { if (window.confirm("Delete content?")) removeContent({ contentId: id }); }} />
            ))}
          </div>
        )}
      </div>

      {/* Bookings / Calendar */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-slate-800">Upcoming Bookings</h2>
            <IconCalendar size={16} className="text-slate-400" />
          </div>
          <Button size="sm" variant="outline" className="gap-1.5 h-8" onClick={() => setShowNewBooking(true)}>
            <IconPlus size={14} /> Book
          </Button>
        </div>

        {bookings === undefined ? (
          <p className="text-sm text-slate-500">Loading bookings...</p>
        ) : bookings.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-xl border border-slate-200">
            <p className="text-sm text-slate-500">No upcoming bookings. Schedule a call or meeting.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {bookings.map((b) => (
              <BookingRow key={b._id} booking={b} leads={leads}
                onDelete={(id) => { if (window.confirm("Delete booking?")) removeBooking({ bookingId: id }); }} />
            ))}
          </div>
        )}
      </div>

      <NewContentDialog open={showNewContent} onClose={() => setShowNewContent(false)} />
      <NewBookingDialog open={showNewBooking} onClose={() => setShowNewBooking(false)} leads={leads} />
    </div>
  );
}
