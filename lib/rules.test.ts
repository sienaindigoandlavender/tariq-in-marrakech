import { test } from "node:test";
import assert from "node:assert/strict";
import { addDays, bookable, earliest, today } from "./dates.ts";
import { rules } from "./rules.ts";

test("lead days set the first bookable date", () => {
  assert.equal(earliest({}), addDays(today(), 1));
  assert.equal(earliest({ lead_days: 3 }), addDays(today(), 3));
  assert.equal(bookable({ lead_days: 3 }, addDays(today(), 1)), addDays(today(), 3));
  assert.equal(bookable({ lead_days: 3 }, addDays(today(), 10)), addDays(today(), 10));
});

test("non-refundable prepaid wording", () => {
  const r = rules({ lead_days: 3, prepay_only: true, refundable: false });
  assert.equal(r.cancelFact, "Non-refundable");
  assert.equal(r.payFact, "Paid online when booked");
  assert.equal(r.leadNote, "Book at least 3 days ahead");
  assert.equal(rules({}).cancelFact, "Free cancellation 24 h");
});
