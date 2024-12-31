module.exports = {
  // ... other config
  theme: {
    extend: {
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        }
      },
      animation: {
        slideUp: 'slideUp 0.3s ease-out'
      }
    }
  }
}; 