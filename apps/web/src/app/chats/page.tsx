'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { getSocket } from '@/lib/socket';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { MessageSquare, Send, User, ShoppingBag, ShieldCheck, CheckCheck } from 'lucide-react';

export default function ChatsPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchConversations = async () => {
    try {
      const res = await api.get('/chats');
      if (res.success && res.data) {
        setConversations(res.data);
        if (res.data.length > 0 && !activeChatId) {
          setActiveChatId(res.data[0].id);
        }
      }
    } catch {
      // ignore
    } finally {
      setIsLoadingChats(false);
    }
  };

  const fetchMessages = async (chatId: string) => {
    setIsLoadingMessages(true);
    try {
      const res = await api.get(`/chats/${chatId}/messages`);
      if (res.success && res.data) {
        setMessages(res.data);
      }
    } catch {
      // ignore
    } finally {
      setIsLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  useEffect(() => {
    if (activeChatId) {
      fetchMessages(activeChatId);

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
    }
  }, [activeChatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeChatId) return;

    const text = inputText.trim();
    setInputText('');

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

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-white">Please log in to access messages</h2>
        <Link href="/login" className="mt-4 inline-block px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold">
          Log In
        </Link>
      </div>
    );
  }

  const activeChat = conversations.find((c) => c.id === activeChatId);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Messages & Support</h1>
        <p className="text-xs text-slate-400 mt-1">
          Direct, encrypted communication between buyers and verified sellers for order fulfillment.
        </p>
      </div>

      <div className="flex-1 min-h-[550px] glass-panel rounded-3xl border border-surface-300/40 overflow-hidden flex flex-col md:flex-row shadow-2xl">
        {/* Left Conversation List */}
        <div className="w-full md:w-80 border-r border-surface-300/40 bg-surface-50/50 flex flex-col">
          <div className="p-4 border-b border-surface-300/40">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Conversations ({conversations.length})
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-surface-300/20">
            {isLoadingChats ? (
              <div className="p-8 text-center text-xs text-slate-400">Loading chats...</div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No active conversations yet. Once an order is placed, a chat thread is automatically initiated!
              </div>
            ) : (
              conversations.map((chat) => {
                const isSelected = chat.id === activeChatId;
                return (
                  <button
                    key={chat.id}
                    onClick={() => setActiveChatId(chat.id)}
                    className={`w-full p-4 text-left transition-colors flex items-start gap-3 ${
                      isSelected
                        ? 'bg-surface-200/80 border-l-4 border-brand-500'
                        : 'hover:bg-surface-100/50'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center font-bold text-white shrink-0">
                      {chat.otherUser?.fullName?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white truncate">
                          {chat.otherUser?.fullName || 'User'}
                        </span>
                        {chat.unreadCount > 0 && (
                          <span className="w-4 h-4 rounded-full bg-brand-500 text-white text-[10px] font-bold flex items-center justify-center">
                            {chat.unreadCount}
                          </span>
                        )}
                      </div>
                      {chat.order && (
                        <div className="text-[10px] text-brand-300 font-mono mt-0.5">
                          Order #{chat.order.orderNumber}
                        </div>
                      )}
                      <p className="text-xs text-slate-400 truncate mt-1">
                        {chat.lastMessage?.text || 'No messages yet'}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Message Stream */}
        <div className="flex-1 flex flex-col bg-surface-100/30">
          {activeChat ? (
            <>
              {/* Active Chat Header */}
              <div className="p-4 border-b border-surface-300/40 bg-surface-50/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-brand-700 flex items-center justify-center font-bold text-white text-xs">
                    {activeChat.otherUser?.fullName?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      {activeChat.otherUser?.fullName}
                      <span className="text-[10px] font-normal px-1.5 py-0.2 rounded bg-surface-200 text-slate-300">
                        {activeChat.otherUser?.role}
                      </span>
                    </h4>
                    {activeChat.order && (
                      <span className="text-[11px] text-slate-400">
                        Linked Order #{activeChat.order.orderNumber} ({formatCurrency(activeChat.order.totalAmount)})
                      </span>
                    )}
                  </div>
                </div>

                {activeChat.order && (
                  <Link
                    href={`/orders`}
                    className="px-3 py-1.5 rounded-lg bg-surface-200 hover:bg-surface-300 text-xs text-slate-200 font-medium"
                  >
                    View Order
                  </Link>
                )}
              </div>

              {/* Messages Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-3">
                {isLoadingMessages ? (
                  <div className="py-20 text-center text-xs text-slate-400">Loading messages...</div>
                ) : messages.length === 0 ? (
                  <div className="py-20 text-center text-xs text-slate-400">
                    No messages yet. Say hello!
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.senderId === user.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed ${
                            isMe
                              ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white rounded-br-none shadow-md'
                              : 'bg-surface-200 text-slate-200 rounded-bl-none border border-surface-300/40'
                          }`}
                        >
                          {msg.text}
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1 px-1">
                          {formatDateTime(msg.createdAt)}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Footer */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-surface-300/40 bg-surface-50/80 flex items-center gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 bg-surface-100 border border-surface-300/60 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-brand-500"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="p-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white disabled:opacity-40 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 text-xs">
              <MessageSquare className="w-12 h-12 text-slate-400 mb-2" />
              <span>Select a conversation from the left to start chatting</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
