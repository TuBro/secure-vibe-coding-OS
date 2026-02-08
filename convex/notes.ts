import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Save a transcribed voice note from Telegram
 */
export const saveNote = mutation({
  args: {
    text: v.string(),
    telegramUserId: v.string(),
    telegramUsername: v.optional(v.string()),
    audioFileId: v.string(),
    audioDuration: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const timestamp = Date.now();

    // Optional: Try to link to existing user by matching Telegram username/ID
    // For now, we'll store userId as optional and can link it later

    const noteId = await ctx.db.insert("notes", {
      text: args.text,
      timestamp,
      telegramUserId: args.telegramUserId,
      telegramUsername: args.telegramUsername,
      audioFileId: args.audioFileId,
      audioDuration: args.audioDuration,
    });

    return noteId;
  },
});

/**
 * Get notes for a Telegram user
 */
export const getNotesByTelegramUser = query({
  args: {
    telegramUserId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;

    const notes = await ctx.db
      .query("notes")
      .withIndex("byTelegramUser", (q) =>
        q.eq("telegramUserId", args.telegramUserId)
      )
      .order("desc")
      .take(limit);

    return notes;
  },
});

/**
 * Get all recent notes
 */
export const getRecentNotes = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;

    const notes = await ctx.db
      .query("notes")
      .withIndex("byTimestamp")
      .order("desc")
      .take(limit);

    return notes;
  },
});

/**
 * Delete a note
 */
export const deleteNote = mutation({
  args: {
    noteId: v.id("notes"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.noteId);
  },
});
