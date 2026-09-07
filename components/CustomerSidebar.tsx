'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from './AuthContext';
import {
    ShoppingBag,
    Mail,
    Heart,
    Star,
    LogOut,
    Wallet,
    MapPin,
    User,
    ArrowLeft
} from 'lucide-react';

interface MenuItem {
    name: string;
    href: string;
    icon: React.ComponentType<any>;
}

const CustomerSidebar = () => {
    const pathname = usePathname();
    const router = useRouter();
    const { user, signOut } = useAuth();

    const menuItems: MenuItem[] = [
        { name: 'Orders', href: '/customer/orders', icon: ShoppingBag },
        { name: 'Pay Small Small', href: '/customer/pay-small-small', icon: Wallet },
        { name: 'Inbox', href: '/customer/inbox', icon: Mail },
        { name: 'Saved Items', href: '/customer/wishlist', icon: Heart },
        { name: 'Write a Review', href: '/customer/reviews', icon: Star },
        { name: 'Address Book', href: '/customer/address', icon: MapPin },
        { name: 'My Profile', href: '/customer/account', icon: User },
    ];

    const handleLogout = async () => {
        try {
            await signOut();
            router.push('/');
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Customer';

    return (
        <div className="w-full bg-white shadow-sm overflow-hidden h-full border-r border-gray-200 flex flex-col justify-between p-6 space-y-6">
            <div className="flex flex-col flex-1 space-y-6 overflow-y-auto no-scrollbar">
                {/* Header */}
                <div className="flex items-center space-x-3 pb-6 border-b border-gray-150 shrink-0">
                    <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white font-black text-lg tracking-wider shadow-lg shadow-orange-500/30">
                        C
                    </div>
                    <span className="font-black text-xl text-slate-900 tracking-widest uppercase">
                        Gadget CITi<span className="text-orange-500 text-xs font-bold block leading-none">MY ACCOUNT</span>
                    </span>
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 space-y-2">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href || (item.href !== '/customer' && pathname.startsWith(item.href));
                        return (
                            <Link key={item.href} href={item.href}>
                                <button
                                    className={`w-full flex items-center space-x-4 px-4 py-3 mb-2 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                                        isActive 
                                            ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20 font-bold' 
                                            : 'text-slate-800 hover:bg-slate-50'
                                    }`}
                                >
                                    <item.icon size={20} className={isActive ? 'text-white' : 'text-[#1E2939]'} />
                                    <span>{item.name}</span>
                                </button>
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Bottom Section */}
            <div className="pt-4 border-t border-gray-150 space-y-3 shrink-0">
                <div className="flex items-center space-x-3 px-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center font-bold text-xs text-white uppercase select-none shrink-0">
                        {displayName.charAt(0).toUpperCase()}
                    </div>
                    <div className="truncate flex-1">
                        <p className="text-xs font-bold text-slate-800 truncate">{displayName}</p>
                        <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
                    </div>
                </div>

                <Link
                    href="/buy"
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs text-slate-700 hover:text-orange-500 hover:bg-slate-50 transition-colors uppercase font-bold tracking-wider cursor-pointer border border-gray-200 rounded-xl"
                >
                    <ArrowLeft size={14} className="text-[#1E2939]" />
                    <span>Back to Shop</span>
                </Link>

                <button 
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center space-x-2 bg-gray-50 hover:bg-red-50 hover:text-red-600 text-gray-500 font-semibold py-2.5 px-4 rounded-xl text-sm transition-all duration-200 cursor-pointer border border-gray-200 hover:border-red-100"
                >
                    <LogOut size={16} />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
};

export default CustomerSidebar;
