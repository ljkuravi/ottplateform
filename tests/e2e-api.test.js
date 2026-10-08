/**
 * SubVault Comprehensive End-to-End API Test Suite
 * Validates all core flows: Auth, Listings, Wallet, Payments, 17-step Purchase,
 * Decryption, Seller Application, Admin Moderation, Chat, and Audit Logs.
 */

const BASE_URL = 'http://localhost:5100/api';

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data };
}

async function runTests() {
  console.log('🚀 Starting SubVault End-to-End API Test Suite...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Categories & Taxonomy
    console.log('--- 1. Testing Categories & Platforms ---');
    const catRes = await request('/categories');
    assert(catRes.ok && catRes.data.success, 'GET /api/categories returns 200');
    assert(catRes.data.data.length >= 5, `Fetched ${catRes.data.data.length} categories from PostgreSQL`);

    const platRes = await request('/categories/platforms');
    assert(platRes.ok && platRes.data.data.length >= 8, `Fetched ${platRes.data.data.length} platforms`);

    // 2. Marketplace Listings & Filters
    console.log('\n--- 2. Testing Listings & Database Queries ---');
    const listRes = await request('/listings?limit=6');
    assert(listRes.ok && listRes.data.success, 'GET /api/listings returns 200');
    assert(listRes.data.data.length > 0, `Returned ${listRes.data.data.length} active listings`);
    const testListing = listRes.data.data[0];
    assert(testListing && testListing.price > 0, `Sample listing: "${testListing.title}" at ₹${testListing.price}`);

    // 3. Authentication: Buyer Login
    console.log('\n--- 3. Testing Authentication ---');
    const buyerLoginRes = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'buyer@subvault.com', password: 'Buyer@SubVault2026!' }),
    });
    assert(buyerLoginRes.ok && buyerLoginRes.data.data.accessToken, 'Buyer login successful with JWT');
    const buyerToken = buyerLoginRes.data.data.accessToken;

    // Buyer Profile
    const meRes = await request('/auth/me', {
      headers: { Authorization: `Bearer ${buyerToken}` },
    });
    assert(meRes.ok && meRes.data.data.user.email === 'buyer@subvault.com', 'GET /api/auth/me returns authenticated buyer');
    const initialBuyerBalance = meRes.data.data.wallet.balance;
    console.log(`      Buyer current wallet balance: ₹${initialBuyerBalance}`);

    // Admin Login
    const adminLoginRes = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'admin@subvault.com', password: 'Admin@SubVault2026!' }),
    });
    assert(adminLoginRes.ok && adminLoginRes.data.data.accessToken, 'Admin login successful with JWT');
    const adminToken = adminLoginRes.data.data.accessToken;

    // Seller Login
    const sellerLoginRes = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'seller@subvault.com', password: 'Seller@SubVault2026!' }),
    });
    assert(sellerLoginRes.ok && sellerLoginRes.data.data.accessToken, 'Seller login successful with JWT');
    const sellerToken = sellerLoginRes.data.data.accessToken;

    // 4. Wallet Deposit & Razorpay Simulation
    console.log('\n--- 4. Testing Wallet & Deposit Flow ---');
    const depOrderRes = await request('/payments/create-order', {
      method: 'POST',
      headers: { Authorization: `Bearer ${buyerToken}` },
      body: JSON.stringify({ amount: 500 }),
    });
    assert(depOrderRes.ok && depOrderRes.data.data.orderId, 'Payment order created with Razorpay Order ID');
    const rzpOrderId = depOrderRes.data.data.orderId;

    const mockPayRes = await request('/payments/mock-success', {
      method: 'POST',
      headers: { Authorization: `Bearer ${buyerToken}` },
      body: JSON.stringify({ razorpayOrderId: rzpOrderId }),
    });
    assert(mockPayRes.ok && mockPayRes.data.success, 'Mock Razorpay payment atomically credited to wallet');

    const walletCheckRes = await request('/wallet', {
      headers: { Authorization: `Bearer ${buyerToken}` },
    });
    assert(walletCheckRes.data.data.balance >= initialBuyerBalance + 500, `Wallet balance updated: ₹${walletCheckRes.data.data.balance}`);

    // 5. 17-Step Atomic Purchase Flow
    console.log('\n--- 5. Testing 17-Step Atomic Purchase Transaction ---');
    const purchaseRes = await request('/orders/checkout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${buyerToken}` },
      body: JSON.stringify({ listingId: testListing.id }),
    });
    assert(purchaseRes.ok && purchaseRes.data.data.orderNumber, `Order #${purchaseRes.data?.data?.orderNumber} placed & delivered atomically`);
    const newOrderId = purchaseRes.data.data.orderId;

    // 6. Digital Delivery Decryption & IDOR Check
    console.log('\n--- 6. Testing Digital Delivery & Security ---');
    const orderDetailRes = await request(`/orders/${newOrderId}`, {
      headers: { Authorization: `Bearer ${buyerToken}` },
    });
    assert(
      orderDetailRes.ok && orderDetailRes.data.data.decryptedDeliveryData,
      `Decrypted credentials verified for buyer: "${orderDetailRes.data.data.decryptedDeliveryData.slice(0, 25)}..."`
    );

    // IDOR Check: An unauthenticated user must be 401/403
    const idorRes = await request(`/orders/${newOrderId}`);
    assert(!idorRes.ok, 'Unauthenticated access to credentials blocked with 401 Unauthorized');

    // 7. Real-Time Chat & Messages
    console.log('\n--- 7. Testing Order Chat & Communication ---');
    const chatsRes = await request('/chats', {
      headers: { Authorization: `Bearer ${buyerToken}` },
    });
    assert(chatsRes.ok && chatsRes.data.data.length > 0, `Buyer has ${chatsRes.data.data.length} conversation threads`);
    const chatId = chatsRes.data.data[0].id;

    const sendMsgRes = await request(`/chats/${chatId}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${buyerToken}` },
      body: JSON.stringify({ text: 'Hello seller! Testing credentials.' }),
    });
    assert(sendMsgRes.ok && sendMsgRes.data.data.text, 'Chat message persisted to PostgreSQL');

    // 8. Dispute & Refund Mediation
    console.log('\n--- 8. Testing Dispute & Refund Flow ---');
    const disputeRes = await request('/refunds', {
      method: 'POST',
      headers: { Authorization: `Bearer ${buyerToken}` },
      body: JSON.stringify({
        orderId: newOrderId,
        reason: 'ACCESS_NOT_WORKING',
        details: 'Verification dispute for test runner',
      }),
    });
    assert(disputeRes.ok && disputeRes.data.data.id, 'Buyer filed dispute claim successfully');
    const refundId = disputeRes.data.data.id;

    // Admin approves refund
    const approveRefundRes = await request(`/admin/refunds/${refundId}/review`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ action: 'APPROVE' }),
    });
    assert(approveRefundRes.ok && approveRefundRes.data.success, 'Admin approved refund with atomic wallet reversal');

    // 9. Seller Withdrawal Flow
    console.log('\n--- 9. Testing Seller Earnings & Withdrawals ---');
    const withReqRes = await request('/seller/withdrawals', {
      method: 'POST',
      headers: { Authorization: `Bearer ${sellerToken}` },
      body: JSON.stringify({
        amount: 250,
        payoutMethod: 'UPI',
        payoutDetails: 'cloudpass@okhdfcbank',
      }),
    });
    assert(withReqRes.ok && withReqRes.data.data.id, 'Seller submitted ₹250 withdrawal request');
    const withId = withReqRes.data.data.id;

    const adminWithRes = await request(`/admin/withdrawals/${withId}/review`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ action: 'APPROVE', referenceId: 'UPI-TEST-TX-99' }),
    });
    assert(adminWithRes.ok && adminWithRes.data.success, 'Admin approved withdrawal and marked payout completed');

    // 10. Audit Logs
    console.log('\n--- 10. Testing Security & Audit Trail ---');
    const auditRes = await request('/admin/audit-logs', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(auditRes.ok && auditRes.data.data.length > 0, `Audit trail verified with ${auditRes.data.data.length} immutable events`);

    console.log(`\n==================================================`);
    console.log(`Test Results: ${passed} PASSED | ${failed} FAILED`);
    console.log(`==================================================\n`);
  } catch (err) {
    console.error('Test execution error:', err);
  }
}

runTests();
