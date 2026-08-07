'use client';

import React from 'react';
import { ShieldCheck, FileText, Scale, CreditCard, Truck, RefreshCw, Lock, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function TermsOfServicePage() {
  const lastUpdated = 'August 7, 2026';

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 pt-28 pb-20 mt-20 md:mt-12">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center p-3 bg-orange-100 text-orange-600 rounded-2xl mb-2">
            <Scale className="w-8 h-8" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight font-outfit">
            Terms of Service
          </h1>
          <p className="text-slate-500 text-sm font-medium">
            Last Updated: {lastUpdated} | Gadget CITi (CITi Hub)
          </p>
        </div>

        {/* Content Box */}
        <div className="bg-white rounded-3xl p-6 md:p-10 border border-slate-200 shadow-sm space-y-8 text-slate-700 text-sm md:text-base leading-relaxed">
          
          <div className="p-4 bg-orange-50 rounded-2xl border border-orange-200 text-slate-800 text-xs md:text-sm flex gap-3 items-start">
            <AlertCircle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
            <p>
              Welcome to <strong>Gadget CITi</strong>. By accessing our platform, purchasing products, utilizing our trade-in or "Pay Small Small" installment services, or engaging our IT repair services, you agree to comply with and be bound by the following Terms of Service. Please read them carefully.
            </p>
          </div>

          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-slate-100 text-orange-600 text-xs font-black flex items-center justify-center">1</span>
              General & Business Overview
            </h2>
            <p>
              Gadget CITi (also operating as CITi Hub) is a registered business operating in Kumasi, Ghana. We specialize in the retail and wholesale of consumer electronics (smartphones, laptops, tablets, accessories), device trade-ins, installment payment solutions, and technical IT services.
            </p>
            <p>
              By placing an order on our platform, you confirm that you are at least 18 years of age or have legal parental/guardian consent to enter into binding agreements.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3 border-t border-slate-100 pt-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-slate-100 text-orange-600 text-xs font-black flex items-center justify-center">2</span>
              Pricing, Orders & Payments
            </h2>
            <p>
              All prices listed on Gadget CITi are in Ghanaian Cedi (GHS) unless explicitly specified otherwise. We reserve the right to update product prices and availability without prior notice.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-600">
              <li><strong>Payment Processing:</strong> Online card payments and Mobile Money transactions are processed securely through <strong>Paystack</strong>. Gadget CITi does not store sensitive card or MoMo PIN information.</li>
              <li><strong>Order Confirmation:</strong> An order is considered confirmed upon successful payment verification or authorization. We reserve the right to cancel orders in cases of stock unavailability or suspected fraudulent transactions.</li>
              <li><strong>Pay Small Small Financing:</strong> Purchases made via installment financing require strict adherence to agreed repayment schedules. Default on payments may lead to account suspension or device locks until resolved.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3 border-t border-slate-100 pt-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-slate-100 text-orange-600 text-xs font-black flex items-center justify-center">3</span>
              Delivery & In-Store Pickups
            </h2>
            <p>
              We deliver packages across regions in Ghana using trusted logistics partners. Estimated delivery times provided at checkout are indicative.
            </p>
            <p>
              Customers opting for in-store pickup at our Kumasi location must present valid national identification (Ghana Card) and order confirmation details upon collection.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3 border-t border-slate-100 pt-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-slate-100 text-orange-600 text-xs font-black flex items-center justify-center">4</span>
              Warranties & Device Condition
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-slate-600">
              <li><strong>Brand New Products:</strong> Covered by standard manufacturer warranty (up to 12 months) covering factory defects.</li>
              <li><strong>Gently Used / Refurbished Products:</strong> Covered by a 6-month Gadget CITi store warranty for functional defects. Physical damage, liquid contact, unauthorized repair attempts, or power surges render warranty null and void.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3 border-t border-slate-100 pt-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-slate-100 text-orange-600 text-xs font-black flex items-center justify-center">5</span>
              Trade-In & Selling Policies
            </h2>
            <p>
              When selling devices to Gadget CITi, sellers guarantee that they possess legitimate ownership of the device and that it is not reported stolen or blacklisted. Sellers must remove all personal accounts (iCloud, Google Account, Samsung Account) prior to handover.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3 border-t border-slate-100 pt-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-slate-100 text-orange-600 text-xs font-black flex items-center justify-center">6</span>
              Limitation of Liability & Governing Law
            </h2>
            <p>
              Gadget CITi shall not be held liable for any indirect, incidental, or consequential damages resulting from the use or inability to use our products or web services.
            </p>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the <strong>Republic of Ghana</strong>. Any disputes shall be submitted to appropriate jurisdiction courts in Ghana.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-3 border-t border-slate-100 pt-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-slate-100 text-orange-600 text-xs font-black flex items-center justify-center">7</span>
              Contact Information
            </h2>
            <p>
              If you have any questions regarding our Terms of Service, please contact us at:
            </p>
            <div className="bg-slate-50 p-4 rounded-xl text-xs md:text-sm font-semibold space-y-1 text-slate-700">
              <p>Gadget CITi Hub</p>
              <p>Kumasi, KNUST, Ghana</p>
              <p>Email: contact@gadgetciti.com</p>
              <p>Phone: +233 54 344 2518</p>
            </div>
          </section>
        </div>

        {/* Footer Link Navigation */}
        <div className="flex justify-between items-center text-xs font-bold text-slate-500 px-2">
          <Link href="/privacy" className="hover:text-orange-500 transition-colors">View Privacy Policy &rarr;</Link>
          <Link href="/refund-policy" className="hover:text-orange-500 transition-colors">View Refund Policy &rarr;</Link>
        </div>
      </div>
    </div>
  );
}
