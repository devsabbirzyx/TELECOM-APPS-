import React, { useState, useEffect } from 'react';
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
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { api, MOCK_SAVED_NUMBERS } from '../../services/api';
import { SavedNumber } from '../../types';
import { useOrder } from '../../context/OrderContext';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';

import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabase';

type SavedNavProp = StackNavigationProp<RootStackParamList, 'SavedNumbers'>;

interface Props {
  navigation: SavedNavProp;
}

export const SavedNumbersScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const [numbers, setNumbers] = useState<SavedNumber[]>([]);
  const { setRecipientNumber, setOperatorCode } = useOrder();

  useEffect(() => {
    loadNumbers();
  }, [user?.id]);

  const loadNumbers = async () => {
    try {
      if (user?.id) {
        const { data, error } = await supabase
          .from('saved_numbers')
          .select('*, operators(*)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (!error && data) {
          setNumbers(
            data.map((item: any) => ({
              id: item.id,
              user_id: item.user_id,
              title: item.label || item.title || 'Saved SIM',
              phone_number: item.phone_number,
              operator_code: item.operator_id || 'gp',
            }))
          );
          return;
        }
      }

      const res = await api.getSavedNumbers();
      setNumbers(Array.isArray(res) ? res : []);
    } catch {
      setNumbers([]);
    }
  };

  const handleSelect = (item: SavedNumber) => {
    setRecipientNumber(item.phone_number);
    setOperatorCode(item.operator_code);
    Alert.alert(
      'Selected Number',
      `${item.title} (${item.phone_number}) is set as recipient.`,
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  };

  const handleDelete = (id: string, title: string) => {
    Alert.alert(
      'Delete Number',
      `Are you sure you want to remove "${title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setNumbers((prev) => prev.filter((n) => n.id !== id));
            try {
              await api.deleteSavedNumber(id);
            } catch {}
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title="Saved Numbers"
        showBack
        onBack={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity
            onPress={() => navigation.navigate('AddSavedNumber')}
            style={styles.addIconBtn}
          >
            <Ionicons name="add" size={24} color={colors.primaryContainer} />
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {numbers.length === 0 ? (
          <EmptyState
            icon="call-outline"
            title="No Saved Numbers"
            description="Save frequently recharged family and friend numbers for fast 1-tap checkout."
            actionTitle="Add New Number"
            onAction={() => navigation.navigate('AddSavedNumber')}
          />
        ) : (
          numbers.map((item) => {
            const opColor = colors.operators[item.operator_code] || colors.primaryContainer;
            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.8}
                onPress={() => handleSelect(item)}
                style={styles.numberCard}
              >
                <View style={[styles.operatorBadge, { backgroundColor: `${opColor}20` }]}>
                  <View style={[styles.dot, { backgroundColor: opColor }]} />
                  <Text style={[typography.labelSm, { color: opColor, fontWeight: '800' }]}>
                    {item.operator_code.toUpperCase()}
                  </Text>
                </View>

                <View style={styles.info}>
                  <Text style={[typography.titleMd, styles.title]}>{item.title}</Text>
                  <Text style={[typography.bodyMd, styles.phone]}>{item.phone_number}</Text>
                </View>

                <TouchableOpacity
                  onPress={() => handleDelete(item.id, item.title)}
                  style={styles.deleteBtn}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="trash-outline" size={18} color={colors.error} />
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })
        )}

        <Button
          title="Add Another Number"
          onPress={() => navigation.navigate('AddSavedNumber')}
          variant="outline"
          size="lg"
          icon={<Ionicons name="add-circle-outline" size={20} color={colors.primaryContainer} />}
          style={styles.addBtn}
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
    paddingTop: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  addIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: rounded.xl,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  operatorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: rounded.sm,
    gap: 4,
    marginRight: spacing.md,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  info: {
    flex: 1,
  },
  title: {
    color: colors.onSurface,
  },
  phone: {
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  deleteBtn: {
    padding: spacing.xs,
  },
  addBtn: {
    marginTop: spacing.md,
    width: '100%',
  },
});
