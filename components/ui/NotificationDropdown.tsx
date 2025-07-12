'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNotificationPermission } from '@/hooks/useNotificationPermission';
import { useNotifications } from '@/hooks/useNotifications';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  Bell,
  Calendar,
  Check,
  CheckCircle,
  DollarSign,
  Info,
  Loader2,
  Settings,
  Trash2,
  User
} from 'lucide-react';
import { useEffect, useState } from 'react';

// Fonction utilitaire pour formater la date
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

  if (diffInHours < 1) {
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    return `Il y a ${diffInMinutes}min`;
  } else if (diffInHours < 24) {
    return `Il y a ${diffInHours}h`;
  } else {
    const diffInDays = Math.floor(diffInHours / 24);
    return `Il y a ${diffInDays}j`;
  }
}

// Fonction pour obtenir l'icône selon le type
function getNotificationIcon(type: 'info' | 'success' | 'warning' | 'error') {
  switch (type) {
    case 'success': return CheckCircle;
    case 'warning': return AlertTriangle;
    case 'error': return AlertTriangle;
    default: return Info;
  }
}

// Fonction pour obtenir la couleur selon le type
function getNotificationColor(type: 'info' | 'success' | 'warning' | 'error') {
  switch (type) {
    case 'success': return 'text-green-600';
    case 'warning': return 'text-orange-600';
    case 'error': return 'text-red-600';
    default: return 'text-mkb-blue';
  }
}

// Fonction pour obtenir l'icône selon la catégorie
function getCategoryIcon(category: 'system' | 'user' | 'commercial' | 'technique') {
  switch (category) {
    case 'user': return User;
    case 'commercial': return DollarSign;
    case 'technique': return Settings;
    default: return Calendar;
  }
}

// Fonction pour obtenir le nom de l'expéditeur
function getSenderName(sender?: { prenom: string; nom: string; email: string }) {
  if (!sender) return 'Système';
  return `${sender.prenom} ${sender.nom}`.trim() || sender.email;
}

export function NotificationDropdown() {
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    removeNotification,
    refresh
  } = useNotifications();
  const { permission, isSupported, requestPermission } = useNotificationPermission();
  const [isOpen, setIsOpen] = useState(false);

  // Demander la permission de notification lors du premier clic
  useEffect(() => {
    if (isSupported && permission === 'default') {
      // Demander la permission automatiquement après un délai
      const timer = setTimeout(() => {
        requestPermission();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isSupported, permission, requestPermission]);

  const handleNotificationClick = async (notificationId: string, isRead: boolean) => {
    console.log('Notification clicked:', notificationId);
    if (!isRead) {
      await markAsRead(notificationId);
    }
  };

  const handleDeleteNotification = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    await removeNotification(notificationId);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleRefresh = () => {
    refresh();
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative h-8 w-8 p-0 hover:bg-gray-100"
          onClick={handleRefresh}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin text-gray-600" />
          ) : (
            <Bell className="h-4 w-4 text-gray-600" />
          )}
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
          {/* Indicateur de permission de notification */}
          {isSupported && permission === 'denied' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -bottom-1 -right-1 w-2 h-2 bg-orange-500 rounded-full"
              title="Notifications désactivées"
            />
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-80 max-h-96 overflow-hidden p-0"
        align="end"
        sideOffset={8}
      >
        {/* Header */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-mkb-black">Notifications</h3>
            <Badge variant="secondary" className="bg-mkb-blue/10 text-mkb-blue">
              {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
            </Badge>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="mt-2 h-6 px-2 text-xs text-mkb-blue hover:bg-mkb-blue/10"
            >
              <Check className="h-3 w-3 mr-1" />
              Marquer tout comme lu
            </Button>
          )}
          {/* Message de permission de notification */}
          {isSupported && permission === 'denied' && (
            <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded text-xs text-orange-700">
              <div className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                <span>Notifications désactivées</span>
              </div>
              <button
                onClick={requestPermission}
                className="mt-1 text-orange-600 hover:text-orange-800 underline"
              >
                Réactiver les notifications
              </button>
            </div>
          )}
        </div>

        {/* Notifications List */}
        <div className="max-h-80 overflow-y-auto">
          {loading ? (
            <div className="p-6 text-center text-gray-500">
              <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin text-gray-300" />
              <p className="text-sm">Chargement des notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Aucune notification</p>
            </div>
          ) : (
            <AnimatePresence mode="sync">
              {notifications.map((notification, index) => {
                const NotificationIcon = getNotificationIcon(notification.type);
                const CategoryIcon = getCategoryIcon(notification.category);
                const senderName = getSenderName(notification.sender);

                return (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className={`p-3 border-b hover:bg-gray-50 cursor-pointer transition-colors ${!notification.read ? 'bg-mkb-blue/5 border-l-4 border-l-mkb-blue' : ''
                      }`}
                    onClick={() => handleNotificationClick(notification.id, notification.read)}
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div className={`p-1.5 rounded-full ${notification.type === 'success' ? 'bg-green-100' :
                        notification.type === 'warning' ? 'bg-orange-100' :
                          notification.type === 'error' ? 'bg-red-100' :
                            'bg-blue-100'
                        }`}>
                        <NotificationIcon className={`h-3 w-3 ${getNotificationColor(notification.type)}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <h4 className={`text-sm font-medium ${!notification.read ? 'text-mkb-black' : 'text-gray-700'
                            }`}>
                            {notification.title}
                          </h4>
                          <div className="flex items-center gap-1 ml-2">
                            <CategoryIcon className="h-3 w-3 text-gray-400" />
                            {!notification.read && (
                              <div className="w-2 h-2 bg-mkb-blue rounded-full"></div>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex flex-col">
                            <span className="text-xs text-gray-500">
                              {formatDate(notification.created_at)}
                            </span>
                            <span className="text-xs text-gray-400">
                              Par {senderName}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleDeleteNotification(e, notification.id)}
                            className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-3 bg-gray-50">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-mkb-blue hover:bg-mkb-blue/10"
                onClick={() => {
                  console.log('Voir toutes les notifications');
                  setIsOpen(false);
                }}
              >
                Voir toutes les notifications
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}