// navigation/constants.js

// Screen names for consistent navigation
export const SCREEN_NAMES = {
  // Auth screens
  LOGIN: 'Login',
  SIGNUP: 'SignUp',

  // Main navigation
  DRAWER_STACK: 'DrawerStack',
  BOTTOM_NAVIGATION: 'BottomNavigation',

  // Bottom tab screens
  DASHBOARD: 'Dashboard',
  ROOMS: 'Rooms',
  TENANTS: 'Tenants',
  TICKETS: 'Tickets',

  // Detail screens
  ROOM_DETAILS: 'RoomDetails',
  TENANT_DETAILS: 'TenantDetails',
  SETTINGS: 'Settings',

  // Modal screens
  ADD_ROOM: 'AddRoom',
  ADD_TENANT: 'AddTenant',
  ADD_TICKET: 'AddTicket',

  // Profile screens
  PROFILE: 'Profile',
  EDIT_PROFILE: 'EditProfile',
};

// Route parameters type definitions (for TypeScript projects)
export const ROUTE_PARAMS = {
  [SCREEN_NAMES.ROOM_DETAILS]: {
    roomId: 'string',
    roomData: 'object',
  },
  [SCREEN_NAMES.TENANT_DETAILS]: {
    tenantId: 'string',
    tenantData: 'object',
  },
  [SCREEN_NAMES.ADD_ROOM]: {
    editMode: 'boolean',
    roomData: 'object',
  },
};

// Storage keys for consistent data management
export const STORAGE_KEYS = {
  USER_TOKEN: 'userToken',
  USER_DATA: 'userData',
  USER_PREFERENCES: 'userPreferences',
  THEME_MODE: 'themeMode',
  BIOMETRIC_ENABLED: 'biometricEnabled',
  NOTIFICATIONS_ENABLED: 'notificationsEnabled',
  LAST_LOGIN: 'lastLogin',
  APP_VERSION: 'appVersion',
};

// API endpoints (replace with your actual endpoints)
export const API_ENDPOINTS = {
  VALIDATE_TOKEN: '/auth/validate-token',
  REFRESH_TOKEN: '/auth/refresh-token',
  LOGOUT: '/auth/logout',
  USER_PROFILE: '/user/profile',
  UPDATE_PROFILE: '/user/profile/update',
};

// Menu items configuration for drawer
export const menuItems = [
  {
    label: 'Dashboard',
    icon: 'home-outline',
    route: SCREEN_NAMES.DASHBOARD,
  },
  {
    label: 'Property Management',
    icon: 'business-outline',
    children: [
      {
        label: 'All Rooms',
        route: SCREEN_NAMES.ROOMS,
        badge: null,
      },
      {
        label: 'Add New Room',
        route: SCREEN_NAMES.ADD_ROOM,
        params: { editMode: false },
      },
      {
        label: 'Room Analytics',
        route: 'RoomAnalytics',
      },
    ],
  },
  {
    label: 'Tenant Management',
    icon: 'people-outline',
    children: [
      {
        label: 'All Tenants',
        route: SCREEN_NAMES.TENANTS,
      },
      {
        label: 'Add New Tenant',
        route: SCREEN_NAMES.ADD_TENANT,
        params: { editMode: false },
      },
      {
        label: 'Tenant History',
        route: 'TenantHistory',
      },
    ],
  },
  {
    label: 'Support & Maintenance',
    icon: 'construct-outline',
    children: [
      {
        label: 'All Tickets',
        route: SCREEN_NAMES.TICKETS,
        badge: 2, // Dynamic badge for pending tickets
      },
      {
        label: 'Create Ticket',
        route: SCREEN_NAMES.ADD_TICKET,
      },
      {
        label: 'Maintenance Schedule',
        route: 'MaintenanceSchedule',
      },
    ],
  },
  {
    label: 'Financial Reports',
    icon: 'analytics-outline',
    children: [
      {
        label: 'Revenue Overview',
        route: 'RevenueOverview',
      },
      {
        label: 'Expense Tracking',
        route: 'ExpenseTracking',
      },
      {
        label: 'Payment History',
        route: 'PaymentHistory',
      },
    ],
  },
  {
    label: 'Settings',
    icon: 'settings-outline',
    route: SCREEN_NAMES.SETTINGS,
  },
  {
    label: 'Help & Support',
    icon: 'help-circle-outline',
    children: [
      {
        label: 'FAQ',
        route: 'FAQ',
      },
      {
        label: 'Contact Support',
        route: 'ContactSupport',
      },
      {
        label: 'App Tutorial',
        route: 'AppTutorial',
      },
    ],
  },
];

// Animation configurations
export const ANIMATION_CONFIG = {
  SPLASH_DURATION: 2000,
  TRANSITION_DURATION: 300,
  SPRING_CONFIG: {
    tension: 50,
    friction: 7,
  },
  TIMING_CONFIG: {
    duration: 300,
    useNativeDriver: true,
  },
};

// Navigation options presets
export const NAVIGATION_OPTIONS = {
  DEFAULT: {
    headerShown: false,
    animation: 'slide_from_right',
    gestureEnabled: true,
  },
  MODAL: {
    presentation: 'modal',
    animation: 'slide_from_bottom',
    gestureEnabled: true,
    headerShown: true,
  },
  NO_GESTURE: {
    gestureEnabled: false,
    headerShown: false,
  },
  TRANSPARENT: {
    headerTransparent: true,
    headerShown: true,
  },
};

// App configuration
export const APP_CONFIG = {
  NAME: 'RentalInn',
  VERSION: '1.0.0',
  MIN_SUPPORTED_VERSION: '1.0.0',
  API_TIMEOUT: 10000,
  MAX_RETRY_ATTEMPTS: 3,
  OFFLINE_SUPPORT: true,
};

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Please check your internet connection and try again.',
  INVALID_CREDENTIALS: 'Invalid email or password. Please try again.',
  TOKEN_EXPIRED: 'Your session has expired. Please login again.',
  SERVER_ERROR: 'Something went wrong. Please try again later.',
  VALIDATION_ERROR: 'Please fill in all required fields correctly.',
  PERMISSION_DENIED: 'You do not have permission to perform this action.',
};

// Success messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Welcome back!',
  LOGOUT_SUCCESS: 'You have been logged out successfully.',
  PROFILE_UPDATED: 'Profile updated successfully.',
  DATA_SAVED: 'Data saved successfully.',
  EMAIL_SENT: 'Email sent successfully.',
};

export default {
  SCREEN_NAMES,
  ROUTE_PARAMS,
  STORAGE_KEYS,
  API_ENDPOINTS,
  menuItems,
  ANIMATION_CONFIG,
  NAVIGATION_OPTIONS,
  APP_CONFIG,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
};
