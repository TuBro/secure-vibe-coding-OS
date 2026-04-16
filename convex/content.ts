import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("content").order("desc").collect();
  },
});

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("content").collect();
    return {
      total: all.length,
      byStatus: {
        idea: all.filter((c) => c.status === "idea").length,
        scheduled: all.filter((c) => c.status === "scheduled").length,
        posted: all.filter((c) => c.status === "posted").length,
      },
    };
  },
});

export const create = mutation({
  args: {
    body: v.string(),
    platform: v.union(
      v.literal("instagram"),
      v.literal("linkedin"),
      v.literal("facebook"),
      v.literal("twitter"),
      v.literal("telegram"),
      v.literal("other")
    ),
    scheduledAt: v.optional(v.number()),
    campaignId: v.optional(v.id("campaigns")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("content", {
      ...args,
      status: args.scheduledAt ? "scheduled" : "idea",
      createdAt: Date.now(),
    });
  },
});

export const updateStatus = mutation({
  args: {
    contentId: v.id("content"),
    status: v.union(
      v.literal("idea"),
      v.literal("scheduled"),
      v.literal("posted")
    ),
  },
  handler: async (ctx, args) => {
    const patch: Record<string, unknown> = { status: args.status };
    if (args.status === "posted") patch.postedAt = Date.now();
    await ctx.db.patch(args.contentId, patch);
  },
});

export const remove = mutation({
  args: { contentId: v.id("content") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.contentId);
  },
});
