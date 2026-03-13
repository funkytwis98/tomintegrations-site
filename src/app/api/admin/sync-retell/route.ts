import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/src/lib/supabaseServer";

export async function POST(req: NextRequest) {
  try {
    const { client_id } = await req.json();
    if (!client_id) {
      return NextResponse.json({ error: "client_id required" }, { status: 400 });
    }

    const supabase = getServiceClient();

    // Get client + agent config
    const [clientRes, agentRes, kbRes, playbookRes] = await Promise.all([
      supabase.from("clients").select("*").eq("id", client_id).single(),
      supabase.from("agent_config").select("*").eq("client_id", client_id).single(),
      supabase.from("knowledge_base").select("*").eq("client_id", client_id).eq("is_active", true),
      supabase.from("sales_playbooks").select("*").eq("client_id", client_id).eq("is_active", true),
    ]);

    if (clientRes.error || !clientRes.data) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const client = clientRes.data;
    const agentConfig = agentRes.data;
    const retellAgentId = client.retell_agent_id;

    if (!retellAgentId) {
      return NextResponse.json({ error: "No Retell agent ID configured for this client" }, { status: 400 });
    }

    const retellApiKey = process.env.RETELL_API_KEY;
    if (!retellApiKey) {
      return NextResponse.json({ error: "RETELL_API_KEY not configured" }, { status: 500 });
    }

    // Build the general prompt from KB + playbook
    const kbEntries = kbRes.data ?? [];
    const playbookEntries = playbookRes.data ?? [];

    let generalPrompt = `WHEN YOU DON'T KNOW SOMETHING:
Never guess. Never make up an answer. If a caller asks something you are not 100% sure about, say:
"That's a great question — I'd have to check with Tom to confirm. Can I get your name and number so he can follow up with you?"
Then collect their name and phone number if not already collected.

CRITICAL BEHAVIOR RULES - FOLLOW THESE ABOVE ALL ELSE:
- Respond in 1 sentence maximum. No exceptions.
- Ask ONE question per turn. Never combine questions.
- Do not mention promotions, deals, or extra info unless the caller asks.
- Do not repeat or summarize what the caller said.
- Collect info in this order, one question at a time: (1) what they need, (2) vehicle, (3) name, (4) phone number, (5) appointment.

`;

    if (agentConfig) {
      if (agentConfig.personality) generalPrompt += `Personality: ${agentConfig.personality}\n\n`;
      if (agentConfig.sales_style) generalPrompt += `Sales Style: ${agentConfig.sales_style}\n\n`;
      if (agentConfig.escalation_rules) generalPrompt += `Escalation Rules: ${agentConfig.escalation_rules}\n\n`;
      if (agentConfig.custom_instructions) generalPrompt += `Custom Instructions: ${agentConfig.custom_instructions}\n\n`;
    }

    if (kbEntries.length > 0) {
      generalPrompt += "=== KNOWLEDGE BASE ===\n";
      for (const entry of kbEntries) {
        generalPrompt += `[${entry.category}] ${entry.title}: ${entry.content}\n\n`;
      }
    }

    if (playbookEntries.length > 0) {
      generalPrompt += "=== SALES PLAYBOOK ===\n";
      for (const entry of playbookEntries) {
        generalPrompt += `[${entry.category}] ${entry.title}`;
        if (entry.trigger_phrase) generalPrompt += ` (Trigger: "${entry.trigger_phrase}")`;
        generalPrompt += `\nResponse: ${entry.response_script}\n\n`;
      }
    }

    // Build Retell update payload
    const updatePayload: Record<string, unknown> = {
      webhook_url: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://yourbrand-site-dun.vercel.app"}/api/webhooks/retell`,
      interruption_sensitivity: 0.6,
    };

    if (agentConfig?.agent_name) updatePayload.agent_name = agentConfig.agent_name;
    if (agentConfig?.greeting) updatePayload.begin_message = agentConfig.greeting;
    if (agentConfig?.voice_id) updatePayload.voice_id = agentConfig.voice_id;
    if (agentConfig?.language) updatePayload.language = agentConfig.language;
    if (agentConfig?.voicemail_message) updatePayload.voicemail_message = agentConfig.voicemail_message;
    if (generalPrompt.trim()) updatePayload.general_prompt = generalPrompt.trim();

    // Update agent-level settings (voice, language, etc.)
    const retellRes = await fetch(`https://api.retellai.com/update-agent/${retellAgentId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${retellApiKey}`,
      },
      body: JSON.stringify(updatePayload),
    });

    if (!retellRes.ok) {
      const errText = await retellRes.text();
      return NextResponse.json(
        { error: `Retell agent API error: ${retellRes.status} ${errText}` },
        { status: 502 }
      );
    }

    const retellData = await retellRes.json();

    // Update LLM config (this is where the actual prompt lives)
    const llmId = retellData.response_engine?.llm_id;
    let llmData = null;

    if (llmId && generalPrompt.trim()) {
      const llmPayload: Record<string, unknown> = {
        general_prompt: generalPrompt.trim(),
      };
      if (agentConfig?.greeting) llmPayload.begin_message = agentConfig.greeting;

      const llmRes = await fetch(`https://api.retellai.com/update-retell-llm/${llmId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${retellApiKey}`,
        },
        body: JSON.stringify(llmPayload),
      });

      if (!llmRes.ok) {
        const errText = await llmRes.text();
        return NextResponse.json(
          { error: `Retell LLM API error: ${llmRes.status} ${errText}` },
          { status: 502 }
        );
      }

      llmData = await llmRes.json();
    }

    return NextResponse.json({
      ok: true,
      message: "Agent and LLM synced to Retell",
      retell_agent_id: retellAgentId,
      llm_id: llmId,
      agent_fields_synced: Object.keys(updatePayload),
      llm_updated: !!llmData,
      retell_response: retellData,
    });
  } catch (err: unknown) {
    console.error("sync-retell error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
