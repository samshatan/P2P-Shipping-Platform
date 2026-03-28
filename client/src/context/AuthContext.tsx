import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getUserProfile } from '@/lib/api';

export interface User {
  name: string;
  phone: string;
  email: string;
  wallet: number;
  shipments: number;
  moneySaved: number;
  referrals: number;
  kycVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, userData?: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('access_token'));
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = (newToken: string, userData?: User) => {
    localStorage.setItem('access_token', newToken);
    setToken(newToken);
    if (userData) setUser(userData);
  };

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    async function initAuth() {
      if (token) {
        try {
          const profile = await getUserProfile();
          setUser(profile);
        } catch (error) {
          console.error("Failed to restore session", error);
          logout(); // Clear invalid token
        }
      }
      setIsLoading(false);
    }
    initAuth();
  }, [token, logout]);

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
