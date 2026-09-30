# Tariq · Marrakech

Tours, transfers and trip services, booked in a minute and paid on the day.
Next.js 14 (App Router) · Tailwind · Supabase · Anthropic API · Vercel.

One codebase, one deployment per city: each city gets its own domain, Supabase project and `CITY` value.

## Run locally

```bash
npm install
cp .env.example .env.local   # fill in what you have
npm run dev                  # http://localhost:3000
npm test                     # pricing rules
```

Without Supabase variables the site still works: the catalogue comes from `data/catalogue.json`,
bookings are confirmed and handed to WhatsApp but **not stored**, and `/dispatch` explains what is missing.
Without `ANTHROPIC_API_KEY`, Ask Tariq falls back to keyword matching and the WhatsApp number.

## Go live with Supabase

1. Create a new Supabase project for this city (don't reuse another product's database).
2. SQL editor → run, in order: `supabase/migrations/0001_init.sql`, `0002_payments.sql`, `0003_itinerary.sql`,
   `0004_retention.sql`, then `supabase/seed.sql`. Each migration runs once; the seed can be re-run (it upserts).
3. Vercel → Settings → Environment Variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   `SUPABASE_SERVICE_ROLE_KEY` (never prefix this one with `NEXT_PUBLIC_`), then redeploy.
4. Supabase → Authentication → URL configuration: set the Site URL to your domain and add
   `https://YOUR-DOMAIN/auth/callback` to the redirect URLs.
5. Add an operator: Authentication → Users → **Invite user** (their email), then in the SQL editor:
   ```sql
   insert into operators (user_id) select id from auth.users where email = 'partner@example.com';
   ```
   They sign in at `/login` with a magic link.

## Booking and payment

Product page → **Check availability** opens a sheet (bottom sheet on phones): date, participants, option
(shared / private, with pickup time and live total), extras. **Continue** goes to a one-page checkout: contact
details and payment choice.

- **Reserve now, pay on the day**: booking is confirmed immediately; cash or card to the driver.
- **Pay now (PayPal)**: shown only when `PAYPAL_CLIENT_ID`/`PAYPAL_CLIENT_SECRET` and Supabase are set. The booking
  is stored as `pending_payment`, the guest approves on PayPal, and the capture happens on return
  (`/api/paypal/return`). Cancelled or declined payments void the booking and bring the guest back to checkout
  with everything filled in. Prices are always computed on the server.
- **Refunds**: in `/dispatch`, **Cancel & refund** on a prepaid booking refunds it in full on PayPal first.
- **Webhook (optional backstop)**: in the PayPal app, add `https://YOUR-DOMAIN/api/paypal/webhook` for
  `CHECKOUT.ORDER.APPROVED`, `PAYMENT.CAPTURE.COMPLETED` and `PAYMENT.CAPTURE.REFUNDED`, and set `PAYPAL_WEBHOOK_ID`.
  It records payments from guests who close the tab before returning, and refunds made in the PayPal dashboard.

Test with sandbox credentials (`PAYPAL_ENV=sandbox`) and a PayPal sandbox buyer account before switching to live.

## Catalogue and prices

`data/catalogue.json` is the source of truth for the seed. **All prices are placeholders** until the partner's
cost sheet arrives. Edit the JSON, run `npm run seed:gen`, then re-run `supabase/seed.sql` (it upserts; existing
`image_url` values are kept). Set `products.image_url` to replace a painted poster with a real photo.

Internal `role` (lead / core / cow / gap) drives the Recommended order and reporting; it is never sent to the browser.

## Riad QR partners

`/dispatch/partners` → add a riad (code, name, commission %) → **QR card** → print. Guests who scan land on
`/r/CODE`; their bookings for the next 30 days carry the partner code and `source = riad_qr`. The Partners tab shows
commission owed per month on paid bookings.

## Ask Tariq

`/api/concierge` streams from the Anthropic Messages API (`ANTHROPIC_MODEL`, default Haiku 4.5) with two
client-rendered tools, `suggest_products` and `open_booking`. Every question is logged to `concierge_log`:
repeated questions are the list of products to build next.

## Routes

| Route | What |
|---|---|
| `/`, `/c/[category]` | Explore and category listings |
| `/p/[id]` | Product page (static, revalidates every 5 min) |
| `/book/[id]` → `/done/[ref]` | One-page checkout (pay now or on the day) → confirmation, cross-sell, WhatsApp handoff |
| `/trip` | My trip (this device) and saved items |
| `/concierge` | Ask Tariq |
| `/dispatch`, `/dispatch/tomorrow`, `/dispatch/partners` | Operator dashboard (auth) |
| `/r/[code]` | Riad QR entry |

## Legal pages

`/booking-conditions`, `/privacy`, `/terms` and `/contact`. Company details come from the `NEXT_PUBLIC_LEGAL_*`,
`NEXT_PUBLIC_TRANSPORT_LICENCE`, `NEXT_PUBLIC_CONTACT_EMAIL`, `NEXT_PUBLIC_CNDP_REF` and `NEXT_PUBLIC_VAT_INCLUDED` env vars
(see `.env.example`); unset lines are hidden, never shown as placeholders. The payment and refund sections switch on
the PayPal wording automatically when PayPal is configured. The texts are drafts written for this business model:
have them reviewed by a Moroccan lawyer before launch, and file the CNDP declaration for the booking data.

The privacy policy promises retention limits. Run `supabase/migrations/0004_retention.sql`, enable `pg_cron`, and schedule
the purge as described at the bottom of that file.
