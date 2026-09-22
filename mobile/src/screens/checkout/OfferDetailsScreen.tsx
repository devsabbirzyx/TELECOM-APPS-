import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Share,
  Alert,
  Platform,
} from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { rounded, spacing } from '../../theme/spacing';
import { Header } from '../../components/Header';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { useOrder } from '../../context/OrderContext';
import { validateBangladeshiPhoneNumber, getOperatorFromPrefix } from '../../utils/phoneValidator';

type DetailsRouteProp = RouteProp<RootStackParamList, 'OfferDetails'>;
type DetailsNavProp = StackNavigationProp<RootStackParamList, 'OfferDetails'>;

interface Props {
  route: DetailsRouteProp;
  navigation: DetailsNavProp;
}

export const OfferDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { offer } = route.params;
  const { setSelectedOffer, setRecipientNumber } = useOrder();

  // Recipient target switch: 'self' | 'friend'
  const [recipientTarget, setRecipientTarget] = useState<'self' | 'friend'>('self');
  const [phoneNumber, setPhoneNumber] = useState('01712-345678');
  const [termsExpanded, setTermsExpanded] = useState(false);

  const opColor = colors.operators[offer.operator_code] || colors.primaryContainer;
  const originalPrice = Math.round(offer.offer_price * 1.3);
  const savings = originalPrice - offer.offer_price;
  const cashback = offer.cashback_amount || 25;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this ${offer.operator_name || offer.operator_code.toUpperCase()} offer on Mobixa: ${offer.title} for only ৳${offer.offer_price}!`,
      });
    } catch {
      // Ignored
    }
  };

  const handleProceed = () => {
    const validation = validateBangladeshiPhoneNumber(phoneNumber);
    if (!validation.isValid) {
      Alert.alert('অকার্যকর মোবাইল নম্বর', validation.error || 'সঠিক ১১ ডিজিটের বাংলাদেশি নম্বর দিন।');
      return;
    }

    // Check operator mismatch
    if (validation.operator && offer.operator_code) {
      const isMismatch =
        (offer.operator_code === 'gp' && validation.operator.code !== 'gp') ||
        (offer.operator_code === 'banglalink' && validation.operator.code !== 'banglalink') ||
        (offer.operator_code === 'robi' && validation.operator.code !== 'robi' && validation.operator.code !== 'airtel') ||
        (offer.operator_code === 'airtel' && validation.operator.code !== 'airtel' && validation.operator.code !== 'robi') ||
        (offer.operator_code === 'teletalk' && validation.operator.code !== 'teletalk');

      if (isMismatch) {
        Alert.alert(
          'অপারেটর অসঙ্গতি (Operator Mismatch)',
          `আপনি ${offer.operator_name || offer.operator_code.toUpperCase()} অফার সিলেক্ট করেছেন, কিন্তু প্রাপক নম্বরটি ${validation.operator.name}-এর (${validation.cleanNumber})।\n\nনম্বরটি MNP করা না থাকলে অফারটি চালু নাও হতে পারে। আপনি কি এগিয়ে যেতে চান?`,
          [
            { text: 'নম্বর পরিবর্তন করুন', style: 'cancel' },
            {
              text: 'হ্যাঁ, এগিয়ে যান',
              onPress: () => {
                setRecipientNumber(validation.cleanNumber);
                setSelectedOffer(offer);
                navigation.navigate('Checkout', { offer });
              },
            },
          ]
        );
        return;
      }
    }

    setRecipientNumber(validation.cleanNumber);
    setSelectedOffer(offer);
    navigation.navigate('Checkout', { offer });
  };

  const handlePasteNumber = () => {
    setPhoneNumber('01799-887766');
  };

  const handleChooseContact = () => {
    Alert.alert('Contacts', 'Selected contact: Rahim (01812-345678)');
    setPhoneNumber('01812-345678');
  };

  return (
    <View style={styles.container}>
      {/* Stitch Header */}
      <Header
        title="Offer Details"
        showBack
        onBack={() => navigation.goBack()}
        showNotification
        hasUnreadNotifications
        onNotificationPress={() => navigation.navigate('Notifications')}
        showProfile
        onProfilePress={() => navigation.navigate('EditProfile')}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Main Highlight Card (Stitch 9) */}
        <View style={styles.highlightCard}>
          {/* Operator Glow Aura */}
          <View style={styles.glowAura} />

          {/* Header: Operator Badge & Share Button */}
          <View style={styles.cardTopHeader}>
            <View style={styles.operatorBadgePill}>
              <View style={[styles.badgeIconDot, { backgroundColor: opColor }]}>
                <Ionicons name="cellular" size={13} color="#ffffff" />
              </View>
              <Text style={[typography.labelMd, styles.operatorBadgeText]}>
                {offer.operator_name || offer.operator_code.toUpperCase()} • 4G Super Pack
              </Text>
            </View>

            <TouchableOpacity
              style={styles.shareBtn}
              onPress={handleShare}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="share-social-outline" size={18} color={colors.onSurface} />
            </TouchableOpacity>
          </View>

          {/* Big Title & Verification */}
          <View style={styles.titleSection}>
            <Text style={[typography.headlineSm, styles.offerTitle]}>{offer.title}</Text>
            <View style={styles.verificationRow}>
              <Ionicons name="checkmark-circle" size={16} color="#004b1d" />
              <Text style={[typography.bodySm, styles.verificationText]}>
                Official Direct Telco Re-charge • Instant Delivery
              </Text>
            </View>
          </View>

          {/* Breakdown Metric Bento Tiles (2x2 Grid) */}
          <View style={styles.bentoGrid}>
            {/* Tile 1: Data */}
            <View style={styles.bentoTile}>
              <View style={styles.bentoIconBox}>
                <Ionicons name="server-outline" size={20} color={colors.primaryContainer} />
              </View>
              <View style={styles.bentoTextBox}>
                <Text style={[typography.titleMd, styles.bentoValue]}>
                  {offer.data_amount || '50 GB'}
                </Text>
                <Text style={[typography.labelSm, styles.bentoLabel]}>All networks</Text>
              </View>
            </View>

            {/* Tile 2: Talk time */}
            <View style={styles.bentoTile}>
              <View style={styles.bentoIconBox}>
                <Ionicons name="call-outline" size={20} color={colors.primaryContainer} />
              </View>
              <View style={styles.bentoTextBox}>
                <Text style={[typography.titleMd, styles.bentoValue]}>
                  {offer.voice_minutes ? `${offer.voice_minutes} Mins` : '800 Mins'}
                </Text>
                <Text style={[typography.labelSm, styles.bentoLabel]}>Any net local</Text>
              </View>
            </View>

            {/* Tile 3: SMS */}
            <View style={styles.bentoTile}>
              <View style={styles.bentoIconBox}>
                <Ionicons name="chatbubble-outline" size={20} color={colors.primaryContainer} />
              </View>
              <View style={styles.bentoTextBox}>
                <Text style={[typography.titleMd, styles.bentoValue]}>
                  {offer.sms_count ? `${offer.sms_count} SMS` : '100 SMS'}
                </Text>
                <Text style={[typography.labelSm, styles.bentoLabel]}>Local SMS</Text>
              </View>
            </View>

            {/* Tile 4: Validity */}
            <View style={styles.bentoTile}>
              <View style={styles.bentoIconBox}>
                <Ionicons name="calendar-outline" size={20} color={colors.primaryContainer} />
              </View>
              <View style={styles.bentoTextBox}>
                <Text style={[typography.titleMd, styles.bentoValue]}>
                  {offer.validity_days} Days
                </Text>
                <Text style={[typography.labelSm, styles.bentoLabel]}>Calendar month</Text>
              </View>
            </View>
          </View>

          {/* Pricing Summary Bar & Cashback Callout */}
          <View style={styles.priceSummaryBox}>
            <View style={styles.priceRow}>
              <View style={styles.priceLeft}>
                <Text style={[typography.headlineMd, styles.mainPriceText]}>
                  ৳{offer.offer_price}
                </Text>
                <Text style={[typography.bodyMd, styles.strikethroughPrice]}>
                  ৳{originalPrice}
                </Text>
                <View style={styles.saveTag}>
                  <Text style={[typography.labelSm, styles.saveTagText]}>Save ৳{savings}</Text>
                </View>
              </View>
              <Text style={[typography.labelSm, styles.taxText]}>Taxes included</Text>
            </View>

            {/* Cashback Tag */}
            <View style={styles.cashbackBanner}>
              <Ionicons name="wallet" size={16} color="#004b1d" />
              <Text style={[typography.labelMd, styles.cashbackBannerText]}>
                Instant ৳{cashback} bKash / Nagad Cashback
              </Text>
            </View>
          </View>
        </View>

        {/* Recipient SIM Section (Stitch 9) */}
        <View style={styles.recipientCard}>
          {/* Target Mode Segmented Switch */}
          <View style={styles.recipientHeader}>
            <Text style={[typography.titleMd, styles.recipientTitle]}>Recipient SIM Number</Text>
            <View style={styles.segmentedControl}>
              <TouchableOpacity
                style={[
                  styles.segmentBtn,
                  recipientTarget === 'self' && styles.segmentBtnActive,
                ]}
                onPress={() => {
                  setRecipientTarget('self');
                  setPhoneNumber('01712-345678');
                }}
              >
                <Text
                  style={[
                    typography.labelMd,
                    recipientTarget === 'self' ? styles.segmentTextActive : styles.segmentTextInactive,
                  ]}
                >
                  My SIM
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.segmentBtn,
                  recipientTarget === 'friend' && styles.segmentBtnActive,
                ]}
                onPress={() => {
                  setRecipientTarget('friend');
                  setPhoneNumber('');
                }}
              >
                <Text
                  style={[
                    typography.labelMd,
                    recipientTarget === 'friend' ? styles.segmentTextActive : styles.segmentTextInactive,
                  ]}
                >
                  Friend
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Phone Number Input with BD Prefix */}
          <View style={styles.phoneInputContainer}>
            <View style={styles.bdPrefix}>
              <Text style={styles.bdFlag}>🇧🇩</Text>
              <Text style={[typography.bodyLg, styles.bdPrefixText]}>+880</Text>
            </View>
            <TextInput
              style={[typography.titleLg, styles.phoneInput]}
              placeholder="017XX-XXXXXX"
              placeholderTextColor={colors.outline}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              maxLength={13}
            />
            {phoneNumber.replace(/[^0-9]/g, '').length >= 10 && (
              <View style={styles.verifiedCheck}>
                <Ionicons name="checkmark" size={16} color="#004b1d" />
              </View>
            )}
          </View>

          {/* Dynamic Detection Pill */}
          <View style={styles.detectionRow}>
            <View style={styles.detectionLeft}>
              <View style={styles.pulsingDot} />
              <Text style={[typography.labelSm, styles.detectionText]}>
                {offer.operator_name || 'Grameenphone'} Pre-paid verified
              </Text>
            </View>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={[typography.labelSm, styles.changeOperatorText]}>Change Operator</Text>
            </TouchableOpacity>
          </View>

          {/* Quick Action Utility Chips */}
          <View style={styles.utilityRow}>
            <TouchableOpacity
              style={styles.utilityBtn}
              onPress={handlePasteNumber}
              activeOpacity={0.8}
            >
              <Ionicons name="clipboard-outline" size={18} color={colors.onSurfaceVariant} />
              <Text style={[typography.labelMd, styles.utilityBtnText]}>Paste Number</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.utilityBtn}
              onPress={handleChooseContact}
              activeOpacity={0.8}
            >
              <Ionicons name="people-outline" size={18} color={colors.onSurfaceVariant} />
              <Text style={[typography.labelMd, styles.utilityBtnText]}>Choose Contact</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Collapsible Terms & Conditions Section (Stitch 9) */}
        <View style={styles.accordionCard}>
          <TouchableOpacity
            style={styles.accordionHeader}
            onPress={() => setTermsExpanded(!termsExpanded)}
            activeOpacity={0.8}
          >
            <View style={styles.accordionTitleRow}>
              <View style={styles.accordionIconBox}>
                <Ionicons name="document-text-outline" size={18} color={colors.primaryContainer} />
              </View>
              <Text style={[typography.titleMd, styles.accordionTitle]}>Terms & Conditions</Text>
            </View>
            <Ionicons
              name={termsExpanded ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={colors.onSurfaceVariant}
            />
          </TouchableOpacity>

          {termsExpanded && (
            <View style={styles.accordionBody}>
              <Text style={[typography.bodySm, styles.termsLine]}>
                • Offer available for all prepaid & postpaid connections.
              </Text>
              <Text style={[typography.bodySm, styles.termsLine]}>
                • Unused volume will be added if the same pack is repurchased within the active validity period.
              </Text>
              <Text style={[typography.bodySm, styles.termsLine]}>
                • Dial *121*1# or use the official operator app to check remaining volume.
              </Text>
              <Text style={[typography.bodySm, styles.termsLine]}>
                • Recharge will be completed automatically within 5-30 seconds after payment confirmation.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Sticky Bottom Purchase Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomPriceCol}>
          <Text style={[typography.labelSm, styles.bottomPriceLabel]}>Payable Amount</Text>
          <Text style={[typography.headlineMd, styles.bottomPriceValue]}>
            ৳{offer.offer_price}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.checkoutBtn}
          onPress={handleProceed}
          activeOpacity={0.8}
        >
          <Text style={[typography.labelLg, styles.checkoutBtnText]}>Proceed to Checkout</Text>
          <Ionicons name="arrow-forward" size={18} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9ff',
  },
  scrollContent: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.md,
    paddingBottom: 110,
    gap: spacing.md,
  },

  /* Highlight Card */
  highlightCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: spacing.md,
    shadowColor: '#1e3a8a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eff4ff',
  },
  glowAura: {
    position: 'absolute',
    top: -32,
    right: -32,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#dce9ff',
    opacity: 0.6,
  },
  cardTopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    zIndex: 2,
  },
  operatorBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#eff4ff',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 9999,
  },
  badgeIconDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  operatorBadgeText: {
    color: colors.primaryContainer,
  },
  shareBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#e5eeff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleSection: {
    marginBottom: spacing.md,
    zIndex: 2,
  },
  offerTitle: {
    color: '#0b1c30',
    fontWeight: '700',
  },
  verificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  verificationText: {
    color: '#444651',
  },

  /* Bento Grid */
  bentoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    zIndex: 2,
  },
  bentoTile: {
    flexBasis: '48%',
    flexGrow: 1,
    backgroundColor: '#eff4ff',
    borderRadius: 12,
    padding: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bentoIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#d3e4fe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bentoTextBox: {
    flex: 1,
  },
  bentoValue: {
    color: '#0b1c30',
    fontWeight: '700',
  },
  bentoLabel: {
    color: '#444651',
  },

  /* Price Summary Box */
  priceSummaryBox: {
    marginTop: spacing.md,
    backgroundColor: 'rgba(239, 244, 255, 0.65)',
    borderRadius: 12,
    padding: spacing.md,
    gap: 8,
    zIndex: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  priceLeft: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  mainPriceText: {
    color: colors.primaryContainer,
    fontWeight: '800',
  },
  strikethroughPrice: {
    color: colors.outline,
    textDecorationLine: 'line-through',
  },
  saveTag: {
    backgroundColor: 'rgba(253, 118, 26, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  saveTagText: {
    color: colors.secondaryContainer,
    fontWeight: '700',
  },
  taxText: {
    color: '#444651',
  },
  cashbackBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(127, 252, 151, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  cashbackBannerText: {
    color: '#004b1d',
    fontWeight: '700',
  },

  /* Recipient Card */
  recipientCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: spacing.md,
    shadowColor: '#1e3a8a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    gap: 12,
    borderWidth: 1,
    borderColor: '#eff4ff',
  },
  recipientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recipientTitle: {
    color: '#0b1c30',
    fontWeight: '600',
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#e5eeff',
    padding: 3,
    borderRadius: 9999,
  },
  segmentBtn: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  segmentBtnActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  segmentTextActive: {
    color: colors.primaryContainer,
    fontWeight: '700',
  },
  segmentTextInactive: {
    color: '#444651',
    fontWeight: '600',
  },

  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff4ff',
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    height: 52,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  bdPrefix: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingRight: 10,
    marginRight: 6,
    borderRightWidth: 1,
    borderRightColor: 'rgba(197, 197, 211, 0.4)',
  },
  bdFlag: {
    fontSize: 18,
  },
  bdPrefixText: {
    color: '#0b1c30',
    fontWeight: '700',
  },
  phoneInput: {
    flex: 1,
    color: '#0b1c30',
    fontWeight: '600',
    letterSpacing: 0.8,
  },
  verifiedCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#7ffc97',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  detectionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pulsingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#004b1d',
  },
  detectionText: {
    color: '#444651',
    fontWeight: '500',
  },
  changeOperatorText: {
    color: colors.primaryContainer,
    fontWeight: '700',
  },

  utilityRow: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 4,
  },
  utilityBtn: {
    flex: 1,
    height: 42,
    backgroundColor: '#eff4ff',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  utilityBtnText: {
    color: '#444651',
    fontWeight: '600',
  },

  /* Accordion Card */
  accordionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#1e3a8a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eff4ff',
  },
  accordionHeader: {
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  accordionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  accordionIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#eff4ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  accordionTitle: {
    color: '#0b1c30',
    fontWeight: '600',
  },
  accordionBody: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#eff4ff',
    paddingTop: spacing.sm,
  },
  termsLine: {
    color: '#444651',
    lineHeight: 20,
  },

  /* Bottom Bar */
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#eff4ff',
    paddingHorizontal: spacing.gutter,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 8,
  },
  bottomPriceCol: {
    gap: 2,
  },
  bottomPriceLabel: {
    color: '#444651',
  },
  bottomPriceValue: {
    color: colors.primaryContainer,
    fontWeight: '800',
  },
  checkoutBtn: {
    backgroundColor: colors.secondaryContainer,
    borderRadius: 14,
    height: 48,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: colors.secondaryContainer,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  checkoutBtnText: {
    color: '#ffffff',
    fontWeight: '700',
  },
});
