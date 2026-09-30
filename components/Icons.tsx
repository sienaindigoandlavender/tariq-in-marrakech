const P = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

export function Icon({ name, size = 20 }: { name: "clock" | "pin" | "users" | "shield" | "wallet" | "check" | "x"; size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" {...P}>
      {name === "clock" && (<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>)}
      {name === "pin" && (<><path d="M12 21s-7-6.2-7-11.5A7 7 0 0112 2.5a7 7 0 017 7C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></>)}
      {name === "users" && (<><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0113 0M16 4.6a3.5 3.5 0 010 6.8M18 14a6.5 6.5 0 013.5 6" /></>)}
      {name === "shield" && (<><path d="M12 3l8 3v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6z" /><path d="M8.5 12l2.5 2.5 4.5-5" /></>)}
      {name === "wallet" && (<><rect x="3" y="6" width="18" height="14" rx="3" /><path d="M3 10h18M16 15h2" /></>)}
      {name === "check" && <path d="M5 12.5l4.5 4.5L19 7.5" />}
      {name === "x" && <path d="M6 6l12 12M18 6L6 18" />}
    </svg>
  );
}
