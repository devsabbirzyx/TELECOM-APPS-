import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { rounded, spacing } from '../../theme/spacing';
import { Header } from '../../components/Header';
import { OperatorChip } from '../../components/OperatorChip';
import { OfferCard } from '../../components/OfferCard';
import { BannerCarousel } from '../../components/BannerCarousel';
import { ClaimFreeModal } from '../../components/ClaimFreeModal';
import { api, MOCK_OPERATORS, MOCK_OFFERS } from '../../services/api';
import { Offer, Operator, OperatorCode, OfferCategory, FreeClaimStatus } from '../../types';
import { useOrder } from '../../context/OrderContext';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';

type HomeNavProp = StackNavigationProp<RootStackParamList>;

interface Props {
  navigation: HomeNavProp;
}

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [operators, setOperators] = useState<Operator[]>(MOCK_OPERATORS);
  const [offers, setOffers] = useState<Offer[]>(MOCK_OFFERS);
  const [selectedOperator, setSelectedOperator] = useState<OperatorCode | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<OfferCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [claimModalVisible, setClaimModalVisible] = useState(false);
  const [claimStatus, setClaimStatus] = useState<FreeClaimStatus | null>(null);

  const { setSelectedOffer } = useOrder();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [ops, offs, claimRes] = await Promise.all([
        api.getOperators(),
        api.getOffers(),
        api.getFreeClaimStatus().catch(() => null),
      ]);
      if (ops && ops.length) setOperators(ops);
      if (offs && offs.length) setOffers(offs);
      if (claimRes?.claim) setClaimStatus(claimRes.claim);
    } catch {
      // Fallback to initial mock
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const filteredOffers = offers.filter((offer) => {
    const matchesOperator =
      selectedOperator === 'all' || offer.operator_code === selectedOperator;
    const matchesCategory =
      selectedCategory === 'all' || offer.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      offer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (offer.data_amount && offer.data_amount.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesOperator && matchesCategory && matchesSearch;
  });

  const handleSelectOffer = (offer: Offer) => {
    setSelectedOffer(offer);
    navigation.navigate('OfferDetails', { offer });
  };

  const handleBuyOffer = (offer: Offer) => {
    setSelectedOffer(offer);
    navigation.navigate('Checkout', { offer });
  };

  return (
    <View style={styles.container}>
      <Header
        title="Mobixa"
        showNotification
        hasUnreadNotifications
        onNotificationPress={() => navigation.navigate('Notifications')}
        showProfile
        onProfilePress={() => navigation.navigate('EditProfile')}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Search & Pay Bar */}
        <View style={styles.searchBar}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search-outline" size={18} color={colors.outline} />
            <TextInput
              placeholder="Search data pack, minutes, recharge..."
              placeholderTextColor={colors.outline}
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={[typography.bodyMd, styles.searchInput]}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color={colors.outline} />
              </TouchableOpacity>
            ) : null}
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('SavedNumbers')}
            style={styles.quickPayBtn}
            activeOpacity={0.8}
          >
            <Ionicons name="flash" size={16} color={colors.primaryContainer} />
            <Text style={[typography.labelMd, styles.quickPayText]}>Quick Pay</Text>
          </TouchableOpacity>
        </View>

        {/* Operator Selector Chips */}
        <View style={styles.operatorSection}>
          <View style={styles.sectionHeader}>
            <Text style={[typography.labelMd, styles.sectionTitle]}>Select Operator</Text>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={[typography.labelSm, styles.liveText]}>Live Discounts</Text>
            </View>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
            <OperatorChip
              label="All"
              code="all"
              isActive={selectedOperator === 'all'}
              onPress={() => setSelectedOperator('all')}
            />
            {operators.map((op) => (
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

        {/* 10 GB Free Welcome Banner */}
        <BannerCarousel
          onClaimPress={() => setClaimModalVisible(true)}
          claimStatus={claimStatus}
        />

        {/* Popular Offers Header with Category Filter */}
        <View style={styles.offersSectionHeader}>
          <Text style={[typography.headlineSm, styles.offersTitle]}>Popular Bundles</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('MainTabs')}
            activeOpacity={0.7}
          >
            <Text style={[typography.labelMd, styles.viewAllText]}>See All</Text>
          </TouchableOpacity>
        </View>

        {/* Category Filter Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          {(['all', 'internet', 'combo', 'minutes', 'drive'] as OfferCategory[]).map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setSelectedCategory(cat)}
              style={[
                styles.categoryPill,
                selectedCategory === cat && styles.categoryPillActive,
              ]}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  typography.labelSm,
                  selectedCategory === cat
                    ? styles.categoryTextActive
                    : styles.categoryTextInactive,
                ]}
              >
                {cat.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Offers Feed */}
        <View style={styles.offersFeed}>
          {filteredOffers.length === 0 ? (
            <View style={styles.emptyView}>
              <Text style={[typography.bodyMd, styles.emptyText]}>
                No offers found matching your criteria.
              </Text>
            </View>
          ) : (
            filteredOffers.map((offer) => (
              <OfferCard
                key={offer.id}
                offer={offer}
                onPress={() => handleSelectOffer(offer)}
                onBuyPress={() => handleBuyOffer(offer)}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* Claim Free 10GB Modal */}
      <ClaimFreeModal
        visible={claimModalVisible}
        onClose={() => setClaimModalVisible(false)}
        claimStatus={claimStatus}
        onClaimSuccess={() => {
          loadData();
        }}
        onBuyPack={() => {
          setClaimModalVisible(false);
          (navigation as any).navigate('OffersTab');
        }}
      />
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
    paddingBottom: spacing.xxxl,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: rounded.xl,
    padding: spacing.xs,
    marginTop: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: spacing.sm,
    gap: spacing.xs,
  },
  searchInput: {
    flex: 1,
    color: colors.onSurface,
    paddingVertical: 8,
  },
  quickPayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainer,
    paddingHorizontal: spacing.md,
    height: 38,
    borderRadius: rounded.md,
    gap: 4,
  },
  quickPayText: {
    color: colors.primaryContainer,
  },
  operatorSection: {
    marginBottom: spacing.xs,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
    paddingHorizontal: 2,
  },
  sectionTitle: {
    color: colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.secondaryContainer,
  },
  liveText: {
    color: colors.secondaryContainer,
  },
  chipScroll: {
    paddingVertical: 2,
  },
  offersSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  offersTitle: {
    color: colors.onSurface,
  },
  viewAllText: {
    color: colors.primaryContainer,
  },
  categoryScroll: {
    marginBottom: spacing.md,
  },
  categoryPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: rounded.full,
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.xs,
  },
  categoryPillActive: {
    backgroundColor: colors.primaryContainer,
    borderColor: colors.primaryContainer,
  },
  categoryTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  categoryTextInactive: {
    color: colors.onSurfaceVariant,
  },
  offersFeed: {
    marginTop: spacing.xs,
  },
  emptyView: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyText: {
    color: colors.outline,
  },
});
