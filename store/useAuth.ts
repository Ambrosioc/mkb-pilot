'use client';

import { supabase } from '@/lib/supabase';
import { AuthError, User } from '@supabase/supabase-js';
import React, { useEffect } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      loading: false,
      initialized: false,

      signUp: async (email: string, password: string, fullName: string) => {
        set({ loading: true });
        
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: fullName,
              }
            }
          });

          if (error) {
            set({ loading: false });
            return { error };
          }

          if (data.user) {
            set({ user: data.user, loading: false });
          }

          return { error: null };
        } catch (error) {
          set({ loading: false });
          return { error: error as AuthError };
        }
      },

      signIn: async (email: string, password: string) => {
        set({ loading: true });
        
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) {
            set({ loading: false });
            return { error };
          }

          set({ user: data.user, loading: false });
          return { error: null };
        } catch (error) {
          set({ loading: false });
          return { error: error as AuthError };
        }
      },

      signOut: async () => {
        set({ loading: true });
        await supabase.auth.signOut();
        set({ user: null, loading: false });
      },

      initialize: async () => {
        const { data: { session } } = await supabase.auth.getSession();
        set({ user: session?.user ?? null, initialized: true });

        supabase.auth.onAuthStateChange((event, session) => {
          set({ user: session?.user ?? null });
        });
      },
    }),
    {
      name: 'mkb-auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user }),
    }
  )
);

// Provider Component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore((state) => state.initialize);
  const initialized = useAuthStore((state) => state.initialized);

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (!initialized) {
    return React.createElement(
      'div',
      { className: 'min-h-screen bg-white flex items-center justify-center' },
      React.createElement('div', {
        className: 'animate-spin rounded-full h-32 w-32 border-b-2 border-mkb-blue'
      })
    );
  }

  return React.createElement(React.Fragment, null, children);
}