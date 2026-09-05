'use client';
import React from 'react';
import { Star } from 'lucide-react';

export default function ReviewsPage() {
    return (
        <div className="bg-white rounded-xl shadow-xs border border-gray-100 min-h-[500px] flex flex-col">
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-gray-100">
                <h1 className="text-xl font-bold text-slate-900">Pending Reviews</h1>
            </div>

            {/* Empty State */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mb-4">
                    <Star size={36} className="text-slate-400" strokeWidth={1.75} />
                </div>
                <h2 className="text-lg font-bold text-slate-900 mb-1.5">No Pending Reviews</h2>
                <p className="text-slate-500 text-sm max-w-md leading-relaxed">
                    You have no products waiting for review. Purchased items available for feedback will show here.
                </p>
            </div>
        </div>
    );
}
