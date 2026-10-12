import React from 'react';
import Link from 'next/link';
import { Shield, Lock, Zap, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full border-t border-slate-200 bg-white pt-14 pb-10 mt-auto">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-200">
          {/* Brand Column */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2 select-none py-1">
              <img
                src="/logo.png"
                alt="Ottly"
                className="h-8 w-auto object-contain max-w-[130px]"
              />
            </Link>
            <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
              India&apos;s verified digital subscription sharing platform. Access top OTT, AI tools, and creative apps with escrow protection.
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
              <div className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                <Shield className="w-4 h-4" />
                <span>Escrow Protected</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-600">
                <Lock className="w-4 h-4" />
                <span>AES-256 Encrypted</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-600">
                <Zap className="w-4 h-4" />
                <span>Instant Delivery</span>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="flex flex-col gap-2.5">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Top Categories</h4>
            <Link href="/browse?category=ott-streaming" className="text-xs text-slate-600 hover:text-emerald-600 transition-colors">OTT Platforms</Link>
            <Link href="/browse?category=ai-tools" className="text-xs text-slate-600 hover:text-emerald-600 transition-colors">AI Tools</Link>
            <Link href="/browse?category=design-creative" className="text-xs text-slate-600 hover:text-emerald-600 transition-colors">Design Tools</Link>
            <Link href="/browse?category=games" className="text-xs text-slate-600 hover:text-emerald-600 transition-colors">Games</Link>
            <Link href="/browse?category=vpn-cloud" className="text-xs text-slate-600 hover:text-emerald-600 transition-colors">VPN & Cloud</Link>
          </div>

          {/* Marketplace */}
          <div className="flex flex-col gap-2.5">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Marketplace</h4>
            <Link href="/browse" className="text-xs text-slate-600 hover:text-emerald-600 transition-colors">Browse All Listings</Link>
            <Link href="/become-seller" className="text-xs text-slate-600 hover:text-emerald-600 transition-colors">Become a Seller</Link>
            <Link href="/wallet" className="text-xs text-slate-600 hover:text-emerald-600 transition-colors">Add Money & Wallet</Link>
            <Link href="/orders" className="text-xs text-slate-600 hover:text-emerald-600 transition-colors">Order History</Link>
          </div>

          {/* Support */}
          <div className="flex flex-col gap-2.5">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Support & Legal</h4>
            <Link href="/contact" className="text-xs text-slate-600 hover:text-emerald-600 transition-colors">Contact Us</Link>
            <Link href="/terms" className="text-xs text-slate-600 hover:text-emerald-600 transition-colors">Terms of Service</Link>
            <Link href="/privacy" className="text-xs text-slate-600 hover:text-emerald-600 transition-colors">Privacy Policy</Link>
            <Link href="/refund-policy" className="text-xs text-slate-600 hover:text-emerald-600 transition-colors">Refund Policy</Link>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>© {new Date().getFullYear()} Ottly Inc. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for verified subscription sharing
          </p>
        </div>
      </div>
    </footer>
  );
}
