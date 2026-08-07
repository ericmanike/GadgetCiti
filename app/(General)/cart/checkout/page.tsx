'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronRight, CheckCircle2, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency } from '@/lib/utils';
import { useCart } from '@/components/CartContext';
import { useAuth } from '@/components/AuthContext';
import { useRouter } from 'next/navigation';

const STEPS = ['Delivery', 'Review & Pay'];

export default function CheckoutPage() {
    const { cart, clearCart, totalPrice } = useCart();
    const { user } = useAuth();
    const [step, setStep] = useState(0);
    const [placed, setPlaced] = useState(false);
    const [isPaying, setIsPaying] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const router = useRouter();
    const [form, setForm] = useState({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        region: '',
        zip: '',
    });

    const displayItems = cart ? cart.map(item => ({
        id: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80'
    })) : [];

    const subtotal = totalPrice;
    const shipping = 0;
    const total = subtotal + shipping;

    const update = (field: string, val: string) => setForm(f => ({ ...f, [field]: val }));

    const sendOrderConfirmationSMS = async (customerName: string, phone: string, orderTotal: number) => {
        if (!phone) {
            console.warn('[CHECKOUT SMS] Skipped SMS: No recipient phone number provided.');
            return;
        }
        console.log('[CHECKOUT SMS] Sending confirmation SMS to:', phone);
        try {
            const res = await fetch('/api/sms/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    recipient: phone,
                    message: `Hi ${customerName || 'Valued Customer'}, your order of GHS ${orderTotal.toFixed(2)} at Gadget's CITi has been confirmed! Thank you for shopping with us.`,
                    senderid: 'GadgetCiti'
                })
            });
            const data = await res.json();
            console.log('[CHECKOUT SMS RESULT]', data);
        } catch (e) {
            console.error('[CHECKOUT SMS ERROR] Failed to send SMS confirmation:', e);
        }
    };

    // Paystack Inline Transaction Handler
    const handlePaystackPayment = async () => {
        setErrorMessage('');

        if (!form.email) {
            setErrorMessage('Please enter your email address in Step 1 (Delivery Information).');
            setStep(0);
            return;
        }

        if (!form.fullName || !form.phone) {
            setErrorMessage('Please complete your name and phone number before proceeding.');
            setStep(0);
            return;
        }

        setIsPaying(true);

        const paystackPublicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!;
        const reference = `gadgetciti-${Date.now()}`;

        try {
            const PaystackPop = (await import('@paystack/inline-js')).default;
            const paystack = new PaystackPop();
            paystack.newTransaction({ 
                key: paystackPublicKey,
                email: form.email,
                amount: Math.round(total * 100), // Amount in pesewas (GHS * 100)
                currency: 'GHS',
                reference: reference,
                ref: reference,
                firstname: form.fullName.split(' ')[0] || '',
                lastname: form.fullName.split(' ').slice(1).join(' ') || '',
                phone: form.phone,
                metadata: {
                    user_id: user?.id || null,
                    cart_items: cart,
                    custom_fields: [
                    
                        { display_name: 'Customer Name', variable_name: 'customer_name', value: form.fullName },
                        { display_name: 'Phone Number', variable_name: 'phone_number', value: form.phone },
                        { display_name: 'Delivery Address', variable_name: 'delivery_address', value: `${form.address}, ${form.city}, ${form.region}` }
                        
                    ]
                },
                onSuccess: async (transaction: any) => {
                    console.log('[Paystack Payment Success]', transaction);
                    const txRef = transaction.reference || transaction.trxref || reference;
                    try {
                        const verifyRes = await fetch('/api/payments/paystack/verify', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ reference: txRef }),
                        });
                        const verifyData = await verifyRes.json();
                        console.log('[Paystack Verified Result]', verifyData);

                        if (verifyData.success) {
                            setPlaced(true);
                            console.log('cart_items', cart);
                         
                            sendOrderConfirmationSMS(form.fullName, form.phone, total);
                        } else {
                            setErrorMessage(verifyData.error || 'Payment verification failed.');
                        }
                    } catch (err: any) {
                        console.error('[Verify API Error]', err);
                        setPlaced(true);
                        clearCart();
                        sendOrderConfirmationSMS(form.fullName, form.phone, total);
                    } finally {
                        setIsPaying(false);
                    }
                },
                onCancel: () => {
                    console.log('[Paystack Payment Cancelled]');
                    setIsPaying(false);
                },
                onError: (error: any) => {
                    console.error('[Paystack Payment Error]', error);
                    setIsPaying(false);
                    setErrorMessage(error?.message || 'Payment initiation failed. Please check your Paystack API key or try again.');
                }
            } as any);
        } catch (err: any) {
            console.error('[Paystack Popup Error]', err);
            setIsPaying(false);
            setErrorMessage(err.message || 'Could not launch Paystack payment popup.');
        }
    };

    if (placed) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-3">
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
                        Thank you for shopping with <span className="font-bold text-orange-500">Gadget's CITi</span>.<br />
                        Your order is being processed and you'll receive a confirmation shortly.
                    </p>
                    <p className="text-xs font-black tracking-widest text-gray-400 uppercase mb-1">Order Total</p>
                    <p className="text-3xl font-black text-gray-900 mb-8">{formatCurrency(total)}</p>
                    <div className="flex flex-col gap-3">
                       
                        <button onClick={()=>{clearCart();
                            router.push('/customer/orders');
                        }
                        }  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-2xl transition-all">
                          Track My Order
                        </button>
                        <button
                        onClick={()=>{clearCart();
                            router.push('/buy');
                        }
                        }  className="w-full border border-gray-200 text-gray-700 font-bold py-3 rounded-2xl hover:bg-gray-50 transition-all">
                            Continue Shopping
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 mt-5 pb-16 px-4 md:px-8">
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

                {errorMessage && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs font-semibold">
                        ⚠️ {errorMessage}
                    </div>
                )}

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
                                        ].map(({ field, label, placeholder, col }) => (
                                            <div key={field} className={col === 2 ? 'sm:col-span-2' : ''}>
                                                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">{label}</label>
                                                <input
                                                    value={(form as any)[field]}
                                                    onChange={e => update(field, e.target.value)}
                                                    placeholder={placeholder}
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-300/50 outline-none transition text-[16px]"
                                                />
                                            </div>
                                        ))}

                                        {/* Region — Select dropdown */}
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Region</label>
                                            <select
                                                value={form.region}
                                                onChange={e => update('region', e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-700 focus:border-slate-400 focus:ring-2 focus:ring-slate-300/50 outline-none transition text-[16px] cursor-pointer"
                                            >
                                                <option value="" disabled>Select your region</option>
                                                <option value="Greater Accra">Greater Accra</option>
                                                <option value="Ashanti">Ashanti</option>
                                                <option value="Western">Western</option>
                                                <option value="Central">Central</option>
                                                <option value="Eastern">Eastern</option>
                                                <option value="Volta">Volta</option>
                                                <option value="Northern">Northern</option>
                                                <option value="Upper East">Upper East</option>
                                                <option value="Upper West">Upper West</option>
                                                <option value="Brong-Ahafo">Brong-Ahafo</option>
                                                <option value="Bono">Bono</option>
                                                <option value="Bono East">Bono East</option>
                                                <option value="Ahafo">Ahafo</option>
                                                <option value="Savannah">Savannah</option>
                                                <option value="North East">North East</option>
                                                <option value="Oti">Oti</option>
                                                <option value="Western North">Western North</option>
                                            </select>
                                        </div>
                                    </div>
                                    <button onClick={() => setStep(1)} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2 mt-2">
                                        Continue to Review & Pay <ChevronRight size={18} />
                                    </button>
                                </motion.div>
                            )}

                            {/* Step 1 — Review & Pay */}
                            {step === 1 && (
                                <motion.div key="review" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
                                    <h2 className="text-base font-black text-gray-900">Review Your Order</h2>
                                    <div className="space-y-3">
                                        {displayItems.map(item => (
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
                                        <p className="font-bold text-gray-700">📍 {form.address || 'N/A'}, {form.city || 'N/A'}, {form.region}</p>
                                        <p className="text-gray-500">{form.fullName} · {form.phone} · {form.email}</p>
                                    </div>

                                    <div className="flex gap-3 mt-2">
                                        <button onClick={() => setStep(0)} className="flex-1 border border-gray-200 text-gray-700 font-bold py-3.5 rounded-2xl hover:bg-gray-50 transition-all">Back</button>
                                        <button
                                            onClick={handlePaystackPayment}
                                            disabled={isPaying}
                                            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                                        >
                                            <Lock size={16} />
                                            {isPaying ? (
                                                'Opening Paystack...'
                                            ) : (
                                                <span className="flex items-center gap-1.5">
                                                    <span>Pay {formatCurrency(total)}</span>
                                                    <span className="text-orange-100 font-normal text-xs opacity-90">with Paystack</span>
                                                </span>
                                            )}
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Right: Order Summary */}
                    <div className="space-y-4">
                        <div className="bg-white rounded-2xl shadow-sm p-5">
                            <h3 className="text-[16px] font-black text-gray-900 uppercase tracking-widest mb-4">Order Summary</h3>
                            <div className="space-y-3 mb-4">
                                {displayItems.map(item => (
                                    <div key={item.id} className="flex justify-between text-[16px]">
                                        <span className="text-gray-600 truncate mr-2">{item.name} <span className="text-gray-400">×{item.quantity}</span></span>
                                        <span className="font-bold text-gray-900 shrink-0">{formatCurrency(item.price * item.quantity)}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t border-gray-100 pt-3 space-y-2 text-[16px]">
                                <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
                                <div className="flex justify-between text-gray-500"><span>Shipping</span><span>{formatCurrency(shipping)}</span></div>
                                <div className="flex justify-between font-black text-gray-900 text-[18px] pt-1 border-t border-gray-100"><span>Total</span><span>{formatCurrency(total)}</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
