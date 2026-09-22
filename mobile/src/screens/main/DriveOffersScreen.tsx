import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { rounded, spacing } from '../../theme/spacing';
import { Header } from '../../components/Header';
import { Offer } from '../../types';
import { useOrder } from '../../context/OrderContext';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';

type DriveNavProp = StackNavigationProp<RootStackParamList>;

interface Props {
  navigation: DriveNavProp;
}

interface DrivePack extends Offer {
  stock_left?: number;
  badge_tag?: string;
  savings_percent?: number;
  highlight_note?: string;
}

const FLASH_DEALS: DrivePack[] = [
  {
    id: 'flash-1',
    title: 'GP 50GB + 1600 Min',
    operator_code: 'gp',
    operator_name: 'Grameenphone',
    category: 'combo',
    data_amount: '50 GB',
    voice_minutes: 1600,
    validity_days: 30,
    regular_price: 999,
    offer_price: 699,
    cashback_amount: 100,
    is_featured: true,
    is_drive_offer: true,
    is_active: true,
    stock_left: 14,
    badge_tag: 'Super Drive',
    savings_percent: 30,
    highlight_note: 'Instant Wallet Cashback',
    description: 'High speed 4.5G internet with 1600 all-net call minutes for 30 days.',
  },
  {
    id: 'flash-2',
    title: 'Robi 45GB Unlimited + 800 Min',
    operator_code: 'robi',
    operator_name: 'Robi Axiata',
    category: 'combo',
    data_amount: '45 GB',
    voice_minutes: 800,
    validity_days: 30,
    regular_price: 750,
    offer_price: 549,
    cashback_amount: 80,
    is_featured: true,
    is_drive_offer: true,
    is_active: true,
    stock_left: 8,
    badge_tag: 'High Speed',
    savings_percent: 27,
    highlight_note: 'Direct Operator Topup',
    description: 'Nonstop high-speed data with 800 minutes valid for 30 days.',
  },
];

const ALL_DRIVE_OFFERS: DrivePack[] = [
  {
    id: 'drive-1',
    title: 'GP 60 GB Internet + 1000 Mins',
    operator_code: 'gp',
    operator_name: 'Grameenphone',
    category: 'combo',
    data_amount: '60 GB',
    voice_minutes: 1000,
    validity_days: 30,
    regular_price: 899,
    offer_price: 649,
    cashback_amount: 120,
    is_featured: true,
    is_drive_offer: true,
    is_active: true,
    badge_tag: 'Super Drive',
    savings_percent: 25,
    highlight_note: 'Instant Wallet Cashback',
    description: 'Special high volume combo drive pack with maximum cashback.',
  },
  {
    id: 'drive-2',
    title: 'BL 40 GB All Net + 700 Mins',
    operator_code: 'banglalink',
    operator_name: 'Banglalink',
    category: 'combo',
    data_amount: '40 GB',
    voice_minutes: 700,
    validity_days: 30,
    regular_price: 540,
    offer_price: 430,
    cashback_amount: 70,
    is_featured: false,
    is_drive_offer: true,
    is_active: true,
    badge_tag: 'Dhamaka Pack',
    savings_percent: 20,
    highlight_note: 'Auto-Activated in 2 mins',
    description: 'Banglalink Dhamaka monthly package with guaranteed commission.',
  },
  {
    id: 'drive-3',
    title: 'Robi 30 GB Nonstop Data',
    operator_code: 'robi',
    operator_name: 'Robi',
    category: 'internet',
    data_amount: '30 GB',
    validity_days: 30,
    regular_price: 499,
    offer_price: 350,
    cashback_amount: 50,
    is_featured: false,
    is_drive_offer: true,
    is_active: true,
    badge_tag: 'Special Drive',
    savings_percent: 30,
    highlight_note: 'Zero Commission Fee',
    description: 'Nonstop high speed internet pack for Robi subscribers.',
  },
  {
    id: 'drive-4',
    title: 'Teletalk 25 GB + 500 Min',
    operator_code: 'teletalk',
    operator_name: 'Teletalk',
    category: 'combo',
    data_amount: '25 GB',
    voice_minutes: 500,
    validity_days: 30,
    regular_price: 340,
    offer_price: 280,
    cashback_amount: 40,
    is_featured: false,
    is_drive_offer: true,
    is_active: true,
    badge_tag: 'Oporajita',
    savings_percent: 18,
    highlight_note: 'Official Carrier Direct',
    description: 'Special affordable national carrier package with instant activation.',
  },
  {
    id: 'drive-5',
    title: 'Airtel 50 GB + 900 Mins',
    operator_code: 'airtel',
    operator_name: 'Airtel',
    category: 'combo',
    data_amount: '50 GB',
    voice_minutes: 900,
    validity_days: 30,
    regular_price: 720,
    offer_price: 520,
    cashback_amount: 90,
    is_featured: false,
    is_drive_offer: true,
    is_active: true,
    badge_tag: 'Friends Drive',
    savings_percent: 28,
    highlight_note: 'High Cashback Tier',
    description: 'Youth network combo package with high cashback reward.',
  },
];

