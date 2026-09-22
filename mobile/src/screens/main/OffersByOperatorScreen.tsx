import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { rounded, spacing } from '../../theme/spacing';
import { Header } from '../../components/Header';
import { OperatorChip } from '../../components/OperatorChip';
import { MOCK_OPERATORS, MOCK_OFFERS } from '../../services/api';
import { Offer, OperatorCode, OfferCategory } from '../../types';
import { useOrder } from '../../context/OrderContext';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';

type OffersNavProp = StackNavigationProp<RootStackParamList>;

interface Props {
  navigation: OffersNavProp;
}

export const OffersByOperatorScreen: React.FC<Props> = ({ navigation }) => {
  const [selectedOperator, setSelectedOperator] = useState<OperatorCode | 'all'>('gp');
  const [selectedCategory, setSelectedCategory] = useState<OfferCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortDrawerVisible, setSortDrawerVisible] = useState(false);
  const [activeSort, setActiveSort] = useState<'lowest_price' | 'max_data' | 'longest_validity'>('lowest_price');

  // Preview Modal Sheet
  const [modalOffer, setModalOffer] = useState<Offer | null>(null);

  const { setSelectedOffer } = useOrder();

  // Active operator info
  const currentOperator = useMemo(() => {
    if (selectedOperator === 'all') return null;
    return MOCK_OPERATORS.find((op) => op.code === selectedOperator) || MOCK_OPERATORS[0];
  }, [selectedOperator]);

  // Filtered & sorted offers
  const filteredOffers = useMemo(() => {
    let list = MOCK_OFFERS.filter((offer) => {
      const matchesOperator =
        selectedOperator === 'all' || offer.operator_code === selectedOperator;
      const matchesCategory =
        selectedCategory === 'all' || offer.category === selectedCategory;
      const matchesSearch =
        !searchQuery ||
        offer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (offer.data_amount && offer.data_amount.toLowerCase().includes(searchQuery.toLowerCase())) ||
        offer.offer_price.toString().includes(searchQuery);
      return matchesOperator && matchesCategory && matchesSearch;
    });

    if (activeSort === 'lowest_price') {
      list = [...list].sort((a, b) => a.offer_price - b.offer_price);
    } else if (activeSort === 'max_data') {
      const parseGb = (val?: string) => {
        if (!val) return 0;
        const num = parseFloat(val);
        return isNaN(num) ? 0 : num;
      };
      list = [...list].sort((a, b) => parseGb(b.data_amount) - parseGb(a.data_amount));
    } else if (activeSort === 'longest_validity') {
      list = [...list].sort((a, b) => b.validity_days - a.validity_days);
    }

    return list;
  }, [selectedOperator, selectedCategory, searchQuery, activeSort]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const base = MOCK_OFFERS.filter(
      (o) => selectedOperator === 'all' || o.operator_code === selectedOperator
    );
    return {
      all: base.length,
      internet: base.filter((o) => o.category === 'internet').length,
      combo: base.filter((o) => o.category === 'combo').length,
      minutes: base.filter((o) => o.category === 'minutes').length,
    };
  }, [selectedOperator]);

  const handleOpenModal = (offer: Offer) => {
    setModalOffer(offer);
  };

  const handleProceedToRecharge = (offer: Offer) => {
    setModalOffer(null);
    setSelectedOffer(offer);
    navigation.navigate('OfferDetails', { offer });
  };

  const getOperatorColor = (code: string) => {
    return colors.operators[code as OperatorCode] || colors.primaryContainer;
  };

  return (
    <View style={styles.container}>
      {/* Stitch Header */}
      <Header
        title="Offers By Operator"
        showBack
        onBack={() => navigation.goBack()}
        showNotification
        hasUnreadNotifications
        onNotificationPress={() => navigation.navigate('Notifications')}
        showProfile
        onProfilePress={() => navigation.navigate('EditProfile')}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Horizontal Operator Bar */}
        <View style={styles.operatorRow}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.operatorScroll}
          >
            <OperatorChip
              label="All SIMs"
              code="all"
              isActive={selectedOperator === 'all'}
              onPress={() => setSelectedOperator('all')}
            />
            {MOCK_OPERATORS.map((op) => (
              <OperatorChip
                key={op.code}
                label={op.name}
                code={op.code}
                isActive={selectedOperator === op.code}
                onPress={() => setSelectedOperator(op.code)}
              />
            ))}
          </ScrollView>
        </View>

        {/* Interactive Filter & Quick Search Bar */}
        <View style={styles.searchSection}>
          <View style={styles.searchRow}>
            <Ionicons name="search" size={20} color={colors.outline} style={styles.searchIcon} />
            <TextInput
              placeholder={`Search ${currentOperator ? currentOperator.name : ''} data, minutes, or ৳...`}
              placeholderTextColor={colors.outline}
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={[typography.bodyMd, styles.searchInput]}
            />
            <TouchableOpacity
              style={[styles.sortTrigger, sortDrawerVisible && styles.sortTriggerActive]}
              onPress={() => setSortDrawerVisible(!sortDrawerVisible)}
              activeOpacity={0.8}
            >
              <Ionicons
                name="swap-vertical"
                size={16}
                color={sortDrawerVisible ? '#ffffff' : colors.primaryContainer}
              />
              <Text
                style={[
                  typography.labelSm,
                  styles.sortTriggerText,
                  sortDrawerVisible && styles.sortTriggerTextActive,
                ]}
              >
                Sort
              </Text>
            </TouchableOpacity>
          </View>

          {/* Collapsible Sort Options Strip */}
          {sortDrawerVisible && (
            <View style={styles.sortDrawer}>
              <TouchableOpacity
                style={[
                  styles.sortPill,
                  activeSort === 'lowest_price' && styles.sortPillActive,
                ]}
                onPress={() => setActiveSort('lowest_price')}
              >
                {activeSort === 'lowest_price' && (
                  <Ionicons name="checkmark" size={14} color="#ffffff" style={{ marginRight: 4 }} />
                )}
                <Text
                  style={[
                    typography.labelSm,
                    activeSort === 'lowest_price'
                      ? styles.sortPillTextActive
                      : styles.sortPillTextInactive,
                  ]}
                >
                  Lowest Price
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.sortPill,
                  activeSort === 'max_data' && styles.sortPillActive,
                ]}
                onPress={() => setActiveSort('max_data')}
              >
                {activeSort === 'max_data' && (
                  <Ionicons name="checkmark" size={14} color="#ffffff" style={{ marginRight: 4 }} />
                )}
                <Text
                  style={[
                    typography.labelSm,
                    activeSort === 'max_data'
                      ? styles.sortPillTextActive
                      : styles.sortPillTextInactive,
                  ]}
                >
                  Max Data Volume
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.sortPill,
                  activeSort === 'longest_validity' && styles.sortPillActive,
                ]}
                onPress={() => setActiveSort('longest_validity')}
              >
                {activeSort === 'longest_validity' && (
                  <Ionicons name="checkmark" size={14} color="#ffffff" style={{ marginRight: 4 }} />
                )}
                <Text
                  style={[
                    typography.labelSm,
                    activeSort === 'longest_validity'
                      ? styles.sortPillTextActive
                      : styles.sortPillTextInactive,
                  ]}
                >
                  Longest Validity
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Operator Header Showcase Card (Stitch 8) */}
        <View style={styles.showcaseCard}>
          {/* Decorative Glow */}
          <View style={styles.showcaseGlow} />

          <View style={styles.showcaseHeader}>
            <View style={styles.showcaseLeft}>
              {/* Brand Icon Tile */}
              <View style={styles.brandIconTile}>
                <Ionicons
                  name="cellular"
                  size={24}
                  color={currentOperator ? getOperatorColor(currentOperator.code) : colors.primaryContainer}
                />
              </View>
              <View>
                <View style={styles.operatorTitleRow}>
                  <Text style={[typography.headlineSm, styles.showcaseName]}>
                    {currentOperator ? currentOperator.name : 'All Operators'}
                  </Text>
                  <Ionicons name="checkmark-circle" size={18} color="#7ffc97" />
                </View>
                <Text style={[typography.bodySm, styles.showcaseSub]}>
                  {filteredOffers.length} Verified Packs Available
                </Text>
              </View>
            </View>
            <View style={styles.speedBadge}>
              <Text style={[typography.labelSm, styles.speedText]}>Speed 4.5G+</Text>
            </View>
          </View>

          {/* Category Filter Chips inside Banner */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
          >
            <TouchableOpacity
              style={[
                styles.categoryBannerChip,
                selectedCategory === 'all' && styles.categoryBannerChipActive,
              ]}
              onPress={() => setSelectedCategory('all')}
            >
              <Text
                style={[
                  typography.labelMd,
                  selectedCategory === 'all'
                    ? styles.categoryBannerTextActive
                    : styles.categoryBannerTextInactive,
                ]}
              >
                All ({categoryCounts.all})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.categoryBannerChip,
                selectedCategory === 'internet' && styles.categoryBannerChipActive,
              ]}
              onPress={() => setSelectedCategory('internet')}
            >
              <Text
                style={[
                  typography.labelMd,
                  selectedCategory === 'internet'
                    ? styles.categoryBannerTextActive
                    : styles.categoryBannerTextInactive,
                ]}
              >
                Internet ({categoryCounts.internet})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.categoryBannerChip,
                selectedCategory === 'combo' && styles.categoryBannerChipActive,
              ]}
              onPress={() => setSelectedCategory('combo')}
            >
              <Text
                style={[
                  typography.labelMd,
                  selectedCategory === 'combo'
                    ? styles.categoryBannerTextActive
                    : styles.categoryBannerTextInactive,
                ]}
              >
                Combo ({categoryCounts.combo})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.categoryBannerChip,
                selectedCategory === 'minutes' && styles.categoryBannerChipActive,
              ]}
              onPress={() => setSelectedCategory('minutes')}
            >
              <Text
                style={[
                  typography.labelMd,
                  selectedCategory === 'minutes'
                    ? styles.categoryBannerTextActive
                    : styles.categoryBannerTextInactive,
                ]}
              >
                Minutes ({categoryCounts.minutes})
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Offers Feed Section */}
        <View style={styles.offersSection}>
          {filteredOffers.map((offer, index) => {
            const isPopular = offer.is_featured || index === 0;
            const cashback = offer.cashback_amount || 0;

            return (
              <View key={offer.id} style={styles.offerCard}>
                {/* Highlight Ribbon */}
                <View style={styles.cardRibbon}>
                  <View style={styles.ribbonLeft}>
                    {isPopular && (
                      <View style={styles.popularTag}>
                        <Ionicons name="flame" size={13} color="#ffffff" />
                        <Text style={[typography.labelSm, styles.popularText]}>Most Popular</Text>
                      </View>
                    )}
                    <View style={styles.opTag}>
                      <Text style={[typography.labelSm, styles.opTagText]}>
                        {offer.operator_name || offer.operator_code.toUpperCase()} 4G/5G
                      </Text>
                    </View>
                  </View>

                  {cashback > 0 ? (
                    <View style={styles.cashbackPill}>
                      <Text style={[typography.labelSm, styles.cashbackText]}>
                        ⚡ ৳{cashback} Cashback
                      </Text>
                    </View>
                  ) : null}
                </View>

                {/* Core Pack Info */}
                <View style={styles.cardCore}>
                  <View style={styles.cardInfo}>
                    <Text style={[typography.headlineSm, styles.cardTitle]} numberOfLines={1}>
                      {offer.title}
                    </Text>
                    <View style={styles.subInfoRow}>
                      <Ionicons name="checkmark-circle" size={15} color={colors.outline} />
                      <Text style={[typography.bodySm, styles.cardSub]} numberOfLines={1}>
                        {offer.description || 'Any Net Mins • Bonus 4G Data'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.priceContainer}>
                    <Text style={[typography.headlineMd, styles.priceText]}>
                      ৳{offer.offer_price}
                    </Text>
                    <Text style={[typography.labelSm, styles.validityText]}>
                      {offer.validity_days} Days
                    </Text>
                  </View>
                </View>

                {/* Action Footer */}
                <View style={styles.cardFooter}>
                  <View style={styles.instantTag}>
                    <Ionicons name="shield-checkmark" size={16} color="#004b1d" />
                    <Text style={[typography.labelSm, styles.instantText]}>Instant recharge</Text>
                  </View>

                  <TouchableOpacity
                    style={styles.viewDetailsBtn}
                    onPress={() => handleOpenModal(offer)}
                    activeOpacity={0.8}
                  >
                    <Text style={[typography.labelMd, styles.viewDetailsText]}>View Details</Text>
                    <Ionicons name="chevron-forward" size={16} color="#ffffff" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}

          {filteredOffers.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={48} color={colors.outline} />
              <Text style={[typography.titleMd, styles.emptyTitle]}>No offers found</Text>
              <Text style={[typography.bodySm, styles.emptySub]}>
                Try adjusting your search or category filter.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Interactive Modal Bottom Sheet for Offer Details (Stitch 8) */}
      <Modal
        visible={!!modalOffer}
        transparent
        animationType="slide"
        onRequestClose={() => setModalOffer(null)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setModalOffer(null)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalDragHandle} />

            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <Ionicons name="checkmark-circle" size={24} color={colors.secondaryContainer} />
                <Text style={[typography.headlineSm, styles.modalTitle]} numberOfLines={1}>
                  {modalOffer?.title}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setModalOffer(null)}
              >
                <Ionicons name="close" size={20} color={colors.onSurface} />
              </TouchableOpacity>
            </View>

            {/* Price Box */}
            <View style={styles.modalPriceBox}>
              <View>
                <Text style={[typography.labelSm, styles.modalPriceLabel]}>Recharge Amount</Text>
                <Text style={[typography.headlineMd, styles.modalPriceValue]}>
                  ৳{modalOffer?.offer_price}
                </Text>
              </View>
              <View style={styles.modalDeliveryBadge}>
                <Text style={[typography.labelMd, styles.modalDeliveryText]}>Instant Delivery</Text>
              </View>
            </View>

            {/* Bullet List */}
            <View style={styles.modalBullets}>
              <View style={styles.bulletItem}>
                <Ionicons name="checkmark" size={18} color="#004b1d" />
                <Text style={[typography.bodySm, styles.bulletText]}>
                  Dial *121*1# to check remaining data and minutes balance
                </Text>
              </View>
              <View style={styles.bulletItem}>
                <Ionicons name="checkmark" size={18} color="#004b1d" />
                <Text style={[typography.bodySm, styles.bulletText]}>
                  Usable in 2G/3G/4G/5G network areas all over Bangladesh
                </Text>
              </View>
              <View style={styles.bulletItem}>
                <Ionicons name="checkmark" size={18} color="#004b1d" />
                <Text style={[typography.bodySm, styles.bulletText]}>
                  bKash / Nagad / Upay instant cashback applies on checkout
                </Text>
              </View>
            </View>

            {/* Proceed CTA Button */}
            <TouchableOpacity
              style={styles.modalCtaBtn}
              onPress={() => modalOffer && handleProceedToRecharge(modalOffer)}
              activeOpacity={0.8}
            >
              <Text style={[typography.labelLg, styles.modalCtaText]}>Proceed to Recharge</Text>
              <Ionicons name="flash" size={18} color="#ffffff" />
            </TouchableOpacity>
          </Pressable>
        </Pressable>
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
    paddingBottom: 40,
  },
  operatorRow: {
    paddingVertical: spacing.sm,
  },
  operatorScroll: {
    paddingHorizontal: spacing.gutter,
    gap: spacing.xs,
  },
  searchSection: {
    paddingHorizontal: spacing.gutter,
    marginBottom: spacing.sm,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: rounded.xl,
    paddingHorizontal: spacing.md,
    height: 48,
    shadowColor: '#1e3a8a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#eff4ff',
  },
  searchIcon: {
    marginRight: spacing.xs,
  },
  searchInput: {
    flex: 1,
    color: '#0b1c30',
    height: '100%',
  },
  sortTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#eff4ff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  sortTriggerActive: {
    backgroundColor: colors.primaryContainer,
  },
  sortTriggerText: {
    color: colors.primaryContainer,
    fontWeight: '700',
  },
  sortTriggerTextActive: {
    color: '#ffffff',
  },
  sortDrawer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingTop: 10,
    paddingBottom: 4,
  },
  sortPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    backgroundColor: '#dce9ff',
  },
  sortPillActive: {
    backgroundColor: colors.primaryContainer,
  },
  sortPillTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  sortPillTextInactive: {
    color: '#444651',
    fontWeight: '600',
  },

  /* Showcase Card (Stitch 8) */
  showcaseCard: {
    marginHorizontal: spacing.gutter,
    borderRadius: 16,
    backgroundColor: '#1e3a8a',
    padding: spacing.md,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#1e3a8a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
    marginBottom: spacing.md,
  },
  showcaseGlow: {
    position: 'absolute',
    top: -24,
    right: -24,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(64, 89, 170, 0.35)',
  },
  showcaseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  showcaseLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  brandIconTile: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  operatorTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  showcaseName: {
    color: '#ffffff',
    fontWeight: '700',
  },
  showcaseSub: {
    color: 'rgba(220, 233, 255, 0.85)',
    marginTop: 2,
  },
  speedBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 9999,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },
  speedText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  categoryScroll: {
    gap: 8,
  },
  categoryBannerChip: {
    height: 32,
    paddingHorizontal: 14,
    borderRadius: 9999,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryBannerChipActive: {
    backgroundColor: '#ffffff',
  },
  categoryBannerTextActive: {
    color: colors.primaryContainer,
    fontWeight: '700',
  },
  categoryBannerTextInactive: {
    color: '#ffffff',
    fontWeight: '600',
  },

  /* Offers Feed Section */
  offersSection: {
    paddingHorizontal: spacing.gutter,
    gap: 12,
  },
  offerCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: spacing.md,
    shadowColor: '#1e3a8a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
    gap: 12,
    borderWidth: 1,
    borderColor: '#eff4ff',
  },
  cardRibbon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ribbonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  popularTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.secondaryContainer,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  popularText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  opTag: {
    backgroundColor: '#d3e4fe',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  opTagText: {
    color: colors.primaryContainer,
    fontWeight: '700',
  },
  cashbackPill: {
    backgroundColor: 'rgba(0, 75, 29, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
  },
  cashbackText: {
    color: '#004b1d',
    fontWeight: '800',
  },
  cardCore: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    color: '#0b1c30',
    fontWeight: '700',
  },
  subInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  cardSub: {
    color: '#444651',
    flex: 1,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceText: {
    color: colors.primaryContainer,
    fontWeight: '800',
  },
  validityText: {
    color: colors.outline,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  instantTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  instantText: {
    color: '#004b1d',
    fontWeight: '600',
  },
  viewDetailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.secondaryContainer,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  viewDetailsText: {
    color: '#ffffff',
    fontWeight: '700',
  },

  /* Empty State */
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 8,
  },
  emptyTitle: {
    color: '#0b1c30',
    fontWeight: '700',
  },
  emptySub: {
    color: colors.outline,
  },

  /* Modal Bottom Sheet */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(33, 49, 69, 0.45)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.gutter,
    paddingBottom: 36,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  modalDragHandle: {
    width: 48,
    height: 5,
    backgroundColor: '#c5c5d3',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  modalTitle: {
    color: '#0b1c30',
    fontWeight: '700',
    flex: 1,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#eff4ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalPriceBox: {
    backgroundColor: '#eff4ff',
    borderRadius: 12,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: spacing.sm,
  },
  modalPriceLabel: {
    color: '#444651',
  },
  modalPriceValue: {
    color: colors.primaryContainer,
    fontWeight: '800',
    marginTop: 2,
  },
  modalDeliveryBadge: {
    backgroundColor: '#7ffc97',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  modalDeliveryText: {
    color: '#002109',
    fontWeight: '700',
  },
  modalBullets: {
    paddingVertical: spacing.sm,
    gap: 10,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bulletText: {
    color: '#444651',
    flex: 1,
  },
  modalCtaBtn: {
    marginTop: spacing.md,
    backgroundColor: colors.secondaryContainer,
    borderRadius: 12,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: colors.secondaryContainer,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  modalCtaText: {
    color: '#ffffff',
    fontWeight: '700',
  },
});
