import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Modal,
  Platform,
} from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { Header } from '../../components/Header';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';

type EditNavProp = StackNavigationProp<RootStackParamList, 'EditProfile'>;

interface Props {
  navigation: EditNavProp;
}

const PRESET_AVATARS = [
  { id: 'av-1', label: 'Tech Guy', url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80' },
  { id: 'av-2', label: 'Casual Girl', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80' },
  { id: 'av-3', label: 'Gamer Boy', url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&auto=format&fit=crop&q=80' },
  { id: 'av-4', label: 'Executive', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80' },
  { id: 'av-5', label: 'Creative', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80' },
  { id: 'av-6', label: 'Developer', url: 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=200&auto=format&fit=crop&q=80' },
];

export const EditProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { user, updateProfile } = useAuth();
  const [fullName, setFullName] = useState(user?.full_name || 'Tanvir Ahmed');
  const [email, setEmail] = useState(user?.email || 'tanvir.mobixa@gmail.com');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.avatar_url || null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Compress image to a lightweight format (<35KB) so it saves seamlessly in local storage and database
  const compressImage = (dataUrl: string, maxWidth = 320, maxHeight = 320, quality = 0.82): Promise<string> => {
    return new Promise((resolve) => {
      if (Platform.OS !== 'web' || typeof window === 'undefined' || typeof document === 'undefined') {
        return resolve(dataUrl);
      }
      const img = new (window as any).Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(dataUrl);
        ctx.drawImage(img, 0, 0, width, height);
        try {
          const compressed = canvas.toDataURL('image/jpeg', quality);
          resolve(compressed);
        } catch {
          resolve(dataUrl);
        }
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
  };

  // Hidden file input for web/mobile browsers to pick file from device/gallery
  const handleUploadFromDevice = () => {
    setShowPhotoModal(false);

    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e: any) => {
        const file = e.target?.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = async (event) => {
            const result = event.target?.result as string;
            if (result) {
              const compressed = await compressImage(result);
              setAvatarUrl(compressed);
            }
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
    } else {
      Alert.alert(
        'Upload Photo',
        'Gallery photo picker is ready. Please choose a photo or select an avatar.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleSelectPreset = (url: string) => {
    setAvatarUrl(url);
    setShowPhotoModal(false);
  };

  const handleRemovePhoto = () => {
    setAvatarUrl(null);
    setShowPhotoModal(false);
  };

  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert('নাম আবশ্যক', 'অনুগ্রহ করে আপনার পুরো নাম লিখুন।');
      return;
    }

    setLoading(true);
    try {
      let finalAvatar = avatarUrl;
      if (finalAvatar && finalAvatar.startsWith('data:image')) {
        finalAvatar = await compressImage(finalAvatar);
      }

      await updateProfile({
        id: user?.id,
        full_name: fullName.trim(),
        email: email.trim(),
        avatar_url: finalAvatar || undefined,
      });

      Alert.alert('সফল হয়েছে! 🎉', 'আপনার প্রোফাইল তথ্য এবং ছবি সফলভাবে আপডেট করা হয়েছে।', [
        { text: 'ঠিক আছে', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      Alert.alert('আপডেট ত্রুটি', err.message || 'প্রোফাইল আপডেট করতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  const initialLetter = fullName.trim() ? fullName.trim().charAt(0).toUpperCase() : 'M';

  return (
    <View style={styles.container}>
      <Header title="Edit Profile" showBack onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setShowPhotoModal(true)}
            style={styles.avatarWrapper}
          >
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatar} />
            ) : (
              <LinearGradient
                colors={['#1e3a8a', '#2563eb']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.avatar, styles.initialsAvatar]}
              >
                <Text style={styles.initialsText}>{initialLetter}</Text>
              </LinearGradient>
            )}

            <View style={styles.cameraBtn}>
              <Ionicons name="camera" size={16} color="#ffffff" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setShowPhotoModal(true)} activeOpacity={0.7}>
            <Text style={styles.changePhotoText}>
              {avatarUrl ? 'ছবি পরিবর্তন করুন (Change Photo)' : '+ ছবি যোগ করুন (Add Photo)'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Inputs */}
        <Input
          label="Full Name"
          placeholder="Enter your name"
          value={fullName}
          onChangeText={setFullName}
          leftIcon="person-outline"
        />

        <Input
          label="Mobile Number (Fixed)"
          value={user?.phone_number || '017XXXXXXXX'}
          editable={false}
          leftIcon="call-outline"
        />

        <Input
          label="Email Address"
          placeholder="name@example.com"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          leftIcon="mail-outline"
        />

        <Input
          label="Referral Code"
          value={user?.referral_code || 'MB2026'}
          editable={false}
          leftIcon="gift-outline"
        />

        <Button
          title="Save Changes"
          onPress={handleSave}
          loading={loading}
          variant="primary"
          size="lg"
          style={styles.saveBtn}
        />
      </ScrollView>

      {/* Change Photo Modal Sheet */}
      <Modal
        visible={showPhotoModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPhotoModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>প্রোফাইল ছবি পরিবর্তন</Text>
              <TouchableOpacity onPress={() => setShowPhotoModal(false)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={20} color="#64748b" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtext}>
              ডিভাইস থেকে নিজের ছবি আপলোড করুন অথবা নিচের পছন্দসই অ্যাভাটার বেছে নিন।
            </Text>

            {/* Action 1: Upload from Gallery / Device */}
            <TouchableOpacity
              style={styles.modalOptionCard}
              activeOpacity={0.8}
              onPress={handleUploadFromDevice}
            >
              <View style={[styles.modalOptionIcon, { backgroundColor: '#eff6ff' }]}>
                <Ionicons name="cloud-upload-outline" size={22} color="#2563eb" />
              </View>
              <View style={styles.modalOptionTextCol}>
                <Text style={styles.modalOptionTitle}>গ্যালারি / ডিভাইস থেকে আপলোড</Text>
                <Text style={styles.modalOptionDesc}>আপনার ফোন বা পিসি থেকে ছবি নির্বাচন করুন</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
            </TouchableOpacity>

            {/* Action 2: Remove Photo (if set) */}
            {avatarUrl ? (
              <TouchableOpacity
                style={styles.modalOptionCard}
                activeOpacity={0.8}
                onPress={handleRemovePhoto}
              >
                <View style={[styles.modalOptionIcon, { backgroundColor: '#fee2e2' }]}>
                  <Ionicons name="trash-outline" size={22} color="#dc2626" />
                </View>
                <View style={styles.modalOptionTextCol}>
                  <Text style={[styles.modalOptionTitle, { color: '#dc2626' }]}>ছবি মুছে ফেলুন (Remove)</Text>
                  <Text style={styles.modalOptionDesc}>ডিফল্ট নামের অক্ষর দিয়ে প্রোফাইল রাখুন</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
              </TouchableOpacity>
            ) : null}

            {/* Preset Avatars Grid */}
            <Text style={styles.presetSectionTitle}>অথবা একটি অ্যাভাটার বেছে নিন:</Text>
            <View style={styles.avatarGrid}>
              {PRESET_AVATARS.map((av) => (
                <TouchableOpacity
                  key={av.id}
                  style={[
                    styles.avatarGridItem,
                    avatarUrl === av.url && styles.avatarGridItemSelected,
                  ]}
                  activeOpacity={0.8}
                  onPress={() => handleSelectPreset(av.url)}
                >
                  <Image source={{ uri: av.url }} style={styles.gridAvatarImg} />
                  {avatarUrl === av.url && (
                    <View style={styles.selectedCheckBadge}>
                      <Ionicons name="checkmark" size={12} color="#ffffff" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.cancelBtn}
              activeOpacity={0.7}
              onPress={() => setShowPhotoModal(false)}
            >
              <Text style={styles.cancelBtnText}>বাতিল করুন</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  scrollContent: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  avatarWrapper: {
    position: 'relative',
    width: 96,
    height: 96,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  initialsAvatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: {
    color: '#ffffff',
    fontSize: 40,
    fontWeight: '800',
    letterSpacing: 1,
  },
  cameraBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fd761a',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  changePhotoText: {
    color: '#1e3a8a',
    fontWeight: '700',
    fontSize: 14,
    marginTop: spacing.sm,
  },
  saveBtn: {
    marginTop: spacing.lg,
    width: '100%',
  },

  /* Modal Sheet Styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalCard: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 20,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  modalCloseBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSubtext: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 16,
    lineHeight: 18,
  },
  modalOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 10,
  },
  modalOptionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  modalOptionTextCol: {
    flex: 1,
  },
  modalOptionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 2,
  },
  modalOptionDesc: {
    fontSize: 12,
    color: '#64748b',
  },
  presetSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginTop: 10,
    marginBottom: 12,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 18,
  },
  avatarGridItem: {
    position: 'relative',
    width: '30%',
    aspectRatio: 1,
    borderRadius: 18,
    borderWidth: 2.5,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarGridItemSelected: {
    borderColor: '#2563eb',
    borderWidth: 3,
  },
  gridAvatarImg: {
    width: '100%',
    height: '100%',
  },
  selectedCheckBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
});
