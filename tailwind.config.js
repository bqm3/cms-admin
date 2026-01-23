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
 plugins: [
  heroui({
    defaultTheme: "light",
    themes: {
      light: {
        colors: {
          background: "#ffffff",
          foreground: "#000000",
          primary: {
            DEFAULT: "#000000",
            foreground: "#ffffff",
          },
          secondary: {
            DEFAULT: "#f4f4f5",
            foreground: "#000000",
          },
          focus: "#000000",
        },
      },
      dark: {
        colors: {
          background: "#000000",
          foreground: "#ffffff",
        },
      },
    },
  }),
],

}
