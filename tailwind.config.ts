import type { Config } from "tailwindcss";

const token = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: token("bg"),
        soft: token("soft"),
        surface: token("surface"),
        ink: token("ink"),
        muted: token("muted"),
        line: token("line"),
        blue: { DEFAULT: token("blue"), ink: token("blue-ink") },
        sun: { DEFAULT: token("sun"), ink: token("sun-ink") },
        rose: { DEFAULT: token("rose"), strong: token("rose-strong"), "strong-ink": token("rose-strong-ink") },
        ok: token("ok"),
        warn: token("warn"),
        wa: token("wa"),
      },
      fontFamily: {
        display: ["var(--font-display)", "Arial Narrow", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
      },
      borderRadius: { card: "16px", input: "12px" },
      maxWidth: { wrap: "1180px" },
      // Max-width breakpoints, widest first so narrower ones win.
      screens: { tab: { max: "1020px" }, phone: { max: "760px" }, xs: { max: "480px" } },
      spacing: { tab: "64px" },
    },
  },
  plugins: [],
};

export default config;
