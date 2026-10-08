import React from 'react';
import { Mail, Clock, MessageSquare, ShieldCheck } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
      <div className="border-b border-surface-300/40 pb-6 text-center max-w-xl mx-auto">
        <h1 className="text-3xl font-extrabold text-white">Contact & Support</h1>
        <p className="text-xs text-slate-400 mt-2">
          We are here to assist buyers and sellers 24 hours a day, 7 days a week.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-surface-300/40 text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-brand-950 border border-brand-800 text-brand-400 flex items-center justify-center mx-auto">
            <Mail className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-white">Email Support</h3>
          <p className="text-xs text-slate-400">support@subvault.com</p>
          <span className="text-[11px] text-emerald-400 font-medium block">Avg reply: under 1 hr</span>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-surface-300/40 text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-400 flex items-center justify-center mx-auto">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-white">Live Dispute Chat</h3>
          <p className="text-xs text-slate-400">Directly from your Orders Tab</p>
          <span className="text-[11px] text-cyan-400 font-medium block">Real-time resolution</span>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-surface-300/40 text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-400 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-white">Escrow Assurance</h3>
          <p className="text-xs text-slate-400">100% money-back guarantee</p>
          <span className="text-[11px] text-emerald-400 font-medium block">48-hour warranty</span>
        </div>
      </div>
    </div>
  );
}
