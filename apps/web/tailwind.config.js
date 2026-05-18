/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './app/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    container: { center: true, padding: '1.5rem', screens: { '2xl': '1440px' } },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
        secondary: { DEFAULT: 'hsl(var(--secondary))', foreground: 'hsl(var(--secondary-foreground))' },
        accent: { DEFAULT: 'hsl(var(--accent))', foreground: 'hsl(var(--accent-foreground))' },
        muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
        card: { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' },
        destructive: { DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' },

        // Brand
        navy:    { 900: '#001428', 800: '#001F3F', 700: '#11375E', 600: '#2D4F73' },
        magenta: { 700: '#CC1377', 600: '#FF1493', 500: '#FF55B0', 100: '#FFEDF7' },
        gold:    { 500: '#C9A24A', 100: '#F6EFDB' },
        verified:{ 700: '#0E72C6', 500: '#1DA1F2', 100: '#E7F4FD' },
        neutral: {
          50:  '#F8F9FB', 100: '#F1F3F6', 200: '#E4E7EC', 300: '#CFD4DA',
          400: '#9CA3AF', 500: '#6B7280', 600: '#475569', 700: '#2F3A4A',
          800: '#1B2230', 900: '#0B0F18',
        },
      },
      borderRadius: { lg: '1rem', md: '0.75rem', sm: '0.5rem', xl: '1.5rem', '2xl': '2rem' },
      fontFamily: {
        sans: ['Poppins', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'monospace'],
      },
      backgroundImage: {
        'gradient-aurora':    'linear-gradient(135deg, #001F3F 0%, #6D1B5C 50%, #FF1493 100%)',
        'gradient-ember':     'linear-gradient(180deg, #FF55B0 0%, #FF1493 100%)',
        'gradient-mist':      'linear-gradient(180deg, #FFEDF7 0%, #F8F9FB 100%)',
        'gradient-velvet':    'linear-gradient(180deg, #001428 0%, #001F3F 100%)',
        'gradient-gold-foil': 'linear-gradient(135deg, #F6EFDB 0%, #C9A24A 50%, #8B6E2A 100%)',
      },
      boxShadow: {
        '1': '0 1px 2px 0 rgba(11, 15, 24, 0.04)',
        '2': '0 2px 4px 0 rgba(11, 15, 24, 0.06), 0 1px 2px rgba(11, 15, 24, 0.04)',
        '3': '0 8px 24px -4px rgba(11, 15, 24, 0.10), 0 2px 6px rgba(11, 15, 24, 0.06)',
        '4': '0 16px 40px -8px rgba(11, 15, 24, 0.14), 0 4px 12px rgba(11, 15, 24, 0.08)',
        '5': '0 32px 64px -12px rgba(11, 15, 24, 0.20)',
        'glow-magenta': '0 0 32px rgba(255, 20, 147, 0.35)',
        'glow-gold':    '0 0 24px rgba(201, 162, 74, 0.40)',
      },
      transitionTimingFunction: {
        'out-quart': 'cubic-bezier(0.25, 1, 0.5, 1)',
        'out-expo':  'cubic-bezier(0.16, 1, 0.3, 1)',
        'in-out-quart': 'cubic-bezier(0.76, 0, 0.24, 1)',
      },
      keyframes: {
        'shimmer':    { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        'float':      { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
        'pulse-glow': { '0%, 100%': { boxShadow: '0 0 0 0 rgba(255, 20, 147, 0.4)' }, '50%': { boxShadow: '0 0 0 12px rgba(255, 20, 147, 0)' } },
        'aurora-drift': { from: { backgroundPosition: '0% 50%' }, to: { backgroundPosition: '100% 50%' } },
        'reveal-up':  { from: { opacity: '0', transform: 'translateY(24px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
      animation: {
        shimmer: 'shimmer 2.5s linear infinite',
        float: 'float 4s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'aurora-drift': 'aurora-drift 22s ease-in-out infinite alternate',
        'reveal-up': 'reveal-up 600ms cubic-bezier(0.16, 1, 0.3, 1) both',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
