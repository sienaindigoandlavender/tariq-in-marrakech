// Public (client-safe) configuration. Server-only secrets never go here.
export const CITY = process.env.CITY ?? "marrakech";
export const MAD_RATE = Number(process.env.NEXT_PUBLIC_MAD_RATE ?? process.env.MAD_RATE ?? 11);
/** Display-only rates from EUR. Guests always pay in EUR or MAD. Update in Vercel env vars when rates move. */
export const USD_RATE = Number(process.env.NEXT_PUBLIC_USD_RATE ?? 1.08);
export const GBP_RATE = Number(process.env.NEXT_PUBLIC_GBP_RATE ?? 0.85);
export const OPERATOR_WHATSAPP = process.env.NEXT_PUBLIC_OPERATOR_WHATSAPP ?? "212600000000";

/** "212600000000" -> "+212 600 000 000" */
export function formatWhatsapp(digits: string = OPERATOR_WHATSAPP): string {
  return "+" + digits.replace(/^(\d{3})(\d{3})(\d{3})(\d{3})$/, "$1 $2 $3 $4");
}

export function waLink(text: string, to: string = OPERATOR_WHATSAPP): string {
  return `https://wa.me/${to}?text=${encodeURIComponent(text)}`;
}
