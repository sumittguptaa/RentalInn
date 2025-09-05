// navigation/helpers.js

import { CommonActions, StackActions } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, API_ENDPOINTS, ERROR_MESSAGES } from './constants';

/**
 * Navigation helper functions for consistent navigation throughout the app
 */
export class NavigationHelper {
  static navigationRef = null;

  static setNavigationRef(ref) {
    NavigationHelper.navigationRef = ref;
  }

  static navigate(name, params = {}) {
    if (NavigationHelper.navigationRef?.isReady()) {
      NavigationHelper.navigationRef.navigate(name, params);
    }
  }

  static goBack() {
    if (NavigationHelper.navigationRef?.isReady()) {
      NavigationHelper.navigationRef.goBack();
    }
  }

  static reset(routeName, params = {}) {
    if (NavigationHelper.navigationRef?.isReady()) {
      NavigationHelper.navigationRef.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: routeName, params }],
        }),
      );
    }
  }

  static replace(routeName, params = {}) {
    if (NavigationHelper.navigationRef?.isReady()) {
      NavigationHelper.navigationRef.dispatch(
        StackActions.replace(routeName, params),
      );
    }
  }

  static popToTop() {
    if (NavigationHelper.navigationRef?.isReady()) {
      NavigationHelper.navigationRef.dispatch(StackActions.popToTop());
    }
  }
}

/**
 * Authentication helper functions
 */
export class AuthHelper {
  /**
   * Validate user token with the server
   * @param {string} token - User authentication token
   * @returns {Promise<{isValid: boolean, userData: object|null}>}
   */
  static async validateToken(token) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(API_ENDPOINTS.VALIDATE_TOKEN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const userData = await response.json();
        return { isValid: true, userData, error: null };
      } else if (response.status === 401) {
        return { isValid: false, userData: null, error: 'TOKEN_EXPIRED' };
      } else {
        return { isValid: false, userData: null, error: 'SERVER_ERROR' };
      }
    } catch (error) {
      console.error('Token validation error:', error);

      if (error.name === 'AbortError') {
        return { isValid: false, userData: null, error: 'TIMEOUT' };
      }

      return { isValid: false, userData: null, error: 'NETWORK_ERROR' };
    }
  }

  /**
   * Refresh expired token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<{success: boolean, tokens: object|null}>}
   */
  static async refreshToken(refreshToken) {
    try {
      const response = await fetch(API_ENDPOINTS.REFRESH_TOKEN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const tokens = await response.json();

        // Store new tokens
        await AsyncStorage.multiSet([
          [STORAGE_KEYS.USER_TOKEN, tokens.accessToken],
          [STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken],
        ]);

        return { success: true, tokens };
      }

      return { success: false, tokens: null };
    } catch (error) {
      console.error('Token refresh error:', error);
      return { success: false, tokens: null };
    }
  }

  /**
   * Logout user and clear all stored data
   * @param {string} token - User authentication token
   * @returns {Promise<boolean>}
   */
  static async logout(token) {
    try {
      // Call logout API (optional)
      if (token) {
        await fetch(API_ENDPOINTS.LOGOUT, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }

      // Clear all stored data
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.USER_TOKEN,
        STORAGE_KEYS.USER_DATA,
        STORAGE_KEYS.USER_PREFERENCES,
        STORAGE_KEYS.BIOMETRIC_ENABLED,
        STORAGE_KEYS.LAST_LOGIN,
      ]);

      return true;
    } catch (error) {
      console.error('Logout error:', error);

      // Still clear local storage even if API call fails
      try {
        await AsyncStorage.multiRemove([
          STORAGE_KEYS.USER_TOKEN,
          STORAGE_KEYS.USER_DATA,
          STORAGE_KEYS.USER_PREFERENCES,
        ]);
      } catch (clearError) {
        console.error('Failed to clear storage:', clearError);
      }

      return false;
    }
  }

  /**
   * Check if user session is still valid
   * @returns {Promise<boolean>}
   */
  static async isSessionValid() {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.USER_TOKEN);
      if (!token) return false;

      const { isValid } = await AuthHelper.validateToken(token);
      return isValid;
    } catch (error) {
      console.error('Session validation error:', error);
      return false;
    }
  }
}

