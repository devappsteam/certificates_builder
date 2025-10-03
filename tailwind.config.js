/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,ts,tsx,js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        panel: {
          bg: "#0f172a",       // slate-900
          surface: "#111827",  // gray-900
          border: "#374151",   // gray-700
        }
      },
      boxShadow: {
        panel: "0 2px 8px rgba(0,0,0,0.2)",
      }
    },
  },
  plugins: [],
}

