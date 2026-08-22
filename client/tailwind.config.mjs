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
          DEFAULT: "var(--primary)",
          hover: "var(--primary-hover)",
          soft: "var(--primary-soft)"
        },
        accent: {
          DEFAULT: "var(--accent)",
          hover: "var(--accent-hover)",
          soft: "var(--accent-soft)"
        },
        success: {
          DEFAULT: "var(--success)"
        },
        warning: {
          DEFAULT: "var(--warning)"
        },
        danger: {
          DEFAULT: "var(--danger)"
        }
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ["Inter", "sans-serif"]
      },
      borderRadius: {
        sm: "8px",
        md: "10px",
        lg: "12px",
        xl: "12px",
        "2xl": "12px",
        "3xl": "12px"
      },
      boxShadow: {
        soft: "0 1px 3px rgba(0,0,0,0.04)",
        glow: "0px 0px 0px 1px var(--border), 0px 1px 3px rgba(0,0,0,0.04)"
      }
    }
  },
  plugins: []
};
