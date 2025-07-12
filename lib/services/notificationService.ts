import { supabase } from '@/lib/supabase';

export interface Notification {
  id: string;
  recipient_id: string;
  sender_id: string | null;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: 'system' | 'user' | 'commercial' | 'technique';
  read: boolean;
  created_at: string;
  updated_at: string;
  sender?: {
    id: string;
    prenom: string;
    nom: string;
    email: string;
  };
}

class NotificationService {
  // Obtenir le token d'authentification
  private async getAuthToken(): Promise<string | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session?.access_token || null;
    } catch (error) {
      console.error('Erreur lors de la récupération du token d\'authentification:', error);
      return null;
    }
  }

  // Récupérer les notifications d'un utilisateur
  async fetchNotifications(limit: number = 50, offset: number = 0): Promise<Notification[]> {
    try {
      const token = await this.getAuthToken();
      
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      const response = await fetch(`/api/notifications?limit=${limit}&offset=${offset}`, {
        method: 'GET',
        credentials: 'include',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
        
      const data = await response.json();
      return data.notifications || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications:', error);
      throw error;
    }
  }

  // Créer une nouvelle notification
  async createNotification(notification: {
    recipient_user_id: string;
    title: string;
    message: string;
    type: Notification['type'];
    category?: Notification['category'];
  }): Promise<{ success: boolean; notification_id: string; message: string }> {
    try {
      const token = await this.getAuthToken();
      
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      const response = await fetch('/api/notifications', {
        method: 'POST',
        credentials: 'include',
        headers,
        body: JSON.stringify(notification),
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erreur lors de la création de la notification:', error);
      throw error;
    }
  }

  // Marquer une notification comme lue
  async markAsRead(notificationId: string): Promise<Notification> {
    try {
      const token = await this.getAuthToken();
      
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      return data.notification;
    } catch (error) {
      console.error('Erreur lors du marquage comme lu:', error);
      throw error;
    }
  }

  // Marquer toutes les notifications comme lues
  async markAllAsRead(): Promise<void> {
    try {
      const token = await this.getAuthToken();
      
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
        credentials: 'include',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
    } catch (error) {
      console.error('Erreur lors du marquage de toutes les notifications:', error);
      throw error;
    }
  }

  // Supprimer une notification
  async deleteNotification(notificationId: string): Promise<void> {
    try {
      const token = await this.getAuthToken();
      
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de la notification:', error);
      throw error;
    }
  }

  // Méthode utilitaire pour créer des notifications système
  async createSystemNotification(
    recipientUserId: string,
    title: string,
    message: string,
    type: Notification['type'] = 'info'
  ): Promise<void> {
    await this.createNotification({
      recipient_user_id: recipientUserId,
      title,
      message,
      type,
      category: 'system'
    });
  }

  // Méthode utilitaire pour créer des notifications utilisateur
  async createUserNotification(
    recipientUserId: string,
    title: string,
    message: string,
    type: Notification['type'] = 'info'
  ): Promise<void> {
    await this.createNotification({
      recipient_user_id: recipientUserId,
      title,
      message,
      type,
      category: 'user'
    });
  }

  // Méthodes spécifiques pour les notifications de pôles
  async notifyPoleAccess(recipientUserId: string, poleName: string, adminName: string): Promise<void> {
    await this.createNotification({
      recipient_user_id: recipientUserId,
      title: 'Accès au pôle accordé',
      message: `${adminName} vous a accordé l'accès au pôle "${poleName}"`,
      type: 'success',
      category: 'user'
    });
  }

  async notifyPoleRemoval(recipientUserId: string, poleName: string, adminName: string): Promise<void> {
    await this.createNotification({
      recipient_user_id: recipientUserId,
      title: 'Accès au pôle retiré',
      message: `${adminName} a retiré votre accès au pôle "${poleName}"`,
      type: 'warning',
      category: 'user'
    });
  }

  // Méthodes spécifiques pour les notifications d'utilisateurs
  async notifyUserCreation(recipientUserId: string, adminName: string): Promise<void> {
    await this.createNotification({
      recipient_user_id: recipientUserId,
      title: 'Compte créé',
      message: `${adminName} a créé votre compte utilisateur`,
      type: 'success',
      category: 'user'
    });
  }

  async notifyRoleChange(recipientUserId: string, newRole: string, adminName: string): Promise<void> {
    await this.createNotification({
      recipient_user_id: recipientUserId,
      title: 'Rôle mis à jour',
      message: `${adminName} a mis à jour votre rôle vers "${newRole}"`,
      type: 'info',
      category: 'user'
    });
  }

  async notifyStatusChange(recipientUserId: string, isActive: boolean, adminName: string): Promise<void> {
    await this.createNotification({
      recipient_user_id: recipientUserId,
      title: isActive ? 'Compte activé' : 'Compte désactivé',
      message: `${adminName} a ${isActive ? 'activé' : 'désactivé'} votre compte`,
      type: isActive ? 'success' : 'warning',
      category: 'user'
    });
  }
}

export const notificationService = new NotificationService(); 