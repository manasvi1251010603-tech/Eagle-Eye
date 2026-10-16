/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        charcoal: "#0A0F18",
        graphite: "#0F172A",
        surface: "#FFFFFF",
        "surface-elevated": "#F8FAFC",
        "surface-highlight": "#EFF6FF",
        "slate-border": "#E2E8F0",
        "slate-border-light": "#CBD5E1",
        "navy-dark": "#0B1528",
        "navy-panel": "#0F1E36",
        "navy-primary": "#0F2B5C",
        "navy-hover": "#163A75",
        "accent-blue": "#2563EB",
        "accent-blue-dark": "#1D4ED8",
        "accent-lightblue": "#EFF6FF",
        "accent-cyan": "#0284C7",
        "status-pass": "#10B981",
        "status-fail": "#EF4444",
        "status-review": "#F59E0B",
        "status-nc": "#64748B"
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'SF Mono', 'monospace'],
      },
      boxShadow: {
        'technical': '0 1px 3px 0 rgba(15, 23, 42, 0.08), 0 1px 2px -1px rgba(15, 23, 42, 0.08)',
        'blue-glow': '0 4px 14px 0 rgba(37, 99, 235, 0.25)',
        'card-lift': '0 8px 24px -4px rgba(15, 23, 42, 0.1)',
      }
    },
  },
  plugins: [],
}
