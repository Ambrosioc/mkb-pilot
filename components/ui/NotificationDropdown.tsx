'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  Bell,
  Calendar,
  Check,
  CheckCircle,
  DollarSign,
  Info,
  Settings,
  Trash2,
  User
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  date: string;
  read: boolean;
  category: 'system' | 'user' | 'commercial' | 'technique';
}

// Données statiques des notifications
const initialNotifications: Notification[] = [
  {
    id: '1',
    title: 'Nouveau rapport disponible',
    message: 'Le rapport mensuel de mars 2024 est maintenant disponible',
    type: 'info',
    date: '2024-03-15T14:30:00Z',
    read: false,
    category: 'system'
  },
  {
    id: '2',
    title: 'Objectif commercial atteint',
    message: 'L\'équipe commerciale a dépassé ses objectifs de 18%',
    type: 'success',
    date: '2024-03-15T12:15:00Z',
    read: false,
    category: 'commercial'
  },
  {
    id: '3',
    title: 'Maintenance programmée',
    message: 'Maintenance système prévue dimanche 17 mars de 2h à 4h',
    type: 'warning',
    date: '2024-03-15T10:45:00Z',
    read: true,
    category: 'technique'
  },
  {
    id: '4',
    title: 'Nouvel utilisateur',
    message: 'Marie Martin a rejoint l\'équipe commerciale',
    type: 'info',
    date: '2024-03-15T09:20:00Z',
    read: false,
    category: 'user'
  },
  {
    id: '5',
    title: 'Alerte sécurité',
    message: 'Tentative de connexion suspecte détectée',
    type: 'error',
    date: '2024-03-14T18:30:00Z',
    read: true,
    category: 'system'
  },
  {
    id: '6',
    title: 'Paiement reçu',
    message: 'Paiement de €15,000 reçu de Dupont SA',
    type: 'success',
    date: '2024-03-14T16:45:00Z',
    read: false,
    category: 'commercial'
  }
];

// Hook personnalisé pour gérer les notifications
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Charger les notifications depuis localStorage au montage
  useEffect(() => {
    const stored = localStorage.getItem('mkb-notifications');
    if (stored) {
      try {
        setNotifications(JSON.parse(stored));
      } catch {
        setNotifications(initialNotifications);
      }
    } else {
      setNotifications(initialNotifications);
    }
  }, []);

  // Sauvegarder dans localStorage à chaque changement
  useEffect(() => {
    if (notifications.length > 0) {
      localStorage.setItem('mkb-notifications', JSON.stringify(notifications));
    }
  }, [notifications]);

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification
  };
}

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
function getNotificationIcon(type: Notification['type']) {
  switch (type) {
    case 'success': return CheckCircle;
    case 'warning': return AlertTriangle;
    case 'error': return AlertTriangle;
    default: return Info;
  }
}

// Fonction pour obtenir la couleur selon le type
function getNotificationColor(type: Notification['type']) {
  switch (type) {
    case 'success': return 'text-green-600';
    case 'warning': return 'text-orange-600';
    case 'error': return 'text-red-600';
    default: return 'text-mkb-blue';
  }
}

// Fonction pour obtenir l'icône selon la catégorie
function getCategoryIcon(category: Notification['category']) {
  switch (category) {
    case 'user': return User;
    case 'commercial': return DollarSign;
    case 'technique': return Settings;
    default: return Calendar;
  }
}

export function NotificationDropdown() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  const handleNotificationClick = (notification: Notification) => {
    console.log('Notification clicked:', notification.id);
    if (!notification.read) {
      markAsRead(notification.id);
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative h-8 w-8 p-0 hover:bg-gray-100"
        >
          <Bell className="h-4 w-4 text-gray-600" />
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
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
              onClick={markAllAsRead}
              className="mt-2 h-6 px-2 text-xs text-mkb-blue hover:bg-mkb-blue/10"
            >
              <Check className="h-3 w-3 mr-1" />
              Marquer tout comme lu
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Aucune notification</p>
            </div>
          ) : (
            <AnimatePresence mode="sync">
              {notifications.map((notification, index) => {
                const NotificationIcon = getNotificationIcon(notification.type);
                const CategoryIcon = getCategoryIcon(notification.category);

                return (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className={`p-3 border-b hover:bg-gray-50 cursor-pointer transition-colors ${!notification.read ? 'bg-mkb-blue/5 border-l-4 border-l-mkb-blue' : ''
                      }`}
                    onClick={() => handleNotificationClick(notification)}
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
                          <span className="text-xs text-gray-500">
                            {formatDate(notification.date)}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
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