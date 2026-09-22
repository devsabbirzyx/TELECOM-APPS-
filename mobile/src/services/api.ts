import {
  Operator,
  Offer,
  Order,
  UserProfile,
  SavedNumber,
  WalletTransaction,
  SupportTicket,
  AppNotification,
  ReferralData,
} from '../types';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { supabase } from './supabase';

// Dynamically handle localhost vs Android emulator vs local LAN
const DEFAULT_HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
export const API_BASE_URL = `http://${DEFAULT_HOST}:5000/api`;

const TOKEN_KEY = 'offerhut_auth_token';

class ApiService {
  private token: string | null = null;

  constructor() {
    this.loadToken();
  }

  async loadToken(): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.localStorage) {
          this.token = window.localStorage.getItem(TOKEN_KEY);
          return this.token;
        }
        return null;
      }
      this.token = await SecureStore.getItemAsync(TOKEN_KEY);
      return this.token;
    } catch {
      return null;
    }
  }

  async setToken(token: string | null) {
    this.token = token;
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.localStorage) {
          if (token) {
            window.localStorage.setItem(TOKEN_KEY, token);
          } else {
            window.localStorage.removeItem(TOKEN_KEY);
          }
        }
        return;
      }
      if (token) {
        await SecureStore.setItemAsync(TOKEN_KEY, token);
      } else {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
      }
    } catch {
      // Ignore storage errors on web or restricted environments
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    if (!this.token) {
      await this.loadToken();
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || `HTTP error ${response.status}`);
      }

      return data as T;
    } catch (error: any) {
      console.warn(`[API Error] ${endpoint}:`, error.message);
      // Fallback mock responses when backend is offline
      const mockResult = this.getMockResponse<T>(endpoint, options);
      if (mockResult !== null) {
        return mockResult;
      }
      throw error;
    }
  }

  // Fallback mock data provider for offline/demo operation
  private getMockResponse<T>(endpoint: string, options: RequestInit): T | null {
    if (endpoint.startsWith('/operators')) {
      return MOCK_OPERATORS as unknown as T;
    }
    if (endpoint.startsWith('/offers/featured')) {
      return MOCK_OFFERS.filter(o => o.is_featured) as unknown as T;
    }
    if (endpoint.startsWith('/offers/drive')) {
      return MOCK_OFFERS.filter(o => o.is_drive_offer) as unknown as T;
    }
    if (endpoint.startsWith('/offers')) {
      return MOCK_OFFERS as unknown as T;
    }
    if (endpoint.startsWith('/profile')) {
      return MOCK_PROFILE as unknown as T;
    }
    if (endpoint.startsWith('/wallet/balance')) {
      return { balance: 450.0 } as unknown as T;
    }
    if (endpoint.startsWith('/wallet/transactions')) {
      return MOCK_TRANSACTIONS as unknown as T;
    }
    if (endpoint.startsWith('/saved-numbers')) {
      return MOCK_SAVED_NUMBERS as unknown as T;
    }
    if (endpoint.startsWith('/referrals')) {
      return MOCK_REFERRAL as unknown as T;
    }
    if (endpoint.startsWith('/notifications')) {
      return MOCK_NOTIFICATIONS as unknown as T;
    }
    if (endpoint.startsWith('/orders') && options.method === 'GET') {
      return MOCK_ORDERS as unknown as T;
    }
    if (endpoint.startsWith('/support/tickets')) {
      return MOCK_TICKETS as unknown as T;
    }
    return null;
  }

  // Auth Endpoints
  async sendOtp(phoneNumber: string): Promise<{ success: boolean; message: string }> {
    return this.request('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phone_number: phoneNumber }),
    });
  }

  async verifyOtp(phoneNumber: string, otp: string): Promise<{ token: string; user: UserProfile }> {
    const res = await this.request<{ token: string; user: UserProfile }>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phone_number: phoneNumber, otp }),
    });
    if (res.token) {
      await this.setToken(res.token);
    }
    return res;
  }

  async login(phone_number: string, password?: string): Promise<{ token: string; user: UserProfile }> {
    // 1. First attempt direct Supabase RPC verification (fastest & most reliable)
    try {
      const { data, error } = await supabase.rpc('authenticate_user', {
        p_phone: phone_number,
        p_password: password || '',
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data || !data.success) {
        throw new Error(data?.message || 'ভুল মোবাইল নম্বর বা পাসওয়ার্ড।');
      }

      const token = `mobixa_token_${data.user.id}`;
      await this.setToken(token);
      return { token, user: data.user as UserProfile };
    } catch (rpcErr: any) {
      // If it is a known validation/credentials error, throw immediately
      if (rpcErr.message && (rpcErr.message.includes('পাসওয়ার্ড') || rpcErr.message.includes('অ্যাকাউন্ট') || rpcErr.message.includes('নম্বর'))) {
        throw rpcErr;
      }

      // 2. Fallback to Backend REST API
      const res = await this.request<{ token: string; user: UserProfile; error?: string; message?: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ phone_number, password }),
      });

      if ((res as any).error) {
        throw new Error((res as any).error);
      }

      if (res.token) {
        await this.setToken(res.token);
      }
      return res;
    }
  }

  async register(data: { full_name: string; phone_number: string; referral_code?: string; password?: string }): Promise<{ token: string; user: UserProfile }> {
    // 1. First attempt direct Supabase RPC registration
    try {
      const { data: resData, error } = await supabase.rpc('register_user', {
        p_full_name: data.full_name,
        p_phone: data.phone_number,
        p_password: data.password || '',
        p_referral_code: data.referral_code || null,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!resData || !resData.success) {
        throw new Error(resData?.message || 'রেজিস্ট্রেশন ব্যর্থ হয়েছে।');
      }

      const token = `mobixa_token_${resData.user.id}`;
      await this.setToken(token);
      return { token, user: resData.user as UserProfile };
    } catch (rpcErr: any) {
      if (rpcErr.message && (rpcErr.message.includes('ইতিমধ্যে') || rpcErr.message.includes('পাসওয়ার্ড') || rpcErr.message.includes('নম্বর'))) {
        throw rpcErr;
      }

      // 2. Fallback to Backend REST API
      const res = await this.request<{ token: string; user: UserProfile }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (res.token) {
        await this.setToken(res.token);
      }
      return res;
    }
  }

  async logout(): Promise<void> {
    await this.setToken(null);
  }

  // Operators
  async getOperators(): Promise<Operator[]> {
    return this.request('/operators');
  }

  // Offers
  async getOffers(params?: { operator?: string; category?: string; search?: string }): Promise<Offer[]> {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/offers${query ? `?${query}` : ''}`);
  }

  async getOfferById(id: string): Promise<Offer> {
    return this.request(`/offers/${id}`);
  }

  async getFeaturedOffers(): Promise<Offer[]> {
    return this.request('/offers/featured');
  }

  async getDriveOffers(): Promise<Offer[]> {
    return this.request('/offers/drive');
  }

  async claimWelcomeOffer(phoneNumber: string, operator: string): Promise<{ success: boolean; message: string }> {
    return this.request('/offers/claim-welcome', {
      method: 'POST',
      body: JSON.stringify({ phone_number: phoneNumber, operator }),
    });
  }

  // Orders
  async createOrder(data: {
    offer_id: string;
    phone_number: string;
    operator_code: string;
    payment_method: string;
  }): Promise<{ order: Order; payment_url?: string }> {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getOrders(): Promise<Order[]> {
    return this.request('/orders');
  }

  // Payments
  async initiateBkash(orderId: string): Promise<{ bkashURL: string; paymentID: string }> {
    return this.request('/payments/bkash/create', {
      method: 'POST',
      body: JSON.stringify({ order_id: orderId }),
    });
  }

  async executeBkash(paymentId: string): Promise<{ status: string; trxID: string }> {
    return this.request('/payments/bkash/execute', {
      method: 'POST',
      body: JSON.stringify({ payment_id: paymentId }),
    });
  }

  // Wallet
  async getWalletBalance(): Promise<{ balance: number }> {
    return this.request('/wallet/balance');
  }

  async getWalletTransactions(): Promise<WalletTransaction[]> {
    return this.request('/wallet/transactions');
  }

  async addMoney(amount: number, method: string): Promise<{ payment_url: string }> {
    return this.request('/wallet/add-money', {
      method: 'POST',
      body: JSON.stringify({ amount, method }),
    });
  }

  // Profile
  async getProfile(): Promise<UserProfile> {
    try {
      if (!this.token) {
        await this.loadToken();
      }
      if (this.token && this.token.startsWith('mobixa_token_')) {
        const userId = this.token.replace('mobixa_token_', '');
        const { data: rpcData, error } = await supabase.rpc('get_user_profile', { p_user_id: userId });
        if (!error && rpcData && rpcData.success && rpcData.user) {
          return rpcData.user as UserProfile;
        }
      }
    } catch (e) {
      console.warn('RPC get_user_profile error:', e);
    }
    return this.request('/profile');
  }

  async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    try {
      if (data.id) {
        await supabase.rpc('update_user_profile', {
          p_user_id: data.id,
          p_full_name: data.full_name || null,
          p_avatar_url: data.avatar_url !== undefined ? data.avatar_url : null,
        });
      }
    } catch (e) {
      console.warn('RPC update_user_profile error:', e);
    }

    try {
      const res = await this.request<{ success: boolean; profile: UserProfile }>('/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return (res as any).profile || (res as any);
    } catch {
      return data as UserProfile;
    }
  }

  // Saved Numbers
  async getSavedNumbers(): Promise<SavedNumber[]> {
    return this.request('/saved-numbers');
  }

  async addSavedNumber(data: { title: string; phone_number: string; operator_code: string }): Promise<SavedNumber> {
    return this.request('/saved-numbers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteSavedNumber(id: string): Promise<{ success: boolean }> {
    return this.request(`/saved-numbers/${id}`, { method: 'DELETE' });
  }

  // Referrals
  async getReferralData(): Promise<ReferralData> {
    return this.request('/referrals');
  }

  // Support
  async getSupportTickets(): Promise<SupportTicket[]> {
    return this.request('/support/tickets');
  }

  async createSupportTicket(data: { subject: string; message: string; priority?: string }): Promise<SupportTicket> {
    return this.request('/support/tickets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async sendChatMessage(ticketId: string, message: string): Promise<any> {
    return this.request(`/support/tickets/${ticketId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  // Notifications
  async getNotifications(): Promise<AppNotification[]> {
    return this.request('/notifications');
  }

  async markNotificationRead(id: string): Promise<void> {
    return this.request(`/notifications/${id}/read`, { method: 'PUT' });
  }
}

// Mock initial data for resilient presentation
export const MOCK_OPERATORS: Operator[] = [
  { id: '1', name: 'Grameenphone', code: 'gp', color_code: '#0284c7', is_active: true, offer_count: 24 },
  { id: '2', name: 'Robi', code: 'robi', color_code: '#ef4444', is_active: true, offer_count: 18 },
  { id: '3', name: 'Banglalink', code: 'banglalink', color_code: '#f59e0b', is_active: true, offer_count: 15 },
  { id: '4', name: 'Airtel', code: 'airtel', color_code: '#e11d48', is_active: true, offer_count: 12 },
  { id: '5', name: 'Teletalk', code: 'teletalk', color_code: '#059669', is_active: true, offer_count: 9 },
  { id: '6', name: 'Skitto', code: 'skitto', color_code: '#9333ea', is_active: true, offer_count: 14 },
];

export const MOCK_OFFERS: Offer[] = [
  {
    id: 'off-1',
    operator_code: 'gp',
    operator_name: 'Grameenphone',
    title: '50 GB Internet + 1000 Mins',
    description: 'Special Monthly Super Combo pack with unlimited Facebook & WhatsApp browsing.',
    category: 'combo',
    validity_days: 30,
    data_amount: '50 GB',
    voice_minutes: 1000,
    sms_count: 100,
    regular_price: 699,
    offer_price: 499,
    cashback_amount: 50,
    is_featured: true,
    is_drive_offer: false,
    is_active: true,
    terms: ['Auto-renewal available', '24/7 internet usage', 'Valid for all GP Prepaid SIMs'],
  },
  {
    id: 'off-2',
    operator_code: 'robi',
    operator_name: 'Robi',
    title: '40 GB High Speed Data',
    description: 'Blazing fast 4.5G data pack with zero speed capping throughout 30 days.',
    category: 'internet',
    validity_days: 30,
    data_amount: '40 GB',
    voice_minutes: 0,
    regular_price: 450,
    offer_price: 349,
    cashback_amount: 30,
    is_featured: true,
    is_drive_offer: false,
    is_active: true,
    terms: ['Valid on 4G network', 'Carry forward unused data'],
  },
  {
    id: 'off-3',
    operator_code: 'banglalink',
    operator_name: 'Banglalink',
    title: 'Drive Pack: 60 GB + 1200 Mins',
    description: 'Huge commission drive offer with instant ৳100 cash-back into your wallet.',
    category: 'drive',
    validity_days: 30,
    data_amount: '60 GB',
    voice_minutes: 1200,
    regular_price: 798,
    offer_price: 549,
    cashback_amount: 100,
    is_featured: true,
    is_drive_offer: true,
    is_active: true,
    terms: ['Special retailer commission applied', 'Direct recharge to customer number'],
  },
  {
    id: 'off-4',
    operator_code: 'airtel',
    operator_name: 'Airtel',
    title: '25 GB + 500 Mins Unlimited',
    description: 'Best youth combo bundle with free Toffee and streaming data.',
    category: 'combo',
    validity_days: 30,
    data_amount: '25 GB',
    voice_minutes: 500,
    regular_price: 399,
    offer_price: 298,
    cashback_amount: 20,
    is_featured: false,
    is_drive_offer: false,
    is_active: true,
  },
  {
    id: 'off-5',
    operator_code: 'teletalk',
    operator_name: 'Teletalk',
    title: '30 GB Shadhinota Pack',
    description: 'Affordable high-volume government carrier bundle valid nationwide.',
    category: 'internet',
    validity_days: 30,
    data_amount: '30 GB',
    voice_minutes: 200,
    regular_price: 350,
    offer_price: 220,
    cashback_amount: 15,
    is_featured: false,
    is_drive_offer: false,
    is_active: true,
  },
  {
    id: 'off-6',
    operator_code: 'gp',
    operator_name: 'Grameenphone',
    title: 'Drive Offer: 80 GB Super Pack',
    description: 'Maximum commission drive deal with instant bonus and zero wait time.',
    category: 'drive',
    validity_days: 30,
    data_amount: '80 GB',
    voice_minutes: 800,
    regular_price: 999,
    offer_price: 699,
    cashback_amount: 150,
    is_featured: true,
    is_drive_offer: true,
    is_active: true,
  },
];

export const MOCK_PROFILE: UserProfile = {
  id: 'usr-101',
  phone_number: '01712345678',
  full_name: 'Tanvir Hossain',
  email: 'tanvir.mobixa@gmail.com',
  balance: 450.0,
  referral_code: 'TANVIR2026',
  created_at: '2026-01-15T10:00:00Z',
};

export const MOCK_SAVED_NUMBERS: SavedNumber[] = [
  { id: 'sn-1', user_id: 'usr-101', title: 'My Primary GP', phone_number: '01712345678', operator_code: 'gp' },
  { id: 'sn-2', user_id: 'usr-101', title: "Mom's Banglalink", phone_number: '01987654321', operator_code: 'banglalink' },
  { id: 'sn-3', user_id: 'usr-101', title: "Brother's Robi", phone_number: '01811223344', operator_code: 'robi' },
];

export const MOCK_TRANSACTIONS: WalletTransaction[] = [
  {
    id: 'tx-1',
    user_id: 'usr-101',
    amount: 50.0,
    transaction_type: 'credit',
    payment_method: 'cashback',
    status: 'completed',
    description: 'Cash-back for 50GB GP Bundle',
    created_at: '2026-09-18T14:30:00Z',
  },
  {
    id: 'tx-2',
    user_id: 'usr-101',
    amount: 500.0,
    transaction_type: 'credit',
    payment_method: 'bkash',
    status: 'completed',
    description: 'Wallet Top-up via bKash',
    created_at: '2026-09-15T09:12:00Z',
  },
  {
    id: 'tx-3',
    user_id: 'usr-101',
    amount: 298.0,
    transaction_type: 'debit',
    payment_method: 'wallet',
    status: 'completed',
    description: 'Purchased Airtel 25GB Combo',
    created_at: '2026-09-12T19:45:00Z',
  },
];

export const MOCK_ORDERS: Order[] = [
  {
    id: 'ord-101',
    order_number: 'ORD-849201',
    user_id: 'usr-101',
    offer_id: 'off-1',
    phone_number: '01712345678',
    operator_code: 'gp',
    amount: 499,
    discount_amount: 200,
    cashback_amount: 50,
    total_paid: 499,
    payment_method: 'bkash',
    payment_status: 'completed',
    order_status: 'completed',
    created_at: '2026-09-18T14:28:00Z',
    offer: MOCK_OFFERS[0],
  },
  {
    id: 'ord-102',
    order_number: 'ORD-849188',
    user_id: 'usr-101',
    offer_id: 'off-4',
    phone_number: '01811223344',
    operator_code: 'airtel',
    amount: 298,
    discount_amount: 101,
    cashback_amount: 20,
    total_paid: 298,
    payment_method: 'wallet',
    payment_status: 'completed',
    order_status: 'completed',
    created_at: '2026-09-12T19:44:00Z',
    offer: MOCK_OFFERS[3],
  },
];

export const MOCK_REFERRAL: ReferralData = {
  referral_code: 'TANVIR2026',
  total_earned: 250,
  total_referrals: 5,
  reward_per_referral: 50,
  referred_users: [
    { id: 'ref-1', name: 'Rakib Hasan', phone_number: '017****1234', date: '2026-09-10', status: 'Completed', reward: 50 },
    { id: 'ref-2', name: 'Nafis Ahmed', phone_number: '018****5678', date: '2026-09-12', status: 'Completed', reward: 50 },
    { id: 'ref-3', name: 'Shakil Khan', phone_number: '019****9988', date: '2026-09-14', status: 'Completed', reward: 50 },
    { id: 'ref-4', name: 'Farhan Kabir', phone_number: '016****4433', date: '2026-09-17', status: 'Completed', reward: 50 },
    { id: 'ref-5', name: 'Sajid Islam', phone_number: '015****7766', date: '2026-09-19', status: 'Completed', reward: 50 },
  ],
};

export const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'Flash Sale: 50% Off GP 50GB!',
    body: 'Grab the Grameenphone 50 GB + 1000 Mins super combo pack at only ৳499 for the next 3 hours.',
    is_read: false,
    type: 'offer',
    created_at: '2026-09-20T08:00:00Z',
  },
  {
    id: 'notif-2',
    title: '৳50 Cashback Credited',
    body: 'Your cash-back for order #ORD-849201 has been added to your Mobixa wallet.',
    is_read: false,
    type: 'wallet',
    created_at: '2026-09-18T14:31:00Z',
  },
  {
    id: 'notif-3',
    title: 'Welcome to Mobixa!',
    body: 'Claim your 10 GB Free Data on any SIM as a welcome gift today.',
    is_read: true,
    type: 'system',
    created_at: '2026-09-15T10:00:00Z',
  },
];

export const MOCK_TICKETS: SupportTicket[] = [
  {
    id: 'tkt-1',
    user_id: 'usr-101',
    subject: 'Recharge confirmation query',
    message: 'I purchased the 40GB bundle for 01712345678, took 2 mins to activate. Is that normal?',
    status: 'resolved',
    priority: 'normal',
    created_at: '2026-09-14T11:20:00Z',
    replies: [
      {
        id: 'rep-1',
        sender: 'support',
        message: 'Hello Tanvir! Yes, telecom operator gateway confirmations typically take 30-120 seconds. Your bundle is fully active.',
        created_at: '2026-09-14T11:25:00Z',
      },
    ],
  },
];

export const api = new ApiService();
