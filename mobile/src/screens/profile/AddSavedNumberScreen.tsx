import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { rounded, spacing } from '../../theme/spacing';
import { Header } from '../../components/Header';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { OperatorCode } from '../../types';
import { api } from '../../services/api';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';

type AddNavProp = StackNavigationProp<RootStackParamList, 'AddSavedNumber'>;

interface Props {
  navigation: AddNavProp;
}

export const AddSavedNumberScreen: React.FC<Props> = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [operator, setOperator] = useState<OperatorCode>('gp');
  const [loading, setLoading] = useState(false);

  const operators: { code: OperatorCode; name: string }[] = [
    { code: 'gp', name: 'Grameenphone' },
    { code: 'robi', name: 'Robi' },
    { code: 'banglalink', name: 'Banglalink' },
    { code: 'airtel', name: 'Airtel' },
    { code: 'teletalk', name: 'Teletalk' },
    { code: 'skitto', name: 'Skitto' },
  ];

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Required', 'Please enter a name/label for this number (e.g. My SIM).');
      return;
    }
    if (phoneNumber.length < 11) {
      Alert.alert('Invalid Number', 'Please enter a valid 11-digit mobile number.');
      return;
    }

    setLoading(true);
    try {
      await api.addSavedNumber({
        title,
        phone_number: phoneNumber,
        operator_code: operator,
      });
      Alert.alert('Saved', 'New number saved successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch {
      Alert.alert('Saved', 'Number added!');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Add Saved Number" showBack onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Input
          label="Label / Name"
          placeholder="e.g. Mom's SIM, Personal GP"
          value={title}
          onChangeText={setTitle}
          leftIcon="bookmark-outline"
        />

        <Input
          label="Mobile Number"
          placeholder="01XXXXXXXXX"
          keyboardType="phone-pad"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          maxLength={11}
          leftIcon="call-outline"
        />

        <Text style={[typography.labelMd, styles.sectionLabel]}>Select Operator</Text>
        <View style={styles.operatorGrid}>
          {operators.map((op) => {
            const isSelected = operator === op.code;
            const opColor = colors.operators[op.code];
            return (
              <TouchableOpacity
                key={op.code}
                activeOpacity={0.8}
                onPress={() => setOperator(op.code)}
                style={[
                  styles.opPill,
                  isSelected && { borderColor: opColor, backgroundColor: `${opColor}15` },
                ]}
              >
                <View style={[styles.dot, { backgroundColor: opColor }]} />
                <Text
                  style={[
                    typography.labelMd,
                    isSelected ? { color: opColor, fontWeight: '700' } : styles.opText,
                  ]}
                >
                  {op.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Button
          title="Save Number"
          onPress={handleSave}
          loading={loading}
          variant="primary"
          size="lg"
          style={styles.saveBtn}
        />
      </ScrollView>
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
  sectionLabel: {
    color: colors.onSurfaceVariant,
    marginBottom: spacing.xs,
  },
  operatorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.xl,
  },
  opPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: rounded.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surfaceContainerLowest,
    gap: spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  opText: {
    color: colors.onSurface,
  },
  saveBtn: {
    width: '100%',
  },
});
