import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("bookings").withIndex("byDate").order("asc").collect();
  },
});

export const upcoming = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    return await ctx.db
      .query("bookings")
      .withIndex("byDate", (q) => q.gte("date", now))
      .order("asc")
      .take(10);
  },
});

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const all = await ctx.db.query("bookings").collect();
    return {
      total: all.length,
      upcoming: all.filter((b) => b.date >= now && b.status !== "cancelled").length,
      byStatus: {
        confirmed: all.filter((b) => b.status === "confirmed").length,
        pending: all.filter((b) => b.status === "pending").length,
        cancelled: all.filter((b) => b.status === "cancelled").length,
      },
    };
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    type: v.union(
      v.literal("meeting"),
      v.literal("call"),
      v.literal("event"),
      v.literal("other")
    ),
    date: v.number(),
    contact: v.optional(v.string()),
    leadId: v.optional(v.id("leads")),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("bookings", {
      ...args,
      status: "confirmed",
      createdAt: Date.now(),
    });
  },
});

export const updateStatus = mutation({
  args: {
    bookingId: v.id("bookings"),
    status: v.union(
      v.literal("confirmed"),
      v.literal("pending"),
      v.literal("cancelled")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.bookingId, { status: args.status });
  },
});

export const remove = mutation({
  args: { bookingId: v.id("bookings") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.bookingId);
  },
});
