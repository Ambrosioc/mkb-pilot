'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Settings,
  Users,
  Shield,
  FileText,
  Clock,
  Database,
  Activity,
  AlertTriangle,
  CheckCircle,
  Eye,
  ArrowRight,
  Lock
} from 'lucide-react';
import Link from 'next/link';

const adminMetrics = [
  {
    title: 'Utilisateurs Actifs',
    value: '47',
    change: '+3',
    icon: Users,
    color: 'text-green-600',
  },
  {
    title: 'Sessions Actives',
    value: '23',
    change: '+5',
    icon: Activity,
    color: 'text-mkb-blue',
  },
  {
    title: 'Actions Récentes',
    value: '156',
    change: '+12',
    icon: FileText,
    color: 'text-purple-600',
  },
  {
    title: 'Alertes Sécurité',
    value: '2',
    change: '-1',
    icon: AlertTriangle,
    color: 'text-orange-600',
  },
];

const adminSections = [
  {
    title: 'Gestion des Utilisateurs',
    description: 'Créer, modifier et gérer les comptes utilisateurs',
    href: '/dashboard/direction/administration/utilisateurs',
    icon: Users,
    stats: {
      total: 47,
      actifs: 42,
      suspendus: 5
    },
    status: 'active',
    preview: '47 utilisateurs • 42 actifs • 5 suspendus'
  },
  {
    title: 'Attribution des Rôles',
    description: 'Gérer les permissions et rôles des utilisateurs',
    href: '/dashboard/direction/administration/roles',
    icon: Shield,
    stats: {
      roles: 8,
      modifications: 12,
      enAttente: 3
    },
    status: 'attention',
    preview: '8 rôles définis • 12 modifications ce mois • 3 en attente'
  },
  {
    title: 'Logs d\'Activité',
    description: 'Historique des actions et modifications système',
    href: '/dashboard/direction/administration/logs',
    icon: FileText,
    stats: {
      actions: 1247,
      aujourdhui: 89,
      erreurs: 3
    },
    status: 'monitoring',
    preview: '1,247 actions • 89 aujourd\'hui • 3 erreurs détectées'
  },
  {
    title: 'Historique des Accès',
    description: 'Suivi des connexions et détection d\'anomalies',
    href: '/dashboard/direction/administration/historique-acces',
    icon: Clock,
    stats: {
      connexions: 234,
      suspects: 2,
      bloquees: 1
    },
    status: 'secure',
    preview: '234 connexions • 2 accès suspects • 1 session bloquée'
  },
  {
    title: 'Paramètres Généraux',
    description: 'Configuration du dashboard et intégrations',
    href: '/dashboard/direction/administration/parametres',
    icon: Settings,
    stats: {
      integrations: 5,
      configurations: 23,
      sauvegardes: 12
    },
    status: 'configured',
    preview: '5 intégrations • 23 configurations • 12 sauvegardes'
  },
];

const recentActivities = [
  {
    action: 'Nouvel utilisateur créé: marie.martin@mkb.com',
    time: 'Il y a 2h',
    user: 'Alexandre Dubois (CEO)',
    type: 'user-add'
  },
  {
    action: 'Rôle modifié: Jean Dupont → Responsable Commercial',
    time: 'Il y a 4h',
    user: 'Marie-Claire Fontaine (COO)',
    type: 'role-change'
  },
  {
    action: 'Accès suspect détecté: IP 192.168.1.100',
    time: 'Il y a 6h',
    user: 'Système',
    type: 'security-alert'
  },
  {
    action: 'Paramètres sauvegardés: Notifications activées',
    time: 'Hier',
    user: 'Thomas Leclerc (CTO)',
    type: 'config-change'
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800 border-green-200';
    case 'attention': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'monitoring': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'secure': return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'configured': return 'bg-mkb-blue/10 text-mkb-blue border-mkb-blue/20';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'active': return CheckCircle;
    case 'attention': return AlertTriangle;
    case 'monitoring': return Activity;
    case 'secure': return Shield;
    case 'configured': return Settings;
    default: return Clock;
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'active': return 'Actif';
    case 'attention': return 'Attention';
    case 'monitoring': return 'Surveillance';
    case 'secure': return 'Sécurisé';
    case 'configured': return 'Configuré';
    default: return 'En cours';
  }
};

