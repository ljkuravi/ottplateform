import React from 'react';
import { ShieldAlert } from 'lucide-react';

export default function RefundPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 text-slate-700">
      <div className="border-b border-slate-200 pb-6">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-3 border border-emerald-200">
          <ShieldAlert className="w-3.5 h-3.5" />
          Buyer Protection
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Refund & Dispute Policy</h1>
        <p className="text-sm text-slate-500 mt-2">Comprehensive 48-Hour Buyer Replacement Shield</p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6 text-sm leading-relaxed">
        <div>
          <h2 className="text-base font-bold text-slate-900 mb-2">1. The 48-Hour Warranty Window</h2>
          <p className="text-slate-600">
            Every order processed on SubVault includes an automatic 48-hour warranty from the moment digital delivery is fulfilled. If access credentials, PIN codes, or family invitations fail to function as advertised, the buyer is entitled to an immediate replacement or full wallet refund.
          </p>
        </div>

        <div className="border-t border-slate-100 pt-4">
          <h2 className="text-base font-bold text-slate-900 mb-2">2. Eligible Grounds for Refund</h2>
          <ul className="list-disc pl-5 space-y-2 text-slate-600">
            <li>Credentials invalid, locked, or failing upon first login.</li>
            <li>Screen limit consistently exceeded or profile removed by master account.</li>
            <li>Plan tier or duration mismatch (e.g. 1-month delivered instead of 3-month).</li>
            <li>Failure of seller to replace malfunctioning credentials within 6 hours.</li>
          </ul>
        </div>

        <div className="border-t border-slate-100 pt-4">
          <h2 className="text-base font-bold text-slate-900 mb-2">3. Filing a Dispute</h2>
          <p className="text-slate-600">
            Buyers can click &ldquo;Dispute / Request Refund&rdquo; directly on any order card in the Orders tab. SubVault administrators review evidence within 4 hours. Upon approval, funds are immediately restored to the buyer&apos;s wallet ledger.
          </p>
        </div>
      </div>
    </div>
  );
}
