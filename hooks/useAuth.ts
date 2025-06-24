import { useAuthStore } from '@/store/useAuth';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

export function useAuth() {
  const {
    user,
    loading,
    initialized,
    signUp,
    signIn,
    signOut,
    initialize
  } = useAuthStore();
  
  const router = useRouter();

  const login = useCallback(async (email: string, password: string) => {
    const { error } = await signIn(email, password);
    if (!error) {
      router.push('/dashboard');
    }
    return { error };
  }, [signIn, router]);

  const register = useCallback(async (email: string, password: string, firstName: string, lastName: string) => {
    const { error } = await signUp(email, password, firstName, lastName);
    if (!error) {
      router.push('/dashboard');
    }
    return { error };
  }, [signUp, router]);

  const logout = useCallback(async () => {
    await signOut();
    router.push('/login');
  }, [signOut, router]);

  const isAuthenticated = !!user;
  const isAdmin = user?.user_metadata?.role === 'admin';
  const isManager = user?.user_metadata?.role === 'manager';

  const getFullName = useCallback(() => {
    if (!user) return '';
    const firstName = user.first_name || '';
    const lastName = user.last_name || '';
    return `${firstName} ${lastName}`.trim();
  }, [user]);

  return {
    user,
    loading,
    initialized,
    isAuthenticated,
    isAdmin,
    isManager,
    login,
    register,
    logout,
    initialize,
    getFullName
  };
} 