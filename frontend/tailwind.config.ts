import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        syncial: {
          bg: "#0a0a0f",
          card: "#12121a",
          border: "#1e1e2e",
          primary: "#6366f1",
          secondary: "#8b5cf6",
          accent: "#22d3ee",
          success: "#10b981",
          danger: "#ef4444",
          warning: "#f59e0b",
          text: "#e2e8f0",
          muted: "#64748b",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;