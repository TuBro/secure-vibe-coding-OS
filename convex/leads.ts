import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("leads").order("desc").collect();
  },
});

export const listByStatus = query({
  args: {
    status: v.union(
      v.literal("new"),
      v.literal("contacted"),
      v.literal("qualified"),
      v.literal("closed")
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("leads")
      .withIndex("byStatus", (q) => q.eq("status", args.status))
      .order("desc")
      .collect();
  },
});

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("leads").collect();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayMs = todayStart.getTime();

    return {
      total: all.length,
      newToday: all.filter((l) => l.createdAt >= todayMs).length,
      byStatus: {
        new: all.filter((l) => l.status === "new").length,
        contacted: all.filter((l) => l.status === "contacted").length,
        qualified: all.filter((l) => l.status === "qualified").length,
        closed: all.filter((l) => l.status === "closed").length,
      },
    };
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    company: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    source: v.optional(v.union(
      v.literal("voice"),
      v.literal("email"),
      v.literal("referral"),
      v.literal("manual")
    )),
    notes: v.optional(v.string()),
    assignedTo: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("leads", {
      ...args,
      status: "new",
      createdAt: Date.now(),
    });
  },
});

export const updateStatus = mutation({
  args: {
    leadId: v.id("leads"),
    status: v.union(
      v.literal("new"),
      v.literal("contacted"),
      v.literal("qualified"),
      v.literal("closed")
    ),
  },
  handler: async (ctx, args) => {
    const lead = await ctx.db.get(args.leadId);
    if (!lead) throw new Error("Lead not found");
    await ctx.db.patch(args.leadId, {
      status: args.status,
      lastContactedAt: Date.now(),
    });
    return { success: true };
  },
});

export const update = mutation({
  args: {
    leadId: v.id("leads"),
    name: v.optional(v.string()),
    company: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    notes: v.optional(v.string()),
    assignedTo: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { leadId, ...fields } = args;
    const lead = await ctx.db.get(leadId);
    if (!lead) throw new Error("Lead not found");
    await ctx.db.patch(leadId, fields);
    return { success: true };
  },
});

export const remove = mutation({
  args: { leadId: v.id("leads") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.leadId);
  },
});
