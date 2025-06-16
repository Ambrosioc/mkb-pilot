'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Crown,
  BarChart3,
  TrendingUp,
  Users,
  Calendar,
  FileText,
  DollarSign,
  Target,
  Shield,
  Activity,
  ArrowRight,
  Eye,
  CheckCircle,
  AlertTriangle,
  Clock
} from 'lucide-react';
import Link from 'next/link';

const quickStats = [
  {
    title: 'Performance Globale',
    value: '87%',
    change: '+12%',
    icon: TrendingUp,
    color: 'text-green-600',
  },
  {
    title: 'Objectifs Atteints',
    value: '15/18',
    change: '+3',
    icon: Target,
    color: 'text-mkb-blue',
  },
  {
    title: 'Équipes Actives',
    value: '9',
    change: '100%',
    icon: Users,
    color: 'text-purple-600',
  },
  {
    title: 'ROI Mensuel',
    value: '€2.4M',
    change: '+18%',
    icon: DollarSign,
    color: 'text-mkb-yellow',
  },
];

const sectionOverviews = [
  {
    title: 'Statistiques Consolidées',
    description: 'KPIs globaux par pôle avec tendances et filtres temporels',
    href: '/dashboard/direction/statistiques',
    icon: BarChart3,
    stats: {
      kpis: 24,
      poles: 9,
      trend: '+15%'
    },
    status: 'excellent',
    preview: 'CA: €2.4M (+18%) • Véhicules: 1,847 (+12%) • SAV: 23 tickets'
  },
  {
    title: 'Performances des Pôles',
    description: 'Tableau de bord avec indicateurs et statuts de progression',
    href: '/dashboard/direction/performances',
    icon: TrendingUp,
    stats: {
      poles: 9,
      onTrack: 6,
      alerts: 1
    },
    status: 'good',
    preview: '6 pôles à jour • 2 en avance • 1 en retard • Taux global: 87%'
  },
  {
    title: 'Suivi Directeurs G4',
    description: 'Fiches individuelles CEO, COO, CTO, CCO avec projets et notes',
    href: '/dashboard/direction/directeurs',
    icon: Users,
    stats: {
      directors: 4,
      onTime: 3,
      behind: 1
    },
    status: 'good',
    preview: 'CEO: 15/18 tâches • COO: En avance • CTO: À jour • CCO: Retard'
  },
  {
    title: 'Rapports & Timeline',
    description: 'Rapports hebdomadaires, mensuels avec timeline et aperçus',
    href: '/dashboard/direction/rapports',
    icon: Calendar,
    stats: {
      reports: 12,
      pending: 2,
      published: 10
    },
    status: 'good',
    preview: '3 rapports cette semaine • 1 mensuel en cours • Timeline à jour'
  },
  {
    title: 'Documents Stratégiques',
    description: 'Plans d\'action, grilles de suivi, documents Excel avec upload',
    href: '/dashboard/direction/documents',
    icon: FileText,
    stats: {
      documents: 28,
      recent: 5,
      categories: 6
    },
    status: 'excellent',
    preview: '5 nouveaux docs • Plan 2024-2026 • Budget Q2 • Roadmap Tech'
  },
  {
    title: 'Analyse Financière',
    description: 'Graphiques CA, dépenses, bénéfices avec rapports comptables',
    href: '/dashboard/direction/finances',
    icon: DollarSign,
    stats: {
      revenue: '€2.4M',
      growth: '+18%',
      margin: '24.2%'
    },
    status: 'excellent',
    preview: 'CA: €2.4M (+18%) • Marge: 24.2% • Bénéfices: €580K (+38%)'
  },
];

