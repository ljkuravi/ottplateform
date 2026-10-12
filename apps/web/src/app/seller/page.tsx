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
  ShieldCheck,
  UserCheck,
  Plus,
  Info,
  Mail,
  Pencil,
  Trash2,
  ChevronDown,
  Phone,
} from 'lucide-react';

export default function SellerDashboardPage() {
  const { user, isSeller, isApprovedSeller, setActiveMode } = useAuth();
  const [activeTab, setActiveTab] = useState<'new-list' | 'overview' | 'seller-profile' | 'listings' | 'orders' | 'payouts'>('seller-profile');

  // If user is approved seller but currently in BUYER mode, auto-switch to SELLER mode on this page
  useEffect(() => {
    if (isApprovedSeller && !isSeller) {
      setActiveMode('SELLER');
    }
  }, [isApprovedSeller, isSeller, setActiveMode]);

  // Seller Profile Form State
  const [profileFullName, setProfileFullName] = useState('Ravi');
  const [profileMobile, setProfileMobile] = useState('9510911130');
  const [profileBio, setProfileBio] = useState('⭐ All OTTs, VPNs & Apps | 💰 Lowest Prices | ⚡ Instant Activation | 💬 Fast Response |');
  const [profileAvatarUrl, setProfileAvatarUrl] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Status & Filter Controls
  const [isOnline, setIsOnline] = useState(true);
  const [timeFilter, setTimeFilter] = useState('Today');

  const [dashboardData, setDashboardData] = useState<any | null>(null);
  const [myListings, setMyListings] = useState<any[]>([]);
  const [myOrders, setMyOrders] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [platforms, setPlatforms] = useState<any[]>([]);
  const [platformPlansConfig, setPlatformPlansConfig] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);

  // Listing creation state (matching Ottly screenshot)
  const [listingMode, setListingMode] = useState<'regular' | 'bundle'>('regular');
  const [platformId, setPlatformId] = useState('');
  const [planName, setPlanName] = useState('');
  const [customPlan, setCustomPlan] = useState(false);
  const [deviceLimit, setDeviceLimit] = useState('1');
  const [ownMail, setOwnMail] = useState(true);
  const [ownNumber, setOwnNumber] = useState(false);
  const [accountType, setAccountType] = useState<'Shared Account' | 'Private Account'>('Shared Account');
  const [durationMonths, setDurationMonths] = useState(1);
  const [price, setPrice] = useState(89);
  const [originalPrice, setOriginalPrice] = useState(199);
  const [quality, setQuality] = useState('Full HD 1080');
  const [accessType, setAccessType] = useState('SHARED_SCREEN');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [initialEmail, setInitialEmail] = useState('');
  const [initialCredentials, setInitialCredentials] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [title, setTitle] = useState('');

  // Modals
  const [addListingOpen, setAddListingOpen] = useState(false);
  const [withdrawalModalOpen, setWithdrawalModalOpen] = useState(false);
  const [requestPlatformModalOpen, setRequestPlatformModalOpen] = useState(false);
  const [requestedPlatformName, setRequestedPlatformName] = useState('');

  // Modify / Edit Listing Modal State
  const [editListingModalOpen, setEditListingModalOpen] = useState(false);
  const [editingListing, setEditingListing] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    planName: '',
    price: 0,
    originalPrice: 0,
    status: 'ACTIVE',
    accountType: 'Shared Account',
    description: '',
  });

  // Withdrawal Form State
  const [withdrawAmount, setWithdrawAmount] = useState(500);
  const [withdrawMethod, setWithdrawMethod] = useState('UPI');
  const [withdrawDetails, setWithdrawDetails] = useState('');

  const loadData = async () => {
    try {
      const [dashRes, catRes, platRes, withRes, ordersRes, plansRes] = await Promise.all([
        api.get('/sellers/dashboard'),
        api.get('/categories'),
        api.get('/categories/platforms'),
        api.get('/seller/withdrawals'),
        api.get('/orders/seller'),
        api.get('/categories/plans-config'),
      ]);

      if (dashRes.success && dashRes.data) {
        setDashboardData(dashRes.data);
        const prof = dashRes.data.profile;
        if (prof) {
          setProfileFullName(prof.user?.fullName || prof.displayName || user?.fullName || 'Ravi');
          setProfileMobile(prof.user?.phone || user?.phone || '9510911130');
          if (prof.bio) setProfileBio(prof.bio);
          if (prof.user?.avatarUrl) setProfileAvatarUrl(prof.user.avatarUrl);
        }
      }
      if (catRes.success && catRes.data) {
        setCategories(catRes.data);
        if (catRes.data.length > 0 && !categoryId) setCategoryId(catRes.data[0].id);
      }
      if (platRes.success && platRes.data) {
        setPlatforms(platRes.data);
        // Find Amazon Prime or first platform
        const prime = platRes.data.find(
          (p: any) => p.slug === 'prime-video' || p.name.toLowerCase().includes('prime')
        );
        const defaultPlat = prime || platRes.data[0];
        if (defaultPlat && !platformId) {
          setPlatformId(defaultPlat.id);
          if (defaultPlat.categoryId) setCategoryId(defaultPlat.categoryId);
        }
      }
      if (withRes.success && withRes.data) {
        setWithdrawals(withRes.data);
      }
      if (ordersRes.success && ordersRes.data) {
        setMyOrders(ordersRes.data.data || []);
      }
      if (plansRes.success && plansRes.data) {
        setPlatformPlansConfig(plansRes.data);
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
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab === 'seller-profile' || tab === 'profile') {
        setActiveTab('seller-profile');
      } else if (tab === 'new-list') {
        setActiveTab('new-list');
      } else if (tab === 'overview' || tab === 'dashboard') {
        setActiveTab('overview');
      }
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  // Current selected platform object
  const selectedPlatformObj = platforms.find((p) => p.id === platformId);
  const currentPlatConfig = selectedPlatformObj
    ? platformPlansConfig[selectedPlatformObj.slug] || platformPlansConfig[selectedPlatformObj.slug.toLowerCase()]
    : null;
  const availableCategories: string[] =
    currentPlatConfig?.categories ||
    (currentPlatConfig?.plans ? currentPlatConfig.plans.map((p: any) => p.name) : []);

  // Compute Min and Max Price for the currently selected duration (1, 3, 6, 12 months)
  const durKey = String(durationMonths);
  const durConfig = currentPlatConfig?.durations?.[durKey];
  const minAllowedPrice = durConfig
    ? durConfig.minPrice
    : Math.round((currentPlatConfig?.minPrice ?? 30) * (durationMonths === 1 ? 1 : durationMonths === 3 ? 2.5 : durationMonths === 6 ? 5 : 9));
  const maxAllowedPrice = durConfig
    ? durConfig.maxPrice
    : Math.round((currentPlatConfig?.maxPrice ?? 300) * (durationMonths === 1 ? 1 : durationMonths === 3 ? 2.5 : durationMonths === 6 ? 5 : 9));

  // When platform changes, set initial category if available
  useEffect(() => {
    if (availableCategories.length > 0 && (!planName || !availableCategories.includes(planName))) {
      setPlanName(availableCategories[0]);
    }
  }, [platformId, platformPlansConfig]);

  const handleSelectCategory = (catName: string) => {
    setPlanName(catName);
    setCustomPlan(false);
    if (selectedPlatformObj) {
      const typeStr = accountType === 'Private Account' ? 'Private' : 'Shared';
      setTitle(`${selectedPlatformObj.name} - ${catName} (${typeStr})`);
    }
  };

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const chosenPlat = platforms.find((p) => p.id === platformId);
      const cat = chosenPlat?.categoryId || categoryId || categories[0]?.id;
      const listingTitle = title || `${chosenPlat?.name || 'Subscription'} - ${planName || 'Plan'}`;

      // Validate seller price against Admin's min and max price limits for this specific duration
      if (Number(price) < minAllowedPrice || Number(price) > maxAllowedPrice) {
        alert(
          `For ${durationMonths} Month(s) subscription of ${chosenPlat?.name || 'this OTT'}, price must be between ₹${minAllowedPrice} and ₹${maxAllowedPrice} as configured by Admin.`
        );
        return;
      }

      const res = await api.post('/listings', {
        categoryId: cat,
        platformId,
        title: listingTitle,
        planName: planName || 'Standard Plan',
        accountType: accountType === 'Private Account' ? 'Private' : 'Shared',
        description: description || `${listingTitle} - Instant access warranty included. Login: ${ownMail ? 'Own Mail' : 'Credentials'}`,
        durationMonths: Number(durationMonths),
        price: Number(price),
        originalPrice: Number(originalPrice || price * 2),
        accessType,
        deviceLimit: `${deviceLimit} Login`,
        quality,
        region: 'India',
        instructions: instructions || `Own Mail: ${ownMail}, Own Number: ${ownNumber}`,
        inventory: [
          {
            accountEmailOrId: initialEmail || 'service.slot@subvault.me',
            credentials: initialCredentials || 'Provided upon purchase via chat',
            notes: `${accountType} - Initial slot`,
          },
        ],
      });

      if (res.success) {
        alert('Listing published successfully!');
        setAddListingOpen(false);
        setActiveTab('listings');
        await loadData();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to create listing');
    }
  };

  const openEditModal = (listing: any) => {
    setEditingListing(listing);
    setEditForm({
      title: listing.title || '',
      planName: listing.planName || '',
      price: listing.price || 0,
      originalPrice: listing.originalPrice || 0,
      status: listing.status || 'ACTIVE',
      accountType: listing.accountType || (listing.accessType === 'PRIVATE_ACCOUNT' ? 'Private Account' : 'Shared Account'),
      description: listing.description || '',
    });
    setEditListingModalOpen(true);
  };

  const handleUpdateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingListing) return;
    try {
      const res = await api.patch(`/listings/${editingListing.id}`, {
        title: editForm.title,
        planName: editForm.planName,
        price: Number(editForm.price),
        originalPrice: Number(editForm.originalPrice),
        status: editForm.status,
        accountType: editForm.accountType,
        description: editForm.description,
      });

      if (res.success || res.data) {
        alert('Listing updated successfully!');
        setEditListingModalOpen(false);
        setEditingListing(null);
        await loadData();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update listing');
    }
  };

  const handleDeleteListing = async (listingId: string, listingTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${listingTitle}"? This will permanently delete the listing.`)) {
      return;
    }
    try {
      const res = await api.delete(`/listings/${listingId}`);
      if (res.success || res.data) {
        alert('Listing deleted successfully!');
        await loadData();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete listing');
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

  const getWordCount = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).filter(Boolean).length;
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      const res = await api.patch('/sellers/profile', {
        fullName: profileFullName,
        phone: profileMobile,
        bio: profileBio,
        avatarUrl: profileAvatarUrl,
      });

      if (res.success || res.data) {
        alert('Profile updated successfully!');
        await loadData();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  if (!user || (!isApprovedSeller && !isSeller)) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-100">
          <Store className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Seller Approval Required</h2>
        <p className="text-xs text-slate-500 mt-2 leading-relaxed">
          Seller ma listing mate Admin jode thi approval levu jaruri che. Tamaru seller application submit karo, Admin approve kare tyare j listing kari sakase.
        </p>
        <Link
          href="/become-seller"
          className="mt-5 inline-block px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors"
        >
          Apply for Seller Approval
        </Link>
      </div>
    );
  }

  const stats = dashboardData?.stats || {};

  // Sidebar navigation links - Ottly style
  const sellerSidebarItems = [
    { id: 'overview', label: 'Dashboard' },
    { id: 'seller-profile', label: 'Seller Profile' },
    { id: 'new-list', label: 'New List' },
    { id: 'messages', label: 'Messages', isRoute: true, href: '/messages' },
  ];

  const secondaryNavItems = [
    { label: 'Settings', href: '/wallet' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms & Conditions', href: '/terms' },
    { label: 'Brand Disclaimer', href: '/terms' },
    { label: 'Contact Us', href: '/contact' },
    { label: 'Feedback', href: '/contact' },
  ];

  return (
    <div className="w-full bg-[#fcfcfc] min-h-[calc(100vh-80px)] flex flex-col font-sans">
      {/* Top Black Announcement Banner (Ottly Exact) */}
      <div className="w-full bg-black text-white px-4 sm:px-8 py-2.5 text-[12px] flex flex-col sm:flex-row items-center justify-between gap-2 shadow-sm">
        <div className="flex items-center gap-2 text-slate-200">
          <span className="text-emerald-400 font-bold">ℹ</span>
          <span>
            Ottly will deduct 20% after each sale on regular listings and 30% after each sale on 6-month and yearly listings. Thank you for your support! — Team Ottly
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-rose-300 shrink-0">
          <span>📢 Announcement From 1st January 2026</span>
        </div>
      </div>

      {/* Top Status Row: Offline / Online Toggle & Today Filter (Ottly exact) */}
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 flex items-center justify-end gap-5 pt-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 select-none">
          <span className={isOnline ? 'text-gray-400' : 'text-gray-900 font-bold'}>Offline</span>
          <button
            type="button"
            role="switch"
            aria-checked={isOnline}
            onClick={() => setIsOnline(!isOnline)}
            className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ease-in-out ${
              isOnline ? 'bg-[#00a859]' : 'bg-gray-300'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                isOnline ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
          <span className={isOnline ? 'text-[#00a859] font-bold' : 'text-gray-400'}>Online</span>
        </div>

        <div className="relative flex items-center">
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="text-xs font-bold text-gray-900 bg-transparent pr-5 py-1 cursor-pointer focus:outline-none appearance-none"
          >
            <option value="Today">Today</option>
            <option value="Yesterday">Yesterday</option>
            <option value="Last 7 Days">Last 7 Days</option>
            <option value="This Month">This Month</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-gray-500 absolute right-0 pointer-events-none" />
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 py-6 flex-1 flex flex-col">
        {/* Main 2-Column Dashboard Shell: Sidebar + Content */}
        <div className="w-full flex-1 flex flex-col lg:flex-row items-start gap-8">
          {/* Left Navigation Sidebar (Ottly Exact) */}
          <div className="hidden lg:block w-[180px] shrink-0 space-y-6 pt-1">
            <nav className="space-y-3">
              {sellerSidebarItems.map((item) => {
                if (item.isRoute) {
                  return (
                    <Link
                      key={item.id}
                      href={item.href!}
                      className="block text-[14px] text-gray-700 hover:text-black font-normal transition-colors"
                    >
                      {item.label}
                    </Link>
                  );
                }
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`block text-[14px] text-left transition-colors ${
                      isActive
                        ? 'text-gray-900 font-bold border-b-2 border-black w-fit pb-0.5'
                        : 'text-gray-700 hover:text-black font-normal'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>

            <div className="pt-2 space-y-2.5">
              <span className="text-[12px] text-gray-400 block pb-1 border-b border-gray-100">Settings</span>
              {secondaryNavItems.slice(1).map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="block text-[13px] text-gray-600 hover:text-black transition-colors"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/login"
                className="block text-[13px] text-gray-600 hover:text-red-600 transition-colors pt-1"
              >
                Logout
              </Link>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0 w-full space-y-6">
            {/* Top Quick Tabs on Mobile/Tablet */}
            <div className="lg:hidden flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-200 text-xs">
              {[
                { id: 'overview', label: 'Dashboard' },
                { id: 'seller-profile', label: 'Seller Profile' },
                { id: 'new-list', label: 'New List' },
                { id: 'orders', label: `Orders (${myOrders.length})` },
                { id: 'payouts', label: 'Payouts' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id as any)}
                  className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 ${
                    activeTab === t.id ? 'bg-black text-white' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* TAB: NEW LIST (Ottly Screenshot Layout) */}
            {activeTab === 'new-list' && (
              <div className="space-y-5">
                {/* Regular vs Bundle Listing Toggle Pills */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setListingMode('regular')}
                    className={`px-5 py-2 rounded-full text-xs font-bold transition-all shadow-2xs ${
                      listingMode === 'regular'
                        ? 'bg-[#10b981] hover:bg-[#059669] text-white'
                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Regular Listing
                  </button>
                  <button
                    type="button"
                    onClick={() => setListingMode('bundle')}
                    className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
                      listingMode === 'bundle'
                        ? 'bg-[#10b981] hover:bg-[#059669] text-white'
                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Bundle Listing
                  </button>
                </div>

                {/* Main 2-Column Form Layout: Left Form + Right "Request a Platform" Card */}
                <div className="flex flex-col lg:flex-row items-start gap-6">
                  {/* Left Form Card */}
                  <form
                    onSubmit={handleCreateListing}
                    className="flex-1 bg-white border border-gray-200 rounded-xl p-6 sm:p-7 space-y-4 shadow-2xs w-full"
                  >
                    {/* 1. Only Platform Name */}
                    <div className="space-y-1.5">
                      <label className="text-[12px] font-semibold text-gray-700 block">
                        Only Platform Name
                      </label>
                      <select
                        value={platformId}
                        onChange={(e) => {
                          setPlatformId(e.target.value);
                          const pObj = platforms.find((pl) => pl.id === e.target.value);
                          if (pObj) {
                            if (pObj.categoryId) setCategoryId(pObj.categoryId);
                            const platCfg =
                              platformPlansConfig[pObj.slug] || platformPlansConfig[pObj.slug.toLowerCase()];
                            const cats =
                              platCfg?.categories ||
                              (platCfg?.plans ? platCfg.plans.map((p: any) => p.name || p) : []);
                            if (cats.length > 0) {
                              handleSelectCategory(cats[0]);
                            } else {
                              setPlanName('');
                            }
                          }
                        }}
                        className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-gray-500 shadow-2xs cursor-pointer"
                      >
                        {platforms.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 2. Category or Plan Name & Number of Device Login */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Left: Category or Plan Name (Loaded dynamically from admin plans config) */}
                      <div className="space-y-1.5">
                        <label className="text-[12px] font-semibold text-gray-700 block">
                          Category or Plan Name
                        </label>
                        <select
                          value={planName}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === '__custom__') {
                              setCustomPlan(true);
                              setPlanName('');
                            } else {
                              setCustomPlan(false);
                              handleSelectCategory(val);
                            }
                          }}
                          className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-gray-500 shadow-2xs cursor-pointer"
                        >
                          <option value="">Select...</option>
                          {availableCategories.map((catName: string) => (
                            <option key={catName} value={catName}>
                              {catName}
                            </option>
                          ))}
                          <option value="__custom__">+ Custom Plan Name</option>
                        </select>

                        {/* Optional custom plan text input if selected */}
                        {customPlan && (
                          <input
                            type="text"
                            placeholder="Enter custom plan name..."
                            value={planName}
                            onChange={(e) => setPlanName(e.target.value)}
                            className="w-full mt-1.5 bg-gray-50 border border-gray-300 rounded-md px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-gray-500"
                            autoFocus
                          />
                        )}
                      </div>

                      {/* Right: Number of Device Login */}
                      <div className="space-y-1.5">
                        <label className="text-[12px] font-semibold text-gray-700 block">
                          Number of Device Login
                        </label>
                        <select
                          value={deviceLimit}
                          onChange={(e) => setDeviceLimit(e.target.value)}
                          className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-gray-500 shadow-2xs cursor-pointer"
                        >
                          <option value="1">1</option>
                          <option value="2">2</option>
                          <option value="3">3</option>
                          <option value="4">4</option>
                          <option value="5">5</option>
                          <option value="Unlimited">Unlimited</option>
                        </select>
                      </div>
                    </div>

                    {/* 3. Checkboxes: Own Mail & Own Number (Ottly exact) */}
                    <div className="flex items-center gap-6 pt-1">
                      <label className="flex items-center gap-2 text-xs font-medium text-gray-800 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={ownMail}
                          onChange={(e) => setOwnMail(e.target.checked)}
                          className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        />
                        <span className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-gray-500" /> Own Mail
                        </span>
                      </label>

                      <label className="flex items-center gap-2 text-xs font-medium text-gray-800 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={ownNumber}
                          onChange={(e) => setOwnNumber(e.target.checked)}
                          className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        />
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-gray-500" /> Own Number
                        </span>
                      </label>
                    </div>

                    {/* 4. Account Type: Shared Account vs Private Account */}
                    <div className="space-y-1.5 pt-1">
                      <label className="text-xs font-semibold text-gray-700 block">
                        Account Type (ખાતાનો પ્રકાર) *
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setAccountType('Shared Account');
                            if (accessType === 'PRIVATE_ACCOUNT') setAccessType('SHARED_SCREEN');
                          }}
                          className={`p-3 rounded-lg border text-left flex items-start gap-2.5 transition-all ${
                            accountType === 'Shared Account'
                              ? 'border-emerald-600 bg-emerald-50/70 ring-1 ring-emerald-500/20'
                              : 'border-gray-200 bg-gray-50 hover:bg-white'
                          }`}
                        >
                          <span className="text-xl">🤝</span>
                          <div>
                            <div className="text-xs font-bold text-gray-900">Shared Account</div>
                            <div className="text-[10px] text-gray-500 mt-0.5">Shared Screen / Profile PIN / Slot</div>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setAccountType('Private Account');
                            setAccessType('PRIVATE_ACCOUNT');
                          }}
                          className={`p-3 rounded-lg border text-left flex items-start gap-2.5 transition-all ${
                            accountType === 'Private Account'
                              ? 'border-emerald-600 bg-emerald-50/70 ring-1 ring-emerald-500/20'
                              : 'border-gray-200 bg-gray-50 hover:bg-white'
                          }`}
                        >
                          <span className="text-xl">🔒</span>
                          <div>
                            <div className="text-xs font-bold text-gray-900">Private Account</div>
                            <div className="text-[10px] text-gray-500 mt-0.5">Full Dedicated Account / Email Invite</div>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* 5. Pricing & Duration */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-[12px] font-semibold text-gray-700 block">Duration (Months) *</label>
                        <select
                          value={durationMonths}
                          onChange={(e) => setDurationMonths(Number(e.target.value))}
                          className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-gray-500"
                        >
                          <option value="1">1 Month (30 Days)</option>
                          <option value="3">3 Months</option>
                          <option value="6">6 Months</option>
                          <option value="12">12 Months (1 Year)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-[12px] font-semibold text-gray-700 block">Selling Price (₹) *</label>
                          <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {durationMonths} Mo: Min ₹{minAllowedPrice} - Max ₹{maxAllowedPrice}
                          </span>
                        </div>
                        <input
                          type="number"
                          required
                          min={minAllowedPrice}
                          max={maxAllowedPrice}
                          value={price}
                          onChange={(e) => setPrice(Number(e.target.value))}
                          className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-gray-500 font-semibold"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[12px] font-semibold text-gray-700 block">Original / Retail Price (₹)</label>
                        <input
                          type="number"
                          value={originalPrice}
                          onChange={(e) => setOriginalPrice(Number(e.target.value))}
                          className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-gray-500"
                        />
                      </div>
                    </div>

                    {/* 6. Enter Description (Ottly Textarea with 1/200 counter) */}
                    <div className="space-y-1">
                      <label className="text-[12px] font-semibold text-gray-700 block">Enter Description</label>
                      <div className="relative">
                        <textarea
                          rows={4}
                          maxLength={200}
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Enter details like renewal warranty, instant delivery, profile rules..."
                          className="w-full bg-white border border-gray-300 rounded-md p-3 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-500 resize-none shadow-2xs"
                        />
                        <div className="text-right text-[11px] text-gray-400 mt-0.5">
                          {description.length}/200
                        </div>
                      </div>
                    </div>

                    {/* 7. Initial Credentials / Inventory Slot */}
                    <div className="p-3.5 rounded-lg bg-gray-50 border border-gray-200 space-y-2.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800">
                        <Key className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Initial Account Credentials (Auto-dispatched via chat upon order)</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="Login Email or Account ID"
                          value={initialEmail}
                          onChange={(e) => setInitialEmail(e.target.value)}
                          className="w-full bg-white border border-gray-300 rounded-md px-3 py-1.5 text-xs text-gray-900"
                        />
                        <input
                          type="text"
                          placeholder="Password / Screen PIN / Invite Link"
                          value={initialCredentials}
                          onChange={(e) => setInitialCredentials(e.target.value)}
                          className="w-full bg-white border border-gray-300 rounded-md px-3 py-1.5 text-xs text-gray-900"
                        />
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        className="w-full py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-colors flex items-center justify-center gap-2"
                      >
                        <PlusCircle className="w-4 h-4" />
                        <span>Submit & Publish Listing</span>
                      </button>
                    </div>
                  </form>

                  {/* Right Card: Request a Platform (Ottly Exact) */}
                  <div className="w-full lg:w-[320px] shrink-0">
                    <div className="bg-white border border-gray-200 rounded-xl p-6 text-center shadow-2xs space-y-4">
                      <p className="text-xs text-gray-600 leading-relaxed font-normal">
                        Can&apos;t find the subscription you&apos;re looking for? Just send us the platform name, we&apos;ll list it on Ottly within 24 hours!
                      </p>
                      <div className="text-xs font-bold text-gray-900">Request a Platform</div>
                      <button
                        type="button"
                        onClick={() => setRequestPlatformModalOpen(true)}
                        className="w-12 h-12 rounded-full bg-[#10b981] hover:bg-[#059669] text-white flex items-center justify-center mx-auto shadow-sm transition-transform hover:scale-105"
                      >
                        <Plus className="w-6 h-6 stroke-[3]" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: OVERVIEW (DASHBOARD) */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-900">Store Dashboard Overview</h2>
                  <button
                    onClick={() => setActiveTab('new-list')}
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>New Listing</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs">
                    <span className="text-xs text-gray-500">Available Earnings</span>
                    <div className="text-2xl font-extrabold text-emerald-600 mt-2">
                      {formatCurrency(stats.availableEarnings || 0)}
                    </div>
                  </div>
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs">
                    <span className="text-xs text-gray-500">Total Orders</span>
                    <div className="text-2xl font-extrabold text-gray-900 mt-2">
                      {stats.totalOrders || myOrders.length}
                    </div>
                  </div>
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs">
                    <span className="text-xs text-gray-500">Active Listings</span>
                    <div className="text-2xl font-extrabold text-gray-900 mt-2">
                      {myListings.length}
                    </div>
                  </div>
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs">
                    <span className="text-xs text-gray-500">Merchant Rating</span>
                    <div className="text-2xl font-extrabold text-amber-600 mt-2">
                      ★ {dashboardData?.profile?.rating?.toFixed(1) || '5.0'}
                    </div>
                  </div>
                </div>

                {/* My Listings Table inside Dashboard */}
                <div className="space-y-4 pt-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-gray-900">My Listings ({myListings.length})</h3>
                  </div>

                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs">
                    {myListings.length === 0 ? (
                      <div className="p-12 text-center text-xs text-gray-400">
                        No listings created yet. Click &ldquo;New List&rdquo; to start selling subscriptions.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="text-[11px] text-gray-500 uppercase tracking-wider border-b border-gray-200 bg-gray-50">
                            <tr>
                              <th className="py-3 px-4">Platform & Title</th>
                              <th className="py-3 px-4">Plan Name</th>
                              <th className="py-3 px-4">Type</th>
                              <th className="py-3 px-4">Price</th>
                              <th className="py-3 px-4">Status</th>
                              <th className="py-3 px-4 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {myListings.map((l) => (
                              <tr key={l.id} className="hover:bg-gray-50">
                                <td className="py-3.5 px-4 font-bold text-gray-900">{l.title}</td>
                                <td className="py-3.5 px-4 text-gray-600">{l.planName}</td>
                                <td className="py-3.5 px-4">
                                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-700">
                                    {l.accountType || l.accessType}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 font-bold text-emerald-600">
                                  {formatCurrency(l.price)}
                                </td>
                                <td className="py-3.5 px-4">
                                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    {l.status}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      onClick={() => openEditModal(l)}
                                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-semibold border border-blue-200 transition-colors"
                                      title="Modify Listing"
                                    >
                                      <Pencil className="w-3 h-3" />
                                      <span>Modify</span>
                                    </button>
                                    <button
                                      onClick={() => handleDeleteListing(l.id, l.title)}
                                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-semibold border border-rose-200 transition-colors"
                                      title="Delete Listing"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                      <span>Delete</span>
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: SELLER PROFILE (Ottly exact) */}
            {activeTab === 'seller-profile' && (
              <div className="w-full flex flex-col lg:flex-row items-start justify-between gap-10">
                {/* Left Column: Edit Profile */}
                <div className="w-full max-w-xl flex-1 space-y-6">
                  <h2 className="text-xl font-bold text-gray-900 tracking-tight">Edit Profile</h2>

                  {/* Profile Avatar with Green '+' Badge */}
                  <div className="relative w-24 h-24">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-emerald-500 bg-black flex items-center justify-center shadow-sm">
                      {profileAvatarUrl ? (
                        <img
                          src={profileAvatarUrl}
                          alt="Seller Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-[#07131b] text-white p-2 text-center select-none">
                          <span className="text-[12px] font-black tracking-widest text-[#00a859]">OTTZONE</span>
                          <span className="text-[6.5px] text-gray-400 tracking-tighter">PREMIUM OTT & APP</span>
                        </div>
                      )}
                    </div>
                    <label
                      htmlFor="seller-avatar-upload"
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-6 bg-[#00a859] hover:bg-[#00924c] rounded-full flex items-center justify-center text-white border-2 border-white shadow-md cursor-pointer transition-transform hover:scale-110"
                      title="Change Profile Photo"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[3]" />
                      <input
                        id="seller-avatar-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setProfileAvatarUrl(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>

                  <form onSubmit={handleUpdateProfile} className="space-y-4 pt-1">
                    {/* Full Name */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Full Name</label>
                      <input
                        type="text"
                        required
                        value={profileFullName}
                        onChange={(e) => setProfileFullName(e.target.value)}
                        className="w-full bg-[#f8fafc] border border-gray-200 rounded-lg px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#00a859] focus:bg-white transition-all shadow-2xs"
                        placeholder="Ravi"
                      />
                    </div>

                    {/* Mobile */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Mobile</label>
                      <input
                        type="text"
                        value={profileMobile}
                        onChange={(e) => setProfileMobile(e.target.value)}
                        className="w-full bg-[#f8fafc] border border-gray-200 rounded-lg px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#00a859] focus:bg-white transition-all shadow-2xs"
                        placeholder="9510911130"
                      />
                    </div>

                    {/* Description (Max 30 words) */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Description (Max 30 words)</label>
                      <textarea
                        rows={3}
                        value={profileBio}
                        onChange={(e) => setProfileBio(e.target.value)}
                        className="w-full bg-[#f8fafc] border border-gray-200 rounded-lg px-3.5 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#00a859] focus:bg-white transition-all shadow-2xs resize-none"
                        placeholder="⭐ All OTTs, VPNs & Apps | 💰 Lowest Prices | ⚡ Instant Activation | 💬 Fast Response |"
                      />
                      <div className="flex justify-end text-[11px] text-gray-500 font-medium mt-1">
                        <span>{getWordCount(profileBio)}/30</span>
                      </div>
                    </div>

                    {/* Update Profile Button */}
                    <button
                      type="submit"
                      disabled={isUpdatingProfile}
                      className="w-full py-2.5 px-4 rounded-lg bg-[#00a859] hover:bg-[#00924c] text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                    >
                      {isUpdatingProfile ? 'Updating Profile...' : 'Update Profile'}
                    </button>
                  </form>
                </div>

                {/* Right Column: Join Our Seller's WhatsApp Community */}
                <div className="w-full lg:w-[380px] xl:w-[410px] bg-[#fef4ea] border border-[#fae2c8] rounded-2xl p-7 text-center shadow-2xs shrink-0 self-start">
                  <h3 className="text-xl font-bold text-gray-900 leading-tight">
                    Join Our Seller&apos;s
                  </h3>
                  <h3 className="text-xl font-bold text-[#00a859] leading-tight">
                    WhatsApp Community
                  </h3>
                  <p className="text-xs text-gray-600 mt-2 max-w-[280px] mx-auto leading-relaxed">
                    Join the group to see buyer demand and stay up to date with Ottly seller policies.
                  </p>

                  {/* WhatsApp QR Code Card */}
                  <div className="my-6 p-4 bg-white rounded-2xl shadow-xs inline-block mx-auto border border-amber-100">
                    <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
                      <svg viewBox="0 0 160 160" className="w-full h-full">
                        <rect width="160" height="160" fill="white" />
                        {/* Corner Target 1 (Top Left) */}
                        <rect x="10" y="10" width="40" height="40" fill="black" rx="5" />
                        <rect x="16" y="16" width="28" height="28" fill="white" rx="3" />
                        <rect x="22" y="22" width="16" height="16" fill="black" rx="2" />
                        {/* Corner Target 2 (Top Right) */}
                        <rect x="110" y="10" width="40" height="40" fill="black" rx="5" />
                        <rect x="116" y="16" width="28" height="28" fill="white" rx="3" />
                        <rect x="122" y="22" width="16" height="16" fill="black" rx="2" />
                        {/* Corner Target 3 (Bottom Left) */}
                        <rect x="10" y="110" width="40" height="40" fill="black" rx="5" />
                        <rect x="16" y="116" width="28" height="28" fill="white" rx="3" />
                        <rect x="22" y="122" width="16" height="16" fill="black" rx="2" />

                        {/* Pixel pattern matrix */}
                        <rect x="56" y="12" width="6" height="6" fill="black" />
                        <rect x="68" y="12" width="6" height="6" fill="black" />
                        <rect x="80" y="12" width="6" height="6" fill="black" />
                        <rect x="92" y="12" width="6" height="6" fill="black" />
                        <rect x="56" y="24" width="6" height="6" fill="black" />
                        <rect x="80" y="24" width="6" height="6" fill="black" />
                        <rect x="68" y="36" width="6" height="6" fill="black" />
                        <rect x="92" y="36" width="6" height="6" fill="black" />
                        <rect x="56" y="48" width="6" height="6" fill="black" />
                        <rect x="68" y="48" width="6" height="6" fill="black" />
                        <rect x="80" y="48" width="6" height="6" fill="black" />
                        <rect x="12" y="56" width="6" height="6" fill="black" />
                        <rect x="24" y="56" width="6" height="6" fill="black" />
                        <rect x="36" y="56" width="6" height="6" fill="black" />
                        <rect x="48" y="56" width="6" height="6" fill="black" />
                        <rect x="106" y="56" width="6" height="6" fill="black" />
                        <rect x="118" y="56" width="6" height="6" fill="black" />
                        <rect x="130" y="56" width="6" height="6" fill="black" />
                        <rect x="142" y="56" width="6" height="6" fill="black" />
                        <rect x="12" y="68" width="6" height="6" fill="black" />
                        <rect x="36" y="68" width="6" height="6" fill="black" />
                        <rect x="118" y="68" width="6" height="6" fill="black" />
                        <rect x="142" y="68" width="6" height="6" fill="black" />
                        <rect x="12" y="80" width="6" height="6" fill="black" />
                        <rect x="24" y="80" width="6" height="6" fill="black" />
                        <rect x="48" y="80" width="6" height="6" fill="black" />
                        <rect x="106" y="80" width="6" height="6" fill="black" />
                        <rect x="130" y="80" width="6" height="6" fill="black" />
                        <rect x="12" y="92" width="6" height="6" fill="black" />
                        <rect x="36" y="92" width="6" height="6" fill="black" />
                        <rect x="118" y="92" width="6" height="6" fill="black" />
                        <rect x="142" y="92" width="6" height="6" fill="black" />
                        <rect x="56" y="106" width="6" height="6" fill="black" />
                        <rect x="68" y="106" width="6" height="6" fill="black" />
                        <rect x="80" y="106" width="6" height="6" fill="black" />
                        <rect x="92" y="106" width="6" height="6" fill="black" />
                        <rect x="106" y="106" width="6" height="6" fill="black" />
                        <rect x="118" y="106" width="6" height="6" fill="black" />
                        <rect x="130" y="106" width="6" height="6" fill="black" />
                        <rect x="142" y="106" width="6" height="6" fill="black" />
                        <rect x="56" y="118" width="6" height="6" fill="black" />
                        <rect x="80" y="118" width="6" height="6" fill="black" />
                        <rect x="106" y="118" width="6" height="6" fill="black" />
                        <rect x="130" y="118" width="6" height="6" fill="black" />
                        <rect x="68" y="130" width="6" height="6" fill="black" />
                        <rect x="92" y="130" width="6" height="6" fill="black" />
                        <rect x="118" y="130" width="6" height="6" fill="black" />
                        <rect x="142" y="130" width="6" height="6" fill="black" />
                        <rect x="56" y="142" width="6" height="6" fill="black" />
                        <rect x="68" y="142" width="6" height="6" fill="black" />
                        <rect x="80" y="142" width="6" height="6" fill="black" />
                        <rect x="106" y="142" width="6" height="6" fill="black" />
                        <rect x="130" y="142" width="6" height="6" fill="black" />
                      </svg>

                      {/* WhatsApp logo in center */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-11 h-11 bg-white rounded-full p-1 shadow-md flex items-center justify-center">
                          <div className="w-9 h-9 bg-[#25D366] rounded-full flex items-center justify-center text-white">
                            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                              <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 6.46 17.5 2 12.04 2M12.05 20.15C10.57 20.15 9.12 19.76 7.85 19.01L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.81 13.47 3.81 11.91C3.81 7.37 7.5 3.68 12.04 3.68C16.58 3.68 20.27 7.37 20.27 11.91C20.27 16.46 16.59 20.15 12.05 20.15M16.57 14.36C16.32 14.23 15.1 13.63 14.87 13.55C14.65 13.47 14.48 13.43 14.32 13.67C14.16 13.91 13.69 14.47 13.54 14.64C13.4 14.81 13.25 14.83 13 14.71C12.75 14.58 11.95 14.32 11 13.47C10.26 12.81 9.76 11.99 9.61 11.75C9.47 11.5 9.6 11.37 9.72 11.25C9.83 11.14 9.97 10.96 10.09 10.82C10.21 10.68 10.25 10.58 10.33 10.42C10.41 10.25 10.37 10.11 10.31 9.99C10.25 9.86 9.76 8.66 9.56 8.16C9.36 7.68 9.16 7.74 9.01 7.73C8.87 7.73 8.71 7.73 8.54 7.73C8.38 7.73 8.11 7.79 7.89 8.03C7.66 8.28 7.03 8.87 7.03 10.08C7.03 11.28 7.91 12.44 8.03 12.61C8.16 12.77 9.75 15.23 12.19 16.28C12.77 16.53 13.22 16.68 13.57 16.79C14.15 16.98 14.68 16.95 15.1 16.89C15.57 16.82 16.55 16.3 16.75 15.72C16.96 15.15 16.96 14.66 16.89 14.54C16.83 14.42 16.68 14.36 16.57 14.36Z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 font-medium">
                    Be the first to access limited deals on <span className="font-bold text-gray-900">Ottly</span>.
                  </p>

                  <a
                    href="https://chat.whatsapp.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 block w-full py-2.5 px-6 rounded-full bg-[#00a859] hover:bg-[#00924c] text-white font-bold text-xs tracking-wide shadow-sm transition-all text-center"
                  >
                    Join Now
                  </a>
                </div>
              </div>
            )}

            {/* TAB: ORDERS */}
            {activeTab === 'orders' && (
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-2xs space-y-4">
                <h2 className="text-base font-bold text-gray-900">Orders Received ({myOrders.length})</h2>
                {myOrders.length === 0 ? (
                  <p className="text-xs text-gray-400 py-6 text-center">No orders received yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="text-[11px] text-gray-500 uppercase border-b border-gray-200 bg-gray-50">
                        <tr>
                          <th className="py-2.5 px-3">Order Number</th>
                          <th className="py-2.5 px-3">Buyer</th>
                          <th className="py-2.5 px-3">Date</th>
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-3 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {myOrders.map((o) => (
                          <tr key={o.id} className="hover:bg-gray-50">
                            <td className="py-3 px-3 font-mono text-gray-700">#{o.orderNumber}</td>
                            <td className="py-3 px-3 font-medium text-gray-900">{o.buyer?.fullName}</td>
                            <td className="py-3 px-3 text-gray-500">{formatDate(o.createdAt)}</td>
                            <td className="py-3 px-3">
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700">
                                {o.status}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right font-bold text-gray-900">
                              {formatCurrency(o.totalAmount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TAB: PAYOUTS */}
            {activeTab === 'payouts' && (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs text-gray-500">Available for Payout</span>
                    <div className="text-3xl font-extrabold text-gray-900 mt-1">
                      {formatCurrency(stats.availableEarnings || 0)}
                    </div>
                  </div>
                  <button
                    onClick={() => setWithdrawalModalOpen(true)}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                    Request Withdrawal
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal: Request a Platform */}
      {requestPlatformModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900">Request a Platform</h3>
              <button
                onClick={() => setRequestPlatformModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-500">
              Tell us which platform you would like to sell. Our team will verify and add it to Ottly within 24 hours.
            </p>
            <input
              type="text"
              placeholder="e.g. JioCinema, Apple TV+, Crunchyroll..."
              value={requestedPlatformName}
              onChange={(e) => setRequestedPlatformName(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-xs text-gray-900 focus:outline-none focus:border-emerald-600"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRequestPlatformModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (requestedPlatformName.trim()) {
                    alert(`Platform request for "${requestedPlatformName}" submitted to Admin!`);
                    setRequestedPlatformName('');
                    setRequestPlatformModalOpen(false);
                  }
                }}
                className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}



      {/* Modal: Request Withdrawal */}
      {withdrawalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900">Request Payout</h3>
              <button
                onClick={() => setWithdrawalModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleRequestWithdrawal} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-gray-700 block mb-1">Amount (₹)</label>
                <input
                  type="number"
                  min="200"
                  required
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-gray-700 block mb-1">Payout Method</label>
                <select
                  value={withdrawMethod}
                  onChange={(e) => setWithdrawMethod(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900"
                >
                  <option value="UPI">UPI (Instant VPA)</option>
                  <option value="BANK_TRANSFER">Bank IMPS Transfer</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-gray-700 block mb-1">UPI ID / Bank Details</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. mobile@paytm or UPI ID"
                  value={withdrawDetails}
                  onChange={(e) => setWithdrawDetails(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setWithdrawalModalOpen(false)}
                  className="px-4 py-2 text-xs text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
                >
                  Request Payout
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Modify / Edit Listing */}
      {editListingModalOpen && editingListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-gray-900">Modify Listing</h3>
                <p className="text-[11px] text-gray-500">Edit price, status, plan name or account type</p>
              </div>
              <button
                onClick={() => {
                  setEditListingModalOpen(false);
                  setEditingListing(null);
                }}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateListing} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-semibold text-gray-700 block mb-1">Listing Title</label>
                <input
                  type="text"
                  required
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-gray-700 block mb-1">Plan / Category Name</label>
                  <input
                    type="text"
                    required
                    value={editForm.planName}
                    onChange={(e) => setEditForm({ ...editForm, planName: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-gray-700 block mb-1">Account Type</label>
                  <select
                    value={editForm.accountType}
                    onChange={(e) => setEditForm({ ...editForm, accountType: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Shared Account">Shared Account</option>
                    <option value="Private Account">Private Account</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-gray-700 block mb-1">Selling Price (₹)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={editForm.price}
                    onChange={(e) => setEditForm({ ...editForm, price: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs font-bold text-emerald-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-gray-700 block mb-1">Original MRP Price (₹)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={editForm.originalPrice}
                    onChange={(e) => setEditForm({ ...editForm, originalPrice: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-700 block mb-1">Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs font-semibold text-gray-900 focus:outline-none focus:border-emerald-500"
                >
                  <option value="ACTIVE">ACTIVE (Listed & Purchasable)</option>
                  <option value="PAUSED">PAUSED (Temporarily hidden)</option>
                  <option value="SOLD_OUT">SOLD OUT</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-700 block mb-1">Description / Notes</label>
                <textarea
                  rows={2}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  placeholder="Terms, profile details, delivery note..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditListingModalOpen(false);
                    setEditingListing(null);
                  }}
                  className="px-3.5 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-2xs transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