/**
 * Storage helper functions
 */
export class StorageHelper {
  /**
   * Store user data securely
   * @param {object} userData - User data object
   * @param {string} token - Authentication token
   */
  static async storeUserData(userData, token) {
    try {
      const dataToStore = [
        [STORAGE_KEYS.USER_TOKEN, token],
        [STORAGE_KEYS.USER_DATA, JSON.stringify(userData)],
        [STORAGE_KEYS.LAST_LOGIN, new Date().toISOString()],
      ];

      await AsyncStorage.multiSet(dataToStore);
      return true;
    } catch (error) {
      console.error('Failed to store user data:', error);
      return false;
    }
  }

  /**
   * Retrieve user data from storage
   * @returns {Promise<{userData: object|null, token: string|null}>}
   */
  static async getUserData() {
    try {
      const [token, userDataString] = await AsyncStorage.multiGet([
        STORAGE_KEYS.USER_TOKEN,
        STORAGE_KEYS.USER_DATA,
      ]);

      const userData = userDataString[1] ? JSON.parse(userDataString[1]) : null;

      return {
        token: token[1],
        userData,
      };
    } catch (error) {
      console.error('Failed to retrieve user data:', error);
      return { token: null, userData: null };
    }
  }

  /**
   * Update user preferences
   * @param {object} preferences - User preferences object
   */
  static async updatePreferences(preferences) {
    try {
      const existingPrefs = await StorageHelper.getPreferences();
      const updatedPrefs = { ...existingPrefs, ...preferences };

      await AsyncStorage.setItem(
        STORAGE_KEYS.USER_PREFERENCES,
        JSON.stringify(updatedPrefs),
      );

      return true;
    } catch (error) {
      console.error('Failed to update preferences:', error);
      return false;
    }
  }

  /**
   * Get user preferences
   * @returns {Promise<object>}
   */
  static async getPreferences() {
    try {
      const preferences = await AsyncStorage.getItem(
        STORAGE_KEYS.USER_PREFERENCES,
      );
      return preferences ? JSON.parse(preferences) : {};
    } catch (error) {
      console.error('Failed to get preferences:', error);
      return {};
    }
  }
}

/**
 * Error handling helper functions
 */
export class ErrorHelper {
  static getErrorMessage(errorType, customMessage = null) {
    if (customMessage) return customMessage;

    return ERROR_MESSAGES[errorType] || ERROR_MESSAGES.SERVER_ERROR;
  }

  static handleAuthError(error, setCredentials) {
    switch (error) {
      case 'TOKEN_EXPIRED':
        setCredentials(null);
        NavigationHelper.reset('Login');
        return ERROR_MESSAGES.TOKEN_EXPIRED;

      case 'NETWORK_ERROR':
        return ERROR_MESSAGES.NETWORK_ERROR;

      case 'SERVER_ERROR':
        return ERROR_MESSAGES.SERVER_ERROR;

      default:
        return ERROR_MESSAGES.SERVER_ERROR;
    }
  }
}

/**
 * Performance optimization helpers
 */
