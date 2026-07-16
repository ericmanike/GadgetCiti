'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import { formatCurrency } from '@/lib/utils';
import { fetchAllProducts, Product } from '@/lib/products';
import {
    fetchUserPlans,
    createSmallSmallPlan,
    addInstallmentPayment,
    updatePlanDeliveryStatus,
    PaySmallSmallPlan,
    PaymentRecord
} from '@/lib/paySmallSmall';
import {
    Wallet,
    Smartphone,
    Laptop,
    Plus,
    ArrowLeft,
    Calendar,
    CheckCircle2,
    TrendingUp,
    Loader2,
    ArrowRight,
    Search,
    CreditCard,
    ChevronRight,
    AlertCircle,
    PartyPopper,
    Truck,
    PackageCheck,
    PackageOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function PaySmallSmallPage() {
    const { user, loading: authLoading } = useAuth();
    const [loading, setLoading] = useState(true);
    const [plans, setPlans] = useState<PaySmallSmallPlan[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<'all' | 'phones' | 'laptops'>('all');

    // UI Navigation State
    const [currentView, setCurrentView] = useState<'overview' | 'create' | 'detail'>('overview');
    const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

    // Create Plan Wizard State
    const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [downPaymentPercent, setDownPaymentPercent] = useState<number>(20); // default 20%
    const [frequency, setFrequency] = useState<'weekly' | 'bi-weekly' | 'monthly'>('monthly');
    const [installmentsCount, setInstallmentsCount] = useState<number>(6); // default 6 installments
    const [momoNumber, setMomoNumber] = useState('');
    const [momoProvider, setMomoProvider] = useState<'13' | '6' | '7'>('13'); // 13=MTN, 6=Telecel, 7=AT
    const [paymentStatus, setPaymentStatus] = useState<'idle' | 'initiating' | 'pending_otp' | 'success' | 'failed'>('idle');
    const [otpCode, setOtpCode] = useState('');
    const [simulatedRef, setSimulatedRef] = useState('');

    // Quick Payment Modal State
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState<number>(0);
    const [paymentPlan, setPaymentPlan] = useState<PaySmallSmallPlan | null>(null);

    // Initial data fetch
    useEffect(() => {
        if (authLoading) return;

        async function loadInitialData() {
            try {
                if (user) {
                    const userPlans = await fetchUserPlans(user.id);
                    setPlans(userPlans);
                }
                const allProducts = await fetchAllProducts();
                setProducts(allProducts);
            } catch (err) {
                console.error("Error fetching data:", err);
                toast.error("Failed to load dashboard data");
            } finally {
                setLoading(false);
            }
        }

        loadInitialData();
    }, [user, authLoading]);

    // Handle plan details selection
    const handleViewPlanDetails = (planId: string) => {
        setSelectedPlanId(planId);
        setCurrentView('detail');
    };

    const activePlan = plans.find(p => p.id === selectedPlanId);

    // Compute stats
    const totalActivePlans = plans.filter(p => p.status === 'active').length;
    const totalPaid = plans.reduce((sum, p) => sum + p.paid_amount, 0);
    const totalRemaining = plans.reduce((sum, p) => sum + p.balance_amount, 0);

    // Filter products for wizard (focusing on phones and laptops as requested)
    const filteredProducts = products.filter(p => {
        const cat = p.category.toLowerCase();
        const matchesCategory = selectedCategory === 'all' 
            ? (cat.includes('phone') || cat.includes('laptop') || cat.includes('tablet'))
            : cat.includes(selectedCategory === 'phones' ? 'phone' : 'laptop');
        
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             p.brand.toLowerCase().includes(searchQuery.toLowerCase());
        
        return matchesCategory && matchesSearch;
    });

    // Wizard calculations
    const calcProductPrice = selectedProduct?.price || 0;
    const calcDownPayment = Number(((calcProductPrice * downPaymentPercent) / 100).toFixed(2));
    const calcRemaining = calcProductPrice - calcDownPayment;
    const calcInstallmentAmount = Number((calcRemaining / installmentsCount).toFixed(2));

    // Handle Wizard Init
    const startWizard = () => {
        setSelectedProduct(null);
        setWizardStep(1);
        setDownPaymentPercent(20);
        setFrequency('monthly');
        setInstallmentsCount(6);
        setMomoNumber('');
        setPaymentStatus('idle');
        setCurrentView('create');
    };

    // Simulated Moolre Payment flow for Down Payment
    const handleInitiateDownPayment = async () => {
        if (!momoNumber || momoNumber.length < 9) {
            toast.error("Please enter a valid Mobile Money number");
            return;
        }
        if (!selectedProduct || !user) return;

        setPaymentStatus('initiating');
        
        // Simulate API call to Moolre Payment Gateway
        setTimeout(() => {
            const mockRef = `PSS-REF-${Math.floor(Math.random() * 9000000 + 1000000)}`;
            setSimulatedRef(mockRef);
            setPaymentStatus('pending_otp');
            toast.info("OTP sent to your phone. Check your messages!");
        }, 1800);
    };

    const handleConfirmOtp = async () => {
        if (!otpCode || otpCode.length < 4) {
            toast.error("Please enter the 4-digit OTP code");
            return;
        }
        if (!selectedProduct || !user) return;

        setPaymentStatus('initiating');

        // Simulate OTP verification and payment confirmation
        setTimeout(async () => {
            try {
                const newPlan = await createSmallSmallPlan(user.id, {
                    product_id: selectedProduct.id,
                    product_name: selectedProduct.name,
                    product_brand: selectedProduct.brand,
                    product_image: selectedProduct.images[0] || "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=200&q=80",
                    total_amount: selectedProduct.price,
                    down_payment: calcDownPayment,
                    frequency: frequency,
                    installments_count: installmentsCount,
                    payment_reference: simulatedRef
                });

                setPlans(prev => [newPlan, ...prev]);
                setPaymentStatus('success');
                toast.success("Down payment successful! Plan created.");
                
                setTimeout(() => {
                    setSelectedPlanId(newPlan.id);
                    setCurrentView('detail');
                }, 1500);
            } catch (err) {
                console.error(err);
                setPaymentStatus('failed');
                toast.error("Could not create plan. Please try again.");
            }
        }, 2000);
    };

    // Quick Installment Payment Flow
    const handleOpenPaymentModal = (plan: PaySmallSmallPlan) => {
        setPaymentPlan(plan);
        setPaymentAmount(plan.installment_amount < plan.balance_amount ? plan.installment_amount : plan.balance_amount);
        setMomoNumber('');
        setPaymentStatus('idle');
        setIsPaymentModalOpen(true);
    };

    const handlePayInstallment = async () => {
        if (!momoNumber || momoNumber.length < 9) {
            toast.error("Please enter a valid Mobile Money number");
            return;
        }
        if (!paymentPlan || !user) return;

        setPaymentStatus('initiating');

        setTimeout(() => {
            const mockRef = `PSS-INST-${Math.floor(Math.random() * 9000000 + 1000000)}`;
            setSimulatedRef(mockRef);
            setPaymentStatus('pending_otp');
        }, 1500);
    };

    const handleConfirmInstallmentOtp = async () => {
        if (!otpCode || otpCode.length < 4) {
            toast.error("Please enter the 4-digit OTP code");
            return;
        }
        if (!paymentPlan || !user) return;

        setPaymentStatus('initiating');

        setTimeout(async () => {
            try {
                const updatedPlan = await addInstallmentPayment(
                    user.id,
                    paymentPlan.id,
                    paymentAmount,
                    simulatedRef
                );

                // Update state list
                setPlans(prev => prev.map(p => p.id === updatedPlan.id ? updatedPlan : p));
                
                // If viewing details, update selection
                if (selectedPlanId === updatedPlan.id) {
                    setSelectedPlanId(updatedPlan.id);
                }

                setPaymentStatus('success');
                toast.success("Installment payment received!");

                setTimeout(() => {
                    setIsPaymentModalOpen(false);
                    setPaymentStatus('idle');
                    setOtpCode('');
                }, 1500);
            } catch (err) {
                console.error(err);
                setPaymentStatus('failed');
                toast.error("Payment failed. Please try again.");
            }
        }, 1800);
    };

    // Update delivery progression simulated
    const handleAdvanceDelivery = async (plan: PaySmallSmallPlan, targetStatus: 'completed' | 'delivered') => {
        if (!user) return;
        try {
            const updated = await updatePlanDeliveryStatus(user.id, plan.id, targetStatus);
            setPlans(prev => prev.map(p => p.id === updated.id ? updated : p));
            toast.success(targetStatus === 'delivered' ? "Delivery completed!" : "Status updated!");
        } catch (err) {
            console.error(err);
            toast.error("Failed to update status");
        }
    };

    if (authLoading || loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-slate-700 bg-gray-50 rounded-lg  p-8 shadow-xs">
                <div className="loader w-10 h-10 mb-4" />
                <p className="font-semibold text-sm">Loading Dashboard...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center min-h-[50vh] flex flex-col items-center justify-center">
                <AlertCircle className="w-16 h-16 text-orange-500 mb-4" />
                <h2 className="text-xl font-bold text-slate-900 mb-2">Authentication Required</h2>
                <p className="text-sm text-slate-600 mb-6 max-w-sm">
                    You need to be logged into your customer account to view or start installment payment plans.
                </p>
                <a href="/auth/login" className="bg-orange-500 text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-orange-600 transition-colors uppercase tracking-wider shadow-sm">
                    Login / Signup
                </a>
            </div>
        );
    }

    return (
        <div className="space-y-6 font-sans">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white rounded-xl p-5 border border-gray-200 shadow-xs">
                <div>
                    <h1 className="text-2xl font-bold text-slate-950 flex items-center gap-2">
                        <Wallet className="text-orange-500" />
                        Pay Small Small
                    </h1>
                    <p className="text-xs md:text-sm text-slate-600 mt-1">
                        Own your laptops, phones, and accessories now. Buy today, pay in easy installments, and get it delivered!
                    </p>
                </div>
                {currentView === 'overview' && (
                    <button
                        onClick={startWizard}
                        className="rounded-full flex items-center justify-center gap-1.5 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white  text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer w-full md:w-auto uppercase tracking-wide"
                    >
                        <Plus size={16} />
                        New Installment Plan
                    </button>
                )}
            </div>

            {/* View Switching Router */}
            <AnimatePresence mode="wait">
                {currentView === 'overview' && (
                    <motion.div
                        key="overview"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        className="space-y-6"
                    >
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-white rounded-xl p-4 border border-gray-150 shadow-xs flex items-center gap-4">
                                <div className="p-3 rounded-lg bg-orange-50 text-orange-500">
                                    <Smartphone className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-slate-600 uppercase">Active Plans</p>
                                    <p className="text-xl font-extrabold text-slate-900 mt-0.5">{totalActivePlans}</p>
                                </div>
                            </div>
                            <div className="bg-white rounded-xl p-4 border border-gray-150 shadow-xs flex items-center gap-4">
                                <div className="p-3 rounded-lg bg-emerald-50 text-emerald-500">
                                    <TrendingUp className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-slate-600 uppercase">Total Paid</p>
                                    <p className="text-xl font-extrabold text-slate-900 mt-0.5">{formatCurrency(totalPaid)}</p>
                                </div>
                            </div>
                            <div className="bg-white rounded-xl p-4 border border-gray-150 shadow-xs flex items-center gap-4">
                                <div className="p-3 rounded-lg bg-red-50 text-red-500">
                                    <Wallet className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-slate-600 uppercase">Total Remaining</p>
                                    <p className="text-xl font-extrabold text-slate-900 mt-0.5">{formatCurrency(totalRemaining)}</p>
                                </div>
                            </div>
                        </div>

                        {/* List of Plans */}
                        {plans.length === 0 ? (
                            <div className="bg-white rounded-xl border border-gray-150 p-8 text-center flex flex-col items-center justify-center max-w-2xl mx-auto py-12">
                                <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center text-orange-500 mb-5 animate-pulse">
                                    <Wallet size={36} />
                                </div>
                                <h3 className="text-lg font-bold text-slate-950 mb-2">No Installment Plans Yet</h3>
                                <p className="text-sm text-slate-600 mb-6 max-w-sm">
                                    Don&apos;t wait to save the full amount! Purchase any phone or laptop using Pay Small Small, start with a 10-20% down payment, and spread the balance.
                                </p>
                                <button
                                    onClick={startWizard}
                                    className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-bold transition-all shadow-md uppercase tracking-wider active:scale-95 cursor-pointer"
                                >
                                    Get Started
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <h2 className="text-base font-bold text-slate-950 px-1">Your Installment Purchases</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {plans.map((plan) => {
                                        const progressPercent = Math.min(100, Math.round((plan.paid_amount / plan.total_amount) * 100));
                                        
                                        return (
                                            <div key={plan.id} className="bg-white rounded-xl border border-gray-200 shadow-xs hover:shadow-md transition-shadow flex flex-col overflow-hidden">
                                                {/* Header Status */}
                                                <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                                                    <span className="text-[10px] text-gray-500 font-bold uppercase">Plan ID: #{plan.id.slice(0, 8)}</span>
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                        plan.status === 'delivered'
                                                            ? 'bg-emerald-100 text-emerald-800'
                                                            : plan.status === 'completed'
                                                            ? 'bg-blue-100 text-blue-800 animate-pulse'
                                                            : 'bg-orange-100 text-orange-800'
                                                    }`}>
                                                        {plan.status === 'delivered' ? 'Delivered' : plan.status === 'completed' ? 'Fully Paid / Shipping' : 'Active'}
                                                    </span>
                                                </div>

                                                <div className="p-4 flex gap-4 flex-1">
                                                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0 flex items-center justify-center p-1">
                                                        <img src={plan.product_image} alt={plan.product_name} className="object-contain w-full h-full" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-sm font-bold text-slate-950 truncate">{plan.product_name}</h4>
                                                        <p className="text-xs text-gray-500 font-medium">{plan.product_brand}</p>
                                                        <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                                                            <div>
                                                                <span className="text-gray-500 block">Total:</span>
                                                                <span className="font-bold text-slate-950">{formatCurrency(plan.total_amount)}</span>
                                                            </div>
                                                            <div>
                                                                <span className="text-gray-500 block">Remaining:</span>
                                                                <span className="font-bold text-red-600">{formatCurrency(plan.balance_amount)}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Progress Slider */}
                                                <div className="px-4 pb-3">
                                                    <div className="flex justify-between items-center text-xs mb-1">
                                                        <span className="text-gray-500">Progress</span>
                                                        <span className="font-bold text-slate-900">{progressPercent}%</span>
                                                    </div>
                                                    <div className="w-full bg-gray-150 h-2 rounded-full overflow-hidden">
                                                        <div 
                                                            className="h-full bg-gradient-to-r from-orange-400 to-orange-500 transition-all duration-550"
                                                            style={{ width: `${progressPercent}%` }}
                                                        />
                                                    </div>
                                                    <div className="flex justify-between text-[10px] text-gray-400 font-bold mt-1">
                                                        <span>PAID: {formatCurrency(plan.paid_amount)}</span>
                                                        <span>GOAL: {formatCurrency(plan.total_amount)}</span>
                                                    </div>
                                                </div>

                                                {/* Footer Action buttons */}
                                                <div className="p-3 bg-gray-50 border-t border-gray-100 flex gap-2">
                                                    <button
                                                        onClick={() => handleViewPlanDetails(plan.id)}
                                                        className="flex-1 py-2 border border-gray-300 hover:border-orange-400 text-slate-700 hover:text-orange-500 rounded-lg text-xs font-bold transition-all text-center bg-white cursor-pointer"
                                                    >
                                                        Details & History
                                                    </button>
                                                    {plan.status === 'active' && (
                                                        <button
                                                            onClick={() => handleOpenPaymentModal(plan)}
                                                            className="flex-1 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 shadow-xs active:scale-95"
                                                        >
                                                            <CreditCard size={14} />
                                                            Pay Installment
                                                        </button>
                                                    )}
                                                    {plan.status === 'completed' && (
                                                        <button
                                                            onClick={() => handleAdvanceDelivery(plan, 'delivered')}
                                                            className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 shadow-xs active:scale-95 animate-bounce"
                                                        >
                                                            <PackageCheck size={14} />
                                                            Confirm Receipt
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}

                {currentView === 'create' && (
                    <motion.div
                        key="create"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
                    >
                        {/* Back navigation */}
                        <button
                            onClick={() => setCurrentView('overview')}
                            className="flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-orange-500 transition-colors uppercase tracking-wider mb-6 cursor-pointer"
                        >
                            <ArrowLeft size={16} />
                            Back to Dashboard
                        </button>

                        {/* Step Indicators */}
                        <div className="flex items-center justify-center gap-4 max-w-md mx-auto mb-8">
                            {[1, 2, 3].map((step) => (
                                <React.Fragment key={step}>
                                    <div className="flex items-center gap-2">
                                        <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 ${
                                            wizardStep === step
                                                ? 'bg-orange-500 text-white border-orange-500'
                                                : wizardStep > step
                                                ? 'bg-orange-50 text-orange-500 border-orange-500'
                                                : 'text-gray-400 border-gray-200'
                                        }`}>
                                            {step}
                                        </span>
                                        <span className={`text-xs font-bold hidden sm:inline ${
                                            wizardStep === step ? 'text-slate-800' : 'text-gray-400'
                                        }`}>
                                            {step === 1 ? 'Choose Device' : step === 2 ? 'Configure Plan' : 'Pay Deposit'}
                                        </span>
                                    </div>
                                    {step < 3 && <ChevronRight size={16} className="text-gray-300" />}
                                </React.Fragment>
                            ))}
                        </div>

                        {/* STEP 1: CHOOSE DEVICE */}
                        {wizardStep === 1 && (
                            <div className="space-y-6">
                                <div className="max-w-xl mx-auto flex flex-col sm:flex-row gap-3">
                                    {/* Search */}
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search phones, laptops..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-200 focus:border-orange-400 text-slate-800 px-4 py-2.5 pl-10 rounded-lg text-sm transition-all focus:outline-hidden"
                                        />
                                    </div>
                                    {/* Filter category */}
                                    <div className="flex gap-1.5 border border-gray-200 p-1 bg-gray-50 rounded-lg self-center">
                                        {['all', 'phones', 'laptops'].map((cat) => (
                                            <button
                                                key={cat}
                                                type="button"
                                                onClick={() => setSelectedCategory(cat as any)}
                                                className={`px-3 py-1.5 rounded-md text-xs font-bold capitalize transition-all cursor-pointer ${
                                                    selectedCategory === cat
                                                        ? 'bg-white text-orange-500 shadow-xs'
                                                        : 'text-slate-500 hover:text-slate-900'
                                                }`}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Product selection grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-[450px] overflow-y-auto pr-1">
                                    {filteredProducts.length === 0 ? (
                                        <div className="col-span-full py-12 text-center text-gray-400 text-sm font-semibold">
                                            No eligible phones or laptops found. Try a different search.
                                        </div>
                                    ) : (
                                        filteredProducts.map((prod) => (
                                            <div 
                                                key={prod.id} 
                                                onClick={() => {
                                                    setSelectedProduct(prod);
                                                    setWizardStep(2);
                                                }}
                                                className={`border rounded-xl p-4 cursor-pointer hover:border-orange-500 transition-all flex items-center gap-3 ${
                                                    selectedProduct?.id === prod.id ? 'border-orange-500 bg-orange-50/20' : 'border-gray-200 bg-white'
                                                }`}
                                            >
                                                <div className="w-14 h-14 bg-gray-50 rounded-lg overflow-hidden border border-gray-150 flex items-center justify-center p-1 flex-shrink-0">
                                                    <img src={prod.images[0]} alt={prod.name} className="object-contain w-full h-full" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold uppercase">{prod.category}</span>
                                                    <h4 className="text-xs sm:text-sm font-bold text-slate-950 truncate mt-1">{prod.name}</h4>
                                                    <p className="text-xs font-bold text-slate-800 mt-0.5">{formatCurrency(prod.price)}</p>
                                                </div>
                                                <ChevronRight size={18} className="text-gray-400" />
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {/* STEP 2: CONFIGURE INSTALLMENT PLAN */}
                        {wizardStep === 2 && selectedProduct && (
                            <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-8 max-w-4xl mx-auto">
                                {/* Configuration Options */}
                                <div className="space-y-6">
                                    <h3 className="text-base font-extrabold text-slate-900 border-b border-gray-100 pb-2">Plan Setup</h3>

                                    {/* Down Payment Percent Selector */}
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Down Payment</label>
                                            <span className="text-sm font-extrabold text-orange-500">{downPaymentPercent}% ({formatCurrency(calcDownPayment)})</span>
                                        </div>
                                        <div className="flex gap-2">
                                            {[10, 20, 30, 40, 50].map((pct) => (
                                                <button
                                                    key={pct}
                                                    type="button"
                                                    onClick={() => setDownPaymentPercent(pct)}
                                                    className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                                                        downPaymentPercent === pct
                                                            ? 'border-orange-500 bg-orange-50 text-orange-500'
                                                            : 'border-gray-200 hover:border-gray-400 bg-white text-slate-700'
                                                    }`}
                                                >
                                                    {pct}%
                                                </button>
                                            ))}
                                        </div>
                                        <p className="text-[10px] text-gray-500 font-medium">A higher down payment reduces your recurring installments.</p>
                                    </div>

                                    {/* Installments Frequency */}
                                    <div className="space-y-3">
                                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block">Payment Frequency</label>
                                        <div className="flex gap-2">
                                            {[
                                                { label: 'Weekly', value: 'weekly' },
                                                { label: 'Bi-Weekly', value: 'bi-weekly' },
                                                { label: 'Monthly', value: 'monthly' },
                                            ].map((freqItem) => (
                                                <button
                                                    key={freqItem.value}
                                                    type="button"
                                                    onClick={() => setFrequency(freqItem.value as any)}
                                                    className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                                                        frequency === freqItem.value
                                                            ? 'border-orange-500 bg-orange-50 text-orange-500'
                                                            : 'border-gray-200 hover:border-gray-400 bg-white text-slate-700'
                                                    }`}
                                                >
                                                    {freqItem.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Installments Duration / Count */}
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Installment Count</label>
                                            <span className="text-sm font-extrabold text-slate-900">{installmentsCount} {frequency.replace('ly', 's')}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            {[3, 6, 9, 12].map((cnt) => (
                                                <button
                                                    key={cnt}
                                                    type="button"
                                                    onClick={() => setInstallmentsCount(cnt)}
                                                    className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                                                        installmentsCount === cnt
                                                            ? 'border-orange-500 bg-orange-50 text-orange-500'
                                                            : 'border-gray-200 hover:border-gray-400 bg-white text-slate-700'
                                                    }`}
                                                >
                                                    {cnt} Payments
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Plan Summary & Confirmation Preview */}
                                <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 flex flex-col justify-between">
                                    <div>
                                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Plan Breakdown</h4>
                                        
                                        <div className="flex items-center gap-3 mb-4 bg-white border border-gray-150 p-3 rounded-lg">
                                            <div className="w-10 h-10 bg-gray-50 border border-gray-100 rounded-md overflow-hidden p-1 flex-shrink-0 flex items-center justify-center">
                                                <img src={selectedProduct.images[0]} alt={selectedProduct.name} className="object-contain w-full h-full" />
                                            </div>
                                            <div className="min-w-0">
                                                <h5 className="text-xs font-bold text-slate-950 truncate">{selectedProduct.name}</h5>
                                                <p className="text-[10px] text-gray-500">{selectedProduct.brand}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-3.5 text-xs text-slate-700 border-t border-gray-200 pt-4">
                                            <div className="flex justify-between">
                                                <span>Product Price</span>
                                                <span className="font-bold text-slate-900">{formatCurrency(calcProductPrice)}</span>
                                            </div>
                                            <div className="flex justify-between text-emerald-600 font-medium">
                                                <span>Down Payment (Due Today)</span>
                                                <span className="font-bold">{formatCurrency(calcDownPayment)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Remaining Balance</span>
                                                <span className="font-bold text-slate-900">{formatCurrency(calcRemaining)}</span>
                                            </div>
                                            <div className="flex justify-between border-t border-gray-200 pt-3 text-sm font-extrabold text-slate-950">
                                                <span>Installment Amount</span>
                                                <span className="text-orange-500">{formatCurrency(calcInstallmentAmount)} / {frequency.replace('ly', '')}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 mt-6">
                                        <button
                                            type="button"
                                            onClick={() => setWizardStep(1)}
                                            className="flex-1 py-2.5 border border-gray-300 hover:border-gray-400 text-slate-700 rounded-lg text-xs font-bold transition-all bg-white cursor-pointer uppercase tracking-wider"
                                        >
                                            Change Device
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setWizardStep(3)}
                                            className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-bold transition-all cursor-pointer uppercase tracking-wider active:scale-95 shadow-xs flex items-center justify-center gap-1"
                                        >
                                            Next: Pay Deposit
                                            <ArrowRight size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: DEPOSIT MOBILE MONEY PAYMENT */}
                        {wizardStep === 3 && selectedProduct && (
                            <div className="max-w-md mx-auto bg-gray-50 border border-gray-200 rounded-2xl p-6">
                                {paymentStatus === 'idle' && (
                                    <div className="space-y-5">
                                        <div className="text-center">
                                            <h3 className="text-base font-extrabold text-slate-900">Mobile Money Checkout</h3>
                                            <p className="text-xs text-gray-500 mt-1">Initiating layaway deposit of <span className="font-extrabold text-slate-900">{formatCurrency(calcDownPayment)}</span></p>
                                        </div>

                                        {/* Mobile Money Provider selection */}
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Network Provider</label>
                                            <div className="grid grid-cols-3 gap-2">
                                                {[
                                                    { id: '13', name: 'MTN MoMo', color: 'bg-yellow-400 border-yellow-400 text-yellow-950' },
                                                    { id: '6', name: 'Telecel', color: 'bg-red-500 border-red-500 text-white' },
                                                    { id: '7', name: 'AT Money', color: 'bg-blue-600 border-blue-600 text-white' },
                                                ].map((provider) => (
                                                    <button
                                                        key={provider.id}
                                                        type="button"
                                                        onClick={() => setMomoProvider(provider.id as any)}
                                                        className={`py-2 text-[10px] font-bold rounded-lg border-2 transition-all cursor-pointer flex items-center justify-center text-center ${
                                                            momoProvider === provider.id
                                                                ? `${provider.color} font-black shadow-xs scale-102`
                                                                : 'bg-white border-gray-200 text-slate-600 hover:border-gray-300'
                                                        }`}
                                                    >
                                                        {provider.name}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Mobile Number Input */}
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Mobile Number</label>
                                            <div className="relative">
                                                <span className="absolute left-3.5 top-3.5 text-xs text-gray-500 font-bold">+233</span>
                                                <input
                                                    type="tel"
                                                    placeholder="24 123 4567"
                                                    value={momoNumber}
                                                    onChange={(e) => setMomoNumber(e.target.value.replace(/\D/g, ''))}
                                                    className="w-full bg-white border border-gray-200 focus:border-orange-400 text-slate-900 px-4 py-3 pl-14 rounded-lg text-sm transition-all focus:outline-hidden"
                                                    maxLength={10}
                                                />
                                            </div>
                                            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Secured payment process powered by Moolre</p>
                                        </div>

                                        <div className="flex gap-3 pt-2">
                                            <button
                                                type="button"
                                                onClick={() => setWizardStep(2)}
                                                className="flex-1 py-3 border border-gray-300 hover:border-gray-400 text-slate-700 rounded-lg text-xs font-bold transition-all bg-white cursor-pointer uppercase tracking-wider"
                                            >
                                                Back
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleInitiateDownPayment}
                                                className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-bold transition-all cursor-pointer uppercase tracking-wider active:scale-95 shadow-xs"
                                            >
                                                Send MoMo Prompt
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Loading Screen / Pin Authorization simulation */}
                                {paymentStatus === 'initiating' && (
                                    <div className="text-center py-8 space-y-4">
                                        <div className="loader w-12 h-12 mx-auto" />
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-900 uppercase">Processing Down Payment</h4>
                                            <p className="text-xs text-gray-500 mt-1.5 leading-relaxed max-w-xs mx-auto">
                                                Communicating with payment gateway API. Please stand by, do not close or reload this window.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* OTP Verification Input */}
                                {paymentStatus === 'pending_otp' && (
                                    <div className="space-y-4">
                                        <div className="text-center">
                                            <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center mx-auto mb-3">
                                                <Calendar className="w-6 h-6 animate-bounce" />
                                            </div>
                                            <h3 className="text-sm font-bold text-slate-900 uppercase">Verify Payment</h3>
                                            <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                                                We have sent an SMS with a 4-digit verification OTP code to your mobile device. Enter it below to complete authorization.
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-700 uppercase tracking-widest text-center block">OTP Code</label>
                                            <input
                                                type="text"
                                                maxLength={4}
                                                placeholder="1234"
                                                value={otpCode}
                                                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                                                className="w-32 bg-white text-center border-2 border-gray-200 focus:border-orange-500 text-lg font-bold tracking-[0.4em] mx-auto py-2.5 rounded-lg transition-all focus:outline-hidden block"
                                            />
                                        </div>

                                        <button
                                            type="button"
                                            onClick={handleConfirmOtp}
                                            className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-bold transition-all cursor-pointer uppercase tracking-wider"
                                        >
                                            Confirm Payment
                                        </button>
                                    </div>
                                )}

                                {/* Success Confirmation Screen */}
                                {paymentStatus === 'success' && (
                                    <div className="text-center py-6 space-y-4">
                                        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto shadow-xs border border-emerald-100">
                                            <PartyPopper className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-bold text-slate-950 uppercase">Success! Plan Setup</h3>
                                            <p className="text-xs text-gray-500 mt-1">Your down payment of {formatCurrency(calcDownPayment)} has been successfully verified.</p>
                                        </div>
                                        <p className="text-[10px] text-gray-400 font-bold">Plan #ID: {simulatedRef}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                )}

                {currentView === 'detail' && activePlan && (
                    <motion.div
                        key="detail"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className="space-y-6"
                    >
                        {/* Back navigation */}
                        <div className="flex justify-between items-center">
                            <button
                                onClick={() => setCurrentView('overview')}
                                className="flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-orange-500 transition-colors uppercase tracking-wider cursor-pointer"
                            >
                                <ArrowLeft size={16} />
                                Back to list
                            </button>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                activePlan.status === 'delivered'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : activePlan.status === 'completed'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-orange-100 text-orange-800'
                            }`}>
                                {activePlan.status === 'delivered' ? 'Delivered' : activePlan.status === 'completed' ? 'Fully Paid / Shipping' : 'Active Plan'}
                            </span>
                        </div>

                        {/* Top Card Breakdown */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-8">
                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <div className="w-20 h-20 bg-gray-50 border border-gray-150 rounded-lg overflow-hidden flex items-center justify-center p-1.5 flex-shrink-0">
                                        <img src={activePlan.product_image} alt={activePlan.product_name} className="object-contain w-full h-full" />
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Selected Item</span>
                                        <h3 className="text-lg font-bold text-slate-950 mt-0.5 leading-tight">{activePlan.product_name}</h3>
                                        <p className="text-xs text-gray-500 font-medium">{activePlan.product_brand}</p>
                                        <p className="text-xs font-bold text-slate-800 mt-1">Total Value: {formatCurrency(activePlan.total_amount)}</p>
                                    </div>
                                </div>

                                {/* Custom Confetti element when complete */}
                                {activePlan.status !== 'active' && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3.5"
                                    >
                                        <div className="p-2 bg-emerald-500 text-white rounded-lg flex-shrink-0">
                                            <PartyPopper className="w-5 h-5 animate-pulse" />
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">Congratulations! Plan Complete</h4>
                                            <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                                                You have fully completed the payment for this product. The order is now being dispatched to your delivery address!
                                            </p>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Progress bar detail */}
                                <div>
                                    <div className="flex justify-between items-center text-xs mb-1.5 font-bold">
                                        <span className="text-slate-500">Plan Progress</span>
                                        <span className="text-slate-900">{Math.round((activePlan.paid_amount / activePlan.total_amount) * 100)}% Completed</span>
                                    </div>
                                    <div className="w-full bg-gray-150 h-3 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-gradient-to-r from-orange-400 to-orange-500 transition-all duration-550"
                                            style={{ width: `${Math.round((activePlan.paid_amount / activePlan.total_amount) * 100)}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-xs mt-2 text-slate-600 font-semibold">
                                        <span>Paid: {formatCurrency(activePlan.paid_amount)}</span>
                                        <span className="text-red-500 font-bold">Remaining Balance: {formatCurrency(activePlan.balance_amount)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Plan Term Details & Pay Installment Quick Box */}
                            <div className="bg-gray-50 border border-gray-150 rounded-xl p-5 flex flex-col justify-between">
                                <div className="space-y-4">
                                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-gray-200 pb-2">Plan Setup Details</h4>
                                    <div className="grid grid-cols-2 gap-4 text-xs">
                                        <div>
                                            <span className="text-gray-400 block uppercase font-bold text-[9px] tracking-wide">Frequency</span>
                                            <span className="font-bold text-slate-800 capitalize">{activePlan.frequency}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-400 block uppercase font-bold text-[9px] tracking-wide">Term Length</span>
                                            <span className="font-bold text-slate-800">{activePlan.installments_count} Payments</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-400 block uppercase font-bold text-[9px] tracking-wide">Scheduled Installment</span>
                                            <span className="font-bold text-slate-800">{formatCurrency(activePlan.installment_amount)}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-400 block uppercase font-bold text-[9px] tracking-wide">Started On</span>
                                            <span className="font-bold text-slate-800">{new Date(activePlan.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>

                                {activePlan.status === 'active' && (
                                    <button
                                        onClick={() => handleOpenPaymentModal(activePlan)}
                                        className="w-full mt-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-bold transition-all cursor-pointer uppercase tracking-wider shadow-xs active:scale-95 flex items-center justify-center gap-1.5"
                                    >
                                        <CreditCard size={15} />
                                        Make Next Payment
                                    </button>
                                )}

                                {activePlan.status === 'completed' && (
                                    <button
                                        onClick={() => handleAdvanceDelivery(activePlan, 'delivered')}
                                        className="w-full mt-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer uppercase tracking-wider shadow-xs active:scale-95 flex items-center justify-center gap-1.5 animate-bounce"
                                    >
                                        <PackageCheck size={15} />
                                        Confirm Product Delivery
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Payment Complete -> Product Delivery Timeline */}
                        {activePlan.status !== 'active' && (
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-gray-100 pb-3 flex items-center gap-2">
                                    <Truck className="text-orange-500" />
                                    Product Delivery Timeline
                                </h3>

                                <div className="max-w-2xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 relative">
                                    {/* Connection Line */}
                                    <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-gray-200 -translate-y-1/2 hidden md:block z-0" />

                                    {/* Step 1 */}
                                    <div className="flex md:flex-col items-center gap-3 relative z-10 bg-white px-2">
                                        <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm">
                                            <CheckCircle2 className="w-5 h-5" />
                                        </div>
                                        <div className="md:text-center">
                                            <p className="text-xs font-bold text-slate-950">Payment Cleared</p>
                                            <p className="text-[10px] text-gray-500 font-medium">{new Date(activePlan.payments[activePlan.payments.length - 1].date).toLocaleDateString()}</p>
                                        </div>
                                    </div>

                                    {/* Step 2 */}
                                    <div className="flex md:flex-col items-center gap-3 relative z-10 bg-white px-2">
                                        <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm">
                                            <PackageOpen className="w-5 h-5" />
                                        </div>
                                        <div className="md:text-center">
                                            <p className="text-xs font-bold text-slate-950">Processing Order</p>
                                            <p className="text-[10px] text-gray-500 font-medium">Ready for Dispatch</p>
                                        </div>
                                    </div>

                                    {/* Step 3 */}
                                    <div className="flex md:flex-col items-center gap-3 relative z-10 bg-white px-2">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm border ${
                                            activePlan.status === 'delivered'
                                                ? 'bg-emerald-500 text-white border-emerald-500'
                                                : 'bg-orange-100 text-orange-500 border-orange-200 animate-pulse'
                                        }`}>
                                            <Truck className="w-5 h-5" />
                                        </div>
                                        <div className="md:text-center">
                                            <p className="text-xs font-bold text-slate-950">In Transit</p>
                                            <p className="text-[10px] text-gray-500 font-medium">With Courier Agent</p>
                                        </div>
                                    </div>

                                    {/* Step 4 */}
                                    <div className="flex md:flex-col items-center gap-3 relative z-10 bg-white px-2">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm border ${
                                            activePlan.status === 'delivered'
                                                ? 'bg-emerald-500 text-white border-emerald-500'
                                                : 'bg-gray-100 text-gray-400 border-gray-200'
                                        }`}>
                                            <PackageCheck className="w-5 h-5" />
                                        </div>
                                        <div className="md:text-center">
                                            <p className="text-xs font-bold text-slate-950">Delivered</p>
                                            <p className="text-[10px] text-gray-500 font-medium">Handover Complete</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Payment History Log */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-gray-100 pb-3 flex items-center gap-2">
                                <Calendar className="text-orange-500" />
                                Payment Log
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                        <tr className="border-b border-gray-200 text-gray-400 font-bold uppercase tracking-widest">
                                            <th className="py-2.5">Date</th>
                                            <th className="py-2.5">Reference</th>
                                            <th className="py-2.5 text-right">Amount</th>
                                            <th className="py-2.5 text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 text-slate-700 font-medium">
                                        {activePlan.payments.map((pmt) => (
                                            <tr key={pmt.id}>
                                                <td className="py-3">{new Date(pmt.date).toLocaleString()}</td>
                                                <td className="py-3 font-mono">{pmt.reference}</td>
                                                <td className="py-3 text-right font-bold text-slate-900">{formatCurrency(pmt.amount)}</td>
                                                <td className="py-3 text-right">
                                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                                                        pmt.status === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {pmt.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Quick Installment Payment Dialog/Modal */}
            {isPaymentModalOpen && paymentPlan && (
                <div className="fixed inset-0 z-150 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div 
                        onClick={() => setIsPaymentModalOpen(false)} 
                        className="fixed inset-0 bg-black/50 backdrop-blur-xs cursor-pointer"
                    />

                    {/* Content Box */}
                    <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-150 p-6 max-w-sm w-full space-y-5 overflow-hidden z-10">
                        {paymentStatus === 'idle' && (
                            <div className="space-y-4">
                                <div className="text-center border-b border-gray-100 pb-3">
                                    <h3 className="text-base font-bold text-slate-950 uppercase">Pay Layaway installment</h3>
                                    <p className="text-xs text-gray-500 mt-1">Paying towards installment purchase for <span className="font-bold text-slate-900">{paymentPlan.product_name}</span></p>
                                </div>

                                {/* Custom payment amount */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Payment Amount (GHS)</label>
                                    <input
                                        type="number"
                                        value={paymentAmount}
                                        onChange={(e) => {
                                            const amt = Number(e.target.value);
                                            setPaymentAmount(amt > paymentPlan.balance_amount ? paymentPlan.balance_amount : amt);
                                        }}
                                        min={1}
                                        max={paymentPlan.balance_amount}
                                        className="w-full bg-gray-50 border border-gray-250 focus:border-orange-400 text-slate-950 font-bold px-4 py-2.5 rounded-lg text-sm transition-all focus:outline-hidden"
                                    />
                                    <span className="text-[10px] text-gray-400 block text-right font-semibold uppercase">Max Allowed: {formatCurrency(paymentPlan.balance_amount)}</span>
                                </div>

                                {/* Network Selection */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Network Provider</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            { id: '13', name: 'MTN MoMo', color: 'bg-yellow-400 border-yellow-400 text-yellow-950' },
                                            { id: '6', name: 'Telecel', color: 'bg-red-500 border-red-500 text-white' },
                                            { id: '7', name: 'AT Money', color: 'bg-blue-600 border-blue-600 text-white' },
                                        ].map((provider) => (
                                            <button
                                                key={provider.id}
                                                type="button"
                                                onClick={() => setMomoProvider(provider.id as any)}
                                                className={`py-2 text-[9px] font-bold rounded-lg border-2 transition-all cursor-pointer flex items-center justify-center text-center ${
                                                    momoProvider === provider.id
                                                        ? `${provider.color} font-black scale-102`
                                                        : 'bg-white border-gray-250 text-slate-600 hover:border-gray-300'
                                                }`}
                                            >
                                                {provider.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Phone number */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Mobile Money Number</label>
                                    <div className="relative">
                                        <span className="absolute left-3.5 top-3.5 text-xs text-gray-500 font-bold">+233</span>
                                        <input
                                            type="tel"
                                            placeholder="24 123 4567"
                                            value={momoNumber}
                                            onChange={(e) => setMomoNumber(e.target.value.replace(/\D/g, ''))}
                                            className="w-full bg-white border border-gray-200 focus:border-orange-400 text-slate-900 px-4 py-3 pl-14 rounded-lg text-sm transition-all focus:outline-hidden"
                                            maxLength={10}
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-2.5 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsPaymentModalOpen(false)}
                                        className="flex-1 py-3 border border-gray-300 text-slate-700 rounded-lg text-xs font-bold transition-all bg-white cursor-pointer uppercase tracking-wider"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handlePayInstallment}
                                        className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-bold transition-all cursor-pointer uppercase tracking-wider shadow-xs"
                                    >
                                        Authorize
                                    </button>
                                </div>
                            </div>
                        )}

                        {paymentStatus === 'initiating' && (
                            <div className="text-center py-8 space-y-4">
                                <div className="loader w-12 h-12 mx-auto" />
                                <div>
                                    <h4 className="text-sm font-bold text-slate-900 uppercase">Connecting Gateway</h4>
                                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                        Initializing mobile payment transactions. Please do not close this window...
                                    </p>
                                </div>
                            </div>
                        )}

                        {paymentStatus === 'pending_otp' && (
                            <div className="space-y-4">
                                <div className="text-center">
                                    <h3 className="text-sm font-bold text-slate-900 uppercase">Verify OTP PIN</h3>
                                    <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                                        Confirm authorization by entering the 4-digit code sent to +233 {momoNumber}
                                    </p>
                                </div>

                                <input
                                    type="text"
                                    maxLength={4}
                                    placeholder="1234"
                                    value={otpCode}
                                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                                    className="w-32 bg-white text-center border-2 border-gray-250 focus:border-orange-500 text-lg font-bold tracking-[0.4em] mx-auto py-2 rounded-lg transition-all focus:outline-hidden block"
                                />

                                <button
                                    type="button"
                                    onClick={handleConfirmInstallmentOtp}
                                    className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-bold transition-all cursor-pointer uppercase tracking-wider"
                                >
                                    Verify & Pay
                                </button>
                            </div>
                        )}

                        {paymentStatus === 'success' && (
                            <div className="text-center py-6 space-y-4">
                                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto shadow-xs">
                                    <CheckCircle2 className="w-7 h-7" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-950 uppercase">Payment Cleared</h3>
                                    <p className="text-xs text-gray-500 mt-1">Transaction reference: {simulatedRef}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
