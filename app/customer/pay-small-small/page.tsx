'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import Link from 'next/link';
import {
    Wallet,
    ArrowRight,
    CreditCard,
    AlertCircle,
    Clock,
    ShieldCheck,
    ShoppingBag,
    BadgePercent
} from 'lucide-react';


export default function PaySmallSmallPage() {
    const { user, loading: authLoading } = useAuth();
    const [loading, setLoading] = useState(true);
   
    const COMING_SOON = true;

 



    if (COMING_SOON) {
        return (
            <div className="w-full mx-auto py-8 sm:py-12 px-2 sm:px-4 font-sans">
                {/* Main Coming Soon Card */}
                <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200/80 shadow-xl shadow-slate-200/50 p-6 sm:p-10 md:p-14 text-center">
                   
                  

                    <div className="relative z-10 space-y-6">
                      
                        {/* Animated Hero Icon Graphic */}
                        <div className="relative mx-auto w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center">
                            <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-orange-500 to-amber-400 opacity-25 blur-xl animate-pulse" />
                            <div className="relative w-full h-full rounded-3xl bg-gradient-to-br from-orange-500 to-amber-500 shadow-xl shadow-orange-500/30 flex items-center justify-center text-white">
                                <Wallet className="w-12 h-12 stroke-[1.8]" />
                                <span className="absolute -bottom-1 -right-1 p-1.5 bg-slate-900 text-yellow-400 rounded-full border-2 border-white shadow-md">
                                    <Clock className="w-4 h-4" />
                                </span>
                            </div>
                        </div>

                        {/* Title & Tagline */}
                        <div className="space-y-3 max-w-2xl mx-auto">
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                                Pay Small Small <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500">
                                    Coming Soon
                                </span>
                            </h1>
                            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                                We are fine-tuning our installment payment platform to give you the easiest, most affordable way to own top-tier smartphones, laptops, and tech gadgets with convenient mobile money installments.
                            </p>
                        </div>

                        {/* Feature Preview Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-left">
                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100/80 shadow-xs flex flex-col gap-2">
                                <div className="w-9 h-9 rounded-xl bg-blue-500 text-white flex items-center justify-center">
                                    <BadgePercent className="w-5 h-5" />
                                </div>
                                <h3 className="font-bold text-slate-900 text-sm">Low Down Payments</h3>
                                <p className="text-xs text-slate-500 leading-normal">
                                    Pay as low as 50%–60% upfront and spread the rest into affordable monthly installments.
                                </p>
                            </div>

                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100/80 shadow-xs flex flex-col gap-2">
                                <div className="w-9 h-9 rounded-xl bg-blue-500 text-white flex items-center justify-center">
                                    <CreditCard className="w-5 h-5" />
                                </div>
                                <h3 className="font-bold text-slate-900 text-sm">Mobile Money & Cards</h3>
                                <p className="text-xs text-slate-500 leading-normal">
                              flexible deduction with MTN MoMo, Telecel Cash, AT Money, and bank cards.
                                </p>
                            </div>

                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100/80 shadow-xs flex flex-col gap-2">
                                <div className="w-9 h-9 rounded-xl bg-blue-500 text-white flex items-center justify-center">
                                    <ShieldCheck className="w-5 h-5" />
                                </div>
                                <h3 className="font-bold text-slate-900 text-sm">Safe & Genuine</h3>
                                <p className="text-xs text-slate-500 leading-normal">
                                    100% authentic tech devices backed with official warranties and transparent installment plans.
                                </p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-6">
                            <Link
                                href="/buy"
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-orange-500/25 hover:shadow-orange-500/35 transition-all hover:scale-[1.02] active:scale-[0.98] select-none"
                            >
                                <ShoppingBag className="w-4 h-4" />
                                <span>Browse Available Gadgets</span>
                                <ArrowRight className="w-4 h-4 ml-1" />
                            </Link>

                            <Link
                                href="/contact"
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] select-none"
                            >
                                <span>Contact Us for Inquiries</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

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

}