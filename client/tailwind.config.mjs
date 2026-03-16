/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#0B0D10",
        backgroundSecondary: "#111418",
        tertiary: "#171B21",
        surface: "#14181D",
        elevated: "#1A2027",
        sidebar: "#0F1318",
        border: "rgba(255,255,255,0.08)",
        softBorder: "rgba(255,255,255,0.05)",
        textPrimary: "#F5F7FA",
        textSecondary: "#B7C0CC",
        textMuted: "#7E8794",
        primary: {
          DEFAULT: "#D4A85F"
        },
        secondary: {
          DEFAULT: "#E3B76F"
        },
        accent: {
          DEFAULT: "#8B5CF6"
        },
        plum: {
          DEFAULT: "#6D28D9"
        },
        cyan: {
          DEFAULT: "#67E8F9"
        },
        success: {
          DEFAULT: "#22C55E"
        },
        warning: {
          DEFAULT: "#F59E0B"
        },
        danger: {
          DEFAULT: "#F43F5E"
        }
      },
      fontFamily: {
        sans: ["Manrope", "sans-serif"],
        display: ["Space Grotesk", "sans-serif"]
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "1.75rem"
      },
      boxShadow: {
        soft: "0 24px 64px rgba(3,5,8,0.34)",
        glow: "0 0 0 1px rgba(212,168,95,0.18), 0 20px 60px rgba(212,168,95,0.16)"
      }
    }
  },
  plugins: []
};
