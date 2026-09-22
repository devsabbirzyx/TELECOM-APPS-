import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { rounded, spacing } from '../../theme/spacing';
import { Header } from '../../components/Header';
import { EmptyState } from '../../components/EmptyState';
import { MOCK_NOTIFICATIONS } from '../../services/api';
import { AppNotification } from '../../types';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';

type NotifNavProp = StackNavigationProp<RootStackParamList, 'Notifications'>;

interface Props {
  navigation: NotifNavProp;
}

export const NotificationsScreen: React.FC<Props> = ({ navigation }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>(MOCK_NOTIFICATIONS);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const getIcon = (type?: string) => {
    switch (type) {
      case 'offer':
        return { icon: 'flame-outline', color: colors.secondaryContainer };
      case 'wallet':
        return { icon: 'gift-outline', color: colors.tertiaryContainer };
      case 'order':
        return { icon: 'checkmark-circle-outline', color: colors.primaryContainer };
      default:
        return { icon: 'notifications-outline', color: colors.primaryContainer };
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Notifications"
        showBack
        onBack={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity onPress={markAllRead} style={styles.markReadBtn}>
            <Text style={[typography.labelSm, styles.markReadText]}>Mark all read</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {notifications.length === 0 ? (
          <EmptyState
            icon="notifications-off-outline"
            title="No Notifications"
            description="You are all caught up! New offers and cashback alerts will show up here."
          />
        ) : (
          notifications.map((item) => {
            const { icon, color } = getIcon(item.type);
            return (
              <View
                key={item.id}
                style={[
                  styles.notifCard,
                  !item.is_read ? styles.unreadCard : undefined,
                ]}
              >
                <View style={[styles.iconBox, { backgroundColor: `${color}15` }]}>
                  <Ionicons name={icon as any} size={22} color={color} />
                </View>

                <View style={styles.info}>
                  <View style={styles.titleRow}>
                    <Text style={[typography.titleMd, styles.title]}>{item.title}</Text>
                    {!item.is_read && <View style={styles.unreadDot} />}
                  </View>
                  <Text style={[typography.bodyMd, styles.body]}>{item.body}</Text>
                  <Text style={[typography.labelSm, styles.date]}>
                    {new Date(item.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
              </View>
            );
          })
        )}
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
  markReadBtn: {
    padding: spacing.xs,
  },
  markReadText: {
    color: colors.primaryContainer,
    fontWeight: '700',
  },
  notifCard: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: rounded.xl,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  unreadCard: {
    borderColor: colors.primaryContainer,
    backgroundColor: '#eff4ff',
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  info: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  title: {
    color: colors.onSurface,
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.secondaryContainer,
    marginLeft: spacing.xs,
  },
  body: {
    color: colors.onSurfaceVariant,
    lineHeight: 18,
    marginBottom: spacing.xs,
  },
  date: {
    color: colors.outline,
  },
});
