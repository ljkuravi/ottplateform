import React from 'react';
import Link from 'next/link';
import { Sparkles, Shield, Lock, Zap, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full border-t border-surface-300/40 bg-surface-50/80 pt-16 pb-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-surface-300/40">
          {/* Brand Column */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-400 flex items-center justify-center shadow-glow">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Sub<span className="text-brand-400">Vault</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              India&apos;s modern peer-to-peer digital subscription marketplace. Buy and share OTT, AI tools, design suites, and cloud access with encrypted delivery and buyer protection.
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-400 pt-2">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <Shield className="w-4 h-4" />
                <span>Escrow Protected</span>
              </div>
              <div className="flex items-center gap-1.5 text-indigo-400">
                <Lock className="w-4 h-4" />
                <span>AES-256 Encrypted</span>
              </div>
              <div className="flex items-center gap-1.5 text-cyan-400">
                <Zap className="w-4 h-4" />
                <span>Instant Delivery</span>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Top Categories</h4>
            <Link href="/browse?category=ott-streaming" className="text-sm text-slate-400 hover:text-white transition-colors">OTT & Streaming</Link>
            <Link href="/browse?category=ai-tools" className="text-sm text-slate-400 hover:text-white transition-colors">AI & Machine Learning</Link>
            <Link href="/browse?category=design-creative" className="text-sm text-slate-400 hover:text-white transition-colors">Design & Creative</Link>
            <Link href="/browse?category=music-audio" className="text-sm text-slate-400 hover:text-white transition-colors">Music & Podcasts</Link>
            <Link href="/browse?category=vpn-cloud" className="text-sm text-slate-400 hover:text-white transition-colors">VPN & Security</Link>
          </div>

          {/* Marketplace */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Marketplace</h4>
            <Link href="/browse" className="text-sm text-slate-400 hover:text-white transition-colors">Browse All Listings</Link>
            <Link href="/become-seller" className="text-sm text-slate-400 hover:text-white transition-colors">Become a Seller</Link>
            <Link href="/#how-it-works" className="text-sm text-slate-400 hover:text-white transition-colors">How It Works</Link>
            <Link href="/wallet" className="text-sm text-slate-400 hover:text-white transition-colors">Add Money & Wallet</Link>
            <Link href="/orders" className="text-sm text-slate-400 hover:text-white transition-colors">My Subscriptions</Link>
          </div>

          {/* Legal & Safety */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Trust & Legal</h4>
            <Link href="/terms" className="text-sm text-slate-400 hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/privacy" className="text-sm text-slate-400 hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/refund-policy" className="text-sm text-slate-400 hover:text-white transition-colors">Refund & Dispute Policy</Link>
            <Link href="/acceptable-use" className="text-sm text-slate-400 hover:text-white transition-colors">Acceptable Use Policy</Link>
            <Link href="/seller-policy" className="text-sm text-slate-400 hover:text-white transition-colors">Seller Guidelines</Link>
            <Link href="/contact" className="text-sm text-slate-400 hover:text-white transition-colors">Contact Support</Link>
          </div>
        </div>

        {/* Disclaimer Notice */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p className="text-center md:text-left max-w-3xl leading-relaxed">
            Disclaimer: SubVault is an independent marketplace facilitator connecting private buyers and authorized resellers. Third-party brand names, logos, and trademarks (including Netflix, Amazon Prime, Spotify, OpenAI, Canva, Disney+ Hotstar) are properties of their respective owners and used solely for identification. Sellers represent and warrant they are legally authorized to share or resell their listings.
          </p>
          <div className="flex items-center gap-1 text-slate-400 shrink-0">
            <span>&copy; {new Date().getFullYear()} SubVault. Built with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>in India.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
