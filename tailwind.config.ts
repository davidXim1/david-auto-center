import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          red: "#d71920",
          black: "#09090b",
          graphite: "#18181b",
          pearl: "#f7f7f8"
        }
      },
      boxShadow: {
        glow: "0 24px 80px rgba(215, 25, 32, 0.22)"
      }
    }
  },
  plugins: []
};

export default config;
