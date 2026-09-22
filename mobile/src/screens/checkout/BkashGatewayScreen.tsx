import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOrder } from '../../context/OrderContext';
import { validateBangladeshiPhoneNumber } from '../../utils/phoneValidator';

type BkashRouteProp = RouteProp<RootStackParamList, 'BkashGateway'>;
type BkashNavProp = StackNavigationProp<RootStackParamList, 'BkashGateway'>;

interface Props {
  route: BkashRouteProp;
  navigation: BkashNavProp;
}

export const BkashGatewayScreen: React.FC<Props> = ({ route, navigation }) => {
  const { orderId } = route.params;
  const insets = useSafeAreaInsets();
  const { recipientNumber } = useOrder();

  // Step 1: Account Number, Step 2: Verification Code (OTP), Step 3: PIN
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [accountNumber, setAccountNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);

  // Overall Session Countdown Timer (e.g. 9:37)
  const [totalSeconds, setTotalSeconds] = useState(577); // 9:37

  // OTP Resend Timer (e.g. 21s)
  const [resendSeconds, setResendSeconds] = useState(21);

  useEffect(() => {
    const timer = setInterval(() => {
      setTotalSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (step === 2) {
      setResendSeconds(21);
      const resendTimer = setInterval(() => {
        setResendSeconds((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(resendTimer);
    }
  }, [step]);

  const formatSessionTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Mask phone number: e.g. "019 ** *** 981"
  const getMaskedPhone = () => {
    const raw = (accountNumber || recipientNumber || '01912345981').replace(/[^0-9]/g, '');
    if (raw.length >= 11) {
      const prefix = raw.slice(0, 3);
      const suffix = raw.slice(-3);
      return `${prefix} ** *** ${suffix}`;
    }
    return '019 ** *** 981';
  };

  const handleConfirm = () => {
    if (step === 1) {
      const validation = validateBangladeshiPhoneNumber(accountNumber);
      if (!validation.isValid) {
        Alert.alert('ভুল বিকাশ নম্বর (bKash Error)', validation.error || 'সঠিক ১১ ডিজিটের বিকাশ নম্বর দিন (যেমন: 017XXXXXXXX)');
        return;
      }
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setStep(2);
      }, 500);
    } else if (step === 2) {
      if (otp.length < 4) {
        Alert.alert('bKash Error', 'Please enter the 6-digit verification code.');
        return;
      }
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setStep(3);
      }, 500);
    } else if (step === 3) {
      if (pin.length < 5) {
        Alert.alert('bKash Error', 'Please enter your 5-digit bKash PIN.');
        return;
      }
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        navigation.replace('PaymentProcessing', {
          orderId,
          paymentMethod: 'bkash',
        });
      }, 800);
    }
  };

  const handleClose = () => {
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { paddingTop: insets.top || 16 }]}
    >
      {/* Floating Back Navigation Arrow (Without Recharge / Balance bar) */}
      <View style={styles.floatingHeader}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.floatingBackButton}
          activeOpacity={0.7}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="arrow-back" size={22} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Dimmed / Grey Backdrop with Centered Modal Card */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.modalCard}>
          {/* Card Top: White Brand Section */}
          <View style={styles.whiteBrandSection}>
            {/* bKash Official Logo */}
            <View style={styles.bkashLogoContainer}>
              <Image
                source={require('../../../assets/bkash_logo.png')}
                style={styles.bkashLogoImage}
                resizeMode="contain"
              />
            </View>

            {/* Separator */}
            <View style={styles.sectionDivider} />

            {/* App Brand / Merchant Row (OfferHut) */}
            <View style={styles.merchantRow}>
              <View style={styles.appLogoCircle}>
                <Ionicons name="flash" size={15} color="#ffffff" />
              </View>
              <Text style={styles.merchantName}>Mobixa</Text>
            </View>
          </View>

          {/* Timer Strip (Matching Screenshot) */}
          <View style={styles.timerStrip}>
            <View style={styles.timerProgressBar} />
            <Text style={styles.timerText}>{formatSessionTime(totalSeconds)}</Text>
          </View>

          {/* Signature bKash Pink Body Section (#df146e) */}
          <View style={styles.pinkBodySection}>
            {/* Subtle Watermark Circles */}
            <View style={styles.watermarkCircle1} />
            <View style={styles.watermarkCircle2} />

            {/* STEP 1: Account Number Entry (Image 2) */}
            {step === 1 && (
              <View style={styles.stepContent}>
                <Text style={styles.pinkTitle}>Your bKash Account Number</Text>

                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.whiteInput}
                    placeholder="e.g 01XXXXXXXXX"
                    placeholderTextColor="#9e9e9e"
                    value={accountNumber}
                    onChangeText={setAccountNumber}
                    keyboardType="phone-pad"
                    maxLength={11}
                    autoFocus
                    textAlign="center"
                  />
                </View>

                {/* Non bKash Wallet Warning */}
                <View style={styles.warningRow}>
                  <Ionicons name="warning-outline" size={14} color="#fef08a" />
                  <Text style={styles.warningText}>Non bKash Wallet</Text>
                </View>

                {/* Agreement & Terms */}
                <Text style={styles.termsText}>
                  By clicking the confirm button you agree to the{'\n'}
                  <Text style={styles.termsLink}>Terms & Conditions</Text>
                </Text>
              </View>
            )}

            {/* STEP 2: OTP Verification Code (Image 1) */}
            {step === 2 && (
              <View style={styles.stepContent}>
                <Text style={styles.pinkTitle}>
                  Enter verification code sent to {getMaskedPhone()}
                </Text>

                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.whiteInput}
                    placeholder="Enter 6 digit code"
                    placeholderTextColor="#9e9e9e"
                    value={otp}
                    onChangeText={setOtp}
                    keyboardType="number-pad"
                    maxLength={6}
                    autoFocus
                    textAlign="center"
                  />
                </View>

                {/* Resend Timer */}
                <TouchableOpacity
                  disabled={resendSeconds > 0}
                  onPress={() => setResendSeconds(21)}
                  style={styles.resendBtn}
                >
                  <Text style={styles.resendText}>
                    {resendSeconds > 0 ? `Resend Code in ${resendSeconds}s` : 'Resend Code'}
                  </Text>
                </TouchableOpacity>

                {/* Direct Debit Disclaimer */}
                <Text style={styles.authorizeDisclaimer}>
                  You authorize bKash to process your future transactions with this merchant without PIN
                </Text>
              </View>
            )}

            {/* STEP 3: PIN Entry */}
            {step === 3 && (
              <View style={styles.stepContent}>
                <Text style={styles.pinkTitle}>Enter 5 digit PIN</Text>

                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.whiteInput}
                    placeholder="Enter PIN"
                    placeholderTextColor="#9e9e9e"
                    value={pin}
                    onChangeText={setPin}
                    keyboardType="number-pad"
                    secureTextEntry
                    maxLength={5}
                    autoFocus
                    textAlign="center"
                  />
                </View>

                <Text style={styles.termsText}>
                  Never share your bKash PIN or OTP with anyone.
                </Text>
              </View>
            )}
          </View>

          {/* Action Buttons: CLOSE & CONFIRM */}
          <View style={styles.actionButtonRow}>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={handleClose}
              activeOpacity={0.8}
            >
              <Text style={styles.closeBtnText}>CLOSE</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.confirmBtn, loading && { opacity: 0.7 }]}
              onPress={handleConfirm}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={styles.confirmBtnText}>
                {loading ? 'WAITING...' : 'CONFIRM'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* bKash 24/7 Helpline Prompt */}
        <View style={styles.helplineRow}>
          <Ionicons name="call" size={13} color="#ffffff" />
          <Text style={styles.helplineText}>bKash Helpline: 16247</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#8c94a4', // Dimmed backdrop as seen in user screenshots
  },

  /* Floating Back Button Header */
  floatingHeader: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  floatingBackButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Scrollable Modal Wrapper */
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 40,
    paddingHorizontal: 16,
  },

  /* Modal Card */
  modalCard: {
    width: '100%',
    maxWidth: 390,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },

  /* White Brand Section */
  whiteBrandSection: {
    backgroundColor: '#ffffff',
    paddingTop: 16,
    paddingBottom: 12,
    paddingHorizontal: 18,
  },
  bkashLogoContainer: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bkashLogoImage: {
    width: 140,
    height: 42,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginVertical: 10,
  },
  merchantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  appLogoCircle: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#1e3a8a', // OfferHut primary brand color
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  merchantName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e3a8a',
    letterSpacing: 0.3,
  },

  /* Timer Strip */
  timerStrip: {
    backgroundColor: '#ffffff',
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderTopWidth: 1,
    borderTopColor: '#fce4ec',
  },
  timerProgressBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '25%',
    backgroundColor: '#fce4ec',
  },
  timerText: {
    color: '#990033', // Deep maroon countdown text
    fontSize: 14,
    fontWeight: '700',
  },

  /* Signature bKash Pink Body (#df146e) */
  pinkBodySection: {
    backgroundColor: '#df146e',
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 28,
    position: 'relative',
    overflow: 'hidden',
  },
  watermarkCircle1: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  watermarkCircle2: {
    position: 'absolute',
    bottom: -15,
    left: -15,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },

  stepContent: {
    alignItems: 'center',
    width: '100%',
  },
  pinkTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 14,
    lineHeight: 20,
  },
  inputWrapper: {
    width: '100%',
    marginBottom: 8,
  },
  whiteInput: {
    backgroundColor: '#ffffff',
    height: 44,
    borderRadius: 6,
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#111827',
    fontWeight: '600',
    letterSpacing: 0.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },

  /* Warnings & Terms */
  warningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
    marginBottom: 6,
  },
  warningText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
  termsText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 6,
  },
  termsLink: {
    textDecorationLine: 'underline',
    fontWeight: '700',
    color: '#ffffff',
  },

  /* OTP Specifics */
  resendBtn: {
    marginTop: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  resendText: {
    color: 'rgba(255, 255, 255, 0.95)',
    fontSize: 12,
    fontWeight: '500',
  },
  authorizeDisclaimer: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 14,
    marginTop: 36,
    paddingHorizontal: 8,
  },

  /* Action Buttons (CLOSE & CONFIRM) */
  actionButtonRow: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  closeBtn: {
    flex: 1,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6b7280',
  },
  closeBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  confirmBtn: {
    flex: 1,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#b81856', // Deep crimson/pink confirm button
  },
  confirmBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  /* Helpline */
  helplineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 18,
  },
  helplineText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '500',
    opacity: 0.85,
  },
});
