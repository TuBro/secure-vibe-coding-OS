import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    return await ctx.db
      .query("messages")
      .withIndex("byTimestamp")
      .order("desc")
      .take(limit);
  },
});

export const listByLead = query({
  args: { leadId: v.id("leads") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("byLead", (q) => q.eq("leadId", args.leadId))
      .order("desc")
      .collect();
  },
});

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("messages").collect();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayMs = todayStart.getTime();

    return {
      total: all.length,
      unread: all.filter((m) => !m.isRead && m.direction === "inbound").length,
      todayTotal: all.filter((m) => m.timestamp >= todayMs).length,
      byChannel: {
        telegram: all.filter((m) => m.channel === "telegram").length,
        whatsapp: all.filter((m) => m.channel === "whatsapp").length,
        email: all.filter((m) => m.channel === "email").length,
        call: all.filter((m) => m.channel === "call").length,
        other: all.filter((m) => m.channel === "other").length,
      },
    };
  },
});

export const create = mutation({
  args: {
    channel: v.union(
      v.literal("telegram"),
      v.literal("whatsapp"),
      v.literal("email"),
      v.literal("call"),
      v.literal("other")
    ),
    direction: v.union(v.literal("inbound"), v.literal("outbound")),
    body: v.string(),
    from: v.optional(v.string()),
    to: v.optional(v.string()),
    leadId: v.optional(v.id("leads")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("messages", {
      ...args,
      isRead: args.direction === "outbound",
      timestamp: now,
      createdAt: now,
    });
  },
});

export const markRead = mutation({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.messageId, { isRead: true });
  },
});

export const markAllRead = mutation({
  args: {},
  handler: async (ctx) => {
    const unread = await ctx.db
      .query("messages")
      .withIndex("byUnread", (q) => q.eq("isRead", false))
      .collect();
    await Promise.all(unread.map((m) => ctx.db.patch(m._id, { isRead: true })));
    return { count: unread.length };
  },
});
