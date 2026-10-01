// Generates supabase/seed.sql from data/catalogue.json. Run: npm run seed:gen
import fs from "node:fs";
const products = JSON.parse(fs.readFileSync("data/catalogue.json", "utf8"));
const q = (v) => v === null || v === undefined ? "null" : typeof v === "number" || typeof v === "boolean" ? String(v) : `'${String(v).replace(/'/g, "''")}'`;
const arr = (a) => `array[${a.map(q).join(", ")}]::text[]`;
let out = `-- Tariq seed: Marrakech catalogue (${products.length} products and their add-ons).
-- ALL PRICES ARE PLACEHOLDERS until the partner's cost sheet arrives.
-- Requires migrations 0001_init.sql, 0003_itinerary.sql, 0006_accounts_rules.sql and 0007_tickets.sql.
-- Generated from data/catalogue.json by scripts/gen-seed.mjs. Do not edit by hand.

begin;
delete from product_addons where product_id in (select id from products where city = 'marrakech');
`;
for (const p of products) {
  out += `
insert into products (id, city, category, role, title, subtitle, blurb, timing, duration, km, drive_time, price_eur, was_eur, per, cap, private_per_car, badge, scene, image_url, highlights, includes, excludes, know_before, itinerary, sort, active, lead_days, prepay_only, refundable)
values (${[p.id, p.city, p.category, p.role, p.title, p.subtitle, p.blurb, p.timing, p.duration, p.km, p.drive_time, p.price_eur, p.was_eur, p.per, p.cap, p.private_per_car, p.badge, p.scene, p.image_url].map(q).join(", ")}, ${arr(p.highlights)}, ${arr(p.includes)}, ${arr(p.excludes)}, ${arr(p.know_before)}, ${q(JSON.stringify(p.itinerary ?? []))}::jsonb, ${p.sort}, ${p.active}, ${p.lead_days ?? 1}, ${p.prepay_only ?? false}, ${p.refundable ?? true})
on conflict (id) do update set city = excluded.city, category = excluded.category, role = excluded.role, title = excluded.title, subtitle = excluded.subtitle, blurb = excluded.blurb, timing = excluded.timing, duration = excluded.duration, km = excluded.km, drive_time = excluded.drive_time, price_eur = excluded.price_eur, was_eur = excluded.was_eur, per = excluded.per, cap = excluded.cap, private_per_car = excluded.private_per_car, badge = excluded.badge, scene = excluded.scene, highlights = excluded.highlights, includes = excluded.includes, excludes = excluded.excludes, know_before = excluded.know_before, itinerary = excluded.itinerary, sort = excluded.sort, active = excluded.active, lead_days = excluded.lead_days, prepay_only = excluded.prepay_only, refundable = excluded.refundable;
`;
  for (const a of p.addons) {
    out += `insert into product_addons (id, product_id, label, eur, per, popular, sort) values (${[a.id, p.id, a.label, a.eur, a.per, a.popular, a.sort].map(q).join(", ")});\n`;
  }
}
out += `\ncommit;\n`;
fs.writeFileSync("supabase/seed.sql", out);
console.log("wrote supabase/seed.sql");
