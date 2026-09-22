-- ==============================================================================
-- OfferHut - 20260920000001_initial_schema.sql
-- Core Schema: Tables, Relationships, Indexes, and Database Triggers
-- ==============================================================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. OPERATORS TABLE
CREATE TABLE IF NOT EXISTS public.operators (
    id TEXT PRIMARY KEY, -- 'gp', 'robi', 'airtel', 'banglalink', 'teletalk', 'skitto'
    name TEXT NOT NULL,
    logo_url TEXT,
    prefix_codes TEXT[] NOT NULL DEFAULT '{}',
    color_hex TEXT DEFAULT '#1E3A8A',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PROFILES TABLE (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    phone TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    language_pref TEXT DEFAULT 'bn' CHECK (language_pref IN ('bn', 'en')),
    expo_push_token TEXT,
    referral_code TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. OFFERS TABLE (SIM Packages & Drive Offers)
CREATE TABLE IF NOT EXISTS public.offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operator_id TEXT NOT NULL REFERENCES public.operators(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    data_amount TEXT NOT NULL, -- e.g. '50 GB', '10 GB', 'Unlimited'
    minutes INTEGER DEFAULT 0,
    sms_count INTEGER DEFAULT 0,
    price NUMERIC(10, 2) NOT NULL,
    regular_price NUMERIC(10, 2),
    validity_days INTEGER NOT NULL, -- e.g. 7, 30
    is_active BOOLEAN DEFAULT TRUE,
    is_drive_offer BOOLEAN DEFAULT FALSE,
    discount_percent INTEGER DEFAULT 0,
    cashback_amount NUMERIC(10, 2) DEFAULT 0.00,
    flash_sale_ends_at TIMESTAMPTZ,
    category TEXT DEFAULT 'internet' CHECK (category IN ('internet', 'combo', 'voice', 'unlimited')),
    badge_text TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY, -- 'OH-XXXXXX' format
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    offer_id UUID NOT NULL REFERENCES public.offers(id) ON DELETE RESTRICT,
    recipient_number TEXT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    discount_applied NUMERIC(10, 2) DEFAULT 0.00,
    wallet_used NUMERIC(10, 2) DEFAULT 0.00,
    final_amount NUMERIC(10, 2) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'processing', 'completed', 'failed', 'rejected')),
    payment_method TEXT DEFAULT 'bkash' CHECK (payment_method IN ('bkash', 'nagad', 'wallet')),
    transaction_id TEXT,
    operator_reference TEXT,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. REFERRALS TABLE
CREATE TABLE IF NOT EXISTS public.referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    referred_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed')),
    bonus_amount NUMERIC(10, 2) DEFAULT 10.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. WALLET TABLE
CREATE TABLE IF NOT EXISTS public.wallet (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    balance NUMERIC(10, 2) DEFAULT 0.00 CHECK (balance >= 0),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. WALLET TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('bonus', 'refund', 'used', 'cashback', 'deposit')),
    amount NUMERIC(10, 2) NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. SAVED NUMBERS TABLE
CREATE TABLE IF NOT EXISTS public.saved_numbers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    operator_id TEXT REFERENCES public.operators(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. FAQS TABLE
CREATE TABLE IF NOT EXISTS public.faqs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category TEXT DEFAULT 'General',
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. SUPPORT MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.support_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    sender_type TEXT DEFAULT 'user' CHECK (sender_type IN ('user', 'admin')),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    type TEXT DEFAULT 'order' CHECK (type IN ('order', 'offer', 'wallet', 'system')),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. ADMIN USERS TABLE
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'support', 'superadmin')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- DATABASE INDEXES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_offers_operator_id ON public.offers(operator_id);
CREATE INDEX IF NOT EXISTS idx_offers_is_drive ON public.offers(is_drive_offer) WHERE is_drive_offer = TRUE;
CREATE INDEX IF NOT EXISTS idx_offers_category ON public.offers(category);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_wallet_tx_user_id ON public.wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_numbers_user_id ON public.saved_numbers(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_support_messages_user_id ON public.support_messages(user_id);

-- ==============================================================================
-- AUTOMATED TRIGGERS & FUNCTIONS
-- ==============================================================================

-- Trigger Function: Auto-create Profile, Wallet, and Referral Code on new Auth User
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    new_referral_code TEXT;
    extracted_phone TEXT;
    extracted_name TEXT;
BEGIN
    -- Generate unique 6-character referral code: OH + 4 random uppercase chars
    new_referral_code := 'OH' || upper(substring(md5(random()::text) from 1 for 4));

    extracted_phone := COALESCE(NEW.raw_user_meta_data->>'phone', NEW.phone, '01700000000');
    extracted_name := COALESCE(NEW.raw_user_meta_data->>'full_name', 'OfferHut User');

    -- Insert into public.profiles
    INSERT INTO public.profiles (id, full_name, phone, language_pref, referral_code)
    VALUES (
        NEW.id,
        extracted_name,
        extracted_phone,
        COALESCE(NEW.raw_user_meta_data->>'language_pref', 'bn'),
        new_referral_code
    )
    ON CONFLICT (id) DO NOTHING;

    -- Insert into public.wallet
    INSERT INTO public.wallet (user_id, balance)
    VALUES (NEW.id, 0.00)
    ON CONFLICT (user_id) DO NOTHING;

    -- Insert welcome notification
    INSERT INTO public.notifications (user_id, title, body, type)
    VALUES (
        NEW.id,
        'Welcome to OfferHut! 🎉',
        'Your account has been created. Explore the best SIM bundle offers across Bangladesh!',
        'system'
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger Function: Process Cashback & Notifications when Order is Completed
CREATE OR REPLACE FUNCTION public.handle_order_completion()
RETURNS TRIGGER AS $$
DECLARE
    offer_cashback NUMERIC(10, 2);
    offer_title TEXT;
BEGIN
    -- Only trigger when status changes to 'completed'
    IF NEW.status = 'completed' AND (OLD.status IS DISTINCT FROM 'completed') THEN
        -- Get offer cashback and title
        SELECT cashback_amount, title INTO offer_cashback, offer_title
        FROM public.offers WHERE id = NEW.offer_id;

        -- If offer has cashback, credit user wallet
        IF offer_cashback IS NOT NULL AND offer_cashback > 0 THEN
            UPDATE public.wallet
            SET balance = balance + offer_cashback,
                updated_at = NOW()
            WHERE user_id = NEW.user_id;

            -- Record wallet transaction
            INSERT INTO public.wallet_transactions (user_id, type, amount, description)
            VALUES (
                NEW.user_id,
                'cashback',
                offer_cashback,
                'Cashback for Order #' || NEW.id || ' (' || offer_title || ')'
            );

            -- Send notification
            INSERT INTO public.notifications (user_id, title, body, type)
            VALUES (
                NEW.user_id,
                'Cashback Received! ৳' || offer_cashback,
                'Congratulations! ৳' || offer_cashback || ' cashback has been credited to your wallet for Order #' || NEW.id,
                'wallet'
            );
        ELSE
            -- Send order completed notification
            INSERT INTO public.notifications (user_id, title, body, type)
            VALUES (
                NEW.user_id,
                'Pack Activated Successfully! 🚀',
                'Your pack for ' || NEW.recipient_number || ' (Order #' || NEW.id || ') is now active.',
                'order'
            );
        END IF;

        -- Set completed timestamp
        NEW.completed_at := NOW();
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_order_completed ON public.orders;
CREATE TRIGGER on_order_completed
    BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.handle_order_completion();
