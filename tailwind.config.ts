import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        stage: {
          950: '#09090b',
          900: '#121215',
          800: '#18181b',
          700: '#27272a',
          600: '#3f3f46',
          400: '#a1a1aa',
        },
        studio: {
          canvas: '#fafafa',
          surface: '#ffffff',
          border: 'rgba(0, 0, 0, 0.07)',
          borderDark: 'rgba(255, 255, 255, 0.1)',
          violet: '#7c3aed',
          violetLight: '#8b5cf6',
          violetGlow: 'rgba(124, 58, 237, 0.25)',
        },
      },
      fontFamily: {
        sans: ["'DM Sans'", "'Outfit'", "'Plus Jakarta Sans'", "system-ui", "sans-serif"],
        outfit: ["'Outfit'", "sans-serif"],
        dmsans: ["'DM Sans'", "sans-serif"],
        sinhala: ["'Noto Sans Sinhala'", "'DM Sans'", "sans-serif"],
        notoSans: ["'Noto Sans Sinhala'", "sans-serif"],
        abhaya: ["'Abhaya Libre'", "serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },

      boxShadow: {
        'studio-console': '0 20px 40px -15px rgba(0, 0, 0, 0.08), 0 0 1px 1px rgba(0, 0, 0, 0.05)',
        'stage-console': '0 20px 50px -10px rgba(0, 0, 0, 0.6), 0 0 1px 1px rgba(255, 255, 255, 0.1)',
      },
      animation: {
        'pulse-subtle': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};
export default config;
