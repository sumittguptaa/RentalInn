import React, { useMemo } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform, Dimensions, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Screens
import Home from '../screens/Home';
import Rooms from '../screens/Rooms';
import Tenants from '../screens/Tenant';
import Tickets from '../screens/Tickets';

// Theme
import colors from '../theme/color';

const Tab = createBottomTabNavigator();
const { height: screenHeight } = Dimensions.get('window');

// Tab configuration for better maintainability
const TAB_CONFIG = [
  {
    name: 'Dashboard',
    component: Home,
    label: 'Dashboard',
    iconLibrary: MaterialCommunityIcons,
    focusedIcon: 'view-dashboard',
    unfocusedIcon: 'view-dashboard-outline',
  },
  {
    name: 'Rooms',
    component: Rooms,
    label: 'Rooms',
    iconLibrary: MaterialCommunityIcons,
    focusedIcon: 'door-open',
    unfocusedIcon: 'door-closed',
  },
  {
    name: 'Tenants',
    component: Tenants,
    label: 'Tenants',
    iconLibrary: Ionicons,
    focusedIcon: 'people',
    unfocusedIcon: 'people-outline',
  },
  {
    name: 'Tickets',
    component: Tickets,
    label: 'Tickets',
    iconLibrary: MaterialCommunityIcons,
    focusedIcon: 'ticket',
    unfocusedIcon: 'ticket-outline',
  },
];

const BottomNavigation = () => {
  // Memoize tab bar height for different screen sizes
  const tabBarHeight = useMemo(() => {
    const baseHeight = Platform.OS === 'ios' ? 85 : 65;

    // Adjust for smaller screens
    if (screenHeight < 700) {
      return baseHeight - 10;
    }

    return baseHeight;
  }, [screenHeight]);

  // Memoize screen options for performance
  const screenOptions = useMemo(
    () => ({
      headerShown: false,
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textSecondary || colors.light_gray,
      tabBarShowLabel: true,

      tabBarStyle: {
        display: 'flex',
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? 34 : 20,
        left: 20,
        right: 20,
        backgroundColor: colors.white,
        borderRadius: 25,
        height: tabBarHeight,
        paddingBottom: Platform.OS === 'ios' ? 20 : 10,
        paddingTop: 10,
        paddingHorizontal: 10,

        // Shadow for iOS
        shadowColor: colors.black,
        shadowOffset: {
          width: 0,
          height: 10,
        },
        shadowOpacity: 0.15,
        shadowRadius: 20,

        // Elevation for Android
        elevation: 10,

        // Border
        borderTopWidth: 0,
        borderWidth: 0,

        // Make it more prominent
        borderColor: 'transparent',
      },

      tabBarLabelStyle: {
        fontFamily: Platform.select({
          ios: 'System',
          android: 'Roboto-Medium',
          default: 'System',
        }),
        fontSize: 12,
        fontWeight: '600',
        marginTop: 4,
      },

      tabBarIconStyle: {
        marginBottom: -4,
      },

      // Tab press animation
      tabBarButton: props => (
        <TouchableOpacity
          {...props}
          activeOpacity={0.7}
          style={[
            props.style,
            {
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 8,
            },
          ]}
        />
      ),

      // Accessibility
      tabBarAccessibilityLabel: 'Main navigation tabs',
      tabBarRole: 'tablist',
    }),
    [tabBarHeight],
  );

  // Custom tab bar icon component for better performance
  const TabBarIcon = ({ focused, color, size, iconConfig }) => {
    const IconComponent = iconConfig.iconLibrary;
    const iconName = focused
      ? iconConfig.focusedIcon
      : iconConfig.unfocusedIcon;

    return (
      <IconComponent
        name={iconName}
        size={size}
        color={color}
        style={{
          marginBottom: Platform.OS === 'ios' ? -2 : 0,
        }}
      />
    );
  };

  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      screenOptions={screenOptions}
      // Tab bar options
      tabBarOptions={{
        keyboardHidesTabBar: true,
      }}
      // Back behavior
      backBehavior="history"
      // Screen listeners for analytics (optional)
      screenListeners={{
        tabPress: e => {
          // Optional: Add analytics tracking
          if (__DEV__) {
            console.log('Tab pressed:', e.target?.split('-')[0]);
          }
        },
      }}
    >
      {TAB_CONFIG.map(tab => (
        <Tab.Screen
          key={tab.name}
          name={tab.name}
          component={tab.component}
          options={{
            tabBarLabel: tab.label,
            tabBarIcon: ({ focused, color, size }) => (
              <TabBarIcon
                focused={focused}
                color={color}
                size={size}
                iconConfig={tab}
              />
            ),

            // Accessibility
            tabBarAccessibilityLabel: `${tab.label} tab`,
            tabBarTestID: `${tab.name.toLowerCase()}-tab`,

            // Badge configuration (if needed)
            tabBarBadgeStyle: {
              backgroundColor: colors.error || '#ff4444',
              color: colors.white,
              fontSize: 10,
              fontWeight: 'bold',
            },

            // Individual tab styling if needed
            tabBarItemStyle: {
              paddingVertical: 4,
            },
          }}
        />
      ))}
    </Tab.Navigator>
  );
};

export default BottomNavigation;
