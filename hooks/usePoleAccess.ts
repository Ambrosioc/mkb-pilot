import { useAuth } from '@/hooks/useAuth';
import { PoleAccess, PoleAccessResponse, getPoleAccess } from '@/lib/auth/poleAccess';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

export function usePoleAccess(poleName: string) {
  const { user } = useAuth();
  const [access, setAccess] = useState<PoleAccess>({ 
    canRead: false, 
    canWrite: false, 
    canManage: false 
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAccess = async () => {
      if (!user?.id) {
        setAccess({ canRead: false, canWrite: false, canManage: false });
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        
        if (!token) {
          throw new Error('Token d\'authentification manquant');
        }
        
        const res = await fetch(`/api/poles/access?pole=${encodeURIComponent(poleName)}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!res.ok) {
          throw new Error('Erreur lors de la récupération des accès');
        }
        
        const data: PoleAccessResponse = await res.json();
        
        if (data.role_level) {
          setAccess(getPoleAccess(data.role_level));
        } else {
          setAccess({ canRead: false, canWrite: false, canManage: false });
        }
      } catch (err) {
        console.error('Erreur usePoleAccess:', err);
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
        setAccess({ canRead: false, canWrite: false, canManage: false });
      } finally {
        setLoading(false);
      }
    };

    fetchAccess();
  }, [user?.id, poleName]);

  return {
    ...access,
    loading,
    error,
    hasAccess: access.canRead,
    canRead: access.canRead,
    canWrite: access.canWrite,
    canManage: access.canManage,
  };
}

// Hook pour obtenir tous les pôles d'un utilisateur
export function useUserPoles() {
  const { user } = useAuth();
  const [poles, setPoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserPoles = async () => {
      if (!user?.id) {
        setPoles([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        
        if (!token) {
          throw new Error('Token d\'authentification manquant');
        }
        
        const res = await fetch('/api/poles/user-poles', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!res.ok) {
          throw new Error('Erreur lors de la récupération des pôles');
        }
        
        const data = await res.json();
        setPoles(data.poles || []);
      } catch (err) {
        console.error('Erreur useUserPoles:', err);
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
        setPoles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserPoles();
  }, [user?.id]);

  return {
    poles,
    loading,
    error,
  };
} 