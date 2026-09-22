import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Share,
  Alert,
  Platform,
  Image,
  Animated,
} from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { rounded, spacing } from '../../theme/spacing';
import { api, MOCK_TRANSACTIONS } from '../../services/api';
import { WalletTransaction } from '../../types';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type FilterType = 'all' | 'credits' | 'debits' | 'cashback';

interface DisplayTransaction {
  id: string;
  title: string;
  timestamp: string;
  status: 'Settled' | 'Completed';
  amount: number;
  type: 'credit' | 'debit';
  tag: 'Bonus' | 'Applied' | 'Cashback' | 'Refund' | 'Reward' | 'Deposit';
  icon: keyof typeof MaterialIcons.glyphMap;
  iconBg: string;
  iconColor: string;
}

const INITIAL_DISPLAY_TRANSACTIONS: DisplayTransaction[] = [
  {
    id: 'tx-1',
    title: 'Referral Bonus - Rahim used your code',
    timestamp: 'Today, 02:45 PM',
    status: 'Settled',
    amount: 50.0,
    type: 'credit',
    tag: 'Bonus',
    icon: 'redeem',
    iconBg: colors.surfaceContainerHigh,
    iconColor: colors.tertiaryContainer,
  },
  {
    id: 'tx-2',
    title: 'Used on GP 50GB Drive Pack',
    timestamp: 'Yesterday, 11:20 AM',
    status: 'Completed',
    amount: 100.0,
    type: 'debit',
    tag: 'Applied',
    icon: 'local-offer',
    iconBg: colors.errorContainer,
    iconColor: colors.error,
  },
  {
    id: 'tx-3',
    title: 'Cashback - Banglalink Dhamaka Pack',
    timestamp: '16 Sep 2026',
    status: 'Settled',
    amount: 70.0,
    type: 'credit',
    tag: 'Cashback',
    icon: 'currency-exchange',
    iconBg: colors.surfaceContainerHigh,
    iconColor: colors.tertiaryContainer,
  },
  {
    id: 'tx-4',
    title: 'Service Delayed Auto-Refund',
    timestamp: '14 Sep 2026',
    status: 'Settled',
    amount: 150.0,
    type: 'credit',
    tag: 'Refund',
    icon: 'replay',
    iconBg: colors.surfaceContainerHigh,
    iconColor: colors.tertiaryContainer,
  },
  {
    id: 'tx-5',
    title: 'Welcome Signup Bonus',
    timestamp: '10 Sep 2026',
    status: 'Settled',
    amount: 50.0,
    type: 'credit',
    tag: 'Reward',
    icon: 'celebration',
    iconBg: colors.surfaceContainerHigh,
    iconColor: colors.tertiaryContainer,
  },
];

