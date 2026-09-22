import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { rounded, spacing } from '../../theme/spacing';
import { Header } from '../../components/Header';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

type NavProp = StackNavigationProp<RootStackParamList, 'ChangePassword'>;

interface Props {
  navigation: NavProp;
}

export const ChangePasswordScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successToast, setSuccessToast] = useState(false);

  const phone = user?.phone_number || '01712345678';
  const maskedPhone = `+880 ${phone.slice(1, 5)} ••••••`;

  // Validation criteria
  const hasLength = newPassword.length >= 8;
  const hasNumber = /\d/.test(newPassword);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

  const score = (hasLength ? 1 : 0) + (hasNumber ? 1 : 0) + (hasSpecial ? 1 : 0);
  const strengthText =
    newPassword.length === 0
      ? ''
      : score === 0
      ? 'Too Short'
      : score < 3
      ? 'Moderate'
      : 'Strong';

  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  const handleUpdate = () => {
    if (!currentPassword) {
      Alert.alert('Required', 'Please enter your current password.');
      return;
    }
    if (!hasLength) {
      Alert.alert('Validation Error', 'New password must be at least 8 characters long.');
      return;
    }
    if (!passwordsMatch) {
      Alert.alert('Mismatch', 'New password and confirmation do not match.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccessToast(true);
      setTimeout(() => {
        setSuccessToast(false);
        navigation.goBack();
      }, 1500);
    }, 600);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      {/* Stitch Header */}
      <Header
        title="Change Password Screen"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ============================================================ */}
        {/* STITCH SCREEN 17: Security Advisory Card                     */}
        {/* ============================================================ */}
        <View style={styles.advisoryCard}>
          <View style={styles.advisoryIconBox}>
            <Ionicons name="shield" size={26} color="#ffffff" />
          </View>
          <View style={styles.advisoryTextBox}>
            <View style={styles.advisoryTitleRow}>
              <Text style={[typography.titleMd, styles.advisoryTitle]}>Account Protection</Text>
              <View style={styles.securedBadge}>
                <Text style={styles.securedText}>Secured</Text>
              </View>
            </View>
            <Text style={[typography.bodySm, styles.advisoryBody]}>
              Ensure your account is using a strong and unique password to protect your Mobixa SIM recharges and wallet.
            </Text>
          </View>
        </View>

        {/* ============================================================ */}
        {/* STITCH SCREEN 17: Form Fields Container                      */}
        {/* ============================================================ */}
        <View style={styles.formContainer}>
          {/* 1. Current Password Field */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Current Password</Text>
            <View style={styles.inputBox}>
              <Ionicons name="lock-closed-outline" size={20} color="#757682" style={styles.leadingIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="••••••••••••"
                placeholderTextColor="#c5c5d3"
                secureTextEntry={!showCurrent}
                value={currentPassword}
                onChangeText={setCurrentPassword}
              />
              <TouchableOpacity
                onPress={() => setShowCurrent(!showCurrent)}
                style={styles.eyeBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name={showCurrent ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color="#757682"
                />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={() => Alert.alert('Forgot Password', 'An OTP will be sent to your registered number.')}
              style={styles.forgotBtn}
            >
              <Text style={styles.forgotText}>Forgot Password?</Text>
              <Ionicons name="arrow-forward" size={12} color="#fd761a" />
            </TouchableOpacity>
          </View>

          {/* 2. New Password Field */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>New Password</Text>
            <View style={styles.inputBox}>
              <Ionicons name="lock-closed" size={20} color="#757682" style={styles.leadingIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Enter new password"
                placeholderTextColor="#c5c5d3"
                secureTextEntry={!showNew}
                value={newPassword}
                onChangeText={setNewPassword}
              />
              <TouchableOpacity
                onPress={() => setShowNew(!showNew)}
                style={styles.eyeBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name={showNew ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color="#757682"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* 3. Confirm New Password Field */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Confirm New Password</Text>
            <View style={styles.inputBox}>
              <Ionicons name="checkmark-done" size={20} color="#757682" style={styles.leadingIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Re-enter new password"
                placeholderTextColor="#c5c5d3"
                secureTextEntry={!showConfirm}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <TouchableOpacity
                onPress={() => setShowConfirm(!showConfirm)}
                style={styles.eyeBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name={showConfirm ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color="#757682"
                />
              </TouchableOpacity>
            </View>

            {/* Passwords Match Indicator */}
            {passwordsMatch && (
              <View style={styles.matchNoticeRow}>
                <Ionicons name="checkmark-circle" size={15} color="#004b1d" />
                <Text style={styles.matchNoticeText}>Passwords match smoothly</Text>
              </View>
            )}
          </View>

          {/* ============================================================ */}
          {/* STITCH SCREEN 17: Password Requirements Card                 */}
          {/* ============================================================ */}
          <View style={styles.requirementsCard}>
            <View style={styles.requirementsHeader}>
              <Text style={styles.requirementsTitle}>Password Requirements</Text>
              {strengthText ? (
                <Text
                  style={[
                    styles.strengthBadge,
                    strengthText === 'Strong'
                      ? styles.strengthStrong
                      : strengthText === 'Moderate'
                      ? styles.strengthModerate
                      : styles.strengthWeak,
                  ]}
                >
                  {strengthText}
                </Text>
              ) : null}
            </View>

            <View style={styles.criteriaList}>
              {/* Criterion 1: Length */}
              <View style={styles.criterionRow}>
                <View
                  style={[
                    styles.criterionCheck,
                    hasLength ? styles.criterionCheckActive : styles.criterionCheckInactive,
                  ]}
                >
                  {hasLength ? (
                    <Ionicons name="checkmark" size={12} color="#ffffff" />
                  ) : (
                    <View style={styles.bulletDot} />
                  )}
                </View>
                <Text
                  style={[
                    styles.criterionText,
                    hasLength ? styles.criterionTextActive : styles.criterionTextInactive,
                  ]}
                >
                  At least 8 characters long
                </Text>
              </View>

              {/* Criterion 2: Number */}
              <View style={styles.criterionRow}>
                <View
                  style={[
                    styles.criterionCheck,
                    hasNumber ? styles.criterionCheckActive : styles.criterionCheckInactive,
                  ]}
                >
                  {hasNumber ? (
                    <Ionicons name="checkmark" size={12} color="#ffffff" />
                  ) : (
                    <View style={styles.bulletDot} />
                  )}
                </View>
                <Text
                  style={[
                    styles.criterionText,
                    hasNumber ? styles.criterionTextActive : styles.criterionTextInactive,
                  ]}
                >
                  Contains at least one number (0-9)
                </Text>
              </View>

              {/* Criterion 3: Special Char */}
              <View style={styles.criterionRow}>
                <View
                  style={[
                    styles.criterionCheck,
                    hasSpecial ? styles.criterionCheckActive : styles.criterionCheckInactive,
                  ]}
                >
                  {hasSpecial ? (
                    <Ionicons name="checkmark" size={12} color="#ffffff" />
                  ) : (
                    <View style={styles.bulletDot} />
                  )}
                </View>
                <Text
                  style={[
                    styles.criterionText,
                    hasSpecial ? styles.criterionTextActive : styles.criterionTextInactive,
                  ]}
                >
                  Contains at least one special character (!@#$)
                </Text>
              </View>
            </View>
          </View>

          {/* ============================================================ */}
          {/* STITCH SCREEN 17: Active SIM Wallet Context Snapshot         */}
          {/* ============================================================ */}
          <View style={styles.walletSnapshot}>
            <View style={styles.walletSnapshotLeft}>
              <View style={styles.simIconCircle}>
                <Ionicons name="cellular" size={16} color="#00236f" />
              </View>
              <View>
                <Text style={styles.snapshotLabel}>Linked Wallet Mobile</Text>
                <Text style={styles.snapshotNumber}>{maskedPhone}</Text>
              </View>
            </View>
            <Ionicons name="lock-closed" size={18} color="#00236f" />
          </View>

          {/* Update Button */}
          <TouchableOpacity
            style={[styles.submitBtn, loading && { opacity: 0.7 }]}
            onPress={handleUpdate}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Ionicons name="sync" size={18} color="#ffffff" />
            <Text style={styles.submitBtnText}>
              {loading ? 'Updating...' : 'Update Password'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Success Toast Overlay */}
      {successToast && (
        <View style={styles.toastSuccess}>
          <View style={styles.toastIconBox}>
            <Ionicons name="checkmark" size={18} color="#ffffff" />
          </View>
          <View style={styles.toastTextBox}>
            <Text style={styles.toastTitle}>Password Updated</Text>
            <Text style={styles.toastSubtitle}>
              Your Mobixa wallet and SIM security are in sync.
            </Text>
          </View>
        </View>
      )}
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
    paddingTop: 12,
    paddingBottom: 40,
    gap: 16,
  },

  /* 1. Security Advisory Card */
  advisoryCard: {
    backgroundColor: '#eff4ff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  advisoryIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#1e3a8a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  advisoryTextBox: {
    flex: 1,
  },
  advisoryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  advisoryTitle: {
    color: '#0b1c30',
    fontSize: 15,
    fontWeight: '600',
  },
  securedBadge: {
    backgroundColor: '#7ffc97',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  securedText: {
    color: '#002109',
    fontSize: 10,
    fontWeight: '700',
  },
  advisoryBody: {
    color: '#444651',
    fontSize: 12,
    lineHeight: 17,
  },

  /* 2. Form Container */
  formContainer: {
    gap: 14,
  },
  fieldGroup: {
    width: '100%',
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0b1c30',
    marginBottom: 6,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    height: 48,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  leadingIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    height: '100%',
    color: '#0b1c30',
    fontSize: 14,
  },
  eyeBtn: {
    padding: 4,
  },
  forgotBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: 4,
    marginTop: 6,
    paddingHorizontal: 4,
  },
  forgotText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fd761a',
  },
  matchNoticeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
    paddingHorizontal: 4,
  },
  matchNoticeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#004b1d',
  },

  /* 3. Password Requirements Card */
  requirementsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  requirementsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  requirementsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0b1c30',
  },
  strengthBadge: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  strengthStrong: {
    color: '#004b1d',
  },
  strengthModerate: {
    color: '#fd761a',
  },
  strengthWeak: {
    color: '#ba1a1a',
  },
  criteriaList: {
    gap: 8,
  },
  criterionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  criterionCheck: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  criterionCheckActive: {
    backgroundColor: '#004b1d',
  },
  criterionCheckInactive: {
    backgroundColor: '#d3e4fe',
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#757682',
  },
  criterionText: {
    fontSize: 12,
  },
  criterionTextActive: {
    color: '#0b1c30',
    fontWeight: '500',
  },
  criterionTextInactive: {
    color: '#444651',
  },

  /* 4. Active SIM Wallet Context Snapshot */
  walletSnapshot: {
    backgroundColor: '#e5eeff',
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  walletSnapshotLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  simIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  snapshotLabel: {
    fontSize: 10.5,
    color: '#444651',
    fontWeight: '500',
  },
  snapshotNumber: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0b1c30',
    letterSpacing: 0.5,
  },

  /* 5. Update Button */
  submitBtn: {
    backgroundColor: '#1e3a8a',
    borderRadius: 14,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#1e3a8a',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
    marginTop: 4,
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },

  /* Toast Overlay */
  toastSuccess: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: '#213145',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  toastIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#004b1d',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toastTextBox: {
    flex: 1,
  },
  toastTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  toastSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 11.5,
    marginTop: 1,
  },
});

export default ChangePasswordScreen;
