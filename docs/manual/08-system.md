# 08 — System & Admin

**Section:** System  
**Tool:** Platform Health & Token Usage  
**Location:** Dashboard → scroll to System (bottom of page)

---

> **Remember:** You are doing this manually first so you understand it fully. Once you can run this step without thinking, that is when we automate it.

---

## Purpose

The System section is the health panel for the platform. It shows how the AI is being used, how much capacity remains, and whether the key services are running correctly.

You do not interact with this section the way you do with the others. You read it, monitor it, and act on what it tells you.

If something in the system is wrong, this is where you will see it first.

---

## What You See in the System Panel

| Item | What It Means |
|------|--------------|
| **Token Usage** | How many AI tokens have been used in the current period |
| **Token Limit** | The maximum tokens available before the period resets |
| **Usage Bar** | A visual indicator of how close you are to the limit |
| **Service Status** | Whether the AI bridge, Telegram bot, and database are online |
| **Last Activity** | Timestamp of the most recent system event |

---

## Token Usage — What You Need To Know

Every time the AI does something — transcribing a voice note, generating a marketing brief, replying through Te Ra — it uses tokens. Tokens are the unit of measure for AI processing.

- **Green bar** — usage is healthy, no action needed
- **Yellow bar** — usage is elevated, monitor it
- **Red bar** — usage is high, review what is consuming tokens and report to your operator

You do not need to manage tokens day to day. You need to notice when the bar is red and flag it.

---

## Service Status Indicators

| Status | Meaning |
|--------|---------|
| **Online** | Service is running normally |
| **Degraded** | Service is running but slower than expected — monitor it |
| **Offline** | Service is not running — action required |

If any service shows **Offline**, stop and contact your operator immediately. Do not try to fix it yourself.

---

## What To Check and When

**Daily:**
- Glance at the token usage bar — is it green?
- Confirm the Telegram bot status shows Online

**Weekly (Monday morning):**
- Review total token usage for the past week
- Note if usage is trending higher than the previous week
- Report anything unusual to your operator

**If something feels wrong:**
- Check the System panel before raising a ticket
- If a service shows Offline, raise a Support Ticket marked **Critical**

---

## What Good Looks Like

- The system panel is checked every morning as part of the daily startup routine
- Token usage stays below 75% through the week with normal operations
- Any Offline service is reported within the hour — not at end of day
- The operator is informed of usage trends before limits are reached, not after

---

## What To Automate Later

Once the team is monitoring the system consistently, these steps are candidates for automation:

- Alert sent to the operator when token usage crosses 75%
- Daily system health summary delivered via Telegram each morning
- Automatic ticket raised when any service goes Offline

You will know it is time to automate when you find yourself checking the same panel at the same time every day and nothing ever changes — that is the moment a machine should be watching it instead.

---

## You Have Reached the End of the Manual

You now have a complete picture of every section in the system. Start with the Task Board. Work through each section in order. Do it manually until it feels natural.

Then we automate.
