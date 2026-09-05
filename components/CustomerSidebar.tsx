'use client';
import React from 'react';
import Link from 'next/link';
import { CircleUser } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from './AuthContext';
import {
    ShoppingBag,
    Mail,
    Heart,
    Star,
    LogOut,
    Wallet,
    ArrowLeft
} from 'lucide-react';

const CustomerSidebar = () => {
    const pathname = usePathname();
    const router = useRouter();
    const { user, signOut } = useAuth();

    const menuItems = [
        {
            label: 'Orders',
            href: '/customer/orders',
            icon: ShoppingBag,
        },
        {
            label: 'Pay Small Small',
            href: '/customer/pay-small-small',
            icon: Wallet,
        },
        {
            label: 'Inbox',
            href: '/customer/inbox',
            icon: Mail,
        },
        // {
        //     label: 'Gadget Requests',
        //     href: '/customer/requests',
        //     icon: MailPlus,
        // },
        {
            label: 'All Reviews',
            href: '/customer/reviews',
            icon: Star,
        },
        // {
        //     label: 'Rewards',
        //     href: '/customer/vouchers',
        //     icon: Ticket,
        // },
        {
            label: 'Saved Items',
            href: '/customer/wishlist',
            icon: Heart,
        }
    ];

    const managementItems = [
        { label: 'Profile Information', href: '/customer/account' },
        { label: 'Address Book', href: '/customer/address' },
    ];

    const handleLogout = async () => {
        try {
            await signOut();
            router.push('/');
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    let displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
    displayName = displayName.split(' ')[0];
  

    return (
        <div className="w-full bg-white shadow-sm overflow-hidden h-full border-r border-gray-200 flex flex-col justify-between">
            <nav className="flex flex-col flex-1 overflow-y-auto no-scrollbar py-2">
                <Link 
                    href="/customer/account"
                    className="w-full bg-gray-800 p-3 md:p-4 py-3.5 gap-2.5 md:gap-3 flex justify-start items-center hover:bg-gray-700 transition-colors cursor-pointer group mb-3 shadow-xs"
                >
                    <CircleUser className="w-6 h-6 md:w-8 md:h-8 text-white shrink-0 group-hover:scale-105 transition-transform" color="white" />
                    <div className="flex flex-col min-w-0">
                        <span className="text-white text-[15px] font-medium truncate group-hover:text-orange-400 transition-colors">Hello, {displayName}</span>
                    </div>
                </Link>

                {/* Main Navigation Items with vertical spacing */}
                <div className="flex flex-col gap-2 px-2">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3.5 px-4 py-3 text-[15px] font-normal transition-all rounded-xl hover:text-orange-500 hover:bg-orange-50/40 select-none ${
                                    isActive ? 'text-orange-500 bg-orange-50/80 font-bold shadow-2xs' : 'text-black'
                                }`}
                            >
                                <item.icon size={20} className={isActive ? 'text-orange-500' : 'text-[#1E2939]'} />
                                <span className="truncate leading-tight">{item.label}</span>
                            </Link>
                        );
                    })}
                </div>

                {/* Account Settings with vertical spacing */}
                <div className="pt-4 mt-4 border-t border-gray-100 flex flex-col gap-2">
                    <p className="px-5 py-1 text-[13px] font-bold text-[#1E2939] uppercase tracking-wider opacity-70">Account Settings</p>
                    <div className="flex flex-col gap-2 px-2">
                        {managementItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`block px-4 py-3 text-[15px] font-normal hover:text-orange-500 hover:bg-orange-50/40 transition-all truncate leading-tight rounded-xl ${
                                        isActive ? 'text-orange-500 bg-orange-50/80 font-bold shadow-2xs' : 'text-black'
                                    }`}
                                >
                                    {item.label}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </nav>

            <div className="pt-2 border-t border-gray-150 bg-white p-2 w-full space-y-1 pb-8 md:pb-6">
                <Link
                    href="/buy"
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-[14px] text-black hover:text-orange-500 hover:bg-slate-50 transition-colors uppercase font-medium tracking-wider cursor-pointer border border-gray-200 rounded-xl"
                >
                    <ArrowLeft size={12} className="text-[#1E2939]" />
                    Back to Shop
                </Link>
                <button 
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-[14px] text-orange-500 hover:bg-orange-50 transition-colors uppercase font-medium tracking-wider cursor-pointer rounded-xl"
                >
                    <LogOut size={16} />
                    Logout
                </button>
            </div>
        </div>
    );
};

export default CustomerSidebar;
