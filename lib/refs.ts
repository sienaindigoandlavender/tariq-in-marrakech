const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I

export function makeRef(prefix: "TRQ" | "PLN" = "TRQ"): string {
  const bytes = new Uint8Array(5);
  crypto.getRandomValues(bytes);
  return prefix + "-" + Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
}

export const REF_RE = /^TRQ-[A-HJ-NP-Z2-9]{5}$/;
export const LEAD_RE = /^PLN-[A-HJ-NP-Z2-9]{5}$/;
