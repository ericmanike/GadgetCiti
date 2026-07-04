'use client';
import React from 'react';
import { Mail } from 'lucide-react';

export default function InboxPage() {
    return (
        <div className="bg-white rounded shadow-sm min-h-[calc(100vh-8rem)]">
            <div className="p-4 border-b border-gray-100">
                <h1 className="text-xl font-bold text-slate-900">Inbox Messages</h1>
            </div>

            <div className="p-8 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Mail size={40} className="text-gray-400" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 mb-2">You have no messages</h2>
                <p className="text-gray-600 mb-6 max-w-xs">
                    Here you will find all the communications from Letronix about your orders and account.
                </p>
            </div>
        </div>
    );
}
