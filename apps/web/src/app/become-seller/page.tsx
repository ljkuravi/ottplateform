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
  const { user, isSeller, refreshProfile } = useAuth();

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
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-950 border border-brand-800 text-brand-300 text-xs font-semibold shadow-glow">
          <Store className="w-4 h-4 text-brand-400" />
          <span>SubVault Merchant Network</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Become a Verified Seller
        </h1>
        <p className="text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
          List your authorized OTT accounts, AI workspace slots, and design licenses on India&apos;s leading digital marketplace.
        </p>
      </div>

      {/* If Already Approved Seller */}
      {isSeller ? (
        <div className="glass-panel p-8 rounded-3xl border border-emerald-500/40 text-center flex flex-col items-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white">You are an Approved Seller!</h2>
          <p className="text-xs text-slate-400 max-w-md">
            Your merchant privileges are active. Access your sales dashboard to publish listings and manage orders.
          </p>
          <Link
            href="/seller"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-500 hover:from-brand-500 hover:to-indigo-400 text-white font-bold text-xs shadow-glow flex items-center gap-2"
          >
            <span>Open Seller Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : applicationStatus?.status === 'PENDING' ? (
        /* If Application Pending Review */
        <div className="glass-panel p-8 rounded-3xl border border-amber-500/40 text-center flex flex-col items-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-950/80 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Clock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white">Application Under Review</h2>
          <p className="text-xs text-slate-400 max-w-md">
            Your application for display name <strong className="text-white">&ldquo;{applicationStatus.displayName}&rdquo;</strong> is currently being reviewed by our compliance team. You will receive an instant notification once approved.
          </p>
        </div>
      ) : (
        /* Application Form */
        <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-surface-300/40 space-y-8">
          <div className="border-b border-surface-300/40 pb-4">
            <h3 className="text-lg font-bold text-white">Merchant Application Form</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Fill in your business details. Admin review takes under 2 hours.
            </p>
          </div>

          {!user ? (
            <div className="p-6 rounded-2xl bg-surface-100 border border-surface-300/40 text-center space-y-3">
              <p className="text-xs text-slate-300">
                You must have a SubVault account to submit a seller application.
              </p>
              <div className="flex items-center justify-center gap-3">
                <Link
                  href="/login?redirect=/become-seller"
                  className="px-4 py-2 rounded-xl bg-surface-200 text-white text-xs font-semibold hover:bg-surface-300"
                >
                  Log In
                </Link>
                <Link
                  href="/signup?redirect=/become-seller"
                  className="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold hover:bg-brand-500"
                >
                  Create Account
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{error}</span>
                </div>
              )}

              {message && (
                <div className="p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{message}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300 block">
                    Seller Display Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CloudPass Hub, StreamVault"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full bg-surface-100 border border-surface-300/60 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300 block">
                    Contact Phone (WhatsApp) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+91 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-surface-100 border border-surface-300/60 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 block">
                  About Your Reseller Business / Bio *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe what digital products you specialize in (OTT, AI, VPNs) and your replacement guarantee policy..."
                  value={aboutSeller}
                  onChange={(e) => setAboutSeller(e.target.value)}
                  className="w-full bg-surface-100 border border-surface-300/60 rounded-xl p-3.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-brand-500"
                />
              </div>

              {/* Payout Details */}
              <div className="p-5 rounded-2xl bg-surface-100/60 border border-surface-300/40 space-y-4">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Payout Information
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-300 block">
                      Preferred Payout Method
                    </label>
                    <select
                      value={payoutMethod}
                      onChange={(e) => setPayoutMethod(e.target.value)}
                      className="w-full bg-surface-100 border border-surface-300/60 rounded-xl px-3 py-2 text-xs text-white"
                    >
                      <option value="UPI">Instant UPI (Recommended)</option>
                      <option value="BANK">NEFT / IMPS Bank Transfer</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-300 block">
                      UPI ID (Virtual Payment Address)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. mobile@okhdfcbank"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="w-full bg-surface-100 border border-surface-300/60 rounded-xl px-4 py-2 text-xs text-white"
                    />
                  </div>
                </div>

                {payoutMethod === 'BANK' && (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-300 block">
                      Bank Account & IFSC Details
                    </label>
                    <input
                      type="text"
                      placeholder="Bank Name, Account Number, IFSC Code"
                      value={bankDetails}
                      onChange={(e) => setBankDetails(e.target.value)}
                      className="w-full bg-surface-100 border border-surface-300/60 rounded-xl px-4 py-2 text-xs text-white"
                    />
                  </div>
                )}
              </div>

              {/* Terms Checkbox */}
              <div className="pt-2">
                <label className="flex items-start gap-2.5 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="rounded bg-surface-100 border-surface-300 text-brand-500 focus:ring-0 mt-0.5"
                  />
                  <span className="text-[11px] text-slate-400 leading-relaxed">
                    I agree to the SubVault Seller Policy. I certify that all subscriptions, screens, and licenses I list are legally authorized to share or resell, and I will maintain a 48-hour replacement warranty for all buyers.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-500 hover:from-brand-500 hover:to-indigo-400 text-white font-bold text-sm shadow-glow flex items-center justify-center gap-2 transition-all disabled:opacity-50"
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
