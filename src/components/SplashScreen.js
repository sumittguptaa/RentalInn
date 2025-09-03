import React, {useContext} from 'react';
import {View, Image, StyleSheet, Dimensions} from 'react-native';
import {ThemeContext} from '../context/ThemeContext';
import colors from '../theme/color';

const {width} = Dimensions.get('window');

const SplashScreen = () => {
  const {theme: mode} = useContext(ThemeContext);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor:
            mode === 'dark' ? colors.backgroundDark : colors.backgroundLight,
        },
      ]}>
      <Image
        source={require('../assets/rentalinn-without-bg.png')}
        style={[styles.image, {width: width * 0.5, height: width * 0.5}]}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 200,
    height: 200,
  },
});

export default SplashScreen;
