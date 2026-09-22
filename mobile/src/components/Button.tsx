import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  Animated,
} from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { rounded, spacing } from '../theme/spacing';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
}) => {
  const scaleValue = new Animated.Value(1);

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const getContainerStyle = (): ViewStyle => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: disabled ? colors.outlineVariant : colors.secondaryContainer,
          borderWidth: 0,
        };
      case 'secondary':
        return {
          backgroundColor: disabled ? colors.outlineVariant : colors.primaryContainer,
          borderWidth: 0,
        };
      case 'outline':
        return {
          backgroundColor: colors.surfaceContainerLowest,
          borderWidth: 1.5,
          borderColor: disabled ? colors.outlineVariant : colors.border,
        };
      case 'destructive':
        return {
          backgroundColor: disabled ? colors.outlineVariant : colors.error,
          borderWidth: 0,
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          borderWidth: 0,
        };
    }
  };

  const getTextStyle = (): TextStyle => {
    switch (variant) {
      case 'primary':
      case 'secondary':
      case 'destructive':
        return {
          color: colors.onPrimary,
        };
      case 'outline':
        return {
          color: disabled ? colors.outline : colors.primaryContainer,
        };
      case 'ghost':
        return {
          color: disabled ? colors.outline : colors.primaryContainer,
        };
    }
  };

  const getSizeStyle = (): ViewStyle => {
    switch (size) {
      case 'sm':
        return {
          height: 36,
          paddingHorizontal: spacing.md,
          borderRadius: rounded.md,
        };
      case 'lg':
        return {
          height: 54,
          paddingHorizontal: spacing.xxl,
          borderRadius: rounded.xl,
        };
      case 'md':
      default:
        return {
          height: 48,
          paddingHorizontal: spacing.lg,
          borderRadius: rounded.lg,
        };
    }
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleValue }], width: style?.width }}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        style={[
          styles.base,
          getContainerStyle(),
          getSizeStyle(),
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator
            size="small"
            color={variant === 'outline' || variant === 'ghost' ? colors.primaryContainer : '#ffffff'}
          />
        ) : (
          <>
            {icon}
            <Text
              style={[
                typography.labelLg,
                getTextStyle(),
                icon ? { marginLeft: spacing.sm } : undefined,
                textStyle,
              ]}
            >
              {title}
            </Text>
          </>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
