'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';
import {
  Store,
  DollarSign,
  ShoppingBag,
  Layers,
  ArrowUpRight,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  Lock,
  Pause,
  Play,
  Key,
} from 'lucide-react';

export default function SellerDashboardPage() {
  const { user, isSeller } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'listings' | 'orders' | 'payouts'>('overview');

  const [dashboardData, setDashboardData] = useState<any | null>(null);
  const [myListings, setMyListings] = useState<any[]>([]);
  const [myOrders, setMyOrders] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [platforms, setPlatforms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [addListingOpen, setAddListingOpen] = useState(false);
  const [withdrawalModalOpen, setWithdrawalModalOpen] = useState(false);
  const [addStockModalOpen, setAddStockModalOpen] = useState(false);
  const [selectedListingForStock, setSelectedListingForStock] = useState<any | null>(null);

  // Add Listing Form State
  const [title, setTitle] = useState('');
  const [planName, setPlanName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [platformId, setPlatformId] = useState('');
  const [durationMonths, setDurationMonths] = useState(1);
  const [price, setPrice] = useState(199);
  const [originalPrice, setOriginalPrice] = useState(599);
  const [accessType, setAccessType] = useState('SHARED_SCREEN');
  const [deviceLimit, setDeviceLimit] = useState('1 Screen');
  const [quality, setQuality] = useState('4K UHD');
  const [region, setRegion] = useState('India');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [initialEmail, setInitialEmail] = useState('');
  const [initialCredentials, setInitialCredentials] = useState('');

  // Withdrawal Form State
  const [withdrawAmount, setWithdrawAmount] = useState(500);
  const [withdrawMethod, setWithdrawMethod] = useState('UPI');
  const [withdrawDetails, setWithdrawDetails] = useState('');

  // Stock Form State
  const [stockEmail, setStockEmail] = useState('');
  const [stockCredentials, setStockCredentials] = useState('');

  const loadData = async () => {
    try {
      const [dashRes, catRes, platRes, withRes, ordersRes] = await Promise.all([
        api.get('/sellers/dashboard'),
        api.get('/categories'),
        api.get('/categories/platforms'),
        api.get('/seller/withdrawals'),
        api.get('/orders/seller'),
      ]);

      if (dashRes.success && dashRes.data) {
        setDashboardData(dashRes.data);
      }
      if (catRes.success && catRes.data) {
        setCategories(catRes.data);
        if (catRes.data.length > 0 && !categoryId) setCategoryId(catRes.data[0].id);
      }
      if (platRes.success && platRes.data) {
        setPlatforms(platRes.data);
        if (platRes.data.length > 0 && !platformId) setPlatformId(platRes.data[0].id);
      }
      if (withRes.success && withRes.data) {
        setWithdrawals(withRes.data);
      }
      if (ordersRes.success && ordersRes.data) {
        setMyOrders(ordersRes.data.data || []);
      }

      // Fetch listings for current seller
      if (dashRes.data?.profile?.id) {
        const listRes = await api.get(`/listings?limit=50`);
        if (listRes.success && listRes.data) {
          const mine = listRes.data.filter((l: any) => l.seller.id === dashRes.data.profile.id);
          setMyListings(mine);
        }
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/listings', {
        categoryId,
        platformId,
        title,
        planName,
        description,
        durationMonths: Number(durationMonths),
        price: Number(price),
        originalPrice: Number(originalPrice),
        accessType,
        deviceLimit,
        quality,
        region,
        instructions,
        inventory: [
          {
            accountEmailOrId: initialEmail || 'service.slot@subvault.me',
            credentials: initialCredentials,
            notes: 'Initial stock slot',
          },
        ],
      });

      if (res.success) {
        alert('Listing published successfully!');
        setAddListingOpen(false);
        await loadData();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to create listing');
    }
  };

  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedListingForStock) return;

    try {
      const res = await api.post(`/listings/${selectedListingForStock.id}/inventory`, {
        slots: [
          {
            accountEmailOrId: stockEmail || 'service.slot@subvault.me',
            credentials: stockCredentials,
          },
        ],
      });

      if (res.success) {
        alert('Inventory slot added & encrypted!');
        setAddStockModalOpen(false);
        setStockEmail('');
        setStockCredentials('');
        await loadData();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to add inventory');
    }
  };

  const handleRequestWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/seller/withdrawals', {
        amount: Number(withdrawAmount),
        payoutMethod: withdrawMethod,
        payoutDetails: withdrawDetails || dashboardData?.profile?.upiId || 'UPI',
      });

      if (res.success) {
        alert('Payout request submitted to Admin!');
        setWithdrawalModalOpen(false);
        await loadData();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to request withdrawal');
    }
  };

  if (!user || !isSeller) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-white">Seller Access Required</h2>
        <p className="text-xs text-slate-400 mt-2">
          You need an approved seller account to view the merchant dashboard.
        </p>
        <Link
          href="/become-seller"
          className="mt-4 inline-block px-4 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-semibold"
        >
          Apply to Become a Seller
        </Link>
      </div>
    );
  }

  const stats = dashboardData?.stats || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex flex-col space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Seller Dashboard</h1>
            <span className="px-2 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-800 text-[10px] font-bold text-emerald-400">
              VERIFIED MERCHANT
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Storefront: <strong className="text-slate-200">{dashboardData?.profile?.displayName}</strong> &bull; Rating: ★ {dashboardData?.profile?.rating?.toFixed(1) || '5.0'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setAddListingOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-500 hover:from-brand-500 hover:to-indigo-400 text-white font-bold text-xs shadow-glow flex items-center gap-1.5 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Listing</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-surface-300/40 pb-2 text-xs">
        {[
          { id: 'overview', label: 'Overview & KPIs' },
          { id: 'listings', label: `My Listings (${myListings.length})` },
          { id: 'orders', label: `Orders Received (${myOrders.length})` },
          { id: 'payouts', label: 'Earnings & Payouts' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-brand-600 text-white shadow-glow'
                : 'text-slate-400 hover:text-white hover:bg-surface-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="glass-panel p-5 rounded-2xl border border-surface-300/40">
              <span className="text-xs text-slate-400">Available Earnings</span>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 mt-2">
                {formatCurrency(stats.availableEarnings || 0)}
              </div>
              <button
                onClick={() => setWithdrawalModalOpen(true)}
                className="mt-3 text-xs text-brand-300 hover:underline flex items-center gap-1"
              >
                Request Withdrawal <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-surface-300/40">
              <span className="text-xs text-slate-400">Today&apos;s Sales</span>
              <div className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
                {formatCurrency(stats.todaySalesAmount || 0)}
              </div>
              <span className="text-xs text-slate-400 mt-1 block">
                {stats.todayOrdersCount || 0} order(s) today
              </span>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-surface-300/40">
              <span className="text-xs text-slate-400">Total Orders Sold</span>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-200 mt-2">
                {stats.totalSales || 0}
              </div>
              <span className="text-xs text-slate-400 mt-1 block">
                {stats.completedOrders || 0} completed
              </span>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-surface-300/40">
              <span className="text-xs text-slate-400">Active Listings</span>
              <div className="text-2xl sm:text-3xl font-extrabold text-indigo-300 mt-2">
                {stats.availableListings || 0}
              </div>
              <span className="text-xs text-slate-400 mt-1 block">
                Published in marketplace
              </span>
            </div>
          </div>

          {/* Recent Orders Overview */}
          <div className="glass-panel p-6 rounded-3xl border border-surface-300/40 space-y-4">
            <h3 className="text-base font-bold text-white">Recent Sales</h3>
            {myOrders.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No orders received yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-[11px] text-slate-400 uppercase tracking-wider border-b border-surface-300/30">
                    <tr>
                      <th className="pb-3">Order</th>
                      <th className="pb-3">Buyer</th>
                      <th className="pb-3">Plan</th>
                      <th className="pb-3">Date</th>
                      <th className="pb-3">Your Earning</th>
                      <th className="pb-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-300/20">
                    {myOrders.slice(0, 5).map((o) => (
                      <tr key={o.id}>
                        <td className="py-3 font-mono font-medium text-white">#{o.orderNumber}</td>
                        <td className="py-3 text-slate-300">{o.buyer?.fullName}</td>
                        <td className="py-3 text-slate-300">{o.items?.[0]?.listingTitle}</td>
                        <td className="py-3 text-slate-400">{formatDate(o.createdAt)}</td>
                        <td className="py-3 font-bold text-emerald-400">{formatCurrency(o.sellerEarning)}</td>
                        <td className="py-3 text-right">
                          <span className="px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 text-[10px] font-bold">
                            {o.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* LISTINGS TAB */}
      {activeTab === 'listings' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Your Marketplace Offerings</h3>
            <button
              onClick={() => setAddListingOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" /> Add Listing
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myListings.map((listing) => (
              <div
                key={listing.id}
                className="glass-card p-5 rounded-2xl border border-surface-300/40 flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-brand-400 uppercase">
                      {listing.platform?.name}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                      {listing.availableStock} in stock
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white mt-1 line-clamp-1">{listing.title}</h4>
                  <div className="text-xs text-slate-400 mt-1">
                    {listing.durationMonths} Mo &bull; {listing.quality} &bull; {formatCurrency(listing.price)}
                  </div>
                </div>

                <div className="pt-3 border-t border-surface-300/30 flex items-center justify-between text-xs">
                  <button
                    onClick={() => {
                      setSelectedListingForStock(listing);
                      setAddStockModalOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-surface-200 hover:bg-surface-300 text-white flex items-center gap-1"
                  >
                    <Key className="w-3.5 h-3.5 text-brand-400" />
                    + Add Inventory
                  </button>

                  <Link
                    href={`/listings/${listing.slug}`}
                    className="text-xs text-brand-400 hover:underline"
                  >
                    View Live
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ORDERS TAB */}
      {activeTab === 'orders' && (
        <div className="glass-panel p-6 rounded-3xl border border-surface-300/40 space-y-4">
          <h3 className="text-base font-bold text-white">All Orders Received ({myOrders.length})</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] text-slate-400 uppercase tracking-wider border-b border-surface-300/30">
                <tr>
                  <th className="pb-3">Order Number</th>
                  <th className="pb-3">Buyer Contact</th>
                  <th className="pb-3">Subscription</th>
                  <th className="pb-3">Sale Date</th>
                  <th className="pb-3">Platform Fee (10%)</th>
                  <th className="pb-3">Net Earning</th>
                  <th className="pb-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-300/20">
                {myOrders.map((o) => (
                  <tr key={o.id}>
                    <td className="py-3.5 font-mono text-brand-300 font-bold">#{o.orderNumber}</td>
                    <td className="py-3.5 text-white">{o.buyer?.fullName} ({o.buyer?.email})</td>
                    <td className="py-3.5 text-slate-300">{o.items?.[0]?.listingTitle}</td>
                    <td className="py-3.5 text-slate-400">{formatDateTime(o.createdAt)}</td>
                    <td className="py-3.5 text-slate-400">{formatCurrency(o.platformFee)}</td>
                    <td className="py-3.5 text-emerald-400 font-bold">{formatCurrency(o.sellerEarning)}</td>
                    <td className="py-3.5 text-right font-bold text-[10px] text-emerald-300 uppercase">
                      {o.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PAYOUTS TAB */}
      {activeTab === 'payouts' && (
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-surface-300/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs text-slate-400">Available for Payout</span>
              <div className="text-3xl font-extrabold text-white mt-1">
                {formatCurrency(stats.availableEarnings || 0)}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Minimum withdrawal amount is ₹200. Payouts are dispatched directly via UPI.
              </p>
            </div>
            <button
              onClick={() => setWithdrawalModalOpen(true)}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs shadow-glow-emerald flex items-center gap-1.5"
            >
              <ArrowUpRight className="w-4 h-4" />
              Request Withdrawal
            </button>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-surface-300/40 space-y-4">
            <h3 className="text-base font-bold text-white">Withdrawal History</h3>
            {withdrawals.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No withdrawal requests yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-[11px] text-slate-400 uppercase tracking-wider border-b border-surface-300/30">
                    <tr>
                      <th className="pb-3">Request ID</th>
                      <th className="pb-3">Method</th>
                      <th className="pb-3">Details</th>
                      <th className="pb-3">Requested At</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-300/20">
                    {withdrawals.map((w) => (
                      <tr key={w.id}>
                        <td className="py-3 font-mono text-slate-300 text-[11px]">{w.id.slice(0, 8)}...</td>
                        <td className="py-3 text-white font-medium">{w.payoutMethod}</td>
                        <td className="py-3 text-slate-400 font-mono text-[11px]">{w.payoutDetails}</td>
                        <td className="py-3 text-slate-400">{formatDate(w.createdAt)}</td>
                        <td className="py-3">
                          <span
                            className={`px-2 py-0.5 rounded-md font-semibold text-[10px] ${
                              w.status === 'COMPLETED'
                                ? 'bg-emerald-950 text-emerald-300'
                                : w.status === 'REJECTED'
                                ? 'bg-rose-950 text-rose-300'
                                : 'bg-amber-950 text-amber-300'
                            }`}
                          >
                            {w.status}
                          </span>
                        </td>
                        <td className="py-3 text-right font-bold text-white">{formatCurrency(w.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Listing Modal */}
      {addListingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl my-8 rounded-3xl glass-panel border border-surface-300/60 p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-surface-300/40">
              <h3 className="text-lg font-bold text-white">Create Digital Subscription Listing</h3>
              <button
                onClick={() => setAddListingOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateListing} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Category *</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full bg-surface-100 border border-surface-300/60 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Platform Brand *</label>
                  <select
                    value={platformId}
                    onChange={(e) => setPlatformId(e.target.value)}
                    className="w-full bg-surface-100 border border-surface-300/60 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    {platforms.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Listing Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Netflix Premium 4K - Private Screen"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-surface-100 border border-surface-300/60 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Plan Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ultra HD 4K, Pro 1 Year"
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                    className="w-full bg-surface-100 border border-surface-300/60 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Duration (Mo) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={durationMonths}
                    onChange={(e) => setDurationMonths(Number(e.target.value))}
                    className="w-full bg-surface-100 border border-surface-300/60 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Price (₹) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full bg-surface-100 border border-surface-300/60 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Original Price (₹)</label>
                  <input
                    type="number"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(Number(e.target.value))}
                    className="w-full bg-surface-100 border border-surface-300/60 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Quality</label>
                  <input
                    type="text"
                    value={quality}
                    onChange={(e) => setQuality(e.target.value)}
                    className="w-full bg-surface-100 border border-surface-300/60 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Access Type</label>
                  <select
                    value={accessType}
                    onChange={(e) => setAccessType(e.target.value)}
                    className="w-full bg-surface-100 border border-surface-300/60 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="PRIVATE_PROFILE">Private Profile</option>
                    <option value="SHARED_SCREEN">Shared Screen</option>
                    <option value="FAMILY_INVITE">Family Invite</option>
                    <option value="PRIVATE_ACCOUNT">Private Dedicated Account</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Device Limit</label>
                  <input
                    type="text"
                    value={deviceLimit}
                    onChange={(e) => setDeviceLimit(e.target.value)}
                    placeholder="e.g. 1 Screen at a time"
                    className="w-full bg-surface-100 border border-surface-300/60 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Listing Description</label>
                <textarea
                  rows={2}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detail what is included in this subscription..."
                  className="w-full bg-surface-100 border border-surface-300/60 rounded-xl p-3 text-xs text-white"
                />
              </div>

              {/* Initial Encrypted Stock Slot */}
              <div className="p-4 rounded-2xl bg-surface-100/70 border border-surface-300/40 space-y-3">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Initial Inventory Slot (AES-256 Encrypted)
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Account Email or User Identifier"
                    value={initialEmail}
                    onChange={(e) => setInitialEmail(e.target.value)}
                    className="bg-surface-200 border border-surface-300/60 rounded-xl px-3 py-2 text-xs text-white"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Credentials / PIN / Invite URL (encrypted at rest)"
                    value={initialCredentials}
                    onChange={(e) => setInitialCredentials(e.target.value)}
                    className="bg-surface-200 border border-surface-300/60 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-500 hover:from-brand-500 hover:to-indigo-400 text-white font-bold text-xs shadow-glow transition-all"
              >
                Publish Subscription Listing
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Stock Modal */}
      {addStockModalOpen && selectedListingForStock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl glass-panel border border-surface-300/60 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-surface-300/40">
              <h3 className="text-base font-bold text-white">Add Encrypted Inventory Slot</h3>
              <button
                onClick={() => setAddStockModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Adding new slot for: <strong className="text-white">{selectedListingForStock.title}</strong>
            </p>

            <form onSubmit={handleAddStock} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300">Identifier / Account Email</label>
                <input
                  type="text"
                  placeholder="e.g. netflix.sub5@gmail.com"
                  value={stockEmail}
                  onChange={(e) => setStockEmail(e.target.value)}
                  className="w-full bg-surface-100 border border-surface-300/60 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-300">Credentials & PIN (Encrypted) *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Pass: ... | Profile: ... | PIN: ..."
                  value={stockCredentials}
                  onChange={(e) => setStockCredentials(e.target.value)}
                  className="w-full bg-surface-100 border border-surface-300/60 rounded-xl p-3 text-xs text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs"
              >
                Encrypt & Add Inventory Slot
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Withdrawal Modal */}
      {withdrawalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl glass-panel border border-surface-300/60 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-surface-300/40">
              <h3 className="text-base font-bold text-white">Request Earnings Payout</h3>
              <button
                onClick={() => setWithdrawalModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRequestWithdrawal} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300">Withdrawal Amount (INR) *</label>
                <input
                  type="number"
                  min="200"
                  max={stats.availableEarnings || 50000}
                  required
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                  className="w-full bg-surface-100 border border-surface-300/60 rounded-xl px-3 py-2 text-xs text-white"
                />
                <span className="text-[10px] text-slate-400">
                  Available: {formatCurrency(stats.availableEarnings || 0)} (Min ₹200)
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-300">Payout Method</label>
                <select
                  value={withdrawMethod}
                  onChange={(e) => setWithdrawMethod(e.target.value)}
                  className="w-full bg-surface-100 border border-surface-300/60 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="UPI">UPI (VPA)</option>
                  <option value="BANK">Bank Account Transfer</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-300">UPI ID / Bank Account Details *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. cloudpass@okhdfcbank"
                  value={withdrawDetails}
                  onChange={(e) => setWithdrawDetails(e.target.value)}
                  className="w-full bg-surface-100 border border-surface-300/60 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 text-white font-bold text-xs shadow-glow-emerald"
              >
                Submit Payout Request
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
