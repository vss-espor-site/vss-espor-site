import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#0a0a0a",
          soft: "#121212",
          card: "#161616",
          border: "#262626",
        },
        neon: {
          green: "#39FF14",
          greenDark: "#22c40d",
          yellow: "#FFD500",
        },
      },
      boxShadow: {
        neon: "0 0 10px rgba(57,255,20,0.55), 0 0 30px rgba(57,255,20,0.15)",
        neonYellow: "0 0 10px rgba(255,213,0,0.55), 0 0 30px rgba(255,213,0,0.15)",
      },
      fontFamily: {
        display: ["Rajdhani", "Oswald", "sans-serif"],
      },
      backgroundImage: {
        grid: "linear-gradient(rgba(57,255,20,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(57,255,20,0.06) 1px, transparent 1px)",
      },
      backgroundSize: {
        grid: "40px 40px",
      },
    },
  },
  plugins: [],
};
export default config;
