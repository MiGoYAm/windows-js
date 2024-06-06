import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      keyframes: {
        gemini: {
          "0%": { opacity: "0", transform: "translate3d(0, 40px, 0)" },
          "20%": { opacity: "0" },
          "100%": { opacity: "1", transform: "translate3d(0, 0, 0)" },
        },
      },
      animation: {
        gemini: "gemini .7s cubic-bezier(0.19, 1, 0.22, 1) forwards",
      },
    },
  },
  plugins: [require("@tailwindcss/container-queries")],
};
export default config;
