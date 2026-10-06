import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: { 900: "#055c2a", 800: "#087a3b", 700: "#16a34a" },
        accent: { DEFAULT: "#087a3b", dark: "#055c2a", soft: "#eaf7ef" },
        highlight: "#f4c542",
        canvas: "#f7f8f3",
        cream: "#ffffff",
        ink: { DEFAULT: "#172018", muted: "#647568" },
        line: "#dce7de",
        success: { DEFAULT: "#2d6a4f", soft: "#d8f3dc" },
        danger: { DEFAULT: "#b42318", soft: "#fde2d2" },
      },
      fontFamily: {
        sans: ['"Segoe UI"', "system-ui", "-apple-system", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
      },
      borderRadius: { card: "24px" },
      boxShadow: {
        card: "0 2px 4px rgba(5,92,42,.04), 0 14px 32px rgba(5,92,42,.11)",
        pop: "0 18px 44px rgba(5,92,42,.22)",
      },
    },
  },
  plugins: [],
};

export default config;
