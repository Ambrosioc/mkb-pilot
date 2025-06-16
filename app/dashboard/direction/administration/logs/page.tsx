'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FileText,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Plus,
  User,
  Calendar,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

const logsData = [
  {
    id: 1,
    action: 'Création utilisateur',
    description: 'Nouvel utilisateur créé: marie.martin@mkb.com',
    user: 'Alexandre Dubois',
    userRole: 'CEO',
    timestamp: '2024-03-15 14:30:25',
    type: 'user_create',
    severity: 'info',
    ip: '192.168.1.100',
    details: {
      targetUser: 'marie.martin@mkb.com',
      assignedRole: 'Agent N2',
      department: 'Commercial'
    }
  },
  {
    id: 2,
    action: 'Modification rôle',
    description: 'Rôle modifié: Jean Dupont → Responsable Commercial',
    user: 'Marie-Claire Fontaine',
    userRole: 'COO',
    timestamp: '2024-03-15 13:45:12',
    type: 'role_change',
    severity: 'warning',
    ip: '192.168.1.101',
    details: {
      targetUser: 'Jean Dupont',
      oldRole: 'Agent N2',
      newRole: 'Responsable Commercial'
    }
  },
  {
    id: 3,
    action: 'Connexion suspecte',
    description: 'Tentative de connexion depuis une IP non autorisée',
    user: 'Système',
    userRole: 'System',
    timestamp: '2024-03-15 12:15:45',
    type: 'security_alert',
    severity: 'error',
    ip: '203.45.67.89',
    details: {
      targetUser: 'sophie.laurent@mkb.com',
      location: 'Inconnu',
      blocked: true
    }
  },
  {
    id: 4,
    action: 'Suppression document',
    description: 'Document supprimé: Rapport_Q1_2024.pdf',
    user: 'Thomas Leclerc',
    userRole: 'CTO',
    timestamp: '2024-03-15 11:30:18',
    type: 'document_delete',
    severity: 'warning',
    ip: '192.168.1.102',
    details: {
      fileName: 'Rapport_Q1_2024.pdf',
      fileSize: '2.4 MB',
      location: '/documents/rapports/'
    }
  },
  {
    id: 5,
    action: 'Mise à jour paramètres',
    description: 'Paramètres de notification modifiés',
    user: 'Isabelle Moreau',
    userRole: 'CCO',
    timestamp: '2024-03-15 10:45:33',
    type: 'settings_update',
    severity: 'info',
    ip: '192.168.1.103',
    details: {
      section: 'Notifications',
      changes: ['email_alerts: true', 'sms_alerts: false']
    }
  },
  {
    id: 6,
    action: 'Suspension utilisateur',
    description: 'Utilisateur suspendu: pierre.martin@mkb.com',
    user: 'Alexandre Dubois',
    userRole: 'CEO',
    timestamp: '2024-03-15 09:20:15',
    type: 'user_suspend',
    severity: 'error',
    ip: '192.168.1.100',
    details: {
      targetUser: 'pierre.martin@mkb.com',
      reason: 'Violation politique sécurité',
      duration: '30 jours'
    }
  },
  {
    id: 7,
    action: 'Export données',
    description: 'Export des données utilisateurs effectué',
    user: 'Marie-Claire Fontaine',
    userRole: 'COO',
    timestamp: '2024-03-15 08:15:42',
    type: 'data_export',
    severity: 'info',
    ip: '192.168.1.101',
    details: {
      dataType: 'Utilisateurs',
      format: 'CSV',
      recordCount: 47
    }
  },
  {
    id: 8,
    action: 'Connexion réussie',
    description: 'Connexion utilisateur réussie',
    user: 'Jean Martin',
    userRole: 'Responsable Commercial',
    timestamp: '2024-03-15 07:30:28',
    type: 'login_success',
    severity: 'info',
    ip: '192.168.1.105',
    details: {
      device: 'Chrome/Windows',
      location: 'Bureau principal'
    }
  }
];

const logStats = [
  {
    title: 'Actions Totales',
    value: '1,247',
    change: '+89',
    icon: Activity,
    color: 'text-mkb-blue',
  },
  {
    title: 'Aujourd\'hui',
    value: '89',
    change: '+12',
    icon: Calendar,
    color: 'text-green-600',
  },
  {
    title: 'Alertes Sécurité',
    value: '3',
    change: '+1',
    icon: AlertTriangle,
    color: 'text-red-600',
  },
  {
    title: 'Utilisateurs Actifs',
    value: '23',
    change: '+5',
    icon: User,
    color: 'text-purple-600',
  },
];

