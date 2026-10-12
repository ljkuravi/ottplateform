'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useCart } from '@/lib/cart-context';
import { formatCurrency } from '@/lib/utils';
import { api } from '@/lib/api';
import {
  ShoppingCart,
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
  ChevronUp,
  RotateCw,
  Search,
} from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const {
    user,
    wallet,
    isSeller,
    isAdmin,
    logout,
    unreadCount,
    refreshProfile,
    activeMode,
    setActiveMode,
    isApprovedSeller,
  } = useAuth();
  const { items, setIsOpen: setCartOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isRefreshingWallet, setIsRefreshingWallet] = useState(false);

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

  // Navigation links requested: Home, Subscriptions, Digital Tools, Buy & Sell, Deals, Support
  const navLinks = [
    { id: 'nav-home', label: 'Home', href: '/' },
    { id: 'nav-subs', label: 'Subscriptions', href: '/browse?category=ott-streaming' },
    { id: 'nav-tools', label: 'Digital Tools', href: '/browse?category=ai-tools' },
    {
      id: 'nav-buysell',
      label: 'Buy & Sell',
      href: isSeller ? '/seller' : (isApprovedSeller ? '/seller' : '/become-seller'),
    },
    { id: 'nav-deals', label: 'Deals', href: '/browse?filter=deals' },
    { id: 'nav-support', label: 'Support', href: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] shadow-2xs">
      <div className="w-full px-3 sm:px-6 lg:px-8 xl:px-10 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand Logo - OTTLY */}
        <Link href="/" className="flex items-center select-none py-1 shrink-0">
          <img
            src="/logo.png"
            alt="OTTLY"
            className="h-7 sm:h-10 w-auto object-contain max-w-[110px] sm:max-w-[150px]"
          />
        </Link>

        {/* Desktop Navigation Links - Centered */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
          {navLinks.map((link) => {
            const isHome = link.href === '/';
            const isActive = isHome ? pathname === '/' : pathname.startsWith(link.href.split('?')[0]);
            return (
              <Link
                key={link.id}
                href={link.href}
                className={`text-sm font-semibold transition-colors ${isActive
                    ? 'text-[#059669]'
                    : 'text-[#64748B] hover:text-[#101828]'
                  }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Search Icon */}
          <Link
            href="/browse"
            className="p-2 rounded-xl text-[#64748B] hover:text-[#059669] hover:bg-slate-100 transition-colors"
            title="Search Subscriptions"
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
          </Link>

          {user ? (
            <>
              {/* Wallet Pill (Ottly exact) */}
              <Link
                href="/wallet"
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#f0f4ff] hover:bg-[#e6edff] border border-[#dce5ff] transition-all text-slate-800 shadow-2xs group"
                title="Wallet Balance"
              >
                <span className="text-sm">👛</span>
                <span className="text-xs font-bold text-slate-900">
                  {formatCurrency(wallet?.balance || 0)}
                </span>
                <button
                  type="button"
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsRefreshingWallet(true);
                    await refreshProfile();
                    setTimeout(() => setIsRefreshingWallet(false), 500);
                  }}
                  className="text-slate-400 hover:text-slate-700 ml-0.5 p-0.5 transition-transform"
                  title="Refresh Balance"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${isRefreshingWallet ? 'animate-spin' : ''}`} />
                </button>
              </Link>

              {/* Cart Button (Ottly exact: 🛒 01) */}
              <button
                onClick={() => setCartOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-800 transition-all shadow-2xs"
                aria-label="View Cart"
              >
                <ShoppingCart className="w-4 h-4 text-gray-800" />
                <span className="text-xs font-bold text-gray-900">
                  {String(totalCartCount).padStart(2, '0')}
                </span>
              </button>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-gray-50 transition-all text-gray-800"
                >
                  {/* Circular Avatar */}
                  <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-emerald-500 bg-black flex items-center justify-center shrink-0 shadow-2xs">
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.fullName}
                        className="w-full h-full object-cover"
                      />
                    ) : isSeller ? (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-[#07131b] text-white p-0.5 select-none">
                        <span className="text-[7.5px] font-black tracking-widest text-[#00a859]">OTTZONE</span>
                      </div>
                    ) : (
                      <div className="w-full h-full bg-emerald-600 flex items-center justify-center text-white font-bold text-xs uppercase">
                        {user.fullName ? user.fullName[0] : 'U'}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col text-left leading-tight hidden sm:flex">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-gray-900">
                        {user.fullName.split(' ')[0]}
                      </span>
                      {userDropdownOpen ? (
                        <ChevronUp className="w-3.5 h-3.5 text-gray-600" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-gray-600" />
                      )}
                    </div>
                    {isSeller ? (
                      <span className="text-[10px] text-[#00a859] font-black tracking-wider uppercase">
                        SELLER
                      </span>
                    ) : (
                      <span className="text-[10px] text-gray-500 font-semibold uppercase">
                        BUYER
                      </span>
                    )}
                  </div>
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-white p-3 shadow-xl border border-gray-100 z-50 flex flex-col gap-2">
                    {/* Mode Switch Button (Matches exact screenshot) */}
                    {isSeller ? (
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          setActiveMode('BUYER');
                          router.push('/browse');
                        }}
                        className="w-full bg-[#00a859] hover:bg-[#00924c] active:scale-[0.98] text-white font-bold py-2.5 px-4 rounded-xl text-center text-sm transition-all shadow-sm cursor-pointer"
                      >
                        Become a Buyer
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          if (isApprovedSeller) {
                            setActiveMode('SELLER');
                            router.push('/seller');
                          } else {
                            router.push('/become-seller');
                          }
                        }}
                        className="w-full bg-[#00a859] hover:bg-[#00924c] active:scale-[0.98] text-white font-bold py-2.5 px-4 rounded-xl text-center text-sm transition-all shadow-sm cursor-pointer"
                      >
                        Become a Seller
                      </button>
                    )}

                    <div className="border-t border-gray-100 my-0.5" />

                    <div className="px-2 py-0.5">
                      <div className="text-xs font-bold text-gray-900">{user.fullName}</div>
                      <div className="text-[11px] text-gray-500 truncate">{user.email}</div>
                    </div>

                    <div className="flex flex-col gap-0.5">
                      {isSeller && (
                        <>
                          <Link
                            href="/seller?tab=seller-profile"
                            onClick={() => setUserDropdownOpen(false)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            Seller Profile
                          </Link>
                          <Link
                            href="/seller?tab=overview"
                            onClick={() => setUserDropdownOpen(false)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            Dashboard
                          </Link>
                          <Link
                            href="/seller?tab=new-list"
                            onClick={() => setUserDropdownOpen(false)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium text-emerald-600 hover:bg-emerald-50 transition-colors"
                          >
                            + New List
                          </Link>
                        </>
                      )}

                      <Link
                        href="/orders"
                        onClick={() => setUserDropdownOpen(false)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        My Orders
                      </Link>
                      <Link
                        href="/messages"
                        onClick={() => setUserDropdownOpen(false)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Messages
                      </Link>
                      <Link
                        href="/wallet"
                        onClick={() => setUserDropdownOpen(false)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Wallet
                      </Link>
                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold text-purple-600 hover:bg-purple-50 transition-colors"
                        >
                          Admin Panel
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-gray-100 my-0.5" />
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 transition-colors text-left cursor-pointer"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              {/* Cart Button */}
              <button
                onClick={() => setCartOpen(true)}
                className="relative p-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 transition-all shrink-0"
                aria-label="View Cart"
              >
                <ShoppingCart className="w-4 h-4" />
                {totalCartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center">
                    {totalCartCount}
                  </span>
                )}
              </button>

              <Link
                href="/login"
                className="hidden sm:inline-flex whitespace-nowrap px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-all shrink-0"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="whitespace-nowrap px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white shadow-sm transition-all shrink-0"
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors shrink-0"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-3 shadow-lg">
          {!user && (
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 sm:hidden">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white shadow-sm transition-colors whitespace-nowrap"
              >
                Sign Up
              </Link>
            </div>
          )}
          {navLinks.map((link) => (
            <Link
              key={link.id}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-slate-700 hover:text-emerald-600 py-1"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
