import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/src/lib/supabaseServer";

const DEFLECTION_PATTERNS = [
  "i don't have that information",
  "someone will call you back",
  "i'm not sure about",
  "i don't know",
  "i can't provide",
  "i don't have pricing",
  "let me have someone get back to you",
  "i'll have someone call you",
  "i'm not able to",
  "i don't have details",
  "let me have tom get back to you",
];

interface TranscriptTurn {
  role: string;
  content: string;
}

function extractUnansweredQuestions(
  transcript: string | TranscriptTurn[]
): { question: string; context: string }[] {
  const results: { question: string; context: string }[] = [];

  // Parse transcript into turns
  let turns: { role: string; content: string }[] = [];

  if (Array.isArray(transcript)) {
    turns = transcript.map((t) => ({
      role: t.role?.toLowerCase() ?? "",
      content: t.content ?? "",
    }));
  } else if (typeof transcript === "string") {
    // Parse "Agent: ... \n User: ..." format
    const lines = transcript.split("\n");
    for (const line of lines) {
      const agentMatch = line.match(/^(agent|sarah|assistant):\s*(.+)/i);
      const userMatch = line.match(/^(user|caller|customer|human):\s*(.+)/i);
      if (agentMatch) {
        turns.push({ role: "agent", content: agentMatch[2].trim() });
      } else if (userMatch) {
        turns.push({ role: "user", content: userMatch[2].trim() });
      }
    }
  }

  for (let i = 1; i < turns.length; i++) {
    const turn = turns[i];
    if (turn.role !== "agent") continue;

    const lower = turn.content.toLowerCase();
    const isDeflection = DEFLECTION_PATTERNS.some((p) => lower.includes(p));
    if (!isDeflection) continue;

    // Find the user turn just before this deflection
    for (let j = i - 1; j >= 0; j--) {
      if (turns[j].role === "user" && turns[j].content.trim().length > 5) {
        results.push({
          question: turns[j].content.trim(),
          context: turn.content.trim(),
        });
        break;
      }
    }
  }

  return results;
}

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const event = payload.event;

    console.log("[retell-webhook] received event:", event, "keys:", Object.keys(payload));

    // Only process call_analyzed events
    if (event !== "call_analyzed" && event !== "call_ended") {
      console.log("[retell-webhook] skipping event:", event);
      return NextResponse.json({ ok: true });
    }

    const callData = payload.call ?? payload.data ?? payload;
    const retellCallId = callData.call_id ?? callData.retell_call_id;
    const transcript = callData.transcript ?? callData.transcript_object;

    console.log("[retell-webhook] call_id:", retellCallId, "has_transcript:", !!transcript);

    if (!transcript || !retellCallId) {
      console.log("[retell-webhook] missing transcript or call_id, skipping");
      return NextResponse.json({ ok: true });
    }

    const supabase = getServiceClient();

    // Find the call in our DB to get client_id
    const { data: call } = await supabase
      .from("calls")
      .select("id, client_id")
      .eq("retell_call_id", retellCallId)
      .single();

    if (!call) {
      console.log("[retell-webhook] call not found in DB for retell_call_id:", retellCallId);
      return NextResponse.json({ ok: true });
    }

    console.log("[retell-webhook] matched DB call:", call.id, "client:", call.client_id);

    const unanswered = extractUnansweredQuestions(transcript);
    if (unanswered.length === 0) {
      return NextResponse.json({ ok: true, unanswered: 0 });
    }

    // Insert unanswered questions
    const rows = unanswered.map((q) => ({
      client_id: call.client_id,
      call_id: call.id,
      question: q.question,
      context: q.context,
      status: "pending",
    }));

    await supabase.from("unanswered_questions").insert(rows);

    return NextResponse.json({
      ok: true,
      unanswered: unanswered.length,
      client_id: call.client_id,
    });
  } catch (err: unknown) {
    console.error("retell webhook error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Webhook error" },
      { status: 500 }
    );
  }
}
