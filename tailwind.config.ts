import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: { deep: "#0B3B82", DEFAULT: "#2563EB", light: "#EFF6FF" },
        surface: "#F8FAFC", ink: "#0F172A", muted: "#64748B", line: "#E2E8F0",
        ok: "#16A34A", warn: "#F59E0B", bad: "#DC2626",
      },
      fontFamily: { sans: ["var(--font-body)", "system-ui", "sans-serif"], display: ["var(--font-display)", "system-ui", "sans-serif"] },
      boxShadow: { card: "0 1px 2px rgba(11,59,130,.06), 0 4px 16px rgba(11,59,130,.05)" },
      screens: {
        "3xl": "1920px",
        "4xl": "2560px",
      },
    },
  },
  plugins: [],
};
export default config;
