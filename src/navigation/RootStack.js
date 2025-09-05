import React, { useContext, useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, AppState } from 'react-native';

// Screens
import Login from '../screens/Login';
import SignUp from '../screens/Signup';
import SplashScreen from '../components/SplashScreen';
import DrawerStack from './DrawerNavigation';
import RentDetails from '../screens/RentDetails';
import RoomDetails from '../screens/RoomDetails';
import TenantDetails from '../screens/TenantDetails';
import AddRoom from '../screens/AddRoom';
import AddTenant from '../screens/AddTenant';
import AddTicket from '../screens/AddTicket';

// Context
import { CredentialsContext } from '../context/CredentialsContext';

// Theme
import colors from '../theme/color';
import { getOwnerDetails } from '../services/NetworkUtils';

// Constants
const SPLASH_SCREEN_DURATION = 2000;
const TOKEN_STORAGE_KEY = 'pgOwnerCredentials';
const USER_DATA_STORAGE_KEY = 'pgOwnerCredentials';

const Stack = createNativeStackNavigator();

const RootStack = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const { credentials, setCredentials } = useContext(CredentialsContext);

  // Default screen options for better consistency
  const defaultScreenOptions = {
    headerShown: false,
    headerStyle: {
      backgroundColor: colors.white,
    },
    headerTintColor: colors.primary,
    headerTransparent: false,
    headerLeftContainerStyle: {
      paddingLeft: 20,
    },
    headerRightContainerStyle: {
      paddingRight: 20,
    },
    headerTitleStyle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.primary,
    },
    headerShadowVisible: false,
    headerBackTitleVisible: false,
    animation: 'slide_from_right',
  };

  // Enhanced header options for authenticated screens
  const authenticatedScreenOptions = {
    ...defaultScreenOptions,
    headerShown: true,
    headerTitleAlign: 'center',
    headerBackButtonMenuEnabled: false,
    headerBackTitle: '',
    headerBackButtonVisible: true,
    headerPressColor: colors.primary,
    headerPressOpacity: 0.8,
  };

  // Validate token function
  const validateToken = async token => {
    try {
      // Replace with your actual token validation API call
      const response = await getOwnerDetails(token);

      if (response.ok) {
        const userData = await response.json();
        return { isValid: true, userData };
      }
      return { isValid: false, userData: null };
    } catch (error) {
      console.error('Token validation error:', error);
      return { isValid: false, userData: null };
    }
  };

  // Initialize app function
  const initializeApp = async () => {
    try {
      const storedToken = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);

      if (storedToken) {
        // Validate token with server
        const res = await validateToken(storedToken);

        const new_token = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);

        setIsTokenValid(true);
        setCredentials(JSON.parse(new_token));
      }
    } catch (error) {
      console.error('App initialization error:', error);
      // Handle error gracefully - show login screen
      setCredentials(null);
      setIsTokenValid(false);

      // Optional: Show error alert in development
      if (__DEV__) {
        Alert.alert(
          'Initialization Error',
          'Failed to initialize app. Please restart.',
        );
      }
    }
  };

  // Handle app state changes for token refresh
  useEffect(() => {
    const handleAppStateChange = nextAppState => {
      if (nextAppState === 'active' && credentials?.token) {
        // Re-validate token when app becomes active
        validateToken(credentials.token).then(({ isValid }) => {
          if (!isValid) {
            setCredentials(null);
            setIsTokenValid(false);
            AsyncStorage.multiRemove([
              TOKEN_STORAGE_KEY,
              USER_DATA_STORAGE_KEY,
            ]);
          }
        });
      }
    };

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );
    return () => subscription?.remove();
  }, [credentials?.token]);

  // App initialization effect
  useEffect(() => {
    const initApp = async () => {
      await initializeApp();

      // Ensure minimum splash screen duration for better UX
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, SPLASH_SCREEN_DURATION);

      return () => clearTimeout(timer);
    };

    initApp();
  }, []);

  // Show splash screen while loading
  if (isLoading) {
    return <SplashScreen />;
  }

  // Determine initial route based on authentication status
  const isAuthenticated = credentials && isTokenValid;

  // In your handleLogin function, after setCredentials:

  const initialRouteName = isAuthenticated ? 'DrawerStack' : 'Login';

  return (
    <NavigationContainer
      onStateChange={state => {
        // Optional: Log navigation state changes in development
        if (__DEV__) {
          console.log('Navigation state changed:', state);
        }
      }}
      onReady={() => {
        // Optional: Analytics or crash reporting initialization
        if (__DEV__) {
          console.log('Navigation container ready');
        }
      }}
    >
      <Stack.Navigator
        screenOptions={defaultScreenOptions}
        initialRouteName={initialRouteName}
      >
        {isAuthenticated ? (
          // Authenticated user screens
          <>
            <Stack.Screen
              name="DrawerStack"
              component={DrawerStack}
              options={{
                ...defaultScreenOptions,
                gestureEnabled: false, // Prevent swipe back on main screen
              }}
            />

            <Stack.Screen
              name="Settings"
              component={RentDetails}
              options={{
                ...authenticatedScreenOptions,
                headerTitle: 'Settings',
                headerTintColor: colors.primary,
              }}
            />

            <Stack.Screen
              name="RoomDetails"
              component={RoomDetails}
              options={{
                ...authenticatedScreenOptions,
                headerTitle: 'Room Details',
                headerTintColor: colors.black,
              }}
            />

            <Stack.Screen
              name="TenantDetails"
              component={TenantDetails}
              options={{
                ...authenticatedScreenOptions,
                headerTitle: 'Tenant Details',
                headerTintColor: colors.black,
              }}
            />

            <Stack.Group
              screenOptions={{
                ...authenticatedScreenOptions,
                presentation: 'modal',
                animation: 'slide_from_bottom',
              }}
            >
              <Stack.Screen
                name="AddRoom"
                component={AddRoom}
                options={{
                  headerTitle: 'Add Room',
                  headerLeft: () => null, // Remove back button for modal
                }}
              />

              <Stack.Screen
                name="AddTenant"
                component={AddTenant}
                options={{
                  headerTitle: 'Add Tenant',
                  headerLeft: () => null,
                }}
              />

              <Stack.Screen
                name="AddTicket"
                component={AddTicket}
                options={{
                  headerTitle: 'Add Ticket',
                  headerLeft: () => null,
                }}
              />
            </Stack.Group>
          </>
        ) : (
          // Unauthenticated user screens
          <Stack.Group
            screenOptions={{
              ...defaultScreenOptions,
              gestureEnabled: false, // Prevent swipe back on auth screens
              animation: 'fade',
            }}
          >
            <Stack.Screen
              name="Login"
              component={Login}
              options={{
                animationTypeForReplace: credentials ? 'pop' : 'push',
              }}
            />
            <Stack.Screen
              name="SignUp"
              component={SignUp}
              options={{
                animation: 'slide_from_right',
              }}
            />
          </Stack.Group>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootStack;
