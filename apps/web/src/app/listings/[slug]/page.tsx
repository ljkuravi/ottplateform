'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { useCart } from '@/lib/cart-context';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Star,
  ShieldCheck,
  Zap,
  Monitor,
  CheckCircle2,
  Clock,
  AlertCircle,
  ShoppingBag,
  ArrowRight,
  ChevronRight,
  User,
} from 'lucide-react';

export default function ListingDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const router = useRouter();

  const { user, wallet, refreshProfile } = useAuth();
  const { addToCart, setIsOpen: setCartOpen } = useCart();

  const [listing, setListing] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [agreed, setAgreed] = useState(false);
  const [isBuying, setIsBuying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadListing() {
      try {
        const res = await api.get(`/listings/${slug}`);
        if (res.success && res.data) {
          setListing(res.data);
        }
      } catch {
        setError('Listing could not be loaded.');
      } finally {
        setIsLoading(false);
      }
    }
    if (slug) {
      loadListing();
    }
  }, [slug]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-slate-500 font-medium">
        Loading listing details...
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-slate-900">Listing not found</h2>
        <Link href="/browse" className="mt-4 inline-block text-xs font-bold text-emerald-600 hover:underline">
          Return to Marketplace
        </Link>
      </div>
    );
  }

  const discountPercent =
    listing.originalPrice && listing.originalPrice > listing.price
      ? Math.round(((listing.originalPrice - listing.price) / listing.originalPrice) * 100)
      : null;

  const currentBalance = wallet?.balance || 0;
  const isBalanceSufficient = currentBalance >= listing.price;

  const handleInstantBuy = async () => {
    if (!user) {
      router.push(`/login?redirect=/listings/${listing.slug}`);
      return;
    }

    if (!agreed) {
      setError('You must agree to the marketplace terms before purchasing.');
      return;
    }

    if (!isBalanceSufficient) {
      router.push('/wallet');
      return;
    }

    setError(null);
    setIsBuying(true);

    try {
      const res = await api.post('/orders/checkout', { listingId: listing.id });
      if (res.success && res.data) {
        await refreshProfile();
        router.push(`/orders`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to complete instant purchase.');
    } finally {
      setIsBuying(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex flex-col bg-[#f8fafc] text-slate-900">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 mb-6 flex-wrap">
        <Link href="/" className="hover:text-emerald-600 transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <Link href="/browse" className="hover:text-emerald-600 transition-colors">Marketplace</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <Link href={`/browse?category=${listing.category.slug}`} className="hover:text-emerald-600 transition-colors">
          {listing.category.name}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-900 font-bold truncate max-w-xs">{listing.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Left Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-start gap-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-slate-50 border border-slate-200 p-1.5 shrink-0">
                <img
                  src={listing.platform.logoUrl}
                  alt={listing.platform.name}
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs uppercase tracking-wider font-bold text-emerald-600">
                    {listing.platform.name}
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 font-semibold">
                    {listing.category.name}
                  </span>
                  <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border ${
                    listing.accessType === 'PRIVATE_ACCOUNT' || (listing as any).accountType === 'Private'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-blue-50 text-blue-700 border-blue-200'
                  }`}>
                    {listing.accessType === 'PRIVATE_ACCOUNT' || (listing as any).accountType === 'Private'
                      ? '🔒 Private Account'
                      : '🤝 Shared Account'}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black font-display text-slate-900 mt-1 leading-tight">
                  {listing.title}
                </h1>
                <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-500">
                  <span className="text-slate-800 font-bold">{listing.planName}</span>
                  <span>&bull;</span>
                  <span>{listing.durationMonths} Month(s)</span>
                  <span>&bull;</span>
                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Instant Delivery
                  </span>
                </div>
              </div>
            </div>

            {/* Badges Grid */}
            <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block text-[10px]">Access Type</span>
                <span className="font-bold text-slate-900 capitalize mt-0.5 block">
                  {listing.accessType.replace(/_/g, ' ').toLowerCase()}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block text-[10px]">Quality</span>
                <span className="font-bold text-emerald-600 mt-0.5 block">{listing.quality}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block text-[10px]">Device Limit</span>
                <span className="font-bold text-slate-900 mt-0.5 block">{listing.deviceLimit}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block text-[10px]">Region</span>
                <span className="font-bold text-indigo-600 mt-0.5 block">{listing.region}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900">About this Subscription</h3>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {listing.description}
            </p>

            {listing.instructions && (
              <div className="mt-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900">
                <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-emerald-600" />
                  Activation & Delivery Instructions
                </h4>
                <p className="text-xs text-emerald-950 leading-relaxed">{listing.instructions}</p>
              </div>
            )}

            {listing.terms && (
              <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                  Usage Rules & Seller Terms
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">{listing.terms}</p>
              </div>
            )}
          </div>

          {/* Customer Reviews */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Customer Reviews</h3>
              <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
                <Star className="w-4 h-4 fill-amber-500" />
                <span>{listing.seller.rating.toFixed(1)}</span>
                <span className="text-slate-400 text-xs font-normal">
                  ({listing.reviews?.length || 0} reviews)
                </span>
              </div>
            </div>

            {listing.reviews?.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">
                No reviews yet for this listing. Be the first to purchase and review!
              </p>
            ) : (
              <div className="space-y-4">
                {listing.reviews.map((r: any) => (
                  <div
                    key={r.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center text-[10px] font-bold text-white">
                          {r.buyer?.fullName?.charAt(0) || 'U'}
                        </div>
                        <span className="text-xs font-bold text-slate-900">
                          {r.buyer?.fullName || 'Verified Buyer'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-500" />
                        <span>{r.rating}.0</span>
                      </div>
                    </div>
                    {r.title && <h5 className="text-xs font-bold text-slate-800">{r.title}</h5>}
                    <p className="text-xs text-slate-600 leading-relaxed">{r.comment}</p>
                    <span className="text-[10px] text-slate-400 self-end">
                      {formatDate(r.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Checkout Box */}
        <div className="space-y-6">
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-md sticky top-28 space-y-6">
            {/* Price Display */}
            <div>
              <span className="text-xs text-slate-500 block font-medium">Subscription Price</span>
              <div className="flex items-baseline gap-3 mt-1">
                <span className="text-3xl font-black font-display text-emerald-600">
                  {formatCurrency(listing.price)}
                </span>
                {listing.originalPrice && (
                  <span className="text-sm text-slate-400 line-through">
                    {formatCurrency(listing.originalPrice)}
                  </span>
                )}
                {discountPercent && (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-lg">
                    {discountPercent}% OFF
                  </span>
                )}
              </div>
            </div>

            {/* Seller profile pill */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center font-bold text-white text-sm">
                {listing.seller.displayName.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-slate-900 truncate">
                    {listing.seller.displayName}
                  </span>
                  {listing.seller.isVerified && (
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                  <span className="text-amber-500 font-bold flex items-center gap-0.5">
                    <Star className="w-3 h-3 fill-amber-500" />
                    {listing.seller.rating.toFixed(1)}
                  </span>
                  <span>&bull;</span>
                  <span>{listing.seller.totalSales} sales</span>
                </div>
              </div>
            </div>

            {/* Agreement Checkbox */}
            <div className="pt-2">
              <label className="flex items-start gap-2.5 text-xs text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 mt-0.5"
                />
                <span className="leading-relaxed text-[11px] text-slate-500">
                  By purchasing this listing, you agree to the marketplace terms, 48h replacement policy, and understand digital credentials are strictly for personal use.
                </span>
              </label>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2.5">
              <button
                disabled={isBuying}
                onClick={handleInstantBuy}
                className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
              >
                <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                {isBuying ? 'Authorizing Purchase...' : `Instant Buy (${formatCurrency(listing.price)})`}
              </button>

              <button
                onClick={async () => {
                  await addToCart(listing.id);
                  setCartOpen(true);
                }}
                className="w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-xs font-bold text-slate-800 flex items-center justify-center gap-2 transition-all shadow-xs"
              >
                <ShoppingBag className="w-4 h-4 text-slate-600" />
                Add to Cart
              </button>
            </div>

            {/* Guarantees */}
            <div className="space-y-2 pt-2 border-t border-slate-200 text-[11px] text-slate-500">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>100% Escrow Protection - Funds released only after delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>48-Hour Replacement / Refund Guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
