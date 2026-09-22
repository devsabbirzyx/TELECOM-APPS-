import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { rounded, spacing } from '../theme/spacing';
import { OperatorCode } from '../types';

interface OperatorChipProps {
  label: string;
  code?: OperatorCode | 'all';
  isActive: boolean;
  onPress: () => void;
  dotColor?: string;
}

export const OperatorChip: React.FC<OperatorChipProps> = ({
  label,
  code,
  isActive,
  onPress,
  dotColor,
}) => {
  const getDotColor = (): string | null => {
    if (dotColor) return dotColor;
    if (!code || code === 'all') return null;
    return colors.operators[code as OperatorCode] || null;
  };

  const dot = getDotColor();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.chip,
        isActive ? styles.activeChip : styles.inactiveChip,
      ]}
    >
      {dot && !isActive && <View style={[styles.dot, { backgroundColor: dot }]} />}
      <Text
        style={[
          typography.labelMd,
          isActive ? styles.activeText : styles.inactiveText,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 38,
    paddingHorizontal: spacing.md,
    borderRadius: rounded.full,
    marginRight: spacing.sm,
  },
  activeChip: {
    backgroundColor: colors.primaryContainer,
    shadowColor: colors.primaryContainer,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  inactiveChip: {
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeText: {
    color: colors.onPrimary,
  },
  inactiveText: {
    color: colors.onSurface,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
});
