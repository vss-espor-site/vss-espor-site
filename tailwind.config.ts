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
          DEFAULT: "#0A0D10",
          soft: "#10151A",
          card: "#141A20",
          border: "#232B33",
        },
        neon: {
          green: "#2E9BFF",
          greenDark: "#1C79D1",
          yellow: "#E8B93D",
          orange: "#FF5A2E",
        },
      },
      boxShadow: {
        neon: "0 0 10px rgba(46,155,255,0.5), 0 0 30px rgba(46,155,255,0.15)",
        neonYellow: "0 0 10px rgba(232,185,61,0.5), 0 0 30px rgba(232,185,61,0.15)",
        neonOrange: "0 0 10px rgba(255,90,46,0.5), 0 0 30px rgba(255,90,46,0.15)",
      },
      fontFamily: {
        display: ["Rajdhani", "Oswald", "sans-serif"],
        mono: ["Space Mono", "monospace"],
      },
      backgroundImage: {
        grid: "linear-gradient(rgba(46,155,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(46,155,255,0.06) 1px, transparent 1px)",
        contour: "radial-gradient(circle at 50% 50%, transparent 0%, transparent 60%, rgba(46,155,255,0.04) 61%, transparent 62%)",
      },
      backgroundSize: {
        grid: "40px 40px",
      },
      keyframes: {
        radarSpin: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        pulseRing: {
          "0%": { transform: "scale(0.9)", opacity: "0.6" },
          "100%": { transform: "scale(1.6)", opacity: "0" },
        },
      },
      animation: {
        radarSpin: "radarSpin 6s linear infinite",
        pulseRing: "pulseRing 3s ease-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
