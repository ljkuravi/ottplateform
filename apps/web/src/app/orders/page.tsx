'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  ShoppingBag,
  Eye,
  MessageSquare,
  AlertTriangle,
  Star,
  Copy,
  Check,
  X,
  ShieldCheck,
  Clock,
  Sparkles,
} from 'lucide-react';

export default function OrdersPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [credentialsModalOpen, setCredentialsModalOpen] = useState(false);
  const [disputeModalOpen, setDisputeModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Dispute form state
  const [disputeReason, setDisputeReason] = useState('ACCESS_NOT_WORKING');
  const [disputeDetails, setDisputeDetails] = useState('');
  const [isSubmittingDispute, setIsSubmittingDispute] = useState(false);

  // Review form state
  const [rating, setRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders');
      if (res.success && res.data) {
        setOrders(res.data.data || []);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const handleOpenCredentials = async (orderId: string) => {
    try {
      const res = await api.get(`/orders/${orderId}`);
      if (res.success && res.data) {
        setSelectedOrder(res.data);
        setCredentialsModalOpen(true);
      }
    } catch (err: any) {
      alert(err.message || 'Could not fetch credentials');
    }
  };

  const handleCopyCredentials = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmitDispute = async () => {
    if (!selectedOrder || !disputeDetails.trim()) {
      alert('Please provide details for the dispute.');
      return;
    }

    setIsSubmittingDispute(true);
    try {
      const res = await api.post('/refunds', {
        orderId: selectedOrder.id,
        reason: disputeReason,
        details: disputeDetails.trim(),
      });

      if (res.success) {
        alert('Dispute submitted to Admin team. We will review your claim.');
        setDisputeModalOpen(false);
        setDisputeDetails('');
        await fetchOrders();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to submit refund claim');
    } finally {
      setIsSubmittingDispute(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!selectedOrder) return;
    setIsSubmittingReview(true);
    try {
      const res = await api.post('/reviews', {
        orderId: selectedOrder.id,
        rating,
        title: reviewTitle.trim() || undefined,
        comment: reviewComment.trim() || undefined,
      });

      if (res.success) {
        alert('Thank you for rating your seller!');
        setReviewModalOpen(false);
        setReviewTitle('');
        setReviewComment('');
        await fetchOrders();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to submit review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-white">Please log in to view your subscriptions</h2>
        <Link href="/login" className="mt-4 inline-block px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold">
          Log In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex flex-col space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">My Purchased Subscriptions</h1>
        <p className="text-sm text-slate-400 mt-1">
          Access your digital credentials, chat with sellers, or submit replacement disputes.
        </p>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-slate-400 text-xs">Loading your orders...</div>
      ) : orders.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl border border-surface-300/40 text-center flex flex-col items-center">
          <ShoppingBag className="w-12 h-12 text-slate-400 mb-3" />
          <h3 className="text-lg font-bold text-white">No subscriptions purchased yet</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            Browse verified listings from top sellers with instant delivery and escrow protection.
          </p>
          <Link
            href="/browse"
            className="mt-5 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-xs font-semibold text-white shadow-glow"
          >
            Explore Marketplace
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const firstItem = order.items?.[0];
            return (
              <div
                key={order.id}
                className="glass-card p-6 rounded-3xl border border-surface-300/40 flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                {/* Left Product Details */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-surface-100 text-brand-300 border border-surface-300/40">
                      #{order.orderNumber}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                        order.status === 'DELIVERED' || order.status === 'COMPLETED' || order.status === 'ACTIVE'
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                          : order.status === 'REFUND_REQUESTED'
                          ? 'bg-amber-950/80 text-amber-300 border border-amber-800'
                          : 'bg-surface-100 text-slate-300'
                      }`}
                    >
                      {order.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white">
                    {firstItem?.listingTitle || 'Digital Subscription'}
                  </h3>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                    <span>Plan: <strong className="text-slate-200">{firstItem?.planName}</strong></span>
                    <span>&bull;</span>
                    <span>Duration: <strong className="text-slate-200">{firstItem?.durationMonths} Mo</strong></span>
                    <span>&bull;</span>
                    <span>Seller: <strong className="text-slate-200">{order.seller?.displayName}</strong></span>
                    <span>&bull;</span>
                    <span>Purchased: {formatDate(order.createdAt)}</span>
                  </div>
                </div>

                {/* Right Price & Action Buttons */}
                <div className="flex flex-col md:items-end gap-3 shrink-0">
                  <div className="text-lg font-extrabold text-white">
                    {formatCurrency(order.totalAmount)}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* View Credentials */}
                    <button
                      onClick={() => handleOpenCredentials(order.id)}
                      className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-500 hover:from-brand-500 hover:to-indigo-400 text-white text-xs font-bold shadow-glow flex items-center gap-1.5 transition-all"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View Access
                    </button>

                    {/* Chat with Seller */}
                    <Link
                      href="/chats"
                      className="px-3 py-2 rounded-xl bg-surface-100 hover:bg-surface-200 border border-surface-300/50 text-xs font-semibold text-slate-200 hover:text-white flex items-center gap-1.5 transition-all"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                      Chat
                    </Link>

                    {/* Review Button */}
                    {!order.review && (
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setReviewModalOpen(true);
                        }}
                        className="px-3 py-2 rounded-xl bg-surface-100 hover:bg-surface-200 border border-surface-300/50 text-xs font-semibold text-amber-300 hover:text-amber-200 flex items-center gap-1.5 transition-all"
                      >
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        Review
                      </button>
                    )}

                    {/* Dispute Button */}
                    {!order.refund && order.status !== 'REFUNDED' && (
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setDisputeModalOpen(true);
                        }}
                        className="px-3 py-2 rounded-xl bg-surface-100 hover:bg-rose-950/40 border border-surface-300/50 text-xs font-medium text-slate-400 hover:text-rose-300 flex items-center gap-1.5 transition-all"
                        title="Report an issue or request refund"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Dispute
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View Credentials Modal */}
      {credentialsModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl glass-panel border border-surface-300/60 p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-surface-300/40">
              <div>
                <span className="text-[11px] font-mono text-brand-400 uppercase tracking-wider">
                  Order #{selectedOrder.orderNumber}
                </span>
                <h3 className="text-lg font-bold text-white">Access Credentials</h3>
              </div>
              <button
                onClick={() => setCredentialsModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Decrypted Payload Box */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">
                Decrypted Login / Invite Details
              </label>
              <div className="relative p-4 rounded-2xl bg-surface-100/90 border border-surface-300/60 font-mono text-xs text-white whitespace-pre-wrap break-all leading-relaxed">
                {selectedOrder.decryptedDeliveryData || 'No credentials found'}
                <button
                  onClick={() =>
                    handleCopyCredentials(selectedOrder.decryptedDeliveryData || '')
                  }
                  className="absolute top-3 right-3 p-2 rounded-lg bg-surface-200 hover:bg-surface-300 text-slate-300 hover:text-white flex items-center gap-1 text-[11px] font-sans"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Delivery Notes */}
            {selectedOrder.deliveryNotes && (
              <div className="p-3.5 rounded-2xl bg-surface-100 border border-surface-300/40 text-xs text-slate-300">
                <span className="text-slate-400 text-[10px] block uppercase font-bold mb-0.5">
                  Delivery Notes
                </span>
                {selectedOrder.deliveryNotes}
              </div>
            )}

            <div className="p-3 rounded-xl bg-brand-950/40 border border-brand-800/50 text-[11px] text-slate-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-400 shrink-0" />
              <span>
                Protected under SubVault 48h Warranty. If you face any login or profile issues, contact seller via chat.
              </span>
            </div>

            <button
              onClick={() => setCredentialsModalOpen(false)}
              className="w-full py-3 rounded-xl bg-surface-100 hover:bg-surface-200 text-white text-xs font-bold transition-all"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Dispute Modal */}
      {disputeModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl glass-panel border border-surface-300/60 p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-surface-300/40">
              <h3 className="text-base font-bold text-white">Report an Issue / Dispute</h3>
              <button
                onClick={() => setDisputeModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Reason</label>
              <select
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                className="w-full bg-surface-100 border border-surface-300/60 rounded-xl px-3 py-2 text-xs text-slate-200"
              >
                <option value="ACCESS_NOT_WORKING">Access / Password Not Working</option>
                <option value="INCORRECT_PRODUCT">Incorrect Plan / Product Delivered</option>
                <option value="DELIVERY_MISSING">Delivery Details Missing / Incomplete</option>
                <option value="EXPIRED_ACCESS">Account Expired Early</option>
                <option value="OTHER">Other Issue</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Details & Evidence</label>
              <textarea
                rows={4}
                value={disputeDetails}
                onChange={(e) => setDisputeDetails(e.target.value)}
                placeholder="Explain what happened so our moderation team can inspect and resolve..."
                className="w-full bg-surface-100 border border-surface-300/60 rounded-xl p-3 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-brand-500"
              />
            </div>

            <button
              disabled={isSubmittingDispute}
              onClick={handleSubmitDispute}
              className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-glow transition-all disabled:opacity-50"
            >
              {isSubmittingDispute ? 'Filing Claim...' : 'Submit Dispute to Admin'}
            </button>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl glass-panel border border-surface-300/60 p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-surface-300/40">
              <h3 className="text-base font-bold text-white">Rate & Review Seller</h3>
              <button
                onClick={() => setReviewModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stars Selector */}
            <div className="flex items-center justify-center gap-2 py-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  onClick={() => setRating(s)}
                  className="p-1 text-2xl transition-transform hover:scale-125"
                >
                  <Star
                    className={`w-7 h-7 ${
                      s <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-400'
                    }`}
                  />
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Title</label>
              <input
                type="text"
                value={reviewTitle}
                onChange={(e) => setReviewTitle(e.target.value)}
                placeholder="e.g. Super fast delivery and working 4K!"
                className="w-full bg-surface-100 border border-surface-300/60 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Review</label>
              <textarea
                rows={3}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Share your experience with this seller..."
                className="w-full bg-surface-100 border border-surface-300/60 rounded-xl p-3 text-xs text-white"
              />
            </div>

            <button
              disabled={isSubmittingReview}
              onClick={handleSubmitReview}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-500 hover:from-brand-500 hover:to-indigo-400 text-white font-bold text-xs shadow-glow transition-all disabled:opacity-50"
            >
              {isSubmittingReview ? 'Submitting...' : 'Post Review'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
