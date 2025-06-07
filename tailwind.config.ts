import type { Config } from "tailwindcss"

const config: Config = {
  // prefix: "",
  darkMode: "class",
  content: [
    "./pages/**/*.{ts,tsx,js,jsx}",
    "./app/**/*.{ts,tsx,js,jsx}",
    "./components/**/*.{ts,tsx,js,jsx}",
    "./src/**/*.{ts,tsx,js,jsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      colors: {
        border:       "var(--border) / <alpha-value>",
        input:        "var(--input) / <alpha-value>",
        ring:         "var(--ring) / <alpha-value>",
        background:   "var(--background) / <alpha-value>",
        foreground:   "var(--foreground) / <alpha-value>",
        primary: {
          DEFAULT:    "var(--primary) / <alpha-value>",
          foreground: "var(--primary-foreground) / <alpha-value>",
        },
        secondary: {
          DEFAULT:    "var(--secondary) / <alpha-value>",
          foreground: "var(--secondary-foreground) / <alpha-value>",
        },
        destructive: {
          DEFAULT:    "var(--destructive) / <alpha-value>",
          foreground: "var(--destructive-foreground) / <alpha-value>",
        },
        muted: {
          DEFAULT:    "var(--muted) / <alpha-value>",
          foreground: "var(--muted-foreground) / <alpha-value>",
        },
        accent: {
          DEFAULT:    "var(--accent) / <alpha-value>",
          foreground: "var(--accent-foreground) / <alpha-value>",
        },
        popover: {
          DEFAULT:    "var(--popover) / <alpha-value>",
          foreground: "var(--popover-foreground) / <alpha-value>",
        },
        card: {
          DEFAULT:    "var(--card) / <alpha-value>",
          foreground: "var(--card-foreground) / <alpha-value>",
        },
        sitravel: {
          blue:   "#377dec",
          yellow: "#ffcc00",
          red:    "#ff3b30",
          green:  "#34c759",
          gray: {
            100:   "#f5f5f5",
            200:   "#e7e7e7",
            300:   "#d8d8d8",
            400:   "#b0b0b0",
            500:   "#888888",
            600:   "#3d3d3d",
          },
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to:   { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to:   { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up":   "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
