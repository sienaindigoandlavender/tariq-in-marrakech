// Business and legal identity. Everything here is public. Set the values in Vercel env vars;
// a line whose value is missing is simply not shown, so the pages never display placeholders.

const v = (x: string | undefined) => (x && x.trim() ? x.trim() : null);

export const LEGAL = {
  brand: "Tariq",
  /** Registered company name, e.g. "Tariq Marrakech SARL". */
  name: v(process.env.NEXT_PUBLIC_LEGAL_NAME),
  address: v(process.env.NEXT_PUBLIC_LEGAL_ADDRESS),
  /** Registre de commerce number. */
  rc: v(process.env.NEXT_PUBLIC_LEGAL_RC),
  /** Identifiant commun de l'entreprise. */
  ice: v(process.env.NEXT_PUBLIC_LEGAL_ICE),
  /** Tourist transport authorisation number. */
  licence: v(process.env.NEXT_PUBLIC_TRANSPORT_LICENCE),
  email: v(process.env.NEXT_PUBLIC_CONTACT_EMAIL),
  /** CNDP declaration or authorisation reference under Law 09-08. */
  cndp: v(process.env.NEXT_PUBLIC_CNDP_REF),
  /** "true" when prices include VAT (TVA) because the company is VAT-registered. */
  vatIncluded: process.env.NEXT_PUBLIC_VAT_INCLUDED === "true",
  hours: "Daily, 8:00–22:00 Morocco time",
  updated: "30 September 2026",
  year: 2026,
} as const;

/** The name to use in legal text: the registered company when set, otherwise the brand. */
export const legalName = () => LEGAL.name ?? `${LEGAL.brand} Marrakech`;
