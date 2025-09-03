import React, {useState, useContext} from 'react';
import {StatusBar, Dimensions, View, TouchableOpacity} from 'react-native';
import {Button, TextInput, Snackbar, Card} from 'react-native-paper';
import {CredentialsContext} from '../context/CredentialsContext';
import {ThemeContext} from '../context/ThemeContext'; // ⬅️ make sure this exists
import {handleUserLogin} from '../services/NetworkUtils';
import KeyBoardAvoidingWrapper from '../components/KeyBoardAvoidingWrapper';
import colors from '../theme/color';
import {Image} from 'react-native';
import StandardText from '../components/StandardText/StandardText';
import {StyleSheet} from 'react-native';

const Login = ({navigation}) => {
  const [hidePassword, setHidePassword] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const {setCredentials} = useContext(CredentialsContext);

  const {theme: mode} = useContext(ThemeContext);

  const isDark = mode === 'dark';

  // pick adaptive colors
  const backgroundColor = isDark
    ? colors.backgroundDark
    : colors.backgroundLight;

  const cardBackground = isDark ? colors.light_black : colors.white;

  const textPrimary = isDark ? colors.white : colors.textPrimary;
  const textSecondary = isDark ? colors.light_gray : colors.textSecondary;

  const onPrimary = colors.white; // text/icon on top of primary
  const primary = colors.primary;

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const response = await handleUserLogin({email, password});
      const {user, accessToken} = response;

      setCredentials({...user, accessToken});
    } catch (error) {
      console.error('Login Error:', error);
      setErrorMessage('Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyBoardAvoidingWrapper>
      <View style={{flex: 1, backgroundColor}}>
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={backgroundColor}
        />

        <View
          style={[
            styles.headerSection,
            {
              backgroundColor: primary,
              height: Dimensions.get('window').height * 0.4,
            },
          ]}>
          <Image
            source={require('../assets/rentalinn-without-bg.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <StandardText
            fontWeight={'bold'}
            style={{fontSize: 25, marginTop: 15}}
            color="default_white">
            Sign In
          </StandardText>
          <StandardText style={{color: onPrimary, marginTop: 2}}>
            Enter your email and password to log in
          </StandardText>
        </View>

        {/* Login Form Section */}
        <View style={{paddingHorizontal: 10, marginTop: -50, marginBottom: 20}}>
          <Card style={{padding: 20, backgroundColor: cardBackground}}>
            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              mode="outlined"
              left={<TextInput.Icon icon="email" />}
              theme={{
                colors: {
                  text: textPrimary,
                  placeholder: textSecondary,
                  primary: primary,
                  background: cardBackground,
                },
                fonts: {
                  regular: 'Metropolis-Regular',
                  medium: 'Metropolis-Medium',
                  bold: 'Metropolis-Bold',
                  semibold: 'Metropolis-SemiBold',
                  thin: 'Metropolis-Thin',
                },
              }}
              style={styles.passwordInput}
            />

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
              theme={{
                colors: {
                  text: textPrimary,
                  placeholder: textSecondary,
                  primary: primary,
                  background: cardBackground,
                },
                fonts: {
                  regular: 'Metropolis-Regular',
                  medium: 'Metropolis-Medium',
                  bold: 'Metropolis-Bold',
                  semibold: 'Metropolis-SemiBold',
                  thin: 'Metropolis-Thin',
                },
              }}
              style={styles.passwordInput}
            />

            <Button
              mode="contained"
              onPress={handleLogin}
              loading={loading}
              style={styles.button}
              buttonColor={primary}
              labelStyle={styles.buttonLabel}
              textColor={onPrimary}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>

            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
              <StandardText style={[styles.signUpText, {color: primary}]}>
                Don't have an account? Sign Up
              </StandardText>
            </TouchableOpacity>
          </Card>
        </View>

        {/* Error Message */}
        <Snackbar
          visible={!!errorMessage}
          onDismiss={() => setErrorMessage('')}
          action={{label: 'Dismiss', onPress: () => setErrorMessage('')}}
          style={{
            backgroundColor: isDark ? colors.error : colors.error,
          }}>
          {errorMessage}
        </Snackbar>
      </View>
    </KeyBoardAvoidingWrapper>
  );
};

const styles = StyleSheet.create({
  signUpText: {
    marginTop: 20,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  button: {
    marginTop: 20,
  },
  buttonLabel: {
    fontFamily: 'Metropolis-Bold',
    fontSize: 16,
  },
  passwordInput: {
    marginTop: 15,
    fontFamily: 'Metropolis-Medium',
  },
  headerSection: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: 100,
    height: 100,
    borderRadius: 55,
  },
});

export default Login;
