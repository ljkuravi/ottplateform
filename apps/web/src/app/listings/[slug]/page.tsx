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
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-slate-400">
        Loading listing details...
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-white">Listing not found</h2>
        <Link href="/browse" className="mt-4 inline-block text-xs text-brand-400 hover:underline">
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
      setError(err.message || 'Purchase failed.');
    } finally {
      setIsBuying(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex flex-col">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-slate-400 mb-6">
        <Link href="/" className="hover:text-white">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/browse" className="hover:text-white">Marketplace</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href={`/browse?category=${listing.category.slug}`} className="hover:text-white">
          {listing.category.name}
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-white truncate max-w-xs">{listing.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Left Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header Card */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-surface-300/40">
            <div className="flex items-start gap-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-surface-100 border border-surface-300/60 p-2 shrink-0">
                <img
                  src={listing.platform.logoUrl}
                  alt={listing.platform.name}
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase tracking-wider font-bold text-brand-400">
                    {listing.platform.name}
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-surface-100 border border-surface-300/40 text-slate-300 font-medium">
                    {listing.category.name}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 leading-tight">
                  {listing.title}
                </h1>
                <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-400">
                  <span className="text-brand-300 font-semibold">{listing.planName}</span>
                  <span>&bull;</span>
                  <span>{listing.durationMonths} Month(s)</span>
                  <span>&bull;</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Instant Delivery
                  </span>
                </div>
              </div>
            </div>

            {/* Badges Grid */}
            <div className="mt-6 pt-6 border-t border-surface-300/40 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-surface-100 border border-surface-300/40">
                <span className="text-slate-400 block text-[10px]">Access Type</span>
                <span className="font-bold text-white capitalize mt-0.5 block">
                  {listing.accessType.replace(/_/g, ' ').toLowerCase()}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-surface-100 border border-surface-300/40">
                <span className="text-slate-400 block text-[10px]">Quality</span>
                <span className="font-bold text-cyan-300 mt-0.5 block">{listing.quality}</span>
              </div>
              <div className="p-3 rounded-xl bg-surface-100 border border-surface-300/40">
                <span className="text-slate-400 block text-[10px]">Device Limit</span>
                <span className="font-bold text-white mt-0.5 block">{listing.deviceLimit}</span>
              </div>
              <div className="p-3 rounded-xl bg-surface-100 border border-surface-300/40">
                <span className="text-slate-400 block text-[10px]">Region</span>
                <span className="font-bold text-indigo-300 mt-0.5 block">{listing.region}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-surface-300/40 space-y-4">
            <h3 className="text-base font-bold text-white">About this Subscription</h3>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {listing.description}
            </p>

            {listing.instructions && (
              <div className="mt-6 p-4 rounded-2xl bg-brand-950/40 border border-brand-800/60">
                <h4 className="text-xs font-bold text-brand-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  Activation & Delivery Instructions
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">{listing.instructions}</p>
              </div>
            )}

            {listing.terms && (
              <div className="mt-4 p-4 rounded-2xl bg-surface-100 border border-surface-300/40">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Usage Rules & Seller Terms
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">{listing.terms}</p>
              </div>
            )}
          </div>

          {/* Customer Reviews */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-surface-300/40 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-surface-300/40">
              <h3 className="text-base font-bold text-white">Customer Reviews</h3>
              <div className="flex items-center gap-1 text-amber-400 font-bold text-sm">
                <Star className="w-4 h-4 fill-amber-400" />
                <span>{listing.seller.rating.toFixed(1)}</span>
                <span className="text-slate-400 text-xs font-normal">
                  ({listing.reviews?.length || 0} reviews)
                </span>
              </div>
            </div>

            {listing.reviews?.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">
                No reviews yet for this listing. Be the first to purchase and review!
              </p>
            ) : (
              <div className="space-y-4">
                {listing.reviews.map((r: any) => (
                  <div
                    key={r.id}
                    className="p-4 rounded-2xl bg-surface-100 border border-surface-300/30 flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-brand-600 flex items-center justify-center text-[10px] font-bold text-white">
                          {r.buyer?.fullName?.charAt(0) || 'U'}
                        </div>
                        <span className="text-xs font-semibold text-white">
                          {r.buyer?.fullName || 'Verified Buyer'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-amber-400 text-xs font-semibold">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{r.rating}.0</span>
                      </div>
                    </div>
                    {r.title && <h5 className="text-xs font-bold text-slate-200">{r.title}</h5>}
                    <p className="text-xs text-slate-400 leading-relaxed">{r.comment}</p>
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
          <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-surface-300/40 sticky top-28 space-y-6">
            {/* Price Display */}
            <div>
              <span className="text-xs text-slate-400 block font-medium">Subscription Price</span>
              <div className="flex items-baseline gap-3 mt-1">
                <span className="text-3xl font-extrabold text-white">
                  {formatCurrency(listing.price)}
                </span>
                {listing.originalPrice && (
                  <span className="text-sm text-slate-400 line-through">
                    {formatCurrency(listing.originalPrice)}
                  </span>
                )}
                {discountPercent && (
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-800 px-2 py-0.5 rounded-lg">
                    {discountPercent}% OFF
                  </span>
                )}
              </div>
            </div>

            {/* Stock status */}
            <div className="p-3.5 rounded-2xl bg-surface-100 border border-surface-300/40 flex items-center justify-between text-xs">
              <span className="text-slate-400">Available Stock</span>
              <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                {listing.availableStock} seat(s) remaining
              </span>
            </div>

            {/* Seller profile pill */}
            <div className="p-4 rounded-2xl bg-surface-100 border border-surface-300/40 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-700 flex items-center justify-center font-bold text-white text-sm">
                {listing.seller.displayName.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-white truncate">
                    {listing.seller.displayName}
                  </span>
                  {listing.seller.isVerified && (
                    <ShieldCheck className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                  <span className="text-amber-400 flex items-center gap-0.5">
                    <Star className="w-3 h-3 fill-amber-400" />
                    {listing.seller.rating.toFixed(1)}
                  </span>
                  <span>&bull;</span>
                  <span>{listing.seller.totalSales} sales</span>
                </div>
              </div>
            </div>

            {/* Agreement Checkbox */}
            <div className="pt-2">
              <label className="flex items-start gap-2.5 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="rounded bg-surface-100 border-surface-300 text-brand-500 focus:ring-0 mt-0.5"
                />
                <span className="leading-relaxed text-[11px] text-slate-400">
                  By purchasing this listing, you agree to the marketplace terms, 48h replacement policy, and understand digital credentials are strictly for personal use.
                </span>
              </label>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2.5">
              <button
                disabled={isBuying || listing.availableStock < 1}
                onClick={handleInstantBuy}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-500 hover:from-brand-500 hover:to-indigo-400 text-white font-bold text-sm shadow-glow flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
              >
                <Zap className="w-4 h-4 text-amber-300" />
                {isBuying ? 'Authorizing Purchase...' : `Instant Buy (${formatCurrency(listing.price)})`}
              </button>

              <button
                disabled={listing.availableStock < 1}
                onClick={async () => {
                  await addToCart(listing.id);
                  setCartOpen(true);
                }}
                className="w-full py-3 rounded-xl bg-surface-100 hover:bg-surface-200 border border-surface-300/60 text-xs font-semibold text-slate-200 hover:text-white flex items-center justify-center gap-2 transition-all"
              >
                <ShoppingBag className="w-4 h-4" />
                Add to Cart
              </button>
            </div>

            {/* Guarantees */}
            <div className="space-y-2 pt-2 border-t border-surface-300/30 text-[11px] text-slate-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>100% Escrow Protection - Funds released only after delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-400 shrink-0" />
                <span>48-Hour Replacement / Refund Guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
