import express from 'express';
import { supabase, supabaseAdmin } from '../config/supabase.js';
import { sendOtpSms } from '../services/smsService.js';

const router = express.Router();

// In-memory OTP store (phone -> { otp, expiresAt, verified })
const otpStore = new Map();

// Helper: Normalize Bangladesh phone number (ensure 01XXXXXXXXX)
const normalizePhone = (phone) => {
  if (!phone) return '';
  let clean = phone.replace(/[^0-9]/g, '');
  if (clean.startsWith('880')) clean = clean.substring(2);
  if (!clean.startsWith('0')) clean = '0' + clean;
  return clean;
};

// 1. Send OTP (Sign Up, Login, Forgot Password)
router.post('/send-otp', async (req, res) => {
  try {
    const { phone, reason } = req.body;
    const cleanPhone = normalizePhone(phone);

    if (!cleanPhone || cleanPhone.length !== 11) {
      return res.status(400).json({ error: 'Valid 11-digit Bangladeshi mobile number required (01XXXXXXXXX)' });
    }

    // Generate 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    otpStore.set(cleanPhone, { otp, expiresAt, verified: false });

    // Send SMS via SMS gateway
    await sendOtpSms(cleanPhone, otp);

    res.json({
      success: true,
      message: 'OTP sent successfully',
      phone: cleanPhone,
      expiresIn: 300,
      // For development convenience, include OTP in response if in mock mode
      ...(process.env.NODE_ENV !== 'production' && { devOtp: otp })
    });
  } catch (err) {
    console.error('[Auth Route] Send OTP Error:', err);
    res.status(500).json({ error: 'Failed to dispatch OTP SMS' });
  }
});

// 2. Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { phone, otp } = req.body;
    const cleanPhone = normalizePhone(phone);

    const record = otpStore.get(cleanPhone);
    if (!record) {
      return res.status(400).json({ error: 'No OTP request found for this number' });
    }

    if (Date.now() > record.expiresAt) {
      otpStore.delete(cleanPhone);
      return res.status(400).json({ error: 'OTP has expired. Please request a new code.' });
    }

    // Match OTP (or allow 123456 in dev mode)
    const isMasterDevOtp = process.env.NODE_ENV !== 'production' && otp === '123456';
    if (record.otp !== otp && !isMasterDevOtp) {
      return res.status(400).json({ error: 'Incorrect OTP code. Please try again.' });
    }

    record.verified = true;
    otpStore.set(cleanPhone, record);

    res.json({
      success: true,
      message: 'OTP verified successfully',
      phone: cleanPhone
    });
  } catch (err) {
    res.status(500).json({ error: 'OTP verification failed' });
  }
});

// 3. Complete Sign Up (Phone + Password + Name + optional Referral Code)
router.post(['/signup', '/register'], async (req, res) => {
  try {
    const phone = req.body.phone || req.body.phone_number;
    const { password, full_name, referral_code } = req.body;
    const cleanPhone = normalizePhone(phone);

    if (!cleanPhone || cleanPhone.length !== 11) {
      return res.status(400).json({ error: 'Valid 11-digit phone number is required' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const { data, error } = await supabase.rpc('register_user', {
      p_full_name: full_name || 'Mobixa Member',
      p_phone: cleanPhone,
      p_password: password,
      p_referral_code: referral_code || null
    });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    if (!data || !data.success) {
      return res.status(400).json({ error: data?.message || 'Registration failed' });
    }

    res.status(201).json({
      success: true,
      message: data.message,
      user: data.user,
      token: `mobixa_token_${data.user.id}`
    });
  } catch (err) {
    console.error('[Auth Route] Sign up error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// 4. Login (Phone + Password)
router.post('/login', async (req, res) => {
  try {
    const phone = req.body.phone || req.body.phone_number;
    const { password } = req.body;
    const cleanPhone = normalizePhone(phone);

    if (!cleanPhone || cleanPhone.length !== 11) {
      return res.status(400).json({ error: 'সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন' });
    }
    if (!password) {
      return res.status(400).json({ error: 'পাসওয়ার্ড দিন' });
    }

    const { data, error } = await supabase.rpc('authenticate_user', {
      p_phone: cleanPhone,
      p_password: password
    });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    if (!data || !data.success) {
      return res.status(401).json({ error: data?.message || 'ভুল মোবাইল নম্বর বা পাসওয়ার্ড' });
    }

    res.json({
      success: true,
      message: data.message,
      user: data.user,
      token: `mobixa_token_${data.user.id}`
    });
  } catch (err) {
    console.error('[Auth Route] Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// 5. Reset Password
router.post('/reset-password', async (req, res) => {
  try {
    const { phone, otp, new_password } = req.body;
    const cleanPhone = normalizePhone(phone);

    const record = otpStore.get(cleanPhone);
    const isMasterDevOtp = process.env.NODE_ENV !== 'production' && otp === '123456';

    if (!record && !isMasterDevOtp) {
      return res.status(400).json({ error: 'Please verify OTP before resetting password' });
    }

    if (new_password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const emailEquivalent = `${cleanPhone}@offerhut.com.bd`;

    // Fetch user by email via admin
    const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = users?.find(u => u.email === emailEquivalent);

    if (!existingUser) {
      return res.status(404).json({ error: 'No account registered with this phone number' });
    }

    await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
      password: new_password
    });

    otpStore.delete(cleanPhone);

    res.json({
      success: true,
      message: 'Password updated successfully. You can now login with your new password.'
    });
  } catch (err) {
    res.status(500).json({ error: 'Password reset failed' });
  }
});

export default router;
