import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("notes").order("desc").collect();
  },
});

export const saveNote = mutation({
  args: {
    text: v.string(),
    telegramUserId: v.string(),
    telegramUsername: v.optional(v.string()),
    audioFileId: v.string(),
    audioDuration: v.optional(v.number()),
    timestamp: v.number(),
  },
  handler: async (ctx, args) => {
    const noteId = await ctx.db.insert("notes", {
      text: args.text,
      telegramUserId: args.telegramUserId,
      telegramUsername: args.telegramUsername,
      audioFileId: args.audioFileId,
      audioDuration: args.audioDuration,
      timestamp: args.timestamp,
    });
    return noteId;
  },
});

export const updateNoteStatus = mutation({
  args: {
    noteId: v.id("notes"),
    status: v.union(
      v.literal("todo"),
      v.literal("in_progress"),
      v.literal("done")
    ),
  },
  handler: async (ctx, args) => {
    const note = await ctx.db.get(args.noteId);
    if (!note) throw new Error("Note not found");

    await ctx.db.patch(args.noteId, { status: args.status });
    return { success: true };
  },
});

export const deleteNote = mutation({
  args: { noteId: v.id("notes") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.noteId);
  },
});