const recentActivities = [
  {
    action: 'Rapport mensuel Q1 publié',
    time: 'Il y a 2h',
    user: 'Alexandre Dubois (CEO)',
    type: 'report'
  },
  {
    action: 'Objectif Commercial dépassé',
    time: 'Il y a 4h',
    user: 'Système',
    type: 'achievement'
  },
  {
    action: 'Document stratégique uploadé',
    time: 'Il y a 6h',
    user: 'Marie-Claire Fontaine (COO)',
    type: 'document'
  },
  {
    action: 'Alerte performance Marketing',
    time: 'Hier',
    user: 'Système',
    type: 'alert'
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'excellent': return 'bg-green-100 text-green-800 border-green-200';
    case 'good': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'attention': return 'bg-orange-100 text-orange-800 border-orange-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'excellent': return CheckCircle;
    case 'good': return Activity;
    case 'attention': return AlertTriangle;
    default: return Clock;
  }
};

export default function DirectionPage() {
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
          <Crown className="h-8 w-8 text-mkb-blue" />
          <div>
            <h1 className="text-3xl font-bold text-mkb-black">
              Direction Générale – G4
            </h1>
            <p className="text-gray-600">
              Tableau de bord exécutif et pilotage stratégique
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <Shield className="h-3 w-3 mr-1" />
            Accès Restreint G4
          </Badge>
          <div className="text-right">
            <p className="text-sm text-gray-500">Dernière mise à jour</p>
            <p className="text-sm font-medium text-mkb-blue">Il y a 5 minutes</p>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {quickStats.map((stat) => {
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
                  {stat.change} vs mois précédent
                </p>
              </CardContent>
            </Card>
          );
        })}
      </motion.div>

      {/* Sections Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-mkb-black">
            Modules de Direction
          </h2>
          <Badge variant="secondary" className="bg-mkb-blue/10 text-mkb-blue">
            6 modules actifs
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sectionOverviews.map((section, index) => {
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
                          {section.status === 'excellent' ? 'Excellent' : 
                           section.status === 'good' ? 'Bon' : 'Attention'}
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

      {/* Recent Activities & Quick Access */}
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
                Activités Récentes G4
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`h-3 w-3 rounded-full ${
                        activity.type === 'achievement' ? 'bg-green-500' :
                        activity.type === 'alert' ? 'bg-orange-500' :
                        activity.type === 'report' ? 'bg-mkb-blue' :
                        'bg-purple-500'
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

        {/* Quick Access */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-mkb-black">Accès Rapide</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Link href="/dashboard/direction/statistiques">
                  <Button variant="outline" className="w-full h-16 flex flex-col gap-1">
                    <BarChart3 className="h-5 w-5" />
                    <span className="text-xs">Statistiques</span>
                  </Button>
                </Link>
                <Link href="/dashboard/direction/performances">
                  <Button variant="outline" className="w-full h-16 flex flex-col gap-1">
                    <TrendingUp className="h-5 w-5" />
                    <span className="text-xs">Performances</span>
                  </Button>
                </Link>
                <Link href="/dashboard/direction/directeurs">
                  <Button variant="outline" className="w-full h-16 flex flex-col gap-1">
                    <Users className="h-5 w-5" />
                    <span className="text-xs">Directeurs</span>
                  </Button>
                </Link>
                <Link href="/dashboard/direction/finances">
                  <Button variant="outline" className="w-full h-16 flex flex-col gap-1">
                    <DollarSign className="h-5 w-5" />
                    <span className="text-xs">Finances</span>
                  </Button>
                </Link>
              </div>
              
              <div className="mt-4 p-3 bg-mkb-blue/5 rounded-lg border border-mkb-blue/20">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-mkb-blue" />
                  <span className="text-sm font-medium text-mkb-blue">Accès Sécurisé</span>
                </div>
                <p className="text-xs text-gray-600">
                  Ces modules sont réservés aux membres du G4. Toutes les actions sont tracées et auditées.
                </p>
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
          Direction Générale G4 - <span className="text-mkb-blue font-semibold">#mkbpilot</span> - Accès Restreint
        </p>
      </motion.div>
    </div>
  );
}