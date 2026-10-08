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
} from 'lucide-react';

export default function AdminPage() {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<
    'overview' | 'applications' | 'users' | 'listings' | 'orders' | 'withdrawals' | 'refunds' | 'audit' | 'settings'
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
  const [isLoading, setIsLoading] = useState(true);

  const loadAllAdminData = async () => {
    try {
      const [dashRes, appRes, usersRes, listRes, ordRes, withRes, refRes, auditRes, setRes] =
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

  if (!user || !isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-white">Admin Privileges Required</h2>
        <p className="text-xs text-slate-400 mt-2">
          This portal is restricted to SubVault system administrators.
        </p>
        <Link
          href="/login"
          className="mt-4 inline-block px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold"
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
            <ShieldCheck className="w-6 h-6 text-rose-500" />
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Admin Control Panel</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time management for users, sellers, escrow balances, disputes, and audit trails.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-surface-300/40 pb-2 text-xs overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview' },
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
                ? 'bg-rose-600 text-white shadow-glow'
                : 'text-slate-400 hover:text-white hover:bg-surface-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="glass-panel p-5 rounded-2xl border border-surface-300/40">
              <span className="text-xs text-slate-400">Total Marketplace GMV</span>
              <div className="text-2xl font-extrabold text-white mt-1">
                {formatCurrency(kpi.totalRevenue || 0)}
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">Lifetime orders value</span>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-surface-300/40">
              <span className="text-xs text-slate-400">Platform Profit (10%)</span>
              <div className="text-2xl font-extrabold text-emerald-400 mt-1">
                {formatCurrency(kpi.platformEarnings || 0)}
              </div>
              <span className="text-[11px] text-emerald-400/80 mt-1 block">Escrow commissions collected</span>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-surface-300/40">
              <span className="text-xs text-slate-400">Pending Seller Apps</span>
              <div className="text-2xl font-extrabold text-amber-400 mt-1">
                {kpi.pendingApplications || 0}
              </div>
              <button
                onClick={() => setActiveTab('applications')}
                className="text-[11px] text-brand-300 hover:underline mt-1 block"
              >
                Review Applications &rarr;
              </button>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-surface-300/40">
              <span className="text-xs text-slate-400">Open Disputes</span>
              <div className="text-2xl font-extrabold text-rose-400 mt-1">
                {kpi.pendingRefunds || 0}
              </div>
              <button
                onClick={() => setActiveTab('refunds')}
                className="text-[11px] text-rose-300 hover:underline mt-1 block"
              >
                Inspect Claims &rarr;
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-panel p-6 rounded-3xl border border-surface-300/40 space-y-3">
              <h3 className="text-sm font-bold text-white">Recent Orders across SubVault</h3>
              <div className="space-y-2 text-xs">
                {dashboardData?.recentOrders?.map((o: any) => (
                  <div key={o.id} className="p-3 rounded-xl bg-surface-100 flex items-center justify-between">
                    <div>
                      <span className="font-mono font-bold text-white">#{o.orderNumber}</span>
                      <span className="text-slate-400 block text-[11px]">
                        {o.buyer?.fullName} &bull; Seller: {o.seller?.displayName}
                      </span>
                    </div>
                    <span className="font-bold text-emerald-400">{formatCurrency(o.totalAmount)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-panel p-6 rounded-3xl border border-surface-300/40 space-y-3">
              <h3 className="text-sm font-bold text-white">Newly Registered Members</h3>
              <div className="space-y-2 text-xs">
                {dashboardData?.recentUsers?.map((u: any) => (
                  <div key={u.id} className="p-3 rounded-xl bg-surface-100 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-white">{u.fullName}</span>
                      <span className="text-slate-400 block text-[11px]">{u.email}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-surface-200 text-slate-300 text-[10px] font-bold">
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
        <div className="glass-panel p-6 rounded-3xl border border-surface-300/40 space-y-4">
          <h3 className="text-base font-bold text-white">Seller Registration Requests</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] text-slate-400 uppercase tracking-wider border-b border-surface-300/30">
                <tr>
                  <th className="pb-3">Applicant</th>
                  <th className="pb-3">Store Display Name</th>
                  <th className="pb-3">Bio / Specialization</th>
                  <th className="pb-3">Payout Details</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-300/20">
                {applications.map((app) => (
                  <tr key={app.id}>
                    <td className="py-3.5">
                      <div className="font-semibold text-white">{app.fullName}</div>
                      <div className="text-[11px] text-slate-400">{app.email} &bull; {app.phone}</div>
                    </td>
                    <td className="py-3.5 font-bold text-brand-300">{app.displayName}</td>
                    <td className="py-3.5 text-slate-300 max-w-xs">{app.aboutSeller}</td>
                    <td className="py-3.5 font-mono text-[11px] text-slate-300">
                      {app.payoutMethod}: {app.upiId || app.bankDetails}
                    </td>
                    <td className="py-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          app.status === 'APPROVED'
                            ? 'bg-emerald-950 text-emerald-300'
                            : app.status === 'REJECTED'
                            ? 'bg-rose-950 text-rose-300'
                            : 'bg-amber-950 text-amber-300'
                        }`}
                      >
                        {app.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-right space-x-2">
                      {app.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleReviewApplication(app.id, 'APPROVE')}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px]"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReviewApplication(app.id, 'REJECT')}
                            className="px-3 py-1.5 rounded-lg bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-300 font-bold text-[11px]"
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
        <div className="glass-panel p-6 rounded-3xl border border-surface-300/40 space-y-4">
          <h3 className="text-base font-bold text-white">Registered Accounts</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] text-slate-400 uppercase tracking-wider border-b border-surface-300/30">
                <tr>
                  <th className="pb-3">User</th>
                  <th className="pb-3">Role</th>
                  <th className="pb-3">Wallet Balance</th>
                  <th className="pb-3">Orders Placed</th>
                  <th className="pb-3">Joined Date</th>
                  <th className="pb-3 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-300/20">
                {usersList.map((u) => (
                  <tr key={u.id}>
                    <td className="py-3.5">
                      <div className="font-semibold text-white">{u.fullName}</div>
                      <div className="text-[11px] text-slate-400">{u.email}</div>
                    </td>
                    <td className="py-3.5 font-bold text-slate-300">{u.role}</td>
                    <td className="py-3.5 font-bold text-emerald-400">{formatCurrency(u.wallet?.balance || 0)}</td>
                    <td className="py-3.5 text-slate-300">{u._count?.buyerOrders || 0}</td>
                    <td className="py-3.5 text-slate-400">{formatDate(u.createdAt)}</td>
                    <td className="py-3.5 text-right">
                      <button
                        onClick={() => handleToggleUserBan(u.id, u.isBanned)}
                        className={`px-3 py-1 rounded-lg text-[11px] font-bold ${
                          u.isBanned
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-rose-950 text-rose-300 border border-rose-800'
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
        <div className="glass-panel p-6 rounded-3xl border border-surface-300/40 space-y-4">
          <h3 className="text-base font-bold text-white">All Platform Listings</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] text-slate-400 uppercase tracking-wider border-b border-surface-300/30">
                <tr>
                  <th className="pb-3">Title & Platform</th>
                  <th className="pb-3">Seller</th>
                  <th className="pb-3">Price</th>
                  <th className="pb-3">Stock</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-300/20">
                {listingsList.map((l) => (
                  <tr key={l.id}>
                    <td className="py-3.5">
                      <div className="font-semibold text-white">{l.title}</div>
                      <div className="text-[11px] text-brand-300">{l.platform?.name} &bull; {l.planName}</div>
                    </td>
                    <td className="py-3.5 text-slate-300">{l.seller?.displayName}</td>
                    <td className="py-3.5 font-bold text-white">{formatCurrency(l.price)}</td>
                    <td className="py-3.5 text-emerald-400 font-bold">{l.availableStock}</td>
                    <td className="py-3.5">
                      <span className="px-2 py-0.5 rounded-md bg-surface-200 text-slate-200 text-[10px] font-bold">
                        {l.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      <button
                        onClick={() => handleToggleListingStatus(l.id, l.status)}
                        className="px-3 py-1 rounded-lg bg-surface-200 hover:bg-surface-300 text-slate-200 text-[11px] font-bold"
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
        <div className="glass-panel p-6 rounded-3xl border border-surface-300/40 space-y-4">
          <h3 className="text-base font-bold text-white">System Orders & Fee Split</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] text-slate-400 uppercase tracking-wider border-b border-surface-300/30">
                <tr>
                  <th className="pb-3">Order Number</th>
                  <th className="pb-3">Buyer</th>
                  <th className="pb-3">Seller</th>
                  <th className="pb-3">Total (GMV)</th>
                  <th className="pb-3">Fee (10%)</th>
                  <th className="pb-3">Seller Share</th>
                  <th className="pb-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-300/20">
                {ordersList.map((o) => (
                  <tr key={o.id}>
                    <td className="py-3.5 font-mono text-brand-300 font-bold">#{o.orderNumber}</td>
                    <td className="py-3.5 text-white">{o.buyer?.fullName}</td>
                    <td className="py-3.5 text-slate-300">{o.seller?.displayName}</td>
                    <td className="py-3.5 font-bold text-white">{formatCurrency(o.totalAmount)}</td>
                    <td className="py-3.5 text-brand-400 font-bold">{formatCurrency(o.platformFee)}</td>
                    <td className="py-3.5 text-emerald-400">{formatCurrency(o.sellerEarning)}</td>
                    <td className="py-3.5 text-right font-bold text-[10px] text-slate-300 uppercase">
                      {o.status}
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
        <div className="glass-panel p-6 rounded-3xl border border-surface-300/40 space-y-4">
          <h3 className="text-base font-bold text-white">Seller Withdrawal Requests</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] text-slate-400 uppercase tracking-wider border-b border-surface-300/30">
                <tr>
                  <th className="pb-3">Seller</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Method</th>
                  <th className="pb-3">Details</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Process Payout</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-300/20">
                {withdrawalsList.map((w) => (
                  <tr key={w.id}>
                    <td className="py-3.5 font-semibold text-white">{w.sellerProfile?.displayName}</td>
                    <td className="py-3.5 font-bold text-emerald-400">{formatCurrency(w.amount)}</td>
                    <td className="py-3.5 text-slate-300">{w.payoutMethod}</td>
                    <td className="py-3.5 font-mono text-[11px] text-slate-300">{w.payoutDetails}</td>
                    <td className="py-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-surface-200 text-slate-200">
                        {w.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-right space-x-2">
                      {w.status === 'REQUESTED' && (
                        <>
                          <button
                            onClick={() => handleReviewWithdrawal(w.id, 'APPROVE')}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px]"
                          >
                            Mark Paid
                          </button>
                          <button
                            onClick={() => handleReviewWithdrawal(w.id, 'REJECT')}
                            className="px-3 py-1.5 rounded-lg bg-rose-950 border border-rose-800 text-rose-300 font-bold text-[11px]"
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
        <div className="glass-panel p-6 rounded-3xl border border-surface-300/40 space-y-4">
          <h3 className="text-base font-bold text-white">Dispute & Refund Mediation</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] text-slate-400 uppercase tracking-wider border-b border-surface-300/30">
                <tr>
                  <th className="pb-3">Order Number</th>
                  <th className="pb-3">Claimant</th>
                  <th className="pb-3">Reason</th>
                  <th className="pb-3">Details</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Adjudicate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-300/20">
                {refundsList.map((r) => (
                  <tr key={r.id}>
                    <td className="py-3.5 font-mono text-white font-bold">#{r.order?.orderNumber}</td>
                    <td className="py-3.5 text-slate-300">{r.requester?.fullName}</td>
                    <td className="py-3.5 text-amber-300 font-semibold">{r.reason}</td>
                    <td className="py-3.5 text-slate-300 max-w-xs">{r.details}</td>
                    <td className="py-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-surface-200 text-slate-200">
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-right space-x-2">
                      {r.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleReviewRefund(r.id, 'APPROVE')}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px]"
                          >
                            Approve Refund
                          </button>
                          <button
                            onClick={() => handleReviewRefund(r.id, 'REJECT')}
                            className="px-3 py-1.5 rounded-lg bg-rose-950 border border-rose-800 text-rose-300 font-bold text-[11px]"
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
        <div className="glass-panel p-6 rounded-3xl border border-surface-300/40 space-y-4">
          <h3 className="text-base font-bold text-white">Immutable Audit Trail</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] text-slate-400 uppercase tracking-wider border-b border-surface-300/30">
                <tr>
                  <th className="pb-3">Timestamp</th>
                  <th className="pb-3">Actor</th>
                  <th className="pb-3">Action</th>
                  <th className="pb-3">Entity</th>
                  <th className="pb-3">Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-300/20">
                {auditLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="py-3 text-slate-400">{formatDateTime(log.createdAt)}</td>
                    <td className="py-3 text-white font-medium">{log.actorEmail || 'System'}</td>
                    <td className="py-3 text-brand-300 font-mono font-semibold">{log.action}</td>
                    <td className="py-3 text-slate-300">{log.entity}</td>
                    <td className="py-3 font-mono text-[10px] text-slate-400 max-w-xs truncate">
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
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-surface-300/40 space-y-6">
          <h3 className="text-base font-bold text-white">Marketplace Configuration Settings</h3>
          <div className="divide-y divide-surface-300/30">
            {settingsList.map((s) => (
              <div key={s.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-white font-mono">{s.key}</span>
                  <p className="text-slate-400 mt-0.5">{s.description}</p>
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
                    className="bg-surface-100 border border-surface-300/60 rounded-xl px-3 py-1.5 text-xs text-white w-40 font-mono"
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
