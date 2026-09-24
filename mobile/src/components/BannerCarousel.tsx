import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { rounded, spacing } from '../theme/spacing';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { FreeClaimStatus } from '../types';

interface BannerCarouselProps {
  onClaimPress: () => void;
  claimStatus?: FreeClaimStatus | null;
}

export const BannerCarousel: React.FC<BannerCarouselProps> = ({ onClaimPress, claimStatus }) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(claimStatus?.seconds_remaining || 0);

  useEffect(() => {
    if (claimStatus?.seconds_remaining !== undefined) {
      setSecondsRemaining(claimStatus.seconds_remaining);
    }
  }, [claimStatus?.seconds_remaining]);

  useEffect(() => {
    if (claimStatus?.status === 'timer_active' && secondsRemaining > 0) {
      const interval = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [claimStatus?.status, secondsRemaining]);

  const formatCountdown = (secs: number) => {
    if (secs <= 0) return '00:00:00';
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const isClaimed = claimStatus?.status === 'claimed';
  const isReady = claimStatus?.status === 'ready' || (claimStatus?.status === 'timer_active' && secondsRemaining <= 0);
  const isTimerActive = claimStatus?.status === 'timer_active' && secondsRemaining > 0;

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
          <View style={[styles.giftTag, isReady && { backgroundColor: '#16a34a' }, isClaimed && { backgroundColor: '#2563eb' }]}>
            <Ionicons name={isClaimed ? 'checkmark-circle' : 'gift'} size={12} color="#ffffff" />
            <Text style={[typography.labelSm, styles.giftTagText]}>
              {isClaimed
                ? 'OFFER ACTIVE'
                : (isReady ? 'READY TO CLAIM' : (isTimerActive ? 'UNLOCKING' : 'FREE WELCOME GIFT'))}
            </Text>
          </View>
          <View style={[styles.timerBadge, isReady && { backgroundColor: 'rgba(22, 163, 74, 0.3)' }]}>
            <Ionicons name="time-outline" size={11} color="#ffffff" style={{ marginRight: 3 }} />
            <Text style={[typography.labelSm, styles.timerText]}>
              {isClaimed
                ? 'Claimed'
                : (isReady
                    ? '12h Ready!'
                    : (isTimerActive
                        ? `Ends in ${formatCountdown(secondsRemaining)}`
                        : '12h Countdown'))}
            </Text>
          </View>
        </View>

        {/* Headline */}
        <Text style={[typography.headlineSm, styles.title]}>
          {isClaimed
            ? '10 GB Free Internet Active'
            : (isReady ? '10 GB Ready To Claim!' : '10 GB Free Any Operator')}
        </Text>
        <Text style={[typography.bodySm, styles.subtitle]}>
          {isClaimed
            ? 'Congratulations! Your 10 GB welcome gift pack is active on your SIM.'
            : (isReady
                ? 'Your 12-hour wait is over! Tap below to claim your 10 GB free data right now.'
                : (isTimerActive
                    ? `12-hour timer in progress: ${formatCountdown(secondsRemaining)} remaining before unlock.`
                    : 'Exclusive welcome gift for newly registered users on any Bangladeshi SIM.'))}
        </Text>

        {/* Claim Button */}
        <View style={styles.claimRow}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onClaimPress}
            style={[
              styles.claimButton,
              isReady && { backgroundColor: '#16a34a' },
              isClaimed && { backgroundColor: '#334155' },
            ]}
          >
            <Text
              style={[
                typography.labelMd,
                styles.claimButtonText,
                (isReady || isClaimed) && { color: '#ffffff' },
              ]}
            >
              {isClaimed
                ? 'Claimed'
                : (isReady
                    ? 'Claim 10GB'
                    : (isTimerActive ? `⏳ ${formatCountdown(secondsRemaining)}` : 'Claim'))}
            </Text>
            <Ionicons
              name={isClaimed ? 'checkmark' : 'arrow-forward'}
              size={14}
              color={isReady || isClaimed ? '#ffffff' : colors.primaryContainer}
            />
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
