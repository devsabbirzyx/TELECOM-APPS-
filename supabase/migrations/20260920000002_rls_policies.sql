-- ==============================================================================
-- OfferHut - 20260920000002_rls_policies.sql
-- Row Level Security (RLS) Policies for All Tables
-- ==============================================================================

-- 1. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.operators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- 2. OPERATORS POLICIES (Public read-only)
CREATE POLICY "Allow public read access to active operators"
    ON public.operators FOR SELECT
    USING (is_active = TRUE);

-- 3. PROFILES POLICIES (Users can read and update only their own profile)
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- 4. OFFERS POLICIES (Public read-only for active offers)
CREATE POLICY "Allow public read access to active offers"
    ON public.offers FOR SELECT
    USING (is_active = TRUE);

-- 5. ORDERS POLICIES (Users can view and create their own orders)
CREATE POLICY "Users can view own orders"
    ON public.orders FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own orders"
    ON public.orders FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- 6. REFERRALS POLICIES
CREATE POLICY "Users can view referrals they are involved in"
    ON public.referrals FOR SELECT
    TO authenticated
    USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

-- 7. WALLET POLICIES (Users can only view their own wallet balance)
CREATE POLICY "Users can view own wallet"
    ON public.wallet FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- 8. WALLET TRANSACTIONS POLICIES (Users can view their own transactions)
CREATE POLICY "Users can view own wallet transactions"
    ON public.wallet_transactions FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- 9. SAVED NUMBERS POLICIES (Full CRUD for own numbers)
CREATE POLICY "Users can view own saved numbers"
    ON public.saved_numbers FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved numbers"
    ON public.saved_numbers FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own saved numbers"
    ON public.saved_numbers FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved numbers"
    ON public.saved_numbers FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- 10. FAQS POLICIES (Public read-only)
CREATE POLICY "Allow public read access to active faqs"
    ON public.faqs FOR SELECT
    USING (is_active = TRUE);

-- 11. SUPPORT MESSAGES POLICIES (Users can view and send messages for their own chat)
CREATE POLICY "Users can view own support messages"
    ON public.support_messages FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own support messages"
    ON public.support_messages FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id AND sender_type = 'user');

-- 12. NOTIFICATIONS POLICIES (Users can view and mark read their own notifications)
CREATE POLICY "Users can view own notifications"
    ON public.notifications FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
    ON public.notifications FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 13. ADMIN USERS (Strict: No public/authenticated client access, service_role only)
-- (No policies created, so client queries will be denied by default RLS)
