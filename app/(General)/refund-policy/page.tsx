'use client';

import React from 'react';
import { RefreshCw, CheckCircle, Clock, AlertTriangle, ShieldCheck, HelpCircle } from 'lucide-react';
import Link from 'next/link';

export default function RefundPolicyPage() {
  const lastUpdated = 'August 7, 2026';

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 pt-28 pb-20 mt-20 md:mt-12">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center p-3 bg-orange-100 text-orange-600 rounded-2xl mb-2">
            <RefreshCw className="w-8 h-8" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight font-outfit">
            Return & Refund Policy
          </h1>
          <p className="text-slate-500 text-sm font-medium">
            Last Updated: {lastUpdated} | Gadget CITi (CITi Hub)
          </p>
        </div>

        {/* Content Box */}
        <div className="bg-white rounded-3xl p-6 md:p-10 border border-slate-200 shadow-sm space-y-8 text-slate-700 text-sm md:text-base leading-relaxed">
          
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs md:text-sm flex gap-3 items-start">
            <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
            <p>
              At <strong>Gadget CITi</strong>, customer satisfaction is our top priority. We offer a transparent <strong>7-Day Return & Exchange Guarantee</strong> for items that arrive defective, damaged in transit, or do not match your order specifications.
            </p>
          </div>

          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-slate-100 text-orange-600 text-xs font-black flex items-center justify-center">1</span>
              Return Eligibility
            </h2>
            <p>To be eligible for a return or replacement, the item must meet the following criteria:</p>
            <ul className="list-disc pl-5 space-y-2 text-slate-600">
              <li>Item must be returned within <strong>7 days</strong> from the delivery or pickup date.</li>
              <li>Item must be in its original packaging with all original accessories, user manuals, warranty cards, and receipt included.</li>
              <li>Item must not show signs of physical damage, water damage, unauthorized tampering, or altered serial numbers.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3 border-t border-slate-100 pt-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-slate-100 text-orange-600 text-xs font-black flex items-center justify-center">2</span>
              Refund Process & Payment Reversal
            </h2>
            <p>
              Once your returned item is received at our store and completes technical inspection:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-600">
              <li><strong>Approved Refunds:</strong> Will be processed back to the original method of payment (Mobile Money account or Card via Paystack) within 3 to 5 business days.</li>
              <li><strong>Store Credit & Exchanges:</strong> If requested, customers may choose immediate store credit or item replacement instead of a monetary refund.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3 border-t border-slate-100 pt-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-slate-100 text-orange-600 text-xs font-black flex items-center justify-center">3</span>
              Non-Refundable Items & Services
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-slate-600">
              <li>Custom software installation, logic board repair labor fees, and diagnostic charges once services have been delivered.</li>
              <li>Items with missing original serial numbers, or items modified after delivery.</li>
              <li>Consumable or single-use accessories with broken seal packaging (e.g. unsealed screen protectors or ear tips).</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3 border-t border-slate-100 pt-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-slate-100 text-orange-600 text-xs font-black flex items-center justify-center">4</span>
              How to Initiate a Return
            </h2>
            <p>To request a return or exchange:</p>
            <ol className="list-decimal pl-5 space-y-2 text-slate-600 font-medium">
              <li>Contact our customer support team at <strong>054 344 2518</strong> or email <strong>contact@gadgetciti.com</strong>.</li>
              <li>Provide your order number, photo/video evidence of the defect or issue, and receipt.</li>
              <li>Our team will guide you on drop-off at our Kumasi office or return courier dispatch instructions.</li>
            </ol>
          </section>
        </div>

        {/* Footer Link Navigation */}
        <div className="flex justify-between items-center text-xs font-bold text-slate-500 px-2">
          <Link href="/terms" className="hover:text-orange-500 transition-colors">&larr; View Terms of Service</Link>
          <Link href="/contact" className="hover:text-orange-500 transition-colors">Contact Support &rarr;</Link>
        </div>
      </div>
    </div>
  );
}
