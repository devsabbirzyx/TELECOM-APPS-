import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Platform,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type OtpRouteProp = RouteProp<RootStackParamList, 'OtpVerification'>;
type OtpNavProp = StackNavigationProp<RootStackParamList, 'OtpVerification'>;

interface Props {
  route: OtpRouteProp;
  navigation: OtpNavProp;
}

export const OtpVerificationScreen: React.FC<Props> = ({ route, navigation }) => {
  const rawPhone = route.params?.phone_number || '';
  const displayPhone = (() => {
    if (!rawPhone) return '+880 1XXXXXXXXX';
    if (rawPhone.startsWith('+880')) return rawPhone;
    if (rawPhone.startsWith('880')) return `+${rawPhone}`;
    if (rawPhone.startsWith('0')) return `+880 ${rawPhone.substring(1)}`;
    return `+880 ${rawPhone}`;
  })();

  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(59);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleKeyPress = (num: string) => {
    const emptyIndex = digits.findIndex((d) => d === '');
    if (emptyIndex !== -1) {
      const newDigits = [...digits];
      newDigits[emptyIndex] = num;
      setDigits(newDigits);
      if (emptyIndex === 5) {
        setTimeout(() => {
          navigation.replace('MainTabs');
        }, 300);
      }
    }
  };

  const handleBackspace = () => {
    const filledIndices = digits
      .map((d, i) => (d !== '' ? i : -1))
      .filter((i) => i !== -1);
    if (filledIndices.length > 0) {
      const lastIndex = filledIndices[filledIndices.length - 1];
      const newDigits = [...digits];
      newDigits[lastIndex] = '';
      setDigits(newDigits);
    }
  };

  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (/^[0-9]$/.test(e.key)) {
          handleKeyPress(e.key);
        } else if (e.key === 'Backspace') {
          handleBackspace();
        } else if (e.key === 'Enter') {
          handleVerify();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [digits]);

  const handleVerify = () => {
    navigation.replace('MainTabs');
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top || 16 }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header Bar */}
        <View style={styles.topHeader}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color="#0b1c30" />
          </TouchableOpacity>

          <View style={styles.stepBadge}>
            <View style={styles.orangeDot} />
            <Text style={styles.stepText}>STEP 2 OF 3</Text>
          </View>

          <TouchableOpacity style={styles.helpBtn} activeOpacity={0.7}>
            <Ionicons name="help-circle-outline" size={22} color="#0b1c30" />
          </TouchableOpacity>
        </View>

        {/* Content Section */}
        <View style={styles.centerContent}>
          {/* Logo with Shield */}
          <View style={styles.logoWrapper}>
            <View style={styles.logoBox}>
              <Ionicons name="home" size={28} color="#f97316" />
            </View>
            <View style={styles.greenShield}>
              <Ionicons name="shield-checkmark" size={12} color="#ffffff" />
            </View>
          </View>

          <Text style={styles.title}>Verify Your Number</Text>
          <Text style={styles.subtitle}>
            Enter the 6-digit verification code sent via instant SMS to
          </Text>

          {/* Phone Pill */}
          <View style={styles.phonePill}>
            <Ionicons name="phone-portrait-outline" size={16} color="#1e3a8a" />
            <Text style={styles.phoneText}>{displayPhone}</Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="pencil" size={14} color="#1e3a8a" />
            </TouchableOpacity>
          </View>

          {/* 6 OTP Boxes */}
          <View style={styles.otpBoxesRow}>
            {digits.map((digit, idx) => {
              const isCurrent = digits.findIndex((d) => d === '') === idx;
              return (
                <View
                  key={idx}
                  style={[
                    styles.otpBox,
                    digit !== '' && styles.otpBoxFilled,
                    isCurrent && styles.otpBoxActive,
                  ]}
                >
                  {digit ? (
                    <Text style={styles.otpDigit}>{digit}</Text>
                  ) : isCurrent ? (
                    <View style={styles.cursorBar} />
                  ) : (
                    <View style={styles.emptyDot} />
                  )}
                </View>
              );
            })}
          </View>

          {/* Resend & Call Actions */}
          <View style={styles.resendRow}>
            <Ionicons name="time-outline" size={14} color="#ea580c" />
            <Text style={styles.resendText}>
              Resend code in <Text style={{ fontWeight: '800', color: '#0b1c30' }}>00:{timer < 10 ? `0${timer}` : timer}</Text>
            </Text>
          </View>

          <TouchableOpacity style={styles.callRow}>
            <Ionicons name="call-outline" size={14} color="#64748b" />
            <Text style={styles.callText}>Didn't receive SMS? Call me</Text>
          </TouchableOpacity>

          {/* Verify Button */}
          <TouchableOpacity
            style={styles.verifyBtn}
            onPress={handleVerify}
            activeOpacity={0.85}
          >
            <Text style={styles.verifyBtnText}>Verify & Proceed</Text>
            <Ionicons name="arrow-forward" size={18} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Carrier Secure Pad */}
        <View style={styles.keypadCard}>
          <View style={styles.keypadHeader}>
            <Text style={styles.keypadTitle}>CARRIER SECURE PAD</Text>
            <View style={styles.encryptedRow}>
              <Ionicons name="lock-closed" size={12} color="#64748b" />
              <Text style={styles.encryptedText}>256-Bit Encrypted</Text>
            </View>
          </View>

          {/* Keypad Grid */}
          <View style={styles.keypadGrid}>
            {[
              { num: '1', letters: '' },
              { num: '2', letters: 'ABC' },
              { num: '3', letters: 'DEF' },
              { num: '4', letters: 'GHI' },
              { num: '5', letters: 'JKL' },
              { num: '6', letters: 'MNO' },
              { num: '7', letters: 'PQRS' },
              { num: '8', letters: 'TUV' },
              { num: '9', letters: 'WXYZ' },
            ].map((k) => (
              <TouchableOpacity
                key={k.num}
                style={styles.keyButton}
                onPress={() => handleKeyPress(k.num)}
                activeOpacity={0.7}
              >
                <Text style={styles.keyNum}>{k.num}</Text>
                {k.letters ? <Text style={styles.keyLetters}>{k.letters}</Text> : null}
              </TouchableOpacity>
            ))}

            {/* Fingerprint key */}
            <TouchableOpacity style={styles.keyButton} onPress={handleVerify} activeOpacity={0.7}>
              <Ionicons name="finger-print-outline" size={24} color="#64748b" />
            </TouchableOpacity>

            {/* 0 key */}
            <TouchableOpacity
              style={styles.keyButton}
              onPress={() => handleKeyPress('0')}
              activeOpacity={0.7}
            >
              <Text style={styles.keyNum}>0</Text>
              <Text style={styles.keyLetters}>+</Text>
            </TouchableOpacity>

            {/* Backspace key */}
            <TouchableOpacity style={styles.keyButton} onPress={handleBackspace} activeOpacity={0.7}>
              <Ionicons name="backspace-outline" size={22} color="#64748b" />
            </TouchableOpacity>
          </View>
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
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#eff4ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff4ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  orangeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#f97316',
  },
  stepText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0b1c30',
    letterSpacing: 0.5,
  },
  helpBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#eff4ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContent: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  logoBox: {
    width: 68,
    height: 68,
    borderRadius: 18,
    backgroundColor: '#102a71',
    justifyContent: 'center',
    alignItems: 'center',
  },
  greenShield: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#16a34a',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0b1c30',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    maxWidth: 290,
    lineHeight: 18,
    marginBottom: 12,
  },
  phonePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff4ff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
    marginBottom: 20,
  },
  phoneText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e3a8a',
  },
  otpBoxesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  otpBox: {
    width: 44,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#eff4ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpBoxFilled: {
    backgroundColor: '#eff4ff',
  },
  otpBoxActive: {
    borderWidth: 2,
    borderColor: '#1e3a8a',
    backgroundColor: '#eff4ff',
  },
  otpDigit: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0b1c30',
  },
  cursorBar: {
    width: 2,
    height: 20,
    backgroundColor: '#1e3a8a',
  },
  emptyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#cbd5e1',
  },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  resendText: {
    fontSize: 12,
    color: '#64748b',
  },
  callRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 20,
  },
  callText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  verifyBtn: {
    width: '100%',
    height: 52,
    backgroundColor: '#ea580c',
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#ea580c',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  verifyBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  keypadCard: {
    backgroundColor: '#eff4ff',
    borderRadius: 20,
    padding: 16,
  },
  keypadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  keypadTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.5,
  },
  encryptedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  encryptedText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748b',
  },
  keypadGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  keyButton: {
    width: '31%',
    height: 50,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  keyNum: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0b1c30',
  },
  keyLetters: {
    fontSize: 8,
    fontWeight: '600',
    color: '#94a3b8',
    letterSpacing: 0.5,
  },
});
