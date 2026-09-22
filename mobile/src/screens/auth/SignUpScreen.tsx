import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  Alert,
  Image,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { validateBangladeshiPhoneNumber, getOperatorFromPrefix } from '../../utils/phoneValidator';

type SignUpNavProp = StackNavigationProp<RootStackParamList, 'SignUp'>;

interface Props {
  navigation: SignUpNavProp;
}

export const SignUpScreen: React.FC<Props> = ({ navigation }) => {
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    fullName?: string;
    phoneNumber?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const { register } = useAuth();
  const insets = useSafeAreaInsets();

  const detectedOperator = getOperatorFromPrefix(phoneNumber);

  const handleRegister = async () => {
    const newErrors: typeof errors = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    // Strict Bangladeshi Phone Validation
    const phoneValidation = validateBangladeshiPhoneNumber(phoneNumber);
    if (!phoneValidation.isValid) {
      newErrors.phoneNumber = phoneValidation.error;
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match!';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const firstError = Object.values(newErrors)[0];
      Alert.alert('Validation Error', firstError);
      return;
    }

    if (!agreeTerms) {
      Alert.alert('Terms Required', 'Please agree to the Terms of Service & Privacy Policy.');
      return;
    }

    setErrors({});
    setLoading(true);
    try {
      await register({
        full_name: fullName.trim(),
        phone_number: phoneValidation.cleanNumber,
        password,
      });
      Alert.alert(
        'অভিনন্দন! 🎉',
        'আপনার Mobixa অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে এবং ৫০ টাকা সাইন-আপ বোনাস ওয়ালেটে যোগ করা হয়েছে! এখন লগইন করুন।',
        [
          {
            text: 'লগইন করুন',
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
    } catch (err: any) {
      Alert.alert(
        'রেজিস্ট্রেশন ব্যর্থ হয়েছে',
        err.message || 'এই নম্বরে অ্যাকাউন্ট তৈরি করা যায়নি। অনুগ্রহ করে পুনরায় চেষ্টা করুন।'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { paddingTop: insets.top || 16 }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Top Blue Header Card */}
        <View style={styles.topCard}>
          <TouchableOpacity
            style={styles.cardBackBtn}
            onPress={() => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Onboarding'))}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color="#ffffff" />
          </TouchableOpacity>
          <View style={styles.topCardLogo}>
            <Ionicons name="home" size={26} color="#f97316" />
          </View>
          <View style={styles.offerhutBadge}>
            <View style={styles.orangeDot} />
            <Text style={styles.offerhutBadgeText}>MOBIXA BD</Text>
          </View>
          <Text style={styles.headerTitle}>Create Account</Text>
          <Text style={styles.headerSubtitle}>
            Join Mobixa to grab exclusive SIM packages & instant cashback
          </Text>
        </View>

        {/* 3 Horizontal Feature Badges */}
        <View style={styles.featureRow}>
          <View style={styles.featurePill}>
            <View style={[styles.pillIconBox, { backgroundColor: '#dcfce7' }]}>
              <Ionicons name="wallet-outline" size={14} color="#16a34a" />
            </View>
            <View>
              <Text style={styles.pillTitle}>৳ CashB...</Text>
              <Text style={styles.pillSubtitle}>Up to ৳120</Text>
            </View>
          </View>

          <View style={styles.featurePill}>
            <View style={[styles.pillIconBox, { backgroundColor: '#e0e7ff' }]}>
              <Ionicons name="cellular-outline" size={14} color="#4338ca" />
            </View>
            <View>
              <Text style={styles.pillTitle}>All Opera...</Text>
              <Text style={styles.pillSubtitle}>GP, Robi, ...</Text>
            </View>
          </View>

          <View style={styles.featurePill}>
            <View style={[styles.pillIconBox, { backgroundColor: '#ffedd5' }]}>
              <Ionicons name="flash-outline" size={14} color="#ea580c" />
            </View>
            <View>
              <Text style={styles.pillTitle}>Instant Fl...</Text>
              <Text style={styles.pillSubtitle}>3-Sec Top...</Text>
            </View>
          </View>
        </View>

        {/* Form Fields */}
        <View style={styles.formContainer}>
          {/* Full Name */}
          <View style={styles.fieldGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.fieldLabel}>Full Name</Text>
              <Text style={styles.requiredTag}>Required</Text>
            </View>
            <View style={[styles.inputWrapper, errors.fullName ? styles.inputError : undefined]}>
              <Ionicons
                name="person-outline"
                size={18}
                color={errors.fullName ? '#ba1a1a' : '#757682'}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Tanvir Ahmed"
                placeholderTextColor="#94a3b8"
                value={fullName}
                onChangeText={(text) => {
                  setFullName(text);
                  if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: undefined }));
                }}
              />
            </View>
            {errors.fullName ? <Text style={styles.inlineError}>{errors.fullName}</Text> : null}
          </View>

          {/* Mobile Number */}
          <View style={styles.fieldGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.fieldLabel}>Mobile Number</Text>
              <Text style={styles.bdOnlyTag}>BD Operators Only</Text>
            </View>
            <View style={styles.phoneInputWrapper}>
              <View style={styles.bdPill}>
                <Text style={styles.bdPillText}>BD +880</Text>
              </View>
              <TextInput
                style={[styles.phoneInput, errors.phoneNumber ? styles.inputError : undefined]}
                placeholder="01XXXXXXXXX"
                placeholderTextColor="#94a3b8"
                value={phoneNumber}
                onChangeText={(text) => {
                  setPhoneNumber(text);
                  if (errors.phoneNumber) setErrors((prev) => ({ ...prev, phoneNumber: undefined }));
                }}
                keyboardType="phone-pad"
                maxLength={11}
              />
            </View>
            {errors.phoneNumber ? <Text style={styles.inlineError}>{errors.phoneNumber}</Text> : null}
          </View>

          {/* Password */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Password</Text>
            <View style={[styles.inputWrapper, errors.password ? styles.inputError : undefined]}>
              <Ionicons
                name="lock-closed-outline"
                size={18}
                color={errors.password ? '#ba1a1a' : '#757682'}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.textInput}
                placeholder="Enter password (min 6 chars)"
                placeholderTextColor="#94a3b8"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                  if (confirmPassword && text !== confirmPassword) {
                    setErrors((prev) => ({ ...prev, confirmPassword: 'Passwords do not match!' }));
                  } else if (confirmPassword && text === confirmPassword) {
                    setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                  }
                }}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={18} color="#757682" />
              </TouchableOpacity>
            </View>
            {errors.password ? <Text style={styles.inlineError}>{errors.password}</Text> : null}
          </View>

          {/* Confirm Password */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Confirm Password</Text>
            <View style={[styles.inputWrapper, errors.confirmPassword ? styles.inputError : undefined]}>
              <Ionicons
                name="shield-outline"
                size={18}
                color={errors.confirmPassword ? '#ba1a1a' : '#757682'}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.textInput}
                placeholder="Confirm password"
                placeholderTextColor="#94a3b8"
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  if (password && text !== password) {
                    setErrors((prev) => ({ ...prev, confirmPassword: 'Passwords do not match!' }));
                  } else {
                    setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                  }
                }}
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <Ionicons name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'} size={18} color="#757682" />
              </TouchableOpacity>
            </View>
            {errors.confirmPassword ? <Text style={styles.inlineError}>{errors.confirmPassword}</Text> : null}
          </View>

          {/* Terms Checkbox */}
          <TouchableOpacity
            style={styles.termsRow}
            onPress={() => setAgreeTerms(!agreeTerms)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, agreeTerms && styles.checkboxChecked]}>
              {agreeTerms && <Ionicons name="checkmark" size={12} color="#ffffff" />}
            </View>
            <Text style={styles.termsText}>
              I agree to Mobixa's <Text style={styles.termsLink}>Terms of Service</Text> &{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </TouchableOpacity>

          {/* Sign Up Button */}
          <TouchableOpacity
            style={styles.signUpBtn}
            onPress={handleRegister}
            activeOpacity={0.85}
            disabled={loading}
          >
            <Text style={styles.signUpBtnText}>{loading ? 'Creating...' : 'Sign Up'}</Text>
            <Ionicons name="arrow-forward" size={18} color="#ffffff" />
          </TouchableOpacity>

          {/* We accept this Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>We accept this</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* bKash & Nagad Badges */}
          <View style={styles.paymentBadgesRow}>
            <View style={styles.gatewayBadge}>
              <Image
                source={require('../../../assets/bkash_logo.png')}
                style={styles.gatewayLogo}
                resizeMode="contain"
              />
            </View>
            <View style={styles.gatewayBadge}>
              <Image
                source={require('../../../assets/nagad_logo.png')}
                style={styles.gatewayLogo}
                resizeMode="contain"
              />
            </View>
          </View>

          {/* Already have account */}
          <View style={styles.loginFooterRow}>
            <Text style={styles.alreadyAccountText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.replace('Login')}>
              <Text style={styles.loginOrangeLink}>Login</Text>
            </TouchableOpacity>
          </View>

          {/* Bottom Security Box */}
          <View style={styles.securityBox}>
            <Ionicons name="lock-closed" size={16} color="#475569" style={{ marginRight: 8 }} />
            <Text style={styles.securityText}>
              OTP code will be dispatched to your Bangladesh mobile number for carrier level verification.
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9ff',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  topCard: {
    backgroundColor: '#102a71',
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
    position: 'relative',
  },
  cardBackBtn: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  topCardLogo: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#1e3a8a',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  offerhutBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
    marginBottom: 10,
  },
  orangeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#f97316',
  },
  offerhutBadgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 6,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    textAlign: 'center',
    maxWidth: 260,
  },
  featureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 8,
  },
  featurePill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 8,
    gap: 6,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  pillIconBox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pillTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0b1c30',
  },
  pillSubtitle: {
    fontSize: 9,
    color: '#64748b',
  },
  formContainer: {
    gap: 14,
  },
  fieldGroup: {
    gap: 6,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0b1c30',
  },
  requiredTag: {
    fontSize: 11,
    color: '#64748b',
  },
  bdOnlyTag: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ea580c',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 14,
    height: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#0b1c30',
  },
  phoneInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bdPill: {
    backgroundColor: '#eff4ff',
    borderRadius: 14,
    height: 50,
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bdPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0b1c30',
  },
  phoneInput: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 14,
    height: 50,
    fontSize: 14,
    color: '#0b1c30',
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#f97316',
    borderColor: '#f97316',
  },
  termsText: {
    fontSize: 11,
    color: '#64748b',
    flex: 1,
    lineHeight: 16,
  },
  termsLink: {
    color: '#1e3a8a',
    fontWeight: '600',
  },
  signUpBtn: {
    backgroundColor: '#ea580c',
    borderRadius: 16,
    height: 52,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    shadowColor: '#ea580c',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  signUpBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  dividerText: {
    fontSize: 11,
    color: '#94a3b8',
    paddingHorizontal: 12,
  },
  paymentBadgesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 8,
  },
  gatewayBadge: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    height: 48,
    paddingHorizontal: 12,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  gatewayLogo: {
    width: '100%',
    height: 30,
  },
  loginFooterRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 12,
  },
  alreadyAccountText: {
    fontSize: 13,
    color: '#64748b',
  },
  loginOrangeLink: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ea580c',
  },
  securityBox: {
    flexDirection: 'row',
    backgroundColor: '#eff4ff',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  securityText: {
    fontSize: 11,
    color: '#475569',
    flex: 1,
    lineHeight: 16,
  },
  inputError: {
    borderColor: '#ba1a1a',
    borderWidth: 1.5,
  },
  inlineError: {
    fontSize: 11,
    color: '#ba1a1a',
    fontWeight: '600',
    marginTop: 4,
    marginLeft: 4,
  },
});
