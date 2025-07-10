import { supabase } from '@/lib/supabase';

export interface Pole {
  id: number;
  name: string;
  description: string;
  created_at: string;
}

export interface UserPole {
  id: string;
  user_id: string;
  pole_id: number;
  pole_name: string;
  pole_description: string;
  created_at: string;
}

export interface AssignPoleData {
  user_id: string;
  pole_id: number;
}

export const poleService = {
  // Récupérer tous les pôles
  async fetchPoles(): Promise<Pole[]> {
    try {
      const { data, error } = await supabase
        .from('poles')
        .select('*')
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des pôles:', error);
      throw error;
    }
  },

  // Récupérer les pôles d'un utilisateur
  async fetchUserPoles(userId: string): Promise<UserPole[]> {
    try {
      const { data, error } = await supabase
        .from('user_poles')
        .select(`
          id,
          user_id,
          pole_id,
          created_at,
          poles (
            id,
            name,
            description
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transformer les données
      const transformedPoles: UserPole[] = (data || []).map((item: any) => ({
        id: item.id,
        user_id: item.user_id,
        pole_id: item.pole_id,
        pole_name: item.poles.name,
        pole_description: item.poles.description,
        created_at: item.created_at
      }));

      return transformedPoles;
    } catch (error) {
      console.error('Erreur lors de la récupération des pôles utilisateur:', error);
      throw error;
    }
  },

  // Assigner un pôle à un utilisateur
  async assignPoleToUser(assignData: AssignPoleData): Promise<void> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      const response = await fetch('/api/poles/assign', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(assignData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de l\'assignation du pôle');
      }
    } catch (error) {
      console.error('Erreur lors de l\'affectation du pôle:', error);
      throw error;
    }
  },

  // Retirer un pôle d'un utilisateur
  async removePoleFromUser(userId: string, poleId: number): Promise<void> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      const response = await fetch('/api/poles/assign', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: userId,
          pole_id: poleId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la suppression de l\'affectation');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'affectation:', error);
      throw error;
    }
  },

  // Vérifier si un utilisateur a accès à un pôle
  async hasPoleAccess(userId: string, poleName: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .rpc('has_pole_access', {
          p_user_id: userId,
          p_pole_name: poleName
        });

      if (error) throw error;
      return data || false;
    } catch (error) {
      console.error('Erreur lors de la vérification d\'accès:', error);
      return false;
    }
  },

  // Obtenir les permissions d'un utilisateur pour un pôle
  async getUserPoleAccess(userId: string, poleName: string) {
    try {
      const { data, error } = await supabase
        .rpc('get_user_pole_access', {
          p_user_id: userId,
          p_pole_name: poleName
        });

      if (error) throw error;
      return data?.[0] || null;
    } catch (error) {
      console.error('Erreur lors de la récupération des permissions:', error);
      return null;
    }
  }
}; 