const getActionIcon = (type: string) => {
  switch (type) {
    case 'user_create': return Plus;
    case 'user_suspend': return Trash2;
    case 'role_change': return Edit;
    case 'security_alert': return AlertTriangle;
    case 'document_delete': return Trash2;
    case 'settings_update': return Edit;
    case 'data_export': return Download;
    case 'login_success': return CheckCircle;
    default: return Activity;
  }
};

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'info': return 'bg-blue-100 text-blue-800';
    case 'warning': return 'bg-yellow-100 text-yellow-800';
    case 'error': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'user_create': return 'text-green-600';
    case 'user_suspend': return 'text-red-600';
    case 'role_change': return 'text-blue-600';
    case 'security_alert': return 'text-red-600';
    case 'document_delete': return 'text-orange-600';
    case 'settings_update': return 'text-purple-600';
    case 'data_export': return 'text-mkb-blue';
    case 'login_success': return 'text-green-600';
    default: return 'text-gray-600';
  }
};

export default function LogsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('all');
  const [selectedLog, setSelectedLog] = useState<number | null>(null);

  const filteredLogs = logsData.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.user.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || log.type === typeFilter;
    const matchesSeverity = severityFilter === 'all' || log.severity === severityFilter;
    const matchesUser = userFilter === 'all' || log.user === userFilter;
    return matchesSearch && matchesType && matchesSeverity && matchesUser;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <FileText className="h-8 w-8 text-mkb-blue" />
          <div>
            <h1 className="text-3xl font-bold text-mkb-black">
              Logs d'Activité
            </h1>
            <p className="text-gray-600">
              Historique des actions et modifications système
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exporter Logs
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {logStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-mkb-black">{stat.value}</div>
                <p className="text-xs text-green-600">
                  {stat.change} vs hier
                </p>
              </CardContent>
            </Card>
          );
        })}
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="relative flex-1 min-w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Rechercher dans les logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Type d'action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="user_create">Création utilisateur</SelectItem>
                  <SelectItem value="role_change">Modification rôle</SelectItem>
                  <SelectItem value="security_alert">Alerte sécurité</SelectItem>
                  <SelectItem value="document_delete">Suppression document</SelectItem>
                  <SelectItem value="login_success">Connexion</SelectItem>
                </SelectContent>
              </Select>
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Sévérité" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="error">Erreur</SelectItem>
                </SelectContent>
              </Select>
              <Select value={userFilter} onValueChange={setUserFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Utilisateur" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les utilisateurs</SelectItem>
                  <SelectItem value="Alexandre Dubois">Alexandre Dubois</SelectItem>
                  <SelectItem value="Marie-Claire Fontaine">Marie-Claire Fontaine</SelectItem>
                  <SelectItem value="Thomas Leclerc">Thomas Leclerc</SelectItem>
                  <SelectItem value="Système">Système</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Logs Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-mkb-black">
              Timeline des Activités ({filteredLogs.length})
            </CardTitle>
            <CardDescription>
              Historique chronologique des actions système
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredLogs.map((log, index) => {
                const ActionIcon = getActionIcon(log.type);
                
                return (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="flex items-start gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedLog(selectedLog === log.id ? null : log.id)}
                  >
                    <div className="flex flex-col items-center">
                      <div className={`p-2 rounded-full ${getTypeColor(log.type)} bg-opacity-10`}>
                        <ActionIcon className={`h-4 w-4 ${getTypeColor(log.type)}`} />
                      </div>
                      {index < filteredLogs.length - 1 && (
                        <div className="w-px h-8 bg-gray-200 mt-2"></div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-mkb-black">{log.action}</h3>
                          <p className="text-sm text-gray-600">{log.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getSeverityColor(log.severity)}>
                            {log.severity}
                          </Badge>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-4">
                          <span>👤 {log.user} ({log.userRole})</span>
                          <span>🌐 {log.ip}</span>
                          <span>🕒 {log.timestamp}</span>
                        </div>
                      </div>
                      
                      {selectedLog === log.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          transition={{ duration: 0.3 }}
                          className="mt-4 p-4 bg-gray-50 rounded-lg"
                        >
                          <h4 className="font-medium text-mkb-black mb-2">Détails de l'action</h4>
                          <div className="space-y-2">
                            {Object.entries(log.details).map(([key, value]) => (
                              <div key={key} className="flex justify-between text-sm">
                                <span className="font-medium capitalize text-gray-700">
                                  {key.replace(/([A-Z])/g, ' $1').toLowerCase()}:
                                </span>
                                <span className="text-gray-600">
                                  {Array.isArray(value) ? value.join(', ') : String(value)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Footer */}
      <motion.div
        className="text-center py-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <p className="text-sm text-gray-500">
          Logs d'Activité - <span className="text-mkb-blue font-semibold">#mkbpilot</span>
        </p>
      </motion.div>
    </div>
  );
}