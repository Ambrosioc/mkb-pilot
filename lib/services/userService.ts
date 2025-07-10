import { supabase } from '@/lib/supabase';

export interface User {
  id: string;
  auth_user_id: string;
  prenom: string;
  nom: string;
  email: string;
  telephone?: string;
  actif: boolean;
  photo_url?: string;
  date_creation: string;
  role?: {
    id: number;
    nom: string;
    niveau: number;
    description?: string;
  };
  last_login?: string;
  poles?: Array<{
    id: string;
    pole_id: number;
    pole_name: string;
    pole_description: string;
    created_at: string;
  }>;
}

export interface UserStats {
  total: number;
  actifs: number;
  inactifs: number;
  nouveauxCeMois: number;
}

export interface CreateUserData {
  prenom: string;
  nom: string;
  email: string;
  telephone?: string;
  role_id: number;
  password: string;
}

export interface UpdateUserData {
  prenom?: string;
  nom?: string;
  email?: string;
  telephone?: string;
  role_id?: number;
}

export const userService = {
  async fetchUsers(): Promise<User[]> {
    try {
      // Requête optimisée pour récupérer les utilisateurs avec leurs rôles et pôles
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          user_roles(
            role_id,
            date_attribution,
            roles(
              id,
              nom,
              niveau,
              description
            )
          ),
          user_poles:user_poles!user_poles_user_id_fkey(
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
        .order('date_creation', { ascending: false });

      if (error) throw error;

      // Transformer les données pour simplifier la structure
      const transformedUsers: User[] = (data || []).map((user: any) => {
        // Récupérer le rôle depuis la relation user_roles
        let userRole;
        if (Array.isArray(user.user_roles)) {
          userRole = user.user_roles[0];
        } else if (user.user_roles && typeof user.user_roles === 'object') {
          userRole = user.user_roles;
        }
        
        const role = userRole?.roles;

        // Récupérer les pôles depuis la relation user_poles
        const poles = Array.isArray(user.user_poles) 
          ? user.user_poles.map((up: any) => ({
              id: up.id,
              pole_id: up.pole_id,
              pole_name: up.poles.name,
              pole_description: up.poles.description,
              created_at: up.created_at
            }))
          : [];

        return {
          id: user.id,
          auth_user_id: user.auth_user_id,
          prenom: user.prenom,
          nom: user.nom,
          email: user.email,
          telephone: user.telephone,
          actif: user.actif,
          photo_url: user.photo_url,
          date_creation: user.date_creation,
          role: role || null,
          last_login: user.last_login,
          poles: poles
        };
      });

      return transformedUsers;
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      throw error;
    }
  },

  async fetchUserStats(): Promise<UserStats> {
    try {
      // Compter les utilisateurs par statut
      const [
        { count: total },
        { count: actifs },
        { count: inactifs },
        { count: nouveauxCeMois }
      ] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('users').select('*', { count: 'exact', head: true }).eq('actif', true),
        supabase.from('users').select('*', { count: 'exact', head: true }).eq('actif', false),
        supabase.from('users').select('*', { count: 'exact', head: true })
          .gte('date_creation', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
      ]);

      return {
        total: total || 0,
        actifs: actifs || 0,
        inactifs: inactifs || 0,
        nouveauxCeMois: nouveauxCeMois || 0,
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  },

  async getAvailableRoles() {
    try {
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .order('niveau', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des rôles:', error);
      return [];
    }
  },

  async createUser(userData: CreateUserData): Promise<void> {
    try {
      // 1. Créer l'utilisateur dans auth.users
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true,
        user_metadata: {
          prenom: userData.prenom,
          nom: userData.nom,
          telephone: userData.telephone
        }
      });
      if (authError) throw authError;

      // 2. Créer l'utilisateur dans la table users + user_roles via la fonction RPC
      const { error: rpcError } = await supabase.rpc('create_user_with_role', {
        p_auth_user_id: authUser.user.id,
        p_prenom: userData.prenom,
        p_nom: userData.nom,
        p_email: userData.email,
        p_telephone: userData.telephone ?? null,
        p_role_id: userData.role_id
      });
      if (rpcError) throw rpcError;
    } catch (error) {
      console.error('Erreur lors de la création de l\'utilisateur:', error);
      throw error;
    }
  },

  async updateUserStatus(userId: string, actif: boolean): Promise<void> {
    try {
      const { error } = await supabase.rpc('update_user_status', {
        p_user_id: userId,
        p_actif: actif
      });
      if (error) throw error;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      throw error;
    }
  },

  async updateUser(userId: string, userData: UpdateUserData): Promise<void> {
    try {
      const { error } = await supabase.rpc('update_user_info', {
        p_user_id: userId,
        p_prenom: userData.prenom ?? null,
        p_nom: userData.nom ?? null,
        p_email: userData.email ?? null,
        p_telephone: userData.telephone ?? null,
        p_role_id: userData.role_id ?? null
      });
      if (error) throw error;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
      throw error;
    }
  },

  async updateUserRole(userId: string, roleId: number): Promise<void> {
    // Plus utilisé, la gestion du rôle se fait via updateUser
    return;
  },

  async resetUserPassword(userId: string, newPassword: string, resetBy: string): Promise<void> {
    try {
      // Utiliser la route API qui a accès à la clé service role
      const response = await fetch('/api/users/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          newPassword,
          resetBy
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la réinitialisation du mot de passe');
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de la réinitialisation du mot de passe');
      }
    } catch (error) {
      console.error('Erreur lors de la réinitialisation du mot de passe:', error);
      throw error;
    }
  },

  async getUserRole(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          role_id,
          date_attribution,
          roles(
            id,
            nom,
            niveau,
            description
          )
        `)
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return data?.roles || null;
    } catch (error) {
      console.error('Erreur lors de la récupération du rôle:', error);
      return null;
    }
  },

  async getUserById(userId: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          user_roles(
            role_id,
            date_attribution,
            roles(
              id,
              nom,
              niveau,
              description
            )
          )
        `)
        .eq('id', userId)
        .single();

      if (error) throw error;

      if (!data) return null;

      // Transformer les données comme dans fetchUsers
      let userRole;
      if (Array.isArray(data.user_roles)) {
        userRole = data.user_roles[0];
      } else if (data.user_roles && typeof data.user_roles === 'object') {
        userRole = data.user_roles;
      }
      
      const role = userRole?.roles;

      return {
        id: data.id,
        auth_user_id: data.auth_user_id,
        prenom: data.prenom,
        nom: data.nom,
        email: data.email,
        telephone: data.telephone,
        actif: data.actif,
        photo_url: data.photo_url,
        date_creation: data.date_creation,
        role: role || null,
        last_login: data.last_login
      };
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      throw error;
    }
  }
}; 