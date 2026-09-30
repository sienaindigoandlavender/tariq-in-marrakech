import Anthropic from "@anthropic-ai/sdk";
import { CITY, OPERATOR_WHATSAPP, formatWhatsapp } from "@/lib/config";
import { systemPrompt } from "@/lib/concierge";
import { getProducts } from "@/lib/db";
import { ALCOHOL, localMatch } from "@/lib/match";
import { clientIp, rateLimit } from "@/lib/ratelimit";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MODEL = process.env.ANTHROPIC_MODEL || "claude-haiku-4-5";
const MAX_Q = 500;

type Turn = { role: "user" | "assistant"; text: string; picks?: string[] };
/** NDJSON events streamed to the browser. */
type Out =
  | { t: "text"; v: string }
  | { t: "products"; ids: string[] }
  | { t: "open"; id: string }
  | { t: "fallback"; text: string; ids: string[]; wa: string }
  | { t: "error"; text: string }
  | { t: "done" };

const TOOLS: Anthropic.Tool[] = [
  {
    name: "suggest_products",
    description: "Show bookable product cards to the guest under your reply. Pass catalogue ids in the order you recommend them (at most 4).",
    input_schema: { type: "object", properties: { ids: { type: "array", items: { type: "string" } } }, required: ["ids"] },
  },
  {
    name: "open_booking",
    description: "Open the booking form for one product, pre-filled, when the guest asks to book it now.",
    input_schema: { type: "object", properties: { id: { type: "string" } }, required: ["id"] },
  },
];

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

export async function POST(req: Request) {
  if (!rateLimit("ask:" + clientIp(req), 20, 10 * 60_000)) {
    return json({ error: `You've sent a lot of messages. Message the team on WhatsApp: ${formatWhatsapp()}` }, 429);
  }
  const body = await req.json().catch(() => null);
  const raw: Turn[] = Array.isArray(body?.messages) ? body.messages : [];
  const history = raw
    .filter((m) => (m?.role === "user" || m?.role === "assistant") && typeof m.text === "string")
    .slice(-12)
    .map((m) => ({ role: m.role, text: m.text.slice(0, m.role === "user" ? MAX_Q : 2000), picks: Array.isArray(m.picks) ? m.picks.slice(0, 6).map(String) : [] }));
  const last = history[history.length - 1];
  if (!last || last.role !== "user" || !last.text.trim()) return json({ error: "Ask a question." }, 400);
  if (typeof raw[raw.length - 1]?.text === "string" && raw[raw.length - 1].text.length > MAX_Q) {
    return json({ error: `Keep it under ${MAX_Q} characters.` }, 400);
  }
  while (history.length && history[0].role !== "user") history.shift();

  const products = await getProducts();
  const known = new Set(products.map((p) => p.id));
  const question = last.text.trim();
  const suggested: string[] = [];

  const enc = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (o: Out) => controller.enqueue(enc.encode(JSON.stringify(o) + "\n"));
      const fallback = () => {
        const ids = localMatch(question, known);
        suggested.push(...ids);
        send({
          t: "fallback",
          ids,
          wa: OPERATOR_WHATSAPP,
          text: ALCOHOL.test(question)
            ? `We don't arrange drinks, sorry. For anything else, message the team on WhatsApp: ${formatWhatsapp()}`
            : ids.length
            ? "I can't reach the concierge right now, so here's what matches in the catalogue:"
            : `Nothing matches that exactly. Message the team on WhatsApp and a person will sort it: ${formatWhatsapp()}`,
        });
      };

      try {
        if (!process.env.ANTHROPIC_API_KEY) {
          fallback();
        } else {
          const client = new Anthropic();
          const messages: Anthropic.MessageParam[] = history.map((m) => ({
            role: m.role,
            content: m.role === "assistant" ? (m.text || "…") + (m.picks.length ? ` [suggested: ${m.picks.join(", ")}]` : "") : m.text,
          }));
          let wroteText = false;
          try {
            for (let i = 0; i < 3; i++) {
              const s = client.messages.stream({
                model: MODEL,
                max_tokens: 1024,
                system: [{ type: "text", text: systemPrompt(products), cache_control: { type: "ephemeral" } }],
                tools: TOOLS,
                messages,
              });
              for await (const ev of s) {
                if (ev.type === "content_block_delta" && ev.delta.type === "text_delta") {
                  wroteText = true;
                  send({ t: "text", v: ev.delta.text });
                }
              }
              const msg = await s.finalMessage();
              if (msg.stop_reason !== "tool_use") break;

              const results: Anthropic.ToolResultBlockParam[] = [];
              for (const b of msg.content) {
                if (b.type !== "tool_use") continue;
                const input = (b.input ?? {}) as { ids?: unknown; id?: unknown };
                if (b.name === "suggest_products") {
                  const ids = (Array.isArray(input.ids) ? input.ids : []).map(String).filter((id) => known.has(id)).slice(0, 4);
                  suggested.push(...ids);
                  if (ids.length) send({ t: "products", ids });
                  results.push({ type: "tool_result", tool_use_id: b.id, content: JSON.stringify({ shown: ids }) });
                } else if (b.name === "open_booking" && typeof input.id === "string" && known.has(input.id)) {
                  send({ t: "open", id: input.id });
                  results.push({ type: "tool_result", tool_use_id: b.id, content: JSON.stringify({ opened: input.id }) });
                } else {
                  results.push({ type: "tool_result", tool_use_id: b.id, content: "Unknown product id.", is_error: true });
                }
              }
              messages.push({ role: "assistant", content: msg.content }, { role: "user", content: results });
            }
          } catch (err) {
            console.error("[concierge] Anthropic API error", err instanceof Anthropic.APIError ? `${err.status} ${err.message}` : err);
            if (wroteText) send({ t: "error", text: "Something went wrong on my side. Try again in a moment." });
            else fallback();
          }
        }
      } finally {
        send({ t: "done" });
        controller.close();
        // Demand research: every question and what we suggested.
        const admin = supabaseAdmin();
        if (admin) {
          const { error } = await admin.from("concierge_log").insert({ city: CITY, question, suggested: [...new Set(suggested)] });
          if (error) console.error("[concierge] log failed", error.message);
        }
      }
    },
  });

  return new Response(stream, { headers: { "content-type": "application/x-ndjson; charset=utf-8", "cache-control": "no-store" } });
}
