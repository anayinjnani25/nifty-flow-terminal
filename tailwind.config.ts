import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#07111f",
        ink: "#d9f0ff",
        success: "#15b36e",
        danger: "#f25f5c",
        accent: "#53c1ff",
        warning: "#f8b73e"
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(140, 212, 255, 0.08), 0 24px 60px rgba(1, 14, 31, 0.45)"
      },
      backgroundImage: {
        "radial-grid":
          "radial-gradient(circle at top, rgba(83,193,255,0.18), transparent 38%), radial-gradient(circle at bottom right, rgba(21,179,110,0.16), transparent 32%)"
      },
      fontFamily: {
        sans: ["Segoe UI", "Inter", "system-ui", "sans-serif"],
        mono: ["Consolas", "SFMono-Regular", "monospace"]
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" }
        }
      },
      animation: {
        float: "float 8s ease-in-out infinite"
      }
    }
  },
  plugins: []
};

export default config;
