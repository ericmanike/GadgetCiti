'use client';
import React, { useState } from 'react';
import { Check, ArrowLeft, ShieldCheck, X } from 'lucide-react';
import { useToast } from '@/components/toastProvider';
import { useAuth } from '@/components/AuthContext';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function GadgetCitiSubscriptions() {
  const { user, loading } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  // Payment states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [momoNetwork, setMomoNetwork] = useState('13'); // '13' = MTN, '6' = Telecel, '7' = AT
  const [momoNumber, setMomoNumber] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'initiating' | 'otp_required' | 'pending' | 'success' | 'failed' | 'timeout'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [otpRef, setOtpRef] = useState('');
  const [otpCode, setOtpCode] = useState('');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="loader w-10 h-10" />
      </div>
    );
  }

  // Poll payment status
  const pollPaymentStatus = async (ref: string, attempt = 1) => {
    if (attempt > 20) {
      setPaymentStatus('timeout');
      return;
    }

    try {
      const res = await fetch('/api/payments/moolre', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'status', externalref: ref }),
      });
      const result = await res.json();

      if (result.success) {
        if (result.status === 'success') {
          setPaymentStatus('success');
          showToast('Payment verified successfully! Subscription activated. 🎉', 'success');
          setTimeout(() => {
            setIsModalOpen(false);
            setPaymentStatus('idle');
            router.push('/');
          }, 2500);
        } else if (result.status === 'failed') {
          setPaymentStatus('failed');
          setErrorMessage(result.error || 'Transaction failed');
        } else {
          // Still pending, check again in 3 seconds
          setTimeout(() => pollPaymentStatus(ref, attempt + 1), 3000);
        }
      } else {
        setTimeout(() => pollPaymentStatus(ref, attempt + 1), 3000);
      }
    } catch (err) {
      setTimeout(() => pollPaymentStatus(ref, attempt + 1), 3000);
    }
  };

  const handlePayment = async (otp?: string, customRef?: string) => {
    if (!user) {
      showToast('Please sign in to subscribe.', 'error');
      router.push('/auth/login');
      return;
    }

    if (!momoNumber) {
      showToast('Please enter your Mobile Money number.', 'error');
      return;
    }

    setPaymentStatus('initiating');
    setErrorMessage('');
    
    const ref = customRef || `sub-${user.id}-${Date.now()}`;

    try {
      const res = await fetch('/api/payments/moolre', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'initiate',
          channel: momoNetwork,
          payer: momoNumber,
          amount: '30.00',
          externalref: ref,
          ...(otp ? { otpcode: otp } : {}),
        }),
      });
      const result = await res.json();

      if (result.success) {
        if (result.code === 'TP14') {
          setPaymentStatus('otp_required');
          setOtpRef(ref);
        } else {
          setPaymentStatus('pending');
          pollPaymentStatus(ref);
        }
      } else {
        if (result.code === 'TP14') {
          setPaymentStatus('otp_required');
          setOtpRef(ref);
        } else {
          setPaymentStatus('failed');
          setErrorMessage(result.error || 'Failed to initiate payment.');
        }
      }
    } catch (err: any) {
      setPaymentStatus('failed');
      setErrorMessage(err.message || 'An error occurred during payment.');
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 text-gray-900 font-sans pb-20 pt-20">
        
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
              Upgrade to Gadget CITi Pro
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
                  onClick={() => {
                    if (!user) {
                      showToast('Please sign in to subscribe.', 'error');
                      router.push('/auth/login');
                      return;
                    }
                    setIsModalOpen(true);
                  }}
                >
                  Subscribe Now
                </button>
                <p className="text-center text-gray-400 text-xs mt-4">
                  Secure payment processed by Moolre. Cancel anytime.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Moolre Payment Flow Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-[999]">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl p-6 max-w-md w-full relative overflow-hidden"
            >
              {/* Close Button */}
              {paymentStatus === 'idle' && (
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="absolute right-4 top-4 p-1 rounded-full text-gray-450 hover:bg-gray-100 hover:text-gray-750 transition"
                >
                  <X className="size-5" />
                </button>
              )}

              {paymentStatus === 'idle' && (
                <div className="space-y-5">
                  <div className="text-center">
                    <h3 className="text-lg font-black text-gray-900">Moolre Mobile Money</h3>
                    <p className="text-sm text-gray-500">Subscribe to Pro Plan (GHS 30/month)</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Select Network</label>
                      <select
                        value={momoNetwork}
                        onChange={e => setMomoNetwork(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none bg-white transition text-sm cursor-pointer"
                      >
                        <option value="13">MTN Mobile Money</option>
                        <option value="6">Telecel Cash</option>
                        <option value="7">AT Money</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Mobile Money Number</label>
                      <input
                        value={momoNumber}
                        onChange={e => setMomoNumber(e.target.value)}
                        placeholder="e.g. 024XXXXXXX"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition text-sm"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => handlePayment()}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl transition shadow-md hover:shadow-lg active:scale-98 cursor-pointer"
                  >
                    Pay GHS 30.00
                  </button>
                </div>
              )}

              {paymentStatus === 'initiating' && (
                <div className="py-6 text-center space-y-4">
                  <div className="loader w-12 h-12 mx-auto" />
                  <h3 className="text-lg font-black text-gray-900">Initiating Payment</h3>
                  <p className="text-gray-500 text-sm">Connecting to Moolre Mobile Money gateway...</p>
                </div>
              )}

              {paymentStatus === 'pending' && (
                <div className="py-6 text-center space-y-4">
                  <div className="loader w-12 h-12 mx-auto" />
                  <h3 className="text-lg font-black text-gray-900">USSD Prompt Sent! 📲</h3>
                  <p className="text-gray-650 text-sm font-semibold">
                    Please check your phone for a Mobile Money prompt.
                  </p>
                  <p className="text-gray-500 text-xs px-2">
                    Authorize the payment of <span className="font-bold text-gray-800">GHS 30.00</span> by entering your MoMo PIN on your device. We are waiting for your approval...
                  </p>
                </div>
              )}

              {paymentStatus === 'success' && (
                <div className="py-6 text-center space-y-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 text-2xl font-black">✓</div>
                  <h3 className="text-lg font-black text-gray-900">Success!</h3>
                  <p className="text-gray-500 text-sm">Your subscription is now active.</p>
                </div>
              )}

              {paymentStatus === 'otp_required' && (
                <div className="py-6 space-y-4 text-left">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 text-xl mb-2">🔑</div>
                    <h3 className="text-lg font-black text-gray-900">Verification Required</h3>
                    <p className="text-gray-500 text-sm mt-1">Please enter the validation OTP code sent to your phone via SMS.</p>
                  </div>
                  <div className="space-y-3">
                    <input
                      value={otpCode}
                      onChange={e => setOtpCode(e.target.value)}
                      placeholder="Enter OTP Code"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none text-center font-bold tracking-widest text-lg"
                    />
                    <button
                      onClick={() => handlePayment(otpCode, otpRef)}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl transition shadow-md cursor-pointer"
                    >
                      Verify OTP & Subscribe
                    </button>
                    <button
                      onClick={() => setPaymentStatus('idle')}
                      className="w-full text-center text-xs font-semibold text-gray-400 hover:text-gray-600 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {paymentStatus === 'failed' && (
                <div className="py-6 text-center space-y-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-600 text-xl font-black">✕</div>
                  <h3 className="text-lg font-black text-gray-900">Payment Failed</h3>
                  <p className="text-red-500 text-sm">{errorMessage}</p>
                  <button
                    onClick={() => setPaymentStatus('idle')}
                    className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-2.5 rounded-xl transition"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {paymentStatus === 'timeout' && (
                <div className="py-6 text-center space-y-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto text-yellow-600 text-xl font-black">!</div>
                  <h3 className="text-lg font-black text-gray-900">Payment Timeout</h3>
                  <p className="text-gray-500 text-sm px-2">We did not receive confirmation in time. Please check your phone or try again.</p>
                  <button
                    onClick={() => setPaymentStatus('idle')}
                    className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-2.5 rounded-xl transition"
                  >
                    Try Again
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}