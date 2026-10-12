'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { ListingCard } from '@/components/marketplace/ListingCard';
import {
  Search,
  Filter,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';

function BrowseContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Filter States
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedPlatform, setSelectedPlatform] = useState(searchParams.get('platform') || '');
  const [selectedDuration, setSelectedDuration] = useState(searchParams.get('duration') || '');
  const [selectedAccessType, setSelectedAccessType] = useState(searchParams.get('accessType') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [verifiedOnly, setVerifiedOnly] = useState(searchParams.get('verifiedOnly') === 'true');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'recommended');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);

  // Data
  const [categories, setCategories] = useState<any[]>([]);
  const [platforms, setPlatforms] = useState<any[]>([]);
  const [listings, setListings] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>({ total: 0, page: 1, limit: 12, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Load Categories & Platforms
  useEffect(() => {
    async function loadMeta() {
      try {
        const [catRes, platRes] = await Promise.all([
          api.get('/categories'),
          api.get('/categories/platforms'),
        ]);
        if (catRes.success && catRes.data) setCategories(catRes.data);
        if (platRes.success && platRes.data) setPlatforms(platRes.data);
      } catch {
        // ignore
      }
    }
    loadMeta();
  }, []);

  // Fetch Listings on filter change
  useEffect(() => {
    async function fetchListings() {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (selectedCategory) params.set('category', selectedCategory);
        if (selectedPlatform) params.set('platform', selectedPlatform);
        if (selectedDuration) params.set('duration', selectedDuration);
        if (selectedAccessType) params.set('accessType', selectedAccessType);
        if (minPrice) params.set('minPrice', minPrice);
        if (maxPrice) params.set('maxPrice', maxPrice);
        if (verifiedOnly) params.set('verifiedOnly', 'true');
        if (sortBy) params.set('sortBy', sortBy);
        params.set('page', page.toString());
        params.set('limit', '12');

        const res = await api.get(`/listings?${params.toString()}`);
        if (res.success && res.data) {
          setListings(res.data);
          if (res.meta) setMeta(res.meta);
        }
      } catch {
        setListings([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchListings();
  }, [
    search,
    selectedCategory,
    selectedPlatform,
    selectedDuration,
    selectedAccessType,
    minPrice,
    maxPrice,
    verifiedOnly,
    sortBy,
    page,
  ]);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSelectedPlatform('');
    setSelectedDuration('');
    setSelectedAccessType('');
    setMinPrice('');
    setMaxPrice('');
    setVerifiedOnly(false);
    setSortBy('recommended');
    setPage(1);
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 py-8 sm:py-10 flex flex-col bg-[#f8fafc] text-slate-900">
      {/* Top Header & Search bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-black font-display text-slate-900 tracking-tight">Marketplace Catalog</h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse {meta.total} verified digital subscriptions with instant delivery.
          </p>
        </div>

        {/* Search & Sort Controls */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search platform or plan..."
              className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 shadow-xs"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-emerald-600 cursor-pointer shadow-xs"
          >
            <option value="recommended">Sort: Recommended</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Top Rated Sellers</option>
            <option value="popular">Most Purchased</option>
          </select>

          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="lg:hidden p-2 rounded-xl bg-white border border-slate-300 text-slate-700 shadow-xs"
            aria-label="Filter"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 pt-8">
        {/* Filter Sidebar */}
        <aside
          className={`lg:w-64 shrink-0 space-y-6 ${
            mobileFilterOpen ? 'block' : 'hidden lg:block'
          }`}
        >
          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-6 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-emerald-600" />
                Filters
              </span>
              <button
                onClick={handleResetFilters}
                className="text-[11px] text-slate-500 hover:text-emerald-600 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Platform Filter */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">Platform</label>
              <select
                value={selectedPlatform}
                onChange={(e) => {
                  setSelectedPlatform(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
              >
                <option value="">All Platforms</option>
                {platforms.map((p) => (
                  <option key={p.id} value={p.slug}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Duration Pills */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">Duration</label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { label: 'All', value: '' },
                  { label: '1 Mo', value: '1' },
                  { label: '3 Mo', value: '3' },
                  { label: '6 Mo', value: '6' },
                  { label: '12 Mo', value: '12' },
                ].map((dur) => (
                  <button
                    key={dur.label}
                    onClick={() => {
                      setSelectedDuration(dur.value);
                      setPage(1);
                    }}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold border text-center transition-all ${
                      selectedDuration === dur.value
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {dur.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Access Type Filter */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">Access Type</label>
              <select
                value={selectedAccessType}
                onChange={(e) => {
                  setSelectedAccessType(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
              >
                <option value="">All Types</option>
                <option value="PRIVATE_PROFILE">Private Profile</option>
                <option value="SHARED_SCREEN">Shared Screen</option>
                <option value="FAMILY_INVITE">Family Invite</option>
                <option value="PRIVATE_ACCOUNT">Private Account</option>
              </select>
            </div>

            {/* Price Range */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">Price Range (₹)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                />
                <span className="text-slate-400 text-xs">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                />
              </div>
            </div>

            {/* Verified Sellers Toggle */}
            <div className="pt-2 border-t border-slate-100">
              <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(e) => {
                    setVerifiedOnly(e.target.checked);
                    setPage(1);
                  }}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="flex items-center gap-1 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Verified Sellers Only
                </span>
              </label>
            </div>
          </div>
        </aside>

        {/* Listings Grid */}
        <main className="flex-1 flex flex-col w-full">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6 w-full">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="h-80 rounded-2xl bg-white animate-pulse border border-slate-200" />
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center flex flex-col items-center my-10 shadow-sm w-full">
              <Search className="w-12 h-12 text-slate-300 mb-3" />
              <h3 className="text-lg font-bold text-slate-900">No listings match your criteria</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Try loosening your filters or searching for another keyword.
              </p>
              <button
                onClick={handleResetFilters}
                className="mt-5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white shadow-sm cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6 w-full items-stretch">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {meta.totalPages > 1 && (
            <div className="mt-12 flex items-center justify-between border-t border-slate-200 pt-6 text-xs text-slate-600">
              <span>
                Showing page <strong className="text-slate-900">{meta.page}</strong> of{' '}
                <strong className="text-slate-900">{meta.totalPages}</strong> ({meta.total} results)
              </span>

              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="p-2 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-40 shadow-xs"
                  aria-label="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={page >= meta.totalPages}
                  onClick={() => setPage(page + 1)}
                  className="p-2 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-40 shadow-xs"
                  aria-label="Next Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function BrowsePage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500">Loading marketplace catalog...</div>}>
      <BrowseContent />
    </Suspense>
  );
}
