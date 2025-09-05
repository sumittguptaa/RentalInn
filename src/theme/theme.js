import {
  MD3LightTheme,
  MD3DarkTheme,
  configureFonts,
} from 'react-native-paper';
import colors from './color';

const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#ee7b11',
    onPrimary: '#FFFFFF',
    secondary: '#effbff',
    onSecondary: '#141414',
    accent: '#2753c9',
    background: '#f9f9fb',
    onBackground: '#141414',
    surface: '#FFFFFF',
    onSurface: '#141414',
    error: '#ee7b11',
    onError: '#FFFFFF',
    success: '#37a05b',
    warning: '#ee7b11',
    info: '#2753c9',
    textPrimary: '#141414',
    textSecondary: '#102d47',
    white: '#FFFFFF',
    black: '#141414',
    light_black: '#102d47',
    light_gray: '#f1f1f5',
    cream: '#fff4ce',
    darkCream: '#ffdfaf',
    smokeGray: '#f1f1f5',
    lightYellow: '#ffd44d',
    skyMistBlue: '#aec8df',
    borderColor: '#224767',
    blue: '#1642b9',
    cardShadow: 'rgba(17, 17, 26, 0.05)',
  },
  fonts: configureFonts({
    default: {
      regular: {
        fontFamily: 'Poppins-Regular',
        fontWeight: 'normal',
      },
      medium: {
        fontFamily: 'Poppins-Medium',
        fontWeight: 'normal',
      },
      light: {
        fontFamily: 'Poppins-Light',
        fontWeight: 'normal',
      },
      thin: {
        fontFamily: 'Poppins-Thin',
        fontWeight: 'normal',
      },
    },
  }),
  roundness: 2,
  animation: {
    scale: 1.0,
  },
  dark: false,
  mode: 'adaptive',
};

const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#ee7b11',
    onPrimary: '#FFFFFF',
    secondary: '#001c68',
    onSecondary: '#FFFFFF',
    accent: '#2753c9',
    background: '#081738',
    onBackground: '#FFFFFF',
    surface: '#000f30',
    onSurface: '#FFFFFF',
    error: '#ee7b11',
    onError: '#FFFFFF',
    success: '#37a05b',
    warning: '#ee7b11',
    info: '#2753c9',
    textPrimary: '#FFFFFF',
    textSecondary: '#aec8df',
    white: '#FFFFFF',
    black: '#141414',
    light_black: '#102d47',
    light_gray: '#192a4a',
    cream: '#fff4ce',
    darkCream: '#ffdfaf',
    smokeGray: '#192a4a',
    lightYellow: '#ffd44d',
    skyMistBlue: '#aec8df',
    borderColor: '#192a4a',
    blue: '#1642b9',
    cardShadow: 'rgba(17, 17, 26, 0.3)',
  },
  fonts: configureFonts({
    default: {
      regular: {
        fontFamily: 'Poppins-Regular',
        fontWeight: 'normal',
      },
      medium: {
        fontFamily: 'Poppins-Medium',
        fontWeight: 'normal',
      },
      light: {
        fontFamily: 'Poppins-Light',
        fontWeight: 'normal',
      },
      thin: {
        fontFamily: 'Poppins-Thin',
        fontWeight: 'normal',
      },
    },
  }),
  roundness: 2,
  animation: {
    scale: 1.0,
  },
  dark: true,
  mode: 'adaptive',
};

export { lightTheme, darkTheme };
