'use client';
import { Menu, ShoppingBag, ShoppingCart, Gift, Truck, Bell, PhoneCall, Megaphone, Search, Zap, Home } from 'lucide-react';
import logo from '../public/Wastocash0.png';
import Link from 'next/link';
import { useState } from 'react';
import NotificationsPanel from './Notifications';
import MoreDropdown from './Dropdown';
import Sidebar from './Sidebar';
import ActiveLink from './ActiveLink';
import DropdownProfile from './Profiledropdown';
import { useRouter } from 'next/navigation';
import { motion, scale } from 'framer-motion';
import Marquee from './marquee';
import { useAuth } from './Auth_Context';
import { Suspense } from 'react';

const Navbar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMoreDropdownOpen, setIsMoreDropdownOpen] = useState(false);


  const { user, loading } = useAuth();
  const router = useRouter();







  return (
    <>

      <nav className="w-full bg-gray-400 shadow-md fixed top-0 left-0 z-50">
        <Marquee />

        {/* Top Row: Menu, Logo, Search, and Actions */}
        <div className="flex items-center justify-between px-4 py-2 gap-4">
          {/* Menu & Logo */}
          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition" onClick={() => setIsSidebarOpen(true)}>
              <Menu size={24} className="text-black" strokeWidth={2} />
            </button>
            <Link href="/" className="flex items-center gap-2">
              <img src="/letronix.png" alt="letronix logo" className="w-8 h-8 md:w-10 md:h-10" />
              <span className="hidden lg:block text-green-700 font-bold text-xl font-[bitcount]">
                Letronix
              </span>
            </Link>
          </div>

          {/* Amazon-style Search Bar */}
          <div className="flex-1 max-w-2xl px-2">
            <div className="flex w-full group">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search Letronix..."
                  className="w-full h-8 md:h-10 px-3 md:px-4 py-1.5 md:py-2 rounded-l-md border-2 border-transparent bg-white focus:border-orange-500 outline-none transition-all placeholder:text-gray-500 text-xs md:text-base"
                />
              </div>
              <button className="h-8 md:h-10 px-3 md:px-5 bg-orange-500 hover:bg-orange-600 text-white rounded-r-md flex items-center justify-center transition-colors">
                <Search size={18} className="md:size-[22px]" strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {/* Right Section: Profile, Cart, Notifications */}
          <div className="flex items-center gap-1 md:gap-3 shrink-0">
            <DropdownProfile />

            <Link href="/cart" className="relative p-1 md:p-2 hover:bg-gray-100 rounded-lg transition">
              <ShoppingCart size={18} className="text-black md:size-[24px]" strokeWidth={2} />
              <span className="absolute top-0 right-0 w-3 h-3 md:w-4 md:h-4 bg-orange-500 text-white text-[7px] md:text-[9px] font-bold rounded-full flex items-center justify-center">
                2
              </span>
            </Link>

            <button className="p-2 hover:bg-gray-100 rounded-lg transition relative hidden sm:block" onClick={() => setIsNotificationsOpen(true)}>
              <Bell size={22} className="text-black" strokeWidth={2} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </div>

        {/* Bottom Row: Navigation Links */}
        <div className="bg-white border-t border-gray-300 px-4 py-1.5 overflow-x-auto no-scrollbar">
          <div className="flex items-center justify-center gap-6 md:gap-10 min-w-max mx-auto">
            <ActiveLink href="/">
              <div className="flex items-center gap-1.5 hover:text-orange-500 transition cursor-pointer group">
                <Home size={18} className="group-hover:text-orange-500" />
                <span className="text-xs md:text-sm font-semibold whitespace-nowrap">Home</span>
              </div>
            </ActiveLink>

            <ActiveLink href="/buy">
              <div className="flex items-center gap-1.5 hover:text-orange-500 transition cursor-pointer group">
                <ShoppingBag size={18} className="group-hover:text-orange-500" />
                <span className="text-xs md:text-sm font-semibold whitespace-nowrap">Buy Gadgets</span>
              </div>
            </ActiveLink>

            <ActiveLink href="/sell">
              <div className="flex items-center gap-1.5 hover:text-orange-500 transition cursor-pointer group">
                <ShoppingCart size={18} className="group-hover:text-orange-500" />
                <span className="text-xs md:text-sm font-semibold whitespace-nowrap">Sell Gadgets</span>
              </div>
            </ActiveLink>

            <ActiveLink href="/cart">
              <div className="flex items-center gap-1.5 hover:text-orange-500 transition cursor-pointer group">
                <Truck size={18} className="group-hover:text-orange-500" />
                <span className="text-xs md:text-sm font-semibold whitespace-nowrap">Order Tracking</span>
              </div>
            </ActiveLink>

            <ActiveLink href="/gifts">
              <div className="flex items-center gap-1.5 hover:text-orange-500 transition cursor-pointer group whitespace-nowrap">
                <Zap size={18} className="group-hover:text-orange-500" />
                <span className="text-xs md:text-sm font-semibold">Falaa Deals</span>
              </div>
            </ActiveLink>

            <div className="hidden md:flex items-center gap-1 hover:text-orange-500 transition cursor-pointer py-1" onClick={() => setIsMoreDropdownOpen(!isMoreDropdownOpen)}>
              <MoreDropdown />
              <span className="text-xs md:text-sm font-semibold">More</span>
            </div>

            <ActiveLink href="/news">
              <div className="flex items-center gap-1.5 hover:text-orange-500 transition cursor-pointer group md:hidden">
                <Megaphone size={18} className="group-hover:text-orange-500" />
                <span className="text-xs font-semibold">News</span>
              </div>
            </ActiveLink>
          </div>
        </div>
      </nav>
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <Suspense fallback={null}>
        <NotificationsPanel isOpen={isNotificationsOpen} setIsOpen={setIsNotificationsOpen} />
      </Suspense>
    </>
  );
};

export default Navbar;