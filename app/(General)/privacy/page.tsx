'use client';

import React from 'react';
import { ShieldCheck, Lock, Eye, Database, Server, UserCheck, Mail } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
  const lastUpdated = 'August 7, 2026';

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 pt-28 pb-20 mt-20 md:mt-12">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center p-3 bg-orange-100 text-orange-600 rounded-2xl mb-2">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight font-outfit">
            Privacy Policy
          </h1>
          <p className="text-slate-500 text-sm font-medium">
            Last Updated: {lastUpdated} | Gadget CITi (CITi Hub)
          </p>
        </div>

        {/* Content Box */}
        <div className="bg-white rounded-3xl p-6 md:p-10 border border-slate-200 shadow-sm space-y-8 text-slate-700 text-sm md:text-base leading-relaxed">
          
          <div className="p-4 bg-slate-900 text-white rounded-2xl text-xs md:text-sm flex gap-3 items-start shadow-md">
            <ShieldCheck className="w-6 h-6 text-orange-400 shrink-0 mt-0.5" />
            <p>
              At <strong>Gadget CITi</strong>, protecting your privacy and ensuring the security of your personal data is a top priority. This Privacy Policy outlines how we collect, store, process, and protect your information when you visit our website or use our services.
            </p>
          </div>

          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-slate-100 text-orange-600 text-xs font-black flex items-center justify-center">1</span>
              Information We Collect
            </h2>
            <p>
              We collect information to provide better services, process orders, and improve your shopping experience. This includes:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-600">
              <li><strong>Personal Identification Details:</strong> Full name, email address, phone number, shipping address, and national ID details (for financing or trade-ins).</li>
              <li><strong>Transaction & Order Details:</strong> Purchase history, order items, delivery preferences, and payment status records.</li>
              <li><strong>Technical Data:</strong> IP address, device type, browser information, and session activities captured via cookies.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3 border-t border-slate-100 pt-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-slate-100 text-orange-600 text-xs font-black flex items-center justify-center">2</span>
              Payment Security & Paystack Processing
            </h2>
            <p>
              We prioritize financial security. All payment transactions (Credit/Debit Cards, Mobile Money) are processed securely through <strong>Paystack Payments Limited</strong>, a PCI-DSS Level 1 certified payment gateway.
            </p>
            <div className="bg-orange-50 border border-orange-200 p-4 rounded-2xl text-slate-800 text-xs md:text-sm">
              <p className="font-semibold text-orange-900">Important Note on Payment Data:</p>
              <p className="mt-1">
                Gadget CITi does not store, transmit, or process raw credit card numbers or Mobile Money PINs on our servers. All sensitive financial authorization occurs directly within Paystack’s encrypted infrastructure.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3 border-t border-slate-100 pt-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-slate-100 text-orange-600 text-xs font-black flex items-center justify-center">3</span>
              How We Use Your Information
            </h2>
            <p>We use your information solely for legitimate business purposes:</p>
            <ul className="list-disc pl-5 space-y-2 text-slate-600">
              <li>Processing, fulfilling, and dispatching your orders.</li>
              <li>Managing "Pay Small Small" installment payment agreements and trade-in applications.</li>
              <li>Sending automated order tracking notifications via email or SMS.</li>
              <li>Providing customer support and technical assistance.</li>
              <li>Preventing fraudulent activities and ensuring platform safety.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3 border-t border-slate-100 pt-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-slate-100 text-orange-600 text-xs font-black flex items-center justify-center">4</span>
              Cookies & Tracking Technologies
            </h2>
            <p>
              We use functional cookies to remember your cart items, authentication session, and user preferences. You can configure your browser to reject cookies, though some features of our online store may not function optimally as a result.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3 border-t border-slate-100 pt-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-slate-100 text-orange-600 text-xs font-black flex items-center justify-center">5</span>
              Data Sharing & Third Parties
            </h2>
            <p>
              We do not sell, rent, or trade your personal information to third parties. We share data only with essential operational service providers under strict confidentiality agreements:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-600">
              <li><strong>Paystack:</strong> For secure payment gateway operations.</li>
              <li><strong>Logistics Partners:</strong> Courier services for physical order fulfillment.</li>
              <li><strong>Regulatory Authorities:</strong> Only when strictly required by law or legal proceedings in Ghana.</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="space-y-3 border-t border-slate-100 pt-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-slate-100 text-orange-600 text-xs font-black flex items-center justify-center">6</span>
              Your Rights & Data Control
            </h2>
            <p>
              Under Ghana’s Data Protection Act, 2012 (Act 843), you have the right to request access to your personal data, request corrections, or request deletion of your account and personal history, subject to statutory record-keeping requirements.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-3 border-t border-slate-100 pt-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-slate-100 text-orange-600 text-xs font-black flex items-center justify-center">7</span>
              Contact Us Regarding Privacy
            </h2>
            <p>
              For any questions, requests, or privacy concerns, reach out to our Data Protection Team:
            </p>
            <div className="bg-slate-50 p-4 rounded-xl text-xs md:text-sm font-semibold space-y-1 text-slate-700">
              <p>Gadget CITi Hub - Data Privacy Desk</p>
              <p>Email: contact@gadgetciti.com</p>
              <p>Phone: +233 54 344 2518</p>
              <p>Kumasi, KNUST, Ghana</p>
            </div>
          </section>
        </div>

        {/* Footer Link Navigation */}
        <div className="flex justify-between items-center text-xs font-bold text-slate-500 px-2">
          <Link href="/terms" className="hover:text-orange-500 transition-colors">&larr; View Terms of Service</Link>
          <Link href="/refund-policy" className="hover:text-orange-500 transition-colors">View Refund Policy &rarr;</Link>
        </div>
      </div>
    </div>
  );
}
