export type OperatorCode = 'gp' | 'robi' | 'banglalink' | 'airtel' | 'teletalk' | 'skitto';

export interface Operator {
  id: string;
  name: string;
  code: OperatorCode;
  logo_url?: string;
  color_code: string;
  is_active: boolean;
  offer_count?: number;
}

export type OfferCategory = 'internet' | 'combo' | 'minutes' | 'drive' | 'all';

export interface Offer {
  id: string;
  operator_id?: string;
  operator_code: OperatorCode;
  operator_name?: string;
  title: string;
  description?: string;
  category: OfferCategory;
  validity_days: number;
  data_amount?: string; // e.g. "50 GB"
  voice_minutes?: number; // e.g. 1000
  sms_count?: number;
  regular_price: number;
  offer_price: number;
  cashback_amount?: number;
  is_featured: boolean;
  is_drive_offer: boolean;
  is_active: boolean;
  terms?: string[];
}

export type PaymentMethod = 'bkash' | 'nagad' | 'wallet' | 'card';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled';

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  offer_id: string;
  phone_number: string;
  operator_code: OperatorCode;
  amount: number;
  discount_amount: number;
  cashback_amount?: number;
  total_paid: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  created_at: string;
  offer?: Offer;
}

export interface UserProfile {
  id: string;
  phone_number: string;
  email?: string;
  full_name: string;
  avatar_url?: string;
  balance: number;
  referral_code: string;
  created_at: string;
}

export interface SavedNumber {
  id: string;
  user_id: string;
  title: string; // e.g., "My Primary SIM", "Mom's Phone"
  phone_number: string;
  operator_code: OperatorCode;
  created_at?: string;
}

export interface WalletTransaction {
  id: string;
  user_id: string;
  order_id?: string;
  amount: number;
  transaction_type: 'credit' | 'debit';
  payment_method?: string;
  status: 'completed' | 'pending' | 'failed';
  description: string;
  created_at: string;
}

export interface SupportTicket {
  id: string;
  user_id: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'normal' | 'urgent';
  created_at: string;
  replies?: Array<{
    id: string;
    sender: 'user' | 'support';
    message: string;
    created_at: string;
  }>;
}

export interface AppNotification {
  id: string;
  user_id?: string;
  title: string;
  body: string;
  is_read: boolean;
  type?: 'offer' | 'order' | 'wallet' | 'system';
  data?: Record<string, any>;
  created_at: string;
}

export interface AddMoneyRequest {
  id: string;
  user_id: string;
  amount: number;
  payment_method: 'bkash' | 'nagad';
  sender_number: string;
  transaction_id: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes?: string;
  created_at: string;
  approved_at?: string;
}

export interface FreeClaimStatus {
  id?: string;
  status: 'locked' | 'timer_active' | 'ready' | 'claimed';
  timer_started_at?: string;
  unlocks_at?: string;
  seconds_remaining: number;
  claimed_at?: string;
  can_claim: boolean;
  required_pack_title?: string;
  offer_title?: string;
  description?: string;
}

export interface ReferralData {
  referral_code: string;
  total_earned: number;
  total_referrals: number;
  reward_per_referral: number;
  referred_users: Array<{
    id: string;
    name: string;
    phone_number: string;
    date: string;
    status: string;
    reward: number;
  }>;
}


