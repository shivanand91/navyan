/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "var(--bg)",
        backgroundSecondary: "var(--bg-secondary)",
        tertiary: "var(--bg-tertiary)",
        surface: "var(--card)",
        elevated: "var(--card-elevated)",
        sidebar: "var(--sidebar)",
        border: "var(--border)",
        softBorder: "var(--soft-border)",
        textPrimary: "var(--text)",
        textSecondary: "var(--text-secondary)",
        textMuted: "var(--text-muted)",
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
