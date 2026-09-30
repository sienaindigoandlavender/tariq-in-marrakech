// One-off: pull TRIPS + DETAIL out of the prototype into data/catalogue.json.
import fs from "node:fs";
const html = fs.readFileSync(process.argv[2], "utf8");
const grab = (re) => { const m = html.match(re); if (!m) throw new Error("not found " + re); return m[1]; };
const TRIPS = eval(grab(/const TRIPS=(\[[\s\S]*?\n\]);/));
const DETAIL = eval("(" + grab(/const DETAIL=(\{[\s\S]*?\n\});/) + ")");
const products = TRIPS.map((p, i) => {
  const d = DETAIL[p.id];
  if (!d) throw new Error("no detail " + p.id);
  return {
    id: p.id, city: "marrakech", category: p.cat, role: p.role,
    title: p.en.t, subtitle: p.en.sub, blurb: p.en.b, timing: p.en.p, duration: d.dur,
    km: p.km ?? 0, drive_time: p.time ?? "", price_eur: p.price, was_eur: p.was ?? null,
    per: p.per, cap: p.per === "car" ? (p.cap ?? 4) : null, private_per_car: p.privatePerCar ?? null,
    badge: p.tag?.en ?? null, scene: p.scene, image_url: null,
    highlights: d.hl, includes: d.inc, excludes: d.exc, know_before: d.know,
    sort: (i + 1) * 10, active: true,
    addons: (p.add || []).map((a, j) => ({ id: a.id, label: a.en, eur: a.eur, per: a.per, popular: !!a.pop, sort: (j + 1) * 10 })),
  };
});
fs.writeFileSync("data/catalogue.json", JSON.stringify(products, null, 2) + "\n");
console.log(products.length, "products,", products.reduce((s, p) => s + p.addons.length, 0), "add-ons");
