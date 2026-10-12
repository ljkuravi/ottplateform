'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';
import { useCart } from '@/lib/cart-context';
import { ShieldCheck, Bookmark, ShoppingCart, UserCheck } from 'lucide-react';

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
    createdAt?: string;
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

  const isPrivate = listing.accessType.toLowerCase().includes('private');

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] hover:border-emerald-300 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between h-full group">
      <div>
        {/* Top Header: Time ago & Trusted Host badge + Bookmark */}
        <div className="flex items-center justify-between pb-3 text-xs text-[#64748B]">
          <span className="text-[11px] font-medium">Verified Slot</span>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-[#059669] font-bold text-[11px] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              Trusted Host
            </span>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              className="text-slate-400 hover:text-slate-600 cursor-pointer"
              title="Save listing"
            >
              <Bookmark className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Platform logo & Title */}
        <Link href={`/listings/${listing.slug}`} className="block">
          <div className="flex items-start gap-3 my-2">
            <div className="w-9 h-9 rounded-xl overflow-hidden bg-slate-50 border border-[#E2E8F0] flex-shrink-0 flex items-center justify-center p-0.5 shadow-2xs">
              <img
                src={listing.platform.logoUrl}
                alt={listing.platform.name}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-[#101828] leading-snug group-hover:text-[#059669] transition-colors line-clamp-2">
                {listing.title}
              </h3>
            </div>
          </div>

          {/* Plan & Quality + Account Type badge */}
          <div className="flex flex-wrap items-center gap-2 mt-2 mb-2 text-xs">
            <span className="font-medium text-[#64748B]">
              Plan: <span className="text-[#101828] font-semibold">{listing.quality || '4K Video Quality'}</span>
            </span>
            {isPrivate ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                <UserCheck className="w-3 h-3 text-[#059669]" />
                Private Account
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                🤝 Shared Account
              </span>
            )}
          </div>

          {/* Price & Spec Pills */}
          <div className="flex flex-wrap items-center gap-2 py-2.5 border-t border-slate-100">
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-extrabold text-[#059669]">
                {formatCurrency(listing.price)}
              </span>
              <span className="text-[11px] text-[#64748B] font-medium">
                /{listing.durationMonths === 1 ? 'mo' : `${listing.durationMonths}m`}
              </span>
              {listing.originalPrice && listing.originalPrice > listing.price && (
                <span className="text-[11px] text-[#94A3B8] line-through ml-0.5">
                  {formatCurrency(listing.originalPrice)}
                </span>
              )}
            </div>
            <span className="px-2 py-0.5 rounded bg-slate-100 border border-[#E2E8F0] text-[10px] font-semibold text-[#64748B]">
              {listing.deviceLimit || '1 Seat'}
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-100 border border-[#E2E8F0] text-[10px] font-semibold text-[#64748B] capitalize">
              {accessLabel.toLowerCase()}
            </span>
          </div>
        </Link>
      </div>

      {/* Host details & Bottom buttons */}
      <div className="pt-3 border-t border-slate-100 mt-2 flex flex-col gap-3">
        {/* Host Name, Rating & Online Status */}
        <div className="flex items-center justify-between text-xs">
          <div className="font-semibold text-[#101828] uppercase tracking-tight truncate max-w-[170px]">
            {listing.seller.displayName}{' '}
            <span className="text-amber-500 font-bold">★ {listing.seller.rating.toFixed(1)}</span>{' '}
            <span className="text-[#94A3B8] font-normal">({listing.seller.totalSales})</span>
          </div>
          <span className="text-[10px] font-bold text-[#059669] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            Instant
          </span>
        </div>

        {/* Buttons: Add to Cart and Access Now */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleAddToCart}
            className="py-2 px-3 rounded-xl border border-[#E2E8F0] hover:bg-slate-50 text-xs font-bold text-[#101828] flex items-center justify-center gap-1 transition-all shrink-0 cursor-pointer"
            title="Add to Cart"
          >
            Add <ShoppingCart className="w-3.5 h-3.5 ml-0.5 text-[#64748B]" />
          </button>
          <button
            onClick={handleBuyNow}
            className="flex-1 py-2 px-4 rounded-xl bg-[#059669] hover:bg-[#047857] text-xs font-bold text-white shadow-xs transition-all text-center cursor-pointer active:scale-98"
          >
            Access Now
          </button>
        </div>
      </div>
    </div>
  );
}
