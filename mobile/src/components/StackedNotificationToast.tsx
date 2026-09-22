import React, { createContext, useContext, useState, useRef, ReactNode, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Platform,
  Dimensions,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export type ToastType = 'error' | 'success' | 'warning' | 'info';

export interface ToastOptions {
  type?: ToastType;
  title: string;
  message: string;
  timeAgo?: string;
  actionText?: string;
  onAction?: () => void;
  duration?: number; // 0 for persistent until dismissed
}

interface ToastContextType {
  showToast: (options: ToastOptions) => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Global reference so we can call showGlobalToast from anywhere including RNAlert polyfill
let globalShowToast: ((options: ToastOptions) => void) | null = null;

export const showGlobalToast = (options: ToastOptions) => {
  if (globalShowToast) {
    globalShowToast(options);
  } else {
    console.warn('[Toast] Provider not yet mounted', options);
  }
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [currentToast, setCurrentToast] = useState<ToastOptions | null>(null);

  const translateY = useRef(new Animated.Value(-120)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.92)).current;
  const timerRef = useRef<any>(null);

  const hideToast = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -120,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 0.9,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisible(false);
      setCurrentToast(null);
    });
  };

  const showToast = (options: ToastOptions) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setCurrentToast(options);
    setVisible(true);

    translateY.setValue(-100);
    opacity.setValue(0);
    scale.setValue(0.92);

    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        tension: 65,
        friction: 9,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        tension: 70,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto dismiss after duration if > 0 (defaults to 6 seconds for errors so user has time to read/click CTA)
    const autoDuration = options.duration !== undefined ? options.duration : options.actionText ? 8000 : 5000;
    if (autoDuration > 0) {
      timerRef.current = setTimeout(() => {
        hideToast();
      }, autoDuration);
    }
  };

  useEffect(() => {
    globalShowToast = showToast;
    return () => {
      globalShowToast = null;
    };
  }, []);

  const getIconAndColors = (type: ToastType = 'error') => {
    switch (type) {
      case 'success':
        return {
          icon: 'checkmark' as const,
          gradient: ['#10b981', '#059669'],
          borderColor: 'rgba(16, 185, 129, 0.2)',
          accentColor: '#10b981',
        };
      case 'warning':
        return {
          icon: 'alert' as const,
          gradient: ['#f59e0b', '#d97706'],
          borderColor: 'rgba(245, 158, 11, 0.2)',
          accentColor: '#f59e0b',
        };
      case 'info':
        return {
          icon: 'information' as const,
          gradient: ['#3b82f6', '#1d4ed8'],
          borderColor: 'rgba(59, 130, 246, 0.2)',
          accentColor: '#3b82f6',
        };
      case 'error':
      default:
        return {
          icon: 'alert-circle' as const,
          gradient: ['#ef4444', '#dc2626'],
          borderColor: 'rgba(239, 68, 68, 0.2)',
          accentColor: '#ef4444',
        };
    }
  };

  const styleConfig = currentToast ? getIconAndColors(currentToast.type) : getIconAndColors('error');

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}

      {visible && currentToast && (
        <View style={styles.toastOverlay} pointerEvents="box-none">
          {/* Dim backdrop to focus attention */}
          <TouchableOpacity
            style={styles.backdrop}
            activeOpacity={1}
            onPress={hideToast}
          />

          {/* Animated Container with 3-Layer Stacked Notification Design */}
          <Animated.View
            style={[
              styles.animatedContainer,
              {
                opacity,
                transform: [{ translateY }, { scale }],
              },
            ]}
          >
            {/* STACK LAYER 3 (Bottommost deepest card) */}
            <View style={[styles.stackLayer, styles.layer3]} />

            {/* STACK LAYER 2 (Middle stacked card) */}
            <View style={[styles.stackLayer, styles.layer2]} />

            {/* STACK LAYER 1 (Immediate undercard) */}
            <View style={[styles.stackLayer, styles.layer1]} />

            {/* MAIN NOTIFICATION CARD (Front) */}
            <View style={[styles.mainCard, { borderColor: styleConfig.borderColor }]}>
              {/* Top Row: App Brand Icon, App Name & Time Tag */}
              <View style={styles.cardHeaderRow}>
                <View style={styles.leftBrand}>
                  <LinearGradient
                    colors={styleConfig.gradient as [string, string]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.appIconBox}
                  >
                    <Ionicons name={styleConfig.icon} size={18} color="#ffffff" />
                  </LinearGradient>

                  <View style={styles.brandTitleCol}>
                    <Text style={styles.appNameText}>Mobixa</Text>
                    <Text style={styles.categorySubtext}>System Notification</Text>
                  </View>
                </View>

                <View style={styles.rightMeta}>
                  <Text style={styles.timeAgoText}>{currentToast.timeAgo || 'এখন'}</Text>
                  <TouchableOpacity
                    onPress={hideToast}
                    style={styles.closeBtn}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons name="close" size={16} color="#94a3b8" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Message Content Section */}
              <View style={styles.cardBody}>
                <Text style={styles.headlineText}>{currentToast.title}</Text>
                <Text style={styles.messageText}>{currentToast.message}</Text>
              </View>

              {/* Optional CTA Button (e.g. Sign Up link) */}
              {currentToast.actionText && (
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={styles.actionBtn}
                    activeOpacity={0.85}
                    onPress={() => {
                      hideToast();
                      currentToast.onAction?.();
                    }}
                  >
                    <LinearGradient
                      colors={['#1e3a8a', '#2563eb']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.actionGradient}
                    >
                      <Ionicons name="person-add-outline" size={16} color="#ffffff" style={{ marginRight: 6 }} />
                      <Text style={styles.actionBtnText}>{currentToast.actionText}</Text>
                      <Ionicons name="arrow-forward" size={14} color="#ffffff" style={{ marginLeft: 6 }} />
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </Animated.View>
        </View>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const { width } = Dimensions.get('window');
const CARD_WIDTH = Math.min(width - 32, 410);

const styles = StyleSheet.create({
  toastOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 99999,
    elevation: 99999,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: Platform.OS === 'ios' ? 56 : 40,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  animatedContainer: {
    width: CARD_WIDTH,
    alignItems: 'center',
    position: 'relative',
    marginTop: 8,
  },

  /* Layer 1 (Immediate undercard) */
  layer1: {
    width: CARD_WIDTH - 24,
    height: '100%',
    top: 9,
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    borderRadius: 26,
    zIndex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },

  /* Layer 2 (Second undercard) */
  layer2: {
    width: CARD_WIDTH - 48,
    height: '100%',
    top: 17,
    backgroundColor: 'rgba(241, 245, 249, 0.82)',
    borderRadius: 24,
    zIndex: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
  },

  /* Layer 3 (Deepest bottom shadow card) */
  layer3: {
    width: CARD_WIDTH - 72,
    height: '100%',
    top: 25,
    backgroundColor: 'rgba(226, 232, 240, 0.65)',
    borderRadius: 22,
    zIndex: -1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
  },

  stackLayer: {
    position: 'absolute',
    alignSelf: 'center',
  },

  /* Main Top Card */
  mainCard: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 28,
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderWidth: 1.5,
    zIndex: 10,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 16,
  },

  /* Header Row */
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  leftBrand: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  brandTitleCol: {
    justifyContent: 'center',
  },
  appNameText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: 0.3,
  },
  categorySubtext: {
    fontSize: 11,
    fontWeight: '500',
    color: '#94a3b8',
    marginTop: -1,
  },
  rightMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  timeAgoText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
  },
  closeBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Card Body */
  cardBody: {
    marginTop: 2,
  },
  headlineText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 13.5,
    color: '#475569',
    lineHeight: 20,
    fontWeight: '400',
  },

  /* Action CTA */
  actionRow: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  actionBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#1e3a8a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  actionBtnText: {
    color: '#ffffff',
    fontSize: 13.5,
    fontWeight: '700',
  },
});
