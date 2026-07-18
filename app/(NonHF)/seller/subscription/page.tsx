'use client';

import React, { useState } from 'react';
import { 
  Check, ShieldCheck, Zap, Crown, Sparkles, X, CreditCard, Star, ArrowRight, Building2, HelpCircle 
} from 'lucide-react';
import { useToast } from '@/components/toastProvider';
import { useAuth } from '@/components/AuthContext';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface Plan {
  id: string;
  name: string;
  badge?: string;
  isRecommended?: boolean;
  priceGHS: number;
  period: string;
  description: string;
  features: string[];
  buttonText: string;
  buttonVariant: 'outline' | 'primary' | 'dark';
}

export default function SellerSubscriptionPage() {
  const { user, loading } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [momoNetwork, setMomoNetwork] = useState('13'); // '13' = MTN, '6' = Telecel, '7' = AT
  const [momoNumber, setMomoNumber] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'initiating' | 'otp_required' | 'pending' | 'success' | 'failed' | 'timeout'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [otpRef, setOtpRef] = useState('');
  const [otpCode, setOtpCode] = useState('');

  const plans: Plan[] = [
    {
      id: 'starter',
      name: 'Starter Seller',
      priceGHS: 0,
      period: 'Forever free',
      description: 'Perfect for new sellers testing out the marketplace platform.',
      features: [
        'Up to 5 active product listings',
        'Standard search placement',
        'Basic store profile page',
        '5% sales transaction fee',
        'Community email support',
      ],
      buttonText: 'Current Plan',
      buttonVariant: 'outline',
    },
    {
      id: 'pro',
      name: 'Pro Merchant',
      badge: 'Most Popular',
      isRecommended: true,
      priceGHS: 49,
      period: 'per month',
      description: 'Built for active sellers looking to scale fast with zero commissions.',
      features: [
        'Unlimited product listings',
        '0% platform transaction fee',
        'Featured seller badge & priority search ranking',
        'Advanced sales & visitor analytics',
        'Custom store branding & banner',
        'Direct customer messaging & chat',
        'Priority 24/7 dedicated support',
      ],
      buttonText: 'Upgrade to Pro',
      buttonVariant: 'primary',
    },
    {
      id: 'enterprise',
      name: 'Gold Partner',
      badge: 'Maximum Growth',
      priceGHS: 129,
      period: 'per month',
      description: 'Ultimate power tools & direct promotion for established tech stores.',
      features: [
        'Everything included in Pro',
        'Homepage banner feature spotlight',
        'Gold Verified Partner checkmark',
        'Bulk CSV inventory import/export',
        'Dedicated account manager',
        'Instant payout requests',
        'Custom social media promotion',
      ],
      buttonText: 'Get Gold Partner',
      buttonVariant: 'dark',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="loader w-10 h-10 mb-3" />
        <p className="text-slate-400 font-semibold text-sm animate-pulse">Loading Seller Subscriptions...</p>
      </div>
    );
  }

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
          showToast(`🎉 Subscription to ${selectedPlan?.name || 'Pro'} activated successfully!`, 'success');
          setTimeout(() => {
            setIsModalOpen(false);
            setPaymentStatus('idle');
            router.push('/seller');
          }, 2500);
        } else if (result.status === 'failed') {
          setPaymentStatus('failed');
          setErrorMessage(result.error || 'Transaction failed');
        } else {
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
    
    const amountStr = selectedPlan ? selectedPlan.priceGHS.toFixed(2) : '49.00';
    const ref = customRef || `sub-${user.id}-${Date.now()}`;

    try {
      const res = await fetch('/api/payments/moolre', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'initiate',
          channel: momoNetwork,
          payer: momoNumber,
          amount: amountStr,
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

  const openSubscribeModal = (plan: Plan) => {
    if (plan.priceGHS === 0) {
      showToast('You are currently on the Starter Plan.', 'info');
      return;
    }
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-10 pb-12">
      {/* Page Header */}
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white rounded-3xl p-8 md:p-10 shadow-xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl -z-0 pointer-events-none" />
        <div className="relative z-10 space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500/30 text-orange-400 font-bold text-xs px-3.5 py-1.5 rounded-full uppercase tracking-wider">
            <Crown size={14} className="text-orange-400" />
            Seller Membership Packages
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">
            Supercharge Your <span className="text-orange-500">Store Front</span>
          </h1>
          <p className="text-slate-300 text-sm md:text-base font-medium leading-relaxed">
            Choose a plan tailored for your gadget business. Unlock 0% transaction commissions, priority buyer search placement, and premium seller tools.
          </p>
        </div>
      </div>

      {/* Subscription Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {plans.map((plan) => {
          return (
            <div
              key={plan.id}
              className={`relative flex flex-col justify-between rounded-3xl p-8 transition-all duration-300 ${
                plan.isRecommended
                  ? 'bg-white shadow-2xl scale-[1.02] z-10 ring-2 ring-orange-500'
                  : 'bg-white shadow-sm hover:shadow-md'
              }`}
            >
              {/* Badge for Recommended Plan */}
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-black px-4 py-1 rounded-full shadow-md uppercase tracking-wider flex items-center gap-1">
                  <Sparkles size={12} />
                  {plan.badge}
                </div>
              )}

              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-xl font-black text-gray-900">{plan.name}</h3>
                  {plan.isRecommended && (
                    <span className="p-2 bg-orange-50 rounded-2xl text-orange-500">
                      <Zap size={20} />
                    </span>
                  )}
                </div>

                <p className="text-xs text-gray-500 font-medium mb-6 min-h-[36px]">
                  {plan.description}
                </p>

                <div className="mb-6 flex items-baseline">
                  <span className="text-4xl font-black text-gray-900 tracking-tight">
                    GHS {plan.priceGHS}
                  </span>
                  <span className="text-gray-400 text-xs font-bold ml-2 uppercase">
                    / {plan.period}
                  </span>
                </div>

                <div className="h-px bg-gray-100 w-full mb-6" />

                <ul className="space-y-3.5 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-[11px] md:text-[14px] text-gray-700 font-medium">
                      <div className={`p-0.5 rounded-full mt-0.5 shrink-0 ${plan.isRecommended ? 'bg-orange-500 text-white' : 'bg-emerald-100 text-emerald-600'}`}>
                        <Check size={12} strokeWidth={3} />
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => openSubscribeModal(plan)}
                className={`w-full py-3.5 px-6 rounded-2xl text-[11px] md:text-[14px] font-bold transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 ${
                  plan.buttonVariant === 'primary'
                    ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/25 active:scale-98'
                    : plan.buttonVariant === 'dark'
                    ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-md active:scale-98'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700 cursor-default'
                }`}
              >
                <span>{plan.buttonText}</span>
                {plan.priceGHS > 0 && <ArrowRight size={16} />}
              </button>
            </div>
          );
        })}
      </div>

      {/* Feature Comparison Box */}
      <div className="bg-white rounded-3xl p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-orange-50 text-orange-500 rounded-2xl">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h3 className="text-lg font-black text-gray-900">Why Upgrade Your Seller Plan?</h3>
            <p className="text-xs text-gray-500 font-medium">Verified seller benefits designed to maximize revenue and trust.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          <div className="p-4 rounded-2xl bg-gray-50 space-y-2">
            <h4 className="font-bold text-[11px] md:text-[14px] text-gray-900 flex items-center gap-2">
              <Zap size={16} className="text-orange-500" /> 0% Transaction Fees
            </h4>
            <p className="text-[11px] md:text-[14px] text-gray-500 leading-relaxed">
              Keep 100% of your earnings on every sale without paying high marketplace cut rates.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 space-y-2">
            <h4 className="font-bold text-[11px] md:text-[14px] text-gray-900 flex items-center gap-2">
              <Star size={16} className="text-amber-500" /> Priority Buyer Exposure
            </h4>
            <p className="text-[11px] md:text-[14px] text-gray-500 leading-relaxed">
              Pro & Gold listings rank higher in search results, giving your gadgets 5x more buyer views.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 space-y-2">
            <h4 className="font-bold text-[11px] md:text-[14px] text-gray-900 flex items-center gap-2">
              <CreditCard size={16} className="text-emerald-500" /> Instant MoMo Payments
            </h4>
            <p className="text-[11px] md:text-[14px] text-gray-500 leading-relaxed">
              Subscribe easily via MTN Mobile Money, Telecel Cash, or AT Money with instant activation.
            </p>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <AnimatePresence>
        {isModalOpen && selectedPlan && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-[999]">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 max-w-md w-full relative overflow-hidden border border-gray-100"
            >
              {paymentStatus === 'idle' && (
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="absolute right-5 top-5 p-1.5 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
                >
                  <X size={20} />
                </button>
              )}

              {paymentStatus === 'idle' && (
                <div className="space-y-6">
                  <div className="text-center space-y-1">
                    <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto text-orange-500 mb-3 border border-orange-100">
                      <Crown size={24} />
                    </div>
                    <h3 className="text-xl font-black text-gray-900">Subscribe to {selectedPlan.name}</h3>
                    <p className="text-xs font-semibold text-orange-600 bg-orange-50 inline-block px-3 py-1 rounded-full">
                      Total: GHS {selectedPlan.priceGHS.toFixed(2)} / month
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Select Network Provider</label>
                      <select
                        value={momoNetwork}
                        onChange={e => setMomoNetwork(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none bg-white transition text-sm font-semibold cursor-pointer"
                      >
                        <option value="13">MTN Mobile Money</option>
                        <option value="6">Telecel Cash</option>
                        <option value="7">AT Money</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Mobile Money Phone Number</label>
                      <input
                        value={momoNumber}
                        onChange={e => setMomoNumber(e.target.value)}
                        placeholder="e.g. 024XXXXXXX"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition text-sm font-medium"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => handlePayment()}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-2xl transition shadow-lg shadow-orange-500/20 active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Pay GHS {selectedPlan.priceGHS.toFixed(2)}</span>
                    <ArrowRight size={18} />
                  </button>

                  <p className="text-center text-gray-400 text-[11px]">
                    Instant activation via Moolre Gateway. Cancel anytime.
                  </p>
                </div>
              )}

              {paymentStatus === 'initiating' && (
                <div className="py-8 text-center space-y-4">
                  <div className="loader w-12 h-12 mx-auto" />
                  <h3 className="text-lg font-black text-gray-900">Initiating Payment</h3>
                  <p className="text-gray-500 text-xs">Connecting to Mobile Money payment gateway...</p>
                </div>
              )}

              {paymentStatus === 'pending' && (
                <div className="py-8 text-center space-y-4">
                  <div className="loader w-12 h-12 mx-auto" />
                  <h3 className="text-lg font-black text-gray-900">USSD Prompt Sent! 📲</h3>
                  <p className="text-slate-700 text-sm font-bold">
                    Check your mobile phone for authorization prompt.
                  </p>
                  <p className="text-gray-500 text-xs px-2 leading-relaxed">
                    Authorize payment of <span className="font-bold text-gray-900">GHS {selectedPlan.priceGHS.toFixed(2)}</span> by entering your PIN on your mobile device.
                  </p>
                </div>
              )}

              {paymentStatus === 'success' && (
                <div className="py-8 text-center space-y-4">
                  <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 text-2xl font-black">✓</div>
                  <h3 className="text-xl font-black text-gray-900">Subscription Active! 🎉</h3>
                  <p className="text-gray-500 text-xs">Welcome to {selectedPlan.name}. Your seller benefits are active.</p>
                </div>
              )}

              {paymentStatus === 'otp_required' && (
                <div className="py-6 space-y-4 text-left">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto text-orange-600 text-xl mb-2">🔑</div>
                    <h3 className="text-lg font-black text-gray-900">OTP Code Required</h3>
                    <p className="text-gray-500 text-xs mt-1">Enter the verification SMS code sent to your phone.</p>
                  </div>
                  <div className="space-y-3">
                    <input
                      value={otpCode}
                      onChange={e => setOtpCode(e.target.value)}
                      placeholder="Enter OTP Code"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none text-center font-bold tracking-widest text-lg"
                    />
                    <button
                      onClick={() => handlePayment(otpCode, otpRef)}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition shadow-md cursor-pointer"
                    >
                      Verify OTP & Activate
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
                  <p className="text-red-500 text-xs">{errorMessage}</p>
                  <button
                    onClick={() => setPaymentStatus('idle')}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl transition cursor-pointer"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {paymentStatus === 'timeout' && (
                <div className="py-6 text-center space-y-4">
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-amber-600 text-xl font-black">!</div>
                  <h3 className="text-lg font-black text-gray-900">Payment Timeout</h3>
                  <p className="text-gray-500 text-xs px-2">Payment confirmation took too long. Check your device or try again.</p>
                  <button
                    onClick={() => setPaymentStatus('idle')}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl transition cursor-pointer"
                  >
                    Try Again
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
