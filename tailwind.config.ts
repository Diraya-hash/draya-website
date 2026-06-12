import type { Config } from "tailwindcss";

/**
 * Draya brand design tokens — single source of truth.
 *
 * Official brand colors:
 *   Deep Teal (Primary)   #0D3D35  -> teal-800 / teal.DEFAULT
 *   Mid Teal (Secondary)  #1A5C50  -> teal-600
 *   Light Teal (Accent)   #2E8B7A  -> teal-500
 *   Mint (Surface)        #E8F5F0  -> mint
 *   Warm Cream (Bg)       #F2F0E8  -> cream
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        teal: {
          DEFAULT: "#0D3D35",
          50: "#F0F7F4",
          100: "#DCEEE7",
          200: "#BCDDD2",
          300: "#8FC4B4",
          400: "#5BA694",
          500: "#2E8B7A",
          600: "#1A5C50",
          700: "#144A41",
          800: "#0D3D35",
          900: "#0A2F29",
          950: "#06211C",
        },
        mint: {
          DEFAULT: "#E8F5F0",
          dark: "#D9EDE3",
        },
        cream: {
          DEFAULT: "#F2F0E8",
          dark: "#E7E4D8",
        },
        ink: {
          DEFAULT: "#13251F",
          soft: "#46594F",
          mute: "#71837B",
        },
      },
      fontFamily: {
        sans: ["var(--font-plex)", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        caps: "0.18em",
      },
      maxWidth: {
        content: "76rem",
      },
    },
  },
  plugins: [],
};

export default config;
