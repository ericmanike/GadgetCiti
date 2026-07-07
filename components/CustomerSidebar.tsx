'use client';
import React from 'react';
import Link from 'next/link';
import { CircleUser } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from './AuthContext';
import {
    User,
    ShoppingBag,
    Mail,
    Heart,
    Star,
    Clock,
    Settings,
    LogOut,
    Ticket,
    MailPlus,
    Wallet
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
        {
            label: 'Gadget Requests',
            href: '/customer/requests',
            icon: MailPlus,
        },
        {
            label: 'All Reviews',
            href: '/customer/reviews',
            icon: Star,
        },
        {
            label: 'Rewards',
            href: '/customer/vouchers',
            icon: Ticket,
        },
        {
            label: 'Saved Items',
            href: '/customer/wishlist',
            icon: Heart,
        },
        {
            label: 'Recently Viewed',
            href: '/customer/recently-viewed',
            icon: Clock,
        },
    ];

    const managementItems = [
        { label: 'Account Details', href: '/customer/account' },
        { label: 'Address and Delivery Information', href: '/customer/address' },
        { label: 'Change Password', href: '/customer/password' },
    ];

    const handleLogout = async () => {
        try {
            await signOut();
            router.push('/');
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

    return (
        <div className="w-full bg-white rounded-lg shadow-sm overflow-hidden h-fit border border-gray-200">
            <nav className="flex flex-col">
                <div className="w-full bg-gray-800 p-4 py-3 gap-3 flex justify-start items-center">
                    <CircleUser className="w-6 h-6" color="white" />
                    <span className="text-white text-sm font-semibold truncate">Hello, {displayName}</span>
                </div>
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:text-orange-500 hover:bg-orange-50/30 ${
                                isActive ? 'text-orange-500 bg-orange-50/50 font-bold border-r-4 border-orange-500' : 'text-slate-700'
                            }`}
                        >
                            <item.icon size={18} className={isActive ? 'text-orange-500' : 'text-slate-600'} />
                            <span className="truncate leading-tight">{item.label}</span>
                        </Link>
                    );
                })}

                <div className="pt-2 border-t border-gray-100">
                    <p className="px-4 py-2 text-xs font-bold text-white uppercase bg-orange-500">Account Settings</p>
                    {managementItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`block px-4 py-2 text-sm font-medium hover:text-orange-500 hover:bg-orange-50/30 transition-colors truncate leading-tight ${
                                    isActive ? 'text-orange-500 bg-orange-50/50 font-bold' : 'text-slate-700'
                                }`}
                            >
                                {item.label}
                            </Link>
                        );
                    })}
                </div>

                <div className="mt-2 pt-2 border-t border-gray-100 mb-2">
                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm text-orange-500 hover:bg-orange-50 transition-colors uppercase font-bold tracking-wider cursor-pointer"
                    >
                        <LogOut size={16} />
                        Logout
                    </button>
                </div>
            </nav>
        </div>
    );
};

export default CustomerSidebar;
