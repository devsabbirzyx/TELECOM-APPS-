import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { rounded, spacing } from '../../theme/spacing';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { useOrder } from '../../context/OrderContext';

type FailedRouteProp = RouteProp<RootStackParamList, 'PaymentFailed'>;
type FailedNavProp = StackNavigationProp<RootStackParamList, 'PaymentFailed'>;

interface Props {
  route: FailedRouteProp;
  navigation: FailedNavProp;
}

export const PaymentFailedScreen: React.FC<Props> = ({ route, navigation }) => {
  const {
    orderId,
    reason = 'সিস্টেম আপডেটের কাজ চলছে, এখন পেমেন্টটি প্রসেস হয়নি। অনুগ্রহ করে অন্য মেথড ব্যবহার করুন।',
    offer,
    recipientNumber: paramRecipient,
    paymentMethod = 'bkash',
  } = route.params || {};

  const { selectedOffer, recipientNumber } = useOrder();
  const currentOffer = offer || selectedOffer;
  const currentRecipient = paramRecipient || recipientNumber || '01XXXXXXXXX';

  const handleRetry = () => {
    navigation.goBack();
  };

  const handleChooseOtherMethod = () => {
    if (currentOffer) {
      navigation.navigate('Checkout', { offer: currentOffer });
    } else {
      navigation.navigate('MainTabs');
    }
  };

  const handleBackToHome = () => {
    navigation.navigate('MainTabs');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Status Badge Hero */}
        <View style={styles.heroSection}>
          <View style={styles.iconRing}>
            <View style={styles.iconPulse} />
            <View style={styles.iconCircle}>
              <Ionicons name="alert-circle" size={38} color="#ffffff" />
            </View>
          </View>

          <Text style={[typography.labelSm, styles.statusTag]}>SYSTEM UPDATE NOTICE</Text>
          <Text style={[typography.headlineMd, styles.title]}>পেমেন্ট প্রসেস হয়নি</Text>
          <Text style={[typography.bodyMd, styles.errorMessage]}>{reason}</Text>

          {/* Friendly Reassurance Banner */}
          <View style={styles.reassuranceBanner}>
            <Ionicons name="information-circle" size={22} color={colors.secondaryContainer} />
            <View style={styles.reassuranceTextCol}>
              <Text style={[typography.titleMd, styles.reassuranceTitle]}>
                সার্ভার রক্ষণাবেক্ষণ চলছে
              </Text>
              <Text style={[typography.bodySm, styles.reassuranceSub]}>
                সিস্টেম আপডেটের কারণে গেটওয়ে রেসপন্স সাময়িকভাবে স্থগিত রয়েছে। অনুগ্রহ করে অন্য মেথড ব্যবহার করুন।
              </Text>
            </View>
          </View>
        </View>

        {/* Transaction Overview Card */}
        <View style={styles.overviewCard}>
          <View style={styles.cardHeader}>
            <Text style={[typography.labelMd, styles.cardHeaderTitle]}>Transaction Overview</Text>
            <View style={styles.cancelledBadge}>
              <View style={styles.cancelledDot} />
              <Text style={[typography.labelSm, styles.cancelledText]}>MAINTENANCE</Text>
            </View>
          </View>

          <View style={styles.detailsList}>
            <View style={styles.detailRow}>
              <Text style={[typography.bodyMd, styles.detailLabel]}>Order ID</Text>
              <Text style={[typography.titleMd, styles.detailValue]}>
                {orderId || `#OFH-${Date.now().toString().slice(-6)}`}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={[typography.bodyMd, styles.detailLabel]}>Package Details</Text>
              <Text style={[typography.bodyMd, styles.detailValueBold]} numberOfLines={1}>
                {currentOffer?.title || 'স্পেশাল টেলিকম অফার'}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={[typography.bodyMd, styles.detailLabel]}>Recipient SIM</Text>
              <Text style={[typography.bodyMd, styles.detailValue]}>
                {currentRecipient}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={[typography.bodyMd, styles.detailLabel]}>Intended Amount</Text>
              <Text style={[typography.headlineSm, styles.amountValue]}>
                ৳{currentOffer?.offer_price || 499}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={[typography.bodyMd, styles.detailLabel]}>Attempted Method</Text>
              <View style={styles.methodPill}>
                <Text style={[typography.labelMd, styles.methodText]}>
                  {paymentMethod === 'nagad' ? 'Nagad' : 'bKash'}
                </Text>
              </View>
            </View>

            <View style={styles.errorBox}>
              <Text style={[typography.labelSm, styles.errorBoxLabel]}>System Notice</Text>
              <Text style={styles.errorCode}>NOTICE: SYSTEM_UPDATING_TRY_ANOTHER_METHOD</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={handleRetry}
            activeOpacity={0.85}
          >
            <Ionicons name="refresh" size={20} color="#ffffff" />
            <Text style={[typography.labelLg, styles.retryBtnText]}>আবার চেষ্টা করুন (Try Again)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.otherMethodBtn}
            onPress={handleChooseOtherMethod}
            activeOpacity={0.85}
          >
            <Ionicons name="wallet-outline" size={18} color="#0b1c30" />
            <Text style={[typography.labelLg, styles.otherMethodText]}>
              অন্য পেমেন্ট মাধ্যম নির্বাচন করুন
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.homeBtn}
            onPress={handleBackToHome}
            activeOpacity={0.7}
          >
            <Text style={[typography.bodyMd, styles.homeBtnText]}>হোমে ফিরে যান (Back to Home)</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9ff',
  },
  scrollContent: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.lg,
    paddingBottom: 40,
    gap: spacing.md,
  },

  /* Hero Section */
  heroSection: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  iconRing: {
    width: 84,
    height: 84,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: spacing.md,
  },
  iconPulse: {
    position: 'absolute',
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: 'rgba(186, 26, 26, 0.15)',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ba1a1a',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ba1a1a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  statusTag: {
    color: '#ba1a1a',
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 4,
  },
  title: {
    color: '#0b1c30',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
  },
  errorMessage: {
    color: '#ba1a1a',
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },

  /* Reassurance Banner */
  reassuranceBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#eff4ff',
    borderRadius: 14,
    padding: spacing.md,
    width: '100%',
    borderWidth: 1,
    borderColor: '#dce9ff',
  },
  reassuranceTextCol: {
    flex: 1,
  },
  reassuranceTitle: {
    color: '#0b1c30',
    fontWeight: '700',
  },
  reassuranceSub: {
    color: '#444651',
    marginTop: 2,
    lineHeight: 18,
  },

  /* Overview Card */
  overviewCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: spacing.md,
    shadowColor: '#1e3a8a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#eff4ff',
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 8,
  },
  cardHeaderTitle: {
    color: '#444651',
    fontWeight: '600',
  },
  cancelledBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#ffdad6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  cancelledDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ba1a1a',
  },
  cancelledText: {
    color: '#93000a',
    fontWeight: '800',
  },
  detailsList: {
    gap: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detailLabel: {
    color: '#757682',
  },
  detailValue: {
    color: '#0b1c30',
  },
  detailValueBold: {
    color: '#0b1c30',
    fontWeight: '700',
    maxWidth: '60%',
  },
  amountValue: {
    color: colors.primaryContainer,
    fontWeight: '800',
  },
  methodPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#eff4ff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  methodLogo: {
    width: 24,
    height: 16,
  },
  methodText: {
    color: '#0b1c30',
    fontWeight: '600',
  },
  errorBox: {
    backgroundColor: '#fff1f2',
    borderRadius: 10,
    padding: 10,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#ffe4e6',
  },
  errorBoxLabel: {
    color: '#9f1239',
    fontWeight: '600',
    marginBottom: 2,
  },
  errorCode: {
    color: '#e11d48',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 11,
    fontWeight: '700',
  },

  /* Actions */
  actions: {
    gap: 10,
    marginTop: spacing.sm,
  },
  retryBtn: {
    backgroundColor: colors.primaryContainer,
    borderRadius: 14,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: colors.primaryContainer,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  retryBtnText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  otherMethodBtn: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: '#e5eeff',
  },
  otherMethodText: {
    color: '#0b1c30',
    fontWeight: '700',
  },
  homeBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  homeBtnText: {
    color: colors.primaryContainer,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
