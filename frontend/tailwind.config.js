/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,html}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        forge: {
          950: '#06080e',
          900: '#0a0e17',
          850: '#0f172a',
          800: '#141e33',
          700: '#1e293b',
          600: '#334155',
          500: '#64748b',
          gold: '#f59e0b',
          amber: '#d97706',
          cyan: '#06b6d4',
          crimson: '#ef4444',
          emerald: '#10b981',
          purple: '#8b5cf6',
          mana: '#3b82f6',
          rage: '#f43f5e',
          stamina: '#10b981'
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
        rpg: ['Cinzel', 'Rajdhani', 'Outfit', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'glow-gold': '0 0 20px -3px rgba(245, 158, 11, 0.45)',
        'glow-cyan': '0 0 20px -3px rgba(6, 182, 212, 0.45)',
        'glow-crimson': '0 0 20px -3px rgba(239, 68, 68, 0.45)',
        'glow-emerald': '0 0 20px -3px rgba(16, 185, 129, 0.45)',
        'glow-purple': '0 0 20px -3px rgba(139, 92, 246, 0.45)',
        'hud': 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.1), 0 10px 25px -5px rgba(0, 0, 0, 0.5)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'forge-mesh': 'radial-gradient(circle at 50% 20%, rgba(245, 158, 11, 0.08) 0%, transparent 60%), radial-gradient(circle at 80% 80%, rgba(6, 182, 212, 0.06) 0%, transparent 50%)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'level-up': 'levelUp 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'flame': 'flame 1.5s ease-in-out infinite alternate',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        levelUp: {
          '0%': { transform: 'scale(0.8) translateY(20px)', opacity: '0' },
          '50%': { transform: 'scale(1.05) translateY(-5px)', opacity: '1' },
          '100%': { transform: 'scale(1) translateY(0)', opacity: '1' },
        },
        flame: {
          '0%': { transform: 'scale(1) rotate(-2deg)' },
          '100%': { transform: 'scale(1.15) rotate(3deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
};
