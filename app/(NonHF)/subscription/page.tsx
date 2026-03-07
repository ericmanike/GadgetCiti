'use client';
import React from 'react';
import { Check, Sparkles, BadgeCheck } from 'lucide-react';
import { useToast } from '@/components/toastProvider';
import Script from 'next/script';
import { useAuth } from '@/components/AuthContext';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';


declare global {
  interface Window {
    PaystackPop: any;
  }
}


export default function RecycloSubscriptions() {
  const { user, loading } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-300 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
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
    } catch (error) {
      showToast('Payment verification failed', 'error');
    }
  };

  const handlePayment = (email: string, amount: number) => {

    const handler = window.PaystackPop.setup({
      key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
      email: email,
      amount: Number(amount) * 100,
      currency: 'GHS', // or 'NGN', 'USD', 'ZAR'
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
      <div className="min-h-screen bg-gray-300 p-4 md:p-8 flex items-center justify-center relative">

        <button className='ml-10 px-5 py-2 cursor-pointer bg-gray-100 text-black rounded flex items-center absolute top-4 left-4' onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>
        <div className="w-full flex flex-col md:flex-row gap-6 md:gap-8 justify-around max-w-6xl">

          {/* Premium Plan */}
          <div className="w-full md:w-auto bg-linear-to-br from-emerald-600 to-teal-600 rounded-2xl shadow-xl p-6 md:p-8 text-white relative overflow-hidden hover:shadow-2xl transition-shadow">
            <div className="absolute top-4 right-4">
              <span className="bg-yellow-400 text-emerald-900 text-xs font-bold px-3 py-1 rounded-full flex items-center">
                <Sparkles className="w-3 h-3 mr-1" />
                BEST OFFER
              </span>
            </div>

            <div className="mb-4 md:mb-6">
              <h3 className="text-xl md:text-2xl font-bold mb-2">Premium</h3>
              <p className="text-emerald-50 text-sm md:text-base">For the eco-warrior</p>
            </div>

            <div className="mb-4 md:mb-6">
              <div className="flex items-baseline">
                <span className="text-3xl md:text-4xl font-bold">GHS 30.00</span>
                <span className="text-emerald-100 ml-2 text-sm md:text-base">/month</span>
              </div>
            </div>

            <ul className="space-y-3 md:space-y-4 mb-6 md:mb-8">

              <li className="flex items-start">
                <Check className="w-4 h-4 md:w-5 md:h-5 text-yellow-300 mr-2 md:mr-3 mt-0.5 shrink-0" />
                <span className="text-sm md:text-base">Local recycling center locations</span>
              </li>
              <li className="flex items-start">
                <Check className="w-4 h-4 md:w-5 md:h-5 text-yellow-300 mr-2 md:mr-3 mt-0.5 shrink-0" />
                <span className="text-sm md:text-base">AI-powered recycling recommendations</span>
              </li>
              <li className="flex items-start">
                <Check className="w-4 h-4 md:w-5 md:h-5 text-yellow-300 mr-2 md:mr-3 mt-0.5 shrink-0" />
                <span className="text-sm md:text-base">Carbon footprint calculator</span>
              </li>
              <li className="flex items-start">
                <Check className="w-4 h-4 md:w-5 md:h-5 text-yellow-300 mr-2 md:mr-3 mt-0.5 shrink-0" />
                <span className="text-sm md:text-base">Track your recycling impact</span>
              </li>
              <li className="flex items-start">
                <Check className="w-4 h-4 md:w-5 md:h-5 text-yellow-300 mr-2 md:mr-3 mt-0.5 shrink-0" />
                <span className="text-sm md:text-base">Earn rewards and badges</span>
              </li>
              <li className="flex items-start">
                <Check className="w-4 h-4 md:w-5 md:h-5 text-yellow-300 mr-2 md:mr-3 mt-0.5 shrink-0" />
                <span className="text-sm md:text-base">Community challenges</span>
              </li>
              <li className="flex items-start">
                <Check className="w-4 h-4 md:w-5 md:h-5 text-yellow-300 mr-2 md:mr-3 mt-0.5 shrink-0" />
                <span className="flex items-center text-sm md:text-base">
                  Premium verified badge
                  <BadgeCheck className="w-4 h-4 md:w-5 md:h-5 text-white ml-1.5" />
                </span>
              </li>

            </ul>


            <button className="w-full 
            cursor-pointer bg-yellow-400 text-emerald-900
             font-bold py-2 rounded-lg hover:bg-yellow-500 
             transition-colors mt-4" onClick={() => handlePayment(user?.email || '', 30)}>
              Subscribe Now
            </button>
          </div>



        </div>
      </div>
    </>
  );
}