import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from './types';
import { HomeScreen } from '../screens/main/HomeScreen';
import { OffersByOperatorScreen } from '../screens/main/OffersByOperatorScreen';
import { DriveOffersScreen } from '../screens/main/DriveOffersScreen';
import { WalletScreen } from '../screens/main/WalletScreen';
import { ProfileScreen } from '../screens/main/ProfileScreen';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primaryContainer,
        tabBarInactiveTintColor: colors.outline,
        tabBarStyle: {
          backgroundColor: colors.surfaceContainerLowest,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          ...typography.labelSm,
          fontWeight: '700',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (route.name === 'HomeTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'OffersTab') {
            iconName = focused ? 'cellular' : 'cellular-outline';
          } else if (route.name === 'DriveOffersTab') {
            iconName = focused ? 'flash' : 'flash-outline';
          } else if (route.name === 'WalletTab') {
            iconName = focused ? 'wallet' : 'wallet-outline';
          } else if (route.name === 'ProfileTab') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name="OffersTab"
        component={OffersByOperatorScreen}
        options={{ tabBarLabel: 'Offers' }}
      />
      <Tab.Screen
        name="DriveOffersTab"
        component={DriveOffersScreen}
        options={{
          tabBarLabel: 'Drive Packs',
          tabBarBadge: 'HOT',
          tabBarBadgeStyle: {
            backgroundColor: colors.secondaryContainer,
            color: '#ffffff',
            fontSize: 9,
            fontWeight: '800',
          },
        }}
      />
      <Tab.Screen
        name="WalletTab"
        component={WalletScreen}
        options={{ tabBarLabel: 'Wallet' }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
};
