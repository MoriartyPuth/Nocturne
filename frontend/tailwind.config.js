/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', '"Liberation Mono"', 'monospace'],
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        nocturne: {
          black: '#000000',
          dark: '#0b0f0c',
          darker: '#0a0e0b',
          panel: '#0f1512',
          border: '#1c2821',
          muted: '#94a59b',
        },
        neon: {
          green: '#22c55e',
          greenDim: 'rgba(34, 197, 94, 0.7)',
          amber: '#f97316',
          amberDim: '#c2410c',
          cyan: '#00d4ff',
          cyanDim: '#00a8cc',
          magenta: '#ff00ff',
          red: '#ef4444',
        },
      },
      boxShadow: {
        'neon-green': '0 0 5px #22c55e, 0 0 20px rgba(34, 197, 94, 0.25)',
        'neon-green-lg': '0 0 10px #22c55e, 0 0 40px rgba(34, 197, 94, 0.35), 0 0 80px rgba(34, 197, 94, 0.1)',
        'neon-cyan': '0 0 5px #00d4ff, 0 0 20px rgba(0, 212, 255, 0.3)',
        'neon-amber': '0 0 5px #f97316, 0 0 20px rgba(249, 115, 22, 0.3)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.45)',
      },
      animation: {
        'scanline': 'scanline 8s linear infinite',
        'flicker': 'flicker 0.15s infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite alternate',
        'typewriter': 'typewriter 2s steps(40) forwards',
        'blink': 'blink 1s step-end infinite',
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
        'boot-line': 'bootLine 0.3s ease-out forwards',
      },
      keyframes: {
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        flicker: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.98' },
        },
        'glow-pulse': {
          '0%': { textShadow: '0 0 4px #22c55e, 0 0 11px #22c55e, 0 0 19px #22c55e' },
          '100%': { textShadow: '0 0 4px #22c55e, 0 0 20px #22c55e, 0 0 40px #22c55e, 0 0 80px #22c55e' },
        },
        typewriter: {
          '0%': { width: '0' },
          '100%': { width: '100%' },
        },
        blink: {
          '0%, 100%': { borderColor: 'transparent' },
          '50%': { borderColor: '#22c55e' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        bootLine: {
          '0%': { opacity: '0', transform: 'translateX(-10px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'grid-pattern': 'linear-gradient(rgba(34, 197, 94, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(34, 197, 94, 0.03) 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid': '50px 50px',
      },
    },
  },
  plugins: [],
}
