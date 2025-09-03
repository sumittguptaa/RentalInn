import React, {useState, useContext} from 'react';
import {StatusBar, View, TouchableOpacity} from 'react-native';
import {Formik} from 'formik';
import {TextInput, Button, Text, Snackbar, useTheme} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {CredentialsContext} from '../context/CredentialsContext';
import {handleUserSignup} from '../services/NetworkUtils';
import KeyBoardAvoidingWrapper from '../components/KeyBoardAvoidingWrapper';
import {Image} from 'react-native';
import StandardText from '../components/StandardText/StandardText';

const SignUp = ({navigation}) => {
  const [hidePassword, setHidePassword] = useState(true);
  const [hideConfirmPassword, setHideConfirmPassword] = useState(true);
  const [message, setMessage] = useState('');
  const [visible, setVisible] = useState(false);
  const {setStoredCredentials} = useContext(CredentialsContext);
  const {colors} = useTheme();

  const handleSignup = async (credentials, setSubmitting, resetForm) => {
    setMessage('');
    setVisible(false);

    try {
      delete credentials.confirmPassword;
      const response = await handleUserSignup(credentials);
      const {user, message} = response;
      // clear form
      resetForm();
    } catch (error) {
      let errorMessage =
        'An error occurred. Please check your network and try again.';

      if (error.response && error.response.data) {
        if (error.response.data.message) {
          if (Array.isArray(error.response.data.message)) {
            errorMessage = error.response.data.message.join(', ');
          } else {
            errorMessage = error.response.data.message;
          }
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        }
      }
      setMessage(errorMessage);
      setVisible(true);
    } finally {
      setSubmitting(false);
    }
  };

  const persistLogin = async (credentials, message) => {
    try {
      await AsyncStorage.setItem(
        'pgOwnerCredentials',
        JSON.stringify(credentials),
      );
      setMessage(message);
      setVisible(true);
      setStoredCredentials(credentials);
    } catch (error) {
      console.error('Persisting login failed', error);
      setMessage('Persisting login failed');
      setVisible(true);
    }
  };

  return (
    <KeyBoardAvoidingWrapper>
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          padding: 20,
          position: 'relative',
        }}>
        <StatusBar barStyle="dark-content" />
        <TouchableOpacity
          onPress={() => navigation.navigate('Login')}
          style={{position: 'absolute', top: 20, left: 20, zIndex: 999}}>
          <MaterialCommunityIcons
            name="arrow-left"
            size={30}
            color={colors.primary}
          />
        </TouchableOpacity>
        <View style={{alignItems: 'center', marginBottom: 20}}>
          <Image
            style={{
              width: 100,
              height: 100,
              alignSelf: 'center',
              borderRadius: 50,
            }}
            source={require('../assets/rentalinn.png')}
            resizeMode="contain"
          />
          <StandardText
            fontWeight={'bold'}
            style={{
              color: colors.primary,
              fontSize: 35,
              marginTop: 15,
              paddingTop: 15,
            }}>
            Sign Up
          </StandardText>
        </View>

        <Formik
          initialValues={{
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            confirmPassword: '',
            role: 'landlord',
            phone: '',
            address: '',
            city: '',
            state: '',
            postalCode: '',
            country: '',
          }}
          onSubmit={(values, {setSubmitting, resetForm}) =>
            handleSignup(values, setSubmitting, resetForm)
          }>
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            isSubmitting,
            resetForm,
          }) => (
            <View style={{marginBottom: 20}}>
              <TextInput
                label="First Name"
                mode="outlined"
                value={values.firstName}
                onChangeText={handleChange('firstName')}
                onBlur={handleBlur('firstName')}
                left={<TextInput.Icon icon="account" color={colors.primary} />}
                theme={{
                  colors: {
                    text: colors.textPrimary,
                    placeholder: colors.textSecondary,
                    primary: colors.primary,
                    background: colors.background,
                  },
                  fonts: {
                    regular: 'Metropolis-Regular',
                    medium: 'Metropolis-Medium',
                    bold: 'Metropolis-Bold',
                    semibold: 'Metropolis-SemiBold',
                    thin: 'Metropolis-Thin',
                  },
                }}
                style={{marginTop: 15, fontFamily: 'Metropolis-Medium'}}
              />

              <TextInput
                label="Last Name"
                mode="outlined"
                value={values.lastName}
                onChangeText={handleChange('lastName')}
                onBlur={handleBlur('lastName')}
                left={<TextInput.Icon icon="account" color={colors.primary} />}
                theme={{
                  colors: {
                    text: colors.textPrimary,
                    placeholder: colors.textSecondary,
                    primary: colors.primary,
                    background: colors.background,
                  },
                  fonts: {
                    regular: 'Metropolis-Regular',
                    medium: 'Metropolis-Medium',
                    bold: 'Metropolis-Bold',
                    semibold: 'Metropolis-SemiBold',
                    thin: 'Metropolis-Thin',
                  },
                }}
                style={{marginTop: 15, fontFamily: 'Metropolis-Medium'}}
              />

              <TextInput
                label="Phone Number"
                mode="outlined"
                value={values.phone}
                onChangeText={handleChange('phone')}
                onBlur={handleBlur('phone')}
                keyboardType="phone-pad"
                left={<TextInput.Icon icon="phone" color={colors.primary} />}
                theme={{
                  colors: {
                    text: colors.textPrimary,
                    placeholder: colors.textSecondary,
                    primary: colors.primary,
                    background: colors.background,
                  },
                  fonts: {
                    regular: 'Metropolis-Regular',
                    medium: 'Metropolis-Medium',
                    bold: 'Metropolis-Bold',
                    semibold: 'Metropolis-SemiBold',
                    thin: 'Metropolis-Thin',
                  },
                }}
                style={{marginTop: 15, fontFamily: 'Metropolis-Medium'}}
              />

              <TextInput
                label="Email"
                mode="outlined"
                value={values.email}
                onChangeText={handleChange('email')}
                onBlur={handleBlur('email')}
                keyboardType="email-address"
                left={<TextInput.Icon icon="email" color={colors.primary} />}
                theme={{
                  colors: {
                    text: colors.textPrimary,
                    placeholder: colors.textSecondary,
                    primary: colors.primary,
                    background: colors.background,
                  },
                  fonts: {
                    regular: 'Metropolis-Regular',
                    medium: 'Metropolis-Medium',
                    bold: 'Metropolis-Bold',
                    semibold: 'Metropolis-SemiBold',
                    thin: 'Metropolis-Thin',
                  },
                }}
                style={{marginTop: 15, fontFamily: 'Metropolis-Medium'}}
              />

              <TextInput
                label="Address"
                mode="outlined"
                value={values.address}
                onChangeText={handleChange('address')}
                onBlur={handleBlur('address')}
                left={
                  <TextInput.Icon icon="map-marker" color={colors.primary} />
                }
                theme={{
                  colors: {
                    text: colors.textPrimary,
                    placeholder: colors.textSecondary,
                    primary: colors.primary,
                    background: colors.background,
                  },
                  fonts: {
                    regular: 'Metropolis-Regular',
                    medium: 'Metropolis-Medium',
                    bold: 'Metropolis-Bold',
                    semibold: 'Metropolis-SemiBold',
                    thin: 'Metropolis-Thin',
                  },
                }}
                style={{marginTop: 15, fontFamily: 'Metropolis-Medium'}}
              />

              <TextInput
                label="City"
                mode="outlined"
                value={values.city}
                onChangeText={handleChange('city')}
                onBlur={handleBlur('city')}
                left={<TextInput.Icon icon="city" color={colors.primary} />}
                theme={{
                  colors: {
                    text: colors.textPrimary,
                    placeholder: colors.textSecondary,
                    primary: colors.primary,
                    background: colors.background,
                  },
                  fonts: {
                    regular: 'Metropolis-Regular',
                    medium: 'Metropolis-Medium',
                    bold: 'Metropolis-Bold',
                    semibold: 'Metropolis-SemiBold',
                    thin: 'Metropolis-Thin',
                  },
                }}
                style={{marginTop: 15, fontFamily: 'Metropolis-Medium'}}
              />

              <TextInput
                label="State"
                mode="outlined"
                value={values.state}
                onChangeText={handleChange('state')}
                onBlur={handleBlur('state')}
                left={<TextInput.Icon icon="map" color={colors.primary} />}
                theme={{
                  colors: {
                    text: colors.textPrimary,
                    placeholder: colors.textSecondary,
                    primary: colors.primary,
                    background: colors.background,
                  },
                  fonts: {
                    regular: 'Metropolis-Regular',
                    medium: 'Metropolis-Medium',
                    bold: 'Metropolis-Bold',
                    semibold: 'Metropolis-SemiBold',
                    thin: 'Metropolis-Thin',
                  },
                }}
                style={{marginTop: 15, fontFamily: 'Metropolis-Medium'}}
              />

              <TextInput
                label="Postal Code"
                mode="outlined"
                value={values.postalCode}
                onChangeText={handleChange('postalCode')}
                onBlur={handleBlur('postalCode')}
                keyboardType="numeric"
                left={
                  <TextInput.Icon icon="code-brackets" color={colors.primary} />
                }
                theme={{
                  colors: {
                    text: colors.textPrimary,
                    placeholder: colors.textSecondary,
                    primary: colors.primary,
                    background: colors.background,
                  },
                  fonts: {
                    regular: 'Metropolis-Regular',
                    medium: 'Metropolis-Medium',
                    bold: 'Metropolis-Bold',
                    semibold: 'Metropolis-SemiBold',
                    thin: 'Metropolis-Thin',
                  },
                }}
                style={{marginTop: 15, fontFamily: 'Metropolis-Medium'}}
              />

              <TextInput
                label="Country"
                mode="outlined"
                value={values.country}
                onChangeText={handleChange('country')}
                onBlur={handleBlur('country')}
                left={<TextInput.Icon icon="flag" color={colors.primary} />}
                theme={{
                  colors: {
                    text: colors.textPrimary,
                    placeholder: colors.textSecondary,
                    primary: colors.primary,
                    background: colors.background,
                  },
                  fonts: {
                    regular: 'Metropolis-Regular',
                    medium: 'Metropolis-Medium',
                    bold: 'Metropolis-Bold',
                    semibold: 'Metropolis-SemiBold',
                    thin: 'Metropolis-Thin',
                  },
                }}
                style={{marginTop: 15, fontFamily: 'Metropolis-Medium'}}
              />

              <TextInput
                label="Password"
                mode="outlined"
                secureTextEntry={hidePassword}
                value={values.password}
                onChangeText={handleChange('password')}
                onBlur={handleBlur('password')}
                left={<TextInput.Icon icon="lock" color={colors.primary} />}
                right={
                  <TextInput.Icon
                    icon={hidePassword ? 'eye-off' : 'eye'}
                    onPress={() => setHidePassword(!hidePassword)}
                  />
                }
                theme={{
                  colors: {
                    text: colors.textPrimary,
                    placeholder: colors.textSecondary,
                    primary: colors.primary,
                    background: colors.background,
                  },
                  fonts: {
                    regular: 'Metropolis-Regular',
                    medium: 'Metropolis-Medium',
                    bold: 'Metropolis-Bold',
                    semibold: 'Metropolis-SemiBold',
                    thin: 'Metropolis-Thin',
                  },
                }}
                style={{marginTop: 15, fontFamily: 'Metropolis-Medium'}}
              />

              <TextInput
                label="Confirm Password"
                mode="outlined"
                secureTextEntry={hideConfirmPassword}
                value={values.confirmPassword}
                onChangeText={handleChange('confirmPassword')}
                onBlur={handleBlur('confirmPassword')}
                left={<TextInput.Icon icon="lock" color={colors.primary} />}
                right={
                  <TextInput.Icon
                    icon={hideConfirmPassword ? 'eye-off' : 'eye'}
                    onPress={() => setHideConfirmPassword(!hideConfirmPassword)}
                  />
                }
                theme={{
                  colors: {
                    text: colors.textPrimary,
                    placeholder: colors.textSecondary,
                    primary: colors.primary,
                    background: colors.background,
                  },
                  fonts: {
                    regular: 'Metropolis-Regular',
                    medium: 'Metropolis-Medium',
                    bold: 'Metropolis-Bold',
                    semibold: 'Metropolis-SemiBold',
                    thin: 'Metropolis-Thin',
                  },
                }}
                style={{marginTop: 15, fontFamily: 'Metropolis-Medium'}}
              />

              <Button
                mode="contained"
                onPress={handleSubmit}
                loading={isSubmitting}
                style={{marginTop: 20}}
                labelStyle={{fontFamily: 'Metropolis-Bold', fontSize: 16}}>
                Sign Up
              </Button>

              <TouchableOpacity
                onPress={() => navigation.navigate('Login')}
                style={{marginTop: 20, alignItems: 'center'}}>
                <StandardText
                  style={{
                    color: colors.primary,
                    marginTop: 20,
                    textAlign: 'center',
                    textDecorationLine: 'underline',
                  }}>
                  Already have an account? Sign In
                </StandardText>
              </TouchableOpacity>
            </View>
          )}
        </Formik>

        <Snackbar
          visible={visible}
          onDismiss={() => setVisible(false)}
          duration={3000}>
          {message}
        </Snackbar>
      </View>
    </KeyBoardAvoidingWrapper>
  );
};

export default SignUp;