export default function AdministrationPage() {
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
          <Settings className="h-8 w-8 text-mkb-blue" />
          <div>
            <h1 className="text-3xl font-bold text-mkb-black">
              Administration G4
            </h1>
            <p className="text-gray-600">
              Gestion des utilisateurs, rôles et paramètres système
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <Lock className="h-3 w-3 mr-1" />
            Accès Restreint G4
          </Badge>
          <div className="text-right">
            <p className="text-sm text-gray-500">Dernière activité</p>
            <p className="text-sm font-medium text-mkb-blue">Il y a 2 minutes</p>
          </div>
        </div>
      </motion.div>

      {/* Admin Metrics */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {adminMetrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.title} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {metric.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${metric.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-mkb-black">{metric.value}</div>
                <p className="text-xs text-green-600">
                  {metric.change} vs mois précédent
                </p>
              </CardContent>
            </Card>
          );
        })}
      </motion.div>

      {/* Admin Sections */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-mkb-black">
            Modules d'Administration
          </h2>
          <Badge variant="secondary" className="bg-mkb-blue/10 text-mkb-blue">
            5 modules disponibles
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminSections.map((section, index) => {
            const Icon = section.icon;
            const StatusIcon = getStatusIcon(section.status);
            
            return (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
              >
                <Card className="hover:shadow-lg transition-all duration-300 group cursor-pointer h-full">
                  <Link href={section.href}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-mkb-blue/10 rounded-lg">
                            <Icon className="h-5 w-5 text-mkb-blue" />
                          </div>
                          <div>
                            <CardTitle className="text-lg text-mkb-black group-hover:text-mkb-blue transition-colors">
                              {section.title}
                            </CardTitle>
                          </div>
                        </div>
                        <Badge className={`${getStatusColor(section.status)} border`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {getStatusText(section.status)}
                        </Badge>
                      </div>
                      <CardDescription className="text-sm">
                        {section.description}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {/* Key Stats */}
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        {Object.entries(section.stats).map(([key, value]) => (
                          <div key={key} className="text-center p-2 bg-gray-50 rounded">
                            <div className="font-semibold text-mkb-black">{value}</div>
                            <div className="text-gray-500 capitalize">{key}</div>
                          </div>
                        ))}
                      </div>

                      {/* Preview */}
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">Aperçu:</p>
                        <p className="text-sm text-mkb-black">{section.preview}</p>
                      </div>

                      {/* Action Button */}
                      <div className="pt-2">
                        <Button 
                          variant="ghost" 
                          className="w-full text-mkb-blue hover:bg-mkb-blue/10 group-hover:bg-mkb-blue group-hover:text-white transition-all"
                        >
                          Accéder au module
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Recent Activities & Security Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-mkb-black flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Activités Récentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`h-3 w-3 rounded-full ${
                        activity.type === 'user-add' ? 'bg-green-500' :
                        activity.type === 'role-change' ? 'bg-blue-500' :
                        activity.type === 'security-alert' ? 'bg-red-500' :
                        activity.type === 'config-change' ? 'bg-mkb-blue' :
                        'bg-gray-400'
                      }`}></div>
                      <div>
                        <p className="text-sm font-medium text-mkb-black">{activity.action}</p>
                        <p className="text-xs text-gray-500">{activity.user} • {activity.time}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Security Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-mkb-black flex items-center gap-2">
                <Shield className="h-5 w-5" />
                État de Sécurité
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-800">Authentification 2FA</p>
                      <p className="text-sm text-green-600">Activée pour tous les G4</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Actif</Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Database className="h-5 w-5 text-mkb-blue" />
                    <div>
                      <p className="font-medium text-blue-800">Sauvegarde Données</p>
                      <p className="text-sm text-blue-600">Dernière: il y a 2h</p>
                    </div>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">OK</Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-medium text-orange-800">Accès Suspects</p>
                      <p className="text-sm text-orange-600">2 détectés aujourd'hui</p>
                    </div>
                  </div>
                  <Badge className="bg-orange-100 text-orange-800">Attention</Badge>
                </div>

                <div className="pt-2">
                  <Button className="w-full bg-mkb-blue hover:bg-mkb-blue/90">
                    <Shield className="mr-2 h-4 w-4" />
                    Rapport Sécurité Complet
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Footer */}
      <motion.div
        className="text-center py-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <p className="text-sm text-gray-500">
          Administration G4 - <span className="text-mkb-blue font-semibold">#mkbpilot</span> - Accès Restreint
        </p>
      </motion.div>
    </div>
  );
}