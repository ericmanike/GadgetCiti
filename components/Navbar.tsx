'use client';
import { Menu, ShoppingBag, ShoppingCart, Gift, Truck, Bell, Megaphone, Search, Zap, Home, MapPin } from 'lucide-react';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import NotificationsPanel from './Notifications';
import MoreDropdown from './Dropdown';
import Sidebar from './Sidebar';
import ActiveLink from './ActiveLink';
import DropdownProfile from './Profiledropdown';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Marquee from './marquee';

import { Suspense } from 'react';
import SearchDropdown from './SearchDropdown';
import { fetchAllProducts, Product } from '@/lib/products';
import { useCart } from '@/components/CartContext';

const Navbar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMoreDropdownOpen, setIsMoreDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const { totalItems } = useCart();

  const router = useRouter();

  // Load products on mount
  useEffect(() => {
    fetchAllProducts().then(setAllProducts);
  }, []);

  // Filter products on query change
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const q = searchQuery.toLowerCase();
    const filtered = allProducts.filter(
      p =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
    setSearchResults(filtered);
  }, [searchQuery, allProducts]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      router.push(`/buy?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>

      <nav className="w-full bg-gray-400 shadow-md fixed top-0 left-0 z-50">
        <Marquee />

        {/* Top Row: Menu, Logo, Search, and Actions */}
        <div className="flex items-center justify-between px-4 py-2 gap-x-4 flex-wrap md:flex-nowrap">
          {/* Menu & Logo */}
          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition" onClick={() => setIsSidebarOpen(true)}>
              <Menu size={24} className="text-black" strokeWidth={2} />
            </button>
            <Link href="/" className="flex items-center gap-2">
                    SWAPPI
            </Link>
          </div>

          {/* Search Bar */}
          <div className="w-full order-last mt-2 md:order-none md:flex-1 md:w-auto md:mt-0 max-w-2xl px-0 md:px-2">
            <div className="relative" ref={searchRef}>
              <form onSubmit={handleSearchSubmit} className="flex w-full">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => {
                      setSearchQuery(e.target.value);
                      setIsSearchOpen(true);
                    }}
                    onFocus={() => setIsSearchOpen(true)}
                    placeholder="Search Electronics Mart..."
                    className="w-full h-10 md:h-12 px-3 md:px-4 py-1.5 md:py-2 pr-8 rounded-l-full border-2 border-transparent bg-white focus:border-orange-500 outline-none transition-all placeholder:text-gray-500 text-[16px] md:text-base"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => { setSearchQuery(''); setSearchResults([]); setIsSearchOpen(false); }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                    >
                      <Search size={0} className="hidden" />
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </button>
                  )}
                </div>
                <button
                  type="submit"
                  className="h-10 md:h-12 px-3 md:px-5 bg-orange-500 hover:bg-orange-600 text-white rounded-r-full flex items-center justify-center transition-colors"
                >
                  <Search size={18} className="md:size-[22px]" strokeWidth={2.5} />
                </button>
              </form>

              {/* Search Dropdown */}
              <SearchDropdown
                query={searchQuery}
                results={searchResults}
                isOpen={isSearchOpen}
                onClose={() => setIsSearchOpen(false)}
                onClear={() => { setSearchQuery(''); setSearchResults([]); }}
              />
            </div>
          </div>

          {/* Right Section: Profile, Cart, Notifications */}
          <div className="flex items-center gap-2 md:gap-3 shrink-0">
          
            <DropdownProfile />

            <Link href="/cart" className="relative p-2 admd:p-2 hover:bg-gray-100 rounded-lg transition">
              <ShoppingCart size={22} className="text-black md:size-[26px]" strokeWidth={2} />
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 w-3 h-3 md:w-4 md:h-4 bg-orange-500 text-white text-[7px] md:text-[9px] font-bold rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>


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
                <span className="text-xs md:text-sm font-semibold whitespace-nowrap">Start Selling </span>
              </div>
            </ActiveLink>

            <ActiveLink href="/buy?category=new-arrivals">
              <div className="flex items-center gap-1.5 hover:text-orange-500 transition cursor-pointer group">
                <Truck size={18} className="group-hover:text-orange-500" />
                <span className="text-xs md:text-sm font-semibold whitespace-nowrap"> New Arrivals</span>
              </div>
            </ActiveLink>

            <ActiveLink href="/gifts">
              <div className="flex items-center gap-1.5 hover:text-orange-500 transition cursor-pointer group whitespace-nowrap">
                <Zap size={18} className="group-hover:text-orange-500" />
                <span className="text-xs md:text-sm font-semibold">Falaa Deals</span>
              </div>
            </ActiveLink>


            <ActiveLink href="/news">
              <div className="flex items-center gap-1.5 hover:text-orange-500 transition cursor-pointer group md:hidden">
                <Megaphone size={18} className="group-hover:text-orange-500" />
                <span className="text-xs font-semibold">News</span>
              </div>
            </ActiveLink>
          </div>
        </div>
      </nav>

      {/* Floating Notification Button */}
      <button 
        className="fixed bottom-6 right-6 z-50 p-3.5 bg-white border border-gray-200 rounded-full shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 cursor-pointer flex items-center justify-center"
        onClick={() => setIsNotificationsOpen(true)}
      >
        <Bell size={24} className="text-gray-800" strokeWidth={2.5} />
        <span className="absolute top-0 right-0 mt-0 mr-0 w-3.5 h-3.5 bg-red-500 border-2 border-white rounded-full"></span>
      </button>

      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <Suspense fallback={null}>
        <NotificationsPanel isOpen={isNotificationsOpen} setIsOpen={setIsNotificationsOpen} />
      </Suspense>
    </>
  );
};

export default Navbar;