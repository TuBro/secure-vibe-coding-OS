import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();
    if (!prompt) return NextResponse.json({ error: "Missing prompt" }, { status: 400 });

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "No AI key configured" }, { status: 500 });

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are a Pacific business strategist for Polypus Feke Group. Write a concise, actionable marketing campaign brief (150 words max) based on these details:\n\n${prompt}\n\nFormat: one short paragraph covering objective, key message, call to action, and success metric. Be direct and practical.`,
            }],
          }],
        }),
      }
    );

    const data = await res.json();
    const brief = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "Could not generate brief.";
    return NextResponse.json({ brief });
  } catch {
    return NextResponse.json({ error: "Failed to generate brief" }, { status: 500 });
  }
}
