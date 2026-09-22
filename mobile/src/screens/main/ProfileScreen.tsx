import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  Modal,
  Platform,
} from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { rounded, spacing } from '../../theme/spacing';
import { Header } from '../../components/Header';
import { useAuth } from '../../context/AuthContext';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';

type ProfileNavProp = StackNavigationProp<RootStackParamList>;

interface Props {
  navigation: ProfileNavProp;
}

export const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [language, setLanguage] = useState<'EN' | 'BN'>('EN');
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const phone = user?.phone_number || '01712345678';
  const formattedPhone = phone.startsWith('01')
    ? `+880 ${phone.slice(1, 5)}-${phone.slice(5)}`
    : `+880 ${phone}`;

  const handleConfirmLogout = async () => {
    setShowLogoutModal(false);
    await logout();
    navigation.replace('Login');
  };

  return (
    <View style={styles.container}>
      {/* Stitch Header */}
      <Header
        title="Profile Screen"
        showNotification
        hasUnreadNotifications
        onNotificationPress={() => navigation.navigate('Notifications')}
        showProfile
        onProfilePress={() => {}}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ============================================================ */}
        {/* STITCH SCREEN 14: Profile Header Card with Warm Ambient Blobs */}
        {/* ============================================================ */}
        <View style={styles.headerCardWrapper}>
          <View style={styles.headerCard}>
            {/* Ambient Decorative Backdrop Blobs */}
            <View style={styles.blobTopRight} />
            <View style={styles.blobBottomLeft} />

            {/* Avatar with Edit Camera Button Badge */}
            <View style={styles.avatarWrapper}>
              {user?.avatar_url ? (
                <Image
                  source={{ uri: user.avatar_url }}
                  style={styles.avatar}
                />
              ) : (
                <LinearGradient
                  colors={['#1e3a8a', '#2563eb']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[styles.avatar, styles.initialsAvatar]}
                >
                  <Text style={styles.initialsText}>
                    {user?.full_name ? user.full_name.trim().charAt(0).toUpperCase() : 'M'}
                  </Text>
                </LinearGradient>
              )}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => navigation.navigate('EditProfile')}
                style={styles.cameraBadgeBtn}
              >
                <Ionicons name="camera" size={16} color="#ffffff" />
              </TouchableOpacity>
            </View>

            {/* User Identification */}
            <Text style={[typography.headlineSm, styles.userName]}>
              {user?.full_name || 'Tanvir Ahmed'}
            </Text>
            <Text style={[typography.bodyMd, styles.userPhone]}>{formattedPhone}</Text>

            {/* Status Pill: Verified Member */}
            <View style={styles.statusPill}>
              <Ionicons name="checkmark-circle" size={15} color="#005320" />
              <Text style={[typography.labelSm, styles.statusPillText]}>Verified Member</Text>
            </View>

            {/* Quick Metrics Ribbon (Delight mini-dashboard) */}
            <View style={styles.metricsRibbon}>
              <View style={styles.metricCol}>
                <Text style={styles.metricValPrimary}>৳ {(user?.balance || 450).toFixed(0)}</Text>
                <Text style={[typography.labelSm, styles.metricLabel]}>Cashback</Text>
              </View>
              <View style={styles.metricCol}>
                <Text style={styles.metricValSecondary}>14</Text>
                <Text style={[typography.labelSm, styles.metricLabel]}>Recharges</Text>
              </View>
              <View style={styles.metricCol}>
                <Text style={styles.metricValTertiary}>VIP</Text>
                <Text style={[typography.labelSm, styles.metricLabel]}>Tier Level</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ============================================================ */}
        {/* STITCH SCREEN 14: Menu Group 1: Account & Services           */}
        {/* ============================================================ */}
        <View style={styles.groupWrapper}>
          <View style={styles.groupHeaderRow}>
            <Text style={styles.groupHeaderTitle}>ACCOUNT & SERVICES</Text>
            <Text style={styles.walletActiveTag}>Wallet Active</Text>
          </View>

          <View style={styles.groupCard}>
            {/* Edit Profile */}
            <TouchableOpacity
              style={styles.menuItem}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('EditProfile')}
            >
              <View style={styles.itemLeft}>
                <View style={styles.itemIconCircle}>
                  <Ionicons name="person" size={20} color="#00236f" />
                </View>
                <Text style={[typography.titleMd, styles.itemTitle]}>Edit Profile</Text>
              </View>
              <Ionicons name="chevron-forward" size={22} color="#c5c5d3" />
            </TouchableOpacity>

            <View style={styles.itemDivider} />

            {/* Change Password */}
            <TouchableOpacity
              style={styles.menuItem}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('ChangePassword')}
            >
              <View style={styles.itemLeft}>
                <View style={styles.itemIconCircle}>
                  <Ionicons name="lock-closed" size={20} color="#00236f" />
                </View>
                <Text style={[typography.titleMd, styles.itemTitle]}>Change Password</Text>
              </View>
              <Ionicons name="chevron-forward" size={22} color="#c5c5d3" />
            </TouchableOpacity>

            <View style={styles.itemDivider} />

            {/* My Orders */}
            <TouchableOpacity
              style={styles.menuItem}
              activeOpacity={0.7}
              onPress={() => (navigation as any).navigate('MainTabs', { screen: 'WalletTab' })}
            >
              <View style={styles.itemLeft}>
                <View style={styles.itemIconCircle}>
                  <Ionicons name="receipt" size={20} color="#00236f" />
                </View>
                <Text style={[typography.titleMd, styles.itemTitle]}>My Orders</Text>
              </View>
              <View style={styles.itemRightRow}>
                <View style={styles.activeOrdersBadge}>
                  <Text style={styles.activeOrdersText}>3 Active</Text>
                </View>
                <Ionicons name="chevron-forward" size={22} color="#c5c5d3" />
              </View>
            </TouchableOpacity>

            <View style={styles.itemDivider} />

            {/* Saved SIM Numbers */}
            <TouchableOpacity
              style={styles.menuItem}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('SavedNumbers')}
            >
              <View style={styles.itemLeft}>
                <View style={styles.itemIconCircle}>
                  <Ionicons name="cellular" size={20} color="#00236f" />
                </View>
                <Text style={[typography.titleMd, styles.itemTitle]}>Saved SIM Numbers</Text>
              </View>
              <View style={styles.itemRightRow}>
                <View style={styles.simsCountBadge}>
                  <Text style={styles.simsCountText}>4 SIMs</Text>
                </View>
                <Ionicons name="chevron-forward" size={22} color="#c5c5d3" />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* ============================================================ */}
        {/* STITCH SCREEN 14: Menu Group 2: Preferences & App            */}
        {/* ============================================================ */}
        <View style={styles.groupWrapper}>
          <View style={styles.groupHeaderRow}>
            <Text style={styles.groupHeaderTitle}>PREFERENCES & APP</Text>
          </View>

          <View style={styles.groupCard}>
            {/* Notifications with interactive toggle */}
            <View style={styles.menuItem}>
              <View style={styles.itemLeft}>
                <View style={styles.itemIconCircle}>
                  <Ionicons name="notifications" size={20} color="#00236f" />
                </View>
                <Text style={[typography.titleMd, styles.itemTitle]}>Notifications</Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: '#c5c5d3', true: '#00236f' }}
                thumbColor="#ffffff"
              />
            </View>

            <View style={styles.itemDivider} />

            {/* Language Selector */}
            <TouchableOpacity
              style={styles.menuItem}
              activeOpacity={0.7}
              onPress={() => setLanguage((prev) => (prev === 'EN' ? 'BN' : 'EN'))}
            >
              <View style={styles.itemLeft}>
                <View style={styles.itemIconCircle}>
                  <Ionicons name="language" size={20} color="#00236f" />
                </View>
                <Text style={[typography.titleMd, styles.itemTitle]}>Language</Text>
              </View>
              <View style={styles.itemRightRow}>
                <View style={styles.languageBadge}>
                  <View style={styles.langOrangeDot} />
                  <Text style={styles.languageText}>
                    {language === 'EN' ? 'English (EN)' : 'বাংলা (BN)'}
                  </Text>
                </View>
                <Ionicons name="swap-horizontal" size={20} color="#c5c5d3" />
              </View>
            </TouchableOpacity>

            <View style={styles.itemDivider} />

            {/* Help & Support */}
            <TouchableOpacity
              style={styles.menuItem}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('HelpSupport')}
            >
              <View style={styles.itemLeft}>
                <View style={styles.itemIconCircle}>
                  <Ionicons name="headset" size={20} color="#00236f" />
                </View>
                <Text style={[typography.titleMd, styles.itemTitle]}>Help & Support</Text>
              </View>
              <View style={styles.itemRightRow}>
                <Text style={styles.liveSupportText}>24/7 Live</Text>
                <Ionicons name="chevron-forward" size={22} color="#c5c5d3" />
              </View>
            </TouchableOpacity>

            <View style={styles.itemDivider} />

            {/* Terms & Privacy Policy */}
            <TouchableOpacity
              style={styles.menuItem}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('HelpSupport')}
            >
              <View style={styles.itemLeft}>
                <View style={styles.itemIconCircle}>
                  <Ionicons name="shield-checkmark" size={20} color="#00236f" />
                </View>
                <Text style={[typography.titleMd, styles.itemTitle]}>Terms & Privacy Policy</Text>
              </View>
              <Ionicons name="chevron-forward" size={22} color="#c5c5d3" />
            </TouchableOpacity>

            <View style={styles.itemDivider} />

            {/* About OfferHut */}
            <TouchableOpacity
              style={styles.menuItem}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('HelpSupport')}
            >
              <View style={styles.itemLeft}>
                <View style={styles.itemIconCircle}>
                  <Ionicons name="information-circle" size={20} color="#00236f" />
                </View>
                <Text style={[typography.titleMd, styles.itemTitle]}>About Mobixa</Text>
              </View>
              <Ionicons name="chevron-forward" size={22} color="#c5c5d3" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ============================================================ */}
        {/* STITCH SCREEN 14: Menu Group 3: Danger / Logout Action       */}
        {/* ============================================================ */}
        <View style={styles.logoutWrapper}>
          <TouchableOpacity
            style={styles.logoutCard}
            activeOpacity={0.8}
            onPress={() => setShowLogoutModal(true)}
          >
            <View style={styles.itemLeft}>
              <View style={styles.logoutIconBox}>
                <Ionicons name="log-out" size={20} color="#ba1a1a" />
              </View>
              <View style={styles.logoutTextCol}>
                <Text style={styles.logoutTitle}>Logout</Text>
                <Text style={styles.logoutSubtitle}>Sign out of this device</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={22} color="rgba(186, 26, 26, 0.6)" />
          </TouchableOpacity>
        </View>

        {/* ============================================================ */}
        {/* STITCH SCREEN 14: App Version & Delight Signature Footer     */}
        {/* ============================================================ */}
        <View style={styles.footerSection}>
          <View style={styles.footerPillBar} />
          <Text style={styles.versionText}>Mobixa App v2.4.1 (Build 108)</Text>
          <Text style={styles.signatureText}>
            Made with <Text style={styles.heartText}>❤️</Text> in Bangladesh
          </Text>
        </View>
      </ScrollView>

      {/* ============================================================ */}
      {/* LOGOUT CONFIRMATION MODAL                                    */}
      {/* ============================================================ */}
      <Modal
        visible={showLogoutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalIconBox}>
              <Ionicons name="log-out" size={28} color="#ba1a1a" />
            </View>

            <Text style={styles.modalTitle}>লগআউট করতে চান?</Text>
            <Text style={styles.modalSubtitle}>Sign out of Mobixa</Text>
            <Text style={styles.modalDescription}>
              পুনরায় লগইন করতে আপনার মোবাইল নম্বর ও পাসওয়ার্ড প্রয়োজন হবে। আপনার ওয়ালেট ব্যালেন্স ও অফার সম্পূর্ণ সুরক্ষিত থাকবে।
            </Text>

            <View style={styles.modalActionRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowLogoutModal(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={handleConfirmLogout}
                activeOpacity={0.8}
              >
                <Ionicons name="log-out-outline" size={16} color="#ffffff" />
                <Text style={styles.modalConfirmText}>Logout</Text>
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
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
  },

  /* 1. Profile Header Card */
  headerCardWrapper: {
    width: '100%',
    marginBottom: 20,
  },
  headerCard: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  blobTopRight: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(220, 225, 255, 0.4)',
  },
  blobBottomLeft: {
    position: 'absolute',
    bottom: -25,
    left: -25,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(255, 219, 202, 0.5)',
  },
  avatarWrapper: {
    position: 'relative',
    width: 96,
    height: 96,
    marginBottom: 12,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  initialsAvatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: {
    color: '#ffffff',
    fontSize: 38,
    fontWeight: '800',
    letterSpacing: 1,
  },
  cameraBadgeBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fd761a', // Stitch secondary-container
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  userName: {
    color: '#0b1c30',
    fontWeight: '700',
    fontSize: 20,
    letterSpacing: -0.2,
  },
  userPhone: {
    color: '#444651',
    fontWeight: '500',
    fontSize: 14,
    marginTop: 2,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(127, 252, 151, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
    marginTop: 10,
  },
  statusPillText: {
    color: '#005320',
    fontWeight: '700',
    fontSize: 10,
  },
  metricsRibbon: {
    width: '100%',
    flexDirection: 'row',
    backgroundColor: '#eff4ff',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 16,
  },
  metricCol: {
    flex: 1,
    alignItems: 'center',
  },
  metricValPrimary: {
    fontSize: 16,
    fontWeight: '700',
    color: '#00236f',
    lineHeight: 20,
  },
  metricValSecondary: {
    fontSize: 16,
    fontWeight: '700',
    color: '#9d4300',
    lineHeight: 20,
  },
  metricValTertiary: {
    fontSize: 16,
    fontWeight: '700',
    color: '#004b1d',
    lineHeight: 20,
  },
  metricLabel: {
    color: '#444651',
    fontWeight: '600',
    fontSize: 10,
    marginTop: 2,
  },

  /* 2. Menu Groups */
  groupWrapper: {
    width: '100%',
    marginBottom: 20,
  },
  groupHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginBottom: 6,
  },
  groupHeaderTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#444651',
    letterSpacing: 0.8,
  },
  walletActiveTag: {
    fontSize: 10,
    fontWeight: '600',
    color: '#00236f',
  },
  groupCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    padding: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 52,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  itemIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e5eeff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemTitle: {
    color: '#0b1c30',
    fontSize: 15,
    fontWeight: '600',
  },
  itemRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemDivider: {
    height: 1,
    backgroundColor: '#eff4ff',
    marginLeft: 66,
  },
  activeOrdersBadge: {
    backgroundColor: '#ffdbca',
    paddingHorizontal: 9,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  activeOrdersText: {
    color: '#341100',
    fontSize: 10,
    fontWeight: '700',
  },
  simsCountBadge: {
    backgroundColor: '#dce9ff',
    paddingHorizontal: 9,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  simsCountText: {
    color: '#00236f',
    fontSize: 10,
    fontWeight: '700',
  },
  languageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#e5eeff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  langOrangeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fd761a',
  },
  languageText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0b1c30',
  },
  liveSupportText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#44c365',
  },

  /* 3. Logout Section */
  logoutWrapper: {
    width: '100%',
    marginBottom: 24,
  },
  logoutCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#ba1a1a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  logoutIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffdad6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutTextCol: {
    flexDirection: 'column',
  },
  logoutTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ba1a1a',
  },
  logoutSubtitle: {
    fontSize: 10.5,
    fontWeight: '500',
    color: '#757682',
    marginTop: 1,
  },

  /* 4. Footer Section */
  footerSection: {
    alignItems: 'center',
    paddingTop: 4,
    paddingBottom: 24,
  },
  footerPillBar: {
    width: 32,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#d3e4fe',
    marginBottom: 12,
  },
  versionText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#757682',
    letterSpacing: 0.4,
  },
  signatureText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#c5c5d3',
    marginTop: 4,
  },
  heartText: {
    color: '#9d4300',
  },

  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(11, 28, 48, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalIconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ffdad6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0b1c30',
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#757682',
    marginTop: 2,
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: 12,
    lineHeight: 18,
    color: '#444651',
    textAlign: 'center',
    marginVertical: 14,
  },
  modalActionRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  modalCancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#eff4ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#444651',
  },
  modalConfirmBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#ba1a1a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  modalConfirmText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
});

export default ProfileScreen;
