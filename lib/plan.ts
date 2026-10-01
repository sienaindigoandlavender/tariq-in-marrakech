// "Plan my trip" request options and the ready-made packages that prefill it.
// Labels are customer-facing; ids are stored.

export const STYLES = [
  { id: "relaxed", label: "Relaxed" },
  { id: "adventure", label: "Adventure" },
  { id: "culture", label: "Culture" },
  { id: "family", label: "Family" },
  { id: "romantic", label: "Romantic" },
  { id: "group", label: "Friends or group" },
] as const;

export const NEEDS = [
  { id: "private", label: "A private, tailor-made tour" },
  { id: "airport", label: "Airport transfers" },
  { id: "driver", label: "A private driver" },
  { id: "daytrips", label: "Day trips" },
  { id: "desert", label: "Sahara or multi-day tour" },
  { id: "activities", label: "Balloon, quad, camels" },
  { id: "riad", label: "Concierge: henna, chef, barber, photographer" },
  { id: "baby", label: "Baby equipment" },
  { id: "kits", label: "Trek or desert kits" },
] as const;

/** Total for the group, excluding accommodation (we don't sell rooms). */
export const BUDGETS = [
  { id: "u500", label: "Under €500" },
  { id: "500-1500", label: "€500 – €1,500" },
  { id: "1500-3000", label: "€1,500 – €3,000" },
  { id: "3000-6000", label: "€3,000 – €6,000" },
  { id: "6000+", label: "€6,000 +" },
  { id: "unsure", label: "Not sure yet" },
] as const;

export type LeadStatus = "new" | "contacted" | "quoted" | "won" | "lost";
export const LEAD_STATUSES: { id: LeadStatus; label: string }[] = [
  { id: "new", label: "New" },
  { id: "contacted", label: "Contacted" },
  { id: "quoted", label: "Quoted" },
  { id: "won", label: "Booked" },
  { id: "lost", label: "Lost" },
];

export type PackageDef = {
  id: string;
  title: string;
  days: string;
  blurb: string;
  scene: string;
  /** Catalogue product ids included, in trip order. */
  items: string[];
  /** Pre-ticked needs and style on the plan form. */
  style: (typeof STYLES)[number]["id"];
  needs: (typeof NEEDS)[number]["id"][];
};

export const PACKAGES: PackageDef[] = [
  {
    id: "desert",
    title: "Desert escape",
    days: "4 days",
    blurb: "Land, rest a night, then three days to the Erg Chebbi dunes and back. Luxury camp on request.",
    scene: "dunes",
    items: ["airport", "sahara3", "desertkit"],
    style: "adventure",
    needs: ["airport", "desert", "kits"],
  },
  {
    id: "adventure",
    title: "Atlas & adventure",
    days: "4–5 days",
    blurb: "A balloon at sunrise, quads in Agafay, a day in the High Atlas with a trek kit waiting in the van.",
    scene: "balloon",
    items: ["airport", "balloon", "quad", "imlil", "trekkit"],
    style: "adventure",
    needs: ["airport", "activities", "daytrips", "kits"],
  },
  {
    id: "family",
    title: "Family Marrakech",
    days: "4 days",
    blurb: "Car seats fitted, a cot at the riad, camels in the palm grove and an easy waterfall day.",
    scene: "baby",
    items: ["airport", "baby", "camel", "ourika"],
    style: "family",
    needs: ["airport", "baby", "activities", "daytrips"],
  },
  {
    id: "romantic",
    title: "Romantic Marrakech",
    days: "3–5 days",
    blurb: "Sunset dinner under the Agafay stars, a massage in your room, the ocean at Essaouira.",
    scene: "stone",
    items: ["airport", "agafay", "massage", "essaouira"],
    style: "romantic",
    needs: ["airport", "activities", "riad", "daytrips"],
  },
  {
    id: "culture",
    title: "Culture & kasbahs",
    days: "3–4 days",
    blurb: "Over the Tichka pass to Aït Benhaddou, a henna evening at the riad, a private driver for the city.",
    scene: "ksar",
    items: ["airport", "abh", "henna", "driver"],
    style: "culture",
    needs: ["airport", "daytrips", "riad", "driver"],
  },
];

export const packageById = (id: string | null | undefined) => PACKAGES.find((p) => p.id === id) ?? null;
