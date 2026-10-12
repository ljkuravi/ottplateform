import React from 'react';
import { Mail, MessageSquare, ShieldCheck, HelpCircle } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="border-b border-slate-200 pb-6 text-center max-w-xl mx-auto">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-3 border border-emerald-200">
          <HelpCircle className="w-3.5 h-3.5" />
          24/7 Dedicated Support
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Contact & Support</h1>
        <p className="text-sm text-slate-500 mt-2">
          We are here to assist buyers and sellers 24 hours a day, 7 days a week.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center space-y-3 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
            <Mail className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Email Support</h3>
          <p className="text-xs text-slate-500">support@subvault.com</p>
          <span className="text-[11px] text-emerald-600 font-semibold block bg-emerald-50 py-1 rounded-md">
            Avg reply: under 1 hr
          </span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center space-y-3 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Live Dispute Chat</h3>
          <p className="text-xs text-slate-500">Directly from your Orders Tab</p>
          <span className="text-[11px] text-blue-600 font-semibold block bg-blue-50 py-1 rounded-md">
            Real-time resolution
          </span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center space-y-3 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto border border-purple-100">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Escrow Assurance</h3>
          <p className="text-xs text-slate-500">100% money-back guarantee</p>
          <span className="text-[11px] text-purple-600 font-semibold block bg-purple-50 py-1 rounded-md">
            48-hour warranty
          </span>
        </div>
      </div>
    </div>
  );
}
