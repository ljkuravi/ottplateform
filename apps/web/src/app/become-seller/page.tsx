'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import {
  Store,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export default function BecomeSellerPage() {
  const router = useRouter();
  const { user, isSeller, isApprovedSeller, setActiveMode, refreshProfile } = useAuth();

  const [applicationStatus, setApplicationStatus] = useState<any | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);

  // Form Fields
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [aboutSeller, setAboutSeller] = useState('');
  const [payoutMethod, setPayoutMethod] = useState('UPI');
  const [upiId, setUpiId] = useState('');
  const [bankDetails, setBankDetails] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadStatus() {
      if (!user) {
        setIsLoadingStatus(false);
        return;
      }
      try {
        const res = await api.get('/seller-applications/my-status');
        if (res.success && res.data) {
          setApplicationStatus(res.data);
        }
      } catch {
        // ignore
      } finally {
        setIsLoadingStatus(false);
      }
    }
    loadStatus();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) {
      setError('You must agree to the Seller Terms of Service');
      return;
    }
    if (!displayName.trim()) {
      setError('Please provide a unique Seller Display Name');
      return;
    }
    if (payoutMethod === 'UPI' && !upiId.trim()) {
      setError('Please enter your UPI ID for payouts');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      const res = await api.post('/seller-applications', {
        fullName: user?.fullName || 'Seller',
        email: user?.email || '',
        phone: phone.trim() || user?.phone || '+919876543210',
        displayName: displayName.trim(),
        aboutSeller: aboutSeller.trim(),
        payoutMethod,
        upiId: upiId.trim(),
        bankDetails: bankDetails.trim() || undefined,
      });

      if (res.success) {
        setMessage('Application submitted! Our administrator will review and approve your account.');
        setApplicationStatus(res.data?.application || { status: 'PENDING' });
        await refreshProfile();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit application');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full flex flex-col space-y-10">
      {/* Top Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
          <Store className="w-4 h-4 text-emerald-600" />
          <span>OTTLY Merchant Network</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Become a Verified Seller
        </h1>
        <p className="text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
          List your authorized OTT accounts, AI workspace slots, and design licenses on India&apos;s leading digital marketplace.
        </p>
      </div>

      {/* If Already Approved Seller */}
      {isApprovedSeller ? (
        <div className="bg-white p-8 rounded-3xl border border-emerald-200 shadow-sm text-center flex flex-col items-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">You are an Approved Seller!</h2>
          <p className="text-xs text-slate-500 max-w-md">
            Your merchant privileges are active. Click below to switch into Seller Mode and access your sales dashboard.
          </p>
          <button
            onClick={() => {
              setActiveMode('SELLER');
              router.push('/seller');
            }}
            className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center gap-2 transition-colors cursor-pointer"
          >
            <span>Switch to Seller Mode</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : applicationStatus?.status === 'PENDING' ? (
        /* If Application Pending Review */
        <div className="bg-white p-8 rounded-3xl border border-amber-200 shadow-sm text-center flex flex-col items-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <Clock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Application Under Review</h2>
          <p className="text-xs text-slate-500 max-w-md">
            Your application for display name <strong className="text-slate-900">&ldquo;{applicationStatus.displayName}&rdquo;</strong> is currently being reviewed by our compliance team. You will receive an instant notification once approved.
          </p>
        </div>
      ) : (
        /* Application Form */
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-sm space-y-8">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-lg font-bold text-slate-900">Merchant Application Form</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Fill in your business details. Admin review takes under 2 hours.
            </p>
          </div>

          {!user ? (
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3">
              <p className="text-xs text-slate-600">
                You must have an OTTLY account to submit a seller application.
              </p>
              <div className="flex items-center justify-center gap-3">
                <Link
                  href="/login?redirect=/become-seller"
                  className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/signup?redirect=/become-seller"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors"
                >
                  Create Account
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{error}</span>
                </div>
              )}

              {message && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                  <span>{message}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Seller Display Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CloudPass Hub, StreamVault"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Contact Phone (WhatsApp) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+91 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 block">
                  About Your Reseller Business / Bio *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe what digital products you specialize in (OTT, AI, VPNs) and your replacement guarantee policy..."
                  value={aboutSeller}
                  onChange={(e) => setAboutSeller(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition-colors"
                />
              </div>

              {/* Payout Details */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Payout Information
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700 block">
                      Preferred Payout Method
                    </label>
                    <select
                      value={payoutMethod}
                      onChange={(e) => setPayoutMethod(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                    >
                      <option value="UPI">Instant UPI (Recommended)</option>
                      <option value="BANK">NEFT / IMPS Bank Transfer</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700 block">
                      UPI ID (Virtual Payment Address)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. mobile@okhdfcbank"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>

                {payoutMethod === 'BANK' && (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700 block">
                      Bank Account & IFSC Details
                    </label>
                    <input
                      type="text"
                      placeholder="Bank Name, Account Number, IFSC Code"
                      value={bankDetails}
                      onChange={(e) => setBankDetails(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                )}
              </div>

              {/* Terms Checkbox */}
              <div className="pt-2">
                <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 mt-0.5"
                  />
                  <span className="text-[11px] text-slate-500 leading-relaxed">
                    I agree to the SubVault Seller Policy. I certify that all subscriptions, screens, and licenses I list are legally authorized to share or resell, and I will maintain a 48-hour replacement warranty for all buyers.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting Application...' : 'Submit Application for Review'}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
