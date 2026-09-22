import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { rounded, spacing } from '../theme/spacing';
import { Ionicons } from '@expo/vector-icons';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  prefix?: string;
  isPassword?: boolean;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  containerStyle?: object;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  prefix,
  isPassword = false,
  leftIcon,
  containerStyle,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label && <Text style={[typography.labelMd, styles.label]}>{label}</Text>}
      <View
        style={[
          styles.container,
          isFocused && styles.focusedContainer,
          error ? styles.errorContainer : undefined,
        ]}
      >
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={20}
            color={isFocused ? colors.primaryContainer : colors.outline}
            style={styles.leftIcon}
          />
        )}
        {prefix && <Text style={[typography.titleMd, styles.prefix]}>{prefix}</Text>}
        <TextInput
          placeholderTextColor={colors.outline}
          secureTextEntry={isPassword && !showPassword}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={[typography.bodyLg, styles.input]}
          {...rest}
        />
        {isPassword && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeButton}
            activeOpacity={0.7}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={colors.outline}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={[typography.bodySm, styles.errorText]}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.md,
    width: '100%',
  },
  label: {
    color: colors.onSurfaceVariant,
    marginBottom: spacing.xs,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: rounded.lg,
    paddingHorizontal: spacing.md,
  },
  focusedContainer: {
    borderColor: colors.primaryContainer,
    backgroundColor: '#ffffff',
  },
  errorContainer: {
    borderColor: colors.error,
  },
  leftIcon: {
    marginRight: spacing.sm,
  },
  prefix: {
    color: colors.onSurface,
    fontWeight: '700',
    marginRight: spacing.xs,
  },
  input: {
    flex: 1,
    color: colors.onSurface,
    height: '100%',
  },
  eyeButton: {
    padding: spacing.xs,
  },
  errorText: {
    color: colors.error,
    marginTop: spacing.xs,
  },
});
