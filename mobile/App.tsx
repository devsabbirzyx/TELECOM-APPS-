import React from 'react';
import { View, StyleSheet, Platform, Text, Alert as RNAlert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/context/AuthContext';
import { OrderProvider } from './src/context/OrderContext';
import { RootNavigator } from './src/navigation/RootNavigator';

import { ToastProvider, showGlobalToast } from './src/components/StackedNotificationToast';

// Replace default browser alerts with 3D Stacked Notification Toast
RNAlert.alert = (title: string, message?: string, buttons?: any) => {
  let actionText: string | undefined = undefined;
  let onAction: (() => void) | undefined = undefined;

  const titleLower = (title || '').toLowerCase();
  const msgLower = (message || '').toLowerCase();

  const isError =
    titleLower.includes('error') ||
    titleLower.includes('ব্যর্থ') ||
    titleLower.includes('ভুল') ||
    msgLower.includes('ভুল') ||
    msgLower.includes('পাওয়া যায়নি') ||
    msgLower.includes('ত্রুটি');

  const isSuccess =
    titleLower.includes('অভিনন্দন') ||
    titleLower.includes('success') ||
    titleLower.includes('সফল');

  if (buttons && buttons.length > 0) {
    const primaryBtn = buttons.find((b: any) => b.style !== 'cancel' && b.onPress) || buttons[0];
    if (primaryBtn && primaryBtn.text && primaryBtn.text !== 'OK' && primaryBtn.text !== 'ঠিক আছে') {
      actionText = primaryBtn.text;
      onAction = primaryBtn.onPress;
    }
  }

  showGlobalToast({
    type: isSuccess ? 'success' : isError ? 'error' : 'info',
    title: title || 'Mobixa Notification',
    message: message || '',
    actionText,
    onAction,
  });
};

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorMessage}>
            {this.state.error?.message || String(this.state.error)}
          </Text>
        </View>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <SafeAreaProvider
      initialMetrics={initialWindowMetrics}
      style={styles.safeArea}
    >
      <ErrorBoundary>
        <ToastProvider>
          <AuthProvider>
            <OrderProvider>
              <View style={styles.container}>
                <NavigationContainer>
                  <StatusBar style="dark" backgroundColor="#f8f9ff" />
                  <RootNavigator />
                </NavigationContainer>
              </View>
            </OrderProvider>
          </AuthProvider>
        </ToastProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#f8f9ff',
  },
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#f8f9ff',
    ...(Platform.OS === 'web' ? ({ minHeight: '100vh' } as any) : {}),
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f8f9ff',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ba1a1a',
    marginBottom: 12,
  },
  errorMessage: {
    fontSize: 14,
    color: '#333333',
    textAlign: 'center',
  },
});

