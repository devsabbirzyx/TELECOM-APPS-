import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  showNotification?: boolean;
  hasUnreadNotifications?: boolean;
  onNotificationPress?: () => void;
  showProfile?: boolean;
  onProfilePress?: () => void;
  rightAction?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  title = 'Mobixa',
  showBack = false,
  onBack,
  showNotification = false,
  hasUnreadNotifications = false,
  onNotificationPress,
  showProfile = false,
  onProfilePress,
  rightAction,
}) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 12) }]}>
      <View style={styles.content}>
        <View style={styles.left}>
          {showBack ? (
            <View style={styles.backRow}>
              <TouchableOpacity
                onPress={onBack}
                style={styles.backIconButton}
                activeOpacity={0.7}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Ionicons name="arrow-back" size={22} color={colors.primaryContainer} />
              </TouchableOpacity>
              {title ? (
                <Text style={[typography.titleLg, styles.headerTitleText]}>{title}</Text>
              ) : null}
            </View>
          ) : (
            <View style={styles.brandContainer}>
              <View style={styles.brandBadge}>
                <Ionicons name="flash" size={16} color="#ffffff" />
              </View>
              <Text style={[typography.headlineSm, styles.brandTitle]}>{title}</Text>
            </View>
          )}
        </View>

        <View style={styles.right}>
          {rightAction}
          {showNotification && (
            <TouchableOpacity
              onPress={onNotificationPress}
              style={styles.iconButton}
              activeOpacity={0.7}
            >
              <Ionicons name="notifications-outline" size={22} color={colors.onSurface} />
              {hasUnreadNotifications && <View style={styles.notificationDot} />}
            </TouchableOpacity>
          )}
          {showProfile && (
            <TouchableOpacity
              onPress={onProfilePress}
              style={styles.avatarButton}
              activeOpacity={0.8}
            >
              {user?.avatar_url ? (
                <Image
                  source={{ uri: user.avatar_url }}
                  style={styles.avatar}
                />
              ) : (
                <LinearGradient
                  colors={['#1e3a8a', '#2563eb']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[styles.avatar, styles.initialsAvatar]}
                >
                  <Text style={styles.initialsText}>
                    {user?.full_name ? user.full_name.trim().charAt(0).toUpperCase() : 'M'}
                  </Text>
                </LinearGradient>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    zIndex: 100,
  },
  content: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.gutter,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backIconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#eff4ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleText: {
    color: '#0b1c30',
    fontWeight: '700',
    fontSize: 18,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  brandTitle: {
    color: colors.primaryContainer,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.secondaryContainer,
    borderWidth: 1.5,
    borderColor: colors.surface,
  },
  avatarButton: {
    marginLeft: spacing.xs,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    borderColor: colors.primaryContainer,
  },
  initialsAvatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
});
