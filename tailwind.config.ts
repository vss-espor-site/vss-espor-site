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
          DEFAULT: "#050608",
          soft: "#0B1220",
          card: "#0D1520",
          border: "#1A2740",
        },
        neon: {
          green: "#2D6BFF",
          greenDark: "#1F4FD6",
          yellow: "#D4AF37",
          orange: "#F2D16B",
        },
      },
      boxShadow: {
        neon: "0 0 12px rgba(45,107,255,0.55), 0 0 40px rgba(45,107,255,0.2)",
        neonYellow: "0 0 12px rgba(212,175,55,0.55), 0 0 40px rgba(212,175,55,0.18)",
        neonOrange: "0 0 12px rgba(242,209,107,0.5), 0 0 30px rgba(242,209,107,0.16)",
      },
      fontFamily: {
        display: ["Rajdhani", "Oswald", "sans-serif"],
        mono: ["Space Mono", "monospace"],
      },
      backgroundImage: {
        grid: "linear-gradient(rgba(45,107,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(45,107,255,0.06) 1px, transparent 1px)",
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
        glowPulse: {
          "0%, 100%": { opacity: "0.7" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        radarSpin: "radarSpin 6s linear infinite",
        pulseRing: "pulseRing 3s ease-out infinite",
        glowPulse: "glowPulse 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
