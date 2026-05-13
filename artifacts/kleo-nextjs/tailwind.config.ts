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
        background: "#FAF9F7",
        "input-bg": "#F0EDE6",
        "sidebar-bg": "#EFECE5",
        accent: "#D97757",
        "text-primary": "#1A1014",
        "text-muted": "#706870",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
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
