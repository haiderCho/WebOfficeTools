/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
    "../../plugins/latex/src/**/*.{ts,tsx}",
    "../../plugins/word/src/**/*.{ts,tsx}",
    "../../plugins/table-builder/index.tsx",
    "../../plugins/table-builder/src/**/*.{ts,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f7ff",
          100: "#e0efff",
          200: "#b8dcff",
          300: "#79bfff",
          400: "#3a9fff",
          500: "#1a85ff",
          600: "#0066e6",
          700: "#004db3",
          800: "#003380",
          900: "#001a4d",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
  ],
}
