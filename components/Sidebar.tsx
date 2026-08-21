'use client';
import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MapPin, HelpCircle, ShoppingBagIcon, LayoutDashboard, SquareUser, Zap, Wallet, ClipboardList, Info, MessageSquareQuote, ShieldCheck, FileText, Scale, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from './AuthContext';

interface NotificationsPanelProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}


const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ isOpen, setIsOpen }) => {

  const sidebarRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = (event: MouseEvent) => {
    if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
      setIsOpen(false);

    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);


  const menuSections = [
    {
      title: 'Shop & Explore',
      items: [
        { id: 2, name: 'Shop now', href: '/buy', icon: ShoppingBagIcon },
        { id: 7, name: 'Falaa Deals', href: '/buy', icon: Zap },
      ]
    },
    {
      title: 'Financing & Services',
      items: [
        { id: 8, name: 'Pay Small Small', href: '/customer/pay-small-small', icon: Wallet },
      ]
    },
    {
      title: 'Company & Support',
      items: [
        { id: 10, name: 'About Gadget CITi', href: '/about', icon: Info },
        { id: 11, name: 'Customer Reviews', href: '/reviews', icon: MessageSquareQuote },
        { id: 9, name: 'My Orders', href: '/customer/orders', icon: ClipboardList },
        { id: 5, name: 'FAQs', href: '/faq', icon: HelpCircle },
      ]
    },
    {
      title: 'Legal & Policies',
      items: [
        { id: 12, name: 'Terms of Service', href: '/terms', icon: Scale },
        { id: 13, name: 'Privacy Policy', href: '/privacy', icon: ShieldCheck },
        { id: 14, name: 'Refund Policy', href: '/refund-policy', icon: RefreshCw },
      ]
    }
  ];


  const router = useRouter();
  const { user } = useAuth();

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Guest';

  return (

    <div className={`${isOpen ? 'translate-x-0' : '-translate-x-full'} w-[65%] md:w-[280px] h-screen overflow-y-auto bg-[#fcfcfc] fixed 
    scrollbar-hide z-50 top-0 transition-all duration-300 ease-in-out shadow-2xl flex flex-col border-r border-slate-100`} ref={sidebarRef}>


      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}

        className="p-1.5 transition cursor-pointer rounded-full bg-slate-700/80 hover:bg-slate-800 absolute top-2 right-2 z-10" onClick={() => setIsOpen(false)}>
        <X size={20} className="text-orange-500" strokeWidth={2.5} />
      </motion.button>


      <div className='w-full bg-slate-800 p-5 py-4 gap-3.5 flex justify-start items-center shadow-sm shrink-0'>


        <SquareUser className='w-8 h-8' color='white' strokeWidth={1.5} />
        <span className='text-white font-bold text-sm tracking-wide'>Hello, {displayName}</span>


      </div>
      
      {/* Grouped menu sections */}
      <div className="flex-1 py-3 flex flex-col gap-5 overflow-y-auto no-scrollbar">
        {menuSections.map((section, sIdx) => (
          <div key={sIdx} className="w-full flex flex-col">
            {/* Section title */}
            <div className="px-5 py-1 text-[10px] md:text-[10px] font-black tracking-widest text-slate-400 uppercase">
              {section.title}
            </div>
            
            {/* Section items list */}
            <div className="flex flex-col mt-1">
              {section.items.map((menu) => (
                <Link
                  key={menu.id}
                  href={menu.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3.5 px-5 py-3 hover:bg-slate-50 transition-colors group cursor-pointer text-slate-700 hover:text-orange-500 select-none"
                >
                  <menu.icon className="text-orange-500 w-5 h-5 transition-transform group-hover:scale-105" strokeWidth={2} />
                  <span className="text-base md:text-sm font-bold tracking-wide leading-none">{menu.name}</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-slate-100 bg-slate-50 shrink-0">
        <button className='w-full p-3.5 bg-orange-500 text-white rounded-xl font-extrabold text-xs tracking-wider uppercase cursor-pointer hover:bg-orange-600 active:scale-[0.98] transition-all shadow-md shadow-orange-500/10' 
        
        onClick={() => {
              router.push('/customer/dashboard')
    
              setIsOpen(false)
            }
    
    
            }> My Account</button>
      </div>
    </div>
  );
};

export default NotificationsPanel;