'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useCart } from '@/lib/cart-context';
import { formatCurrency } from '@/lib/utils';
import { api } from '@/lib/api';
import {
  ShoppingBag,
  Bell,
  Wallet,
  User,
  ShieldCheck,
  Store,
  LogOut,
  Menu,
  X,
  MessageSquare,
  Sparkles,
  ChevronDown,
} from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const { user, wallet, isSeller, isAdmin, logout, unreadCount } = useAuth();
  const { items, setIsOpen: setCartOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  const totalCartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await api.get('/notifications');
      if (res.success && res.data) {
        setNotifications(res.data.notifications || []);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (notificationsOpen) {
      fetchNotifications();
    }
  }, [notificationsOpen]);

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Browse', href: '/browse' },
    { label: 'How It Works', href: '/#how-it-works' },
    ...(!isSeller ? [{ label: 'Become a Seller', href: '/become-seller' }] : []),
  ];

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-surface-300/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-400 flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
              Sub<span className="text-brand-400">Vault</span>
            </span>
            <span className="text-[10px] tracking-wider uppercase text-slate-400 font-medium -mt-1">
              Digital Marketplace
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-white ${
                  isActive ? 'text-brand-400' : 'text-slate-300'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* Cart Icon */}
          <button
            onClick={() => setCartOpen(true)}
            className="relative p-2.5 rounded-xl bg-surface-100 border border-surface-300 hover:border-brand-500/50 hover:bg-surface-200 transition-all text-slate-200"
            aria-label="View Cart"
          >
            <ShoppingBag className="w-5 h-5" />
            {totalCartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full bg-brand-600 text-white text-[11px] font-bold flex items-center justify-center animate-pulse">
                {totalCartCount}
              </span>
            )}
          </button>

          {user ? (
            <>
              {/* Wallet Pill */}
              <Link
                href="/wallet"
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-100 border border-surface-300 hover:border-brand-500/50 transition-all group"
              >
                <Wallet className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                <div className="flex flex-col text-left">
                  <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Wallet</span>
                  <span className="text-xs font-semibold text-emerald-300">
                    {formatCurrency(wallet?.balance || 0)}
                  </span>
                </div>
              </Link>

              {/* Notifications Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="relative p-2.5 rounded-xl bg-surface-100 border border-surface-300 hover:border-brand-500/50 hover:bg-surface-200 transition-all text-slate-200"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-accent-rose text-white text-[11px] font-bold flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {notificationsOpen && (
                  <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl glass-panel p-4 shadow-2xl z-50 border border-surface-300/60">
                    <div className="flex items-center justify-between pb-3 border-b border-surface-300/50">
                      <h4 className="text-sm font-semibold text-white">Notifications</h4>
                      <button
                        onClick={async () => {
                          await api.patch('/notifications/read-all');
                          setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
                        }}
                        className="text-xs text-brand-400 hover:underline"
                      >
                        Mark all as read
                      </button>
                    </div>

                    <div className="mt-3 max-h-72 overflow-y-auto space-y-2">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-6">No notifications yet</p>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            className={`p-3 rounded-xl border transition-colors ${
                              n.isRead
                                ? 'bg-surface-50/50 border-surface-300/30'
                                : 'bg-surface-100 border-brand-500/30'
                            }`}
                          >
                            <div className="text-xs font-medium text-white">{n.title}</div>
                            <div className="text-xs text-slate-400 mt-0.5">{n.message}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl bg-surface-100 border border-surface-300 hover:border-brand-500/50 transition-all text-slate-200"
                >
                  <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center text-xs font-bold text-white">
                    {user.fullName.charAt(0)}
                  </div>
                  <span className="hidden lg:inline text-xs font-medium text-slate-200 truncate max-w-[100px]">
                    {user.fullName.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-56 rounded-2xl glass-panel p-2 shadow-2xl z-50 border border-surface-300/60 flex flex-col gap-1">
                    <div className="px-3 py-2 border-b border-surface-300/50">
                      <div className="text-xs font-semibold text-white">{user.fullName}</div>
                      <div className="text-[11px] text-slate-400 truncate">{user.email}</div>
                      <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-brand-950/80 border border-brand-800 text-[10px] text-brand-300 font-medium">
                        {user.role}
                      </div>
                    </div>

                    <Link
                      href="/orders"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-surface-200 transition-colors"
                    >
                      <ShoppingBag className="w-4 h-4 text-brand-400" />
                      My Subscriptions & Orders
                    </Link>

                    <Link
                      href="/chats"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-surface-200 transition-colors"
                    >
                      <MessageSquare className="w-4 h-4 text-cyan-400" />
                      Messages & Seller Chat
                    </Link>

                    <Link
                      href="/wallet"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-surface-200 transition-colors"
                    >
                      <Wallet className="w-4 h-4 text-emerald-400" />
                      Wallet & Transactions
                    </Link>

                    {isSeller && (
                      <Link
                        href="/seller"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-indigo-300 hover:text-white hover:bg-brand-950/50 transition-colors font-medium"
                      >
                        <Store className="w-4 h-4 text-brand-400" />
                        Seller Dashboard
                      </Link>
                    )}

                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-rose-300 hover:text-white hover:bg-rose-950/50 transition-colors font-medium"
                      >
                        <ShieldCheck className="w-4 h-4 text-rose-400" />
                        Admin Control Panel
                      </Link>
                    )}

                    <div className="border-t border-surface-300/40 my-1" />

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-950/40 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:text-white hover:bg-surface-100 transition-all"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-500 hover:from-brand-500 hover:to-indigo-400 text-xs font-semibold text-white shadow-glow transition-all"
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-surface-100 text-slate-300"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-surface-300/40 glass-panel px-4 pt-3 pb-6 flex flex-col gap-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-slate-200 py-2 border-b border-surface-300/30"
            >
              {link.label}
            </Link>
          ))}
          {user && (
            <div className="flex flex-col gap-2 pt-2">
              <Link
                href="/orders"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm text-slate-300 py-1.5"
              >
                My Subscriptions & Orders
              </Link>
              <Link
                href="/wallet"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm text-emerald-400 py-1.5"
              >
                Wallet ({formatCurrency(wallet?.balance || 0)})
              </Link>
              {isSeller && (
                <Link
                  href="/seller"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm text-indigo-400 py-1.5"
                >
                  Seller Dashboard
                </Link>
              )}
              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm text-rose-400 py-1.5"
                >
                  Admin Control Panel
                </Link>
              )}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="text-sm text-rose-400 py-2 text-left"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
