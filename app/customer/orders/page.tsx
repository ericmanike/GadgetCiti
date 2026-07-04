'use client';
import React from 'react';
import { ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export default function OrdersPage() {
    return (
        <div className="bg-white rounded shadow-sm min-h-[calc(100vh-8rem)]">
            <div className="p-4 border-b border-gray-100">
                <h1 className="text-xl font-bold text-slate-900">Orders</h1>
            </div>

            <div className="p-4 md:p-8 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <ShoppingBag size={32} className="text-gray-400 md:size-[40px]" />
                </div>
                <h2 className="text-base md:text-lg font-bold text-slate-900 mb-2">You have no orders yet!</h2>
                <p className="text-xs md:text-sm text-gray-600 mb-6 max-w-xs leading-relaxed">
                    All your orders will be saved here for you to access anytime.
                </p>
                <Link href="/buy">
                    <button className="bg-orange-500 text-white px-4 md:px-8 py-2 md:py-3 rounded text-[10px] md:text-sm font-bold uppercase tracking-wider hover:bg-orange-600 transition-colors shadow-md">
                        Continue Shopping
                    </button>
                </Link>
            </div>
        </div>
    );
}
