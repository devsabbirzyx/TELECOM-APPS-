import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile } from '../types';
import { api, MOCK_PROFILE } from '../services/api';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { supabase } from '../services/supabase';

const LOGIN_FLAG_KEY = 'offerhut_is_logged_in';
const USER_DATA_KEY = 'offerhut_user_data';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (phone: string, password?: string) => Promise<void>;
  verifyOtp: (phone: string, otp: string) => Promise<void>;
  register: (data: { full_name: string; phone_number: string; referral_code?: string; password?: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Helper to persist auth state
  const saveStorageItem = async (key: string, value: string) => {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(key, value);
        }
        return;
      }
      await SecureStore.setItemAsync(key, value);
    } catch {
      // Ignored
    }
  };

  const getStorageItem = async (key: string): Promise<string | null> => {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.localStorage) {
          return window.localStorage.getItem(key);
        }
        return null;
      }
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  };

  const removeStorageItem = async (key: string) => {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.removeItem(key);
        }
        return;
      }
      await SecureStore.deleteItemAsync(key);
    } catch {
      // Ignored
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const loggedInFlag = await getStorageItem(LOGIN_FLAG_KEY);
      const savedUserData = await getStorageItem(USER_DATA_KEY);

      if (loggedInFlag === 'true' && savedUserData) {
        try {
          const parsed = JSON.parse(savedUserData);
          setUser(parsed);

          // In background, fetch fresh profile and avatar directly from database
          if (parsed?.id) {
            (async () => {
              try {
                const { data: rpcRes, error } = await supabase.rpc('get_user_profile', { p_user_id: parsed.id });
                if (!error && rpcRes && rpcRes.success && rpcRes.user) {
                  setUser((prev) => {
                    const freshUser = {
                      ...prev,
                      ...rpcRes.user,
                      avatar_url: rpcRes.user.avatar_url !== undefined ? rpcRes.user.avatar_url : prev?.avatar_url,
                    };
                    saveStorageItem(USER_DATA_KEY, JSON.stringify(freshUser));
                    return freshUser as UserProfile;
                  });
                } else {
                  const { data: profileData, error: profErr } = await supabase
                    .from('profiles')
                    .select('id, full_name, phone, avatar_url, referral_code')
                    .eq('id', parsed.id)
                    .single();
                  if (!profErr && profileData) {
                    setUser((prev) => {
                      const freshUser = {
                        ...prev,
                        ...profileData,
                        phone_number: profileData.phone || prev?.phone_number,
                        avatar_url: profileData.avatar_url !== undefined ? profileData.avatar_url : prev?.avatar_url,
                      };
                      saveStorageItem(USER_DATA_KEY, JSON.stringify(freshUser));
                      return freshUser as UserProfile;
                    });
                  }
                }
              } catch {
                // Background refresh ignore
              }
            })();
          }
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (phone: string, password?: string) => {
    setIsLoading(true);
    try {
      const res = await api.login(phone, password);
      if (!res || !res.user) {
        throw new Error('ভুল মোবাইল নম্বর বা পাসওয়ার্ড।');
      }

      setUser(res.user);
      await saveStorageItem(LOGIN_FLAG_KEY, 'true');
      await saveStorageItem(USER_DATA_KEY, JSON.stringify(res.user));
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (phone: string, otp: string) => {
    setIsLoading(true);
    try {
      const res = await api.verifyOtp(phone, otp);
      if (!res || !res.user) {
        throw new Error('ভুল ওটিপি কোড।');
      }

      setUser(res.user);
      await saveStorageItem(LOGIN_FLAG_KEY, 'true');
      await saveStorageItem(USER_DATA_KEY, JSON.stringify(res.user));
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: { full_name: string; phone_number: string; referral_code?: string; password?: string }) => {
    setIsLoading(true);
    try {
      const res = await api.register(data);
      if (!res || !res.user) {
        throw new Error('অ্যাকাউন্ট তৈরি করা সম্ভব হয়নি।');
      }

      setUser(res.user);
      await saveStorageItem(LOGIN_FLAG_KEY, 'true');
      await saveStorageItem(USER_DATA_KEY, JSON.stringify(res.user));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await api.logout();
      await removeStorageItem(LOGIN_FLAG_KEY);
      await removeStorageItem(USER_DATA_KEY);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = async () => {
    try {
      const profile = await api.getProfile();
      if (profile) {
        setUser(profile);
        await saveStorageItem(USER_DATA_KEY, JSON.stringify(profile));
      }
    } catch (err) {
      console.warn('Could not refresh profile', err);
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    const merged: UserProfile = {
      ...user,
      ...data,
    } as UserProfile;

    setUser(merged);
    await saveStorageItem(USER_DATA_KEY, JSON.stringify(merged));

    try {
      if (merged.id) {
        await supabase.rpc('update_user_profile', {
          p_user_id: merged.id,
          p_full_name: merged.full_name || null,
          p_avatar_url: merged.avatar_url !== undefined ? merged.avatar_url : null,
        });
      }
      await api.updateProfile(merged);
    } catch (err) {
      console.warn('[updateProfile] Sync warning:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        verifyOtp,
        register,
        logout,
        refreshProfile,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
