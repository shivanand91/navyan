/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#F8FBFF",
        backgroundSecondary: "#F3F8FF",
        tertiary: "#EAF2FF",
        surface: "#FFFFFF",
        elevated: "#FFFFFF",
        sidebar: "#FFFFFF",
        border: "rgba(255,255,255,0.08)",
        softBorder: "rgba(255,255,255,0.05)",
        textPrimary: "#0F172A",
        textSecondary: "#475569",
        textMuted: "#64748B",
        primary: {
          DEFAULT: "#2563EB"
        },
        secondary: {
          DEFAULT: "#F97316"
        },
        accent: {
          DEFAULT: "#0EA5E9"
        },
        plum: {
          DEFAULT: "#EA580C"
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
        display: ["Outfit", "sans-serif"]
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
