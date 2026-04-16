import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("campaigns").order("desc").collect();
  },
});

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("campaigns").collect();
    return {
      total: all.length,
      byStatus: {
        draft: all.filter((c) => c.status === "draft").length,
        active: all.filter((c) => c.status === "active").length,
        paused: all.filter((c) => c.status === "paused").length,
        complete: all.filter((c) => c.status === "complete").length,
      },
    };
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    channel: v.union(
      v.literal("email"),
      v.literal("social"),
      v.literal("ad"),
      v.literal("content"),
      v.literal("other")
    ),
    goal: v.optional(v.string()),
    targetAudience: v.optional(v.string()),
    budget: v.optional(v.number()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("campaigns", {
      ...args,
      status: "draft",
      createdAt: Date.now(),
    });
  },
});

export const updateStatus = mutation({
  args: {
    campaignId: v.id("campaigns"),
    status: v.union(
      v.literal("draft"),
      v.literal("active"),
      v.literal("paused"),
      v.literal("complete")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.campaignId, { status: args.status });
  },
});

export const saveBrief = mutation({
  args: { campaignId: v.id("campaigns"), brief: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.campaignId, { brief: args.brief });
  },
});

export const remove = mutation({
  args: { campaignId: v.id("campaigns") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.campaignId);
  },
});
