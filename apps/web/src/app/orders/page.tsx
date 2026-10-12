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
    } else {
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
        alert('Review submitted! Thank you for your feedback.');
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
        <h2 className="text-xl font-bold text-slate-900">Please log in to view your subscriptions</h2>
        <Link href="/login" className="mt-4 inline-block px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-sm">
          Log In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex flex-col space-y-8 bg-[#f8fafc] text-slate-900">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black font-display text-slate-900 tracking-tight">My Purchased Subscriptions</h1>
        <p className="text-sm text-slate-500 mt-1">
          Access your digital credentials, chat with sellers, or submit replacement disputes.
        </p>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-slate-500 text-xs font-medium">Loading your orders...</div>
      ) : orders.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center flex flex-col items-center shadow-sm">
          <ShoppingBag className="w-12 h-12 text-slate-300 mb-3" />
          <h3 className="text-lg font-bold text-slate-900">No subscriptions purchased yet</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm">
            Browse verified listings from top sellers with instant delivery and escrow protection.
          </p>
          <Link
            href="/browse"
            className="mt-5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white shadow-sm"
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
                className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                {/* Left Product Details */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 font-bold">
                      #{order.orderNumber}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                        order.status === 'DELIVERED' || order.status === 'COMPLETED' || order.status === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : order.status === 'REFUND_REQUESTED'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {order.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">
                    {firstItem?.listingTitle || 'Digital Subscription'}
                  </h3>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span>Plan: <strong className="text-slate-900">{firstItem?.planName}</strong></span>
                    <span>&bull;</span>
                    <span>Duration: <strong className="text-slate-900">{firstItem?.durationMonths} Mo</strong></span>
                    <span>&bull;</span>
                    <span>Seller: <strong className="text-slate-900">{order.seller?.displayName}</strong></span>
                    <span>&bull;</span>
                    <span>Purchased: {formatDate(order.createdAt)}</span>
                  </div>
                </div>

                {/* Right Price & Action Buttons */}
                <div className="flex flex-col md:items-end gap-3 shrink-0">
                  <div className="text-lg font-black text-emerald-600">
                    {formatCurrency(order.totalAmount)}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* View Credentials */}
                    <button
                      onClick={() => handleOpenCredentials(order.id)}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View Access
                    </button>

                    {/* Chat with Seller */}
                    <Link
                      href="/chats"
                      className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-all shadow-xs"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                      Chat
                    </Link>

                    {/* Review Button */}
                    {!order.review && (
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setReviewModalOpen(true);
                        }}
                        className="px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-xs font-bold text-amber-700 flex items-center gap-1.5 transition-all"
                      >
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        Review
                      </button>
                    )}

                    {/* Dispute Button */}
                    {order.status !== 'REFUNDED' && (
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setDisputeModalOpen(true);
                        }}
                        className="px-3 py-2 rounded-xl bg-slate-50 hover:bg-red-50 border border-slate-200 hover:border-red-200 text-xs font-semibold text-slate-600 hover:text-red-700 flex items-center gap-1.5 transition-all"
                        title="Report problem / Ask refund"
                      >
                        <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
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

      {/* Credentials Modal */}
      {credentialsModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 space-y-6 shadow-2xl text-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">Decrypted Subscription Access</h3>
              </div>
              <button
                onClick={() => setCredentialsModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-700">Login / Profile Instructions:</span>
              <div className="relative p-4 rounded-2xl bg-slate-50 border border-slate-200 font-mono text-xs text-slate-900 whitespace-pre-wrap break-all leading-relaxed shadow-inner">
                {selectedOrder.decryptedDeliveryData || 'No credentials found'}
                <button
                  onClick={() =>
                    handleCopyCredentials(selectedOrder.decryptedDeliveryData || '')
                  }
                  className="absolute top-3 right-3 p-2 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 flex items-center gap-1 text-[11px] font-sans font-bold shadow-xs"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Delivery Notes */}
            {selectedOrder.deliveryNotes && (
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                <span className="text-slate-500 text-[10px] block uppercase font-bold mb-0.5">
                  Delivery Notes
                </span>
                {selectedOrder.deliveryNotes}
              </div>
            )}

            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Protected under SubVault 48h Warranty. If you face any login or profile issues, contact seller via chat.
              </span>
            </div>

            <button
              onClick={() => setCredentialsModalOpen(false)}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Dispute Modal */}
      {disputeModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 space-y-5 shadow-2xl text-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Report an Issue / Dispute</h3>
              <button
                onClick={() => setDisputeModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">Reason</label>
              <select
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800"
              >
                <option value="ACCESS_NOT_WORKING">Access / Password Not Working</option>
                <option value="INCORRECT_PRODUCT">Incorrect Plan / Product Delivered</option>
                <option value="DELIVERY_MISSING">Delivery Details Missing / Incomplete</option>
                <option value="EXPIRED_ACCESS">Account Expired Early</option>
                <option value="OTHER">Other Issue</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">Details & Evidence</label>
              <textarea
                rows={4}
                value={disputeDetails}
                onChange={(e) => setDisputeDetails(e.target.value)}
                placeholder="Explain what happened so our moderation team can inspect and resolve..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600"
              />
            </div>

            <button
              disabled={isSubmittingDispute}
              onClick={handleSubmitDispute}
              className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-sm transition-all disabled:opacity-50"
            >
              {isSubmittingDispute ? 'Filing Claim...' : 'Submit Dispute to Admin'}
            </button>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 space-y-5 shadow-2xl text-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Rate & Review Seller</h3>
              <button
                onClick={() => setReviewModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700"
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
                      s <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">Title</label>
              <input
                type="text"
                value={reviewTitle}
                onChange={(e) => setReviewTitle(e.target.value)}
                placeholder="e.g. Super fast delivery and working 4K!"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">Review</label>
              <textarea
                rows={3}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Share your experience with this seller..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900"
              />
            </div>

            <button
              disabled={isSubmittingReview}
              onClick={handleSubmitReview}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all disabled:opacity-50"
            >
              {isSubmittingReview ? 'Submitting...' : 'Post Review'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
