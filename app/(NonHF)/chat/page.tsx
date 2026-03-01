'use client';
import { useState } from 'react';
import { MessageSquare, Search, Clock, Trash2, MoreVertical, Users } from 'lucide-react';
import Link from 'next/link';


export default function ChatHistoryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [chatList, setChatList] = useState([
    { id: 1, name: 'Sarah Mitchell', avatar: 'SM', avatarColor: 'bg-pink-500', preview: 'Let\'s discuss the timeline for the new feature...', time: '2 hours ago', unread: 3 },
    { id: 2, name: 'James Chen', avatar: 'JC', avatarColor: 'bg-blue-500', preview: 'The mockups look great! I have a few suggestions...', time: '5 hours ago', unread: 0 },
    { id: 3, name: 'Emily Rodriguez', avatar: 'ER', avatarColor: 'bg-purple-500', preview: 'I\'m having trouble with the authentication flow...', time: 'Yesterday', unread: 1 },
    { id: 4, name: 'Michael Thompson', avatar: 'MT', avatarColor: 'bg-green-500', preview: 'Today\'s accomplishments and blockers...', time: 'Yesterday', unread: 0 },
    { id: 5, name: 'Olivia Parker', avatar: 'OP', avatarColor: 'bg-orange-500', preview: 'Here are some creative concepts for Q1...', time: '2 days ago', unread: 0 },
    { id: 6, name: 'David Kim', avatar: 'DK', avatarColor: 'bg-teal-500', preview: 'Found several edge cases we need to handle...', time: '3 days ago', unread: 0 },
  ]);

  const handleDelete = (chatId: number) => {
    setChatList(chatList.filter(chat => chat.id !== chatId));
    setOpenMenuId(null);
  };

  const filteredChats = chatList.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.preview.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-300">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="p-2 sm:p-3 bg-green-600 rounded-lg sm:rounded-xl shadow-lg">
              <Users className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-3xl font-bold text-slate-900">Your Chats</h1>
              <p className="text-slate-600 text-xs sm:text-sm">All conversations are displayed here</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 sm:w-5 sm:h-5" />
            <input
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg sm:rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Chat List */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredChats.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-block p-6 bg-white rounded-full shadow-lg mb-4">
              <MessageSquare className="w-12 h-12 text-slate-300" />
            </div>
            <p className="text-slate-500 text-lg">No chats found</p>
          </div>
        ) : (

          <div className="space-y-3">
            {filteredChats.map((chat) => (

              <div
                key={chat.id}
                className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border border-slate-100 hover:border-blue-200 group"
              >
                <Link href={`/chat/${chat.id}`} className="block">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 ${chat.avatarColor} rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-md shrink-0`}>
                      {chat.avatar}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <h3 className="font-semibold text-slate-900 text-lg truncate">
                          {chat.name}
                        </h3>
                        <div className="flex items-center gap-2 shrink-0">
                          {chat.unread > 0 && (
                            <span className="px-2 py-1 bg-blue-500 text-white text-xs font-semibold rounded-full">
                              {chat.unread}
                            </span>
                          )}
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuId(openMenuId === chat.id ? null : chat.id);
                              }}
                              className="p-1 hover:bg-slate-100 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <MoreVertical className="w-4 h-4 text-slate-400" />
                            </button>

                            {openMenuId === chat.id && (
                              <>
                                <div
                                  className="fixed inset-0 z-10"
                                  onClick={() => setOpenMenuId(null)}
                                />
                                <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-20">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDelete(chat.id);
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    Delete chat
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <p className="text-slate-600 text-sm mb-2 line-clamp-1">
                        {chat.preview}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{chat.time}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>

            ))}
          </div>

        )}
      </div>
    </div>
  );
}