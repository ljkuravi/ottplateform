'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { ListingCard } from '@/components/marketplace/ListingCard';
import {
  Search,
  ArrowRight,
  ShieldCheck,
  Zap,
  Sparkles,
  Tv,
  Percent,
  CheckCircle2,
  Flame,
  Star,
  Lock,
  Layers,
  Tag,
  Shield,
  TrendingUp,
  X,
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { user, isSeller, isApprovedSeller } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [featuredListings, setFeaturedListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'subscriptions' | 'tools' | 'bundles' | 'trusted'>('all');

  // Real popular platforms with actual logos & starting prices
  const popularPlatforms = [
    {
      name: 'Netflix',
      slug: 'netflix',
      price: 'From ₹69/mo',
      logoUrl: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=160&auto=format&fit=crop&q=80',
    },
    {
      name: 'Prime Video',
      slug: 'prime-video',
      price: 'From ₹49/mo',
      logoUrl: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=160&auto=format&fit=crop&q=80',
    },
    {
      name: 'ChatGPT Plus',
      slug: 'chatgpt-plus',
      price: 'From ₹199/mo',
      logoUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=160&auto=format&fit=crop&q=80',
    },
    {
      name: 'Hotstar',
      slug: 'hotstar',
      price: 'From ₹49/mo',
      logoUrl: 'https://images.unsplash.com/photo-1585951237318-9ea5e175b891?w=160&auto=format&fit=crop&q=80',
    },
    {
      name: 'Canva Pro',
      slug: 'canva-pro',
      price: 'From ₹49/mo',
      logoUrl: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=160&auto=format&fit=crop&q=80',
    },
    {
      name: 'Spotify Premium',
      slug: 'spotify-premium',
      price: 'From ₹39/mo',
      logoUrl: 'https://images.unsplash.com/photo-1614680376593-902f749f7ffc?w=160&auto=format&fit=crop&q=80',
    },
    {
      name: 'YouTube Premium',
      slug: 'youtube-premium',
      price: 'From ₹39/mo',
      logoUrl: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=160&auto=format&fit=crop&q=80',
    },
    {
      name: 'Sony LIV',
      slug: 'sony-liv',
      price: 'From ₹49/mo',
      logoUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=160&auto=format&fit=crop&q=80',
    },
  ];

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [catsRes, listingsRes] = await Promise.all([
          api.get('/categories'),
          api.get('/listings?limit=24&sortBy=popular'),
        ]);

        if (catsRes.success && catsRes.data) {
          setCategories(catsRes.data);
        }

        if (listingsRes.success && listingsRes.data) {
          setFeaturedListings(listingsRes.data);
        }
      } catch (err) {
        console.error('Failed to load home data', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadHomeData();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // If marketplace section is on this page, scroll down smoothly
      const el = document.getElementById('marketplace');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handlePlatformClick = (slug: string) => {
    if (selectedPlatform === slug) {
      setSelectedPlatform(null);
    } else {
      setSelectedPlatform(slug);
      const el = document.getElementById('marketplace');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Filter listings based on active tab, selected platform & search query
  const displayedListings = useMemo(() => {
    return featuredListings.filter((listing) => {
      // 1. Platform Filter
      if (selectedPlatform) {
        const platSlug = listing.platform?.slug?.toLowerCase() || '';
        const platName = listing.platform?.name?.toLowerCase() || '';
        const title = listing.title?.toLowerCase() || '';
        const matchesPlat =
          platSlug.includes(selectedPlatform) ||
          platName.includes(selectedPlatform) ||
          title.includes(selectedPlatform);
        if (!matchesPlat) return false;
      }

      // 2. Tab Filter
      if (activeTab === 'subscriptions') {
        const catSlug = listing.category?.slug?.toLowerCase() || '';
        const catName = listing.category?.name?.toLowerCase() || '';
        const isSub =
          catSlug.includes('ott') ||
          catSlug.includes('stream') ||
          catName.includes('ott') ||
          catName.includes('stream') ||
          catName.includes('video');
        if (!isSub) return false;
      } else if (activeTab === 'tools') {
        const catSlug = listing.category?.slug?.toLowerCase() || '';
        const catName = listing.category?.name?.toLowerCase() || '';
        const title = listing.title?.toLowerCase() || '';
        const isTool =
          catSlug.includes('ai') ||
          catSlug.includes('design') ||
          catSlug.includes('tool') ||
          title.includes('chatgpt') ||
          title.includes('canva');
        if (!isTool) return false;
      } else if (activeTab === 'bundles') {
        const title = listing.title?.toLowerCase() || '';
        const plan = listing.planName?.toLowerCase() || '';
        const isBundle =
          title.includes('bundle') ||
          title.includes('combo') ||
          plan.includes('bundle') ||
          listing.durationMonths >= 6;
        if (!isBundle) return false;
      } else if (activeTab === 'trusted') {
        if (!listing.seller?.isVerified && (listing.seller?.rating || 0) < 4.5) {
          return false;
        }
      }

      // 3. Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const title = listing.title?.toLowerCase() || '';
        const plan = listing.planName?.toLowerCase() || '';
        const platName = listing.platform?.name?.toLowerCase() || '';
        const sellerName = listing.seller?.displayName?.toLowerCase() || '';
        const catName = listing.category?.name?.toLowerCase() || '';
        return (
          title.includes(query) ||
          plan.includes(query) ||
          platName.includes(query) ||
          sellerName.includes(query) ||
          catName.includes(query)
        );
      }

      return true;
    });
  }, [featuredListings, selectedPlatform, activeTab, searchQuery]);

  return (
    <div className="flex flex-col w-full bg-[#F7F9FC] min-h-screen text-[#101828] pb-24 font-sans">
      {/* 1. Top Brands Quick Ticker */}
      <section className="w-full bg-white border-b border-[#E2E8F0] py-3 px-4 sm:px-6 lg:px-8 xl:px-10 shadow-2xs">
        <div className="w-full flex items-center justify-between gap-4">
          <div className="hidden lg:flex items-center gap-2 text-xs font-bold text-[#101828] shrink-0">
            <Flame className="w-4 h-4 text-[#059669]" />
            <span className="uppercase tracking-wider">Top Brands:</span>
          </div>

          <div className="flex-1 flex items-center gap-2.5 overflow-x-auto py-1 scrollbar-none w-full">
            {popularPlatforms.map((plat) => {
              const isSelected = selectedPlatform === plat.slug;
              return (
                <button
                  key={plat.slug}
                  onClick={() => handlePlatformClick(plat.slug)}
                  className={`flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl border transition-all shrink-0 text-left cursor-pointer group ${
                    isSelected
                      ? 'bg-emerald-50 border-[#059669] shadow-2xs ring-1 ring-[#059669]'
                      : 'bg-white hover:bg-[#F8FAFC] border-[#E2E8F0] hover:border-[#CBD5E1]'
                  }`}
                >
                  <div className="w-5 h-5 rounded-md overflow-hidden bg-slate-100 border border-[#E2E8F0] flex-shrink-0 p-0.5">
                    <img
                      src={plat.logoUrl}
                      alt={plat.name}
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                  <span className="text-xs font-semibold text-[#101828] group-hover:text-[#059669] transition-colors whitespace-nowrap">
                    {plat.name}
                  </span>
                  <span className="text-[10px] text-[#64748B] font-medium hidden sm:inline">
                    {plat.price}
                  </span>
                </button>
              );
            })}
          </div>

          {selectedPlatform ? (
            <button
              onClick={() => setSelectedPlatform(null)}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 whitespace-nowrap flex items-center gap-1 shrink-0 px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          ) : (
            <Link
              href="/browse"
              className="text-xs font-bold text-[#059669] hover:text-[#047857] whitespace-nowrap hidden sm:flex items-center gap-1 shrink-0"
            >
              <span>Explore All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </section>

      {/* 2. Hero Section — Production Ready Two-Column Layout */}
      <section className="relative w-full pt-8 sm:pt-12 pb-10 sm:pb-14 px-4 sm:px-6 lg:px-8 xl:px-10">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Headline, Supporting badge, Description, Search, CTAs */}
          <div className="lg:col-span-7 flex flex-col space-y-6 text-left w-full">
            {/* Supporting Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-[#047857] text-xs sm:text-sm font-bold tracking-wide w-fit shadow-2xs">
              <Sparkles className="w-4 h-4 text-[#059669]" />
              <span>More Access. Less Expense.</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black font-display tracking-tight text-[#101828] leading-[1.15]">
              Your Digital Life, <span className="text-[#059669] whitespace-nowrap">For Less.</span>
            </h1>

            {/* Description */}
            <p className="text-sm sm:text-base lg:text-lg text-[#64748B] leading-relaxed max-w-2xl font-normal">
              Discover OTT subscriptions, digital tools and great-value deals — all in one place.
            </p>

            {/* Prominent Subscription Search Bar (Full Width Single-Line Pill) */}
            <form
              onSubmit={handleSearchSubmit}
              className="w-full bg-white rounded-full border border-[#E2E8F0] shadow-sm hover:shadow-md p-1.5 sm:p-2 flex items-center gap-1.5 sm:gap-2 focus-within:border-[#059669] focus-within:ring-2 focus-within:ring-emerald-100 transition-all"
            >
              <div className="flex items-center flex-1 px-2.5 sm:px-3 min-w-0">
                <Search className="w-4 h-4 sm:w-5 sm:h-5 text-[#64748B] shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search subscriptions, digital tools and deals..."
                  className="w-full bg-transparent px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-base text-[#101828] placeholder-[#94A3B8] focus:outline-none min-w-0"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="text-xs text-slate-400 hover:text-slate-600 px-1 cursor-pointer shrink-0"
                  >
                    Clear
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-1.5 active:scale-98 shrink-0 cursor-pointer whitespace-nowrap"
              >
                <span>Search</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              </button>
            </form>

            {/* Primary & Secondary CTA Buttons */}
            <div className="flex items-center gap-2.5 sm:gap-3 pt-1 w-full sm:w-auto">
              <a
                href="#marketplace"
                className="flex-1 sm:flex-initial text-center justify-center px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs sm:text-sm shadow-sm hover:shadow transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap"
              >
                <span>Explore Best Deals</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              </a>
              <Link
                href={isSeller ? '/seller' : (isApprovedSeller ? '/seller' : '/become-seller')}
                className="flex-1 sm:flex-initial text-center justify-center px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-white hover:bg-slate-50 text-[#101828] font-bold text-xs sm:text-sm border border-[#E2E8F0] shadow-2xs hover:border-slate-300 transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap"
              >
                <span>Start Selling</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Premium Tasteful Visual Showcase Card */}
          <div className="lg:col-span-5 relative">
            <div className="w-full bg-white rounded-2xl sm:rounded-3xl border border-[#E2E8F0] p-4 sm:p-6 shadow-xl relative overflow-hidden space-y-3 sm:space-y-4">
              {/* Subtle Ambient Radial Highlight */}
              <div className="absolute -top-16 -right-16 w-48 h-48 bg-emerald-100/60 rounded-full blur-3xl pointer-events-none" />

              {/* Showcase Header */}
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#059669] animate-pulse" />
                  <span className="text-xs font-bold text-[#101828] uppercase tracking-wider">
                    Trending Subscriptions
                  </span>
                </div>
                <span className="text-[11px] font-bold text-[#059669] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Escrow Protected
                </span>
              </div>

              {/* Showcase Item 1: Netflix 4K */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] hover:border-emerald-300 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-900 flex items-center justify-center text-white font-black text-xs shrink-0 p-1">
                    <img
                      src="https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=160&auto=format&fit=crop&q=80"
                      alt="Netflix"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#101828] group-hover:text-[#059669] transition-colors">
                      Netflix 4K Ultra HD
                    </h4>
                    <p className="text-[11px] text-[#64748B]">Private Profile • Instant Activation</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-extrabold text-[#059669]">₹69/mo</div>
                  <div className="text-[10px] text-[#94A3B8] line-through">₹199</div>
                </div>
              </div>

              {/* Showcase Item 2: ChatGPT Plus */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] hover:border-emerald-300 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-emerald-950 flex items-center justify-center text-white font-black text-xs shrink-0 p-1">
                    <img
                      src="https://images.unsplash.com/photo-1677442136019-21780ecad995?w=160&auto=format&fit=crop&q=80"
                      alt="ChatGPT Plus"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#101828] group-hover:text-[#059669] transition-colors">
                      ChatGPT Plus (GPT-4o)
                    </h4>
                    <p className="text-[11px] text-[#64748B]">Workspaces • Fast Dedicated Slot</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-extrabold text-[#059669]">₹199/mo</div>
                  <div className="text-[10px] text-[#94A3B8] line-through">₹1,999</div>
                </div>
              </div>

              {/* Showcase Item 3: Prime Video */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] hover:border-emerald-300 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-sky-950 flex items-center justify-center text-white font-black text-xs shrink-0 p-1">
                    <img
                      src="https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=160&auto=format&fit=crop&q=80"
                      alt="Prime Video"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#101828] group-hover:text-[#059669] transition-colors">
                      Prime Video 4K UHD
                    </h4>
                    <p className="text-[11px] text-[#64748B]">Single Screen • 30 Days Warranty</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-extrabold text-[#059669]">₹49/mo</div>
                  <div className="text-[10px] text-[#94A3B8] line-through">₹125</div>
                </div>
              </div>

              {/* Value Footer Tag */}
              <div className="pt-2 flex items-center justify-between text-[11px] text-[#64748B] border-t border-[#E2E8F0]">
                <span className="flex items-center gap-1 text-[#047857] font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  48-Hour Buyer Warranty
                </span>
                <span className="flex items-center gap-1 font-semibold text-[#101828]">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  Instant Automated Delivery
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Trust and Value Highlights Row */}
      <section className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 mb-10 sm:mb-14">
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 bg-white p-6 sm:p-8 rounded-3xl border border-[#E2E8F0] shadow-sm">
          {/* 1. Great-Value Deals */}
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-[#059669] flex items-center justify-center shrink-0 border border-emerald-100">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#101828]">Great-Value Deals</h3>
              <p className="text-xs text-[#64748B] mt-0.5 leading-relaxed">
                Authorized digital slots at wholesale marketplace rates.
              </p>
            </div>
          </div>

          {/* 2. Digital Subscriptions */}
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-[#059669] flex items-center justify-center shrink-0 border border-emerald-100">
              <Tv className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#101828]">Digital Subscriptions</h3>
              <p className="text-xs text-[#64748B] mt-0.5 leading-relaxed">
                OTT streaming, AI tool credits, and creative software.
              </p>
            </div>
          </div>

          {/* 3. Trusted Sellers */}
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-[#059669] flex items-center justify-center shrink-0 border border-emerald-100">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#101828]">Trusted Sellers</h3>
              <p className="text-xs text-[#64748B] mt-0.5 leading-relaxed">
                Merchants are verified by Admin before listing.
              </p>
            </div>
          </div>

          {/* 4. Lower Seller Fees */}
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-[#059669] flex items-center justify-center shrink-0 border border-emerald-100">
              <Percent className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#101828]">Lower Seller Fees</h3>
              <p className="text-xs text-[#64748B] mt-0.5 leading-relaxed">
                Competitive commission so sellers pass savings to you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Product Marketplace Section */}
      <section id="marketplace" className="w-full px-4 sm:px-6 lg:px-8 xl:px-10">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#101828] tracking-tight">
              Featured Marketplace Listings
            </h2>
            <p className="text-sm text-[#64748B] mt-1">
              Explore verified accounts and slots from approved merchants with instant delivery.
            </p>
          </div>
          <Link
            href="/browse"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#059669] hover:text-[#047857] transition-colors self-start sm:self-auto"
          >
            <span>View All Listings ({featuredListings.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Clean Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none border-b border-[#E2E8F0] mb-8">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'all'
                ? 'bg-[#059669] text-white shadow-xs'
                : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#101828] hover:border-slate-300'
            }`}
          >
            Latest Deals
          </button>
          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'subscriptions'
                ? 'bg-[#059669] text-white shadow-xs'
                : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#101828] hover:border-slate-300'
            }`}
          >
            Subscriptions
          </button>
          <button
            onClick={() => setActiveTab('tools')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'tools'
                ? 'bg-[#059669] text-white shadow-xs'
                : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#101828] hover:border-slate-300'
            }`}
          >
            Digital Tools
          </button>
          <button
            onClick={() => setActiveTab('bundles')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'bundles'
                ? 'bg-[#059669] text-white shadow-xs'
                : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#101828] hover:border-slate-300'
            }`}
          >
            Bundles
          </button>
          <button
            onClick={() => setActiveTab('trusted')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'trusted'
                ? 'bg-[#059669] text-white shadow-xs'
                : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#101828] hover:border-slate-300'
            }`}
          >
            Trusted Sellers
          </button>
        </div>

        {/* Listings Grid - Full width, responsive 1 on mobile, 2 on tablet, 3-4 on desktop */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-5 sm:gap-6 w-full">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="h-80 rounded-2xl bg-white border border-[#E2E8F0] animate-pulse"
              />
            ))}
          </div>
        ) : displayedListings.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-[#E2E8F0] p-8 max-w-md mx-auto shadow-sm">
            <Sparkles className="w-10 h-10 text-[#059669] mx-auto mb-3" />
            <h3 className="text-base font-bold text-[#101828]">No listings found</h3>
            <p className="text-xs text-[#64748B] mt-1">
              {searchQuery
                ? `No subscriptions matching "${searchQuery}". Try different keywords.`
                : 'No active listings in this category currently.'}
            </p>
            <button
              onClick={() => {
                setSelectedPlatform(null);
                setSearchQuery('');
                setActiveTab('all');
              }}
              className="mt-5 px-5 py-2.5 bg-[#059669] hover:bg-[#047857] text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              Show All Subscriptions
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-5 sm:gap-6 items-stretch w-full">
            {displayedListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
