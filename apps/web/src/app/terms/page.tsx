import React from 'react';
import { FileText } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 text-slate-700">
      <div className="border-b border-slate-200 pb-6">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-3 border border-emerald-200">
          <FileText className="w-3.5 h-3.5" />
          Legal Agreement
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Terms of Service</h1>
        <p className="text-sm text-slate-500 mt-2">Last updated: October 2026</p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6 text-sm leading-relaxed">
        <div>
          <h2 className="text-base font-bold text-slate-900 mb-2">1. Marketplace Facilitation</h2>
          <p className="text-slate-600">
            SubVault operates solely as a technological marketplace platform connecting authorized resellers and private consumers for the transfer of legitimate digital subscriptions, screen allocations, and software invites. SubVault does not manufacture or issue subscriptions directly.
          </p>
        </div>

        <div className="border-t border-slate-100 pt-4">
          <h2 className="text-base font-bold text-slate-900 mb-2">2. Prohibited Offerings</h2>
          <p className="text-slate-600">
            SubVault strictly prohibits the distribution, sale, or trade of stolen credentials, credential-stuffing databases, cracked accounts, unauthorized bypass tools, or hijacked profiles. Any merchant violating these guidelines is subject to immediate forfeiture of earnings, account termination, and law enforcement escalation.
          </p>
        </div>

        <div className="border-t border-slate-100 pt-4">
          <h2 className="text-base font-bold text-slate-900 mb-2">3. Escrow and Buyer Protection</h2>
          <p className="text-slate-600">
            Purchased subscription funds are held under marketplace escrow protection. Reseller payout is subject to our 48-hour delivery verification and replacement guarantee window.
          </p>
        </div>

        <div className="border-t border-slate-100 pt-4">
          <h2 className="text-base font-bold text-slate-900 mb-2">4. User Responsibilities</h2>
          <p className="text-slate-600">
            Buyers agree to adhere to allocated profiles or device limits specified in listing terms. Attempting to alter master account passwords or tamper with unauthorized slots constitutes a breach of service.
          </p>
        </div>
      </div>
    </div>
  );
}
