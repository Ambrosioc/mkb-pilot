'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Crown,
  ShoppingCart,
  Tag,
  FileText,
  Megaphone,
  Code,
  Server,
  Chrome as Broom,
  Link2,
  Truck,
  TrendingUp,
  Users,
  DollarSign,
  Target,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowRight,
  BarChart3,
  Package
} from 'lucide-react';
import Link from 'next/link';

const globalMetrics = [
  {
    title: 'Performance Globale',
    value: '87%',
    change: '+5%',
    icon: TrendingUp,
    color: 'text-green-600',
  },
  {
    title: 'Équipes Actives',
    value: '10/10',
    change: '100%',
    icon: Users,
    color: 'text-mkb-blue',
  },
  {
    title: 'Revenus Mensuels',
    value: '€2.4M',
    change: '+18%',
    icon: DollarSign,
    color: 'text-mkb-yellow',
  },
  {
    title: 'Objectifs Atteints',
    value: '15/18',
    change: '+3',
    icon: Target,
    color: 'text-purple-600',
  },
];

const centralModules = [
  {
    title: '📦 Stock Central',
    icon: Package,
    href: '/dashboard/stock',
    description: 'Gestion centralisée de tous les véhicules',
    status: 'excellent',
    metrics: {
      total: '247',
      disponibles: '156',
      reserves: '34'
    },
    activities: [
      'Véhicules disponibles et réservés',
      'Création factures et devis',
      'Historique des mouvements'
    ]
  },
  {
    title: '📇 Contacts Central',
    icon: Users,
    href: '/dashboard/contacts',
    description: 'Carnet d\'adresses unifié pour tous les pôles',
    status: 'excellent',
    metrics: {
      total: '1,247',
      particuliers: '892',
      pros: '355'
    },
    activities: [
      'Particuliers et professionnels',
      'Historique des échanges',
      'Tagging et segmentation'
    ]
  },
];

