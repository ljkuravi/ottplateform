import React from 'react';

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8 text-slate-300">
      <div className="border-b border-surface-300/40 pb-6">
        <h1 className="text-3xl font-extrabold text-white">Terms of Service</h1>
        <p className="text-xs text-slate-400 mt-2">Last updated: October 2026</p>
      </div>

      <section className="space-y-4 text-sm leading-relaxed">
        <h2 className="text-lg font-bold text-white">1. Marketplace Facilitation</h2>
        <p>
          SubVault operates solely as a technological marketplace platform connecting authorized resellers and private consumers for the transfer of legitimate digital subscriptions, screen allocations, and software invites. SubVault does not manufacture or issue subscriptions directly.
        </p>

        <h2 className="text-lg font-bold text-white">2. Prohibited Offerings</h2>
        <p>
          SubVault strictly prohibits the distribution, sale, or trade of stolen credentials, credential-stuffing databases, cracked accounts, unauthorized bypass tools, or hijacked profiles. Any merchant violating these guidelines is subject to immediate forfeiture of earnings, account termination, and law enforcement escalation.
        </p>

        <h2 className="text-lg font-bold text-white">3. Escrow and Buyer Protection</h2>
        <p>
          Purchased subscription funds are held under marketplace escrow protection. Reseller payout is subject to our 48-hour delivery verification and replacement guarantee window.
        </p>

        <h2 className="text-lg font-bold text-white">4. User Responsibilities</h2>
        <p>
          Buyers agree to adhere to allocated profiles or device limits specified in listing terms. Attempting to alter master account passwords or tamper with unauthorized slots constitutes a breach of service.
        </p>
      </section>
    </div>
  );
}
