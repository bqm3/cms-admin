import { heroui } from "@heroui/theme"

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    './src/layouts/**/*.{js,ts,jsx,tsx,mdx}',
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        white: "#FFFFFF",
        black: "#000000",
      },
    },
  },
  darkMode: "class",
  plugins: [heroui({
    themes: {
      light: {
        colors: {
          background: "#FFFFFF",
          foreground: "#000000",
          primary: {
            DEFAULT: "#000000",
            foreground: "#FFFFFF",
          },
          secondary: {
            DEFAULT: "#f4f4f5", // zinc-100
            foreground: "#000000",
          },
          focus: "#000000",
        },
      },
      dark: {
        colors: {
          background: "#000000",
          foreground: "#FFFFFF",
          primary: {
            DEFAULT: "#FFFFFF",
            foreground: "#000000",
          },
          secondary: {
            DEFAULT: "#27272a", // zinc-800
            foreground: "#FFFFFF",
          },
          focus: "#FFFFFF",
        },
      },
    },
  })],
}
