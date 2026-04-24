/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        navy: "#0A1628",
        blue: "#2563EB",
        gold: "#F59E0B",
        cyan: "#00D4FF",
        success: "#10B981",
        danger: "#EF4444"
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        heading: ["Poppins", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
        certificate: ["Playfair Display", "serif"]
      },
      boxShadow: {
        glow: "0 18px 50px rgba(37, 99, 235, 0.18)"
      }
    }
  },
  plugins: []
};
