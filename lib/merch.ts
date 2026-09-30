// Merchandising lists (product ids).
export const FIXES = ["lastday", "baby", "trekkit", "henna", "dinner", "desertkit"];
export const XSELL = ["airport", "agafay", "baby", "trekkit"];

/** Home page rails, in order. `pick` runs on the server, where the internal role is available. */
export type RailDef = { key: string; h: string; p: string; href: string; ids?: string[]; category?: string; best?: true };
export const RAILS: RailDef[] = [
  { key: "best", h: "Best sellers", p: "What most people book first.", href: "/c/all", best: true },
  { key: "solved", h: "Solved before you ask", p: "The things nobody else sorts out for you, delivered in the van that's already coming.", href: "/c/svc", ids: FIXES },
  { key: "trf", h: "Getting in, around and out", p: "Airport, dinner rides and your last day.", href: "/c/trf", category: "trf" },
  { key: "exc", h: "Day trips from Marrakech", p: "Pickup at your riad, back by dinner.", href: "/c/exc", category: "exc" },
  { key: "des", h: "Multi-day tours", p: "The Sahara in three days, Zagora in two, on to Fes in four, or the Atlas on foot.", href: "/c/des", category: "des" },
  { key: "act", h: "Evenings and adventures", p: "Balloons at sunrise, Agafay at sunset.", href: "/c/act", category: "act" },
];
