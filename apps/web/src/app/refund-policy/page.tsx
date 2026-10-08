import React from 'react';

export default function RefundPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8 text-slate-300">
      <div className="border-b border-surface-300/40 pb-6">
        <h1 className="text-3xl font-extrabold text-white">Refund & Dispute Policy</h1>
        <p className="text-xs text-slate-400 mt-2">Comprehensive 48-Hour Buyer Replacement Shield</p>
      </div>

      <section className="space-y-4 text-sm leading-relaxed">
        <h2 className="text-lg font-bold text-white">1. The 48-Hour Warranty Window</h2>
        <p>
          Every order processed on SubVault includes an automatic 48-hour warranty from the moment digital delivery is fulfilled. If access credentials, PIN codes, or family invitations fail to function as advertised, the buyer is entitled to an immediate replacement or full wallet refund.
        </p>

        <h2 className="text-lg font-bold text-white">2. Eligible Grounds for Refund</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Credentials invalid, locked, or failing upon first login.</li>
          <li>Screen limit consistently exceeded or profile removed by master account.</li>
          <li>Plan tier or duration mismatch (e.g. 1-month delivered instead of 3-month).</li>
          <li>Failure of seller to replace malfunctioning credentials within 6 hours.</li>
        </ul>

        <h2 className="text-lg font-bold text-white">3. Filing a Dispute</h2>
        <p>
          Buyers can click &ldquo;Dispute / Request Refund&rdquo; directly on any order card in the Orders tab. SubVault administrators review evidence within 4 hours. Upon approval, funds are immediately restored to the buyer&apos;s wallet ledger.
        </p>
      </section>
    </div>
  );
}
