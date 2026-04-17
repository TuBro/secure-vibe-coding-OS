# 02 — Voice Notes & Te Ra

**Section:** Voice Activity  
**Tool:** Voice Activity Feed + Telegram Bot  
**Location:** Dashboard → Voice Activity Feed (near top)

---

> **Remember:** You are doing this manually first so you understand it fully. Once you can run this step without thinking, that is when we automate it.

> **Note:** Te Ra is the demo assistant used during setup and training. When this system is deployed for a client, Te Ra is replaced with a custom assistant built for that client's brand and operations.

---

## Purpose

The Voice Activity Feed captures every voice note sent through Telegram and displays it on the dashboard as a live, transcribed entry.

You speak — Te Ra listens, transcribes, and replies. The whole team sees it in real time on the dashboard without anyone having to type a thing.

This is how the team stays connected on the move.

---

## How Te Ra Works

1. Open Telegram on your phone
2. Find the **Te Ra** bot
3. Hold the microphone button and send a **voice note**
4. Te Ra transcribes your message using AI
5. The transcription appears instantly in the **Voice Activity Feed** on the dashboard
6. Te Ra sends a **voice reply** back to you in Telegram

That is the full loop. Speak → transcribed → visible to team → replied to.

---

## What You Can Send Te Ra

| Input | What Happens |
|-------|-------------|
| **Voice note** | Transcribed and saved to the Voice Activity Feed |
| **Text message** | Received and replied to — does not appear in the Voice Feed |
| **Question** | Te Ra answers using AI and replies by voice |
| **Update** | Saved to the feed — the team sees it on the dashboard |

---

## What Te Ra Is Not

- Te Ra is **not a search engine** — she does not browse the internet
- Te Ra is **not a filing system** — notes are visible on the feed but not stored as documents
- Te Ra is **not always on** — she requires the backend bridge to be running (check with your operator if she stops responding)

---

## Reading the Voice Activity Feed

The feed displays entries in reverse chronological order — newest first.

Each entry shows:
- **Sender name** — who sent the voice note
- **Timestamp** — when it was received
- **Transcription** — the full text of what was said
- **Duration** — how long the original voice note was

You cannot edit or reply to feed entries from the dashboard. All interaction with Te Ra happens through Telegram.

---

## Best Practices for Voice Notes

- **Speak clearly and at a normal pace** — Te Ra transcribes best when you are not rushing
- **One topic per note** — short, focused notes are easier to act on than long rambling ones
- **State who you are first if there are multiple users** — "This is [name], update on the Tu80 client meeting..."
- **Do not send sensitive information by voice** — transcriptions are visible to the whole team on the dashboard

---

## What Good Looks Like

- Team members use voice notes throughout the day to log updates, questions, and decisions on the go
- The Voice Activity Feed has fresh entries every day — it is not silent
- Notes are short and specific — the team can read and understand them without context
- No one is typing long updates when a 10-second voice note would do the job

---

## What To Automate Later

Once the team is using Te Ra consistently, these steps are candidates for automation:

- Voice updates that mention a lead name automatically link to that lead in the Sales Pipeline
- Voice notes flagged as action items automatically create a Support Ticket
- Daily summary of all voice notes sent to the team each evening

You will know it is time to automate when the feed is active enough that key information is getting buried and hard to act on.

---

## Next Section

[03 — Marketing Engine](03-marketing-engine.md)
