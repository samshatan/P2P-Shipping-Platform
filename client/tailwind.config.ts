import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#a33900",
        "primary-container": "#cc4900",
        secondary: "#535f74",
        tertiary: "#005da8",
        surface: "#f7f9fb",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f2f4f6",
        "surface-container": "#eceef0",
        "surface-container-high": "#e6e8ea",
        "surface-container-highest": "#e0e3e5",
        "on-surface": "#191c1e",
        "outline-variant": "#e2bfb2",
        "primary-fixed": "#ffdbce",
        "secondary-container": "#d4e0f9",
        background: "#f7f9fb",
        foreground: "#191c1e",
        error: "#ba1a1a",
        // Shadcn-compatible aliases
        muted: "#f2f4f6",
        "muted-foreground": "#535f74",
        border: "#e2bfb2",
        input: "#e2bfb2",
        ring: "#a33900",
        popover: "#ffffff",
        "popover-foreground": "#191c1e",
        accent: "#f2f4f6",
        "accent-foreground": "#191c1e",
      },
      fontFamily: {
        heading: ["Plus Jakarta Sans", "sans-serif"],
        sans: ["Inter", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.375rem",
      },
    },
  },
  plugins: [],
};
export default config;
