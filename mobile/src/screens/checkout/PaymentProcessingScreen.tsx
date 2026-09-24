import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';
import { useOrder } from '../../context/OrderContext';

type ProcRouteProp = RouteProp<RootStackParamList, 'PaymentProcessing'>;
type ProcNavProp = StackNavigationProp<RootStackParamList, 'PaymentProcessing'>;

interface Props {
  route: ProcRouteProp;
  navigation: ProcNavProp;
}

export const PaymentProcessingScreen: React.FC<Props> = ({ route, navigation }) => {
  const { orderId, paymentMethod, order } = route.params;
  const { recipientNumber } = useOrder();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('PaymentFailed', {
        orderId,
        paymentMethod: paymentMethod || 'bkash',
        offer: order?.offer,
        recipientNumber: order?.phone_number || recipientNumber,
        reason: 'সিস্টেম আপডেটের কাজ চলছে, এখন পেমেন্টটি প্রসেস হয়নি। অনুগ্রহ করে অন্য মেথড ব্যবহার করুন।',
      });
    }, 1600);

    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <ActivityIndicator size="large" color={colors.primaryContainer} style={styles.spinner} />
        <Text style={[typography.headlineSm, styles.title]}>Processing Recharge...</Text>
        <Text style={[typography.bodyMd, styles.subtitle]}>
          Connecting with telecom operator gateway for {recipientNumber || 'your number'}. Please do not close or exit the app.
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9ff',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
  },
  spinner: {
    marginBottom: spacing.xl,
    transform: [{ scale: 1.5 }],
  },
  title: {
    color: colors.primaryContainer,
    marginBottom: spacing.sm,
    textAlign: 'center',
    fontWeight: '700',
  },
  subtitle: {
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 22,
  },
});
