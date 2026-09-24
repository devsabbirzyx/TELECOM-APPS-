-- ==============================================================================
-- OfferHut / Mobixa - 20260923000001_features_update.sql
-- Features Update:
-- 1. Remove ৳50 Sign-up Bonus (Initial balance ৳0.00)
-- 2. Enhanced Referral System (৳25 to Referrer, ৳50 to Referee if referred)
-- 3. Add Money Requests Table & Functions (bKash/Nagad verification)
-- 4. 10GB Free Internet Offer 12-Hour Server-Backed Countdown & Claim System
-- 5. System Settings Table (bKash/Nagad numbers, rewards)
-- ==============================================================================

-- 1. SYSTEM SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.system_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default system settings
INSERT INTO public.system_settings (key, value, description)
VALUES 
    ('bkash_number', '"01711002233"', 'bKash Merchant/Personal Number for Add Money'),
    ('nagad_number', '"01822003344"', 'Nagad Merchant/Personal Number for Add Money'),
    ('referral_referrer_reward', '25.00', 'Amount credited to referrer in BDT'),
    ('referral_referee_bonus', '50.00', 'Amount credited to new user if joining via referral code in BDT'),
    ('free_claim_timer_hours', '12', 'Duration of timer in hours for 10GB free internet offer')
ON CONFLICT (key) DO NOTHING;

-- 2. ADD MONEY REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.add_money_requests (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 10.00),
    payment_method TEXT NOT NULL CHECK (payment_method IN ('bkash', 'nagad')),
    sender_number TEXT NOT NULL,
    transaction_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    approved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_add_money_user_id ON public.add_money_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_add_money_status ON public.add_money_requests(status);
CREATE INDEX IF NOT EXISTS idx_add_money_trx_id ON public.add_money_requests(transaction_id);

-- 3. 10GB FREE OFFER CLAIMS TABLE
CREATE TABLE IF NOT EXISTS public.free_offer_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    offer_key TEXT NOT NULL DEFAULT '10gb_free',
    status TEXT NOT NULL DEFAULT 'locked' CHECK (status IN ('locked', 'timer_active', 'ready', 'claimed')),
    required_order_id TEXT REFERENCES public.orders(id) ON DELETE SET NULL,
    timer_started_at TIMESTAMPTZ,
    unlocks_at TIMESTAMPTZ,
    claimed_at TIMESTAMPTZ,
    recipient_phone TEXT,
    operator_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_user_free_offer UNIQUE (user_id, offer_key)
);

CREATE INDEX IF NOT EXISTS idx_free_claims_user_id ON public.free_offer_claims(user_id);
CREATE INDEX IF NOT EXISTS idx_free_claims_status ON public.free_offer_claims(status);