export const WalletScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  const [balance, setBalance] = useState<number>(620.0);
  const [cashbackEarned, setCashbackEarned] = useState<number>(450.0);
  const [referralRewards, setReferralRewards] = useState<number>(170.0);
  const [transactions, setTransactions] = useState<DisplayTransaction[]>(INITIAL_DISPLAY_TRANSACTIONS);

  // Filter state
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [isFilterModalVisible, setIsFilterModalVisible] = useState<boolean>(false);

  // Add Money Modal state
  const [isAddMoneyVisible, setIsAddMoneyVisible] = useState<boolean>(false);
  const [selectedPreset, setSelectedPreset] = useState<number>(200);
  const [customAmount, setCustomAmount] = useState<string>('200');
  const [selectedMethod, setSelectedMethod] = useState<'bkash' | 'nagad'>('bkash');
  const [isDepositing, setIsDepositing] = useState<boolean>(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  useEffect(() => {
    loadWallet();
  }, []);

  const loadWallet = async () => {
    try {
      const balRes = await api.getWalletBalance();
      if (balRes?.balance !== undefined) {
        setBalance(balRes.balance);
      }
    } catch {
      // Keep mock balance
    }
  };

  const handleSelectPreset = (amount: number) => {
    setSelectedPreset(amount);
    setCustomAmount(amount.toString());
  };

  const handleCustomAmountChange = (text: string) => {
    const clean = text.replace(/[^0-9]/g, '');
    setCustomAmount(clean);
    const num = parseInt(clean, 10);
    if (!isNaN(num)) {
      setSelectedPreset(num);
    } else {
      setSelectedPreset(0);
    }
  };

  const handleConfirmAddMoney = () => {
    const amt = parseFloat(customAmount);
    if (isNaN(amt) || amt < 10) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount of at least ৳10.');
      return;
    }

    setIsDepositing(true);
    setTimeout(() => {
      setIsDepositing(false);
      setIsAddMoneyVisible(false);

      const newBalance = balance + amt;
      setBalance(newBalance);

      const newTx: DisplayTransaction = {
        id: `tx-dep-${Date.now()}`,
        title: `Wallet Top-up via ${selectedMethod === 'bkash' ? 'bKash' : 'Nagad'}`,
        timestamp: 'Just now',
        status: 'Settled',
        amount: amt,
        type: 'credit',
        tag: 'Deposit',
        icon: 'savings',
        iconBg: colors.surfaceContainerHigh,
        iconColor: colors.tertiaryContainer,
      };

      setTransactions([newTx, ...transactions]);

      setSuccessToast(`৳${amt.toFixed(2)} added successfully via ${selectedMethod === 'bkash' ? 'bKash' : 'Nagad'}!`);
      setTimeout(() => setSuccessToast(null), 4000);
    }, 1000);
  };

  const handleShareReferral = async () => {
    try {
      await Share.share({
        message: 'Join Mobixa and get instant ৳50 cashback on your first recharge! Use referral code: MOBIXA50 https://mobixa.app/ref/MOBIXA50',
      });
    } catch {
      Alert.alert('Referral Code', 'Your referral code is: MOBIXA50 (Copied to clipboard!)');
    }
  };

  // Filtered transactions
  const filteredTransactions = transactions.filter((tx) => {
    if (filterType === 'all') return true;
    if (filterType === 'credits') return tx.type === 'credit';
    if (filterType === 'debits') return tx.type === 'debit';
    if (filterType === 'cashback') return tx.tag === 'Cashback' || tx.tag === 'Bonus';
    return true;
  });

  const getFilterLabel = () => {
    switch (filterType) {
      case 'all':
        return 'All Transactions';
      case 'credits':
        return 'Credits Only (+)';
      case 'debits':
        return 'Debits Only (-)';
      case 'cashback':
        return 'Cashback Rewards';
    }
  };

  return (
    <View style={styles.container}>
      {/* 0. Custom Top Header matching Stitch 21 */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) }]}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              aria-label="Go back"
              style={styles.backButton}
              onPress={() => {
                if (navigation.canGoBack()) {
                  navigation.goBack();
                } else {
                  navigation.navigate('HomeTab');
                }
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={22} color={colors.onSurface} />
            </TouchableOpacity>

            <View style={styles.headerBrandGroup}>
              <View style={styles.brandIconBadge}>
                <Ionicons name="flash" size={14} color="#ffffff" />
              </View>
              <Text style={[typography.titleLg, styles.headerTitle]}>Wallet</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.profileAvatarWrapper}
            onPress={() => navigation.navigate('ProfileTab')}
            activeOpacity={0.8}
          >
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
              }}
              style={styles.profileAvatar}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Success Toast Banner */}
      {successToast && (
        <View style={styles.toastContainer}>
          <View style={styles.toastCard}>
            <Ionicons name="checkmark-circle" size={20} color={colors.tertiaryContainer} />
            <Text style={[typography.bodySm, styles.toastText]}>{successToast}</Text>
          </View>
        </View>
      )}

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 80 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Top Balance Hero Card */}
        <LinearGradient
          colors={[colors.primaryContainer, '#162d6d', '#0d1b42']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          {/* Decorative ambient glowing circles */}
          <View style={styles.glowBlob1} />
          <View style={styles.glowBlob2} />

          {/* Balance Header & Value */}
          <View style={styles.heroHeader}>
            <View style={styles.balanceTitleRow}>
              <Text style={[typography.labelSm, styles.balanceLabel]}>AVAILABLE WALLET BALANCE</Text>
              <View style={styles.activeBadge}>
                <View style={styles.activeDot} />
                <Text style={styles.activeText}>Active</Text>
              </View>
            </View>

            <Text style={[typography.headlineLg, styles.balanceAmount]}>
              ৳ {balance.toFixed(2)}
            </Text>
          </View>

          {/* Info Banner inside card */}
          <View style={styles.infoBanner}>
            <MaterialIcons name="info" size={18} color={colors.secondaryFixed} style={styles.infoIcon} />
            <Text style={[typography.bodySm, styles.infoText]}>
              Bonus balance can be applied to get instant discount on your next SIM bundle recharge.
            </Text>
          </View>

          {/* Dual Action Buttons */}
          <View style={styles.dualActionRow}>
            <TouchableOpacity
              style={styles.addMoneyBtn}
              onPress={() => setIsAddMoneyVisible(true)}
              activeOpacity={0.85}
            >
              <MaterialIcons name="add-circle" size={20} color="#ffffff" />
              <Text style={[typography.titleMd, styles.addMoneyBtnText]}>Add Money</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.useBalanceBtn}
              onPress={() => navigation.navigate('DriveOffersTab')}
              activeOpacity={0.85}
            >
              <MaterialIcons name="bolt" size={20} color="#ffffff" />
              <Text style={[typography.titleMd, styles.useBalanceBtnText]}>Use Balance</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* 2. Quick Balance Breakdown (2 Cards Grid) */}
        <View style={styles.breakdownGrid}>
          {/* Card 1: Cashback */}
          <View style={styles.breakdownCard}>
            <View style={styles.breakdownHeader}>
              <Text style={[typography.labelMd, styles.breakdownTitle]}>Cashback</Text>
              <View style={styles.breakdownIconWrapperPrimary}>
                <MaterialIcons name="savings" size={16} color={colors.primaryContainer} />
              </View>
            </View>
            <View>
              <Text style={[typography.labelSm, styles.breakdownSub]}>Total Earned</Text>
              <Text style={[typography.titleLg, styles.breakdownValue]}>
                ৳ {cashbackEarned.toFixed(2)}
              </Text>
            </View>
          </View>

          {/* Card 2: Referrals */}
          <View style={styles.breakdownCard}>
            <View style={styles.breakdownHeader}>
              <Text style={[typography.labelMd, styles.breakdownTitle]}>Referrals</Text>
              <View style={styles.breakdownIconWrapperSecondary}>
                <MaterialIcons name="card-giftcard" size={16} color={colors.secondary} />
              </View>
            </View>
            <View>
              <Text style={[typography.labelSm, styles.breakdownSub]}>Bonus Rewards</Text>
              <Text style={[typography.titleLg, styles.breakdownValue]}>
                ৳ {referralRewards.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* Promo Banner Strip */}
        <View style={styles.promoBanner}>
          <View style={styles.promoIconContainer}>
            <MaterialIcons name="card-giftcard" size={26} color={colors.secondaryContainer} />
          </View>
          <View style={styles.promoContent}>
            <Text style={[typography.titleMd, styles.promoTitle]} numberOfLines={1}>
              Invite Friends, Earn ৳50
            </Text>
            <Text style={[typography.bodySm, styles.promoSubtitle]} numberOfLines={1}>
              Instant cash bonus on their first drive pack recharge!
            </Text>
          </View>
          <TouchableOpacity
            style={styles.shareButton}
            onPress={handleShareReferral}
            activeOpacity={0.8}
          >
            <Ionicons name="share-social-outline" size={18} color={colors.primaryContainer} />
          </TouchableOpacity>
        </View>

        {/* 3. Transaction History Section */}
        <View style={styles.historySection}>
          {/* Section Header */}
          <View style={styles.historyHeader}>
            <Text style={[typography.titleLg, styles.historyTitle]}>Transaction History</Text>

            <TouchableOpacity
              style={styles.filterPillButton}
              onPress={() => setIsFilterModalVisible(true)}
              activeOpacity={0.8}
            >
              <Text style={[typography.labelMd, styles.filterPillText]}>
                {getFilterLabel()}
              </Text>
              <Ionicons name="chevron-down" size={16} color={colors.onSurfaceVariant} />
            </TouchableOpacity>
          </View>

          {/* Transaction List */}
          <View style={styles.transactionList}>
            {filteredTransactions.length === 0 ? (
              <View style={styles.emptyStateContainer}>
                <MaterialIcons name="receipt-long" size={40} color={colors.outlineVariant} />
                <Text style={[typography.bodyMd, styles.emptyStateText]}>
                  No transactions found for this filter.
                </Text>
              </View>
            ) : (
              filteredTransactions.map((tx) => {
                const isCredit = tx.type === 'credit';
                return (
                  <View key={tx.id} style={styles.txCard}>
                    <View style={styles.txLeft}>
                      <View style={[styles.txIconBox, { backgroundColor: tx.iconBg }]}>
                        <MaterialIcons name={tx.icon} size={20} color={tx.iconColor} />
                      </View>

                      <View style={styles.txDetails}>
                        <Text style={[typography.titleMd, styles.txTitleText]} numberOfLines={1}>
                          {tx.title}
                        </Text>
                        <View style={styles.txMetaRow}>
                          <Text style={[typography.bodySm, styles.txTimestamp]}>{tx.timestamp}</Text>
                          <View style={styles.txMetaDot} />
                          <View
                            style={[
                              styles.txStatusBadge,
                              tx.status === 'Settled'
                                ? styles.statusSettled
                                : styles.statusCompleted,
                            ]}
                          >
                            <Text
                              style={[
                                typography.labelSm,
                                tx.status === 'Settled'
                                  ? styles.statusSettledText
                                  : styles.statusCompletedText,
                              ]}
                            >
                              {tx.status}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>

                    <View style={styles.txRight}>
                      <Text
                        style={[
                          typography.titleMd,
                          isCredit ? styles.creditAmount : styles.debitAmount,
                        ]}
                      >
                        {isCredit ? '+' : '-'}৳{tx.amount.toFixed(2)}
                      </Text>
                      <Text style={[typography.labelSm, styles.txTagText]}>{tx.tag}</Text>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </View>

        {/* Security & Trust Footnote */}
        <View style={styles.trustFootnote}>
          <MaterialIcons name="verified-user" size={16} color={colors.tertiaryContainer} />
          <Text style={[typography.labelSm, styles.trustFootnoteText]}>
            Secured by Bangladesh Bank compliant escrow framework
          </Text>
        </View>
      </ScrollView>

      {/* Filter Modal */}
      <Modal
        visible={isFilterModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsFilterModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setIsFilterModalVisible(false)}
        >
          <View style={styles.filterModalCard}>
            <View style={styles.filterModalHeader}>
              <Text style={[typography.titleLg, styles.filterModalTitle]}>Filter Transactions</Text>
              <TouchableOpacity
                style={styles.closeModalBtn}
                onPress={() => setIsFilterModalVisible(false)}
              >
                <Ionicons name="close" size={20} color={colors.onSurfaceVariant} />
              </TouchableOpacity>
            </View>

            <View style={styles.filterOptionsList}>
              {(
                [
                  { id: 'all', label: 'All Transactions' },
                  { id: 'credits', label: 'Credits Only (+)' },
                  { id: 'debits', label: 'Debits Only (-)' },
                  { id: 'cashback', label: 'Cashback Rewards' },
                ] as { id: FilterType; label: string }[]
              ).map((opt) => {
                const isSelected = filterType === opt.id;
                return (
                  <TouchableOpacity
                    key={opt.id}
                    style={[
                      styles.filterOptionItem,
                      isSelected && styles.filterOptionItemSelected,
                    ]}
                    onPress={() => {
                      setFilterType(opt.id);
                      setIsFilterModalVisible(false);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        typography.titleMd,
                        isSelected ? styles.filterOptionTextSelected : styles.filterOptionText,
                      ]}
                    >
                      {opt.label}
                    </Text>
                    {isSelected && (
                      <MaterialIcons name="check" size={18} color={colors.primaryContainer} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Add Money Modal (Interactive Bottom Sheet) */}
      <Modal
        visible={isAddMoneyVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsAddMoneyVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setIsAddMoneyVisible(false)}
        >
          <TouchableOpacity activeOpacity={1} style={styles.addMoneyModalCard}>
            <View style={styles.addMoneyHeader}>
              <View>
                <Text style={[typography.titleLg, styles.addMoneyTitle]}>Add Money to Wallet</Text>
                <Text style={[typography.bodySm, styles.addMoneySubtitle]}>
                  Instant balance reload via bKash or Nagad
                </Text>
              </View>
              <TouchableOpacity
                style={styles.closeModalBtn}
                onPress={() => setIsAddMoneyVisible(false)}
              >
                <Ionicons name="close" size={22} color={colors.onSurfaceVariant} />
              </TouchableOpacity>
            </View>

            {/* Quick Preset Amount Chips */}
            <Text style={[typography.labelMd, styles.inputSectionLabel]}>SELECT AMOUNT</Text>
            <View style={styles.presetsRow}>
              {[100, 200, 500, 1000].map((amt) => {
                const isSelected = selectedPreset === amt;
                return (
                  <TouchableOpacity
                    key={amt}
                    style={[styles.presetChip, isSelected && styles.presetChipSelected]}
                    onPress={() => handleSelectPreset(amt)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        typography.titleMd,
                        isSelected ? styles.presetChipTextSelected : styles.presetChipText,
                      ]}
                    >
                      ৳{amt}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Custom Amount Input */}
            <View style={styles.amountInputContainer}>
              <Text style={styles.currencySymbol}>৳</Text>
              <TextInput
                style={styles.amountInput}
                keyboardType="numeric"
                value={customAmount}
                onChangeText={handleCustomAmountChange}
                placeholder="Enter amount"
                placeholderTextColor={colors.outline}
                maxLength={6}
              />
            </View>

            {/* Payment Method Radio Selection */}
            <Text style={[typography.labelMd, styles.inputSectionLabel]}>CHOOSE PAYMENT METHOD</Text>
            <View style={styles.methodsContainer}>
              {/* bKash */}
              <TouchableOpacity
                style={[
                  styles.methodCard,
                  selectedMethod === 'bkash' && styles.methodCardSelectedBkash,
                ]}
                onPress={() => setSelectedMethod('bkash')}
                activeOpacity={0.85}
              >
                <View style={styles.methodInfoLeft}>
                  <View style={[styles.methodLogoBadge, { backgroundColor: '#d12053' }]}>
                    <Text style={styles.methodLogoText}>bKash</Text>
                  </View>
                  <View>
                    <Text style={[typography.titleMd, styles.methodName]}>bKash Online</Text>
                    <Text style={[typography.bodySm, styles.methodSub]}>Instant • 0% Fee</Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.radioCircle,
                    selectedMethod === 'bkash' && styles.radioCircleSelectedBkash,
                  ]}
                >
                  {selectedMethod === 'bkash' && <View style={styles.radioDot} />}
                </View>
              </TouchableOpacity>

              {/* Nagad */}
              <TouchableOpacity
                style={[
                  styles.methodCard,
                  selectedMethod === 'nagad' && styles.methodCardSelectedNagad,
                ]}
                onPress={() => setSelectedMethod('nagad')}
                activeOpacity={0.85}
              >
                <View style={styles.methodInfoLeft}>
                  <View style={[styles.methodLogoBadge, { backgroundColor: '#f7931e' }]}>
                    <Text style={styles.methodLogoText}>Nagad</Text>
                  </View>
                  <View>
                    <Text style={[typography.titleMd, styles.methodName]}>Nagad Direct</Text>
                    <Text style={[typography.bodySm, styles.methodSub]}>Instant • 0% Fee</Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.radioCircle,
                    selectedMethod === 'nagad' && styles.radioCircleSelectedNagad,
                  ]}
                >
                  {selectedMethod === 'nagad' && <View style={styles.radioDot} />}
                </View>
              </TouchableOpacity>
            </View>

            {/* Confirm Button */}
            <TouchableOpacity
              style={[
                styles.confirmAddBtn,
                isDepositing && { opacity: 0.7 },
              ]}
              onPress={handleConfirmAddMoney}
              disabled={isDepositing}
              activeOpacity={0.9}
            >
              <MaterialIcons name="account-balance-wallet" size={20} color="#ffffff" />
              <Text style={[typography.titleMd, styles.confirmAddBtnText]}>
                {isDepositing
                  ? 'Processing Deposit...'
                  : `Proceed to Pay ৳${customAmount || '0'}`}
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    backgroundColor: 'rgba(248, 249, 255, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.04)',
    zIndex: 50,
  },
  headerContent: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.gutter,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -4,
  },
  headerBrandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandIconBadge: {
    width: 26,
    height: 26,
    borderRadius: 7,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: colors.onSurface,
    fontWeight: '700',
  },
  profileAvatarWrapper: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    borderColor: colors.primaryFixed,
    overflow: 'hidden',
  },
  profileAvatar: {
    width: '100%',
    height: '100%',
  },

  toastContainer: {
    position: 'absolute',
    top: 60,
    left: spacing.gutter,
    right: spacing.gutter,
    zIndex: 999,
  },
  toastCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: rounded.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.tertiaryContainer,
  },
  toastText: {
    color: colors.onSurface,
    fontWeight: '600',
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.md,
  },

  /* 1. Hero Card */
  heroCard: {
    borderRadius: rounded.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#00236f',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
  glowBlob1: {
    position: 'absolute',
    right: -40,
    top: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(249, 115, 22, 0.2)',
  },
  glowBlob2: {
    position: 'absolute',
    left: -50,
    bottom: -50,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(30, 58, 138, 0.4)',
  },
  heroHeader: {
    position: 'relative',
    zIndex: 10,
    marginBottom: spacing.md,
  },
  balanceTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  balanceLabel: {
    color: 'rgba(182, 196, 255, 0.9)',
    letterSpacing: 0.8,
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: rounded.full,
    gap: 4,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.tertiaryFixed,
  },
  activeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
  },
  balanceAmount: {
    color: '#ffffff',
    fontWeight: '800',
    letterSpacing: -0.5,
  },

  infoBanner: {
    position: 'relative',
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: rounded.lg,
    padding: 10,
    gap: 8,
    marginBottom: spacing.md,
  },
  infoIcon: {
    marginTop: 1,
  },
  infoText: {
    color: 'rgba(255, 255, 255, 0.9)',
    flex: 1,
    lineHeight: 16,
  },

  dualActionRow: {
    position: 'relative',
    zIndex: 10,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  addMoneyBtn: {
    flex: 1,
    height: 48,
    borderRadius: rounded.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  addMoneyBtnText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  useBalanceBtn: {
    flex: 1,
    height: 48,
    borderRadius: rounded.lg,
    backgroundColor: colors.secondaryContainer,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: colors.secondaryContainer,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  useBalanceBtnText: {
    color: '#ffffff',
    fontWeight: '600',
  },

  /* 2. Breakdown Grid */
  breakdownGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  breakdownCard: {
    flex: 1,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: rounded.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 90,
    justifyContent: 'space-between',
  },
  breakdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  breakdownTitle: {
    color: colors.onSurfaceVariant,
  },
  breakdownIconWrapperPrimary: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  breakdownIconWrapperSecondary: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.secondaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  breakdownSub: {
    color: colors.onSurfaceVariant,
    fontSize: 10,
    marginBottom: 2,
  },
  breakdownValue: {
    color: colors.onSurface,
    fontWeight: '700',
  },

  /* Promo Banner Strip */
  promoBanner: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: rounded.xl,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  promoIconContainer: {
    width: 44,
    height: 44,
    borderRadius: rounded.lg,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  promoContent: {
    flex: 1,
  },
  promoTitle: {
    color: colors.onSurface,
    fontWeight: '700',
  },
  promoSubtitle: {
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  shareButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.surfaceContainerHighest,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* 3. Transaction History Section */
  historySection: {
    marginBottom: spacing.md,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  historyTitle: {
    color: colors.onSurface,
    fontWeight: '700',
  },
  filterPillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surfaceContainerLowest,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: rounded.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterPillText: {
    color: colors.onSurfaceVariant,
    fontSize: 11,
  },

  transactionList: {
    gap: spacing.xs,
  },
  emptyStateContainer: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: rounded.xl,
  },
  emptyStateText: {
    color: colors.onSurfaceVariant,
    marginTop: 8,
  },
  txCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: rounded.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  txLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.sm,
    marginRight: spacing.sm,
  },
  txIconBox: {
    width: 40,
    height: 40,
    borderRadius: rounded.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txDetails: {
    flex: 1,
  },
  txTitleText: {
    color: colors.onSurface,
    fontWeight: '600',
    fontSize: 13,
  },
  txMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 3,
  },
  txTimestamp: {
    color: colors.onSurfaceVariant,
    fontSize: 11,
  },
  txMetaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.outlineVariant,
  },
  txStatusBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
  },
  statusSettled: {
    backgroundColor: colors.surfaceContainerHigh,
  },
  statusCompleted: {
    backgroundColor: colors.surfaceContainer,
  },
  statusSettledText: {
    color: colors.tertiaryContainer,
    fontSize: 9,
    fontWeight: '700',
  },
  statusCompletedText: {
    color: colors.onSurfaceVariant,
    fontSize: 9,
    fontWeight: '600',
  },
  txRight: {
    alignItems: 'flex-end',
  },
  creditAmount: {
    color: colors.tertiaryContainer,
    fontWeight: '700',
    fontSize: 14,
  },
  debitAmount: {
    color: colors.error,
    fontWeight: '700',
    fontSize: 14,
  },
  txTagText: {
    color: colors.onSurfaceVariant,
    fontSize: 10,
    marginTop: 2,
  },

  /* Trust Footnote */
  trustFootnote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: spacing.md,
  },
  trustFootnoteText: {
    color: colors.onSurfaceVariant,
    fontSize: 11,
  },

  /* Modals */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(33, 49, 69, 0.4)',
    justifyContent: 'flex-end',
  },
  filterModalCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderTopLeftRadius: rounded.xxl,
    borderTopRightRadius: rounded.xxl,
    padding: spacing.lg,
  },
  filterModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  filterModalTitle: {
    color: colors.onSurface,
    fontWeight: '700',
  },
  closeModalBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterOptionsList: {
    gap: 8,
  },
  filterOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    borderRadius: rounded.lg,
  },
  filterOptionItemSelected: {
    backgroundColor: colors.surfaceContainerHigh,
  },
  filterOptionText: {
    color: colors.onSurface,
  },
  filterOptionTextSelected: {
    color: colors.primaryContainer,
    fontWeight: '700',
  },

  /* Add Money Modal */
  addMoneyModalCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderTopLeftRadius: rounded.xxl,
    borderTopRightRadius: rounded.xxl,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  addMoneyHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  addMoneyTitle: {
    color: colors.onSurface,
    fontWeight: '700',
  },
  addMoneySubtitle: {
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  inputSectionLabel: {
    color: colors.onSurfaceVariant,
    fontSize: 11,
    letterSpacing: 0.5,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  presetsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  presetChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: rounded.lg,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  presetChipSelected: {
    backgroundColor: colors.primaryFixed,
    borderColor: colors.primaryContainer,
  },
  presetChipText: {
    color: colors.onSurface,
    fontWeight: '600',
    fontSize: 13,
  },
  presetChipTextSelected: {
    color: colors.primaryContainer,
    fontWeight: '700',
    fontSize: 13,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: rounded.lg,
    borderWidth: 1.5,
    borderColor: colors.primaryContainer,
    paddingHorizontal: spacing.md,
    height: 52,
    marginBottom: spacing.md,
  },
  currencySymbol: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.primaryContainer,
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: colors.onSurface,
  },

  methodsContainer: {
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: rounded.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceContainerLowest,
  },
  methodCardSelectedBkash: {
    borderColor: '#d12053',
    backgroundColor: 'rgba(209, 32, 83, 0.04)',
  },
  methodCardSelectedNagad: {
    borderColor: '#f7931e',
    backgroundColor: 'rgba(247, 147, 30, 0.04)',
  },
  methodInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  methodLogoBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: rounded.sm,
  },
  methodLogoText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 11,
  },
  methodName: {
    color: colors.onSurface,
    fontWeight: '600',
  },
  methodSub: {
    color: colors.onSurfaceVariant,
    fontSize: 11,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelectedBkash: {
    borderColor: '#d12053',
  },
  radioCircleSelectedNagad: {
    borderColor: '#f7931e',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.onSurface,
  },

  confirmAddBtn: {
    backgroundColor: colors.primaryContainer,
    borderRadius: rounded.xl,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: colors.primaryContainer,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmAddBtnText: {
    color: '#ffffff',
    fontWeight: '700',
  },
});
