import { supabase } from '@/lib/supabase';

export interface Role {
  id: number;
  nom: string;
  niveau: number;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateRoleData {
  nom: string;
  niveau: number;
  description?: string;
}

export interface UpdateRoleData {
  nom?: string;
  niveau?: number;
  description?: string;
}

export interface RoleStats {
  total: number;
  actifs: number;
  inactifs: number;
  utilisateursParRole: Array<{
    role_id: number;
    role_nom: string;
    user_count: number;
  }>;
}

export const roleService = {
  // Récupérer tous les rôles
  async fetchRoles(): Promise<Role[]> {
    try {
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .order('niveau', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des rôles:', error);
      throw error;
    }
  },

  // Récupérer un rôle par ID
  async fetchRoleById(id: number): Promise<Role | null> {
    try {
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération du rôle:', error);
      throw error;
    }
  },

  // Créer un nouveau rôle
  async createRole(roleData: CreateRoleData): Promise<Role> {
    try {
      const { data, error } = await supabase
        .from('roles')
        .insert({
          nom: roleData.nom,
          niveau: roleData.niveau,
          description: roleData.description || null
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur lors de la création du rôle:', error);
      throw error;
    }
  },

  // Mettre à jour un rôle
  async updateRole(id: number, roleData: UpdateRoleData): Promise<Role> {
    try {
      const { data, error } = await supabase
        .from('roles')
        .update({
          nom: roleData.nom,
          niveau: roleData.niveau,
          description: roleData.description,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du rôle:', error);
      throw error;
    }
  },

  // Supprimer un rôle
  async deleteRole(id: number): Promise<void> {
    try {
      // Vérifier s'il y a des utilisateurs avec ce rôle
      const { data: usersWithRole, error: checkError } = await supabase
        .from('user_roles')
        .select('id')
        .eq('role_id', id);

      if (checkError) throw checkError;

      if (usersWithRole && usersWithRole.length > 0) {
        throw new Error(`Impossible de supprimer ce rôle car ${usersWithRole.length} utilisateur(s) l'utilisent encore`);
      }

      const { error } = await supabase
        .from('roles')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Erreur lors de la suppression du rôle:', error);
      throw error;
    }
  },

  // Récupérer les statistiques des rôles
  async fetchRoleStats(): Promise<RoleStats> {
    try {
      // Compter les rôles
      const { count: total } = await supabase
        .from('roles')
        .select('*', { count: 'exact', head: true });

      // Compter les utilisateurs par rôle
      const { data: userCounts, error: userCountsError } = await supabase
        .from('user_roles')
        .select(`
          role_id,
          roles (
            nom
          )
        `);

      if (userCountsError) throw userCountsError;

      // Grouper par rôle
      const roleCounts = userCounts?.reduce((acc: any, item: any) => {
        const roleId = item.role_id;
        if (!acc[roleId]) {
          acc[roleId] = {
            role_id: roleId,
            role_nom: item.roles?.nom || 'Inconnu',
            user_count: 0
          };
        }
        acc[roleId].user_count++;
        return acc;
      }, {});

      const utilisateursParRole = Object.values(roleCounts || {}) as Array<{
        role_id: number;
        role_nom: string;
        user_count: number;
      }>;

      return {
        total: total || 0,
        actifs: total || 0, // Tous les rôles sont actifs
        inactifs: 0,
        utilisateursParRole
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  },

  // Vérifier si un nom de rôle existe déjà
  async checkRoleNameExists(nom: string, excludeId?: number): Promise<boolean> {
    try {
      let query = supabase
        .from('roles')
        .select('id')
        .eq('nom', nom);

      if (excludeId) {
        query = query.neq('id', excludeId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []).length > 0;
    } catch (error) {
      console.error('Erreur lors de la vérification du nom de rôle:', error);
      throw error;
    }
  }
}; 