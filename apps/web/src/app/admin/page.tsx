'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';
import {
  ShieldCheck,
  Users,
  Store,
  ShoppingBag,
  DollarSign,
  AlertTriangle,
  Settings,
  FileText,
  CheckCircle2,
  XCircle,
  Ban,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Layers,
  Plus,
  Trash2,
  Save,
  Tv,
} from 'lucide-react';

export default function AdminPage() {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<
    'overview' | 'applications' | 'users' | 'listings' | 'orders' | 'withdrawals' | 'refunds' | 'audit' | 'settings' | 'platform-plans'
  >('overview');

  const [dashboardData, setDashboardData] = useState<any | null>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [listingsList, setListingsList] = useState<any[]>([]);
  const [ordersList, setOrdersList] = useState<any[]>([]);
  const [withdrawalsList, setWithdrawalsList] = useState<any[]>([]);
  const [refundsList, setRefundsList] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [settingsList, setSettingsList] = useState<any[]>([]);
  const [platformsList, setPlatformsList] = useState<any[]>([]);
  const [platformPlansConfig, setPlatformPlansConfig] = useState<any>({});
  const [selectedPlatformSlug, setSelectedPlatformSlug] = useState<string>('youtube-premium');
  const [isSavingPlans, setIsSavingPlans] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadAllAdminData = async () => {
    try {
      const [dashRes, appRes, usersRes, listRes, ordRes, withRes, refRes, auditRes, setRes, plansRes, platRes] =
        await Promise.all([
          api.get('/admin/dashboard'),
          api.get('/admin/seller-applications'),
          api.get('/admin/users'),
          api.get('/admin/listings'),
          api.get('/admin/orders'),
          api.get('/admin/withdrawals'),
          api.get('/admin/refunds'),
          api.get('/admin/audit-logs'),
          api.get('/admin/settings'),
          api.get('/categories/plans-config'),
          api.get('/categories/platforms'),
        ]);

      if (dashRes.success) setDashboardData(dashRes.data);
      if (appRes.success) setApplications(appRes.data || []);
      if (usersRes.success) setUsersList(usersRes.data?.data || []);
      if (listRes.success) setListingsList(listRes.data?.data || []);
      if (ordRes.success) setOrdersList(ordRes.data?.data || []);
      if (withRes.success) setWithdrawalsList(withRes.data || []);
      if (refRes.success) setRefundsList(refRes.data || []);
      if (auditRes.success) setAuditLogs(auditRes.data?.data || []);
      if (setRes.success) setSettingsList(setRes.data || []);
      if (plansRes.success && plansRes.data) setPlatformPlansConfig(plansRes.data);
      if (platRes.success && platRes.data) {
        setPlatformsList(platRes.data);
        if (platRes.data.length > 0 && !selectedPlatformSlug) {
          setSelectedPlatformSlug(platRes.data[0].slug);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadAllAdminData();
    }
  }, [isAdmin]);

  const handleReviewApplication = async (appId: string, action: 'APPROVE' | 'REJECT') => {
    const reason = action === 'REJECT' ? prompt('Enter rejection reason:') || 'Information incomplete' : undefined;
    try {
      const res = await api.post(`/admin/seller-applications/${appId}/review`, {
        action,
        rejectionReason: reason,
      });
      if (res.success) {
        alert(`Application ${action.toLowerCase()}d successfully`);
        await loadAllAdminData();
      }
    } catch (err: any) {
      alert(err.message || 'Action failed');
    }
  };

  const handleReviewWithdrawal = async (withId: string, action: 'APPROVE' | 'REJECT') => {
    const refId = action === 'APPROVE' ? prompt('Enter Bank / UPI Transfer Reference ID:', `UPI-${Date.now()}`) : undefined;
    const reason = action === 'REJECT' ? prompt('Enter rejection reason:') || 'Bank details invalid' : undefined;
    try {
      const res = await api.post(`/admin/withdrawals/${withId}/review`, {
        action,
        referenceId: refId || undefined,
        rejectionReason: reason,
      });
      if (res.success) {
        alert(`Withdrawal ${action.toLowerCase()}d`);
        await loadAllAdminData();
      }
    } catch (err: any) {
      alert(err.message || 'Action failed');
    }
  };

  const handleReviewRefund = async (refundId: string, action: 'APPROVE' | 'REJECT') => {
    const reason = action === 'REJECT' ? prompt('Enter rejection reason:') : undefined;
    const confirmMsg = action === 'APPROVE'
      ? 'Approve refund? This will atomically refund the buyer wallet and debit seller earnings.'
      : 'Reject refund dispute?';

    if (!confirm(confirmMsg)) return;

    try {
      const res = await api.post(`/admin/refunds/${refundId}/review`, {
        action,
        rejectionReason: reason,
      });
      if (res.success) {
        alert(`Refund ${action.toLowerCase()}d`);
        await loadAllAdminData();
      }
    } catch (err: any) {
      alert(err.message || 'Action failed');
    }
  };

  const handleToggleUserBan = async (userId: string, currentBanned: boolean) => {
    try {
      const res = await api.patch(`/admin/users/${userId}/status`, {
        isBanned: !currentBanned,
      });
      if (res.success) {
        alert(`User ${!currentBanned ? 'banned' : 'unbanned'}`);
        await loadAllAdminData();
      }
    } catch (err: any) {
      alert(err.message || 'Action failed');
    }
  };

  const handleToggleListingStatus = async (listingId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    try {
      const res = await api.patch(`/admin/listings/${listingId}`, {
        status: nextStatus,
      });
      if (res.success) {
        alert(`Listing updated to ${nextStatus}`);
        await loadAllAdminData();
      }
    } catch (err: any) {
      alert(err.message || 'Action failed');
    }
  };

  // Platform Categories & Min/Max Price Helpers
  const currentPlatformConfig = platformPlansConfig[selectedPlatformSlug] || {
    name: platformsList.find((p) => p.slug === selectedPlatformSlug)?.name || selectedPlatformSlug,
    durations: {
      '1': { minPrice: 30, maxPrice: 300 },
      '3': { minPrice: 80, maxPrice: 800 },
      '6': { minPrice: 150, maxPrice: 1500 },
      '12': { minPrice: 280, maxPrice: 2800 },
    },
    categories: ['Full HD 1080', 'HD 720 Quality', 'Individual Plan', 'Family Plan', '4K Video Quality'],
  };

  const currentCategories: string[] =
    currentPlatformConfig.categories ||
    (currentPlatformConfig.plans ? currentPlatformConfig.plans.map((p: any) => p.name) : []);

  const currentDurations: Record<string, { minPrice: number; maxPrice: number }> =
    currentPlatformConfig.durations || {
      '1': { minPrice: currentPlatformConfig.minPrice ?? 30, maxPrice: (currentPlatformConfig.minPrice ?? 30) * 10 },
      '3': { minPrice: Math.round((currentPlatformConfig.minPrice ?? 30) * 2.5), maxPrice: (currentPlatformConfig.maxPrice ?? 800) },
      '6': { minPrice: Math.round((currentPlatformConfig.minPrice ?? 30) * 5), maxPrice: (currentPlatformConfig.maxPrice ?? 1500) },
      '12': { minPrice: Math.round((currentPlatformConfig.minPrice ?? 30) * 9), maxPrice: (currentPlatformConfig.maxPrice ?? 2800) },
    };

  const handleUpdateDurationPrice = (
    durationKey: '1' | '3' | '6' | '12',
    field: 'minPrice' | 'maxPrice',
    value: number
  ) => {
    const updatedDurations = {
      ...currentDurations,
      [durationKey]: {
        ...(currentDurations[durationKey] || { minPrice: 30, maxPrice: 300 }),
        [field]: value,
      },
    };

    const updated = {
      ...platformPlansConfig,
      [selectedPlatformSlug]: {
        ...currentPlatformConfig,
        durations: updatedDurations,
        categories: currentCategories,
        plans: currentCategories.map((name) => ({ name })),
      },
    };
    setPlatformPlansConfig(updated);
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    const catName = newCategoryName.trim();
    if (currentCategories.includes(catName)) {
      alert('This category already exists for this platform!');
      return;
    }
    const updatedCategories = [...currentCategories, catName];
    const updated = {
      ...platformPlansConfig,
      [selectedPlatformSlug]: {
        ...currentPlatformConfig,
        categories: updatedCategories,
        plans: updatedCategories.map((name) => ({ name })),
      },
    };
    setPlatformPlansConfig(updated);
    setNewCategoryName('');
  };

  const handleDeleteCategory = (index: number) => {
    const updatedCategories = currentCategories.filter((_: any, idx: number) => idx !== index);
    const updated = {
      ...platformPlansConfig,
      [selectedPlatformSlug]: {
        ...currentPlatformConfig,
        categories: updatedCategories,
        plans: updatedCategories.map((name) => ({ name })),
      },
    };
    setPlatformPlansConfig(updated);
  };

  const handleSaveAllPlatformPlans = async () => {
    setIsSavingPlans(true);
    setSaveSuccessMsg(null);
    try {
      const res = await api.patch('/admin/settings/PLATFORM_PLANS_CONFIG', {
        value: JSON.stringify(platformPlansConfig),
      });
      if (res.success) {
        setSaveSuccessMsg('Platform configuration saved! Min/Max prices and categories updated for all sellers.');
        setTimeout(() => setSaveSuccessMsg(null), 5000);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to save configuration');
    } finally {
      setIsSavingPlans(false);
    }
  };

  if (!user || !isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-100">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Admin Privileges Required</h2>
        <p className="text-xs text-slate-500 mt-2">
          This portal is restricted to SubVault system administrators.
        </p>
        <Link
          href="/login"
          className="mt-5 inline-block px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors"
        >
          Sign In as Admin
        </Link>
      </div>
    );
  }

  const kpi = dashboardData?.kpi || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex flex-col space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Admin Control Panel</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time management for users, sellers, escrow balances, disputes, platform plans, and audit trails.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'platform-plans', label: 'Platform & Plans Config' },
          { id: 'applications', label: `Seller Applications (${applications.filter((a) => a.status === 'PENDING').length})` },
          { id: 'users', label: `Users (${kpi.totalUsers || 0})` },
          { id: 'listings', label: `Listings (${kpi.activeListings || 0})` },
          { id: 'orders', label: `Orders (${kpi.totalOrders || 0})` },
          { id: 'withdrawals', label: `Withdrawals (${kpi.pendingWithdrawals || 0})` },
          { id: 'refunds', label: `Refunds (${kpi.pendingRefunds || 0})` },
          { id: 'audit', label: 'Audit Trail' },
          { id: 'settings', label: 'Settings' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-2 rounded-xl font-semibold transition-all shrink-0 ${
              activeTab === tab.id
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* PLATFORM & PLANS CONFIG TAB */}
      {activeTab === 'platform-plans' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Tv className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">OTT Categories & Price Limits Management</h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Admin can add/edit Categories for each OTT/App and set Min/Max price boundaries that sellers can charge.
              </p>
            </div>
            <button
              onClick={handleSaveAllPlatformPlans}
              disabled={isSavingPlans}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm flex items-center gap-2 transition-colors disabled:opacity-50 self-start sm:self-auto"
            >
              <Save className="w-4 h-4" />
              <span>{isSavingPlans ? 'Saving Changes...' : 'Save Configuration'}</span>
            </button>
          </div>

          {saveSuccessMsg && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{saveSuccessMsg}</span>
            </div>
          )}

          {/* 1. Platform Selector Ribbon */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <span className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
              1. Select OTT / App Platform:
            </span>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {[
                { slug: 'prime-video', name: 'Amazon Prime Video' },
                { slug: 'netflix', name: 'Netflix' },
                { slug: 'youtube-premium', name: 'YouTube Premium' },
                { slug: 'spotify-premium', name: 'Spotify Premium' },
                { slug: 'hotstar', name: 'Disney+ Hotstar' },
                { slug: 'chatgpt-plus', name: 'ChatGPT Plus' },
                { slug: 'canva-pro', name: 'Canva Pro' },
                ...platformsList.filter(
                  (p) =>
                    ![
                      'prime-video',
                      'netflix',
                      'youtube-premium',
                      'spotify-premium',
                      'hotstar',
                      'chatgpt-plus',
                      'canva-pro',
                    ].includes(p.slug)
                ),
              ].map((plat) => {
                const isSelected = selectedPlatformSlug === plat.slug;
                return (
                  <button
                    key={plat.slug}
                    onClick={() => setSelectedPlatformSlug(plat.slug)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 border ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {plat.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Min & Max Price Control Section (Per Duration: 1mo, 3mo, 6mo, 12mo) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span>2. Price Boundaries by Duration (મુદત મુજબ Min & Max Price) for {currentPlatformConfig.name || selectedPlatformSlug}</span>
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Set minimum and maximum selling prices for 1 Month, 3 Months, 6 Months, and 12 Months. Sellers cannot price outside these boundaries.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { key: '1', label: '1 Month', badge: '30 Days' },
                { key: '3', label: '3 Months', badge: 'Quarterly' },
                { key: '6', label: '6 Months', badge: 'Half-Yearly' },
                { key: '12', label: '12 Months', badge: '1 Year' },
              ].map((d) => {
                const durData = currentDurations[d.key] || { minPrice: 30, maxPrice: 300 };
                return (
                  <div key={d.key} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/70">
                      <span className="text-xs font-bold text-slate-900">{d.label}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {d.badge}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600 block">Min Price (₹)</label>
                      <div className="relative">
                        <span className="absolute left-2.5 top-1.5 text-xs text-slate-400 font-bold">₹</span>
                        <input
                          type="number"
                          min="1"
                          value={durData.minPrice}
                          onChange={(e) => handleUpdateDurationPrice(d.key as any, 'minPrice', Number(e.target.value))}
                          className="w-full bg-white border border-slate-300 rounded-md pl-6 pr-2 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-600 block">Max Price (₹)</label>
                      <div className="relative">
                        <span className="absolute left-2.5 top-1.5 text-xs text-slate-400 font-bold">₹</span>
                        <input
                          type="number"
                          min="1"
                          value={durData.maxPrice}
                          onChange={(e) => handleUpdateDurationPrice(d.key as any, 'maxPrice', Number(e.target.value))}
                          className="w-full bg-white border border-slate-300 rounded-md pl-6 pr-2 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Categories / Plans for this OTT */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <div>
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-600" />
                  <span>3. Categories & Plan Options for {currentPlatformConfig.name || selectedPlatformSlug}</span>
                </h4>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                  {currentCategories.length} Categories Active
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Add the categories/options sellers will see in dropdown (e.g. Full HD 1080, HD 720 Quality, Individual Plan, Family Plan, 4K Video Quality).
              </p>
            </div>

            {/* Quick Add Bar */}
            <div className="flex items-center gap-2 max-w-xl">
              <input
                type="text"
                placeholder="Type new category or plan name (e.g. Student Plan)..."
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCategory();
                  }
                }}
                className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-600"
              />
              <button
                type="button"
                onClick={handleAddCategory}
                disabled={!newCategoryName.trim()}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-colors disabled:opacity-40 shrink-0 flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>+ Add Category</span>
              </button>
            </div>

            {/* Existing Categories List */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-600 block uppercase tracking-wider">
                Configured Categories for Sellers:
              </span>

              {currentCategories.length === 0 ? (
                <div className="p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-400">
                  No categories added yet. Type a category name above and click &ldquo;+ Add Category&rdquo;.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {currentCategories.map((cat, idx) => (
                    <div
                      key={`${cat}-${idx}`}
                      className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white flex items-center justify-between gap-2 transition-all shadow-2xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-bold text-slate-800 truncate">{cat}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteCategory(idx)}
                        className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0"
                        title={`Remove ${cat}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Save Bar */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
              <button
                onClick={handleSaveAllPlatformPlans}
                disabled={isSavingPlans}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSavingPlans ? 'Saving Changes...' : 'Save Configuration'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-500">Total Marketplace GMV</span>
              <div className="text-2xl font-extrabold text-slate-900 mt-1">
                {formatCurrency(kpi.totalRevenue || 0)}
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">Lifetime orders value</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-500">Platform Profit (10%)</span>
              <div className="text-2xl font-extrabold text-emerald-600 mt-1">
                {formatCurrency(kpi.platformEarnings || 0)}
              </div>
              <span className="text-[11px] text-emerald-700 mt-1 block">Escrow commissions collected</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-500">Pending Seller Apps</span>
              <div className="text-2xl font-extrabold text-amber-600 mt-1">
                {kpi.pendingApplications || 0}
              </div>
              <button
                onClick={() => setActiveTab('applications')}
                className="text-[11px] text-emerald-700 font-semibold hover:underline mt-1 block"
              >
                Review Applications &rarr;
              </button>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-500">Open Disputes</span>
              <div className="text-2xl font-extrabold text-rose-600 mt-1">
                {kpi.pendingRefunds || 0}
              </div>
              <button
                onClick={() => setActiveTab('refunds')}
                className="text-[11px] text-rose-700 font-semibold hover:underline mt-1 block"
              >
                Inspect Claims &rarr;
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-slate-900">Recent Orders across SubVault</h3>
              <div className="space-y-2 text-xs">
                {dashboardData?.recentOrders?.map((o: any) => (
                  <div key={o.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="font-mono font-bold text-slate-900">#{o.orderNumber}</span>
                      <span className="text-slate-500 block text-[11px]">
                        {o.buyer?.fullName} &bull; Seller: {o.seller?.displayName}
                      </span>
                    </div>
                    <span className="font-bold text-emerald-600">{formatCurrency(o.totalAmount)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-slate-900">Newly Registered Members</h3>
              <div className="space-y-2 text-xs">
                {dashboardData?.recentUsers?.map((u: any) => (
                  <div key={u.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-900">{u.fullName}</span>
                      <span className="text-slate-500 block text-[11px]">{u.email}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 text-[10px] font-bold">
                      {u.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SELLER APPLICATIONS */}
      {activeTab === 'applications' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900">Seller Registration Requests</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] text-slate-500 uppercase tracking-wider border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="py-2.5 px-3">Applicant</th>
                  <th className="py-2.5 px-3">Store Display Name</th>
                  <th className="py-2.5 px-3">Bio / Specialization</th>
                  <th className="py-2.5 px-3">Payout Details</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-3">
                      <div className="font-semibold text-slate-900">{app.fullName}</div>
                      <div className="text-[11px] text-slate-500">{app.email} &bull; {app.phone}</div>
                    </td>
                    <td className="py-3.5 px-3 font-bold text-emerald-700">{app.displayName}</td>
                    <td className="py-3.5 px-3 text-slate-600 max-w-xs">{app.aboutSeller}</td>
                    <td className="py-3.5 px-3 font-mono text-[11px] text-slate-600">
                      {app.payoutMethod}: {app.upiId || app.bankDetails}
                    </td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          app.status === 'APPROVED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : app.status === 'REJECTED'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {app.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right space-x-2">
                      {app.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleReviewApplication(app.id, 'APPROVE')}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-sm transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReviewApplication(app.id, 'REJECT')}
                            className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-[11px] transition-colors"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900">Registered Accounts</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] text-slate-500 uppercase tracking-wider border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="py-2.5 px-3">User</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Wallet Balance</th>
                  <th className="py-2.5 px-3">Orders Placed</th>
                  <th className="py-2.5 px-3">Joined Date</th>
                  <th className="py-2.5 px-3 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-3">
                      <div className="font-semibold text-slate-900">{u.fullName}</div>
                      <div className="text-[11px] text-slate-500">{u.email}</div>
                    </td>
                    <td className="py-3.5 px-3 font-bold text-slate-700">{u.role}</td>
                    <td className="py-3.5 px-3 font-bold text-emerald-600">{formatCurrency(u.wallet?.balance || 0)}</td>
                    <td className="py-3.5 px-3 text-slate-600">{u._count?.buyerOrders || 0}</td>
                    <td className="py-3.5 px-3 text-slate-500">{formatDate(u.createdAt)}</td>
                    <td className="py-3.5 px-3 text-right">
                      <button
                        onClick={() => handleToggleUserBan(u.id, u.isBanned)}
                        className={`px-3 py-1 rounded-lg text-[11px] font-bold ${
                          u.isBanned
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {u.isBanned ? 'Unban User' : 'Ban User'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* LISTINGS MODERATION */}
      {activeTab === 'listings' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900">All Platform Listings</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] text-slate-500 uppercase tracking-wider border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="py-2.5 px-3">Title & Platform</th>
                  <th className="py-2.5 px-3">Seller</th>
                  <th className="py-2.5 px-3">Price</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {listingsList.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-3">
                      <div className="font-semibold text-slate-900">{l.title}</div>
                      <div className="text-[11px] text-emerald-700 font-medium">{l.platform?.name} &bull; {l.planName}</div>
                    </td>
                    <td className="py-3.5 px-3 text-slate-700">{l.seller?.displayName}</td>
                    <td className="py-3.5 px-3 font-bold text-slate-900">{formatCurrency(l.price)}</td>
                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold">
                        {l.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <button
                        onClick={() => handleToggleListingStatus(l.id, l.status)}
                        className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-[11px] font-bold"
                      >
                        {l.status === 'ACTIVE' ? 'Pause' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ORDERS LEDGER */}
      {activeTab === 'orders' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900">System Orders & Fee Split</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] text-slate-500 uppercase tracking-wider border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="py-2.5 px-3">Order Number</th>
                  <th className="py-2.5 px-3">Buyer</th>
                  <th className="py-2.5 px-3">Seller</th>
                  <th className="py-2.5 px-3">Total (GMV)</th>
                  <th className="py-2.5 px-3">Fee (10%)</th>
                  <th className="py-2.5 px-3">Seller Share</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ordersList.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-3 font-mono text-emerald-700 font-bold">#{o.orderNumber}</td>
                    <td className="py-3.5 px-3 text-slate-900">{o.buyer?.fullName}</td>
                    <td className="py-3.5 px-3 text-slate-700">{o.seller?.displayName}</td>
                    <td className="py-3.5 px-3 font-bold text-slate-900">{formatCurrency(o.totalAmount)}</td>
                    <td className="py-3.5 px-3 text-emerald-600 font-bold">{formatCurrency(o.platformFee)}</td>
                    <td className="py-3.5 px-3 text-emerald-600">{formatCurrency(o.sellerEarning)}</td>
                    <td className="py-3.5 px-3 text-right font-bold text-[10px] text-slate-600 uppercase">
                      <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* WITHDRAWALS */}
      {activeTab === 'withdrawals' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900">Seller Withdrawal Requests</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] text-slate-500 uppercase tracking-wider border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="py-2.5 px-3">Seller</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Method</th>
                  <th className="py-2.5 px-3">Details</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Process Payout</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {withdrawalsList.map((w) => (
                  <tr key={w.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-3 font-semibold text-slate-900">{w.sellerProfile?.displayName}</td>
                    <td className="py-3.5 px-3 font-bold text-emerald-600">{formatCurrency(w.amount)}</td>
                    <td className="py-3.5 px-3 text-slate-700">{w.payoutMethod}</td>
                    <td className="py-3.5 px-3 font-mono text-[11px] text-slate-600">{w.payoutDetails}</td>
                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {w.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right space-x-2">
                      {w.status === 'REQUESTED' && (
                        <>
                          <button
                            onClick={() => handleReviewWithdrawal(w.id, 'APPROVE')}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-sm transition-colors"
                          >
                            Mark Paid
                          </button>
                          <button
                            onClick={() => handleReviewWithdrawal(w.id, 'REJECT')}
                            className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-[11px] transition-colors"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DISPUTES & REFUNDS */}
      {activeTab === 'refunds' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900">Dispute & Refund Mediation</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] text-slate-500 uppercase tracking-wider border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="py-2.5 px-3">Order Number</th>
                  <th className="py-2.5 px-3">Claimant</th>
                  <th className="py-2.5 px-3">Reason</th>
                  <th className="py-2.5 px-3">Details</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Adjudicate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {refundsList.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-3 font-mono text-slate-900 font-bold">#{r.order?.orderNumber}</td>
                    <td className="py-3.5 px-3 text-slate-700">{r.requester?.fullName}</td>
                    <td className="py-3.5 px-3 text-amber-700 font-semibold">{r.reason}</td>
                    <td className="py-3.5 px-3 text-slate-600 max-w-xs">{r.details}</td>
                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right space-x-2">
                      {r.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleReviewRefund(r.id, 'APPROVE')}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-sm transition-colors"
                          >
                            Approve Refund
                          </button>
                          <button
                            onClick={() => handleReviewRefund(r.id, 'REJECT')}
                            className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-[11px] transition-colors"
                          >
                            Reject Claim
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900">Immutable Audit Trail</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] text-slate-500 uppercase tracking-wider border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Actor</th>
                  <th className="py-2.5 px-3">Action</th>
                  <th className="py-2.5 px-3">Entity</th>
                  <th className="py-2.5 px-3">Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 text-slate-500">{formatDateTime(log.createdAt)}</td>
                    <td className="py-3 px-3 text-slate-900 font-medium">{log.actorEmail || 'System'}</td>
                    <td className="py-3 px-3 text-emerald-700 font-mono font-semibold">{log.action}</td>
                    <td className="py-3 px-3 text-slate-600">{log.entity}</td>
                    <td className="py-3 px-3 font-mono text-[10px] text-slate-500 max-w-xs truncate">
                      {log.metadata || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SETTINGS */}
      {activeTab === 'settings' && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <h3 className="text-base font-bold text-slate-900">Marketplace Configuration Settings</h3>
          <div className="divide-y divide-slate-100">
            {settingsList.map((s) => (
              <div key={s.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-slate-900 font-mono">{s.key}</span>
                  <p className="text-slate-500 mt-0.5">{s.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    defaultValue={s.value}
                    onBlur={async (e) => {
                      if (e.target.value !== s.value) {
                        await api.patch(`/admin/settings/${s.key}`, { value: e.target.value });
                        alert(`Setting "${s.key}" updated to ${e.target.value}`);
                      }
                    }}
                    className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 w-44 font-mono focus:bg-white focus:border-emerald-600"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
