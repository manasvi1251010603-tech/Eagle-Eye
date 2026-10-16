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
        surface: "#131D2E",
        "surface-elevated": "#1E293B",
        "surface-highlight": "#29384D",
        "slate-border": "#243447",
        "slate-border-light": "#334155",
        "accent-blue": "#3B82F6",
        "accent-blue-dark": "#1D4ED8",
        "accent-cyan": "#38BDF8",
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
        'technical': '0 2px 8px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        'blue-glow': '0 0 15px rgba(59, 130, 246, 0.35)',
      }
    },
  },
  plugins: [],
}