export class PerformanceHelper {
  static debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  static throttle(func, limit) {
    let inThrottle;
    return function (...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  static memoize(fn) {
    const cache = new Map();
    return function (...args) {
      const key = JSON.stringify(args);
      if (cache.has(key)) {
        return cache.get(key);
      }
      const result = fn.apply(this, args);
      cache.set(key, result);
      return result;
    };
  }
}

/**
 * Network connectivity helper
 */
export class NetworkHelper {
  static async checkConnectivity() {
    try {
      const response = await fetch('https://www.google.com', {
        method: 'HEAD',
        timeout: 5000,
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  static async retryRequest(requestFunc, maxRetries = 3, delay = 1000) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        const result = await requestFunc();
        return { success: true, data: result };
      } catch (error) {
        if (i === maxRetries - 1) {
          return { success: false, error };
        }
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }
}

/**
 * Biometric authentication helper (if you plan to use it)
 */
export class BiometricHelper {
  static async isBiometricAvailable() {
    try {
      // You'll need to install react-native-biometrics or similar
      // const { available } = await TouchID.isSupported();
      // return available;
      return false; // Placeholder
    } catch (error) {
      console.error('Biometric availability check failed:', error);
      return false;
    }
  }

  static async authenticateWithBiometric() {
    try {
      // const biometricAuth = await TouchID.authenticate('Authenticate to access your account');
      // return biometricAuth;
      return false; // Placeholder
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      return false;
    }
  }
}

/**
 * Analytics helper for tracking user interactions
 */
export class AnalyticsHelper {
  static trackScreenView(screenName, params = {}) {
    if (__DEV__) {
      console.log('Screen View:', screenName, params);
      return;
    }

    // Integrate with your analytics service
    // Firebase Analytics, Mixpanel, etc.
    try {
      // analytics().logScreenView({
      //   screen_name: screenName,
      //   screen_class: screenName,
      //   ...params
      // });
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  }

  static trackEvent(eventName, properties = {}) {
    if (__DEV__) {
      console.log('Event:', eventName, properties);
      return;
    }

    try {
      // analytics().logEvent(eventName, properties);
    } catch (error) {
      console.error('Analytics event error:', error);
    }
  }

  static trackUserProperty(property, value) {
    if (__DEV__) {
      console.log('User Property:', property, value);
      return;
    }

    try {
      // analytics().setUserProperty(property, value);
    } catch (error) {
      console.error('Analytics user property error:', error);
    }
  }
}

/**
 * Deep linking helper
 */
export class DeepLinkHelper {
  static handleDeepLink(url, navigation) {
    try {
      const route = DeepLinkHelper.parseDeepLink(url);
      if (route) {
        navigation.navigate(route.screen, route.params);
        AnalyticsHelper.trackEvent('deep_link_opened', {
          url,
          screen: route.screen,
        });
      }
    } catch (error) {
      console.error('Deep link handling error:', error);
    }
  }

  static parseDeepLink(url) {
    // Parse your app's deep link structure
    // Example: rentalinn://room/123 -> { screen: 'RoomDetails', params: { roomId: '123' } }
    const urlParts = url.replace('rentalinn://', '').split('/');

    switch (urlParts[0]) {
      case 'room':
        return {
          screen: 'RoomDetails',
          params: { roomId: urlParts[1] },
        };
      case 'tenant':
        return {
          screen: 'TenantDetails',
          params: { tenantId: urlParts[1] },
        };
      case 'ticket':
        return {
          screen: 'TicketDetails',
          params: { ticketId: urlParts[1] },
        };
      default:
        return null;
    }
  }
}

/**
 * Notification helper
 */
export class NotificationHelper {
  static async requestPermission() {
    try {
      // const { status } = await Notifications.requestPermissionsAsync();
      // return status === 'granted';
      return false; // Placeholder
    } catch (error) {
      console.error('Notification permission request failed:', error);
      return false;
    }
  }

  static async scheduleLocalNotification(
    title,
    body,
    data = {},
    triggerTime = null,
  ) {
    try {
      // await Notifications.scheduleNotificationAsync({
      //   content: { title, body, data },
      //   trigger: triggerTime || null,
      // });
      return true;
    } catch (error) {
      console.error('Local notification scheduling failed:', error);
      return false;
    }
  }

  static async handleNotificationResponse(response, navigation) {
    try {
      const { data } = response.notification.request.content;

      if (data.screen) {
        navigation.navigate(data.screen, data.params || {});
        AnalyticsHelper.trackEvent('notification_opened', data);
      }
    } catch (error) {
      console.error('Notification response handling error:', error);
    }
  }
}

// Export all helpers
export default {
  NavigationHelper,
  AuthHelper,
  StorageHelper,
  ErrorHelper,
  PerformanceHelper,
  NetworkHelper,
  BiometricHelper,
  AnalyticsHelper,
  DeepLinkHelper,
  NotificationHelper,
};
