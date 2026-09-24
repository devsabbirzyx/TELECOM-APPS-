import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FreeClaimStatus } from '../types';
import { api } from '../services/api';

interface ClaimFreeModalProps {
  visible: boolean;
  onClose: () => void;
  onBuyPack: () => void;
  claimStatus?: FreeClaimStatus | null;
  onClaimSuccess?: () => void;
}

export const ClaimFreeModal: React.FC<ClaimFreeModalProps> = ({
  visible,
  onClose,
  onBuyPack,
  claimStatus,
  onClaimSuccess,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(claimStatus?.seconds_remaining || 0);
  const [isClaiming, setIsClaiming] = useState<boolean>(false);

  useEffect(() => {
    if (claimStatus?.seconds_remaining !== undefined) {
      setSecondsRemaining(claimStatus.seconds_remaining);
    }
  }, [claimStatus?.seconds_remaining]);

  // Real-time ticking countdown
  useEffect(() => {
    if (claimStatus?.status === 'timer_active' && secondsRemaining > 0) {
      const interval = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [claimStatus?.status, secondsRemaining]);

  const hours = Math.floor(secondsRemaining / 3600);
  const minutes = Math.floor((secondsRemaining % 3600) / 60);
  const seconds = secondsRemaining % 60;

  const isClaimed = claimStatus?.status === 'claimed';
  const isReady = claimStatus?.status === 'ready' || (claimStatus?.status === 'timer_active' && secondsRemaining <= 0);
  const isTimerActive = claimStatus?.status === 'timer_active' && secondsRemaining > 0;
  const isLocked = !claimStatus || claimStatus.status === 'locked';

  const handleClaimNow = async () => {
    setIsClaiming(true);
    try {
      const res = await api.claimFree10gb();
      setIsClaiming(false);
      Alert.alert(
        'অভিনন্দন! 🎉',
        res.message || '১০ জিবি ফ্রি ইন্টারনেট সফলভাবে আপনার সিমে যোগ হয়েছে!',
        [
          {
            text: 'ধন্যবাদ',
            onPress: () => {
              if (onClaimSuccess) onClaimSuccess();
              onClose();
            },
          },
        ]
      );
    } catch (err: any) {
      setIsClaiming(false);
      Alert.alert('ব্যর্থ হয়েছে', err.message || 'অফারটি ক্লেইম করা যায়নি। অনুগ্রহ করে পুনরায় চেষ্টা করুন।');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View style={styles.dialog}>
              {/* Close (X) button */}
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={onClose}
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={18} color="#475569" />
              </TouchableOpacity>

              {/* Icon Container based on state */}
              {isClaimed ? (
                <View style={styles.iconContainer}>
                  <View style={[styles.giftBox, { backgroundColor: '#16a34a' }]}>
                    <Ionicons name="checkmark-done-circle" size={48} color="#ffffff" />
                  </View>
                </View>
              ) : isReady ? (
                <View style={styles.iconContainer}>
                  <View style={[styles.giftBox, { backgroundColor: '#10b981' }]}>
                    <Ionicons name="gift" size={44} color="#ffffff" />
                  </View>
                  <View style={[styles.lockBadge, { backgroundColor: '#16a34a' }]}>
                    <Ionicons name="sparkles" size={14} color="#ffffff" />
                  </View>
                </View>
              ) : isTimerActive ? (
                <View style={styles.iconContainer}>
                  <View style={[styles.giftBox, { backgroundColor: '#3b82f6' }]}>
                    <Ionicons name="hourglass-outline" size={42} color="#ffffff" />
                  </View>
                  <View style={[styles.lockBadge, { backgroundColor: '#1d4ed8' }]}>
                    <Ionicons name="time" size={14} color="#ffffff" />
                  </View>
                </View>
              ) : (
                <View style={styles.iconContainer}>
                  <View style={styles.giftBox}>
                    <Ionicons name="gift-outline" size={42} color="#ffffff" />
                  </View>
                  <View style={styles.lockBadge}>
                    <Ionicons name="lock-closed" size={14} color="#ffffff" />
                  </View>
                </View>
              )}

              {/* Modal Title */}
              <Text style={styles.title}>
                {isClaimed
                  ? '১০ জিবি ফ্রি একটিভ! 🎉'
                  : isReady
                  ? 'অফারটি প্রস্তুত! 🎉'
                  : isTimerActive
                  ? 'কাউন্টডাউন চলছে... ⏳'
                  : 'অফারটি আনলক করুন! 🎁'}
              </Text>

              {/* Countdown Digits when timer active */}
              {isTimerActive ? (
                <View style={styles.timerDisplayContainer}>
                  <View style={styles.timeDigitBox}>
                    <Text style={styles.timeDigitText}>{String(hours).padStart(2, '0')}</Text>
                    <Text style={styles.timeUnitLabel}>ঘণ্টা</Text>
                  </View>
                  <Text style={styles.timeColon}>:</Text>
                  <View style={styles.timeDigitBox}>
                    <Text style={styles.timeDigitText}>{String(minutes).padStart(2, '0')}</Text>
                    <Text style={styles.timeUnitLabel}>মিনিট</Text>
                  </View>
                  <Text style={styles.timeColon}>:</Text>
                  <View style={styles.timeDigitBox}>
                    <Text style={styles.timeDigitText}>{String(seconds).padStart(2, '0')}</Text>
                    <Text style={styles.timeUnitLabel}>সেকেন্ড</Text>
                  </View>
                </View>
              ) : null}

              {/* Notice Box */}
              <View
                style={[
                  styles.noticeBox,
                  isReady && { backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' },
                  isClaimed && { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' },
                ]}
              >
                <Ionicons
                  name={isReady ? 'checkmark-circle' : isTimerActive ? 'time' : 'information-circle'}
                  size={20}
                  color={isReady ? '#059669' : isClaimed ? '#2563eb' : isTimerActive ? '#2563eb' : '#ea580c'}
                  style={styles.noticeIcon}
                />
                <Text
                  style={[
                    styles.noticeText,
                    isReady && { color: '#047857' },
                    isClaimed && { color: '#1d4ed8' },
                    isTimerActive && { color: '#1e40af' },
                  ]}
                >
                  {isClaimed
                    ? 'আপনার সিমে ১০ জিবি ফ্রি ডাটা ইতিমধ্যে সফলভাবে যুক্ত হয়েছে।'
                    : isReady
                    ? '১২ ঘণ্টার অপেক্ষা সম্পন্ন হয়েছে! নিচে চাপ দিয়ে এখনই ডাটা গ্রহণ করুন।'
                    : isTimerActive
                    ? 'সার্ভার-ব্যাকড ১২ ঘণ্টার রিয়েল-টাইম টাইমার চলছে। সময় শেষ হলে Claim বাটন চাপুন।'
                    : 'এই ফ্রি অফারটি পেতে আপনাকে প্রথমে যেকোনো একটি প্যাক কিনতে হবে।'}
                </Text>
              </View>

              {/* Description */}
              <Text style={styles.description}>
                {isClaimed
                  ? 'Mobixa ব্যবহার করার জন্য ধন্যবাদ! নিয়মিত প্যাক কিনে আরও আকর্ষণীয় ক্যাশব্যাক ও বোনাস উপভোগ করুন।'
                  : isReady
                  ? 'আপনার কোনো অতিরিক্ত ব্যালেন্স খরচ হবে না। সম্পূর্ণ ফ্রিতে ১০ জিবি ডাটা সক্রিয় করা হবে।'
                  : isTimerActive
                  ? 'অ্যাপ বন্ধ করলেও টাইমার থামবে না। সার্ভার টাইম অনুযায়ী ঠিক সময়ে অফারটি আনলক হয়ে যাবে।'
                  : 'Mobixa-তে যেকোনো ইন্টারনেট বা মিনিট প্যাক কেনার সাথে সাথেই ১২ ঘণ্টার টাইমার শুরু হবে এবং ১০ জিবি ফ্রি পাওয়া যাবে!'}
              </Text>

              {/* Action Buttons */}
              {isClaimed ? (
                <TouchableOpacity
                  style={[styles.buyPackBtn, { backgroundColor: '#2563eb' }]}
                  onPress={onClose}
                  activeOpacity={0.85}
                >
                  <Ionicons name="checkmark-done" size={18} color="#ffffff" />
                  <Text style={styles.buyPackText}>ঠিক আছে (Done)</Text>
                </TouchableOpacity>
              ) : isReady ? (
                <TouchableOpacity
                  style={[styles.buyPackBtn, { backgroundColor: '#10b981' }]}
                  onPress={handleClaimNow}
                  disabled={isClaiming}
                  activeOpacity={0.85}
                >
                  {isClaiming ? (
                    <ActivityIndicator color="#ffffff" size="small" />
                  ) : (
                    <>
                      <Ionicons name="gift" size={18} color="#ffffff" />
                      <Text style={styles.buyPackText}>Claim 10GB Now! (ফ্রি নিন)</Text>
                    </>
                  )}
                </TouchableOpacity>
              ) : isTimerActive ? (
                <TouchableOpacity
                  style={[styles.buyPackBtn, { backgroundColor: '#64748b' }]}
                  disabled
                  activeOpacity={1}
                >
                  <Ionicons name="hourglass" size={18} color="#ffffff" />
                  <Text style={styles.buyPackText}>অপেক্ষা করুন ({String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')})</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.buyPackBtn}
                  onPress={onBuyPack}
                  activeOpacity={0.85}
                >
                  <Ionicons name="bag-handle-outline" size={18} color="#ffffff" />
                  <Text style={styles.buyPackText}>প্যাক কিনুন (Buy a Pack)</Text>
                </TouchableOpacity>
              )}

              {/* Cancel Button */}
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={onClose}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelText}>বন্ধ করুন (Close)</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(11, 28, 48, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  dialog: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 22,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 4,
  },
  giftBox: {
    width: 80,
    height: 80,
    borderRadius: 22,
    backgroundColor: '#f97316',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  lockBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#102a71',
    borderWidth: 2.5,
    borderColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0b1c30',
    marginTop: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  timerDisplayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    gap: 6,
  },
  timeDigitBox: {
    backgroundColor: '#0f172a',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    minWidth: 54,
  },
  timeDigitText: {
    color: '#38bdf8',
    fontSize: 20,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  timeUnitLabel: {
    color: '#94a3b8',
    fontSize: 9,
    marginTop: 2,
    fontWeight: '600',
  },
  timeColon: {
    color: '#0f172a',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 12,
  },
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fed7aa',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    width: '100%',
    marginBottom: 12,
  },
  noticeIcon: {
    marginRight: 8,
  },
  noticeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9a3412',
    flex: 1,
    lineHeight: 18,
  },
  description: {
    fontSize: 13,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  buyPackBtn: {
    width: '100%',
    height: 50,
    backgroundColor: '#ea580c',
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#ea580c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  buyPackText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  cancelBtn: {
    marginTop: 14,
    paddingVertical: 6,
  },
  cancelText: {
    color: '#334155',
    fontSize: 14,
    fontWeight: '600',
  },
});
