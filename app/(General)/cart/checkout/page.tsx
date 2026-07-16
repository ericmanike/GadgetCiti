'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Truck, ChevronRight, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency } from '@/lib/utils';



const ORDER_ITEMS = [
    { id: '1', name: 'iPhone 15 Pro Max', price: 1199.99, quantity: 1, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80' },
    { id: '2', name: 'AirPods Pro (2nd Generation)', price: 249.00, quantity: 2, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&q=80' },
];

const STEPS = ['Delivery', 'Payment', 'Review'];

export default function CheckoutPage() {
    const [step, setStep] = useState(0);
    const [placed, setPlaced] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'card' | 'mt'>('card');

    const [momoNetwork, setMomoNetwork] = useState('13'); // '13' = MTN, '6' = Telecel, '7' = AT
    const [momoNumber, setMomoNumber] = useState('');
    const [paymentStatus, setPaymentStatus] = useState<'idle' | 'initiating' | 'otp_required' | 'pending' | 'success' | 'failed' | 'timeout'>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const [otpRef, setOtpRef] = useState('');
    const [otpCode, setOtpCode] = useState('');

    const [form, setForm] = useState({
        fullName: '', email: '', phone: '',
        address: '', city: '', region: '', zip: '',
        cardNumber: '', expiry: '', cvv: '', cardName: '',
    });

    const subtotal = ORDER_ITEMS.reduce((s, i) => s + i.price * i.quantity, 0);
    const shipping = 15;
    const total = subtotal + shipping;

    const update = (field: string, val: string) => setForm(f => ({ ...f, [field]: val }));

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
                    setPlaced(true);
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

    // Moolre MoMo handler
    const payWithMoMo = async (otp?: string, customRef?: string) => {
        setPaymentStatus('initiating');
        setErrorMessage('');
        
        const ref = customRef || `gadgetciti-${Date.now()}`;
        const numberToCharge = momoNumber || form.phone;

        try {
            const res = await fetch('/api/payments/moolre', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'initiate',
                    channel: momoNetwork,
                    payer: numberToCharge,
                    amount: total.toFixed(2),
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

    const handlePlaceOrder = () => {
        if (paymentMethod === 'mt') {
            payWithMoMo();
        } else {
            setPlaced(true);
        }
    };

    if (placed) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 mt-20">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                    className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center"
                >
                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 size={44} className="text-green-500" strokeWidth={1.8} />
                    </div>
                    <h1 className="text-2xl font-black text-gray-900 mb-2">Order Placed! 🎉</h1>
                    <p className="text-gray-500 text-sm mb-6">
                        Thank you for shopping with <span className="font-bold text-orange-500">Electronics Mart</span>.<br />
                        Your order is being processed and you'll receive a confirmation shortly.
                    </p>
                    <p className="text-xs font-black tracking-widest text-gray-400 uppercase mb-1">Order Total</p>
                    <p className="text-3xl font-black text-gray-900 mb-8">{formatCurrency(total)}</p>
                    <div className="flex flex-col gap-3">
                        <Link href="/customer/orders" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-2xl transition-all">
                            Track My Order
                        </Link>
                        <Link href="/buy" className="w-full border border-gray-200 text-gray-700 font-bold py-3 rounded-2xl hover:bg-gray-50 transition-all">
                            Continue Shopping
                        </Link>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 mt-20 pt-28 md:pt-32 pb-16 px-4 md:px-8">
            <div className="max-w-5xl mx-auto">

                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <Link href="/cart" className="text-orange-500 hover:text-orange-600 transition-colors">
                        <ArrowLeft size={22} />
                    </Link>
                    <h1 className="text-2xl md:text-3xl font-black text-gray-900">Checkout</h1>
                </div>

                {/* Step indicator */}
                <div className="flex items-center gap-2 mb-10">
                    {STEPS.map((s, i) => (
                        <React.Fragment key={s}>
                            <div className={`flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all ${i === step ? 'text-orange-500' : i < step ? 'text-green-500' : 'text-gray-300'}`}>
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border-2 transition-all ${i === step ? 'border-orange-500 bg-orange-50 text-orange-500' : i < step ? 'border-green-500 bg-green-50 text-green-500' : 'border-gray-200 text-gray-300'}`}>
                                    {i < step ? '✓' : i + 1}
                                </div>
                                <span className="hidden sm:inline">{s}</span>
                            </div>
                            {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 rounded-full transition-all ${i < step ? 'bg-green-400' : 'bg-gray-200'}`} />}
                        </React.Fragment>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Form */}
                    <div className="lg:col-span-2">
                        <AnimatePresence mode="wait">
                            {/* Step 0 — Delivery */}
                            {step === 0 && (
                                <motion.div key="delivery" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
                                    <h2 className="text-base font-black text-gray-900">Delivery Information</h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {[
                                            { field: 'fullName', label: 'Full Name', placeholder: 'John Doe', col: 2 },
                                            { field: 'email', label: 'Email Address', placeholder: 'john@example.com', col: 1 },
                                            { field: 'phone', label: 'Phone Number', placeholder: '+233 XX XXX XXXX', col: 1 },
                                            { field: 'address', label: 'Street Address', placeholder: '123 Main Street', col: 2 },
                                            { field: 'city', label: 'City', placeholder: 'Accra', col: 1 },
                                            { field: 'region', label: 'Region', placeholder: 'Greater Accra', col: 1 },
                                        ].map(({ field, label, placeholder, col }) => (
                                            <div key={field} className={col === 2 ? 'sm:col-span-2' : ''}>
                                                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">{label}</label>
                                                <input
                                                    value={(form as any)[field]}
                                                    onChange={e => update(field, e.target.value)}
                                                    placeholder={placeholder}
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition text-sm"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <button onClick={() => setStep(1)} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2 mt-2">
                                        Continue to Payment <ChevronRight size={18} />
                                    </button>
                                </motion.div>
                            )}

                            {/* Step 1 — Payment */}
                            {step === 1 && (
                                <motion.div key="payment" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
                                    <h2 className="text-base font-black text-gray-900">Payment Method</h2>

                                    {/* Payment method tabs */}
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setPaymentMethod('card')}
                                            className={`flex-1 flex items-center justify-center py-3 rounded-xl border-2 font-bold text-sm transition-all ${paymentMethod === 'card'
                                                ? 'border-orange-500 bg-orange-50 text-orange-600'
                                                : 'border-gray-200 text-gray-500 hover:border-gray-300'
                                                }`}
                                        >
                                            Card
                                        </button>
                                        <button
                                            onClick={() => setPaymentMethod('mt')}
                                            className={`flex-1 flex items-center justify-center py-3 rounded-xl border-2 font-bold text-sm transition-all ${paymentMethod === 'mt'
                                                ? 'border-orange-500 bg-orange-50 text-orange-600'
                                                : 'border-gray-200 text-gray-500 hover:border-gray-300'
                                                }`}
                                        >
                                            Mobile Transfer
                                        </button>
                                    </div>

                                    <AnimatePresence mode="wait">
                                        {paymentMethod === 'card' ? (
                                            <motion.div key="card-fields" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="grid grid-cols-1 gap-4">
                                                {[
                                                    { field: 'cardName', label: 'Name on Card', placeholder: 'John Doe' },
                                                    { field: 'cardNumber', label: 'Card Number', placeholder: '1234 5678 9012 3456' },
                                                    { field: 'expiry', label: 'Expiry', placeholder: 'MM/YY' },
                                                    { field: 'cvv', label: 'CVV', placeholder: '•••' },
                                                ].map(({ field, label, placeholder }) => (
                                                    <div key={field}>
                                                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">{label}</label>
                                                        <input
                                                            value={(form as any)[field]}
                                                            onChange={e => update(field, e.target.value)}
                                                            placeholder={placeholder}
                                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition text-sm"
                                                        />
                                                    </div>
                                                ))}
                                            </motion.div>
                                        ) : (
                                            <motion.div key="mt-fields" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
                                                <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl">
                                                    <p className="text-sm text-orange-850 font-medium">
                                                        Payments are securely processed by <span className="font-bold">Moolre Mobile Money</span>. You'll receive a prompt on your device to enter your MoMo PIN.
                                                    </p>
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Mobile Money Network</label>
                                                    <select
                                                        value={momoNetwork}
                                                        onChange={e => setMomoNetwork(e.target.value)}
                                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none bg-white transition text-sm cursor-pointer"
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
                                                        placeholder={form.phone || '+233 XX XXX XXXX'}
                                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition text-sm"
                                                    />
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <div className="flex gap-3 mt-2">
                                        <button onClick={() => setStep(0)} className="flex-1 border border-gray-200 text-gray-700 font-bold py-3.5 rounded-2xl hover:bg-gray-50 transition-all">Back</button>
                                        <button onClick={() => setStep(2)} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2">
                                            Review Order <ChevronRight size={18} />
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 2 — Review */}
                            {step === 2 && (
                                <motion.div key="review" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
                                    <h2 className="text-base font-black text-gray-900">Review Your Order</h2>
                                    <div className="space-y-3">
                                        {ORDER_ITEMS.map(item => (
                                            <div key={item.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                                                <img src={item.image} alt={item.name} className="w-14 h-14 object-cover rounded-lg" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-gray-900 truncate">{item.name}</p>
                                                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                                </div>
                                                <p className="text-sm font-black text-gray-900">{formatCurrency(item.price * item.quantity)}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-xl space-y-1 text-sm">
                                        <p className="font-bold text-gray-700">📍 {form.address || 'N/A'}, {form.city || 'N/A'}</p>
                                        <p className="text-gray-500">{form.fullName} · {form.phone}</p>
                                        <p className="text-gray-500">
                                            {paymentMethod === 'mt'
                                                ? `Mobile Money (${momoNetwork === '13' ? 'MTN' : momoNetwork === '6' ? 'Telecel' : 'AT'}) - ${momoNumber || form.phone}`
                                                : `Card ending in ${form.cardNumber.slice(-4) || '****'}`
                                            }
                                        </p>
                                    </div>
                                    <div className="flex gap-3 mt-2">
                                        <button onClick={() => setStep(1)} className="flex-1 border border-gray-200 text-gray-700 font-bold py-3.5 rounded-2xl hover:bg-gray-50 transition-all">Back</button>
                                        <button
                                            onClick={handlePlaceOrder}
                                            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-2xl transition-all"
                                        >
                                            {paymentMethod === 'mt' ? 'Pay with MoMo' : 'Place Order 🚀'}
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Right: Order Summary */}
                    <div className="space-y-4">
                        <div className="bg-white rounded-2xl shadow-sm p-5">
                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4">Order Summary</h3>
                            <div className="space-y-3 mb-4">
                                {ORDER_ITEMS.map(item => (
                                    <div key={item.id} className="flex justify-between text-sm">
                                        <span className="text-gray-600 truncate mr-2">{item.name} <span className="text-gray-400">×{item.quantity}</span></span>
                                        <span className="font-bold text-gray-900 shrink-0">{formatCurrency(item.price * item.quantity)}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t border-gray-100 pt-3 space-y-2 text-sm">
                                <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
                                <div className="flex justify-between text-gray-500"><span>Shipping</span><span>{formatCurrency(shipping)}</span></div>
                                <div className="flex justify-between font-black text-gray-900 text-base pt-1 border-t border-gray-100"><span>Total</span><span>{formatCurrency(total)}</span></div>
                            </div>
                        </div>

                        {/* Trust badges */}
                        <div className="bg-white rounded-2xl shadow-sm p-5 space-y-3">
                            {[
                                { icon: ShieldCheck, text: 'Secure checkout', sub: '256-bit SSL encryption' },
                                { icon: Truck, text: 'Fast delivery', sub: 'Delivered in 2–5 business days' },
                            ].map(({ icon: Icon, text, sub }) => (
                                <div key={text} className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                                        <Icon size={16} className="text-orange-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-900">{text}</p>
                                        <p className="text-[10px] text-gray-400">{sub}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            {/* Moolre Payment Status Modal */}
            <AnimatePresence>
                {paymentStatus !== 'idle' && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-[999]">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center relative overflow-hidden"
                        >
                            {paymentStatus === 'initiating' && (
                                <div className="py-6 space-y-4">
                                    <div className="loader w-12 h-12 mx-auto" />
                                    <h3 className="text-lg font-black text-gray-900">Initiating Payment</h3>
                                    <p className="text-gray-500 text-sm">Connecting to Moolre Mobile Money gateway...</p>
                                </div>
                            )}

                            {paymentStatus === 'pending' && (
                                <div className="py-6 space-y-4">
                                    <div className="loader w-12 h-12 mx-auto" />
                                    <h3 className="text-lg font-black text-gray-900">USSD Prompt Sent! 📲</h3>
                                    <p className="text-gray-600 text-sm font-semibold">
                                        Please check your phone for a Mobile Money prompt.
                                    </p>
                                    <p className="text-gray-500 text-xs">
                                        Authorize the payment of <span className="font-bold text-gray-800">{formatCurrency(total)}</span> by entering your MoMo PIN on your device. We are waiting for your approval...
                                    </p>
                                </div>
                            )}

                            {paymentStatus === 'otp_required' && (
                                <div className="py-6 space-y-4 text-left">
                                    <div className="text-center">
                                        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto text-orange-600 text-xl mb-2">🔑</div>
                                        <h3 className="text-lg font-black text-gray-900">Verification Required</h3>
                                        <p className="text-gray-500 text-sm mt-1">Please enter the validation OTP code sent to your phone via SMS.</p>
                                    </div>
                                    <div className="space-y-3">
                                        <input
                                            value={otpCode}
                                            onChange={e => setOtpCode(e.target.value)}
                                            placeholder="Enter OTP Code"
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none text-center font-bold tracking-widest text-lg"
                                        />
                                        <button
                                            onClick={() => payWithMoMo(otpCode, otpRef)}
                                            className="w-full bg-orange-50 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition shadow-md cursor-pointer"
                                        >
                                            Verify OTP & Pay
                                        </button>
                                        <button
                                            onClick={() => setPaymentStatus('idle')}
                                            className="w-full text-center text-xs font-semibold text-gray-400 hover:text-gray-655 transition cursor-pointer"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}

                            {paymentStatus === 'failed' && (
                                <div className="py-6 space-y-4">
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
                                <div className="py-6 space-y-4">
                                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto text-yellow-600 text-xl font-black">!</div>
                                    <h3 className="text-lg font-black text-gray-900">Payment Timeout</h3>
                                    <p className="text-gray-500 text-sm">We did not receive confirmation in time. Please check your phone or try again.</p>
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
        </div>
    );
}
