export const theme = {
  colors: {
    primary: {
      main: '#4F46E5', // indigo-600
      hover: '#4338CA', // indigo-700
      light: '#EEF2FF', // indigo-50
    },
    text: {
      primary: '#111827', // gray-900
      secondary: '#6B7280', // gray-500
      white: '#FFFFFF',
    },
    background: {
      app: '#fff', // Main app background color
      main: '#FFFFFF',
      secondary: '#F9FAFB', // gray-50
      message: {
        ai: '#10B981', // emerald-500
        user: '#B77A4B', // main user's message color
        users: [
          '#886F51',
          '#AB8B58',
          '#8E7D6B',
          '#755540',
          '#796A5B',
          '#737373',
          '#84847C',
          '#767676'
      ],
      },
    },
    border: {
      light: '#E5E7EB', // gray-200
    },
    modal: {
      primary: '#B77A4B', // Warm brown matching user message color
      hover: '#A06A3F', // Darker brown for hover
      light: '#F5F0EB', // Light warm background
      danger: '#DC2626', // Red for delete actions
      dangerHover: '#B91C1C', // Darker red for hover
    },
  },
  spacing: {
    xs: '0.25rem', // 4px
    sm: '0.5rem', // 8px
    md: '1rem', // 16px
    lg: '1.5rem', // 24px
    xl: '2rem', // 32px
  },
  borderRadius: {
    sm: '0.375rem', // 6px
    md: '0.5rem', // 8px
    lg: '0.75rem', // 12px
    full: '9999px',
  },
  typography: {
    fontFamily: {
      sans: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      mono: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
    },
    fontSizes: {
      xs: '0.75rem', // 12px
      sm: '0.875rem', // 14px
      base: '1rem', // 16px
      lg: '1.125rem', // 18px
      xl: '1.25rem', // 20px
      '2xl': '1.5rem', // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem', // 36px
    },
    fontWeights: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },
    lineHeights: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    },
    letterSpacing: {
      tight: '-0.025em',
      normal: '0',
      wide: '0.025em',
    },
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  },
  transitions: {
    default: 'all 0.2s ease-in-out',
  },
  layout: {
    maxWidth: {
      message: '70%',
    },
  },
} as const;

export type Theme = typeof theme;

// Utility functions for font styling
export const getFontStyle = (size: keyof typeof theme.typography.fontSizes, weight: keyof typeof theme.typography.fontWeights = 'normal') => ({
  fontFamily: theme.typography.fontFamily.sans,
  fontSize: theme.typography.fontSizes[size],
  fontWeight: theme.typography.fontWeights[weight],
  lineHeight: theme.typography.lineHeights.normal,
});

export const getHeadingStyle = (level: 1 | 2 | 3 | 4 | 5 | 6) => {
  const styles = {
    1: { size: '4xl' as const, weight: 'bold' as const },
    2: { size: '3xl' as const, weight: 'bold' as const },
    3: { size: '2xl' as const, weight: 'semibold' as const },
    4: { size: 'xl' as const, weight: 'semibold' as const },
    5: { size: 'lg' as const, weight: 'medium' as const },
    6: { size: 'base' as const, weight: 'medium' as const },
  };
  
  const { size, weight } = styles[level];
  return getFontStyle(size, weight);
}; 