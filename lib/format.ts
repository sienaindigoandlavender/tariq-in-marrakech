import { copy } from "./copy";

export const perLabel = (per: string) =>
  per === "car" ? copy.price.car : per === "flat" ? copy.price.flat : per === "unit" ? copy.price.unit : copy.price.pp;

export const offPct = (price: number, was: number | null) => (was && was > price ? Math.round((1 - price / was) * 100) : 0);
