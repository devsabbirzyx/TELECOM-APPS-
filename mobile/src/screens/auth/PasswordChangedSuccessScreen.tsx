import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { rounded, spacing } from '../../theme/spacing';
import { Button } from '../../components/Button';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';

type NavProp = StackNavigationProp<RootStackParamList, 'PasswordChangedSuccess'>;

interface Props {
  navigation: NavProp;
}

export const PasswordChangedSuccessScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Ionicons name="checkmark-circle" size={72} color={colors.tertiaryContainer} />
        </View>

        <Text style={[typography.headlineMd, styles.title]}>
          Password Updated!
        </Text>
        <Text style={[typography.bodyLg, styles.subtitle]}>
          Your password has been changed successfully. You can now use your new credentials to log in.
        </Text>

        <Button
          title="Back to Home"
          onPress={() => navigation.replace('MainTabs')}
          variant="primary"
          size="lg"
          style={styles.btn}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.gutter,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    marginBottom: spacing.lg,
  },
  title: {
    color: colors.onSurface,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: spacing.xxl,
    paddingHorizontal: spacing.md,
  },
  btn: {
    width: '100%',
  },
});
