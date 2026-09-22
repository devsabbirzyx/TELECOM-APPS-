import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ClaimFreeModalProps {
  visible: boolean;
  onClose: () => void;
  onBuyPack: () => void;
}

export const ClaimFreeModal: React.FC<ClaimFreeModalProps> = ({
  visible,
  onClose,
  onBuyPack,
}) => {
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

              {/* Gift Box with Lock Badge */}
              <View style={styles.iconContainer}>
                <View style={styles.giftBox}>
                  <Ionicons name="gift-outline" size={42} color="#ffffff" />
                </View>
                <View style={styles.lockBadge}>
                  <Ionicons name="lock-closed" size={14} color="#ffffff" />
                </View>
              </View>

              {/* Modal Title */}
              <Text style={styles.title}>অফারটি আনলক করুন! 🎉</Text>

              {/* Notice Box */}
              <View style={styles.noticeBox}>
                <Ionicons
                  name="information-circle-outline"
                  size={20}
                  color="#ea580c"
                  style={styles.noticeIcon}
                />
                <Text style={styles.noticeText}>
                  এই ফ্রি অফারটি পেতে আপনাকে প্রথমে যেকোনো একটি প্যাক কিনতে হবে।
                </Text>
              </View>

              {/* Description */}
              <Text style={styles.description}>
                Mobixa-তে যেকোনো ইন্টারনেট বা মিনিট প্যাক কেনার সাথে সাথেই আপনার অ্যাকাউন্টে{' '}
                <Text style={styles.boldBonus}>১০ জিবি ফ্রি বোনাস</Text> স্বয়ংক্রিয়ভাবে অ্যাক্টিভ হয়ে যাবে!
              </Text>

              {/* Buy Pack Button */}
              <TouchableOpacity
                style={styles.buyPackBtn}
                onPress={onBuyPack}
                activeOpacity={0.85}
              >
                <Ionicons name="bag-handle-outline" size={18} color="#ffffff" />
                <Text style={styles.buyPackText}>প্যাক কিনুন (Buy a Pack)</Text>
              </TouchableOpacity>

              {/* Cancel Button */}
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={onClose}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelText}>বাতিল (Close)</Text>
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
    fontSize: 21,
    fontWeight: '800',
    color: '#0b1c30',
    marginTop: 16,
    marginBottom: 12,
    textAlign: 'center',
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
  boldBonus: {
    fontWeight: '800',
    color: '#1e3a8a',
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
