import React from 'react';
import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import AppThemeWrapper from './src/context/AppThemeWrapper';
import { ThemeProvider } from './src/context/ThemeContext'; // Make sure this path is right
import { CredentialsProvider } from './src/context/CredentialsContext';
import RootStack from './src/navigation/RootStack';
import { name as appName } from './app.json';

const App = () => {
  return (
    <ThemeProvider>
      <CredentialsProvider>
        <AppThemeWrapper>
          <RootStack />
        </AppThemeWrapper>
      </CredentialsProvider>
    </ThemeProvider>
  );
};

AppRegistry.registerComponent(appName, () => App);
export default App;
