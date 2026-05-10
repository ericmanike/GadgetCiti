'use client';
import React from 'react';
import { Check, ArrowLeft } from 'lucide-react';
import { useToast } from '@/components/toastProvider';
import Script from 'next/script';
import { useAuth } from '@/components/AuthContext';
import { useRouter } from 'next/navigation';

declare global {
  interface Window {
    PaystackPop: any;
  }
}

export default function LetronixSubscriptions() {
  const { user, loading } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const verifyPayment = async (reference: string) => {
    try {
      const res = await fetch('https://api.recyco.me/payment/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference }),
      });
      if (!res.ok) {
         showToast('Payment verification failed', 'error');
      } else {
         showToast('Payment verified successfully', 'success');
      }
    } catch (error) {
      showToast('Payment verification failed', 'error');
    }
  };

  const handlePayment = (email: string, amount: number) => {
    if (!window.PaystackPop) {
      showToast('Payment gateway is loading. Please try again.', 'error');
      return;
    }

    const handler = window.PaystackPop.setup({
      key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
      email: email,
      amount: Number(amount) * 100,
      currency: 'GHS',
      ref: 'PS_' + Math.floor((Math.random() * 1000000000) + 1),
      onClose: function () {
        showToast('Payment window closed', 'info');
      },
      callback: function (response: any) {
        verifyPayment(response.reference);
      }
    });

    handler.openIframe();
  };

  return (
    <>
      <Script src="https://js.paystack.co/v1/inline.js" />
      <div className="min-h-screen bg-gray-50 text-gray-900 font-sans pb-20">
        
        {/* Header/Nav */}
        <div className="w-full p-6 md:p-8 flex justify-start max-w-5xl mx-auto">
          <button 
            onClick={() => router.back()}
            className="flex items-center text-gray-500 hover:text-gray-900 transition-colors font-medium cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
        </div>

        <div className="flex flex-col items-center px-4 pt-8">
          
          <div className="text-center max-w-2xl mb-12">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-gray-900">
              Upgrade to Letronix Pro
            </h1>
            <p className="text-lg text-gray-600">
              Supercharge your e-commerce storefront with advanced tools, analytics, and custom branding.
            </p>
          </div>

          <div className="w-full max-w-md mx-auto">
            {/* Premium Plan Card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">Pro Plan</h3>
                  <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                    Best Value
                  </span>
                </div>

                <div className="mb-6 flex items-baseline">
                  <span className="text-4xl font-bold text-gray-900">
                    GHS 30
                  </span>
                  <span className="text-gray-500 ml-2 font-medium">/month</span>
                </div>

                <p className="text-gray-600 mb-8">
                  Everything you need to scale your business.
                </p>

                <ul className="space-y-4 mb-8">
                  {[
                    'Custom Storefront Domain',
                    'Advanced Sales Analytics',
                    '0% Transaction Fees',
                    'Unlimited Product Listings',
                    'Custom Branding & Themes',
                    'Automated Order Fulfillment',
                    'Priority 24/7 Support'
                  ].map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <Check className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
                      <span className="ml-3 text-gray-700">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <button 
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3.5 rounded-xl transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 cursor-pointer"
                  onClick={() => handlePayment(user?.email || '', 30)}
                >
                  Subscribe Now
                </button>
                <p className="text-center text-gray-400 text-xs mt-4">
                  Secure payment processed by Paystack. Cancel anytime.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}