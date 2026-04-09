import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "var(--color-canvas)",
        panel: "var(--color-panel)",
        panelMuted: "var(--color-panel-muted)",
        foreground: "var(--color-foreground)",
        muted: "var(--color-muted)",
        border: "var(--color-border)",
        primary: "var(--color-primary)",
        primarySoft: "var(--color-primary-soft)",
        success: "var(--color-success)",
        warning: "var(--color-warning)"
      },
      boxShadow: {
        soft: "0 10px 30px rgba(16, 24, 40, 0.08)",
        panel: "0 18px 40px rgba(15, 23, 42, 0.08)"
      },
      borderRadius: {
        "2xl": "1.25rem",
        "3xl": "1.75rem"
      },
      fontFamily: {
        sans: ["Manrope", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Source Serif 4", "Georgia", "serif"]
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" }
        },
        floatIn: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        }
      },
      animation: {
        shimmer: "shimmer 2.2s linear infinite",
        floatIn: "floatIn 240ms ease-out"
      }
    }
  },
  plugins: []
} satisfies Config;
