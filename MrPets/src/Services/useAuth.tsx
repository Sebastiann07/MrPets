import React, { createContext, useContext, useMemo, useState } from 'react';
import { Cliente } from '../Models/models';
import { authService } from './authService';
import { assertSupabaseConfigured } from './supabaseClient';

type AuthContextValue = {
  profile: Cliente | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (correo: string, password: string) => Promise<void>;
  register: (nombre: string, correo: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Cliente | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function login(correo: string, password: string) {
    assertSupabaseConfigured();
    setIsLoading(true);
    try {
      const data = await authService.login(correo, password);
      setProfile(data);
    } finally {
      setIsLoading(false);
    }
  }

  async function register(nombre: string, correo: string, password: string) {
    assertSupabaseConfigured();
    setIsLoading(true);
    try {
      const data = await authService.register(nombre, correo, password);
      setProfile(data);
    } finally {
      setIsLoading(false);
    }
  }

  async function logout() {
    await authService.logout();
    setProfile(null);
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      profile,
      isLoading,
      isAuthenticated: Boolean(profile),
      login,
      register,
      logout,
    }),
    [isLoading, profile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}
