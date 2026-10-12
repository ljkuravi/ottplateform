import React from 'react';
import { ShieldCheck } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 text-slate-700">
      <div className="border-b border-slate-200 pb-6">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-3 border border-emerald-200">
          <ShieldCheck className="w-3.5 h-3.5" />
          Data Protection
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Privacy Policy</h1>
        <p className="text-sm text-slate-500 mt-2">Data Protection and Cryptographic Safeguards</p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6 text-sm leading-relaxed">
        <div>
          <h2 className="text-base font-bold text-slate-900 mb-2">1. Encryption at Rest</h2>
          <p className="text-slate-600">
            All sensitive digital delivery data—including seller credentials, profile access tokens, and invite links—are encrypted at rest using industry standard AES-256-GCM. Unencrypted data is never accessible via public APIs or stored in plaintext.
          </p>
        </div>

        <div className="border-t border-slate-100 pt-4">
          <h2 className="text-base font-bold text-slate-900 mb-2">2. Financial Data Isolation</h2>
          <p className="text-slate-600">
            SubVault never stores buyer credit card details, debit card numbers, CVVs, or UPI MPINs. All payment processing is routed through Razorpay conforming to RBI regulations and PCI-DSS compliance standards.
          </p>
        </div>

        <div className="border-t border-slate-100 pt-4">
          <h2 className="text-base font-bold text-slate-900 mb-2">3. Information Sharing</h2>
          <p className="text-slate-600">
            Buyer private contact details (such as personal phone numbers and payment records) are never exposed to sellers. Communication is channeled strictly through SubVault&apos;s authenticated real-time chat gateway.
          </p>
        </div>
      </div>
    </div>
  );
}
