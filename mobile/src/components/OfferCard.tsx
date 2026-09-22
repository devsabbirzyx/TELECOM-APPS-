import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Offer } from '../types';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { rounded, spacing } from '../theme/spacing';
import { elevation } from '../theme/elevation';
import { Ionicons } from '@expo/vector-icons';

interface OfferCardProps {
  offer: Offer;
  onPress: () => void;
  onBuyPress: () => void;
}

export const OfferCard: React.FC<OfferCardProps> = ({
  offer,
  onPress,
  onBuyPress,
}) => {
  const opColor = colors.operators[offer.operator_code] || colors.primaryContainer;

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={onPress}
      style={[styles.card, elevation.level1]}
    >
      {/* Top Bar: Operator Name and Validity Badge */}
      <View style={styles.topRow}>
        <View style={styles.operatorRow}>
          <View style={[styles.operatorDot, { backgroundColor: opColor }]} />
          <Text style={[typography.labelMd, styles.operatorName]}>
            {offer.operator_name || offer.operator_code.toUpperCase()}
          </Text>
          {offer.is_drive_offer && (
            <View style={styles.driveBadge}>
              <Ionicons name="flash" size={10} color="#ffffff" />
              <Text style={styles.driveBadgeText}>DRIVE</Text>
            </View>
          )}
        </View>

        <View style={styles.validityBadge}>
          <Ionicons name="time-outline" size={12} color={colors.onSurfaceVariant} />
          <Text style={[typography.labelSm, styles.validityText]}>
            {offer.validity_days} Days
          </Text>
        </View>
      </View>

      {/* Title & Quotas */}
      <View style={styles.middleSection}>
        <Text style={[typography.titleMd, styles.title]} numberOfLines={2}>
          {offer.title}
        </Text>

        <View style={styles.quotaRow}>
          {offer.data_amount && (
            <View style={styles.quotaItem}>
              <Ionicons name="cellular-outline" size={14} color={colors.primaryContainer} />
              <Text style={[typography.headlineSm, styles.quotaValue]}>
                {offer.data_amount}
              </Text>
            </View>
          )}
          {offer.voice_minutes ? (
            <View style={styles.quotaItem}>
              <Ionicons name="call-outline" size={14} color={colors.tertiaryContainer} />
              <Text style={[typography.headlineSm, styles.quotaValue]}>
                {offer.voice_minutes} <Text style={styles.quotaUnit}>Mins</Text>
              </Text>
            </View>
          ) : null}
        </View>

        {/* Cashback pill */}
        {offer.cashback_amount && offer.cashback_amount > 0 ? (
          <View style={styles.cashbackBadge}>
            <Ionicons name="gift-outline" size={12} color={colors.tertiaryContainer} />
            <Text style={[typography.labelSm, styles.cashbackText]}>
              ৳{offer.cashback_amount} Cashback
            </Text>
          </View>
        ) : null}
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Bottom Row: Price & Buy Button */}
      <View style={styles.bottomRow}>
        <View style={styles.priceContainer}>
          {offer.regular_price > offer.offer_price && (
            <Text style={[typography.bodySm, styles.regularPrice]}>
              ৳{offer.regular_price}
            </Text>
          )}
          <Text style={[typography.headlineMd, styles.offerPrice]}>
            ৳{offer.offer_price}
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onBuyPress}
          style={styles.buyButton}
        >
          <Text style={[typography.labelMd, styles.buyButtonText]}>Buy Offer</Text>
          <Ionicons name="arrow-forward" size={14} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: rounded.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  operatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  operatorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.xs,
  },
  operatorName: {
    color: colors.onSurface,
    textTransform: 'uppercase',
  },
  driveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondaryContainer,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: rounded.xs,
    marginLeft: spacing.xs,
    gap: 2,
  },
  driveBadgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '800',
  },
  validityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLow,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: rounded.full,
    gap: 4,
  },
  validityText: {
    color: colors.onSurfaceVariant,
  },
  middleSection: {
    marginVertical: spacing.xs,
  },
  title: {
    color: colors.onSurface,
    marginBottom: spacing.sm,
  },
  quotaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    marginBottom: spacing.xs,
  },
  quotaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  quotaValue: {
    color: colors.primaryContainer,
  },
  quotaUnit: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.onSurfaceVariant,
  },
  cashbackBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: rounded.sm,
    marginTop: spacing.xs,
    gap: 4,
  },
  cashbackText: {
    color: colors.tertiaryContainer,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    justifyContent: 'center',
  },
  regularPrice: {
    color: colors.outline,
    textDecorationLine: 'line-through',
  },
  offerPrice: {
    color: colors.primaryContainer,
    fontWeight: '800',
  },
  buyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondaryContainer,
    paddingHorizontal: spacing.lg,
    height: 40,
    borderRadius: rounded.lg,
    gap: spacing.xs,
  },
  buyButtonText: {
    color: '#ffffff',
  },
});
