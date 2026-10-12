'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { getSocket } from '@/lib/socket';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import {
  Send,
  ArrowLeft,
  Search,
  AlertTriangle,
  Image as ImageIcon,
} from 'lucide-react';

// Default mock conversations matching exact Ottly UI screenshot
const DEFAULT_MOCK_CONVERSATIONS = [
  {
    id: 'chat-mock-1',
    otherUser: { fullName: 'NAME IS PXR' },
    timeAgo: '25 days ago',
    timeStr: '12:10 AM',
    purchasedName: 'YouTube',
    lastMessage: { text: 'Ok', createdAt: '2026-08-24T00:07:00Z' },
    order: {
      orderNumber: '20260823',
      createdAt: '2026-08-23T23:07:00Z',
      totalAmount: 65,
      status: 'COMPLETED',
      buyer: { fullName: 'NAME IS PXR' },
      items: [
        {
          durationMonths: 1,
          unitPrice: 65,
          listing: {
            accountType: 'Private Account',
            deviceLimit: '1',
            deliveryType: 'OWN_EMAIL',
            quality: '4K Video Quality',
            platform: { name: 'YouTube' },
          },
        },
      ],
    },
    thread: [
      {
        id: 'm1',
        senderRole: 'buyer',
        text: "Hey, I've purchased YouTube. Please provide the required credentials.",
        time: '23-Aug-26 | 11:07 PM',
      },
      {
        id: 'm2',
        senderRole: 'buyer',
        text: 'pushpendrajat14@gmail.com',
        time: '23-Aug-26 | 11:08 PM',
      },
      {
        id: 'm3',
        senderRole: 'seller',
        text: 'Ye mail pr last kab subscription liya tha??',
        time: '23-Aug-26 | 11:34 PM',
      },
      {
        id: 'm4',
        senderRole: 'seller',
        text: 'Invitation sended successfully please check your Gmail and accept the invitation',
        time: '23-Aug-26 | 11:42 PM',
      },
      {
        id: 'm5',
        senderRole: 'buyer',
        text: 'nahi ho raha be',
        time: '24-Aug-26 | 12:07 AM',
        hasAttachment: true,
        attachmentName: 'message',
      },
    ],
  },
  {
    id: 'chat-mock-2',
    otherUser: { fullName: 'Manu p' },
    timeAgo: 'a month ago',
    timeStr: '3:43 PM',
    purchasedName: 'Nord VPN',
    lastMessage: { text: 'Your welcome bro', createdAt: '2026-08-12T15:43:00Z' },
    order: {
      orderNumber: '20260812',
      createdAt: '2026-08-12T15:40:00Z',
      totalAmount: 49,
      status: 'COMPLETED',
      buyer: { fullName: 'Manu p' },
      items: [
        {
          durationMonths: 1,
          unitPrice: 49,
          listing: {
            accountType: 'Private Account',
            deviceLimit: '1',
            deliveryType: 'DIRECT',
            quality: 'High Speed Unlimited',
            platform: { name: 'Nord VPN' },
          },
        },
      ],
    },
    thread: [
      {
        id: 'm2-1',
        senderRole: 'buyer',
        text: 'Hello bro, bought Nord VPN.',
        time: '12-Aug-26 | 03:40 PM',
      },
      {
        id: 'm2-2',
        senderRole: 'seller',
        text: 'Credentials sent to your registered mail!',
        time: '12-Aug-26 | 03:42 PM',
      },
      {
        id: 'm2-3',
        senderRole: 'buyer',
        text: 'Your welcome bro',
        time: '12-Aug-26 | 03:43 PM',
      },
    ],
  },
  {
    id: 'chat-mock-3',
    otherUser: { fullName: 'Ashutosh Vasu Pandey' },
    timeAgo: 'a month ago',
    timeStr: '1:34 PM',
    purchasedName: 'YouTube',
    lastMessage: { text: 'Ok', createdAt: '2026-08-10T13:34:00Z' },
    order: {
      orderNumber: '20260810',
      createdAt: '2026-08-10T13:30:00Z',
      totalAmount: 65,
      status: 'COMPLETED',
      buyer: { fullName: 'Ashutosh Vasu Pandey' },
      items: [
        {
          durationMonths: 1,
          unitPrice: 65,
          listing: {
            accountType: 'Private Account',
            deviceLimit: '1',
            deliveryType: 'OWN_EMAIL',
            quality: '4K Video Quality',
            platform: { name: 'YouTube' },
          },
        },
      ],
    },
    thread: [
      {
        id: 'm3-1',
        senderRole: 'buyer',
        text: 'Hi, please send the invite link.',
        time: '10-Aug-26 | 01:31 PM',
      },
      {
        id: 'm3-2',
        senderRole: 'seller',
        text: 'Sent to your Gmail. Please accept.',
        time: '10-Aug-26 | 01:33 PM',
      },
      {
        id: 'm3-3',
        senderRole: 'buyer',
        text: 'Ok',
        time: '10-Aug-26 | 01:34 PM',
      },
    ],
  },
  {
    id: 'chat-mock-4',
    otherUser: { fullName: 'ADITYA YADAV' },
    timeAgo: '4 days ago',
    timeStr: '3:17 PM',
    purchasedName: 'Spotify Premium',
    lastMessage: { text: 'No thanks bro', createdAt: '2026-10-08T15:17:00Z' },
    order: {
      orderNumber: '20261008',
      createdAt: '2026-10-08T15:10:00Z',
      totalAmount: 39,
      status: 'COMPLETED',
      buyer: { fullName: 'ADITYA YADAV' },
      items: [
        {
          durationMonths: 1,
          unitPrice: 39,
          listing: {
            accountType: 'Shared Account',
            deviceLimit: '1',
            deliveryType: 'DIRECT',
            quality: 'Very High Quality Audio',
            platform: { name: 'Spotify Premium' },
          },
        },
      ],
    },
    thread: [
      {
        id: 'm4-1',
        senderRole: 'seller',
        text: 'Do you need renewal for next month as well?',
        time: '08-Oct-26 | 03:15 PM',
      },
      {
        id: 'm4-2',
        senderRole: 'buyer',
        text: 'No thanks bro',
        time: '08-Oct-26 | 03:17 PM',
      },
    ],
  },
];

