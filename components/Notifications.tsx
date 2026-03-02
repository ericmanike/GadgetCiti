'use client';
import React, { useEffect, useRef, useState } from 'react';
import { X, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationCard, { Notification } from './NotificationCard';

interface NotificationsPanelProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const SAMPLE_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'order',
    title: 'Order Shipped!',
    message: 'Your iPhone 15 Pro Max order #LE-2041 has been dispatched and is on its way to you.',
    time: '2m ago',
    read: false,
  },
  {
    id: '2',
    type: 'promo',
    title: 'Flash Sale – 30% Off Laptops',
    message: 'Hurry! Our biggest laptop sale of the year ends in 3 hours. Shop now before stocks run out.',
    time: '1h ago',
    read: false,
  },
  {
    id: '3',
    type: 'chat',
    title: 'New message from Letronix Support',
    message: 'Hi! We noticed you had a question about your warranty. Our team is ready to help you.',
    time: '3h ago',
    read: false,
  },
  {
    id: '4',
    type: 'order',
    title: 'Order Delivered',
    message: 'Your AirPods Pro (2nd Gen) order #LE-2038 was delivered successfully. Enjoy!',
    time: 'Yesterday',
    read: true,
  },
  {
    id: '5',
    type: 'system',
    title: 'Account verified',
    message: 'Your Letronix account has been fully verified. You can now sell gadgets on our platform.',
    time: '2 days ago',
    read: true,
  },
  {
    id: '6',
    type: 'promo',
    title: 'New arrivals just dropped 🔥',
    message: 'Samsung Galaxy S25 Ultra and MacBook Air M3 are now available. Be among the first to grab yours.',
    time: '3 days ago',
    read: true,
  },
];

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ isOpen, setIsOpen }) => {
  const [notifications, setNotifications] = useState<Notification[]>(SAMPLE_NOTIFICATIONS);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const panelRef = useRef<HTMLDivElement>(null);
  const handleClickOutside = (event: MouseEvent) => {
    if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div
      className={`${isOpen ? 'translate-x-0' : 'translate-x-full'} w-full md:w-[400px] h-screen flex flex-col bg-white fixed right-0 z-50 top-0 transition-all duration-300 ease-in-out shadow-2xl`}
      ref={panelRef}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-2">
          <Bell size={20} className="text-orange-500" strokeWidth={2.5} />
          <h2 className="text-lg font-black text-gray-900">Notifications</h2>
          {unreadCount > 0 && (
            <span className="bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs font-bold text-orange-500 hover:text-orange-600 transition-colors"
            >
              Mark all read
            </button>
          )}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <X size={18} className="text-gray-600" strokeWidth={2} />
          </motion.button>
        </div>
      </div>

      {/* Notification List */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 scrollbar-hide">
        <AnimatePresence>
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-400 py-20">
              <Bell size={48} strokeWidth={1.5} />
              <p className="text-sm font-semibold">No notifications yet</p>
            </div>
          ) : (
            notifications.map(notification => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onRead={markAsRead}
              />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default NotificationsPanel;