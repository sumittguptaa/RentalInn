import { Platform, StyleSheet } from 'react-native';
import { getColor } from './color';

export const screenPadding = 16;
export const totalHorizontalPadding = screenPadding * 2;
export const cardPadding = 16;

export const roundnessToSizeMap = {
  full: 100,
  xl: 32,
  lg: 24,
  md: 16,
  sm: 12,
  xs: 8,
};

export const standardBorderRadius = 8;

/**
 * cardShadow
 * Dynamically adapts based on theme mode (light/dark).
 * Uses the new color scheme with improved shadow values.
 * @param {boolean} isDark - true if dark mode
 */
export const cardShadow = (isDark = false) =>
  StyleSheet.create({
    shadow: {
      ...Platform.select({
        ios: {
          shadowColor: isDark ? '#FFFFFF' : '#141414',
          shadowOffset: { width: 0, height: isDark ? 4 : 2 },
          shadowOpacity: isDark ? 0.3 : 0.05,
          shadowRadius: isDark ? 8 : 16,
          zIndex: 0,
        },
        android: {
          shadowColor: isDark ? '#FFFFFF' : '#141414',
          elevation: isDark ? 4 : 8,
          shadowOffset: { width: 0, height: isDark ? 6 : 4 },
          shadowOpacity: isDark ? 0.3 : 0.05,
          shadowRadius: isDark ? 8 : 16,
          zIndex: 0,
        },
      }),
    },
  });

/**
 * Enhanced card shadow with multiple levels
 * @param {boolean} isDark - true if dark mode
 * @param {'small'|'medium'|'large'} size - shadow size
 */
export const enhancedCardShadow = (isDark = false, size = 'medium') => {
  const shadowConfig = {
    small: {
      ios: {
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: isDark ? 0.2 : 0.03,
        shadowRadius: isDark ? 4 : 8,
      },
      android: {
        elevation: isDark ? 2 : 4,
        shadowOffset: { width: 0, height: 2 },
      },
    },
    medium: {
      ios: {
        shadowOffset: { width: 0, height: isDark ? 4 : 2 },
        shadowOpacity: isDark ? 0.3 : 0.05,
        shadowRadius: isDark ? 8 : 16,
      },
      android: {
        elevation: isDark ? 4 : 8,
        shadowOffset: { width: 0, height: isDark ? 6 : 4 },
      },
    },
    large: {
      ios: {
        shadowOffset: { width: 0, height: isDark ? 8 : 4 },
        shadowOpacity: isDark ? 0.4 : 0.1,
        shadowRadius: isDark ? 12 : 24,
      },
      android: {
        elevation: isDark ? 8 : 16,
        shadowOffset: { width: 0, height: isDark ? 10 : 8 },
      },
    },
  };

  return StyleSheet.create({
    shadow: {
      ...Platform.select({
        ios: {
          shadowColor: isDark ? '#FFFFFF' : '#141414',
          ...shadowConfig[size].ios,
          zIndex: 0,
        },
        android: {
          shadowColor: isDark ? '#FFFFFF' : '#141414',
          ...shadowConfig[size].android,
          shadowOpacity: isDark ? 0.3 : 0.05,
          shadowRadius: isDark ? 8 : 16,
          zIndex: 0,
        },
      }),
    },
  });
};

/**
 * Border styles for consistent theming
 */
export const borderStyles = {
  light: {
    borderColor: getColor('neutral'),
    borderWidth: 1,
  },
  dark: {
    borderColor: getColor('neutral_darker'),
    borderWidth: 1,
  },
  primary: {
    borderColor: getColor('primary'),
    borderWidth: 1,
  },
  accent: {
    borderColor: getColor('accent'),
    borderWidth: 1,
  },
};

/**
 * Text shadow for better readability
 */
export const textShadow = (isDark = false) => ({
  textShadowColor: isDark ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.5)',
  textShadowOffset: { width: 0, height: 1 },
  textShadowRadius: 2,
});

/**
 * Common spacing values
 */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

/**
 * Common font sizes
 */
export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};
