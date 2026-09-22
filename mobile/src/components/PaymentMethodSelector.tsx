import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { rounded, spacing } from '../theme/spacing';
import { PaymentMethod } from '../types';
import { Ionicons } from '@expo/vector-icons';

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethod;
  onSelect: (method: PaymentMethod) => void;
  walletBalance?: number;
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedMethod,
  onSelect,
  walletBalance = 450,
}) => {
  const methods: Array<{
    id: PaymentMethod;
    name: string;
    description: string;
    color: string;
    icon: string;
  }> = [
    {
      id: 'bkash',
      name: 'bKash Online',
      description: 'Official bKash payment gateway (Instant)',
      color: colors.payment.bkash,
      icon: 'phone-portrait-outline',
    },
    {
      id: 'nagad',
      name: 'Nagad Direct Debit',
      description: 'Instant debit from Nagad account',
      color: colors.payment.nagad,
      icon: 'card-outline',
    },
    {
      id: 'wallet',
      name: 'Mobixa Wallet',
      description: `Available Balance: ৳${walletBalance.toFixed(2)}`,
      color: colors.tertiaryContainer,
      icon: 'wallet-outline',
    },
    {
      id: 'card',
      name: 'Debit / Credit Card',
      description: 'Visa, Mastercard, Amex, NexusPay',
      color: colors.primaryContainer,
      icon: 'card',
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={[typography.labelLg, styles.heading]}>Select Payment Method</Text>
      {methods.map((method) => {
        const isSelected = selectedMethod === method.id;
        return (
          <TouchableOpacity
            key={method.id}
            activeOpacity={0.8}
            onPress={() => onSelect(method.id)}
            style={[
              styles.methodCard,
              isSelected && styles.selectedMethodCard,
            ]}
          >
            <View style={[styles.iconBox, { backgroundColor: `${method.color}15` }]}>
              <Ionicons name={method.icon as any} size={22} color={method.color} />
            </View>

            <View style={styles.methodInfo}>
              <Text style={[typography.titleMd, styles.methodName]}>{method.name}</Text>
              <Text style={[typography.bodySm, styles.methodDesc]}>
                {method.description}
              </Text>
            </View>

            <View
              style={[
                styles.radioOuter,
                isSelected && { borderColor: colors.primaryContainer },
              ]}
            >
              {isSelected && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.md,
  },
  heading: {
    color: colors.onSurface,
    marginBottom: spacing.sm,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: rounded.xl,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  selectedMethodCard: {
    borderColor: colors.primaryContainer,
    backgroundColor: '#eff4ff',
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  methodInfo: {
    flex: 1,
  },
  methodName: {
    color: colors.onSurface,
  },
  methodDesc: {
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primaryContainer,
  },
});
