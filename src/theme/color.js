const colors = {
  // Brand
  primary: '#ee7b11',
  secondary: '#effbff',
  accent: '#2753c9',

  // Backgrounds
  backgroundLight: '#f9f9fb',
  backgroundDark: '#081738',
  background: '#f9f9fb', // ✅ default background alias

  // Surface
  surfaceLight: '#FFFFFF',
  surfaceDark: '#000f30',

  // Text
  textPrimary: '#141414',
  textSecondary: '#102d47',
  textDarkPrimary: '#FFFFFF',
  textDarkSecondary: '#aec8df',

  // Feedback
  success: '#37a05b',
  error: '#ee7b11',
  warning: '#ee7b11',
  info: '#2753c9',

  // Neutrals
  white: '#FFFFFF',
  black: '#141414',
  light_black: '#102d47',
  light_gray: '#f1f1f5',
  dark_gray: '#192a4a',

  // Theme specific colors
  cream: '#fff4ce',
  darkCream: '#ffdfaf',
  smokeGray: '#f1f1f5',
  lightYellow: '#ffd44d',
  skyMistBlue: '#aec8df',
  borderColor: '#224767',
  darkBorderColor: '#192a4a',
  blue: '#1642b9',

  // Extras
  onPrimary: '#FFFFFF',
  onBackground: '#141414',
  onSurface: '#141414',
  onBackgroundDark: '#FFFFFF',
  onSurfaceDark: '#FFFFFF',

  // Card shadows
  cardShadowLight: 'rgba(17, 17, 26, 0.05)',
  cardShadowDark: 'rgba(17, 17, 26, 0.3)',
};

export default colors;

export const fadedColorOpacity = 0.5;

export const getNameForColor = ({ textColor }) => {
  if (textColor === thresholdColor?.red?.textColor) {
    return 'default_red';
  }
  if (textColor === thresholdColor?.green?.textColor) {
    return 'default_green';
  }
  if (textColor === thresholdColor?.orange?.textColor) {
    return 'default_orange';
  }
  return 'default_gray';
};

export function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  if (alpha > 0) {
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  return `rgb(${r}, ${g}, ${b})`;
}

export const typeThresholdText =
  'MODERATE' |
  'NEEDS ATTENTION' |
  'OPTIMAL' |
  'Needs Attention' |
  'Moderate' |
  'Optimal';

export const typedefault = 'default' | 'locked';

export const thresholdColor = {
  red: { color: '#FFCFCF', textColor: '#ad0000' },
  orange: { color: '#FFF6D1', textColor: '#ee7b11' },
  green: { color: '#CFFFD4', textColor: '#37a05b' },
  invalid: { color: '#fff', textColor: '#222' },
};

export const colorMap = {
  primary: '#ee7b11',
  secondary: '#effbff',
  accent: '#2753c9',
  black: '#141414',
  white: '#ffffff',
  neutral_darker: '#102d47',
  neutral: '#f1f1f5',
  neutral_faded: '#aec8df',
  cream: '#fff4ce',
  darkCream: '#ffdfaf',
  lightYellow: '#ffd44d',
  skyMistBlue: '#aec8df',
  blue: '#1642b9',
  success: '#37a05b',
  warning: '#ee7b11',
  info: '#2753c9',
};

export const colorNames =
  'primary' |
  'secondary' |
  'accent' |
  'black' |
  'white' |
  'neutral' |
  'neutral_faded' |
  'neutral_darker' |
  'cream' |
  'darkCream' |
  'lightYellow' |
  'skyMistBlue' |
  'blue' |
  'success' |
  'warning' |
  'info';

export const colorVals =
  '#ee7b11' |
  '#effbff' |
  '#2753c9' |
  '#141414' |
  '#ffffff' |
  '#f1f1f5' |
  '#aec8df' |
  '#102d47' |
  '#fff4ce' |
  '#ffdfaf' |
  '#ffd44d' |
  '#aec8df' |
  '#1642b9' |
  '#37a05b' |
  '#ee7b11' |
  '#2753c9';

export const getColor = color => {
  return colorMap[color];
};

export const typeThresholdColorKey = 'red' | 'orange' | 'green' | 'invalid';
