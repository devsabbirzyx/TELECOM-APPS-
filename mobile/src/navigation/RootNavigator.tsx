import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from './types';
import { TabNavigator } from './TabNavigator';
import { useAuth } from '../context/AuthContext';

// Auth Screens
import { OnboardingScreen } from '../screens/auth/OnboardingScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { SignUpScreen } from '../screens/auth/SignUpScreen';
import { OtpVerificationScreen } from '../screens/auth/OtpVerificationScreen';
import { ChangePasswordScreen } from '../screens/auth/ChangePasswordScreen';
import { PasswordChangedSuccessScreen } from '../screens/auth/PasswordChangedSuccessScreen';

// Offer & Checkout Screens
import { OfferDetailsScreen } from '../screens/checkout/OfferDetailsScreen';
import { CheckoutScreen } from '../screens/checkout/CheckoutScreen';
import { PaymentProcessingScreen } from '../screens/checkout/PaymentProcessingScreen';
import { BkashGatewayScreen } from '../screens/checkout/BkashGatewayScreen';
import { NagadGatewayScreen } from '../screens/checkout/NagadGatewayScreen';
import { PaymentSuccessScreen } from '../screens/checkout/PaymentSuccessScreen';
import { PaymentFailedScreen } from '../screens/checkout/PaymentFailedScreen';

// Secondary Screens
import { EditProfileScreen } from '../screens/profile/EditProfileScreen';
import { SavedNumbersScreen } from '../screens/profile/SavedNumbersScreen';
import { AddSavedNumberScreen } from '../screens/profile/AddSavedNumberScreen';
import { ReferEarnScreen } from '../screens/profile/ReferEarnScreen';
import { HelpSupportScreen } from '../screens/support/HelpSupportScreen';
import { LiveChatScreen } from '../screens/support/LiveChatScreen';
import { NotificationsScreen } from '../screens/notifications/NotificationsScreen';

const Stack = createStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1e3a8a" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      initialRouteName={isAuthenticated ? 'MainTabs' : 'Login'}
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#f8f9ff' },
      }}
    >
      {/* Main Tab Navigator (Default when logged in) */}
      <Stack.Screen name="MainTabs" component={TabNavigator} />

      {/* Auth Flow */}
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <Stack.Screen name="PasswordChangedSuccess" component={PasswordChangedSuccessScreen} />

      {/* Offer & Checkout Flows */}
      <Stack.Screen name="OfferDetails" component={OfferDetailsScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="PaymentProcessing" component={PaymentProcessingScreen} />
      <Stack.Screen name="BkashGateway" component={BkashGatewayScreen} />
      <Stack.Screen name="NagadGateway" component={NagadGatewayScreen} />
      <Stack.Screen name="PaymentSuccess" component={PaymentSuccessScreen} />
      <Stack.Screen name="PaymentFailed" component={PaymentFailedScreen} />

      {/* User Profile & Features */}
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="SavedNumbers" component={SavedNumbersScreen} />
      <Stack.Screen name="AddSavedNumber" component={AddSavedNumberScreen} />
      <Stack.Screen name="ReferEarn" component={ReferEarnScreen} />
      <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
      <Stack.Screen name="LiveChat" component={LiveChatScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#f8f9ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
