-- ==============================================================================
-- OfferHut - 20260920000003_seed_data.sql
-- Seed Data: Operators, Packages, Drive Offers, and Support FAQs
-- ==============================================================================

-- 1. SEED OPERATORS
INSERT INTO public.operators (id, name, logo_url, prefix_codes, color_hex, is_active)
VALUES
    ('gp', 'Grameenphone', 'https://images.unsplash.com/photo-1614680376593-902f749f7ffc?w=128&auto=format&fit=crop&q=80', ARRAY['017', '013'], '#00236F', TRUE),
    ('robi', 'Robi', 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=128&auto=format&fit=crop&q=80', ARRAY['018'], '#E11927', TRUE),
    ('banglalink', 'Banglalink', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&auto=format&fit=crop&q=80', ARRAY['019', '014'], '#FF6600', TRUE),
    ('airtel', 'Airtel', 'https://images.unsplash.com/photo-1614680376408-81e91ffe3db7?w=128&auto=format&fit=crop&q=80', ARRAY['016'], '#EE1D23', TRUE),
    ('teletalk', 'Teletalk', 'https://images.unsplash.com/photo-1557683316-973673baf926?w=128&auto=format&fit=crop&q=80', ARRAY['015'], '#008000', TRUE),
    ('skitto', 'Skitto', 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=128&auto=format&fit=crop&q=80', ARRAY['017', '013'], '#552B7D', TRUE)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    prefix_codes = EXCLUDED.prefix_codes,
    color_hex = EXCLUDED.color_hex;

-- 2. SEED OFFERS (Regular & Drive Offers)
INSERT INTO public.offers (
    operator_id, title, data_amount, minutes, sms_count,
    price, regular_price, validity_days, is_active, is_drive_offer,
    discount_percent, cashback_amount, flash_sale_ends_at, category, badge_text
)
VALUES
    -- Grameenphone Offers
    ('gp', 'GP 50 GB Monthly Dhamaka', '50 GB', 0, 0, 499.00, 599.00, 30, TRUE, FALSE, 16, 20.00, NULL, 'internet', 'POPULAR'),
    ('gp', 'GP 30 GB + 800 Mins Special Combo', '30 GB', 800, 100, 649.00, 799.00, 30, TRUE, TRUE, 18, 120.00, NOW() + INTERVAL '24 hours', 'combo', 'MEGA DRIVE'),
    ('gp', 'GP 10 GB 7 Days Super Pack', '10 GB', 0, 0, 169.00, 199.00, 7, TRUE, FALSE, 15, 0.00, NULL, 'internet', 'WEEKLY'),
    ('gp', 'GP 500 Minutes Talktime Pack', '0 GB', 500, 0, 319.00, 360.00, 30, TRUE, FALSE, 11, 15.00, NULL, 'voice', 'VOICE'),

    -- Robi Offers
    ('robi', 'Robi 40 GB + 900 Mins Drive Offer', '40 GB', 900, 200, 598.00, 749.00, 30, TRUE, TRUE, 20, 150.00, NOW() + INTERVAL '18 hours', 'combo', 'HOT DRIVE'),
    ('robi', 'Robi 60 GB Internet Delight', '60 GB', 0, 0, 449.00, 530.00, 30, TRUE, FALSE, 15, 30.00, NULL, 'internet', 'MONTHLY'),
    ('robi', 'Robi 1000 Minutes Voice Bundle', '0 GB', 1000, 0, 599.00, 699.00, 30, TRUE, FALSE, 14, 50.00, NULL, 'voice', 'BEST VALUE'),

    -- Banglalink Offers
    ('banglalink', 'Banglalink 45 GB + 750 Mins Power Pack', '45 GB', 750, 0, 549.00, 699.00, 30, TRUE, TRUE, 21, 130.00, NOW() + INTERVAL '12 hours', 'combo', 'FLASH SALE'),
    ('banglalink', 'Banglalink 25 GB 30 Days Pack', '25 GB', 0, 0, 349.00, 399.00, 30, TRUE, FALSE, 12, 10.00, NULL, 'internet', 'STANDARD'),
    ('banglalink', 'Banglalink 400 Mins 30 Days Voice', '0 GB', 400, 0, 247.00, 280.00, 30, TRUE, FALSE, 11, 0.00, NULL, 'voice', 'SAVER'),

    -- Airtel Offers
    ('airtel', 'Airtel 55 GB + 850 Mins Super Drive', '55 GB', 850, 100, 568.00, 698.00, 30, TRUE, TRUE, 18, 140.00, NOW() + INTERVAL '30 hours', 'combo', 'SUPER DRIVE'),
    ('airtel', 'Airtel 35 GB 30 Days Blast', '35 GB', 0, 0, 388.00, 448.00, 30, TRUE, FALSE, 13, 25.00, NULL, 'internet', 'YOUTH PACK'),

    -- Teletalk Offers
    ('teletalk', 'Teletalk Bornomala 30 GB Pack', '30 GB', 0, 0, 290.00, 350.00, 30, TRUE, FALSE, 17, 10.00, NULL, 'internet', 'STUDENT'),
    ('teletalk', 'Teletalk 500 Mins + 10 GB Combo', '10 GB', 500, 100, 380.00, 450.00, 30, TRUE, TRUE, 15, 60.00, NOW() + INTERVAL '36 hours', 'combo', 'DRIVE')
ON CONFLICT DO NOTHING;

-- 3. SEED FAQS
INSERT INTO public.faqs (question, answer, category, sort_order, is_active)
VALUES
    ('অফারহুট থেকে অফার কিনলে সিম প্যাক কতক্ষণে সক্রিয় হয়?', 'সাধারণত পেমেন্ট সম্পন্ন হওয়ার ৩ থেকে ১৫ মিনিটের মধ্যে সংশ্লিষ্ট অপারেটর থেকে অফারটি সরাসরি আপনার সিম নম্বরে চালু হয়ে যায়।', 'General', 1, TRUE),
    ('ড্রাইভ অফার (Drive Offer) কী এবং এতে ক্যাশব্যাক কীভাবে পাওয়া যায়?', 'ড্রাইভ অফার হলো নির্দিষ্ট অপারেটরের বিশেষ ছাড়যুক্ত বান্ডেল অফার। ড্রাইভ অফার সফলভাবে চালু হওয়ার সাথে সাথেই প্রতিশ্রুত ক্যাশব্যাকের টাকা আপনার অফারহুট ওয়ালেটে স্বয়ংক্রিয়ভাবে জমা হয়ে যাবে।', 'Drive Offers', 2, TRUE),
    ('পেমেন্ট কেটে নেওয়া হয়েছে কিন্তু অফার চালু না হলে কী করব?', 'যদি কোনো কারণে ১০-১৫ মিনিটের মধ্যে অফার চালু না হয়, তবে আমাদের লাইভ চ্যাটে অর্ডার আইডি দিন। আমাদের সাপোর্ট টিম দ্রুত যাচাই করে অফার চালু করে দেবে অথবা পুরো টাকা আপনার ওয়ালেটে রিফান্ড করে দেবে।', 'Payment & Refund', 3, TRUE),
    ('বিকাশ ও নগদে পেমেন্ট করার প্রক্রিয়া কতটা নিরাপদ?', 'অফারহুটে বিকাশ বা নগদের অফিসিয়াল সিকিউরড পেমেন্ট গেটওয়ের মাধ্যমে পেমেন্ট সম্পন্ন হয়। অ্যাপে আপনার পিন বা ওটিপি কখনোই সংরক্ষিত বা চাওয়া হয় না।', 'Security', 4, TRUE),
    ('রেফার অ্যান্ড আর্ন এর বোনাস কীভাবে পাওয়া যায়?', 'আপনার রেফারেল কোড ব্যবহার করে কোনো বন্ধু প্রথমবার সাইন-আপ করে অফার কিনলে আপনি ও আপনার বন্ধু উভয়েই ওয়ালেট বোনাস পাবেন।', 'Referral', 5, TRUE)
ON CONFLICT DO NOTHING;
