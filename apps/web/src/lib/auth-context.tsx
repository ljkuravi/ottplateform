'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from './api';
import { disconnectSocket, getSocket } from './socket';

interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'USER' | 'SELLER' | 'ADMIN' | 'SUPER_ADMIN';
  phone?: string;
  avatarUrl?: string;
}

interface Wallet {
  id: string;
  balance: number;
  pendingBalance: number;
  totalAdded: number;
  totalSpent: number;
}

interface SellerProfile {
  id: string;
  displayName: string;
  rating: number;
  isVerified: boolean;
  status: string;
}

interface AuthContextType {
  user: User | null;
  wallet: Wallet | null;
  sellerProfile: SellerProfile | null;
  sellerApplication: any | null;
  isLoading: boolean;
  unreadCount: number;
  cartCount: number;
  login: (tokens: { accessToken: string; refreshToken: string }, user: User) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  isSeller: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  wallet: null,
  sellerProfile: null,
  sellerApplication: null,
  isLoading: true,
  unreadCount: 0,
  cartCount: 0,
  login: async () => {},
  logout: () => {},
  refreshProfile: async () => {},
  isSeller: false,
  isAdmin: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [sellerProfile, setSellerProfile] = useState<SellerProfile | null>(null);
  const [sellerApplication, setSellerApplication] = useState<any | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [cartCount, setCartCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshProfile = async () => {
    const token = localStorage.getItem('subvault_access_token');
    if (!token) {
      setUser(null);
      setWallet(null);
      setSellerProfile(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await api.get('/auth/me');
      if (res.success && res.data) {
        setUser(res.data.user);
        setWallet(res.data.wallet);
        setSellerProfile(res.data.sellerProfile);
        setSellerApplication(res.data.sellerApplication);
        setUnreadCount(res.data.unreadNotificationCount || 0);
        setCartCount(res.data.cartItemCount || 0);

        // Connect socket
        getSocket();
      }
    } catch {
      // If token expired, clear
      localStorage.removeItem('subvault_access_token');
      localStorage.removeItem('subvault_refresh_token');
      setUser(null);
      setWallet(null);
      setSellerProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshProfile();
  }, []);

  const login = async (tokens: { accessToken: string; refreshToken: string }, userData: User) => {
    localStorage.setItem('subvault_access_token', tokens.accessToken);
    localStorage.setItem('subvault_refresh_token', tokens.refreshToken);
    setUser(userData);
    await refreshProfile();
  };

  const logout = () => {
    disconnectSocket();
    localStorage.removeItem('subvault_access_token');
    localStorage.removeItem('subvault_refresh_token');
    setUser(null);
    setWallet(null);
    setSellerProfile(null);
    setSellerApplication(null);
    window.location.href = '/';
  };

  const isSeller = user?.role === 'SELLER' || user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        wallet,
        sellerProfile,
        sellerApplication,
        isLoading,
        unreadCount,
        cartCount,
        login,
        logout,
        refreshProfile,
        isSeller,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
