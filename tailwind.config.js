/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./lib/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        obsidian: "#0F0E0C",
        surface: "#1A1915",
        line: "#2A2820",
        gold: "#C8A97E",
        text: "#E8E0D4",
        muted: "#7A7268",
        clay: "#C87E7E",
        sage: "#A8C5A0"
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-dm-sans)", "system-ui", "sans-serif"]
      },
      boxShadow: {
        editorial: "0 24px 80px rgba(0, 0, 0, 0.32)"
      }
    }
  },
  plugins: []
};
