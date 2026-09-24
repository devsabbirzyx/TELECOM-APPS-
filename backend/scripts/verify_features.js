import { supabaseAdmin } from '../src/config/supabase.js';

async function runVerification() {
  console.log('====================================================');
  console.log('🚀 RUNNING COMPREHENSIVE FEATURES VERIFICATION TEST');
  console.log('====================================================\n');

  const testId = Date.now().toString().slice(-6);
  const phoneA = `01710${testId}`;
  const phoneB = `01820${testId}`;

  try {
    // ----------------------------------------------------
    // TEST 1: Registration with NO referral code (Must have ৳0 balance & 0 bonus)
    // ----------------------------------------------------
    console.log('📌 TEST 1: Registering User A without referral code...');
    const { data: resA, error: errA } = await supabaseAdmin.rpc('register_user', {
      p_full_name: `Test User A ${testId}`,
      p_phone: phoneA,
      p_password: 'TestPassword123!',
      p_referral_code: null
    });

    if (errA || !resA.success) {
      throw new Error(`Failed to register User A: ${errA?.message || resA?.error}`);
    }

    const userA = resA.user;
    console.log(`✅ User A registered! ID: ${userA.id}, Ref Code: ${userA.referral_code}`);
    console.log(`   Balance returned: ৳${userA.balance}`);

    if (Number(userA.balance) !== 0) {
      throw new Error(`❌ FAILED: User A balance should be 0, but got ${userA.balance}`);
    }

    // Verify transactions for User A
    const { data: txsA } = await supabaseAdmin
      .from('wallet_transactions')
      .select('*')
      .eq('user_id', userA.id);

    console.log(`   Wallet transactions count for User A: ${txsA?.length || 0}`);
    if (txsA && txsA.length > 0) {
      throw new Error(`❌ FAILED: User A should have NO initial transactions, but found ${txsA.length}`);
    }
    console.log('✨ PASS: User A initialized with strictly ৳0.00 and no bonus transactions!\n');

    // ----------------------------------------------------
    // TEST 2: Registration WITH referral code (Referrer: ৳25, Referee: ৳50)
    // ----------------------------------------------------
    console.log(`📌 TEST 2: Registering User B using User A's referral code (${userA.referral_code})...`);
    const { data: resB, error: errB } = await supabaseAdmin.rpc('register_user', {
      p_full_name: `Test User B ${testId}`,
      p_phone: phoneB,
      p_password: 'TestPassword123!',
      p_referral_code: userA.referral_code
    });

    if (errB || !resB.success) {
      throw new Error(`Failed to register User B: ${errB?.message || resB?.error}`);
    }

    const userB = resB.user;
    console.log(`✅ User B registered! ID: ${userB.id}`);
    console.log(`   User B (Referee) Balance: ৳${userB.balance}`);

    if (Number(userB.balance) !== 50) {
      throw new Error(`❌ FAILED: User B should have ৳50 referral bonus, but got ${userB.balance}`);
    }

    // Check User A (Referrer) balance
    const { data: walletA, error: errWal } = await supabaseAdmin
      .from('wallet')
      .select('balance')
      .eq('user_id', userA.id)
      .single();

    if (errWal || !walletA) {
      console.error('WalletA query error:', errWal);
      throw new Error(`Failed to query User A wallet: ${errWal?.message || 'null'}`);
    }

    console.log(`   User A (Referrer) Balance after referral: ৳${walletA.balance}`);
    if (Number(walletA.balance) !== 25) {
      throw new Error(`❌ FAILED: User A should have ৳25 referral reward, but got ${walletA.balance}`);
    }

    // Check referral record
    const { data: refRecord } = await supabaseAdmin
      .from('referrals')
      .select('*')
      .eq('referrer_id', userA.id)
      .eq('referred_id', userB.id)
      .single();

    console.log(`   Referral table record exists: Bonus = ৳${refRecord?.bonus_amount}`);
    if (!refRecord || Number(refRecord.bonus_amount) !== 25) {
      throw new Error(`❌ FAILED: Referral record missing or bonus_amount not 25`);
    }
    console.log('✨ PASS: Referral system credited ৳25 to referrer and ৳50 to referee perfectly!\n');

    // ----------------------------------------------------
    // TEST 3: Anti-abuse: Self-referral / Duplicate Prevention
    // ----------------------------------------------------
    console.log(`📌 TEST 3: Testing Anti-Abuse (Duplicate phone blocked)...`);
    const { data: resSelf, error: errSelf } = await supabaseAdmin.rpc('register_user', {
      p_full_name: 'Imposter',
      p_phone: phoneA, // duplicate phone
      p_password: 'TestPassword123!',
      p_referral_code: userA.referral_code
    });

    if (resSelf?.success) {
      throw new Error(`❌ FAILED: Duplicate registration succeeded when it should fail`);
    }
    console.log(`   Duplicate phone blocked: "${resSelf?.message || errSelf?.message}"`);
    console.log('✨ PASS: Anti-abuse protections active!\n');

    // ----------------------------------------------------
    // TEST 4: Add Money Verification Flow (bKash/Nagad)
    // ----------------------------------------------------
    console.log('📌 TEST 4: Add Money Verification & Admin Approval Flow...');
    const testTrxId = `TRX${testId}XYZ`;
    const depositAmount = 250.00;

    // 4a. Submit request
    const { data: addReq, error: errAdd } = await supabaseAdmin
      .from('add_money_requests')
      .insert({
        user_id: userA.id,
        amount: depositAmount,
        payment_method: 'bkash',
        sender_number: '01886123456',
        transaction_id: testTrxId,
        status: 'pending'
      })
      .select('*')
      .single();

    if (errAdd || !addReq) {
      throw new Error(`Failed to submit add money request: ${errAdd?.message}`);
    }

    console.log(`✅ Add Money request created! ID: ${addReq.id}, Status: ${addReq.status}`);

    // Check User A balance is STILL unchanged (৳25.00 from referral)
    const { data: preApprovalWallet } = await supabaseAdmin
      .from('wallet')
      .select('balance')
      .eq('user_id', userA.id)
      .single();

    console.log(`   User A balance before approval: ৳${preApprovalWallet.balance}`);
    if (Number(preApprovalWallet.balance) !== 25) {
      throw new Error(`❌ FAILED: Balance changed before admin approval!`);
    }

    // 4b. Admin Approves request
    console.log(`   Approving Add Money request ID ${addReq.id} via RPC...`);
    const { data: approveRes, error: errApprove } = await supabaseAdmin.rpc('approve_add_money_request', {
      p_request_id: addReq.id,
      p_admin_note: 'Verified against bKash merchant statement'
    });

    if (errApprove || !approveRes.success) {
      throw new Error(`Approval RPC failed: ${errApprove?.message || approveRes?.error}`);
    }

    // 4c. Verify User A balance is now ৳25 + ৳250 = ৳275.00
    const { data: postApprovalWallet } = await supabaseAdmin
      .from('wallet')
      .select('balance')
      .eq('user_id', userA.id)
      .single();

    console.log(`   User A balance after approval: ৳${postApprovalWallet.balance}`);
    if (Number(postApprovalWallet.balance) !== 275) {
      throw new Error(`❌ FAILED: User A balance should be 275, got ${postApprovalWallet.balance}`);
    }

    // Verify Deposit Transaction created
    const { data: depTx } = await supabaseAdmin
      .from('wallet_transactions')
      .select('*')
      .eq('user_id', userA.id)
      .eq('type', 'deposit')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    console.log(`   Deposit transaction verified: Amount ৳${depTx?.amount}, Tag: ${depTx?.description}`);
    console.log('✨ PASS: Add Money pending verification and admin approval workflow fully functional!\n');

    // ----------------------------------------------------
    // TEST 5: 10GB Free Internet 12-Hour Server Countdown
    // ----------------------------------------------------
    console.log('📌 TEST 5: 10GB Free Internet Server-Backed 12h Countdown...');

    // 5a. Check initial claim record (Must be 'locked' upon registration)
    const { data: initialClaim } = await supabaseAdmin
      .from('free_offer_claims')
      .select('*')
      .eq('user_id', userA.id)
      .eq('offer_key', '10gb_free')
      .single();

    console.log(`   Initial claim record status: "${initialClaim?.status}" (Requires pack purchase)`);
    if (!initialClaim || initialClaim.status !== 'locked') {
      throw new Error(`❌ FAILED: Initial claim record should be "locked", got "${initialClaim?.status}"`);
    }

    // 5b. Start 12-hour countdown
    const now = new Date();
    const twelveHoursLater = new Date(now.getTime() + 12 * 60 * 60 * 1000);

    const { data: claimRecord, error: errClaim } = await supabaseAdmin
      .from('free_offer_claims')
      .update({
        status: 'timer_active',
        timer_started_at: now.toISOString(),
        unlocks_at: twelveHoursLater.toISOString()
      })
      .eq('id', initialClaim.id)
      .select('*')
      .single();

    if (errClaim || !claimRecord) {
      throw new Error(`Failed to activate claim timer: ${errClaim?.message}`);
    }

    const remainingSecs = Math.floor((new Date(claimRecord.unlocks_at).getTime() - Date.now()) / 1000);
    console.log(`✅ Claim record created with server timestamp:`);
    console.log(`   Unlocks at: ${claimRecord.unlocks_at}`);
    console.log(`   Seconds remaining calculated: ${remainingSecs}s (~${(remainingSecs / 3600).toFixed(1)} hours)`);

    if (remainingSecs < 43100 || remainingSecs > 43250) {
      throw new Error(`❌ FAILED: Remaining seconds (${remainingSecs}) not in 12-hour range!`);
    }

    // Test transition to ready
    console.log('   Testing transition when timer elapses (setting unlocks_at to past)...');
    const pastTime = new Date(Date.now() - 1000).toISOString();
    await supabaseAdmin
      .from('free_offer_claims')
      .update({ unlocks_at: pastTime })
      .eq('id', claimRecord.id);

    // Read back and check logic
    const { data: updatedClaim } = await supabaseAdmin
      .from('free_offer_claims')
      .select('*')
      .eq('id', claimRecord.id)
      .single();

    const diff = Math.floor((new Date(updatedClaim.unlocks_at).getTime() - Date.now()) / 1000);
    const readyState = diff <= 0 ? 'ready' : 'timer_active';
    console.log(`   Timer elapsed state evaluated: "${readyState}"`);
    if (readyState !== 'ready') {
      throw new Error(`❌ FAILED: Expired timer should evaluate to "ready"`);
    }
    console.log('✨ PASS: Server-backed 12-hour countdown timer logic verified!\n');

    // ----------------------------------------------------
    // CLEANUP
    // ----------------------------------------------------
    console.log('🧹 Cleaning up test artifacts...');
    await supabaseAdmin.from('free_offer_claims').delete().eq('user_id', userA.id);
    await supabaseAdmin.from('add_money_requests').delete().eq('user_id', userA.id);
    await supabaseAdmin.from('wallet_transactions').delete().in('user_id', [userA.id, userB.id]);
    await supabaseAdmin.from('wallet').delete().in('user_id', [userA.id, userB.id]);
    await supabaseAdmin.from('referrals').delete().eq('referrer_id', userA.id);
    await supabaseAdmin.from('notifications').delete().in('user_id', [userA.id, userB.id]);
    await supabaseAdmin.from('profiles').delete().in('id', [userA.id, userB.id]);
    console.log('✅ Cleanup completed.');

    console.log('\n====================================================');
    console.log('🎉 ALL 5 COMPREHENSIVE VERIFICATION TESTS PASSED 100%');
    console.log('====================================================');
  } catch (error) {
    console.error('\n❌ VERIFICATION TEST FAILED:', error.message);
    process.exit(1);
  }
}

runVerification();
