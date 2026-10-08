'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/cart-context';
import { useAuth } from '@/lib/auth-context';
import { formatCurrency } from '@/lib/utils';
import { api } from '@/lib/api';
import { X, Trash2, ShoppingBag, ArrowRight, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';

export function CartDrawer() {
  const router = useRouter();
  const { items, subtotal, isOpen, setIsOpen, removeFromCart, clearCart, refreshCart } = useCart();
  const { user, wallet, refreshProfile } = useAuth();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successOrder, setSuccessOrder] = useState<any | null>(null);

  if (!isOpen) return null;

  const currentBalance = wallet?.balance || 0;
  const isBalanceSufficient = currentBalance >= subtotal;

  const handleCheckout = async (listingId: string) => {
    setError(null);
    setIsCheckingOut(true);

    try {
      const res = await api.post('/orders/checkout', { listingId });
      if (res.success && res.data) {
        setSuccessOrder(res.data);
        await refreshProfile();
        await refreshCart();
      }
    } catch (err: any) {
      setError(err.message || 'Checkout failed. Please ensure you have sufficient balance.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => {
          setIsOpen(false);
          setSuccessOrder(null);
          setError(null);
        }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-surface-50 border-l border-surface-300/50 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-surface-300/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-brand-400" />
              <h2 className="text-lg font-bold text-white">Your Cart</h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-brand-950 border border-brand-800 text-brand-300 font-semibold">
                {items.length}
              </span>
            </div>
            <button
              onClick={() => {
                setIsOpen(false);
                setSuccessOrder(null);
                setError(null);
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-surface-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Success Screen if checked out */}
          {successOrder ? (
            <div className="p-8 flex flex-col items-center justify-center text-center my-auto">
              <div className="w-16 h-16 rounded-2xl bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white">Order Confirmed!</h3>
              <p className="text-sm text-slate-400 mt-2">
                Order <span className="text-brand-300 font-mono">#{successOrder.orderNumber}</span> has been processed. Access credentials have been delivered to your orders tab.
              </p>
              <div className="mt-6 flex flex-col gap-3 w-full">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setSuccessOrder(null);
                    router.push(`/orders`);
                  }}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-500 hover:from-brand-500 hover:to-indigo-400 text-white font-semibold text-sm shadow-glow flex items-center justify-center gap-2"
                >
                  View Delivered Credentials <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setSuccessOrder(null);
                  }}
                  className="w-full py-2.5 rounded-xl bg-surface-100 text-slate-300 hover:text-white text-xs"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Item List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {items.length === 0 ? (
                  <div className="text-center py-20 flex flex-col items-center">
                    <ShoppingBag className="w-12 h-12 text-slate-400 mb-3" />
                    <p className="text-base font-semibold text-slate-300">Your cart is empty</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs">
                      Browse top OTT and AI subscriptions at verified best prices.
                    </p>
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        router.push('/browse');
                      }}
                      className="mt-6 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold"
                    >
                      Browse Marketplace
                    </button>
                  </div>
                ) : (
                  items.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl bg-surface-100 border border-surface-300/40 flex flex-col gap-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.listing.platform.logoUrl}
                            alt={item.listing.platform.name}
                            className="w-10 h-10 rounded-xl object-cover border border-surface-300/50"
                          />
                          <div>
                            <h4 className="text-sm font-semibold text-white line-clamp-1">
                              {item.listing.title}
                            </h4>
                            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                              <span>{item.listing.durationMonths} Mo</span>
                              <span>&bull;</span>
                              <span className="text-brand-300">{item.listing.planName}</span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-surface-200 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-surface-300/30 text-xs">
                        <span className="text-slate-400">Seller: {item.listing.seller.displayName}</span>
                        <span className="text-sm font-bold text-white">
                          {formatCurrency(item.listing.price)}
                        </span>
                      </div>
                    </div>
                  ))
                )}

                {error && (
                  <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{error}</span>
                  </div>
                )}
              </div>

              {/* Footer Checkout Summary */}
              {items.length > 0 && (
                <div className="p-6 border-t border-surface-300/40 bg-surface-100/50 flex flex-col gap-4">
                  {/* Wallet Check */}
                  <div className="p-3.5 rounded-xl bg-surface-200/60 border border-surface-300/40 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-400 block">Your Wallet Balance</span>
                      <span
                        className={`text-sm font-bold ${
                          isBalanceSufficient ? 'text-emerald-400' : 'text-amber-400'
                        }`}
                      >
                        {formatCurrency(currentBalance)}
                      </span>
                    </div>

                    {!isBalanceSufficient && (
                      <Link
                        href="/wallet"
                        onClick={() => setIsOpen(false)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all"
                      >
                        + Add ₹{(subtotal - currentBalance).toFixed(2)}
                      </Link>
                    )}
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-400">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="text-white font-medium">{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Platform Fee</span>
                      <span className="text-emerald-400 font-medium">FREE (₹0.00)</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-surface-300/40">
                      <span>Total Amount</span>
                      <span className="text-brand-300">{formatCurrency(subtotal)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Protected by SubVault Escrow with 48h Replacement Guarantee</span>
                  </div>

                  {isBalanceSufficient ? (
                    <button
                      disabled={isCheckingOut || items.length === 0}
                      onClick={() => handleCheckout(items[0]?.listingId)}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-500 hover:from-brand-500 hover:to-indigo-400 text-white font-bold text-sm shadow-glow flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
                    >
                      {isCheckingOut ? (
                        <span>Processing Purchase...</span>
                      ) : (
                        <>
                          <span>Pay {formatCurrency(subtotal)} with Wallet</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  ) : (
                    <Link
                      href="/wallet"
                      onClick={() => setIsOpen(false)}
                      className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-glow-emerald flex items-center justify-center gap-2 text-center"
                    >
                      Deposit Funds to Wallet
                    </Link>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
