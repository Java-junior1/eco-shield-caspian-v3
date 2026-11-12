import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: { 950: "#050E1F", 900: "#081835", 800: "#0A1F3F", 700: "#0B2E52", 600: "#0E2A5E" },
        mint: { 300: "#8FF5E3", 400: "#3EE6C8", 500: "#2DC9B4" },
        sea: { 400: "#6D8BFF", 500: "#6F9DBE" },
        violet: { 500: "#7C5CFF" },
        gold: { 400: "#E6BE5A", 600: "#B8860B" },
        alert: { red: "#FF7A59", amber: "#E6BE5A" },
      },
      fontFamily: {
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-body)", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 40px -10px rgba(46, 230, 182, 0.45)",
      },
      keyframes: {
        pulseRing: {
          "0%": { transform: "scale(0.8)", opacity: "0.8" },
          "100%": { transform: "scale(2.2)", opacity: "0" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        pulseRing: "pulseRing 2s ease-out infinite",
        fadeUp: "fadeUp 0.6s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
