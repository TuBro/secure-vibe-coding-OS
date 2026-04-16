import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("tickets").order("desc").collect();
  },
});

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("tickets").collect();
    return {
      total: all.length,
      open: all.filter((t) => t.status === "open").length,
      urgent: all.filter((t) => t.priority === "urgent" && t.status !== "closed" && t.status !== "resolved").length,
      byStatus: {
        open: all.filter((t) => t.status === "open").length,
        in_progress: all.filter((t) => t.status === "in_progress").length,
        resolved: all.filter((t) => t.status === "resolved").length,
        closed: all.filter((t) => t.status === "closed").length,
      },
    };
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    body: v.string(),
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("urgent")
    ),
    source: v.union(
      v.literal("telegram"),
      v.literal("email"),
      v.literal("whatsapp"),
      v.literal("manual")
    ),
    assignedTo: v.optional(v.string()),
    leadId: v.optional(v.id("leads")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("tickets", {
      ...args,
      status: "open",
      createdAt: Date.now(),
    });
  },
});

export const updateStatus = mutation({
  args: {
    ticketId: v.id("tickets"),
    status: v.union(
      v.literal("open"),
      v.literal("in_progress"),
      v.literal("resolved"),
      v.literal("closed")
    ),
  },
  handler: async (ctx, args) => {
    const patch: Record<string, unknown> = { status: args.status };
    if (args.status === "resolved" || args.status === "closed") {
      patch.resolvedAt = Date.now();
    }
    await ctx.db.patch(args.ticketId, patch);
  },
});

export const remove = mutation({
  args: { ticketId: v.id("tickets") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.ticketId);
  },
});
