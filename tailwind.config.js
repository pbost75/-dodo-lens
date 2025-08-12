/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      // 🎨 Couleurs de l'écosystème Dodomove
      colors: {
        // Couleurs principales Dodomove
        'dodomove': {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6', // Bleu principal
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        'dodomove-orange': {
          50: '#fef7f0',
          100: '#feede1',
          200: '#fcd9c2',
          300: '#fab894',
          400: '#f79066',
          500: '#f47d6c', // Orange signature
          600: '#e55a47',
          700: '#d1442a',
          800: '#b83621',
          900: '#9f2f1e',
        },
        // Couleurs système
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      
      // 📝 Typographie cohérente avec l'écosystème
      fontFamily: {
        'roboto-slab': ['var(--font-roboto-slab)', 'serif'],
        'lato': ['var(--font-lato)', 'sans-serif'],
        'sans': ['var(--font-lato)', 'system-ui', 'sans-serif'],
        'serif': ['var(--font-roboto-slab)', 'Georgia', 'serif'],
      },
      
      // 🎭 Animations pour la vidéo
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-subtle': 'bounce 2s infinite',
        'recording': 'recording 1.5s ease-in-out infinite',
        'processing': 'processing 2s linear infinite',
        'fade-in': 'fade-in 0.5s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
        'boat-float': 'boat-float 3s ease-in-out infinite',
        'gradient-x': 'gradient-x 15s ease infinite',
        'shimmer': 'shimmer 2s linear infinite',
        // shadcn/ui animations
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
      
      // 🎬 Keyframes personnalisées
      keyframes: {
        recording: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.7', transform: 'scale(1.05)' },
        },
        processing: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        'boat-float': {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-10px) rotate(1deg)' },
        },
        'gradient-x': {
          '0%, 100%': { 'background-size': '200% 200%', 'background-position': 'left center' },
          '50%': { 'background-size': '200% 200%', 'background-position': 'right center' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        // shadcn/ui keyframes
        'accordion-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: 0 },
        },
      },
      
      // 📱 Breakpoints adaptés au mobile
      screens: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
        // Breakpoints spéciaux pour vidéo
        'video-sm': '480px',
        'video-md': '768px',
        'landscape': { 'raw': '(orientation: landscape)' },
        'portrait': { 'raw': '(orientation: portrait)' },
      },
      
      // 🎨 Spacing pour les interfaces vidéo
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
        'video-controls': '4rem',
        'safe-area-top': 'env(safe-area-inset-top)',
        'safe-area-bottom': 'env(safe-area-inset-bottom)',
      },
      
      // 📐 Tailles spéciales pour la vidéo
      height: {
        'screen-safe': 'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))',
        'video-preview': '60vh',
        'video-controls': '10vh',
      },
      
      // 🎭 Effets visuels
      backdropBlur: {
        'xs': '2px',
      },
      
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      
      // 🌈 Gradients personnalisés
      backgroundImage: {
        'gradient-dodomove': 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
        'gradient-orange': 'linear-gradient(135deg, #f47d6c 0%, #e55a47 100%)',
        'gradient-video': 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.7) 100%)',
        'shimmer-gradient': 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
      },
      
      // 📦 Box shadows
      boxShadow: {
        'video': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'recording': '0 0 0 4px rgba(239, 68, 68, 0.2), 0 0 0 8px rgba(239, 68, 68, 0.1)',
        'processing': '0 10px 40px rgba(59, 130, 246, 0.3)',
      },
      
      // 🎯 Aspect ratios pour vidéo
      aspectRatio: {
        'video': '16 / 9',
        'video-vertical': '9 / 16',
        'square': '1 / 1',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    
    // Plugin personnalisé pour les utilitaires vidéo
    function({ addUtilities, theme }) {
      const videoUtilities = {
        '.video-container': {
          position: 'relative',
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          borderRadius: theme('borderRadius.lg'),
        },
        '.video-overlay': {
          position: 'absolute',
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 100%)',
          pointerEvents: 'none',
        },
        '.recording-indicator': {
          animation: 'recording 1.5s ease-in-out infinite',
          background: theme('colors.red.500'),
          borderRadius: '50%',
        },
        '.glass': {
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        },
        '.glass-dark': {
          background: 'rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
      };
      
      addUtilities(videoUtilities);
    },
  ],
};
