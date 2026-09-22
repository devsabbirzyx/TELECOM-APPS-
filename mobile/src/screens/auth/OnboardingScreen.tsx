import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Platform,
} from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { rounded, spacing } from '../../theme/spacing';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';

type OnboardingScreenNavProp = StackNavigationProp<RootStackParamList, 'Onboarding'>;

interface Props {
  navigation: OnboardingScreenNavProp;
}

export const OnboardingScreen: React.FC<Props> = ({ navigation }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    navigation.navigate('SignUp');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Top Bar Actions */}
        <View style={styles.topBar}>
          <View style={styles.brandRow}>
            <View style={styles.simIconBox}>
              <Ionicons name="card" size={18} color="#ffffff" />
            </View>
            <Text style={styles.brandTitle}>SIMBari</Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            style={styles.skipBtn}
            activeOpacity={0.7}
          >
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>

        {/* Hero Visual Area: 3D SIM & Floating Badges */}
        <View style={styles.heroCard}>
          {/* Floating Badge 1: Teletalk 4G */}
          <View style={styles.floatingBadgeTeletalk}>
            <View style={styles.greenDot} />
            <Text style={styles.teletalkText}>Teletalk 4G</Text>
            <View style={styles.teletalkPrice}>
              <Text style={styles.priceText}>৳49</Text>
            </View>
          </View>

          {/* Floating Badge 2: -30% OFF */}
          <View style={styles.floatingBadgeDiscount}>
            <Ionicons name="flame" size={14} color="#ffffff" />
            <Text style={styles.discountText}>-30% OFF</Text>
          </View>

          {/* Central 3D BD SIM Card */}
          <View style={styles.simCardContainer}>
            <View style={styles.simCard}>
              {/* Header */}
              <View style={styles.simHeader}>
                <View style={styles.bdFlagRow}>
                  <View style={styles.bdFlagGreen}>
                    <View style={styles.bdFlagRed} />
                  </View>
                  <Text style={styles.bdSimText}>BD 4G/5G</Text>
                </View>
                <View style={styles.superSimBadge}>
                  <Text style={styles.superSimText}>SUPER SIM</Text>
                </View>
              </View>

              {/* Metallic Golden Chip */}
              <View style={styles.chipContainer}>
                <View style={styles.goldenChip}>
                  <View style={styles.chipInnerCircle}>
                    <View style={styles.chipCore} />
                  </View>
                  <View style={styles.chipLineH} />
                  <View style={styles.chipLineV} />
                </View>
                <Text style={styles.simSerial}>8988 0100 4829 1934</Text>
              </View>

              {/* Operators Footer */}
              <View style={styles.simFooter}>
                <View style={styles.operatorTags}>
                  <Text style={{ color: '#7dd3fc', fontWeight: '800', fontSize: 10 }}>GP</Text>
                  <Text style={styles.dotSeparator}>•</Text>
                  <Text style={{ color: '#f87171', fontWeight: '800', fontSize: 10 }}>ROBI</Text>
                  <Text style={styles.dotSeparator}>•</Text>
                  <Text style={{ color: '#fbbf24', fontWeight: '800', fontSize: 10 }}>BL</Text>
                  <Text style={styles.dotSeparator}>•</Text>
                  <Text style={{ color: '#34d399', fontWeight: '800', fontSize: 10 }}>TT</Text>
                </View>
                <Ionicons name="arrow-up" size={12} color="#ffffff" />
              </View>
            </View>
          </View>

          {/* Floating Badge 3: Banglalink Combo */}
          <View style={styles.floatingBadgeBL}>
            <View style={styles.badgeTopRow}>
              <Text style={styles.operatorLabelBL}>Banglalink</Text>
              <View style={styles.comboPill}>
                <Text style={styles.comboPillText}>Combo</Text>
              </View>
            </View>
            <Text style={styles.dataTitle}>25 GB</Text>
            <View style={styles.badgeBottomRow}>
              <Text style={styles.subDetail}>500 Mins</Text>
              <Text style={styles.priceHighlight}>৳398</Text>
            </View>
          </View>

          {/* Floating Badge 4: Super Pack */}
          <View style={styles.floatingBadgeSuper}>
            <View style={styles.badgeTopRow}>
              <Ionicons name="flash" size={12} color="#16a34a" />
              <Text style={styles.superLabel}>SUPER PACK</Text>
            </View>
            <Text style={styles.dataTitleBlue}>50 GB</Text>
            <View style={styles.badgeBottomRow}>
              <Text style={styles.subDetail}>30 Days</Text>
              <View style={styles.savePill}>
                <Text style={styles.savePillText}>Save ৳120</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Text Content */}
        <View style={styles.textSection}>
          <Text style={styles.mainTitle}>Browse offers from all operators</Text>
          <Text style={styles.description}>
            Compare exclusive internet, minute, and combo bundles across GP, Robi, BL, Teletalk & Airtel at unbeatable rates.
          </Text>

          {/* Dot Pagination */}
          <View style={styles.paginationDots}>
            <View style={styles.activeDot} />
            <View style={styles.inactiveDot} />
            <View style={styles.inactiveDot} />
          </View>
        </View>

        {/* Bottom CTA */}
        <View style={styles.bottomSection}>
          <TouchableOpacity
            style={styles.getStartedBtn}
            onPress={handleNext}
            activeOpacity={0.85}
          >
            <Text style={styles.getStartedText}>Get Started</Text>
            <Ionicons name="arrow-forward" size={18} color="#ffffff" />
          </TouchableOpacity>

          <View style={styles.loginRow}>
            <Text style={styles.loginPrompt}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Log in</Text>
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
    paddingTop: 12,
    paddingBottom: 24,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  simIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#1e3a8a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#00236f',
  },
  skipBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#757682',
  },
  heroCard: {
    position: 'relative',
    height: 350,
    backgroundColor: '#eef2ff',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    overflow: 'hidden',
  },
  floatingBadgeTeletalk: {
    position: 'absolute',
    top: 20,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    gap: 6,
    zIndex: 10,
  },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22c55e',
  },
  teletalkText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1e293b',
  },
  teletalkPrice: {
    backgroundColor: '#15803d',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  priceText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
  floatingBadgeDiscount: {
    position: 'absolute',
    top: 28,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f97316',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    shadowColor: '#f97316',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
    gap: 4,
    zIndex: 10,
  },
  discountText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
  simCardContainer: {
    width: 170,
    height: 220,
    shadowColor: '#1e3a8a',
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
  simCard: {
    width: '100%',
    height: '100%',
    backgroundColor: '#0a1d4a',
    borderRadius: 18,
    borderTopRightRadius: 36,
    padding: 12,
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  simHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bdFlagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  bdFlagGreen: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#006a4e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bdFlagRed: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#f42a41',
  },
  bdSimText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
  },
  superSimBadge: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  superSimText: {
    color: '#ffffff',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  chipContainer: {
    alignItems: 'center',
  },
  goldenChip: {
    width: 76,
    height: 56,
    borderRadius: 8,
    backgroundColor: '#eab308',
    borderWidth: 1,
    borderColor: '#ca8a04',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipInnerCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#a16207',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipCore: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#854d0e',
  },
  chipLineH: {
    position: 'absolute',
    width: '100%',
    height: 1,
    backgroundColor: '#a16207',
  },
  chipLineV: {
    position: 'absolute',
    height: '100%',
    width: 1,
    backgroundColor: '#a16207',
  },
  simSerial: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 8,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginTop: 6,
  },
  simFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  operatorTags: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  dotSeparator: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 8,
  },
  floatingBadgeBL: {
    position: 'absolute',
    bottom: 24,
    left: 10,
    width: 140,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 10,
  },
  floatingBadgeSuper: {
    position: 'absolute',
    bottom: 24,
    right: 10,
    width: 140,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 10,
  },
  badgeTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  operatorLabelBL: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ea580c',
  },
  comboPill: {
    backgroundColor: '#ffedd5',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  comboPillText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#c2410c',
  },
  superLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#15803d',
  },
  dataTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  dataTitleBlue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1e3a8a',
  },
  badgeBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  subDetail: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '500',
  },
  priceHighlight: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0f172a',
  },
  savePill: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  savePillText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#15803d',
  },
  textSection: {
    alignItems: 'center',
    textAlign: 'center',
    marginBottom: 28,
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#00236f',
    textAlign: 'center',
    marginBottom: 10,
  },
  description: {
    fontSize: 13,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 12,
    marginBottom: 18,
  },
  paginationDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activeDot: {
    width: 24,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#f97316',
  },
  inactiveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#dbeafe',
  },
  bottomSection: {
    gap: 16,
  },
  getStartedBtn: {
    backgroundColor: '#f97316',
    borderRadius: 16,
    height: 52,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#f97316',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  getStartedText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginPrompt: {
    fontSize: 13,
    color: '#475569',
  },
  loginLink: {
    fontSize: 13,
    fontWeight: '700',
    color: '#00236f',
  },
});
