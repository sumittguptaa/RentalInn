import { Colors } from '../components/styles';

import Login from '../screens/Login';
import SignUp from '../screens/Signup';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CredentialsContext } from '../context/CredentialsContext';
import SplashScreen from '../components/SplashScreen';
import DrawerStack from './DrawerNavigation';
import { useContext, useEffect, useState } from 'react';
import RentDetails from '../screens/RentDetails';
import RoomDetails from '../screens/RoomDetails';
import TenantDetails from '../screens/TenantDetails';
import AddRoom from '../screens/AddRoom';
import AddTenant from '../screens/AddTenant';
import AddTicket from '../screens/AddTicket';
import colors from '../theme/color';
import Rooms from '../screens/Rooms';
import Home from '../screens/Home';

const Stack = createNativeStackNavigator();

const RootStack = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { credentials } = useContext(CredentialsContext);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          headerStyle: {
            backgroundColor: '#ffffff',
          },
          headerTintColor: colors.primary,
          headerTransparent: true,
          headerTitle: '',
          headerLeftContainerStyle: {
            paddingLeft: 20,
          },
        }}
        initialRouteName={credentials ? 'DrawerStack' : 'Login'}
      >
        {credentials ? (
          <>
            <Stack.Screen
              options={{ headerTintColor: colors.primary }}
              name="DrawerStack"
              component={DrawerStack}
            />

            <Stack.Screen
              options={{
                headerTintColor: colors.primary,
                headerShown: true,
                headerTitle: 'Settings',
                headerTitleAlign: 'center',
                headerStyle: {
                  backgroundColor: '#ffffff',
                },
                headerTitleStyle: {
                  fontSize: 18,
                  fontWeight: 'bold',
                  color: colors.primary,
                },
                headerLeftContainerStyle: {
                  paddingLeft: 20,
                },
                headerRightContainerStyle: {
                  paddingRight: 20,
                },
                headerShadowVisible: false,
                headerBackTitleVisible: false,
                headerBackButtonMenuEnabled: true,
                headerBackTitle: 'Back',
                headerBackButtonMenuVisible: true,
                headerBackButtonVisible: true,
                headerBackButtonPressColor: colors.primary,
                headerBackButtonPressOpacity: 0.8,
                headerBackButtonPressRippleColor: colors.primary,
                headerBackButtonPressRippleOpacity: 0.8,
                headerBackButtonPressRippleRadius: 20,
                headerBackButtonPressRippleColorAndroid: colors.primary,
              }}
              name="Settings"
              component={RentDetails}
            />

            <Stack.Screen
              options={{
                headerTintColor: colors.black,
                headerTitle: 'Room Details',
                headerTitleAlign: 'center',
                headerShown: true,
                headerBackButtonVisible: true,
                headerBackButtonPressColor: colors.primary,
                headerBackButtonPressOpacity: 0.8,
                headerBackButtonPressRippleColor: colors.primary,
                headerBackButtonPressRippleOpacity: 0.8,
                headerBackButtonPressRippleRadius: 20,
                headerBackButtonPressRippleColorAndroid: colors.primary,
              }}
              name="RoomDetails"
              component={RoomDetails}
            />

            <Stack.Screen
              name="AddRoom"
              component={AddRoom}
              options={{ title: 'Add Room' }}
            />

            <Stack.Screen
              name="AddTenant"
              component={AddTenant}
              options={{ title: 'Add Tenant' }}
            />

            <Stack.Screen
              name="AddTicket"
              component={AddTicket}
              options={{ title: 'Add Ticket' }}
            />

            <Stack.Screen
              options={{
                headerShown: true,
                headerTitle: 'Tenant Details',
                headerTintColor: colors.black,
                headerTitleAlign: 'center',
                headerBackButtonVisible: true,
                headerBackButtonPressColor: colors.primary,
                headerBackButtonPressOpacity: 0.8,
                headerBackButtonPressRippleColor: colors.primary,
                headerBackButtonPressRippleOpacity: 0.8,
                headerBackButtonPressRippleRadius: 20,
                headerBackButtonPressRippleColorAndroid: colors.primary,
              }}
              name="TenantDetails"
              component={TenantDetails}
            />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="SignUp" component={SignUp} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootStack;