-- 4. UPDATE register_user FUNCTION:
-- - Initial balance is strictly ৳0.00
-- - No automatic ৳50 signup bonus
-- - If valid referral code is provided:
--     - Referrer gets ৳25.00 reward
--     - Referee (new user) gets ৳50.00 referral welcome bonus
--     - No self-referral allowed
-- - Safe duplicate referral prevention
CREATE OR REPLACE FUNCTION public.register_user(
    p_full_name TEXT,
    p_phone TEXT,
    p_password TEXT,
    p_referral_code TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    clean_p TEXT;
    existing_id UUID;
    new_user_id UUID := gen_random_uuid();
    new_ref TEXT;
    referrer_id UUID;
    referrer_code_clean TEXT;
    initial_user_balance NUMERIC(10, 2) := 0.00;
    ref_applied BOOLEAN := FALSE;
BEGIN
    -- Normalize phone to 11-digit Bangladesh format (01XXXXXXXXX)
    clean_p := regexp_replace(p_phone, '[^0-9]', '', 'g');
    IF clean_p LIKE '880%' THEN
        clean_p := substring(clean_p from 3);
    END IF;
    IF NOT (clean_p LIKE '0%') THEN
        clean_p := '0' || clean_p;
    END IF;

    IF length(clean_p) != 11 OR NOT (clean_p ~ '^01[3-9][0-9]{8}$') THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'INVALID_PHONE',
            'message', 'সঠিক ১১ ডিজিটের বাংলাদেশি মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)'
        );
    END IF;

    IF length(p_password) < 6 THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'SHORT_PASSWORD',
            'message', 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।'
        );
    END IF;

    SELECT id INTO existing_id FROM public.profiles WHERE phone = clean_p;
    IF existing_id IS NOT NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'ALREADY_EXISTS',
            'message', 'এই মোবাইল নম্বর দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট তৈরি আছে। অনুগ্রহ করে লগইন করুন।'
        );
    END IF;

    -- Generate unique 6-character referral code: MB + 4 random uppercase chars
    new_ref := 'MB' || upper(substring(md5(random()::text) from 1 for 4));

    -- Insert Profile
    INSERT INTO public.profiles (id, full_name, phone, language_pref, referral_code, password_hash, created_at, updated_at)
    VALUES (
        new_user_id,
        p_full_name,
        clean_p,
        'bn',
        new_ref,
        crypt(p_password, gen_salt('bf', 8)),
        NOW(),
        NOW()
    );

    -- Check and apply referral code if provided
    IF p_referral_code IS NOT NULL AND trim(p_referral_code) != '' THEN
        referrer_code_clean := upper(trim(p_referral_code));
        SELECT id INTO referrer_id FROM public.profiles WHERE referral_code = referrer_code_clean;

        IF referrer_id IS NOT NULL AND referrer_id != new_user_id THEN
            -- Referee gets ৳50 referral welcome bonus
            initial_user_balance := 50.00;
            ref_applied := TRUE;

            -- Record referral in referrals table (৳25 to referrer)
            INSERT INTO public.referrals (referrer_id, referred_id, code, status, bonus_amount)
            VALUES (referrer_id, new_user_id, referrer_code_clean, 'completed', 25.00);

            -- Credit Referrer ৳25
            UPDATE public.wallet SET balance = balance + 25.00, updated_at = NOW() WHERE user_id = referrer_id;
            INSERT INTO public.wallet_transactions (user_id, type, amount, description)
            VALUES (referrer_id, 'bonus', 25.00, 'রেফারেল রিওয়ার্ড (৳২৫) - বন্ধু ' || clean_p || ' জয়েন করেছে');

            -- Referrer Notification
            INSERT INTO public.notifications (user_id, title, body, type)
            VALUES (
                referrer_id,
                'রেফারেল বোনাস পেয়েছেন! 🎁',
                'আপনার রেফারেল কোড ব্যবহার করে ' || clean_p || ' অ্যাকাউন্ট তৈরি করেছে। আপনার ওয়ালেটে ২৫ টাকা যোগ হয়েছে!',
                'wallet'
            );
        END IF;
    END IF;

    -- Initialize Wallet: Initial balance is strictly ৳0.00 unless referee referral bonus applied
    INSERT INTO public.wallet (user_id, balance, updated_at)
    VALUES (new_user_id, initial_user_balance, NOW())
    ON CONFLICT (user_id) DO NOTHING;

    -- If referee bonus was applied, record the wallet transaction
    IF ref_applied THEN
        INSERT INTO public.wallet_transactions (user_id, type, amount, description)
        VALUES (new_user_id, 'bonus', 50.00, 'রেফারেল স্পেশাল বোনাস (৳৫০)');

        INSERT INTO public.notifications (user_id, title, body, type)
        VALUES (
            new_user_id,
            'স্বাগতম Mobixa-তে! 🎉',
            'রেফারেল কোড ব্যবহারের জন্য আপনার ওয়ালেটে ৫০ টাকা বোনাস যুক্ত হয়েছে!',
            'system'
        );
    ELSE
        -- Clean welcome notification without any signup bonus claim
        INSERT INTO public.notifications (user_id, title, body, type)
        VALUES (
            new_user_id,
            'স্বাগতম Mobixa-তে! 🎉',
            'আপনার অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে। আকর্ষণীয় অফার ও রিচার্জ সেবা উপভোগ করুন।',
            'system'
        );
    END IF;

    -- Initialize 10GB Free offer claim in 'locked' status
    INSERT INTO public.free_offer_claims (user_id, offer_key, status)
    VALUES (new_user_id, '10gb_free', 'locked')
    ON CONFLICT (user_id, offer_key) DO NOTHING;

    RETURN jsonb_build_object(
        'success', true,
        'message', 'অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!',
        'user', jsonb_build_object(
            'id', new_user_id,
            'phone_number', clean_p,
            'full_name', p_full_name,
            'balance', initial_user_balance,
            'referral_code', new_ref,
            'created_at', NOW()
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. FUNCTION: approve_add_money_request
CREATE OR REPLACE FUNCTION public.approve_add_money_request(
    p_request_id TEXT,
    p_admin_note TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_req RECORD;
    v_new_bal NUMERIC(10, 2);
BEGIN
    SELECT * INTO v_req FROM public.add_money_requests WHERE id = p_request_id;
    IF v_req.id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Request not found');
    END IF;

    IF v_req.status != 'pending' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Request already ' || v_req.status);
    END IF;

    -- Update request status
    UPDATE public.add_money_requests
    SET status = 'approved',
        admin_notes = COALESCE(p_admin_note, admin_notes),
        approved_at = NOW(),
        updated_at = NOW()
    WHERE id = p_request_id;

    -- Credit user wallet
    UPDATE public.wallet
    SET balance = balance + v_req.amount,
        updated_at = NOW()
    WHERE user_id = v_req.user_id
    RETURNING balance INTO v_new_bal;

    -- Record transaction
    INSERT INTO public.wallet_transactions (user_id, type, amount, description)
    VALUES (
        v_req.user_id,
        'deposit',
        v_req.amount,
        'টাকা যোগ সফল (' || upper(v_req.payment_method) || ' - TrxID: ' || v_req.transaction_id || ')'
    );

    -- Send notification
    INSERT INTO public.notifications (user_id, title, body, type)
    VALUES (
        v_req.user_id,
        'টাকা যোগ সফল হয়েছে! ৳' || v_req.amount,
        'আপনার ' || upper(v_req.payment_method) || ' রিকোয়েস্ট (TrxID: ' || v_req.transaction_id || ') অনুমোদিত হয়েছে। বর্তমান ব্যালেন্স: ৳' || v_new_bal,
        'wallet'
    );

    RETURN jsonb_build_object('success', true, 'new_balance', v_new_bal);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. FUNCTION: reject_add_money_request
CREATE OR REPLACE FUNCTION public.reject_add_money_request(
    p_request_id TEXT,
    p_reason TEXT DEFAULT 'অবৈধ ট্রানজেকশন আইডি বা পেমেন্ট পাওয়া যায়নি'
)
RETURNS JSONB AS $$
DECLARE
    v_req RECORD;
BEGIN
    SELECT * INTO v_req FROM public.add_money_requests WHERE id = p_request_id;
    IF v_req.id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Request not found');
    END IF;

    IF v_req.status != 'pending' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Request already ' || v_req.status);
    END IF;

    UPDATE public.add_money_requests
    SET status = 'rejected',
        admin_notes = p_reason,
        updated_at = NOW()
    WHERE id = p_request_id;

    INSERT INTO public.notifications (user_id, title, body, type)
    VALUES (
        v_req.user_id,
        'টাকা যোগ বাতিল হয়েছে ⚠️',
        'আপনার ' || upper(v_req.payment_method) || ' Add Money রিকোয়েস্ট (TrxID: ' || v_req.transaction_id || ') বাতিল হয়েছে। কারণ: ' || p_reason,
        'wallet'
    );

    RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
