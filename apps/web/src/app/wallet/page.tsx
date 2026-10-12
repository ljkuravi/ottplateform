'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import {
  Wallet as WalletIcon,
  PlusCircle,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  X,
} from 'lucide-react';

export default function WalletPage() {
  const { user, wallet, refreshProfile } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState<number>(500);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [depositStatus, setDepositStatus] = useState<string | null>(null);

  const fetchTransactions = async () => {
    try {
      const res = await api.get('/wallet/transactions');
      if (res.success && res.data) {
        setTransactions(res.data.data || []);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user]);

  const handleDeposit = async () => {
    const amount = customAmount ? parseFloat(customAmount) : depositAmount;
    if (isNaN(amount) || amount < 50) {
      alert('Minimum deposit amount is ₹50');
      return;
    }

    setIsProcessing(true);
    setDepositStatus(null);

    try {
      const orderRes = await api.post('/payments/create-order', { amount });
      if (!orderRes.success || !orderRes.data) {
        throw new Error(orderRes.message || 'Failed to create payment order');
      }

      const orderData = orderRes.data;

      const verifyRes = await api.post('/payments/mock-success', {
        razorpayOrderId: orderData.orderId,
      });

      if (verifyRes.success) {
        setDepositStatus(`₹${amount.toFixed(2)} credited successfully to your wallet!`);
        await refreshProfile();
        await fetchTransactions();
        setTimeout(() => {
          setModalOpen(false);
          setDepositStatus(null);
          setCustomAmount('');
        }, 1500);
      }
    } catch (err: any) {
      setDepositStatus(`Payment failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-slate-900">Please log in to access your wallet</h2>
        <Link href="/login" className="mt-4 inline-block px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-sm">
          Log In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex flex-col space-y-8 bg-[#f8fafc] text-slate-900">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black font-display text-slate-900 tracking-tight">Buyer Wallet</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your funds, add money via UPI / Card, and review your ledger transactions.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm flex items-center justify-center gap-2 transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Money to Wallet</span>
        </button>
      </div>

      {/* Balance Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Available Balance</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <WalletIcon className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-emerald-600 mt-4 tracking-tight">
            {formatCurrency(wallet?.balance || 0)}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold mt-2">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Ready for 1-click subscription purchases</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Deposited</span>
            <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-4 tracking-tight">
            {formatCurrency(wallet?.totalAdded || 0)}
          </div>
          <div className="text-xs text-slate-500 mt-2">
            Lifetime wallet top-ups
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Spent</span>
            <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-rose-600">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-4 tracking-tight">
            {formatCurrency(wallet?.totalSpent || 0)}
          </div>
          <div className="text-xs text-slate-500 mt-2">
            Subscription orders paid
          </div>
        </div>
      </div>

      {/* Transaction Ledger Table */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Immutable Ledger Transactions</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified record of credits, debits, and dispute refunds.
            </p>
          </div>
          <button
            onClick={fetchTransactions}
            className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-slate-500 text-xs font-medium">Loading ledger records...</div>
        ) : transactions.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            No transactions found. Add money to get started!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="pb-3 font-semibold">Type</th>
                  <th className="pb-3 font-semibold">Description</th>
                  <th className="pb-3 font-semibold">Reference</th>
                  <th className="pb-3 font-semibold">Date &amp; Time</th>
                  <th className="pb-3 font-semibold">Balance After</th>
                  <th className="pb-3 font-semibold text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((tx) => {
                  const isCredit = tx.type === 'CREDIT' || tx.type === 'REFUND';
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-md font-semibold text-[10px] ${
                            isCredit
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-rose-100 text-rose-800 border border-rose-200'
                          }`}
                        >
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-3.5 font-semibold text-slate-900 max-w-xs truncate">
                        {tx.description}
                      </td>
                      <td className="py-3.5 text-slate-500 font-mono text-[11px]">
                        {tx.referenceId || 'N/A'}
                      </td>
                      <td className="py-3.5 text-slate-500">
                        {formatDateTime(tx.createdAt)}
                      </td>
                      <td className="py-3.5 text-slate-700 font-medium">
                        {formatCurrency(tx.balanceAfter)}
                      </td>
                      <td
                        className={`py-3.5 text-right font-extrabold ${
                          isCredit ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {isCredit ? '+' : '-'}{formatCurrency(tx.amount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Money Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 space-y-6 shadow-2xl text-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                <h3 className="text-lg font-bold text-slate-900">Top Up Wallet</h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Amount Presets */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-700 block">Select Amount (INR)</label>
              <div className="grid grid-cols-4 gap-2">
                {[100, 200, 500, 1000].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => {
                      setDepositAmount(amt);
                      setCustomAmount('');
                    }}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      depositAmount === amt && !customAmount
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>

              <div className="pt-2">
                <label className="text-xs text-slate-500 block mb-1">Or Enter Custom Amount</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-bold">₹</span>
                  <input
                    type="number"
                    placeholder="e.g. 1500"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-8 pr-4 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Badge */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-600">Gateway</span>
              <span className="font-semibold text-emerald-600">Razorpay UPI &amp; Cards (Sandbox Ready)</span>
            </div>

            {depositStatus && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{depositStatus}</span>
              </div>
            )}

            <button
              disabled={isProcessing}
              onClick={handleDeposit}
              className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
            >
              {isProcessing ? 'Processing Transaction...' : `Deposit ₹${customAmount || depositAmount}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
