'use client';
import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MailPlus, Plus, MapPin, HelpCircle, ShoppingBagIcon, LayoutDashboard, CircleUser, Motorbike } from 'lucide-react';
import { motion } from 'framer-motion';

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


  const menus = [
    { id: 4, name: 'Dashboard', href: '/customer/orders', icon: LayoutDashboard },
    { id: 1, name: 'Start Selling', href: '/sell', icon: Plus },
    { id: 2, name: 'Buy any gadget', href: '/buy', icon: ShoppingBagIcon },
    { id: 3, name: 'Ask for any gadget ', href: '/chatroom', icon: MailPlus },
    { id: 5, name: 'Help Center', href: '/help', icon: HelpCircle },
    { id: 6, name: 'Pickup Trash', href: '/dump', icon: MapPin },
  ]


  const router = useRouter();





  return (

    <div className={`${isOpen ? 'translate-x-0' : '-translate-x-full'} w-[80%] md:w-1/3 h-screen   overflow-y-auto bg-[#f9f8f8] fixed 
    scrollbar-hide  z-50 top-0 transition-all duration-300  ease-in-out shadow-lg`} ref={sidebarRef}>


      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}

        className="p-2 transition cursor-pointer rounded-3xl bg-gray-600  hover:bg-gray-700  absolute top-1 right-2" onClick={() => setIsOpen(false)}>
        <X size={24} className="text-orange-500 " strokeWidth={2} />
      </motion.button>


      <div className='w-full bg-gray-800 p-4 py-3 gap-4 flex justify-start'>


        <CircleUser className='w-7 h-7' color='white' />
        <span className='text-white'>Hello </span>


      </div>
      {menus.map((menu) => (
        <div key={menu.id} className='w-full  p-4 py-3 gap-4  justify-start
     hover:bg-gray-200 cursor-pointer mt-2 '>
          <Link href={menu.href}>

            <button className='flex  gap-4 items-center ' onClick={() => setIsOpen(false)}>

              {<menu.icon className='text-orange-500' />}
              <span> {menu.name}</span>

            </button>
          </Link>
        </div>
      ))}

      <button className=' w-[90%] m-auto p-4 py-3 bg-orange-500 
    text-white rounded-xl absolute  bottom-3 
    right-2 left-2 cursor-pointer' onClick={() => {
          router.push('/contact')

          setIsOpen(false)
        }


        }>Account</button>
    </div>
  );
};

export default NotificationsPanel;