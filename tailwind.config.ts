import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
        serif: ["Georgia", "serif"]
      },
      colors: {
        gai: {
          purple: "#8b45b5",
          pink: "#f8ecfb",
          dark: "#17132a"
        }
      }
    }
  },
  plugins: []
};

export default config;
