import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { paymentAttemptSchemaValidator } from "./paymentAttemptTypes";

export default defineSchema({
    users: defineTable({
      name: v.string(),
      // this the Clerk ID, stored in the subject JWT field
      externalId: v.string(),
      // Primary email from Clerk
      email: v.optional(v.string()),
    })
      .index("byExternalId", ["externalId"])
      .index("byEmail", ["email"]),

    paymentAttempts: defineTable(paymentAttemptSchemaValidator)
      .index("byPaymentId", ["payment_id"])
      .index("byUserId", ["userId"])
      .index("byPayerUserId", ["payer.user_id"]),

    // Voice notes from Telegram
    notes: defineTable({
      text: v.string(),
      timestamp: v.number(),
      userId: v.optional(v.id("users")),
      telegramUserId: v.string(),
      telegramUsername: v.optional(v.string()),
      audioFileId: v.string(),
      audioDuration: v.optional(v.number()),
      status: v.optional(v.union(
        v.literal("todo"),
        v.literal("in_progress"),
        v.literal("done")
      )),
    })
      .index("byTelegramUser", ["telegramUserId", "timestamp"])
      .index("byUser", ["userId", "timestamp"])
      .index("byTimestamp", ["timestamp"])
      .index("byStatus", ["status", "timestamp"]),

    // Marketing campaigns
    campaigns: defineTable({
      name: v.string(),
      channel: v.union(
        v.literal("email"),
        v.literal("social"),
        v.literal("ad"),
        v.literal("content"),
        v.literal("other")
      ),
      status: v.union(
        v.literal("draft"),
        v.literal("active"),
        v.literal("paused"),
        v.literal("complete")
      ),
      goal: v.optional(v.string()),
      targetAudience: v.optional(v.string()),
      budget: v.optional(v.number()),
      startDate: v.optional(v.number()),
      endDate: v.optional(v.number()),
      brief: v.optional(v.string()),
      createdAt: v.number(),
    })
      .index("byStatus", ["status", "createdAt"])
      .index("byCreatedAt", ["createdAt"]),

    // Support tickets
    tickets: defineTable({
      title: v.string(),
      body: v.string(),
      status: v.union(
        v.literal("open"),
        v.literal("in_progress"),
        v.literal("resolved"),
        v.literal("closed")
      ),
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
      resolvedAt: v.optional(v.number()),
      createdAt: v.number(),
    })
      .index("byStatus", ["status", "createdAt"])
      .index("byPriority", ["priority", "createdAt"])
      .index("byLead", ["leadId", "createdAt"]),

    // Social media content queue
    content: defineTable({
      body: v.string(),
      platform: v.union(
        v.literal("instagram"),
        v.literal("linkedin"),
        v.literal("facebook"),
        v.literal("twitter"),
        v.literal("telegram"),
        v.literal("other")
      ),
      status: v.union(
        v.literal("idea"),
        v.literal("scheduled"),
        v.literal("posted")
      ),
      scheduledAt: v.optional(v.number()),
      postedAt: v.optional(v.number()),
      campaignId: v.optional(v.id("campaigns")),
      createdAt: v.number(),
    })
      .index("byStatus", ["status", "createdAt"])
      .index("byPlatform", ["platform", "status"]),

    // Bookings / calendar
    bookings: defineTable({
      title: v.string(),
      type: v.union(
        v.literal("meeting"),
        v.literal("call"),
        v.literal("event"),
        v.literal("other")
      ),
      status: v.union(
        v.literal("confirmed"),
        v.literal("pending"),
        v.literal("cancelled")
      ),
      date: v.number(),
      contact: v.optional(v.string()),
      leadId: v.optional(v.id("leads")),
      notes: v.optional(v.string()),
      createdAt: v.number(),
    })
      .index("byDate", ["date"])
      .index("byStatus", ["status", "date"]),

    // Unified communications — all outreach across channels
    messages: defineTable({
      channel: v.union(
        v.literal("telegram"),
        v.literal("whatsapp"),
        v.literal("email"),
        v.literal("call"),
        v.literal("other")
      ),
      direction: v.union(
        v.literal("inbound"),
        v.literal("outbound")
      ),
      body: v.string(),
      from: v.optional(v.string()),
      to: v.optional(v.string()),
      leadId: v.optional(v.id("leads")),
      isRead: v.boolean(),
      timestamp: v.number(),
      createdAt: v.number(),
    })
      .index("byTimestamp", ["timestamp"])
      .index("byLead", ["leadId", "timestamp"])
      .index("byChannel", ["channel", "timestamp"])
      .index("byUnread", ["isRead", "timestamp"]),

    // Sales leads pipeline
    leads: defineTable({
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
      status: v.union(
        v.literal("new"),
        v.literal("contacted"),
        v.literal("qualified"),
        v.literal("closed")
      ),
      notes: v.optional(v.string()),
      assignedTo: v.optional(v.string()),
      lastContactedAt: v.optional(v.number()),
      createdAt: v.number(),
    })
      .index("byStatus", ["status", "createdAt"])
      .index("byCreatedAt", ["createdAt"]),

    // Manual task board — To Do / In Progress / Done
    tasks: defineTable({
      title: v.string(),
      notes: v.optional(v.string()),
      status: v.union(
        v.literal("todo"),
        v.literal("in_progress"),
        v.literal("done")
      ),
      createdBy: v.optional(v.string()),
      createdAt: v.number(),
    })
      .index("byStatus", ["status", "createdAt"])
      .index("byCreatedAt", ["createdAt"]),

    // Security monitoring table
    // userId is optional to allow logging violations from unauthenticated requests
    securityEvents: defineTable({
      userId: v.optional(v.id("users")),
      eventType: v.union(
        v.literal("origin_mismatch"),
        v.literal("rate_limit_exceeded"),
        v.literal("invalid_api_key"),
        v.literal("fingerprint_change"),
        v.literal("suspicious_activity"),
        v.literal("jwt_validation_failed"),
        v.literal("unauthorized_access"),
        v.literal("input_validation_failed"),
        v.literal("replay_detected"),
        v.literal("not_found_enumeration"),
        v.literal("jwt_algorithm_attack"),
        v.literal("tenant_isolation_attack"),
        v.literal("jwt_replay_attack"),
        v.literal("xss_attempt"),
        v.literal("fingerprint_manipulation"),
        v.literal("http_origin_blocked"),
        v.literal("prompt_injection_attempt"),
        v.literal("ai_response_validation_failed"),
        v.literal("csrf_validation_failed")
      ),
      severity: v.union(
        v.literal("low"),
        v.literal("medium"),
        v.literal("high"),
        v.literal("critical")
      ),
      metadata: v.object({
        origin: v.optional(v.string()),
        ipAddress: v.optional(v.string()),
        fingerprint: v.optional(v.string()),
        endpoint: v.optional(v.string()),
        errorMessage: v.optional(v.string()),
        endUserEmail: v.optional(v.string()),
        endUserName: v.optional(v.string()),
        endUserId: v.optional(v.string()),
        actionType: v.optional(v.string()),
        requestPayload: v.optional(v.string()),
      }),
      timestamp: v.number(),
      isRead: v.boolean(),
    })
      .index("byUser", ["userId", "timestamp"])
      .index("bySeverity", ["userId", "severity", "timestamp"])
      .index("byUnread", ["userId", "isRead", "timestamp"]),
  });