const polesData = [
  {
    title: 'Direction Générale',
    icon: Crown,
    href: '/dashboard/direction-generale',
    description: 'Pilotage stratégique et supervision globale',
    status: 'excellent',
    metrics: {
      performance: 92,
      objectifs: '15/18',
      roi: '€2.4M'
    },
    activities: [
      'Suivi global des performances',
      'Analyse des indicateurs G4',
      'Tableaux de bord exécutifs'
    ]
  },
  {
    title: 'Commercial',
    icon: ShoppingCart,
    href: '/dashboard/commercial',
    description: 'Ventes B2C, achats/reprises et remarketing B2B',
    status: 'good',
    metrics: {
      performance: 89,
      ventes: '€1.8M',
      leads: '347'
    },
    activities: [
      'Gestion des leads et RDV',
      'Suivi des ventes mensuelles',
      'Relations marchands B2B'
    ]
  },
  {
    title: 'Transport',
    icon: Truck,
    href: '/dashboard/transport',
    description: 'Gestion des livraisons et logistique',
    status: 'good',
    metrics: {
      performance: 85,
      livraisons: '23',
      chauffeurs: '12'
    },
    activities: [
      'Suivi des livraisons',
      'Planning des chauffeurs',
      'Partenaires logistiques'
    ]
  },
  {
    title: 'Pricing',
    icon: Tag,
    href: '/dashboard/pricing/angola',
    description: 'Gestion des tarifs et stratégies de prix',
    status: 'good',
    metrics: {
      performance: 85,
      clients: '23',
      conversion: '67%'
    },
    activities: [
      'Contrôle qualité des prix',
      'Production équipe Angola',
      'Suivi des bonus/erreurs'
    ]
  },
  {
    title: 'ACSG',
    icon: FileText,
    href: '/dashboard/acsg',
    description: 'Administration, Comptabilité, SAV et Gestion RH',
    status: 'good',
    metrics: {
      performance: 87,
      factures: '1,247',
      reglements: '€89K'
    },
    activities: [
      'Traitement des factures',
      'Suivi des règlements',
      'Gestion SAV et RH'
    ]
  },
  {
    title: 'Marketing',
    icon: Megaphone,
    href: '/dashboard/marketing',
    description: 'Campagnes publicitaires et acquisition client',
    status: 'attention',
    metrics: {
      performance: 78,
      impressions: '2.4M',
      roi: '340%'
    },
    activities: [
      'Campagnes Meta actives',
      'Animation réseaux sociaux',
      'Analyse des conversions'
    ]
  },
  {
    title: 'Technique',
    icon: Code,
    href: '/dashboard/technique',
    description: 'Développement et maintenance des systèmes',
    status: 'excellent',
    metrics: {
      performance: 95,
      uptime: '99.8%',
      bugs: '47'
    },
    activities: [
      'Déploiements et mises à jour',
      'Résolution des bugs',
      'Automatisations système'
    ]
  },
  {
    title: 'IT / Réseau',
    icon: Server,
    href: '/dashboard/it',
    description: 'Infrastructure et maintenance équipements',
    status: 'excellent',
    metrics: {
      performance: 98,
      serveurs: '12/12',
      postes: '47'
    },
    activities: [
      'Monitoring infrastructure',
      'Maintenance des postes',
      'Optimisation réseau'
    ]
  },
  {
    title: 'Entretien & Services',
    icon: Broom,
    href: '/dashboard/entretien',
    description: 'Gestion de l\'entretien et maintenance locaux',
    status: 'good',
    metrics: {
      performance: 82,
      taches: '34',
      satisfaction: '94%'
    },
    activities: [
      'Planning des tâches',
      'Validation des interventions',
      'Contrôle état des locaux'
    ]
  },
  {
    title: 'Coordination',
    icon: Link2,
    href: '/dashboard/coordination',
    description: 'Pilotage transversal et gestion des urgences',
    status: 'good',
    metrics: {
      performance: 88,
      projets: '12',
      urgences: '8'
    },
    activities: [
      'Projets transverses',
      'Gestion des urgences',
      'Résolution des blocages'
    ]
  },
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

const getStatusText = (status: string) => {
  switch (status) {
    case 'excellent': return 'Excellent';
    case 'good': return 'Bon';
    case 'attention': return 'Attention';
    default: return 'En cours';
  }
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-mkb-black mb-2">
            Dashboard MKB Pilot
          </h1>
          <p className="text-gray-600">
            Vue d'ensemble des performances de tous les pôles
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Dernière mise à jour</p>
          <p className="text-sm font-medium text-mkb-blue">Il y a 5 minutes</p>
        </div>
      </motion.div>

      {/* Global Metrics */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {globalMetrics.map((metric) => {
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

      {/* Central Modules */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-mkb-black">
            Modules Centraux
          </h2>
          <Badge variant="secondary" className="bg-mkb-blue/10 text-mkb-blue">
            Ressources Globales
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {centralModules.map((module, index) => {
            const Icon = module.icon;
            const StatusIcon = getStatusIcon(module.status);
            
            return (
              <motion.div
                key={module.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
              >
                <Card className="hover:shadow-lg transition-all duration-300 group cursor-pointer border-2 border-mkb-blue/20 bg-mkb-blue/5">
                  <Link href={module.href}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-mkb-blue/20 rounded-lg">
                            <Icon className="h-5 w-5 text-mkb-blue" />
                          </div>
                          <div>
                            <CardTitle className="text-lg text-mkb-black group-hover:text-mkb-blue transition-colors">
                              {module.title}
                            </CardTitle>
                          </div>
                        </div>
                        <Badge className={`${getStatusColor(module.status)} border`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {getStatusText(module.status)}
                        </Badge>
                      </div>
                      <CardDescription className="text-sm">
                        {module.description}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {/* Key Metrics */}
                      <div className="grid grid-cols-3 gap-3 text-sm">
                        {Object.entries(module.metrics).map(([key, value]) => (
                          <div key={key} className="text-center p-2 bg-white rounded-lg shadow-sm">
                            <div className="font-semibold text-mkb-black">{value}</div>
                            <div className="text-gray-500 capitalize">{key}</div>
                          </div>
                        ))}
                      </div>

                      {/* Activities */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-700">Fonctionnalités</h4>
                        <div className="space-y-1">
                          {module.activities.map((activity, actIndex) => (
                            <div key={actIndex} className="flex items-center text-xs text-gray-600">
                              <div className="w-1.5 h-1.5 bg-mkb-blue rounded-full mr-2"></div>
                              {activity}
                            </div>
                          ))}
                        </div>
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

      {/* Poles Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-mkb-black">
            Résumé des Pôles
          </h2>
          <Badge variant="secondary" className="bg-mkb-blue/10 text-mkb-blue">
            10 pôles actifs
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {polesData.map((pole, index) => {
            const Icon = pole.icon;
            const StatusIcon = getStatusIcon(pole.status);
            
            return (
              <motion.div
                key={pole.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
              >
                <Card className="hover:shadow-lg transition-all duration-300 group cursor-pointer">
                  <Link href={pole.href}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-mkb-blue/10 rounded-lg">
                            <Icon className="h-5 w-5 text-mkb-blue" />
                          </div>
                          <div>
                            <CardTitle className="text-lg text-mkb-black group-hover:text-mkb-blue transition-colors">
                              {pole.title}
                            </CardTitle>
                          </div>
                        </div>
                        <Badge className={`${getStatusColor(pole.status)} border`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {getStatusText(pole.status)}
                        </Badge>
                      </div>
                      <CardDescription className="text-sm">
                        {pole.description}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {/* Performance Bar */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">Performance</span>
                          <span className="text-sm font-bold text-mkb-blue">{pole.metrics.performance}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                              pole.metrics.performance >= 90 ? 'bg-green-500' :
                              pole.metrics.performance >= 80 ? 'bg-mkb-blue' :
                              'bg-orange-500'
                            }`}
                            style={{ width: `${pole.metrics.performance}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Key Metrics */}
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        {Object.entries(pole.metrics).slice(1).map(([key, value]) => (
                          <div key={key} className="text-center p-2 bg-gray-50 rounded">
                            <div className="font-semibold text-mkb-black">{value}</div>
                            <div className="text-gray-500 capitalize">{key}</div>
                          </div>
                        ))}
                      </div>

                      {/* Activities */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-700">Activités principales</h4>
                        <div className="space-y-1">
                          {pole.activities.map((activity, actIndex) => (
                            <div key={actIndex} className="flex items-center text-xs text-gray-600">
                              <div className="w-1.5 h-1.5 bg-mkb-yellow rounded-full mr-2"></div>
                              {activity}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="pt-2">
                        <Button 
                          variant="ghost" 
                          className="w-full text-mkb-blue hover:bg-mkb-blue/10 group-hover:bg-mkb-blue group-hover:text-white transition-all"
                        >
                          Voir le détail
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

      {/* Quick Stats */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-mkb-black flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Performance par Pôle
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {polesData.slice(0, 5).map((pole, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <pole.icon className="h-4 w-4 text-mkb-blue" />
                    <span className="text-sm font-medium">{pole.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-mkb-blue h-2 rounded-full"
                        style={{ width: `${pole.metrics.performance}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold text-mkb-blue w-10">
                      {pole.metrics.performance}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-mkb-black flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Statuts des Pôles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {['excellent', 'good', 'attention'].map((status) => {
                const count = polesData.filter(pole => pole.status === status).length;
                const StatusIcon = getStatusIcon(status);
                
                return (
                  <div key={status} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <StatusIcon className={`h-4 w-4 ${
                        status === 'excellent' ? 'text-green-600' :
                        status === 'good' ? 'text-blue-600' :
                        'text-orange-600'
                      }`} />
                      <span className="font-medium capitalize">{getStatusText(status)}</span>
                    </div>
                    <Badge variant="secondary" className={getStatusColor(status)}>
                      {count} pôle{count > 1 ? 's' : ''}
                    </Badge>
                  </div>
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
          Dashboard MKB Pilot - <span className="text-mkb-blue font-semibold">#mkbpilot</span>
        </p>
      </motion.div>
    </div>
  );
}