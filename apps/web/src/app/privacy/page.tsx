import React from 'react';

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8 text-slate-300">
      <div className="border-b border-surface-300/40 pb-6">
        <h1 className="text-3xl font-extrabold text-white">Privacy Policy</h1>
        <p className="text-xs text-slate-400 mt-2">Data Protection and Cryptographic Safeguards</p>
      </div>

      <section className="space-y-4 text-sm leading-relaxed">
        <h2 className="text-lg font-bold text-white">1. Encryption at Rest</h2>
        <p>
          All sensitive digital delivery data—including seller credentials, profile access tokens, and invite links—are encrypted at rest using industry standard AES-256-GCM. Unencrypted data is never accessible via public APIs or stored in plaintext.
        </p>

        <h2 className="text-lg font-bold text-white">2. Financial Data Isolation</h2>
        <p>
          SubVault never stores buyer credit card details, debit card numbers, CVVs, or UPI MPINs. All payment processing is routed through Razorpay conforming to RBI regulations and PCI-DSS compliance standards.
        </p>

        <h2 className="text-lg font-bold text-white">3. Information Sharing</h2>
        <p>
          Buyer private contact details (such as personal phone numbers and payment records) are never exposed to sellers. Communication is channeled strictly through SubVault&apos;s authenticated real-time chat gateway.
        </p>
      </section>
    </div>
  );
}