export default function ChatsPage() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [conversations, setConversations] = useState<any[]>(DEFAULT_MOCK_CONVERSATIONS);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingChats, setIsLoadingChats] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch real conversations if available
  const fetchConversations = async () => {
    if (!user) return;
    try {
      setIsLoadingChats(true);
      const res = await api.get('/chats');
      if (res.success && res.data && res.data.length > 0) {
        setConversations(res.data);
      }
    } catch {
      // Keep mock conversations on error or guest view
    } finally {
      setIsLoadingChats(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [user]);

  // When activeChatId changes, load messages (from real API or mock thread)
  useEffect(() => {
    if (!activeChatId) {
      setMessages([]);
      return;
    }

    const currentChat = conversations.find((c) => c.id === activeChatId);

    // If it's a real chat in DB
    if (activeChatId && !activeChatId.startsWith('chat-mock')) {
      const fetchRealMessages = async () => {
        try {
          const res = await api.get(`/chats/${activeChatId}/messages`);
          if (res.success && res.data) {
            setMessages(res.data);
          }
        } catch {
          // ignore
        }
      };
      fetchRealMessages();

      const socket = getSocket();
      if (socket) {
        socket.emit('chat:join', { chatId: activeChatId });
        const handleNewMessage = (msg: any) => {
          if (msg.chatId === activeChatId) {
            setMessages((prev) => [...prev, msg]);
          }
        };
        socket.on('chat:newMessage', handleNewMessage);
        return () => {
          socket.emit('chat:leave', { chatId: activeChatId });
          socket.off('chat:newMessage', handleNewMessage);
        };
      }
    } else if (currentChat?.thread) {
      // It's a mock chat with pre-filled Ottly dialogue
      setMessages(currentChat.thread);
    }
  }, [activeChatId, conversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeChatId) return;

    const text = inputText.trim();
    setInputText('');

    if (activeChatId.startsWith('chat-mock')) {
      const newMsg = {
        id: `mock-${Date.now()}`,
        senderRole: 'seller',
        text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, newMsg]);
      return;
    }

    try {
      const res = await api.post(`/chats/${activeChatId}/messages`, { text });
      if (res.success && res.data) {
        setMessages((prev) => [...prev, res.data]);
        const socket = getSocket();
        if (socket) {
          socket.emit('chat:message', { chatId: activeChatId, text });
        }
      }
    } catch (err: any) {
      alert(err.message || 'Failed to send message');
    }
  };

  const activeChat = conversations.find((c) => c.id === activeChatId);

  // Filter conversations
  const filteredConversations = conversations.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const otherName = c.otherUser?.fullName?.toLowerCase() || '';
    const platform = (c.purchasedName || c.order?.items?.[0]?.listing?.platform?.name || '').toLowerCase();
    return otherName.includes(q) || platform.includes(q);
  });

  // Extract order specs for top green strip banner
  const primaryItem = activeChat?.order?.items?.[0];
  const platformName =
    activeChat?.purchasedName ||
    primaryItem?.listing?.platform?.name ||
    primaryItem?.listingTitle?.split('-')[0]?.trim() ||
    'YouTube';

  const accountTypeDisplay =
    primaryItem?.listing?.accountType ||
    (primaryItem?.listing?.accessType === 'PRIVATE_ACCOUNT' ? 'Private Account' : 'Private Account');

  const deviceLimitDisplay = primaryItem?.listing?.deviceLimit?.replace(/[^0-9]/g, '') || '1';

  const loginDisplay =
    primaryItem?.listing?.deliveryType ||
    (primaryItem?.listing?.accessType === 'FAMILY_INVITE' ? 'OWN_EMAIL' : 'OWN_EMAIL');

  const purchaseDateDisplay = activeChat?.order?.createdAt
    ? `${new Date(activeChat.order.createdAt).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })} | ${new Date(activeChat.order.createdAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })}`
    : '23-Aug-2026 | 11:07 PM';

  const orderIdDisplay = activeChat?.order?.orderNumber || '20260823';
  const buyerNameDisplay =
    activeChat?.order?.buyer?.fullName || activeChat?.otherUser?.fullName || 'NAME IS PXR';
  const subscriptionNameDisplay = `${platformName} (${primaryItem?.listing?.quality || '4K Video Quality'})`;
  const durationDisplay = `${(primaryItem?.durationMonths || 1) * 30} days`;
  const priceDisplay = `₹ ${Number(activeChat?.order?.totalAmount || primaryItem?.unitPrice || 65).toFixed(2)}`;
  const statusDisplay = activeChat?.order?.status || 'COMPLETED';

  // Navigation Links - Ottly exact style
  const sidebarNavItems = [
    { label: 'Edit Profile', href: '/wallet', active: false },
    { label: 'Order History', href: '/orders', active: false },
    { label: 'Messages', href: '/messages', active: true },
    { label: 'Saved', href: '/browse', active: false },
  ];

  const secondaryNavItems = [
    { label: 'Settings', href: '/wallet' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms & Conditions', href: '/terms' },
    { label: 'Brand Disclaimer', href: '/terms' },
    { label: 'Contact Us', href: '/contact' },
    { label: 'Feedback', href: '/contact' },
  ];

  return (
    <div className="w-full bg-white min-h-[calc(100vh-80px)] flex flex-col font-sans">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 py-5 flex-1 flex flex-col">
        {/* Top Note (Ottly exact) */}
        <div className="mb-4 lg:pl-[200px]">
          <p className="text-[12px] text-gray-500 font-normal leading-relaxed">
            Note: If you purchase multiple subscriptions from the same seller in a single cart, a single chat thread will be created for all those subscriptions.
          </p>
        </div>

        {/* Main 3-Column Layout: Left Nav | Center Chat List | Right Chat Window */}
        <div className="w-full flex-1 flex flex-col lg:flex-row items-stretch">
          {/* Column 1: Account Navigation Sidebar (Ottly Exact) */}
          <div className="hidden lg:block w-[180px] shrink-0 pr-6 space-y-6 pt-1">
            <nav className="space-y-3">
              {sidebarNavItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`block text-[14px] transition-colors ${
                    item.active
                      ? 'text-gray-900 font-bold border-b-2 border-black w-fit pb-0.5'
                      : 'text-gray-700 hover:text-black font-normal'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="pt-2 space-y-2.5">
              <span className="text-[12px] text-gray-400 block pb-1 border-b border-gray-100">Settings</span>
              {secondaryNavItems.slice(1).map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="block text-[13px] text-gray-600 hover:text-black transition-colors"
                >
                  {item.label}
                </Link>
              ))}
              <button
                onClick={() => (user ? logout() : null)}
                className="block text-[13px] text-gray-600 hover:text-red-600 transition-colors text-left pt-1"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Column 2: Conversation List */}
          <div
            className={`w-full lg:w-[320px] shrink-0 border-r border-gray-200 pr-0 lg:pr-3 flex flex-col ${
              activeChatId ? 'hidden lg:flex' : 'flex'
            }`}
          >
            {/* Search Box */}
            <div className="mb-3">
              <input
                type="text"
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-md px-3 py-1.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-gray-500"
              />
            </div>

            {/* Conversation Items */}
            <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
              {isLoadingChats ? (
                <div className="p-8 text-center text-xs text-gray-400">Loading chats...</div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-8 text-center text-xs text-gray-400">
                  {searchQuery ? 'No chats found' : 'No chats yet'}
                </div>
              ) : (
                filteredConversations.map((chat) => {
                  const isSelected = chat.id === activeChatId;
                  const item = chat.order?.items?.[0];
                  const purchasedName =
                    chat.purchasedName ||
                    item?.listing?.platform?.name ||
                    item?.listingTitle?.split('-')[0]?.trim() ||
                    'YouTube';

                  const timeStr =
                    chat.timeStr ||
                    (chat.lastMessage?.createdAt
                      ? new Date(chat.lastMessage.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : '12:10 AM');

                  const timeAgo = chat.timeAgo || '25 days ago';

                  return (
                    <button
                      key={chat.id}
                      onClick={() => setActiveChatId(chat.id)}
                      className={`w-full p-3.5 text-left transition-colors flex flex-col gap-1 rounded-sm ${
                        isSelected ? 'bg-[#e8f7ee]' : 'bg-white hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-[13px] font-bold text-gray-900 uppercase truncate">
                            {chat.otherUser?.fullName || 'NAME IS PXR'}
                          </span>
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#fae8e8] text-[#c9302c] shrink-0">
                            {timeAgo}
                          </span>
                        </div>
                        <span className="text-[11px] text-gray-400 shrink-0">{timeStr}</span>
                      </div>

                      <p className="text-[12px] text-gray-600 truncate mt-0.5 font-normal">
                        {chat.lastMessage?.text || 'Ok'}
                      </p>

                      {/* Subscription Purchased tag - Ottly exact */}
                      <div className="text-[11px] text-gray-500 pt-0.5">
                        Subscription Purchased :{' '}
                        <span className="text-gray-900 font-semibold">{purchasedName}</span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Column 3: Active Chat Window (Mint Green container on right) */}
          <div
            className={`flex-1 flex flex-col min-w-0 pl-0 lg:pl-3 ${
              !activeChatId ? 'hidden lg:flex' : 'flex'
            }`}
          >
            {activeChat ? (
              <div className="flex-1 flex flex-col bg-[#eaf8ef] rounded-lg overflow-hidden min-h-[620px]">
                {/* Top Section with Back Button and White Order Info Card */}
                <div className="p-3 sm:p-4 pb-2">
                  {/* Back button */}
                  <div className="mb-3">
                    <button
                      onClick={() => setActiveChatId(null)}
                      className="px-3 py-1 rounded-md bg-white border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 inline-flex items-center gap-1.5 shadow-2xs"
                    >
                      <ArrowLeft className="w-3 h-3" />
                      <span>Back</span>
                    </button>
                  </div>

                  {/* Horizontal White Order Specs Card (10 Columns exact) */}
                  <div className="bg-white rounded-md p-3.5 shadow-2xs border border-gray-100 overflow-x-auto">
                    <table className="w-full text-left text-xs whitespace-nowrap">
                      <thead>
                        <tr className="text-[11px] text-gray-500 font-normal">
                          <th className="pr-5 pb-1 font-normal">Account Type</th>
                          <th className="pr-5 pb-1 font-normal">Device</th>
                          <th className="pr-5 pb-1 font-normal">Login</th>
                          <th className="pr-5 pb-1 font-normal">Purchased Date</th>
                          <th className="pr-5 pb-1 font-normal">Order ID</th>
                          <th className="pr-5 pb-1 font-normal">Buyer Name</th>
                          <th className="pr-5 pb-1 font-normal">Subscription Name</th>
                          <th className="pr-5 pb-1 font-normal">Duration</th>
                          <th className="pr-5 pb-1 font-normal">Price</th>
                          <th className="pb-1 font-normal">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="text-[12px] text-gray-800 font-medium">
                          <td className="pr-5 pt-1">{accountTypeDisplay}</td>
                          <td className="pr-5 pt-1">{deviceLimitDisplay}</td>
                          <td className="pr-5 pt-1 font-mono text-[11px]">{loginDisplay}</td>
                          <td className="pr-5 pt-1">{purchaseDateDisplay}</td>
                          <td className="pr-5 pt-1 font-mono">{orderIdDisplay}</td>
                          <td className="pr-5 pt-1 uppercase">{buyerNameDisplay}</td>
                          <td className="pr-5 pt-1">{subscriptionNameDisplay}</td>
                          <td className="pr-5 pt-1">{durationDisplay}</td>
                          <td className="pr-5 pt-1 font-semibold">{priceDisplay}</td>
                          <td className="pt-1">
                            <span className="font-semibold text-gray-800 uppercase">
                              {statusDisplay}
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Messages Body */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
                  {messages.map((msg: any) => {
                    const isMe = msg.senderRole === 'seller' || (user && msg.senderId === user.id);
                    const timeLabel =
                      msg.time ||
                      (msg.createdAt
                        ? `${new Date(msg.createdAt).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: '2-digit',
                          })} | ${new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}`
                        : '');

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        {/* If attachment image is present */}
                        {msg.hasAttachment && (
                          <div className="mb-1 p-2 bg-white rounded-lg shadow-2xs border border-gray-200/80 max-w-xs">
                            <div className="w-32 h-20 bg-gray-100 rounded flex flex-col items-center justify-center text-gray-400 text-xs">
                              <ImageIcon className="w-6 h-6 mb-1 text-gray-400" />
                              <span>{msg.attachmentName || 'image'}</span>
                            </div>
                          </div>
                        )}

                        {/* Speech Bubble */}
                        <div
                          className={`max-w-[75%] px-3.5 py-2.5 rounded-lg text-[13px] leading-relaxed shadow-2xs ${
                            isMe
                              ? 'bg-transparent text-gray-900 font-normal text-right'
                              : 'bg-white text-gray-900 rounded-tl-sm'
                          }`}
                        >
                          {msg.text}
                        </div>

                        {timeLabel && (
                          <span className="text-[10px] text-gray-500 mt-1 px-1">
                            {timeLabel}
                          </span>
                        )}
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Bottom Warning Alert (Ottly Exact) */}
                <div className="py-2 px-4 text-center text-[11px] text-gray-600 flex items-center justify-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-gray-500" />
                  <span>
                    <strong className="text-gray-800">WARNING</strong>: Order completed. Do not share subscription credentials.
                  </span>
                </div>

                {/* Message Input Footer (Ottly Exact Pill Container) */}
                <form onSubmit={handleSendMessage} className="p-3 pt-1">
                  <div className="bg-white rounded-xl border border-gray-200/90 shadow-2xs px-3 py-2 flex items-center gap-2">
                    <button
                      type="button"
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Attach image"
                      onClick={() => alert('Attachments are encrypted under escrow guarantee')}
                    >
                      <ImageIcon className="w-5 h-5" />
                    </button>

                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 bg-transparent border-none text-[13px] text-gray-900 placeholder-gray-400 focus:outline-none"
                    />

                    <button
                      type="submit"
                      disabled={!inputText.trim()}
                      className="w-8 h-8 rounded-full bg-black hover:bg-gray-800 text-white flex items-center justify-center disabled:opacity-40 transition-colors shrink-0"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              /* Empty state (Ottly exact text from Screenshot 1) */
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400 text-sm">
                <span>Select a chat to start messaging</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
