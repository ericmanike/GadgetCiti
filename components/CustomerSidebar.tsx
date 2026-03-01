'use client';
import React from 'react';
import Link from 'next/link';
import { CircleUser } from 'lucide-react';
import { usePathname } from 'next/navigation';
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
    MailPlus
} from 'lucide-react';

const CustomerSidebar = () => {
    const pathname = usePathname();

    const menuItems = [

        {
            label: 'Orders',
            href: '/customer/orders',
            icon: ShoppingBag,
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

    return (
        <div className="w-full bg-white rounded shadow-sm overflow-hidden h-fit">
            <nav className="flex flex-col">
                <div className="w-full bg-gray-800 p-2 md:p-4 py-1.5 md:py-3 gap-1.5 md:gap-4 flex justify-start items-center">
                    <CircleUser className='w-4 h-4 md:w-7 md:h-7' color='white' />
                    <span className='text-white text-[10px] md:text-base font-medium'>Hello </span>
                </div>
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-1.5 md:gap-3 px-2 md:px-4 py-1.5 md:py-3 text-[9px] md:text-sm transition-colors hover:text-orange-500 ${isActive ? 'text-orange-500 bg-gray-200' : 'text-slate-700'
                                }`}
                        >
                            <item.icon size={13} className={`${isActive ? 'text-orange-500' : 'text-slate-900'} md:size-[20px]`} />
                            <span className={`${isActive ? 'font-bold' : 'font-medium'} truncate leading-tight`}>{item.label}</span>
                        </Link>
                    );
                })}

                <div className="pt-1.5 md:pt-2 border-t border-gray-100">
                    <p className="px-2 md:px-4 py-1 md:py-2 text-[8px] md:text-xs text-slate-700 uppercase bg-orange-500 text-white">Account Settings</p>
                    {managementItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="block px-2 md:px-4 py-1 md:py-2 text-[9px] md:text-sm font-medium hover:text-orange-500 transition-colors truncate leading-tight"
                        >
                            {item.label}
                        </Link>
                    ))}
                </div>

                <div className="mt-1 md:mt-4 pt-1 md:pt-4 border-t border-gray-100 mb-2">
                    <button className="w-full flex items-center justify-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 md:py-3 text-[9px] md:text-sm text-orange-500 hover:bg-orange-50 transition-colors uppercase font-bold tracking-tight md:tracking-wider">
                        <LogOut size={12} className="md:size-[18px]" />
                        Logout
                    </button>
                </div>
            </nav>
        </div>
    );
};

export default CustomerSidebar;
