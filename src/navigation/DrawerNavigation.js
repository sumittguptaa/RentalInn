import { createDrawerNavigator } from '@react-navigation/drawer';
import BottomNavigation from './BottomNavigation';

import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

import DrawerContent from '../screens/pages/Drawer';
import Home from '../screens/Home';

const Drawer = createDrawerNavigator();

const DrawerStack = () => {
  return (
    <Drawer.Navigator
      drawerContent={props => <DrawerContent {...props} />}
      screenOptions={({ navigation }) => ({
        headerShown: false,
        drawerPosition: 'left',
        drawerType: 'front',
        drawerStyle: {
          backgroundColor: '#fff',
          width: '100%',
        },
        drawerActiveBackgroundColor: '#e0e0e0',
        drawerActiveTintColor: '#000',
        drawerInactiveTintColor: '#000',
        drawerLabelStyle: {
          marginLeft: -25,
          fontSize: 15,
        },
        drawerItemStyle: {
          marginVertical: 5,
        },
        drawerItemLabelStyle: {
          fontSize: 15,
          fontWeight: 'bold',
        },
        drawerIcon: ({ color }) => <Icon name="bars" size={20} color={color} />,
        headerStyle: {
          backgroundColor: '#f4511e',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Drawer.Screen name="BottomNavigation" component={BottomNavigation} />
      <Drawer.Screen name="Home" component={Home} />
    </Drawer.Navigator>
  );
};

export default DrawerStack;
