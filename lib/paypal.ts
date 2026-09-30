import "server-only";

// PayPal Orders v2 over REST (no SDK). Redirect flow: create order -> guest approves on
// PayPal -> we capture on return. Server only: uses the client secret.

const BASES = { sandbox: "https://api-m.sandbox.paypal.com", live: "https://api-m.paypal.com" };

function config() {
  const id = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;
  if (!id || !secret) return null;
  const env = process.env.PAYPAL_ENV === "live" ? "live" : "sandbox";
  return { id, secret, env, base: (process.env.PAYPAL_API_BASE || BASES[env]).replace(/\/$/, "") };
}

export const paypalEnabled = () => config() !== null;

let cached: { token: string; exp: number } | null = null;

async function token(): Promise<string> {
  const c = config();
  if (!c) throw new Error("PayPal is not configured");
  if (cached && cached.exp > Date.now() + 60_000) return cached.token;
  const res = await fetch(`${c.base}/v1/oauth2/token`, {
    method: "POST",
    headers: { authorization: "Basic " + Buffer.from(`${c.id}:${c.secret}`).toString("base64"), "content-type": "application/x-www-form-urlencoded" },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`PayPal auth failed: ${res.status}`);
  const data = await res.json();
  cached = { token: data.access_token, exp: Date.now() + Number(data.expires_in ?? 300) * 1000 };
  return cached.token;
}

async function call<T>(path: string, body: unknown, requestId?: string): Promise<{ ok: boolean; status: number; data: T }> {
  const c = config()!;
  const res = await fetch(`${c.base}${path}`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${await token()}`,
      "content-type": "application/json",
      prefer: "return=representation",
      ...(requestId ? { "paypal-request-id": requestId } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  });
  const data = (await res.json().catch(() => ({}))) as T;
  return { ok: res.ok, status: res.status, data };
}

const money = (eur: number) => ({ currency_code: "EUR", value: eur.toFixed(2) });

type Link = { rel: string; href: string };

/** Create an order for a booking. Returns the PayPal order id and the approval URL. */
export async function createOrder(o: { ref: string; description: string; totalEur: number; returnUrl: string; cancelUrl: string }) {
  const r = await call<{ id: string; status: string; links?: Link[] }>(
    "/v2/checkout/orders",
    {
      intent: "CAPTURE",
      purchase_units: [{ reference_id: o.ref, custom_id: o.ref, invoice_id: o.ref, description: o.description.slice(0, 127), amount: money(o.totalEur) }],
      payment_source: {
        paypal: {
          experience_context: {
            brand_name: "Tariq",
            user_action: "PAY_NOW",
            shipping_preference: "NO_SHIPPING",
            return_url: o.returnUrl,
            cancel_url: o.cancelUrl,
          },
        },
      },
    },
    `create-${o.ref}`,
  );
  const approve = r.data.links?.find((l) => l.rel === "payer-action" || l.rel === "approve")?.href;
  if (!r.ok || !r.data.id || !approve) throw new Error(`PayPal create order failed: ${r.status}`);
  return { orderId: r.data.id, approveUrl: approve };
}

type Capture = { id: string; status: string; amount: { currency_code: string; value: string }; custom_id?: string };
type OrderResp = { id: string; status: string; purchase_units?: { reference_id?: string; payments?: { captures?: Capture[] } }[] };

/** Capture an approved order. Idempotent per order id. */
export async function captureOrder(orderId: string) {
  const r = await call<OrderResp & { details?: { issue: string }[] }>(`/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`, {}, `capture-${orderId}`);
  const cap = r.data.purchase_units?.[0]?.payments?.captures?.[0];
  // Already captured (e.g. webhook got there first) comes back as 422 ORDER_ALREADY_CAPTURED.
  const already = r.status === 422 && r.data.details?.some((d) => d.issue === "ORDER_ALREADY_CAPTURED");
  return {
    completed: r.ok && r.data.status === "COMPLETED" && cap?.status === "COMPLETED",
    already,
    captureId: cap?.id ?? null,
    amountEur: cap && cap.amount.currency_code === "EUR" ? Number(cap.amount.value) : null,
    status: r.status,
  };
}

/** Full refund of a capture. */
export async function refundCapture(captureId: string, ref: string) {
  const r = await call<{ id?: string; status?: string }>(`/v2/payments/captures/${encodeURIComponent(captureId)}/refund`, {}, `refund-${ref}`);
  return { ok: r.ok && (r.data.status === "COMPLETED" || r.data.status === "PENDING"), status: r.data.status ?? String(r.status) };
}

/** Verify a webhook with PayPal (needs PAYPAL_WEBHOOK_ID). */
export async function verifyWebhook(headers: Headers, event: unknown): Promise<boolean> {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) return false;
  const h = (k: string) => headers.get(k) ?? "";
  const r = await call<{ verification_status?: string }>("/v1/notifications/verify-webhook-signature", {
    auth_algo: h("paypal-auth-algo"),
    cert_url: h("paypal-cert-url"),
    transmission_id: h("paypal-transmission-id"),
    transmission_sig: h("paypal-transmission-sig"),
    transmission_time: h("paypal-transmission-time"),
    webhook_id: webhookId,
    webhook_event: event,
  });
  return r.ok && r.data.verification_status === "SUCCESS";
}
