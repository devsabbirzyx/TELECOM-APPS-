import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
  TextInput,
  Modal,
} from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { rounded, spacing } from '../../theme/spacing';
import { Header } from '../../components/Header';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { PaymentMethod } from '../../types';
import { useOrder } from '../../context/OrderContext';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { validateBangladeshiPhoneNumber } from '../../utils/phoneValidator';

type CheckoutRouteProp = RouteProp<RootStackParamList, 'Checkout'>;
type CheckoutNavProp = StackNavigationProp<RootStackParamList, 'Checkout'>;

interface Props {
  route: CheckoutRouteProp;
  navigation: CheckoutNavProp;
}

export const CheckoutScreen: React.FC<Props> = ({ route, navigation }) => {
  const { offer } = route.params;
  const { user } = useAuth();
  const {
    recipientNumber,
    setRecipientNumber,
    paymentMethod,
    setPaymentMethod,
  } = useOrder();

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(paymentMethod || 'bkash');
  const [phone, setPhone] = useState(recipientNumber || user?.phone_number || '01712-345678');
  const [editPhoneModal, setEditPhoneModal] = useState(false);
  const [tempPhone, setTempPhone] = useState(phone);

  // Live countdown timer (e.g. 09:42 counting down)
  const [secondsLeft, setSecondsLeft] = useState(582); // 9 mins 42 secs

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const originalPrice = Math.round(offer.offer_price * 1.3);
  const discountAmount = originalPrice - offer.offer_price;

  const handlePay = () => {
    const validation = validateBangladeshiPhoneNumber(phone);
    if (!validation.isValid) {
      Alert.alert('ভুল মোবাইল নম্বর (Invalid Number)', validation.error || 'সঠিক ১১ ডিজিটের বাংলাদেশি নম্বর দিন।');
      return;
    }

    setRecipientNumber(validation.cleanNumber);
    setPaymentMethod(selectedMethod);

    const orderId = `ORD-${Date.now().toString().slice(-6)}`;
    const invoiceNumber = `INV-${Math.floor(100000 + Math.random() * 900000)}`;

    if (selectedMethod === 'bkash') {
      navigation.navigate('BkashGateway', {
        orderId,
        amount: offer.offer_price,
        invoiceNumber,
      });
    } else if (selectedMethod === 'nagad') {
      navigation.navigate('NagadGateway', {
        orderId,
        amount: offer.offer_price,
        invoiceNumber,
      });
    } else {
      navigation.navigate('PaymentProcessing', {
        orderId,
        paymentMethod: selectedMethod,
      });
    }
  };

  return (
    <View style={styles.container}>
      {/* Stitch Header */}
      <Header
        title="Checkout Review"
        showBack
        onBack={() => navigation.goBack()}
        showNotification
        hasUnreadNotifications
        onNotificationPress={() => navigation.navigate('Notifications')}
        showProfile
        onProfilePress={() => navigation.navigate('EditProfile')}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Status & Quick Reassurance Badge (Stitch 10) */}
        <View style={styles.reassuranceRow}>
          <View style={styles.activationBadge}>
            <Ionicons name="flash" size={15} color={colors.primaryContainer} />
            <Text style={[typography.labelSm, styles.activationText]}>Fast SIM Activation</Text>
          </View>
          <View style={styles.countdownRow}>
            <Ionicons name="timer-outline" size={15} color={colors.primaryContainer} />
            <Text style={[typography.labelSm, styles.countdownText]}>
              Offer locks in {formatTimer(secondsLeft)}
            </Text>
          </View>
        </View>

        {/* Order Summary Card (Stitch 10) */}
        <View style={styles.summaryCard}>
          {/* Top Operator Header & Badges */}
          <View style={styles.operatorTop}>
            <View style={styles.operatorLeft}>
              <View style={styles.operatorIconTile}>
                <Ionicons name="cellular" size={22} color={colors.primaryContainer} />
              </View>
              <View>
                <View style={styles.tagRow}>
                  <View style={styles.superBadge}>
                    <Text style={[typography.labelSm, styles.superBadgeText]}>
                      {offer.operator_code.toUpperCase()} Super
                    </Text>
                  </View>
                  <View style={styles.exclusiveBadge}>
                    <Text style={[typography.labelSm, styles.exclusiveBadgeText]}>Exclusive</Text>
                  </View>
                </View>
                <Text style={[typography.titleMd, styles.packTitle]} numberOfLines={1}>
                  {offer.title}
                </Text>
              </View>
            </View>
            <View style={styles.validityCol}>
              <Text style={[typography.labelSm, styles.validityLabel]}>Validity</Text>
              <Text style={[typography.labelMd, styles.validityValue]}>
                {offer.validity_days} Days
              </Text>
            </View>
          </View>

          {/* Recipient SIM Banner */}
          <View style={styles.recipientBanner}>
            <View style={styles.recipientLeft}>
              <Ionicons name="call" size={18} color={colors.primaryContainer} />
              <View>
                <Text style={[typography.labelSm, styles.recipientLabel]}>Recipient SIM</Text>
                <Text style={[typography.labelMd, styles.recipientNumber]}>{phone}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.editPhoneBtn}
              onPress={() => {
                setTempPhone(phone);
                setEditPhoneModal(true);
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="pencil" size={15} color={colors.primaryContainer} />
            </TouchableOpacity>
          </View>

          {/* Price Calculation Breakdown */}
          <View style={styles.priceBreakdown}>
            <View style={styles.priceLine}>
              <Text style={[typography.bodyMd, styles.priceLineLabel]}>Original Package Price</Text>
              <Text style={[typography.bodyMd, styles.strikethroughPrice]}>৳{originalPrice}</Text>
            </View>
            <View style={styles.priceLine}>
              <View style={styles.discountLabelRow}>
                <Ionicons name="pricetag" size={15} color="#004b1d" />
                <Text style={[typography.bodyMd, styles.discountText]}>
                  Mobixa Flash Discount
                </Text>
              </View>
              <Text style={[typography.labelMd, styles.discountVal]}>-৳{discountAmount}</Text>
            </View>

            {/* Final Payable Amount Box */}
            <View style={styles.finalPayableBox}>
              <View>
                <Text style={[typography.labelSm, styles.finalLabel]}>Final Payable Amount</Text>
                <Text style={[typography.labelSm, styles.taxSubtext]}>
                  Includes all telecom vat & tax
                </Text>
              </View>
              <Text style={[typography.headlineMd, styles.finalPrice]}>
                ৳{offer.offer_price}
              </Text>
            </View>
          </View>
        </View>

        {/* Payment Selection Section Header */}
        <View style={styles.paymentSectionHeader}>
          <Text style={[typography.titleMd, styles.paymentTitle]}>Select Payment Method</Text>
          <View style={styles.secureBadge}>
            <Ionicons name="shield-checkmark" size={13} color="#004b1d" />
            <Text style={[typography.labelSm, styles.secureBadgeText]}>100% Secure</Text>
          </View>
        </View>

        {/* Payment Options (Stitch 10) */}
        <View style={styles.paymentSelector}>
          {/* Option 1: bKash Card */}
          <TouchableOpacity
            style={[
              styles.paymentOptionCard,
              selectedMethod === 'bkash' && styles.paymentOptionCardActive,
            ]}
            onPress={() => setSelectedMethod('bkash')}
            activeOpacity={0.85}
          >
            <View style={styles.cardMain}>
              <View style={styles.radioTarget}>
                {selectedMethod === 'bkash' && <View style={styles.radioInnerDot} />}
              </View>
              <View style={styles.methodInfo}>
                <View style={styles.methodTitleRow}>
                  <Text style={[typography.labelLg, styles.methodTitle]}>Pay with bKash</Text>
                  <View style={styles.cashbackBadge}>
                    <Text style={[typography.labelSm, styles.cashbackBadgeText]}>Instant ৳20 Back</Text>
                  </View>
                </View>
                <Text style={[typography.bodySm, styles.methodDesc]}>
                  Instant carrier airtime & auto cash-back
                </Text>
                <View style={styles.featureRow}>
                  <Ionicons name="checkmark-circle" size={14} color="#004b1d" />
                  <Text style={[typography.labelSm, styles.featureText]}>Zero transaction fee</Text>
                </View>
              </View>
              <View style={styles.logoBox}>
                <Image
                  source={require('../../../assets/bkash_logo.png')}
                  style={styles.gatewayLogo}
                  resizeMode="contain"
                />
              </View>
            </View>
          </TouchableOpacity>

          {/* Option 2: Nagad Card */}
          <TouchableOpacity
            style={[
              styles.paymentOptionCard,
              selectedMethod === 'nagad' && styles.paymentOptionCardActive,
            ]}
            onPress={() => setSelectedMethod('nagad')}
            activeOpacity={0.85}
          >
            <View style={styles.cardMain}>
              <View style={styles.radioTarget}>
                {selectedMethod === 'nagad' && <View style={styles.radioInnerDot} />}
              </View>
              <View style={styles.methodInfo}>
                <View style={styles.methodTitleRow}>
                  <Text style={[typography.labelLg, styles.methodTitle]}>Pay with Nagad</Text>
                  <View style={styles.govtBadge}>
                    <Text style={[typography.labelSm, styles.govtBadgeText]}>Digital Post</Text>
                  </View>
                </View>
                <Text style={[typography.bodySm, styles.methodDesc]}>
                  Fast & secure Bangladesh Post digital wallet
                </Text>
                <View style={styles.featureRow}>
                  <Ionicons name="shield-checkmark" size={14} color={colors.primaryContainer} />
                  <Text style={[typography.labelSm, styles.featureText]}>Govt. Postal Service</Text>
                </View>
              </View>
              <View style={styles.logoBox}>
                <Image
                  source={require('../../../assets/nagad_logo.png')}
                  style={styles.gatewayLogo}
                  resizeMode="contain"
                />
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Security Reassurance Box (Stitch 10) */}
        <View style={styles.securityBox}>
          <View style={styles.securityIconBox}>
            <Ionicons name="lock-closed" size={18} color={colors.primaryContainer} />
          </View>
          <View style={styles.securityTextBox}>
            <Text style={[typography.labelMd, styles.securityTitle]}>
              256-bit Bank Grade Encryption
            </Text>
            <Text style={[typography.bodySm, styles.securitySub]}>
              Payments are processed via authorized MFS direct debits.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomPriceCol}>
          <Text style={[typography.labelSm, styles.bottomLabel]}>Total Amount</Text>
          <Text style={[typography.headlineMd, styles.bottomVal]}>৳{offer.offer_price}</Text>
        </View>

        <TouchableOpacity
          style={styles.payBtn}
          onPress={handlePay}
          activeOpacity={0.85}
        >
          <Ionicons name="shield-checkmark" size={18} color="#ffffff" />
          <Text style={[typography.labelLg, styles.payBtnText]}>
            Pay ৳{offer.offer_price} Securely
          </Text>
        </TouchableOpacity>
      </View>

      {/* Edit Phone Number Modal */}
      <Modal
        visible={editPhoneModal}
        transparent
        animationType="fade"
        onRequestClose={() => setEditPhoneModal(false)}
      >
        <View style={styles.editModalOverlay}>
          <View style={styles.editModalContent}>
            <Text style={[typography.titleMd, styles.editModalTitle]}>Edit Recipient Number</Text>
            <TextInput
              style={styles.editModalInput}
              value={tempPhone}
              onChangeText={setTempPhone}
              placeholder="017XX-XXXXXX"
              keyboardType="phone-pad"
            />
            <View style={styles.editModalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setEditPhoneModal(false)}
              >
                <Text style={[typography.labelMd, styles.modalCancelText]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSaveBtn}
                onPress={() => {
                  const validation = validateBangladeshiPhoneNumber(tempPhone);
                  if (!validation.isValid) {
                    Alert.alert('ভুল মোবাইল নম্বর', validation.error || 'সঠিক ১১ ডিজিটের বাংলাদেশি নম্বর দিন।');
                    return;
                  }
                  setPhone(validation.cleanNumber);
                  setRecipientNumber(validation.cleanNumber);
                  setEditPhoneModal(false);
                }}
              >
                <Text style={[typography.labelMd, styles.modalSaveText]}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingTop: spacing.sm,
    paddingBottom: 110,
    gap: spacing.md,
  },

  /* Reassurance Row */
  reassuranceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#dce9ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  activationText: {
    color: colors.primaryContainer,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  countdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  countdownText: {
    color: '#444651',
  },

  /* Order Summary Card */
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: spacing.md,
    shadowColor: '#1e3a8a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
    gap: 12,
    borderWidth: 1,
    borderColor: '#eff4ff',
  },
  operatorTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  operatorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  operatorIconTile: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#eff4ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  superBadge: {
    backgroundColor: '#dce9ff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  superBadgeText: {
    color: colors.primaryContainer,
    fontWeight: '700',
  },
  exclusiveBadge: {
    backgroundColor: '#7ffc97',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  exclusiveBadgeText: {
    color: '#002109',
    fontWeight: '700',
  },
  packTitle: {
    color: '#0b1c30',
    fontWeight: '600',
  },
  validityCol: {
    alignItems: 'flex-end',
  },
  validityLabel: {
    color: '#444651',
  },
  validityValue: {
    color: colors.primaryContainer,
    fontWeight: '700',
  },

  /* Recipient SIM Banner */
  recipientBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#eff4ff',
    borderRadius: 12,
    padding: spacing.sm,
  },
  recipientLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  recipientLabel: {
    color: '#444651',
  },
  recipientNumber: {
    color: '#0b1c30',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  editPhoneBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },

  /* Price Calculation */
  priceBreakdown: {
    gap: 8,
    paddingTop: 4,
  },
  priceLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceLineLabel: {
    color: '#444651',
  },
  strikethroughPrice: {
    color: colors.outline,
    textDecorationLine: 'line-through',
  },
  discountLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  discountText: {
    color: '#004b1d',
  },
  discountVal: {
    color: '#004b1d',
    fontWeight: '700',
  },
  finalPayableBox: {
    backgroundColor: '#e5eeff',
    borderRadius: 12,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  finalLabel: {
    color: '#444651',
  },
  taxSubtext: {
    color: '#004b1d',
    marginTop: 2,
  },
  finalPrice: {
    color: colors.primaryContainer,
    fontWeight: '800',
  },

  /* Payment Section Header */
  paymentSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  paymentTitle: {
    color: '#0b1c30',
    fontWeight: '600',
  },
  secureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#dce9ff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
  },
  secureBadgeText: {
    color: '#004b1d',
    fontWeight: '700',
  },

  /* Payment Options */
  paymentSelector: {
    gap: 12,
  },
  paymentOptionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: spacing.md,
    shadowColor: '#1e3a8a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  paymentOptionCardActive: {
    borderColor: colors.secondaryContainer,
    shadowColor: colors.secondaryContainer,
    shadowOpacity: 0.12,
    shadowRadius: 12,
  },
  cardMain: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  radioTarget: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.outline,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  radioInnerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.secondaryContainer,
  },
  methodInfo: {
    flex: 1,
  },
  methodTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  methodTitle: {
    color: '#0b1c30',
    fontWeight: '700',
  },
  cashbackBadge: {
    backgroundColor: '#ffdbca',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  cashbackBadgeText: {
    color: '#9d4300',
    fontWeight: '700',
  },
  govtBadge: {
    backgroundColor: '#dce9ff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  govtBadgeText: {
    color: colors.primaryContainer,
    fontWeight: '600',
  },
  methodDesc: {
    color: '#444651',
    marginTop: 2,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  featureText: {
    color: '#444651',
  },
  logoBox: {
    width: 60,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gatewayLogo: {
    width: '100%',
    height: '100%',
  },

  /* Security Box */
  securityBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#eff4ff',
    borderRadius: 14,
    padding: spacing.md,
    marginTop: 4,
  },
  securityIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#dce9ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  securityTextBox: {
    flex: 1,
  },
  securityTitle: {
    color: '#0b1c30',
    fontWeight: '700',
  },
  securitySub: {
    color: '#444651',
    marginTop: 2,
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
  bottomLabel: {
    color: '#444651',
  },
  bottomVal: {
    color: colors.primaryContainer,
    fontWeight: '800',
  },
  payBtn: {
    backgroundColor: colors.secondaryContainer,
    borderRadius: 14,
    height: 48,
    paddingHorizontal: 20,
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
  payBtnText: {
    color: '#ffffff',
    fontWeight: '700',
  },

  /* Edit Modal */
  editModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    paddingHorizontal: spacing.gutter,
  },
  editModalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: spacing.lg,
    gap: spacing.md,
  },
  editModalTitle: {
    color: '#0b1c30',
    fontWeight: '700',
  },
  editModalInput: {
    backgroundColor: '#eff4ff',
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    height: 48,
    color: '#0b1c30',
    fontSize: 16,
  },
  editModalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalCancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  modalCancelText: {
    color: '#444651',
  },
  modalSaveBtn: {
    backgroundColor: colors.primaryContainer,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  modalSaveText: {
    color: '#ffffff',
    fontWeight: '700',
  },
});
