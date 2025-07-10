import { supabase } from '@/lib/supabase';
import { notificationService } from './notificationService';

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
          poles(
            id,
            name,
            description
          )
        `)
        .eq('user_id', userId);

      if (error) throw error;

      return (data || []).map((item: any) => ({
        id: item.id,
        user_id: item.user_id,
        pole_id: item.pole_id,
        pole_name: item.poles.name,
        pole_description: item.poles.description,
        created_at: item.created_at
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des pôles utilisateur:', error);
      throw error;
    }
  },

  // Attribuer un pôle à un utilisateur
  async assignPoleToUser(userId: string, poleId: number, adminName?: string): Promise<void> {
    try {
      // Vérifier si l'accès existe déjà
      const { data: existing } = await supabase
        .from('user_poles')
        .select('id')
        .eq('user_id', userId)
        .eq('pole_id', poleId)
        .single();

      if (existing) {
        throw new Error('L\'utilisateur a déjà accès à ce pôle');
      }

      // Récupérer le nom du pôle pour la notification
      const { data: pole } = await supabase
        .from('poles')
        .select('name')
        .eq('id', poleId)
        .single();

      if (!pole) {
        throw new Error('Pôle non trouvé');
      }

      // Attribuer le pôle
      const { error } = await supabase
        .from('user_poles')
        .insert({
          user_id: userId,
          pole_id: poleId
        });

      if (error) throw error;

      // Envoyer une notification
      if (adminName) {
        try {
          await notificationService.notifyPoleAccess(userId, pole.name, adminName);
        } catch (notificationError) {
          console.warn('Erreur lors de l\'envoi de la notification:', notificationError);
        }
      }
    } catch (error) {
      console.error('Erreur lors de l\'attribution du pôle:', error);
      throw error;
    }
  },

  // Retirer un pôle d'un utilisateur
  async removePoleFromUser(userId: string, poleId: number, adminName?: string): Promise<void> {
    try {
      // Récupérer le nom du pôle pour la notification
      const { data: pole } = await supabase
        .from('poles')
        .select('name')
        .eq('id', poleId)
        .single();

      if (!pole) {
        throw new Error('Pôle non trouvé');
      }

      // Retirer le pôle
      const { error } = await supabase
        .from('user_poles')
        .delete()
        .eq('user_id', userId)
        .eq('pole_id', poleId);

      if (error) throw error;

      // Envoyer une notification
      if (adminName) {
        try {
          await notificationService.notifyPoleRemoval(userId, pole.name, adminName);
        } catch (notificationError) {
          console.warn('Erreur lors de l\'envoi de la notification:', notificationError);
        }
      }
    } catch (error) {
      console.error('Erreur lors du retrait du pôle:', error);
      throw error;
    }
  },

  // Récupérer tous les utilisateurs avec leurs pôles
  async fetchUsersWithPoles(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          id,
          prenom,
          nom,
          email,
          actif,
          user_poles(
            id,
            pole_id,
            created_at,
            poles(
              id,
              name,
              description
            )
          )
        `)
        .order('prenom');

      if (error) throw error;

      return (data || []).map((user: any) => ({
        id: user.id,
        prenom: user.prenom,
        nom: user.nom,
        email: user.email,
        actif: user.actif,
        poles: Array.isArray(user.user_poles) 
          ? user.user_poles.map((up: any) => ({
              id: up.id,
              pole_id: up.pole_id,
              pole_name: up.poles.name,
              pole_description: up.poles.description,
              created_at: up.created_at
            }))
          : []
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs avec pôles:', error);
      throw error;
    }
  }
}; 