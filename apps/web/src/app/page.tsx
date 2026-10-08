'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { ListingCard } from '@/components/marketplace/ListingCard';
import {
  Search,
  Sparkles,
  ShieldCheck,
  Zap,
  Lock,
  ArrowRight,
  Tv,
  Bot,
  Palette,
  Headphones,
  Shield,
  GraduationCap,
  Briefcase,
  Layers,
  CheckCircle2,
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [featuredListings, setFeaturedListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [catsRes, listingsRes] = await Promise.all([
          api.get('/categories'),
          api.get('/listings?limit=8&sortBy=popular'),
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
      router.push(`/browse?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/browse');
    }
  };

  const getCategoryIcon = (slug: string) => {
    switch (slug) {
      case 'ott-streaming':
        return <Tv className="w-5 h-5 text-indigo-400" />;
      case 'ai-tools':
        return <Bot className="w-5 h-5 text-emerald-400" />;
      case 'design-creative':
        return <Palette className="w-5 h-5 text-rose-400" />;
      case 'music-audio':
        return <Headphones className="w-5 h-5 text-amber-400" />;
      case 'vpn-cloud':
        return <Shield className="w-5 h-5 text-cyan-400" />;
      case 'education':
        return <GraduationCap className="w-5 h-5 text-purple-400" />;
      default:
        return <Layers className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="flex flex-col w-full overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-24 md:pt-28 md:pb-32 px-4 sm:px-6 lg:px-8 glow-gradient">
        <div className="max-w-5xl mx-auto text-center flex flex-col items-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-950/80 border border-brand-500/40 text-brand-300 text-xs font-semibold mb-6 shadow-glow">
            <Sparkles className="w-4 h-4 text-brand-400" />
            <span>India&apos;s #1 Verified Digital Subscription Exchange</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1] max-w-4xl">
            Premium Access.{' '}
            <span className="bg-gradient-to-r from-brand-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
              Better Prices.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-base sm:text-lg md:text-xl text-slate-400 max-w-2xl leading-relaxed">
            Get instant, secure access to your favorite OTT platforms, AI models, and creative tools from trusted sellers at up to 80% off retail pricing.
          </p>

          {/* Search Box */}
          <form
            onSubmit={handleSearchSubmit}
            className="w-full max-w-2xl mt-8 sm:mt-10 flex items-center p-2 rounded-2xl glass-panel border border-surface-300/60 shadow-2xl focus-within:border-brand-500 transition-all"
          >
            <div className="pl-3 text-slate-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Netflix, ChatGPT Plus, Spotify, Canva, Prime..."
              className="w-full bg-transparent border-none px-4 py-2.5 text-sm sm:text-base text-white placeholder-slate-400 focus:outline-none"
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-500 hover:from-brand-500 hover:to-indigo-400 text-white font-semibold text-sm shadow-glow flex items-center gap-1.5 transition-all shrink-0"
            >
              <span>Search</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick tags */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
            <span className="font-medium text-slate-400">Trending:</span>
            {['Netflix 4K', 'ChatGPT Plus', 'Spotify Family', 'Canva Pro', 'Prime Video'].map((tag) => (
              <button
                key={tag}
                onClick={() => router.push(`/browse?search=${encodeURIComponent(tag)}`)}
                className="px-3 py-1 rounded-lg bg-surface-100 hover:bg-surface-200 border border-surface-300/40 text-slate-300 transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Trust stats pill bar */}
          <div className="mt-12 sm:mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 w-full max-w-4xl">
            <div className="glass-panel p-4 rounded-2xl border border-surface-300/40 text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-white">100%</div>
              <div className="text-xs text-slate-400 mt-1">Escrow Buyer Protection</div>
            </div>
            <div className="glass-panel p-4 rounded-2xl border border-surface-300/40 text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-brand-400">Instant</div>
              <div className="text-xs text-slate-400 mt-1">Automated Delivery</div>
            </div>
            <div className="glass-panel p-4 rounded-2xl border border-surface-300/40 text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">48 Hours</div>
              <div className="text-xs text-slate-400 mt-1">Replacement Guarantee</div>
            </div>
            <div className="glass-panel p-4 rounded-2xl border border-surface-300/40 text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-cyan-400">AES-256</div>
              <div className="text-xs text-slate-400 mt-1">Encrypted Credentials</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Showcase */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Explore by Category
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Select an ecosystem to find shared screens, invites, and private profiles.
            </p>
          </div>
          <Link
            href="/browse"
            className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1 group"
          >
            <span>View All Categories</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/browse?category=${cat.slug}`}
              className="glass-card p-4 rounded-2xl flex flex-col items-center text-center group border border-surface-300/40 hover:border-brand-500/50"
            >
              <div className="w-12 h-12 rounded-xl bg-surface-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                {getCategoryIcon(cat.slug)}
              </div>
              <h3 className="text-xs font-bold text-white group-hover:text-brand-300 transition-colors">
                {cat.name}
              </h3>
              <span className="text-[10px] text-slate-400 mt-1">
                {cat._count?.listings || 0} active listings
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Live Database Listings */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live Marketplace Listings
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Featured Subscriptions
            </h2>
          </div>
          <Link
            href="/browse"
            className="px-4 py-2 rounded-xl bg-surface-100 hover:bg-surface-200 border border-surface-300/50 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-all"
          >
            <span>Browse Full Catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-80 rounded-2xl bg-surface-100/50 animate-pulse border border-surface-300/30" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold text-brand-400 uppercase tracking-wider">
            Safe & Simple Process
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-2">
            How SubVault Works
          </h2>
          <p className="text-slate-400 text-sm mt-3">
            Zero friction, 100% automated delivery, and full buyer protection every step of the way.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <div className="glass-card p-8 rounded-2xl flex flex-col items-center text-center relative border border-surface-300/40">
            <div className="w-14 h-14 rounded-2xl bg-brand-950 border border-brand-800 text-brand-300 font-extrabold text-xl flex items-center justify-center mb-5 shadow-glow">
              1
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Select Your Subscription</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Browse top OTT, AI, and design listings. Compare verified seller ratings, duration, screen limits, and customer reviews.
            </p>
          </div>

          <div className="glass-card p-8 rounded-2xl flex flex-col items-center text-center relative border border-surface-300/40">
            <div className="w-14 h-14 rounded-2xl bg-emerald-950 border border-emerald-800 text-emerald-300 font-extrabold text-xl flex items-center justify-center mb-5 shadow-glow-emerald">
              2
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Instant Wallet Checkout</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Top up your SubVault wallet via UPI or card. Check out with one click—funds are held in secure platform escrow.
            </p>
          </div>

          <div className="glass-card p-8 rounded-2xl flex flex-col items-center text-center relative border border-surface-300/40">
            <div className="w-14 h-14 rounded-2xl bg-cyan-950 border border-cyan-800 text-cyan-300 font-extrabold text-xl flex items-center justify-center mb-5">
              3
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Encrypted Delivery & Chat</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Your login credentials or invite link are decrypted instantly in your orders dashboard. Chat directly with the seller if you need support.
            </p>
          </div>
        </div>
      </section>

      {/* Become a Seller CTA Banner */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="relative rounded-3xl overflow-hidden glass-panel border border-brand-500/40 p-8 sm:p-12 md:p-16 flex flex-col lg:flex-row items-center justify-between gap-8 glow-gradient">
          <div className="max-w-2xl text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-brand-950 border border-brand-800 text-brand-300 text-xs font-semibold mb-4">
              <ShieldCheck className="w-4 h-4 text-brand-400" />
              <span>Verified Seller Program</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Have extra subscription slots?{' '}
              <span className="text-brand-400">Monetize them on SubVault.</span>
            </h2>
            <p className="text-sm sm:text-base text-slate-400 mt-4 leading-relaxed">
              Join our network of verified digital distributors. Benefit from automated encrypted inventory dispatch, fast UPI payouts, and dispute-protected earnings.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-4 justify-center lg:justify-start text-xs text-slate-300">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Instant Payouts via UPI</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Automated Inventory</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Low 10% Commission</span>
              </div>
            </div>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row gap-4">
            <Link
              href="/become-seller"
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-500 hover:from-brand-500 hover:to-indigo-400 text-white font-bold text-sm shadow-glow flex items-center justify-center gap-2 transition-all"
            >
              <span>Apply as a Seller</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
