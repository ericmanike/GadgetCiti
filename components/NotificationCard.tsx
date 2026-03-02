'use client';
import { motion } from 'framer-motion';

export interface Notification {
    id: string;
    avatar?: string;
    title: string;
    message: string;
    time: string;
    read: boolean;
    type: 'order' | 'promo' | 'chat' | 'system';
}

interface NotificationCardProps {
    notification: Notification;
    onRead: (id: string) => void;
}

const typeColors: Record<Notification['type'], string> = {
    order: 'bg-orange-100 text-orange-600',
    promo: 'bg-purple-100 text-purple-600',
    chat: 'bg-blue-100 text-blue-600',
    system: 'bg-gray-100 text-gray-600',
};

const typeIcons: Record<Notification['type'], string> = {
    order: '📦',
    promo: '🎉',
    chat: '💬',
    system: '🔔',
};

export default function NotificationCard({ notification, onRead }: NotificationCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ duration: 0.2 }}
            onClick={() => onRead(notification.id)}
            className={`flex items-start gap-3 p-4 rounded-2xl cursor-pointer transition-all
        ${notification.read ? 'bg-white' : 'bg-orange-50 border border-orange-100'}
        hover:bg-gray-50 active:scale-[0.99]`}
        >
            {/* Avatar / Icon */}
            <div className={`shrink-0 w-11 h-11 rounded-full flex items-center justify-center text-lg font-bold ${typeColors[notification.type]}`}>
                {notification.avatar
                    ? <img src={notification.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                    : <span>{typeIcons[notification.type]}</span>
                }
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                    <p className={`text-sm font-bold truncate ${notification.read ? 'text-gray-700' : 'text-gray-900'}`}>
                        {notification.title}
                    </p>
                    <span className="text-[10px] text-gray-400 whitespace-nowrap shrink-0">{notification.time}</span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
                    {notification.message}
                </p>
            </div>

            {/* Unread dot */}
            {!notification.read && (
                <span className="shrink-0 mt-1 w-2 h-2 rounded-full bg-orange-500" />
            )}
        </motion.div>
    );
}
