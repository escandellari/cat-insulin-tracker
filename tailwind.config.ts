import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: "#2F8F63",
        "brand-dark": "#256F4E",
        sage: {
          50: "#F6FBF7",
          100: "#EEF8F2",
          200: "#D7ECDD",
          600: "#5F7268",
          950: "#1C2B22",
        },
      },
    },
  },
  plugins: [],
};
export default config;
