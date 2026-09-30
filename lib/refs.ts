const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I

export function makeRef(): string {
  const bytes = new Uint8Array(5);
  crypto.getRandomValues(bytes);
  return "TRQ-" + Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
}

export const REF_RE = /^TRQ-[A-HJ-NP-Z2-9]{5}$/;
