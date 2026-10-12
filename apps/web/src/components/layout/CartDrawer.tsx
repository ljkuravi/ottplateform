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
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-slate-200 shadow-2xl flex flex-col text-slate-900">
          {/* Header */}
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg font-bold text-slate-900">Your Cart</h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                {items.length}
              </span>
            </div>
            <button
              onClick={() => {
                setIsOpen(false);
                setSuccessOrder(null);
                setError(null);
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Success Screen if checked out */}
          {successOrder ? (
            <div className="p-8 flex flex-col items-center justify-center text-center my-auto">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-600 mb-4 animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Order Confirmed!</h3>
              <p className="text-sm text-slate-600 mt-2">
                Order <span className="text-emerald-700 font-mono font-bold">#{successOrder.orderNumber}</span> has been processed. Access credentials have been delivered to your orders tab.
              </p>
              <div className="mt-6 flex flex-col gap-3 w-full">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setSuccessOrder(null);
                    router.push(`/orders`);
                  }}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm flex items-center justify-center gap-2"
                >
                  View Delivered Credentials <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setSuccessOrder(null);
                  }}
                  className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Item List */}
              <div className="flex-1 overflow-y-auto p-5 space-y-3">
                {items.length === 0 ? (
                  <div className="text-center py-20 flex flex-col items-center">
                    <ShoppingBag className="w-12 h-12 text-slate-300 mb-3" />
                    <p className="text-base font-bold text-slate-700">Your cart is empty</p>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs">
                      Browse top OTT and AI subscriptions at verified best prices.
                    </p>
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        router.push('/browse');
                      }}
                      className="mt-5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm"
                    >
                      Browse Marketplace
                    </button>
                  </div>
                ) : (
                  items.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.listing.platform.logoUrl}
                            alt={item.listing.platform.name}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200 bg-white p-0.5"
                          />
                          <div>
                            <h4 className="text-sm font-bold text-slate-900 line-clamp-1">
                              {item.listing.title}
                            </h4>
                            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                              <span>{item.listing.durationMonths} Mo</span>
                              <span>&bull;</span>
                              <span className="text-emerald-700 font-semibold">{item.listing.planName}</span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
                        <span className="text-slate-500">Seller: {item.listing.seller.displayName}</span>
                        <span className="text-sm font-extrabold text-slate-900">
                          {formatCurrency(item.listing.price)}
                        </span>
                      </div>
                    </div>
                  ))
                )}

                {error && (
                  <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{error}</span>
                  </div>
                )}
              </div>

              {/* Footer Checkout Summary */}
              {items.length > 0 && (
                <div className="p-5 border-t border-slate-200 bg-slate-50 flex flex-col gap-4">
                  {/* Wallet Check */}
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-500 block">Your Wallet Balance</span>
                      <span
                        className={`text-sm font-bold ${
                          isBalanceSufficient ? 'text-emerald-600' : 'text-amber-600'
                        }`}
                      >
                        {formatCurrency(currentBalance)}
                      </span>
                    </div>

                    {!isBalanceSufficient && (
                      <Link
                        href="/wallet"
                        onClick={() => setIsOpen(false)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm"
                      >
                        + Add ₹{(subtotal - currentBalance).toFixed(2)}
                      </Link>
                    )}
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-500">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="text-slate-900 font-semibold">{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Platform Fee</span>
                      <span className="text-emerald-600 font-semibold">FREE (₹0.00)</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
                      <span>Total Amount</span>
                      <span className="text-emerald-600 text-base font-extrabold">{formatCurrency(subtotal)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 justify-center">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Escrow Protection: Funds released only after delivery</span>
                  </div>

                  {user ? (
                    <button
                      disabled={isCheckingOut || !isBalanceSufficient}
                      onClick={() => handleCheckout(items[0]?.listing.id)}
                      className={`w-full py-3 rounded-xl font-bold text-sm shadow-sm flex items-center justify-center gap-2 transition-all ${
                        isBalanceSufficient
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      {isCheckingOut ? (
                        'Processing Order...'
                      ) : isBalanceSufficient ? (
                        <>
                          Complete Purchase &amp; Access <ArrowRight className="w-4 h-4" />
                        </>
                      ) : (
                        'Insufficient Wallet Balance'
                      )}
                    </button>
                  ) : (
                    <Link
                      href="/login"
                      onClick={() => setIsOpen(false)}
                      className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm text-center shadow-sm block"
                    >
                      Log In to Complete Purchase
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
