import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { rounded, spacing } from '../../theme/spacing';
import { Button } from '../../components/Button';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { Ionicons } from '@expo/vector-icons';

type SuccessRouteProp = RouteProp<RootStackParamList, 'PaymentSuccess'>;
type SuccessNavProp = StackNavigationProp<RootStackParamList, 'PaymentSuccess'>;

interface Props {
  route: SuccessRouteProp;
  navigation: SuccessNavProp;
}

export const PaymentSuccessScreen: React.FC<Props> = ({ route, navigation }) => {
  const { order } = route.params;

  const handleDownloadInvoice = () => {
    Alert.alert(
      'Invoice Ready',
      `Invoice for Order #${order.order_number} is being generated and downloaded as PDF.`,
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Success Icon Badge */}
        <View style={styles.iconCircle}>
          <Ionicons name="checkmark-circle" size={68} color={colors.tertiaryContainer} />
        </View>

        <Text style={[typography.headlineMd, styles.title]}>Payment Successful!</Text>
        <Text style={[typography.bodyMd, styles.subtitle]}>
          Your telecom bundle has been recharged and is now active on your mobile SIM.
        </Text>

        {/* Cashback Banner */}
        {order.cashback_amount && order.cashback_amount > 0 ? (
          <View style={styles.cashbackCard}>
            <Ionicons name="gift" size={24} color={colors.tertiaryContainer} />
            <View style={styles.cashbackInfo}>
              <Text style={[typography.titleMd, styles.cashbackTitle]}>
                ৳{order.cashback_amount} Cashback Added!
              </Text>
              <Text style={[typography.bodySm, styles.cashbackSub]}>
                Credited directly to your Mobixa wallet balance.
              </Text>
            </View>
          </View>
        ) : null}

        {/* Receipt Card */}
        <View style={styles.receiptCard}>
          <View style={styles.receiptRow}>
            <Text style={[typography.bodyMd, styles.receiptLabel]}>Order Number</Text>
            <Text style={[typography.labelMd, styles.receiptVal]}>{order.order_number}</Text>
          </View>

          <View style={styles.receiptRow}>
            <Text style={[typography.bodyMd, styles.receiptLabel]}>Recharged SIM</Text>
            <Text style={[typography.labelMd, styles.receiptVal]}>{order.phone_number}</Text>
          </View>

          <View style={styles.receiptRow}>
            <Text style={[typography.bodyMd, styles.receiptLabel]}>Operator</Text>
            <Text style={[typography.labelMd, styles.receiptVal]}>
              {order.operator_code.toUpperCase()}
            </Text>
          </View>

          <View style={styles.receiptRow}>
            <Text style={[typography.bodyMd, styles.receiptLabel]}>Payment Method</Text>
            <Text style={[typography.labelMd, styles.receiptVal]}>
              {order.payment_method.toUpperCase()}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.receiptRow}>
            <Text style={[typography.titleMd, styles.totalLabel]}>Total Paid</Text>
            <Text style={[typography.headlineSm, styles.totalVal]}>
              ৳{order.total_paid}
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title="Download Invoice (PDF)"
            onPress={handleDownloadInvoice}
            variant="outline"
            size="lg"
            icon={<Ionicons name="download-outline" size={18} color={colors.primaryContainer} />}
            style={styles.invoiceBtn}
          />

          <Button
            title="Back to Home"
            onPress={() => navigation.replace('MainTabs')}
            variant="primary"
            size="lg"
            style={styles.homeBtn}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  scrollContent: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxxl,
    alignItems: 'center',
  },
  iconCircle: {
    marginBottom: spacing.md,
  },
  title: {
    color: colors.onSurface,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  cashbackCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    borderRadius: rounded.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    width: '100%',
    gap: spacing.sm,
  },
  cashbackInfo: {
    flex: 1,
  },
  cashbackTitle: {
    color: colors.tertiaryContainer,
  },
  cashbackSub: {
    color: colors.tertiaryContainer,
  },
  receiptCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: rounded.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    width: '100%',
    marginBottom: spacing.xl,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  receiptLabel: {
    color: colors.onSurfaceVariant,
  },
  receiptVal: {
    color: colors.onSurface,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  totalLabel: {
    color: colors.onSurface,
  },
  totalVal: {
    color: colors.primaryContainer,
  },
  actions: {
    width: '100%',
    gap: spacing.sm,
  },
  invoiceBtn: {
    width: '100%',
  },
  homeBtn: {
    width: '100%',
  },
});
