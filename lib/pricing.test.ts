// Run: npm test  (node's built-in runner with type stripping)
import { test } from "node:test";
import assert from "node:assert/strict";
import { price, cars } from "./pricing.ts";

const carProduct = { price_eur: 25, per: "car" as const, cap: 4, private_per_car: null, addons: [] };

test("5 guests on a car product with cap 4 charges 2 cars", () => {
  assert.equal(cars(carProduct, 5), 2);
  assert.equal(price(carProduct, { guests: 5, mode: "shared", addonIds: [] }).total, 50);
});

test("private upgrade and add-ons are separate lines; extra equals their sum", () => {
  const p = {
    price_eur: 22, per: "pp" as const, cap: null, private_per_car: 70,
    addons: [
      { id: "lunch", label: "Lunch", eur: 10, per: "pp" as const },
      { id: "kit", label: "Kit", eur: 9, per: "pp" as const },
      { id: "photo", label: "Photos", eur: 25, per: "unit" as const },
    ],
  };
  const r = price(p, { guests: 3, mode: "private", addonIds: ["lunch", "photo", "bogus"] });
  assert.equal(r.base, 66);
  assert.deepEqual(r.lines.map((l) => l.kind), ["base", "private", "addon", "addon"]);
  const extras = r.lines.filter((l) => l.kind !== "base").reduce((s, l) => s + l.eur, 0);
  assert.equal(r.extra, extras);
  assert.equal(r.extra, 70 + 30 + 25);
  assert.equal(r.total, 66 + 125);
});

test("private is ignored when the product has no private upgrade", () => {
  const r = price({ ...carProduct, private_per_car: null }, { guests: 2, mode: "private", addonIds: [] });
  assert.equal(r.lines.length, 1);
});

test("flat products charge once; car add-ons scale with cars", () => {
  const p = { price_eur: 39, per: "flat" as const, cap: null, private_per_car: null, addons: [{ id: "x", label: "X", eur: 5, per: "car" as const }] };
  const r = price(p, { guests: 6, mode: "shared", addonIds: ["x"] });
  assert.equal(r.base, 39);
  assert.equal(r.extra, 10);
});

test("private priced per person replaces the group price", () => {
  const p = { price_eur: 189, per: "pp" as const, cap: null, private_per_car: null, private_pp: 450, addons: [] };
  assert.equal(price(p, { guests: 2, mode: "shared", addonIds: [] }).total, 378);
  const r = price(p, { guests: 2, mode: "private", addonIds: [] });
  assert.equal(r.total, 900);
  assert.equal(r.lines.length, 1);
});
