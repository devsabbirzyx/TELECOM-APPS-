import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { rounded, spacing } from '../theme/spacing';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface BannerCarouselProps {
  onClaimPress: () => void;
}

export const BannerCarousel: React.FC<BannerCarouselProps> = ({ onClaimPress }) => {
  return (
    <LinearGradient
      colors={[colors.primaryContainer, '#0f172a']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      {/* Decorative Blur Spheres */}
      <View style={styles.blurCircleTop} />
      <View style={styles.blurCircleBottom} />

      <View style={styles.content}>
        {/* Top Tag & Timer */}
        <View style={styles.topRow}>
          <View style={styles.giftTag}>
            <Ionicons name="gift" size={12} color="#ffffff" />
            <Text style={[typography.labelSm, styles.giftTagText]}>
              FREE OFFER FOR NEW USER
            </Text>
          </View>
          <View style={styles.timerBadge}>
            <Text style={[typography.labelSm, styles.timerText]}>Ends in 03:42:19</Text>
          </View>
        </View>

        {/* Headline */}
        <Text style={[typography.headlineSm, styles.title]}>
          10 GB Free Any Operator
        </Text>
        <Text style={[typography.bodySm, styles.subtitle]}>
          Exclusive welcome gift for newly registered users on any Bangladeshi SIM.
        </Text>

        {/* Claim Button */}
        <View style={styles.claimRow}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onClaimPress}
            style={styles.claimButton}
          >
            <Text style={[typography.labelMd, styles.claimButtonText]}>Claim</Text>
            <Ionicons name="arrow-forward" size={14} color={colors.primaryContainer} />
          </TouchableOpacity>
        </View>

        {/* Indicators */}
        <View style={styles.indicators}>
          <View style={[styles.dot, styles.activeDot]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: rounded.xl,
    overflow: 'hidden',
    position: 'relative',
    marginVertical: spacing.md,
  },
  content: {
    padding: spacing.lg,
    zIndex: 10,
  },
  blurCircleTop: {
    position: 'absolute',
    top: -20,
    left: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(249, 115, 22, 0.15)',
  },
  blurCircleBottom: {
    position: 'absolute',
    bottom: -30,
    right: -20,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(30, 58, 138, 0.4)',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  giftTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondaryContainer,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: rounded.full,
    gap: 4,
  },
  giftTagText: {
    color: '#ffffff',
  },
  timerBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: rounded.sm,
  },
  timerText: {
    color: '#ffffff',
  },
  title: {
    color: '#ffffff',
    marginBottom: spacing.xs,
  },
  subtitle: {
    color: colors.primaryFixedDim,
    marginBottom: spacing.md,
  },
  claimRow: {
    alignItems: 'flex-end',
    marginBottom: spacing.sm,
  },
  claimButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: spacing.lg,
    height: 38,
    borderRadius: rounded.md,
    gap: spacing.xs,
  },
  claimButtonText: {
    color: colors.primaryContainer,
  },
  indicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: spacing.xs,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  activeDot: {
    width: 20,
    backgroundColor: colors.secondaryContainer,
  },
});
