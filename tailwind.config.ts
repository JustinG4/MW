import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "hsl(220, 10%, 10%)",
        surface: "hsl(220, 10%, 12%)",
        "surface-pressed": "hsl(220, 10%, 8%)",
        accent: {
          DEFAULT: "hsl(0, 0%, 90%)",
          muted: "hsl(0, 0%, 65%)",
        }
      },
      boxShadow: {
        'neumorphic': 'inset 2px 2px 5px rgba(255, 255, 255, 0.05), inset -3px -3px 7px rgba(0, 0, 0, 0.5)',
        'neumorphic-pressed': 'inset -2px -2px 5px rgba(255, 255, 255, 0.05), inset 3px 3px 7px rgba(0, 0, 0, 0.5)',
        'neumorphic-outer': '3px 3px 6px rgba(0, 0, 0, 0.4), -2px -2px 5px rgba(255, 255, 255, 0.05)'
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;