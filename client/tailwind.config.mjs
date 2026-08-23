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
        },
        // Dynamic color tokens mapping to the Navyan Color System variables
        "color-background": "var(--color-background)",
        "color-surface": "var(--color-surface)",
        "color-surface-raised": "var(--color-surface-raised)",
        "color-text-primary": "var(--color-text-primary)",
        "color-text-secondary": "var(--color-text-secondary)",
        "color-text-muted": "var(--color-text-muted)",
        "color-text-on-primary": "var(--color-text-on-primary)",
        "color-text-on-accent": "var(--color-text-on-accent)",
        "color-text-link": "var(--color-text-link)",
        "color-border": "var(--color-border)",
        "color-border-strong": "var(--color-border-strong)",
        "color-border-focus": "var(--color-border-focus)",
        "color-button-primary-bg": "var(--color-button-primary-bg)",
        "color-button-primary-bg-hover": "var(--color-button-primary-bg-hover)",
        "color-button-primary-bg-active": "var(--color-button-primary-bg-active)",
        "color-button-primary-text": "var(--color-button-primary-text)",
        "color-button-secondary-bg": "var(--color-button-secondary-bg)",
        "color-button-secondary-bg-hover": "var(--color-button-secondary-bg-hover)",
        "color-button-secondary-border": "var(--color-button-secondary-border)",
        "color-button-secondary-text": "var(--color-button-secondary-text)",
        "color-button-accent-bg": "var(--color-button-accent-bg)",
        "color-button-accent-bg-hover": "var(--color-button-accent-bg-hover)",
        "color-button-accent-text": "var(--color-button-accent-text)",
        "color-button-danger-bg": "var(--color-button-danger-bg)",
        "color-button-danger-bg-hover": "var(--color-button-danger-bg-hover)",
        "color-button-danger-text": "var(--color-button-danger-text)",
        "color-button-disabled-bg": "var(--color-button-disabled-bg)",
        "color-button-disabled-text": "var(--color-button-disabled-text)",
        "color-input-bg": "var(--color-input-bg)",
        "color-input-border": "var(--color-input-border)",
        "color-input-border-hover": "var(--color-input-border-hover)",
        "color-input-border-focus": "var(--color-input-border-focus)",
        "color-input-text": "var(--color-input-text)",
        "color-input-placeholder": "var(--color-input-placeholder)",
        "color-input-disabled-bg": "var(--color-input-disabled-bg)",
        "color-input-error-border": "var(--color-input-error-border)",
        "color-input-success-border": "var(--color-input-success-border)",
        "color-navbar-bg": "var(--color-navbar-bg)",
        "color-navbar-border": "var(--color-navbar-border)",
        "color-navbar-text": "var(--color-navbar-text)",
        "color-navbar-active": "var(--color-navbar-active)",
        "color-sidebar-bg": "var(--color-sidebar-bg)",
        "color-sidebar-item-hover": "var(--color-sidebar-item-hover)",
        "color-sidebar-item-active-bg": "var(--color-sidebar-item-active-bg)",
        "color-sidebar-item-active-text": "var(--color-sidebar-item-active-text)",
        "color-card-bg": "var(--color-card-bg)",
        "color-card-border": "var(--color-card-border)",
        "color-card-shadow": "var(--color-card-shadow)",
        "color-success-bg": "var(--color-success-bg)",
        "color-success-text": "var(--color-success-text)",
        "color-success-border": "var(--color-success-border)",
        "color-warning-bg": "var(--color-warning-bg)",
        "color-warning-text": "var(--color-warning-text)",
        "color-warning-border": "var(--color-warning-border)",
        "color-error-bg": "var(--color-error-bg)",
        "color-error-text": "var(--color-error-text)",
        "color-error-border": "var(--color-error-border)",
        "color-info-bg": "var(--color-info-bg)",
        "color-info-text": "var(--color-info-text)",
        "color-info-border": "var(--color-info-border)",
        "color-badge-blue-bg": "var(--color-badge-blue-bg)",
        "color-badge-blue-text": "var(--color-badge-blue-text)",
        "color-badge-amber-bg": "var(--color-badge-amber-bg)",
        "color-badge-amber-text": "var(--color-badge-amber-text)",
        "color-icon-default": "var(--color-icon-default)",
        "color-icon-active": "var(--color-icon-active)"
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
