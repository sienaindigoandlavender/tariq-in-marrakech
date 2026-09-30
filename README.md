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
2. SQL editor → run `supabase/migrations/0001_init.sql`, then `supabase/seed.sql`.
3. Vercel → Settings → Environment Variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   `SUPABASE_SERVICE_ROLE_KEY` (never prefix this one with `NEXT_PUBLIC_`), then redeploy.
4. Supabase → Authentication → URL configuration: set the Site URL to your domain and add
   `https://YOUR-DOMAIN/auth/callback` to the redirect URLs.
5. Add an operator: Authentication → Users → **Invite user** (their email), then in the SQL editor:
   ```sql
   insert into operators (user_id) select id from auth.users where email = 'partner@example.com';
   ```
   They sign in at `/login` with a magic link.

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
| `/book/[id]` → `/done/[ref]` | 3-step checkout → confirmation, cross-sell, WhatsApp handoff |
| `/trip` | My trip (this device) and saved items |
| `/concierge` | Ask Tariq |
| `/dispatch`, `/dispatch/tomorrow`, `/dispatch/partners` | Operator dashboard (auth) |
| `/r/[code]` | Riad QR entry |
