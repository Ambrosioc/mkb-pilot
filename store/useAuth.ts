'use client';

import { supabase } from '@/lib/supabase';
import type { User } from '@/types';
import { AuthError } from '@supabase/supabase-js';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<{ error: AuthError | null }>;
  updateProfilePhoto: (photoUrl: string) => Promise<void>;
  refreshUserData: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      loading: false,
      initialized: false,

      signUp: async (email: string, password: string, firstName: string, lastName: string) => {
        set({ loading: true });
        
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: `${firstName} ${lastName}`,
                role: 'user',
              }
            }
          });

          if (error) {
            set({ loading: false });
            return { error };
          }

          if (data.user) {
            // Utiliser la fonction RPC pour créer le profil utilisateur
            const { error: userError } = await supabase
              .rpc('create_user_profile', {
                auth_user_id: data.user.id,
                prenom: firstName,
                nom: lastName,
                email: data.user.email!
              });

            if (userError) {
              console.error('Erreur lors de la création du profil utilisateur:', userError);
            }

            const user: User = {
              id: data.user.id,
              email: data.user.email!,
              first_name: firstName,
              last_name: lastName,
              photo_url: data.user.user_metadata?.avatar_url,
              created_at: data.user.created_at,
              updated_at: data.user.updated_at || data.user.created_at,
            };
            set({ user, loading: false });
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

          if (data.user) {
            // Try to get user profile data, handle missing columns gracefully
            let userData = null;
            try {
              const { data: userDataResult, error: userError } = await supabase
                .from('users')
                .select('prenom, nom, email, photo_url')
                .eq('auth_user_id', data.user.id)
                .single();

              if (userError) {
                console.error('Erreur lors de la récupération du profil utilisateur:', userError);
                // If the error is about missing column, try without photo_url
                if (userError.message?.includes('photo_url') || userError.code === '42703') {
                  const { data: fallbackData, error: fallbackError } = await supabase
                    .from('users')
                    .select('prenom, nom, email')
                    .eq('auth_user_id', data.user.id)
                    .single();
                  
                  if (!fallbackError) {
                    userData = fallbackData;
                  }
                }
              } else {
                userData = userDataResult;
              }
            } catch (err) {
              console.error('Erreur lors de la récupération du profil utilisateur:', err);
            }

            const user: User = {
              id: data.user.id,
              email: data.user.email!,
              first_name: userData?.prenom || '',
              last_name: userData?.nom || '',
              photo_url: (userData as any)?.photo_url || data.user.user_metadata?.avatar_url,
              created_at: data.user.created_at,
              updated_at: data.user.updated_at || data.user.created_at,
            };
            set({ user, loading: false });
          }

          return { error: null };
        } catch (error) {
          set({ loading: false });
          return { error: error as AuthError };
        }
      },

      signOut: async () => {
        set({ loading: true });
        try {
          await supabase.auth.signOut();
          set({ user: null, loading: false });
        } catch (error) {
          console.error('Erreur lors de la déconnexion:', error);
          set({ loading: false });
        }
      },

      updateProfile: async (updates: Partial<User>) => {
        const { user } = get();
        if (!user) return { error: { message: 'Utilisateur non connecté' } as AuthError };

        set({ loading: true });
        
        try {
          const { data, error } = await supabase.auth.updateUser({
            data: updates
          });

          if (error) {
            set({ loading: false });
            return { error };
          }

          if (data.user) {
            const updatedUser: User = {
              ...user,
              ...updates,
              updated_at: new Date().toISOString(),
            };
            set({ user: updatedUser, loading: false });
          }

          return { error: null };
        } catch (error) {
          set({ loading: false });
          return { error: error as AuthError };
        }
      },

      updateProfilePhoto: async (photoUrl: string) => {
        const { user } = get();
        if (!user) return;

        set({ loading: true });
        
        try {
          const { data, error } = await supabase.auth.updateUser({
            data: {
              photo_url: photoUrl
            }
          });

          if (error) {
            set({ loading: false });
            return;
          }

          if (data.user) {
            const updatedUser: User = {
              ...user,
              photo_url: photoUrl,
              updated_at: new Date().toISOString(),
            };
            set({ user: updatedUser, loading: false });
          }
        } catch (error) {
          set({ loading: false });
        }
      },

      refreshUserData: async () => {
        const { user } = get();
        if (!user) return;

        set({ loading: true });
        
        try {
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session?.user) {
            // Try to get user profile data, handle missing columns gracefully
            let userData = null;
            try {
              const { data: userDataResult, error: userError } = await supabase
                .from('users')
                .select('prenom, nom, email, photo_url')
                .eq('auth_user_id', session.user.id)
                .single();

              if (userError) {
                console.error('Erreur lors de la récupération du profil utilisateur:', userError);
                // If the error is about missing column, try without photo_url
                if (userError.message?.includes('photo_url') || userError.code === '42703') {
                  const { data: fallbackData, error: fallbackError } = await supabase
                    .from('users')
                    .select('prenom, nom, email')
                    .eq('auth_user_id', session.user.id)
                    .single();
                  
                  if (!fallbackError) {
                    userData = fallbackData;
                  }
                }
              } else {
                userData = userDataResult;
              }
            } catch (err) {
              console.error('Erreur lors de la récupération du profil utilisateur:', err);
            }

            const user: User = {
              id: session.user.id,
              email: session.user.email!,
              first_name: userData?.prenom || '',
              last_name: userData?.nom || '',
              photo_url: (userData as any)?.photo_url || session.user.user_metadata?.avatar_url,
              created_at: session.user.created_at,
              updated_at: session.user.updated_at || session.user.created_at,
            };
            set({ user });
          } else {
            set({ user: null });
          }
        } catch (error) {
          console.error('Erreur lors de la mise à jour des données utilisateur:', error);
        } finally {
          set({ loading: false });
        }
      },

      initialize: async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session?.user) {
            // Try to get user profile data, handle missing columns gracefully
            let userData = null;
            try {
              const { data: userDataResult, error: userError } = await supabase
                .from('users')
                .select('prenom, nom, email, photo_url')
                .eq('auth_user_id', session.user.id)
                .single();

              if (userError) {
                console.error('Erreur lors de la récupération du profil utilisateur:', userError);
                // If the error is about missing column, try without photo_url
                if (userError.message?.includes('photo_url') || userError.code === '42703') {
                  const { data: fallbackData, error: fallbackError } = await supabase
                    .from('users')
                    .select('prenom, nom, email')
                    .eq('auth_user_id', session.user.id)
                    .single();
                  
                  if (!fallbackError) {
                    userData = fallbackData;
                  }
                }
              } else {
                userData = userDataResult;
              }
            } catch (err) {
              console.error('Erreur lors de la récupération du profil utilisateur:', err);
            }

            const user: User = {
              id: session.user.id,
              email: session.user.email!,
              first_name: userData?.prenom || '',
              last_name: userData?.nom || '',
              photo_url: (userData as any)?.photo_url || session.user.user_metadata?.avatar_url,
              created_at: session.user.created_at,
              updated_at: session.user.updated_at || session.user.created_at,
            };
            set({ user, initialized: true });
          } else {
            set({ user: null, initialized: true });
          }

          supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
              // Try to get user profile data, handle missing columns gracefully
              let userData = null;
              try {
                const { data: userDataResult, error: userError } = await supabase
                  .from('users')
                  .select('prenom, nom, email, photo_url')
                  .eq('auth_user_id', session.user.id)
                  .single();

                if (userError) {
                  console.error('Erreur lors de la récupération du profil utilisateur:', userError);
                  // If the error is about missing column, try without photo_url
                  if (userError.message?.includes('photo_url') || userError.code === '42703') {
                    const { data: fallbackData, error: fallbackError } = await supabase
                      .from('users')
                      .select('prenom, nom, email')
                      .eq('auth_user_id', session.user.id)
                      .single();
                    
                    if (!fallbackError) {
                      userData = fallbackData;
                    }
                  }
                } else {
                  userData = userDataResult;
                }
              } catch (err) {
                console.error('Erreur lors de la récupération du profil utilisateur:', err);
              }

              const user: User = {
                id: session.user.id,
                email: session.user.email!,
                first_name: userData?.prenom || '',
                last_name: userData?.nom || '',
                photo_url: (userData as any)?.photo_url || session.user.user_metadata?.avatar_url,
                created_at: session.user.created_at,
                updated_at: session.user.updated_at || session.user.created_at,
              };
              set({ user });
            } else {
              set({ user: null });
            }
          });
        } catch (error) {
          console.error('Erreur lors de l\'initialisation:', error);
          set({ user: null, initialized: true });
        }
      },
    }),
    {
      name: 'mkb-auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user }),
    }
  )
);