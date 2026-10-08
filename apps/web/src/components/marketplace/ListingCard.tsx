'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';
import { useCart } from '@/lib/cart-context';
import { Star, ShieldCheck, Zap, Monitor, Sparkles, ShoppingBag } from 'lucide-react';

interface ListingCardProps {
  listing: {
    id: string;
    slug: string;
    title: string;
    planName: string;
    durationMonths: number;
    price: number;
    originalPrice?: number | null;
    accessType: string;
    deviceLimit: string;
    quality: string;
    availableStock: number;
    isFeatured?: boolean;
    platform: {
      name: string;
      logoUrl: string;
    };
    category: {
      name: string;
    };
    seller: {
      id: string;
      displayName: string;
      rating: number;
      isVerified: boolean;
      totalSales: number;
    };
  };
}

export function ListingCard({ listing }: { listing: ListingCardProps['listing'] }) {
  const router = useRouter();
  const { addToCart } = useCart();

  const discountPercent = listing.originalPrice && listing.originalPrice > listing.price
    ? Math.round(((listing.originalPrice - listing.price) / listing.originalPrice) * 100)
    : null;

  const accessLabel = listing.accessType.replace(/_/g, ' ');

  const handleBuyNow = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const added = await addToCart(listing.id);
    if (!added) {
      router.push(`/listings/${listing.slug}`);
    }
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await addToCart(listing.id);
  };

  return (
    <div className="group glass-card rounded-2xl overflow-hidden flex flex-col justify-between relative border border-surface-300/40 hover:border-brand-500/50 transition-all duration-300">
      {/* Featured Pill */}
      {listing.isFeatured && (
        <div className="absolute top-3 left-3 z-10 px-2.5 py-0.5 rounded-full bg-brand-600/90 backdrop-blur-sm border border-brand-400 text-white text-[10px] font-bold flex items-center gap-1 shadow-glow">
          <Sparkles className="w-3 h-3 text-amber-300" />
          <span>FEATURED</span>
        </div>
      )}

      {/* Stock status indicator */}
      <div className="absolute top-3 right-3 z-10 px-2 py-0.5 rounded-full bg-surface-50/80 backdrop-blur-sm border border-surface-300/40 text-[11px] font-medium text-slate-300 flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
        <span>{listing.availableStock} in stock</span>
      </div>

      {/* Top Banner & Platform Brand */}
      <Link href={`/listings/${listing.slug}`} className="block p-5 pb-4">
        <div className="flex items-center gap-3.5 mb-3.5">
          <div className="w-12 h-12 rounded-xl overflow-hidden bg-surface-100 border border-surface-300/50 flex-shrink-0 flex items-center justify-center p-1">
            <img
              src={listing.platform.logoUrl}
              alt={listing.platform.name}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-brand-400 block truncate">
              {listing.platform.name}
            </span>
            <h3 className="text-sm font-bold text-white leading-snug line-clamp-2 group-hover:text-brand-300 transition-colors">
              {listing.title}
            </h3>
          </div>
        </div>

        {/* Specs Badges */}
        <div className="flex flex-wrap items-center gap-1.5 my-3">
          <span className="px-2 py-0.5 rounded-md bg-surface-100 border border-surface-300/50 text-[11px] font-medium text-slate-300">
            {listing.durationMonths} {listing.durationMonths === 1 ? 'Month' : 'Months'}
          </span>
          <span className="px-2 py-0.5 rounded-md bg-surface-100 border border-surface-300/50 text-[11px] font-medium text-indigo-300 capitalize">
            {accessLabel.toLowerCase()}
          </span>
          <span className="px-2 py-0.5 rounded-md bg-surface-100 border border-surface-300/50 text-[11px] font-medium text-cyan-300">
            {listing.quality}
          </span>
          <span className="px-2 py-0.5 rounded-md bg-surface-100 border border-surface-300/50 text-[11px] font-medium text-slate-400 flex items-center gap-1">
            <Monitor className="w-3 h-3" />
            {listing.deviceLimit}
          </span>
        </div>

        {/* Pricing Area */}
        <div className="flex items-baseline gap-2 pt-2 border-t border-surface-300/30">
          <span className="text-xl font-extrabold text-white tracking-tight">
            {formatCurrency(listing.price)}
          </span>
          {listing.originalPrice && (
            <span className="text-xs text-slate-400 line-through">
              {formatCurrency(listing.originalPrice)}
            </span>
          )}
          {discountPercent && (
            <span className="ml-auto text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-1.5 py-0.5 rounded-md">
              {discountPercent}% OFF
            </span>
          )}
        </div>
      </Link>

      {/* Seller info & action buttons */}
      <div className="p-4 pt-3 bg-surface-100/50 border-t border-surface-300/30 flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-slate-400 text-[11px]">Seller:</span>
            <span className="font-medium text-slate-200 truncate max-w-[120px]">
              {listing.seller.displayName}
            </span>
            {listing.seller.isVerified && (
              <span title="Verified Reseller">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-400 shrink-0" />
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 text-amber-400 font-semibold text-[11px]">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span>{listing.seller.rating.toFixed(1)}</span>
            <span className="text-slate-400">({listing.seller.totalSales})</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleAddToCart}
            className="py-2 px-3 rounded-xl bg-surface-200 hover:bg-surface-300 border border-surface-300 text-xs font-semibold text-slate-200 hover:text-white flex items-center justify-center gap-1.5 transition-all"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Add to Cart
          </button>
          <button
            onClick={handleBuyNow}
            className="py-2 px-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-500 hover:from-brand-500 hover:to-indigo-400 text-xs font-bold text-white shadow-glow flex items-center justify-center gap-1.5 transition-all"
          >
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}