export const DriveOffersScreen: React.FC<Props> = ({ navigation }) => {
  const { setSelectedOffer } = useOrder();
  const [selectedOperator, setSelectedOperator] = useState<string>('all');

  // Flash Countdown Timer (03:42:19 counting down)
  const [secondsRemaining, setSecondsRemaining] = useState(3 * 3600 + 42 * 60 + 19);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredOffers =
    selectedOperator === 'all'
      ? ALL_DRIVE_OFFERS
      : ALL_DRIVE_OFFERS.filter((o) => o.operator_code === selectedOperator);

  const handleSelectOffer = (offer: DrivePack) => {
    setSelectedOffer(offer);
    navigation.navigate('OfferDetails', { offer });
  };

  return (
    <View style={styles.container}>
      {/* Stitch Header */}
      <Header
        title="Drive Offers"
        showNotification
        hasUnreadNotifications
        onNotificationPress={() => navigation.navigate('Notifications')}
        showProfile
        onProfilePress={() => (navigation as any).navigate('MainTabs', { screen: 'ProfileTab' })}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ============================================================ */}
        {/* STITCH SCREEN 19: Flash Sale Section & Countdown             */}
        {/* ============================================================ */}
        <View style={styles.flashSection}>
          <View style={styles.flashHeaderRow}>
            <View style={styles.flashTitleRow}>
              <Ionicons name="flash" size={22} color="#fd761a" />
              <Text style={[typography.titleMd, styles.flashTitle]}>Flash Sale</Text>
            </View>

            {/* Live Countdown Badge */}
            <View style={styles.countdownBadge}>
              <View style={styles.pulseDotWrapper}>
                <View style={styles.pulseDotPing} />
                <View style={styles.pulseDot} />
              </View>
              <Text style={styles.countdownLabel}>ENDS IN</Text>
              <Text style={styles.countdownTimer}>{formatCountdown(secondsRemaining)}</Text>
            </View>
          </View>

          {/* Horizontal Flash Carousel */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carouselContainer}
          >
            {FLASH_DEALS.map((deal) => {
              const originalPrice = Math.round(deal.offer_price * 1.4);
              const opColor = colors.operators[deal.operator_code] || '#00236f';

              return (
                <View key={deal.id} style={styles.flashCard}>
                  {/* Angled Corner Ribbon */}
                  <View style={styles.ribbonWrapper}>
                    <View style={styles.ribbon}>
                      <Text style={styles.ribbonText}>Cashback ৳{deal.cashback_amount}</Text>
                    </View>
                  </View>

                  {/* Card Content */}
                  <View style={styles.flashCardContent}>
                    {/* Operator & Stock Header */}
                    <View style={styles.flashTopRow}>
                      <View style={styles.opHeaderRow}>
                        <View style={[styles.opIconTile, { backgroundColor: `${opColor}15` }]}>
                          <Ionicons name="cellular" size={16} color={opColor} />
                        </View>
                        <Text style={styles.opNameText}>{deal.operator_name}</Text>
                      </View>
                    </View>

                    {/* Title & Badges */}
                    <Text style={styles.dealTitle} numberOfLines={1}>
                      {deal.title}
                    </Text>

                    <View style={styles.badgesRow}>
                      <View style={styles.badgePill}>
                        <Ionicons name="time-outline" size={12} color="#444651" />
                        <Text style={styles.badgeText}>{deal.validity_days} Days</Text>
                      </View>
                      {deal.stock_left && (
                        <View style={styles.stockBadge}>
                          <View style={styles.stockDot} />
                          <Text style={styles.stockText}>{deal.stock_left} Left</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Pricing & Action Bar */}
                  <View style={styles.flashBottomBar}>
                    <View>
                      <Text style={styles.strikethroughPrice}>৳{originalPrice}</Text>
                      <Text style={styles.boldPrice}>৳{deal.offer_price}</Text>
                    </View>

                    <TouchableOpacity
                      style={styles.grabDealBtn}
                      activeOpacity={0.85}
                      onPress={() => handleSelectOffer(deal)}
                    >
                      <Text style={styles.grabDealText}>Grab Deal</Text>
                      <Ionicons name="flash" size={16} color="#ffffff" />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </View>

        {/* ============================================================ */}
        {/* STITCH SCREEN 19: All Drive Offers & Filter Chips           */}
        {/* ============================================================ */}
        <View style={styles.allOffersSection}>
          {/* Header with Counter */}
          <View style={styles.allOffersHeaderRow}>
            <View style={styles.counterTitleRow}>
              <Text style={styles.allOffersTitle}>All Drive Offers</Text>
              <View style={styles.countPill}>
                <Text style={styles.countText}>{ALL_DRIVE_OFFERS.length}</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.filterActionBtn} activeOpacity={0.7}>
              <Ionicons name="options-outline" size={16} color="#1e3a8a" />
              <Text style={styles.filterActionText}>Filter</Text>
            </TouchableOpacity>
          </View>

          {/* Filter Chips Carousel */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterChipsRow}
          >
            {/* All Chip */}
            <TouchableOpacity
              style={[styles.filterChip, selectedOperator === 'all' && styles.filterChipActive]}
              onPress={() => setSelectedOperator('all')}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedOperator === 'all' && styles.filterChipTextActive,
                ]}
              >
                All
              </Text>
              <View
                style={[
                  styles.chipCounter,
                  selectedOperator === 'all' && styles.chipCounterActive,
                ]}
              >
                <Text
                  style={[
                    styles.chipCounterText,
                    selectedOperator === 'all' && styles.chipCounterTextActive,
                  ]}
                >
                  {ALL_DRIVE_OFFERS.length}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Grameenphone */}
            <TouchableOpacity
              style={[styles.filterChip, selectedOperator === 'gp' && styles.filterChipActive]}
              onPress={() => setSelectedOperator('gp')}
              activeOpacity={0.7}
            >
              <View style={[styles.chipColorDot, { backgroundColor: '#0284c7' }]} />
              <Text
                style={[
                  styles.filterChipText,
                  selectedOperator === 'gp' && styles.filterChipTextActive,
                ]}
              >
                Grameenphone
              </Text>
            </TouchableOpacity>

            {/* Banglalink */}
            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedOperator === 'banglalink' && styles.filterChipActive,
              ]}
              onPress={() => setSelectedOperator('banglalink')}
              activeOpacity={0.7}
            >
              <View style={[styles.chipColorDot, { backgroundColor: '#fd761a' }]} />
              <Text
                style={[
                  styles.filterChipText,
                  selectedOperator === 'banglalink' && styles.filterChipTextActive,
                ]}
              >
                Banglalink
              </Text>
            </TouchableOpacity>

            {/* Robi */}
            <TouchableOpacity
              style={[styles.filterChip, selectedOperator === 'robi' && styles.filterChipActive]}
              onPress={() => setSelectedOperator('robi')}
              activeOpacity={0.7}
            >
              <View style={[styles.chipColorDot, { backgroundColor: '#ba1a1a' }]} />
              <Text
                style={[
                  styles.filterChipText,
                  selectedOperator === 'robi' && styles.filterChipTextActive,
                ]}
              >
                Robi
              </Text>
            </TouchableOpacity>

            {/* Teletalk */}
            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedOperator === 'teletalk' && styles.filterChipActive,
              ]}
              onPress={() => setSelectedOperator('teletalk')}
              activeOpacity={0.7}
            >
              <View style={[styles.chipColorDot, { backgroundColor: '#004b1d' }]} />
              <Text
                style={[
                  styles.filterChipText,
                  selectedOperator === 'teletalk' && styles.filterChipTextActive,
                ]}
              >
                Teletalk
              </Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Large Detailed Drive Cards Stream */}
          <View style={styles.cardsStream}>
            {filteredOffers.map((offer) => {
              const originalPrice = Math.round(offer.offer_price * 1.35);
              const opColor = colors.operators[offer.operator_code] || '#00236f';

              return (
                <View key={offer.id} style={styles.streamCard}>
                  {/* Card Header */}
                  <View style={styles.streamCardTop}>
                    <View style={styles.streamOpLeft}>
                      <View style={[styles.streamOpTile, { backgroundColor: `${opColor}15` }]}>
                        <Ionicons name="cellular" size={22} color={opColor} />
                      </View>
                      <View>
                        <View style={styles.streamOpBadgeRow}>
                          <Text style={[styles.streamOpName, { color: opColor }]}>
                            {offer.operator_name}
                          </Text>
                          {offer.badge_tag && (
                            <View style={styles.streamBadgeTag}>
                              <Text style={styles.streamBadgeTagText}>{offer.badge_tag}</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.streamOfferTitle}>{offer.title}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Badges & Validity Row */}
                  <View style={styles.streamBadgesRow}>
                    <View style={styles.streamBadgePill}>
                      <Ionicons name="calendar-outline" size={13} color="#444651" />
                      <Text style={styles.streamBadgePillText}>
                        {offer.validity_days} Days Validity
                      </Text>
                    </View>

                    {offer.savings_percent && (
                      <View style={styles.savingsPill}>
                        <Ionicons name="wallet-outline" size={13} color="#002109" />
                        <Text style={styles.savingsPillText}>Save {offer.savings_percent}%</Text>
                      </View>
                    )}

                    <View style={styles.cashbackPill}>
                      <Ionicons name="gift-outline" size={13} color="#341100" />
                      <Text style={styles.cashbackPillText}>
                        Cashback ৳{offer.cashback_amount}
                      </Text>
                    </View>
                  </View>

                  {/* Divider & Bottom Transaction Block */}
                  <View style={styles.streamBottomBar}>
                    <View>
                      <View style={styles.priceRow}>
                        <Text style={styles.streamFinalPrice}>৳{offer.offer_price}</Text>
                        <Text style={styles.streamStrikePrice}>৳{originalPrice}</Text>
                      </View>
                      <Text style={styles.streamNoteText}>
                        {offer.highlight_note || 'Instant Wallet Cashback'}
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={styles.streamGrabBtn}
                      activeOpacity={0.85}
                      onPress={() => handleSelectOffer(offer)}
                    >
                      <Text style={styles.streamGrabText}>Grab Deal</Text>
                      <Ionicons name="arrow-forward" size={16} color="#ffffff" />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* ============================================================ */}
        {/* STITCH SCREEN 19: Trust & Guaranteed Delivery Banner         */}
        {/* ============================================================ */}
        <View style={styles.trustBanner}>
          <View style={styles.trustIconCircle}>
            <Ionicons name="shield-checkmark" size={22} color="#ffffff" />
          </View>
          <View style={styles.trustTextCol}>
            <View style={styles.guaranteedRow}>
              <Text style={styles.guaranteedTitle}>100% Guaranteed Delivery</Text>
              <Ionicons name="checkmark-circle" size={16} color="#004b1d" />
            </View>
            <Text style={styles.guaranteedSubtitle}>
              Instant operator direct debit & automated activation within 2 minutes
            </Text>
          </View>
        </View>
      </ScrollView>
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
    gap: 16,
  },

  /* 1. Flash Sale Section */
  flashSection: {
    width: '100%',
  },
  flashHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  flashTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  flashTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0b1c30',
    letterSpacing: -0.2,
  },
  countdownBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 218, 214, 0.8)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    gap: 6,
  },
  pulseDotWrapper: {
    position: 'relative',
    width: 8,
    height: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseDotPing: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ba1a1a',
    opacity: 0.6,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ba1a1a',
  },
  countdownLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#ba1a1a',
    letterSpacing: 0.5,
  },
  countdownTimer: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 12,
    fontWeight: '700',
    color: '#93000a',
  },
  carouselContainer: {
    gap: 12,
    paddingBottom: 4,
  },
  flashCard: {
    width: 300,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    justifyContent: 'space-between',
  },
  ribbonWrapper: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 100,
    height: 100,
    overflow: 'hidden',
  },
  ribbon: {
    position: 'absolute',
    top: 16,
    right: -26,
    transform: [{ rotate: '45deg' }],
    backgroundColor: '#fd761a',
    paddingVertical: 3,
    paddingHorizontal: 26,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  ribbonText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  flashCardContent: {
    marginBottom: 12,
  },
  flashTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 50,
    marginBottom: 8,
  },
  opHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  opIconTile: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  opNameText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#444651',
  },
  dealTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0b1c30',
    marginTop: 2,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#eff4ff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#444651',
  },
  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 218, 214, 0.5)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  stockDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#ba1a1a',
  },
  stockText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#ba1a1a',
  },
  flashBottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(239, 244, 255, 0.6)',
    marginHorizontal: -16,
    marginBottom: -16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  strikethroughPrice: {
    fontSize: 11,
    color: '#757682',
    textDecorationLine: 'line-through',
  },
  boldPrice: {
    fontSize: 20,
    fontWeight: '900',
    color: '#00236f',
    lineHeight: 22,
  },
  grabDealBtn: {
    backgroundColor: '#fd761a',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    shadowColor: '#fd761a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  grabDealText: {
    color: '#ffffff',
    fontSize: 12.5,
    fontWeight: '700',
  },

  /* 2. All Drive Offers Section */
  allOffersSection: {
    width: '100%',
  },
  allOffersHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  counterTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  allOffersTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0b1c30',
  },
  countPill: {
    backgroundColor: '#dce9ff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  countText: {
    color: '#00236f',
    fontSize: 11,
    fontWeight: '700',
  },
  filterActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  filterActionText: {
    color: '#1e3a8a',
    fontSize: 12.5,
    fontWeight: '600',
  },
  filterChipsRow: {
    gap: 8,
    paddingVertical: 4,
    marginBottom: 10,
  },
  filterChip: {
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 9999,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  filterChipActive: {
    backgroundColor: '#1e3a8a',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#444651',
  },
  filterChipTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  chipCounter: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 9999,
  },
  chipCounterActive: {
    backgroundColor: '#00236f',
  },
  chipCounterText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#444651',
  },
  chipCounterTextActive: {
    color: '#ffffff',
  },
  chipColorDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },

  /* Stream Cards */
  cardsStream: {
    gap: 12,
  },
  streamCard: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    gap: 12,
  },
  streamCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  streamOpLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  streamOpTile: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  streamOpBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  streamOpName: {
    fontSize: 12,
    fontWeight: '800',
  },
  streamBadgeTag: {
    backgroundColor: '#eff4ff',
    paddingHorizontal: 7,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  streamBadgeTagText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#444651',
  },
  streamOfferTitle: {
    fontSize: 15.5,
    fontWeight: '800',
    color: '#0b1c30',
    marginTop: 2,
  },
  streamBadgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  streamBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#eff4ff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  streamBadgePillText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#444651',
  },
  savingsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#7ffc97',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  savingsPillText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#002109',
  },
  cashbackPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ffdbca',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  cashbackPillText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#341100',
  },
  streamBottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  streamFinalPrice: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0b1c30',
  },
  streamStrikePrice: {
    fontSize: 11.5,
    color: '#757682',
    textDecorationLine: 'line-through',
  },
  streamNoteText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#44c365',
    marginTop: 1,
  },
  streamGrabBtn: {
    height: 42,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#fd761a',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    shadowColor: '#fd761a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  streamGrabText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#ffffff',
  },

  /* 3. Trust Banner */
  trustBanner: {
    backgroundColor: '#eff4ff',
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  trustIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1e3a8a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trustTextCol: {
    flex: 1,
  },
  guaranteedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  guaranteedTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#00236f',
  },
  guaranteedSubtitle: {
    fontSize: 11,
    color: '#444651',
    marginTop: 2,
    lineHeight: 15,
  },
});

export default DriveOffersScreen;
