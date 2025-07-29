/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Light Mode Colors
        lightbg: "#F9FAFB", // Background
        lighttext: "#1F2937", // Primary Text
        lightaccent: "#3B82F6", // Accent/Buttons
        lightsecondary: "#6B7280", // Secondary/Tags

        // Dark Mode Colors
        darkbg: "#0F172A", // Background
        darktext: "#F1F5F9", // Primary Text
        darkaccent: "#60A5FA", // Accent/Buttons
        darksecondary: "#94A3B8", // Secondary/Tags

        // Legacy colors for backward compatibility
        primary: {
          DEFAULT: "#1a365d", // Classic deep blue
        },
        secondary: {
          DEFAULT: "#f5f7fa", // Soft light background
        },
        accent: {
          DEFAULT: "#2563eb", // Blue accent
        },
        muted: {
          DEFAULT: "#e5e7eb", // Muted gray
        },
        border: {
          DEFAULT: "#d1d5db", // Light border
        },
        text: {
          DEFAULT: "#22223b", // Classic dark text
        },
        white: "#fff",
        black: "#000",
        blue: {
          50: "#f0f6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#2563eb",
          600: "#1d4ed8",
          700: "#1e40af",
          800: "#1e3a8a",
          900: "#172554",
        },
        gray: {
          50: "#f9fafb",
          100: "#f3f4f6",
          200: "#e5e7eb",
          300: "#d1d5db",
          400: "#9ca3af",
          500: "#6b7280",
          600: "#4b5563",
          700: "#374151",
          800: "#1f2937",
          900: "#111827",
        },
      },
      fontFamily: {
        sans: ["Inter", "Lato", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
