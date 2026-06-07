/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        museum: {
          brown: {
            50: "#FDF8F3",
            100: "#F5EFE6",
            200: "#E8DCC8",
            300: "#D4BF9E",
            400: "#BFA078",
            500: "#A68154",
            600: "#8B6341",
            700: "#6B4A31",
            800: "#543A27",
            900: "#3E2723",
            950: "#2A1A16",
          },
          gold: {
            50: "#FFFDF5",
            100: "#FBF3D9",
            200: "#F3E3A8",
            300: "#E9CC6E",
            400: "#DCB03C",
            500: "#B8860B",
            600: "#9A6F08",
            700: "#7A580A",
            800: "#5E4410",
            900: "#4C3712",
          },
          cream: "#F5F0E6",
          jade: "#2E7D32",
          crimson: "#C62828",
        },
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', "serif"],
        sans: ['"Noto Sans SC"', "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-in-left": "slideInLeft 0.4s ease-out",
        "slide-in-right": "slideInRight 0.4s ease-out",
        "slide-in-up": "slideInUp 0.4s ease-out",
        "pulse-red": "pulseRed 3s infinite",
        "pulse-gold": "pulseGold 2s infinite",
        "shimmer": "shimmer 2s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideInLeft: {
          "0%": { transform: "translateX(-100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        slideInRight: {
          "0%": { transform: "translateX(20px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        slideInUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        pulseRed: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(198, 40, 40, 0.4)" },
          "50%": { boxShadow: "0 0 0 12px rgba(198, 40, 40, 0)" },
        },
        pulseGold: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(184, 134, 11, 0.4)" },
          "50%": { boxShadow: "0 0 0 12px rgba(184, 134, 11, 0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
      },
      boxShadow: {
        "museum": "0 4px 20px rgba(62, 39, 35, 0.08)",
        "museum-hover": "0 8px 30px rgba(62, 39, 35, 0.15)",
        "gold": "0 4px 15px rgba(184, 134, 11, 0.25)",
        "gold-hover": "0 6px 25px rgba(184, 134, 11, 0.4)",
      },
    },
  },
  plugins: [],
};
