import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg:            "#0B0B0F",
        panel:         "#15151B",
        card:          "#1C1C24",
        "card-2":      "#22222C",
        "input-bg":    "#1C1C24",
        "sidebar-bg":  "#0F0F14",
        accent:        "#7B6FE8",
        "accent-bright":"#9D8FFF",
        "text-primary":"#F2F1EE",
        "text-muted":  "#8B8B96",
        "text-faint":  "#5A5A66",
        success:       "#6FCF97",
        danger:        "#FF6B6B",
        // legacy alias so any older Tailwind references still build
        background:    "#0B0B0F",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      borderRadius: {
        card: "16px",
      },
      animation: {
        breathe: "breathe 4s ease-in-out infinite",
        "fade-in": "fadeIn 0.3s ease-in-out forwards",
      },
      keyframes: {
        breathe: {
          "0%, 100%": { transform: "scale(1.0)" },
          "50%": { transform: "scale(1.02)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
