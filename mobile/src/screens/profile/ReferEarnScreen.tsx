import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { rounded, spacing } from '../../theme/spacing';
import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import { MOCK_REFERRAL } from '../../services/api';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export const ReferEarnScreen: React.FC = () => {
  const { user } = useAuth();
  const referralCode = user?.referral_code || 'TANVIR2026';
  const [referralData] = useState(MOCK_REFERRAL);

  const handleCopy = () => {
    Alert.alert('Copied!', `Referral code "${referralCode}" copied to clipboard.`);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Use my referral code "${referralCode}" when signing up on Mobixa to get 10 GB Free Data + ৳50 signup bonus! Download here: https://mobixa.app`,
      });
    } catch (err) {
      console.warn(err);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Refer & Earn" showBack onBack={() => {}} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Banner */}
        <LinearGradient
          colors={[colors.secondaryContainer, '#c2410c']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.banner}
        >
          <View style={styles.giftIconCircle}>
            <Ionicons name="gift" size={32} color="#ffffff" />
          </View>
          <Text style={[typography.headlineSm, styles.bannerTitle]}>
            Earn ৳50 Per Friend!
          </Text>
          <Text style={[typography.bodyMd, styles.bannerSub]}>
            Invite your friends to Mobixa. When they register and recharge their first pack, you both get ৳50 cash bonus!
          </Text>
        </LinearGradient>

        {/* Code Box */}
        <View style={styles.codeCard}>
          <Text style={[typography.labelMd, styles.codeLabel]}>YOUR REFERRAL CODE</Text>
          <View style={styles.codeRow}>
            <Text style={[typography.headlineMd, styles.codeText]}>{referralCode}</Text>
            <TouchableOpacity onPress={handleCopy} style={styles.copyBtn} activeOpacity={0.7}>
              <Ionicons name="copy-outline" size={18} color={colors.primaryContainer} />
              <Text style={[typography.labelMd, styles.copyText]}>Copy</Text>
            </TouchableOpacity>
          </View>

          <Button
            title="Share Referral Link"
            onPress={handleShare}
            variant="primary"
            size="lg"
            icon={<Ionicons name="share-social-outline" size={18} color="#ffffff" />}
            style={styles.shareBtn}
          />
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={[typography.headlineMd, styles.statVal]}>
              ৳{referralData.total_earned}
            </Text>
            <Text style={[typography.bodySm, styles.statLbl]}>Total Earned</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[typography.headlineMd, styles.statVal]}>
              {referralData.total_referrals}
            </Text>
            <Text style={[typography.bodySm, styles.statLbl]}>Friends Joined</Text>
          </View>
        </View>

        {/* Referred Friends List */}
        <Text style={[typography.titleMd, styles.listTitle]}>Referred Friends</Text>
        {referralData.referred_users.map((ref) => (
          <View key={ref.id} style={styles.friendCard}>
            <View style={styles.friendAvatar}>
              <Text style={styles.avatarInitials}>{ref.name.charAt(0)}</Text>
            </View>

            <View style={styles.friendInfo}>
              <Text style={[typography.titleMd, styles.friendName]}>{ref.name}</Text>
              <Text style={[typography.bodySm, styles.friendDate]}>
                Joined {ref.date} • {ref.phone_number}
              </Text>
            </View>

            <View style={styles.rewardBadge}>
              <Text style={styles.rewardText}>+৳{ref.reward}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  scrollContent: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  banner: {
    borderRadius: rounded.xl,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  giftIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  bannerTitle: {
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  bannerSub: {
    color: '#ffedd5',
    textAlign: 'center',
    lineHeight: 20,
  },
  codeCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: rounded.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  codeLabel: {
    color: colors.outline,
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceContainerLow,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: rounded.lg,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.primaryContainer,
    gap: spacing.lg,
    width: '100%',
    marginBottom: spacing.lg,
  },
  codeText: {
    color: colors.primaryContainer,
    letterSpacing: 2,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  copyText: {
    color: colors.primaryContainer,
  },
  shareBtn: {
    width: '100%',
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: rounded.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  statVal: {
    color: colors.primaryContainer,
  },
  statLbl: {
    color: colors.outline,
    marginTop: 2,
  },
  listTitle: {
    color: colors.onSurface,
    marginBottom: spacing.sm,
  },
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: rounded.lg,
    padding: spacing.md,
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  friendAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarInitials: {
    color: colors.primaryContainer,
    fontWeight: '700',
    fontSize: 16,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    color: colors.onSurface,
  },
  friendDate: {
    color: colors.outline,
    marginTop: 2,
  },
  rewardBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: rounded.full,
  },
  rewardText: {
    color: colors.tertiaryContainer,
    fontWeight: '700',
    fontSize: 12,
  },
});
