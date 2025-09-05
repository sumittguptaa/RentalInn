// GradientCard.js - Enhanced Card Component
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';

const GradientCard = ({
  children,
  gradient = false,
  gradientColors,
  style,
  ...props
}) => {
  const theme = useTheme();

  const defaultGradientColors = [
    theme.colors.surface,
    theme.colors.surfaceVariant,
  ];

  const cardStyle = {
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    backgroundColor: theme.colors.surface,
  };

  if (gradient) {
    return (
      <LinearGradient
        colors={gradientColors || defaultGradientColors}
        style={[cardStyle, style]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        {...props}
      >
        {children}
      </LinearGradient>
    );
  }

  return (
    <View style={[cardStyle, style]} {...props}>
      {children}
    </View>
  );
};

export default GradientCard;
