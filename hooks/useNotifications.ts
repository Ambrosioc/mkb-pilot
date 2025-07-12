import { useToast } from '@/components/providers/ToastProvider';
import { Notification as NotificationType, notificationService } from '@/lib/services/notificationService';
import { supabase } from '@/lib/supabase';
import { useCallback, useEffect, useState } from 'react';
import { useNotificationPermission } from './useNotificationPermission';

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotificationPermission();
  const { addToast } = useToast();

  // Charger les notifications
  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const notifications = await notificationService.fetchNotifications();
      setNotifications(notifications);
      setUnreadCount(notifications.filter(n => !n.read).length);
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Charger les notifications au montage
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Configuration du temps réel pour les notifications
  useEffect(() => {
    // Récupérer l'utilisateur actuel
    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Récupérer l'ID utilisateur de la table users
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (!userData) return;

      const userId = userData.id;

      // S'abonner aux changements de la table notifications
      const channel = supabase
        .channel('notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `recipient_id=eq.${userId}`
          },
          async (payload) => {
            console.log('Nouvelle notification reçue en temps réel:', payload);
            
            // Récupérer les détails complets de la nouvelle notification
            try {
              const { data: newNotification, error } = await supabase
                .from('notifications')
                .select(`
                  *,
                  sender:users!notifications_sender_id_fkey(
                    id,
                    prenom,
                    nom,
                    email
                  )
                `)
                .eq('id', payload.new.id)
                .single();

              if (error) {
                console.error('Erreur lors de la récupération de la nouvelle notification:', error);
                return;
              }

              // Ajouter la nouvelle notification au début de la liste
              setNotifications(prev => [newNotification as NotificationType, ...prev]);
              setUnreadCount(prev => prev + 1);

              // Afficher une notification toast dans l'interface
              addToast({
                title: newNotification.title,
                message: newNotification.message,
                type: newNotification.type
              });

              // Afficher une notification du navigateur si autorisée
              showNotification(newNotification.title, {
                body: newNotification.message,
                tag: `notification-${newNotification.id}`,
                requireInteraction: false,
                silent: false
              });
            } catch (error) {
              console.error('Erreur lors du traitement de la nouvelle notification:', error);
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'notifications',
            filter: `recipient_id=eq.${userId}`
          },
          (payload) => {
            console.log('Notification mise à jour en temps réel:', payload);
            
            // Mettre à jour la notification dans l'état local
            setNotifications(prev => 
              prev.map(notification => 
                notification.id === payload.new.id 
                  ? { ...notification, ...payload.new }
                  : notification
              )
            );

            // Recalculer le nombre de notifications non lues
            setNotifications(prev => {
              const newUnreadCount = prev.filter(n => !n.read).length;
              setUnreadCount(newUnreadCount);
              return prev;
            });
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: 'notifications',
            filter: `recipient_id=eq.${userId}`
          },
          (payload) => {
            console.log('Notification supprimée en temps réel:', payload);
            
            // Supprimer la notification de l'état local
            setNotifications(prev => {
              const notification = prev.find(n => n.id === payload.old.id);
              if (notification && !notification.read) {
                setUnreadCount(count => Math.max(0, count - 1));
              }
              return prev.filter(n => n.id !== payload.old.id);
            });
          }
        )
        .subscribe();

      // Nettoyer l'abonnement lors du démontage
      return () => {
        supabase.removeChannel(channel);
      };
    };

    const cleanup = setupRealtime();

    return () => {
      cleanup.then(cleanupFn => cleanupFn?.());
    };
  }, []);

  // Marquer une notification comme lue
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true }
            : notification
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Erreur lors du marquage comme lu:', error);
    }
  }, []);

  // Marquer toutes les notifications comme lues
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Erreur lors du marquage de toutes les notifications:', error);
    }
  }, []);

  // Supprimer une notification
  const removeNotification = useCallback(async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications(prev => {
        const notification = prev.find(n => n.id === notificationId);
        if (notification && !notification.read) {
          setUnreadCount(count => Math.max(0, count - 1));
        }
        return prev.filter(n => n.id !== notificationId);
      });
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  }, []);

  // Effacer toutes les notifications
  const clearAll = useCallback(async () => {
    try {
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('Erreur lors de l\'effacement:', error);
    }
  }, []);

  // Obtenir les notifications par type
  const getNotificationsByType = useCallback((type: NotificationType['type']) => {
    return notifications.filter(notification => notification.type === type);
  }, [notifications]);

  // Recharger les notifications
  const refresh = useCallback(() => {
    loadNotifications();
  }, [loadNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    getNotificationsByType,
    refresh
  };
} 