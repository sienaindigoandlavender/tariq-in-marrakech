// Merchandising lists (product ids).
export const FIXES = ["lastday", "baby", "table", "henna", "bacha", "trekkit"];
export const XSELL = ["airport", "agafay", "baby", "trekkit"];

/** Home page rails, in order. `pick` runs on the server, where the internal role is available. */
export type RailDef = { key: string; h: string; p: string; href: string; ids?: string[]; category?: string; best?: true };
export const RAILS: RailDef[] = [
  { key: "best", h: "Best sellers", p: "What most people book first.", href: "/c/all", best: true },
  { key: "tkt", h: "We queue. You don't.", p: "Bacha Coffee at opening. Bahia, El Badi, the Saadian Tombs with the ticket in hand.", href: "/c/tkt", category: "tkt" },
  { key: "solved", h: "Solved before you ask", p: "The things nobody else sorts out for you, delivered in the van that's already coming.", href: "/c/svc", ids: FIXES },
];
