import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        deepbg: '#0D0D1A',
        surface: '#1A1A2E',
        surface2: '#232340',
        surface3: '#2a2a50',
        violet: '#7C3AED',
        violetLight: '#9D5AF0',
        emerald: '#10B981',
        amber: '#F59E0B',
        red: '#EF4444',
      },
    },
  },
  plugins: [],
};
export default config;
