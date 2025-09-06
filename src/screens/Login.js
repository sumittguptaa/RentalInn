import React, { useState, useContext, useEffect, useCallback } from 'react';
import {
  StatusBar,
  Dimensions,
  View,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { Button, TextInput, Snackbar, Card } from 'react-native-paper';
import { Image, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Contexts
import { CredentialsContext } from '../context/CredentialsContext';
import { ThemeContext } from '../context/ThemeContext';

// Components
import KeyBoardAvoidingWrapper from '../components/KeyBoardAvoidingWrapper';
import StandardText from '../components/StandardText/StandardText';

// Services and utilities
import { handleUserLogin } from '../services/NetworkUtils';
import helpers from '../navigation/helpers';

const { StorageHelper, PerformanceHelper } = helpers;

import {
  STORAGE_KEYS,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
} from '../navigation/constants';

// Theme
import colors from '../theme/color';

const Login = ({ navigation }) => {
  // State management
  const [hidePassword, setHidePassword] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // Contexts
  const { setCredentials } = useContext(CredentialsContext);
  const { theme: mode } = useContext(ThemeContext);

  // Theme variables
  const isDark = mode === 'dark';
  const backgroundColor = isDark
    ? colors.backgroundDark
    : colors.backgroundLight;
  const cardBackground = isDark ? colors.light_black : colors.white;
  const textPrimary = isDark ? colors.white : colors.textPrimary;
  const textSecondary = isDark ? colors.light_gray : colors.textSecondary;
  const onPrimary = colors.white;
  const primary = colors.primary;

  // Load saved credentials on component mount
  useEffect(() => {
    const loadSavedCredentials = async () => {
      try {
        const savedEmail = await AsyncStorage.getItem('savedEmail');
        const savedRememberMe = await AsyncStorage.getItem('rememberMe');

        if (savedEmail && savedRememberMe === 'true') {
          setEmail(savedEmail);
          setRememberMe(true);
        }
      } catch (error) {
        console.error('Error loading saved credentials:', error);
      }
    };

    loadSavedCredentials();
  }, []);

  // Validate email format
  const validateEmail = useCallback(email => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, []);

  // Debounced error clearing
  const clearErrorMessage = PerformanceHelper.debounce(
    () => setErrorMessage(''),
    5000,
  );

  // Handle form validation
  const validateForm = useCallback(() => {
    if (!email || !password) {
      setErrorMessage(
        ERROR_MESSAGES.VALIDATION_ERROR ||
          'Please enter both email and password.',
      );
      clearErrorMessage();
      return false;
    }

    if (!validateEmail(email)) {
      setErrorMessage('Please enter a valid email address.');
      clearErrorMessage();
      return false;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      clearErrorMessage();
      return false;
    }

    return true;
  }, [email, password, validateEmail, clearErrorMessage]);

  // Handle login process
  const handleLogin = useCallback(async () => {
    if (!validateForm()) return;

    setLoading(true);
    setErrorMessage('');

    try {
      // Track login attempt

      // Call login API
      const response = await handleUserLogin({ email, password });

      // Check if login was successful
      if (!response.success) {
        throw new Error(response.error || 'Login failed');
      }

      // Extract data from API response
      const { user, accessToken, refreshToken } = response.data || {};

      // Validate required fields
      if (!user || !accessToken) {
        throw new Error('Invalid login response: missing user data or token');
      }

      // Store user data securely
      const storageResult = await StorageHelper.storeUserData(
        user,
        accessToken,
        refreshToken,
      );

      if (!storageResult.success) {
        throw new Error(storageResult.error || 'Failed to store user data');
      }

      // Store refresh token if available (Note: already handled in storeUserData, but keeping for extra security)
      if (refreshToken) {
        await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      }

      // Handle remember me functionality
      if (rememberMe) {
        await AsyncStorage.multiSet([
          ['savedEmail', email],
          ['rememberMe', 'true'],
        ]);
      } else {
        await AsyncStorage.multiRemove(['savedEmail', 'rememberMe']);
      }

      // Update credentials context with required email field and both token formats for compatibility
      const credentialsToSet = {
        ...user,
        email: user.email || email, // Ensure email is present for CredentialsContext
        token: accessToken, // For internal storage/helpers
        accessToken: accessToken, // For API calls that expect accessToken
      };

      await setCredentials(credentialsToSet);

      // Optional: Show success message briefly
      setErrorMessage('');

      // Navigation will be handled automatically by RootStack
    } catch (error) {
      console.error('Login Error:', error);

      // Handle different error types
      let errorMsg = ERROR_MESSAGES.INVALID_CREDENTIALS;

      if (
        error.message?.includes('network') ||
        error.message?.includes('Network')
      ) {
        errorMsg = ERROR_MESSAGES.NETWORK_ERROR;
      } else if (error.message?.includes('server') || error.status >= 500) {
        errorMsg = ERROR_MESSAGES.SERVER_ERROR;
      } else if (error.status === 401) {
        errorMsg = ERROR_MESSAGES.INVALID_CREDENTIALS;
      }

      setErrorMessage(errorMsg);
      clearErrorMessage();

      // Optional: Show alert for critical errors
      if (error.message?.includes('server')) {
        Alert.alert(
          'Login Failed',
          'Server error occurred. Please try again later.',
          [{ text: 'OK' }],
        );
      }
    } finally {
      setLoading(false);
    }
  }, [
    email,
    password,
    rememberMe,
    validateForm,
    setCredentials,
    clearErrorMessage,
  ]);

  // Handle navigation to SignUp
  const handleSignUpNavigation = useCallback(() => {
    navigation.navigate('SignUp');
  }, [navigation]);

  // Handle forgot password (if you have this feature)
  const handleForgotPassword = useCallback(() => {
    // Navigate to forgot password screen or show modal
    Alert.alert(
      'Forgot Password',
      'Please contact support to reset your password.',
      [{ text: 'OK' }],
    );
  }, []);

  // Keyboard event handlers
  const handleEmailSubmit = useCallback(() => {
    // Focus password field when email is submitted
  }, []);

  const handlePasswordSubmit = useCallback(() => {
    if (!loading) {
      handleLogin();
    }
  }, [handleLogin, loading]);

  return (
    <KeyBoardAvoidingWrapper>
      <View style={[styles.container, { backgroundColor }]}>
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={backgroundColor}
          translucent={Platform.OS === 'android'}
        />

        {/* Header Section */}
        <View
          style={[
            styles.headerSection,
            {
              backgroundColor: primary,
              height: Dimensions.get('window').height * 0.4,
            },
          ]}
        >
          <Image
            source={require('../assets/rentalinn-without-bg.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <StandardText
            fontWeight="bold"
            style={styles.headerTitle}
            color="default_white"
          >
            Welcome Back
          </StandardText>
          <StandardText style={[styles.headerSubtitle, { color: onPrimary }]}>
            Enter your credentials to access your account
          </StandardText>
        </View>

        {/* Login Form Section */}
        <View style={styles.formContainer}>
          <Card style={[styles.card, { backgroundColor: cardBackground }]}>
            {/* Email Input */}
            <TextInput
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              mode="outlined"
              left={<TextInput.Icon icon="email" />}
              onSubmitEditing={handleEmailSubmit}
              returnKeyType="next"
              error={errorMessage.includes('email')}
              theme={{
                colors: {
                  text: textPrimary,
                  placeholder: textSecondary,
                  primary: primary,
                  background: cardBackground,
                  outline: errorMessage.includes('email')
                    ? colors.error
                    : textSecondary,
                },
                fonts: {
                  regular: 'Metropolis-Regular',
                  medium: 'Metropolis-Medium',
                  labelLarge: 'Metropolis-Regular',
                },
              }}
              style={styles.input}
              contentStyle={styles.inputContent}
            />

            {/* Password Input */}
            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={hidePassword}
              mode="outlined"
              left={<TextInput.Icon icon="lock" />}
              right={
                <TextInput.Icon
                  icon={hidePassword ? 'eye-off' : 'eye'}
                  onPress={() => setHidePassword(!hidePassword)}
                />
              }
              onSubmitEditing={handlePasswordSubmit}
              returnKeyType="go"
              error={errorMessage.includes('password')}
              theme={{
                colors: {
                  text: textPrimary,
                  placeholder: textSecondary,
                  primary: primary,
                  background: cardBackground,
                  outline: errorMessage.includes('password')
                    ? colors.error
                    : textSecondary,
                },
                fonts: {
                  regular: 'Metropolis-Regular',
                  medium: 'Metropolis-Medium',
                  labelLarge: 'Metropolis-Regular',
                },
              }}
              style={styles.input}
              contentStyle={styles.inputContent}
            />

            {/* Remember Me Checkbox */}
            <View style={styles.rememberMeContainer}>
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => setRememberMe(!rememberMe)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.checkbox,
                    {
                      backgroundColor: rememberMe ? primary : 'transparent',
                      borderColor: primary,
                    },
                  ]}
                >
                  {rememberMe && (
                    <StandardText style={styles.checkmark}>✓</StandardText>
                  )}
                </View>
                <StandardText
                  style={[styles.rememberMeText, { color: textPrimary }]}
                >
                  Remember me
                </StandardText>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleForgotPassword}>
                <StandardText
                  style={[styles.forgotPasswordText, { color: primary }]}
                >
                  Forgot Password?
                </StandardText>
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <Button
              mode="contained"
              onPress={handleLogin}
              loading={loading}
              disabled={loading}
              style={[styles.loginButton, { opacity: loading ? 0.7 : 1 }]}
              buttonColor={primary}
              labelStyle={styles.buttonLabel}
              textColor={onPrimary}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>

            {/* Sign Up Link */}
            <TouchableOpacity
              onPress={handleSignUpNavigation}
              style={styles.signUpContainer}
              activeOpacity={0.7}
            >
              <StandardText
                style={[styles.signUpText, { color: textSecondary }]}
              >
                Don't have an account?{' '}
              </StandardText>
              <StandardText style={[styles.signUpLink, { color: primary }]}>
                Sign Up
              </StandardText>
            </TouchableOpacity>
          </Card>
        </View>

        {/* Error Snackbar */}
        <Snackbar
          visible={!!errorMessage}
          onDismiss={() => setErrorMessage('')}
          duration={5000}
          action={{
            label: 'Dismiss',
            onPress: () => setErrorMessage(''),
            textColor: colors.white,
          }}
          style={[
            styles.snackbar,
            {
              backgroundColor: colors.error || '#f44336',
            },
          ]}
        >
          <StandardText style={styles.snackbarText}>
            {errorMessage}
          </StandardText>
        </Snackbar>
      </View>
    </KeyBoardAvoidingWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerSection: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 20 : 60,
  },
  logoImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  headerTitle: {
    fontSize: 28,
    marginTop: 20,
  },
  headerSubtitle: {
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  formContainer: {
    paddingHorizontal: 20,
    marginTop: -60,
    marginBottom: 20,
    flex: 1,
  },
  card: {
    padding: 24,
    borderRadius: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  input: {
    marginBottom: 16,
    fontFamily: 'Metropolis-Medium',
  },
  inputContent: {
    fontFamily: 'Metropolis-Regular',
  },
  rememberMeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderRadius: 4,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  rememberMeText: {
    fontSize: 14,
    fontFamily: 'Metropolis-Regular',
  },
  forgotPasswordText: {
    fontSize: 14,
    fontFamily: 'Metropolis-Medium',
  },
  loginButton: {
    marginBottom: 20,
    paddingVertical: 8,
    borderRadius: 12,
  },
  buttonLabel: {
    fontFamily: 'Metropolis-Bold',
    fontSize: 16,
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpText: {
    fontSize: 14,
    fontFamily: 'Metropolis-Regular',
  },
  signUpLink: {
    fontSize: 14,
    fontFamily: 'Metropolis-Bold',
    textDecorationLine: 'underline',
  },
  snackbar: {
    borderRadius: 8,
    margin: 16,
    fontFamily: 'Metropolis-Medium',
  },
  snackbarText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'Metropolis-Medium',
  },
});

export default Login;
