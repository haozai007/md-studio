import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: "#A8FF2F",
        warm: {
          50: "#FDFDFB",
          100: "#FBFBF9",
          200: "#F5F5F0",
        },
        ink: "#1F1F1F",
      },
    },
  },
  plugins: [],
};

export default config;
