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

type LoginNavProp = StackNavigationProp<RootStackParamList, 'Login'>;

import { validateBangladeshiPhoneNumber, getOperatorFromPrefix } from '../../utils/phoneValidator';

interface Props {
  navigation: LoginNavProp;
}

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ phoneNumber?: string; password?: string }>({});
  const { login } = useAuth();
  const insets = useSafeAreaInsets();

  const detectedOperator = getOperatorFromPrefix(phoneNumber);

  const handleLogin = async () => {
    const newErrors: typeof errors = {};

    // Strict Bangladeshi Phone Validation
    const phoneValidation = validateBangladeshiPhoneNumber(phoneNumber);
    if (!phoneValidation.isValid) {
      newErrors.phoneNumber = phoneValidation.error;
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const first = Object.values(newErrors)[0];
      Alert.alert('ভুল মোবাইল নম্বর', first);
      return;
    }

    setErrors({});
    setLoading(true);
    try {
      await login(phoneValidation.cleanNumber, password);
      navigation.replace('MainTabs');
    } catch (err: any) {
      const errMsg = err.message || 'ভুল মোবাইল নম্বর বা পাসওয়ার্ড। অনুগ্রহ করে সঠিক তথ্য দিন অথবা নতুন অ্যাকাউন্ট তৈরি করুন।';
      const isNotFound = errMsg.includes('খুঁজে পাওয়া যায়নি') || errMsg.includes('অ্যাকাউন্ট') || errMsg.includes('Sign Up');

      Alert.alert(
        'লগইন ত্রুটি (Login Error)',
        errMsg,
        isNotFound
          ? [
              {
                text: 'নতুন অ্যাকাউন্ট তৈরি করুন (Sign Up)',
                onPress: () => navigation.navigate('SignUp'),
              },
            ]
          : [{ text: 'ঠিক আছে' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBiometric = () => {
    Alert.alert('বায়োমেট্রিক লগইন', 'বায়োমেট্রিক সুবিধা ব্যবহার করতে প্রথমে মোবাইল নম্বর ও পাসওয়ার্ড দিয়ে একবার লগইন করুন।');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { paddingTop: insets.top || 16 }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Top Bar with Back Button */}
        <View style={styles.topNavBar}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Onboarding'))}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color="#0b1c30" />
          </TouchableOpacity>
        </View>

        {/* Top Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.logoWrapper}>
            <View style={styles.logoBox}>
              <Image
                source={require('../../../assets/icon.png')}
                style={styles.logoImg}
                resizeMode="cover"
              />
            </View>
            <View style={styles.greenBadge}>
              <Ionicons name="checkmark" size={12} color="#ffffff" />
            </View>
          </View>

          <View style={styles.carrierHubPill}>
            <View style={styles.orangeDot} />
            <Text style={styles.carrierHubText}>BANGLADESH CARRIER HUB</Text>
          </View>

          <Text style={styles.welcomeTitle}>Welcome Back!</Text>
          <Text style={styles.welcomeSubtitle}>
            Log in to check recharge status & exclusive SIM discounts
          </Text>
        </View>

        {/* Form Card */}
        <View style={styles.formCard}>
          {/* Mobile Number Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Mobile Number</Text>
            <View style={[styles.inputContainer, errors.phoneNumber ? styles.inputError : undefined]}>
              <View style={styles.prefixBox}>
                <Text style={styles.flagEmoji}>🇧🇩</Text>
                <Text style={styles.prefixText}>+880</Text>
                <View style={styles.verticalDivider} />
              </View>
              <TextInput
                style={styles.textInput}
                placeholder="1XXXXXXXXX"
                placeholderTextColor="#94a3b8"
                value={phoneNumber}
                onChangeText={(text) => {
                  setPhoneNumber(text);
                  if (errors.phoneNumber) setErrors((prev) => ({ ...prev, phoneNumber: undefined }));
                }}
                keyboardType="phone-pad"
                maxLength={11}
              />
              {phoneNumber.length >= 10 && (
                <Ionicons name="checkmark-circle" size={20} color="#16a34a" />
              )}
            </View>
            {errors.phoneNumber ? <Text style={styles.inlineError}>{errors.phoneNumber}</Text> : null}
          </View>

          {/* Password Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={[styles.inputContainer, errors.password ? styles.inputError : undefined]}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={errors.password ? '#ba1a1a' : '#757682'}
                style={styles.fieldIcon}
              />
              <TextInput
                style={styles.textInput}
                placeholder="Enter your password"
                placeholderTextColor="#94a3b8"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                }}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color="#757682"
                />
              </TouchableOpacity>
            </View>
            {errors.password ? <Text style={styles.inlineError}>{errors.password}</Text> : null}
          </View>

          {/* Remember me & Forgot Password */}
          <View style={styles.optionsRow}>
            <TouchableOpacity
              style={styles.rememberRow}
              onPress={() => setRememberMe(!rememberMe)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, rememberMe && styles.checkboxActive]}>
                {rememberMe && <Ionicons name="checkmark" size={12} color="#ffffff" />}
              </View>
              <Text style={styles.rememberText}>Remember me</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('ChangePassword')}
              activeOpacity={0.7}
            >
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          {/* Login Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.loginBtn}
              onPress={handleLogin}
              activeOpacity={0.85}
              disabled={loading}
            >
              <Text style={styles.loginBtnText}>{loading ? 'Logging in...' : 'Login'}</Text>
              <Ionicons name="arrow-forward" size={18} color="#ffffff" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.fingerprintBtn}
              onPress={handleBiometric}
              activeOpacity={0.85}
            >
              <Ionicons name="finger-print-outline" size={24} color="#1e3a8a" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Instant Reload Badge */}
        <View style={styles.instantReloadBox}>
          <Ionicons name="flash" size={16} color="#f97316" />
          <Text style={styles.instantReloadText}>
            Instant reload via <Text style={{ fontWeight: '700', color: '#0b1c30' }}>bKash</Text> &{' '}
            <Text style={{ fontWeight: '700', color: '#0b1c30' }}>Nagad</Text>
          </Text>
        </View>

        {/* Sign Up Link */}
        <View style={styles.signUpRow}>
          <Text style={styles.noAccountText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
            <Text style={styles.signUpLink}>Sign Up</Text>
          </TouchableOpacity>
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
    paddingBottom: 24,
  },
  topNavBar: {
    paddingTop: 8,
    paddingBottom: 4,
    alignItems: 'flex-start',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#eff4ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerSection: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  logoWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  logoBox: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  logoImg: {
    width: 72,
    height: 72,
    borderRadius: 20,
  },
  greenBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  carrierHubPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dce9ff',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 6,
    marginBottom: 12,
  },
  orangeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#f97316',
  },
  carrierHubText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1e3a8a',
    letterSpacing: 0.5,
  },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0b1c30',
    marginBottom: 6,
  },
  welcomeSubtitle: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    maxWidth: 270,
    lineHeight: 18,
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0b1c30',
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff4ff',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 50,
  },
  prefixBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  flagEmoji: {
    fontSize: 16,
  },
  prefixText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0b1c30',
  },
  verticalDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#cbd5e1',
    marginHorizontal: 8,
  },
  fieldIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#0b1c30',
    fontWeight: '500',
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  checkboxActive: {
    backgroundColor: '#1e3a8a',
    borderColor: '#1e3a8a',
  },
  rememberText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  forgotText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e3a8a',
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  loginBtn: {
    flex: 1,
    height: 50,
    backgroundColor: '#1e3a8a',
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#1e3a8a',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  loginBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  fingerprintBtn: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#eff4ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  instantReloadBox: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eff4ff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    gap: 8,
    marginBottom: 24,
  },
  instantReloadText: {
    fontSize: 12,
    color: '#475569',
  },
  signUpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noAccountText: {
    fontSize: 13,
    color: '#64748b',
  },
  signUpLink: {
    fontSize: 13,
    fontWeight: '700',
    color: '#f97316',
  },
  inputError: {
    borderColor: '#ba1a1a',
    borderWidth: 1.5,
    backgroundColor: '#fff5f5',
  },
  inlineError: {
    fontSize: 11,
    color: '#ba1a1a',
    fontWeight: '600',
    marginTop: 4,
    marginLeft: 4,
  },
});
