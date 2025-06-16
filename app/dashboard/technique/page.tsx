'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Code, 
  Zap, 
  Settings, 
  Shield,
  Bug,
  GitBranch,
  Server,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  Database
} from 'lucide-react';

const techniqueMetrics = [
  {
    title: 'Uptime Système',
    value: '99.8%',
    change: '+0.2%',
    icon: Activity,
    color: 'text-green-600',
  },
  {
    title: 'Bugs Résolus',
    value: '47',
    change: '+12',
    icon: Bug,
    color: 'text-mkb-blue',
  },
  {
    title: 'Déploiements',
    value: '23',
    change: '+8',
    icon: GitBranch,
    color: 'text-purple-600',
  },
  {
    title: 'Automatisations',
    value: '156',
    change: '+15',
    icon: Zap,
    color: 'text-mkb-yellow',
  },
];

const techniqueSections = [
  {
    title: 'Mises à Jour',
    description: 'Déploiements et versions des applications',
    icon: GitBranch,
    status: 'active',
    lastUpdate: '2h',
    version: 'v2.4.1',
    progress: 95,
  },
  {
    title: 'Bugs & Support',
    description: 'Résolution des incidents et support technique',
    icon: Bug,
    status: 'monitoring',
    tickets: 12,
    resolved: 47,
    progress: 78,
  },
  {
    title: 'Automatisations',
    description: 'Scripts et processus automatisés',
    icon: Zap,
    status: 'active',
    scripts: 156,
    running: 142,
    progress: 91,
  },
  {
    title: 'Sécurité',
    description: 'Monitoring sécurité et vulnérabilités',
    icon: Shield,
    status: 'secure',
    threats: 0,
    scans: 24,
    progress: 98,
  },
];

const systemHealth = [
  { service: 'API Principal', status: 'healthy', uptime: '99.9%', response: '45ms' },
  { service: 'Base de Données', status: 'healthy', uptime: '99.8%', response: '12ms' },
  { service: 'Cache Redis', status: 'healthy', uptime: '100%', response: '2ms' },
  { service: 'CDN Assets', status: 'warning', uptime: '98.5%', response: '120ms' },
];

export default function TechniquePage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-3"
      >
        <Code className="h-8 w-8 text-mkb-blue" />
        <div>
          <h1 className="text-3xl font-bold text-mkb-black">
            Pôle Technique
          </h1>
          <p className="text-gray-600">
            Développement, maintenance et automatisation des systèmes
          </p>
        </div>
      </motion.div>

      {/* Metrics */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {techniqueMetrics.map((metric) => {
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

      {/* Technical Sections */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {techniqueSections.map((section, index) => {
          const Icon = section.icon;
          const getStatusColor = (status: string) => {
            switch (status) {
              case 'active': return 'bg-green-100 text-green-800';
              case 'monitoring': return 'bg-orange-100 text-orange-800';
              case 'secure': return 'bg-blue-100 text-blue-800';
              default: return 'bg-gray-100 text-gray-800';
            }
          };

          const getStatusText = (status: string) => {
            switch (status) {
              case 'active': return 'Actif';
              case 'monitoring': return 'Surveillance';
              case 'secure': return 'Sécurisé';
              default: return 'Inconnu';
            }
          };

          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-mkb-black flex items-center gap-2">
                    <Icon className="h-5 w-5 text-mkb-blue" />
                    {section.title}
                  </CardTitle>
                  <Badge className={getStatusColor(section.status)}>
                    {getStatusText(section.status)}
                  </Badge>
                </div>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Performance</span>
                    <span className="text-sm font-bold text-mkb-blue">{section.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        section.progress >= 95 ? 'bg-green-500' :
                        section.progress >= 80 ? 'bg-mkb-blue' :
                        'bg-orange-500'
                      }`}
                      style={{ width: `${section.progress}%` }}
                    ></div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="font-semibold text-mkb-black">
                        {section.lastUpdate || section.tickets || section.scripts || section.threats || 'N/A'}
                      </div>
                      <div className="text-gray-500">
                        {section.lastUpdate ? 'Dernière MAJ' : 
                         section.tickets ? 'Tickets ouverts' : 
                         section.scripts ? 'Scripts actifs' : 
                         'Menaces détectées'}
                      </div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="font-semibold text-mkb-black">
                        {section.version || section.resolved || section.running || section.scans || 'N/A'}
                      </div>
                      <div className="text-gray-500">
                        {section.version ? 'Version' : 
                         section.resolved ? 'Résolus' : 
                         section.running ? 'En cours' : 
                         'Scans/jour'}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </motion.div>

      {/* System Health */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-mkb-black flex items-center gap-2">
              <Server className="h-5 w-5" />
              État des Systèmes
            </CardTitle>
            <CardDescription>
              Monitoring en temps réel des services critiques
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {systemHealth.map((service, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`h-3 w-3 rounded-full ${
                      service.status === 'healthy' ? 'bg-green-500' :
                      service.status === 'warning' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}></div>
                    <div>
                      <p className="font-medium text-mkb-black">{service.service}</p>
                      <p className="text-xs text-gray-500">Uptime: {service.uptime}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-mkb-blue">{service.response}</p>
                    <p className="text-xs text-gray-500">temps réponse</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Activities */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-mkb-black flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Activités Récentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                {
                  action: 'Déploiement v2.4.1 réussi',
                  time: 'Il y a 2h',
                  status: 'success'
                },
                {
                  action: 'Bug #456 résolu - Paiements',
                  time: 'Il y a 4h',
                  status: 'success'
                },
                {
                  action: 'Scan sécurité automatique',
                  time: 'Il y a 6h',
                  status: 'info'
                },
                {
                  action: 'Optimisation base de données',
                  time: 'Hier',
                  status: 'success'
                }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-mkb-black">{item.action}</p>
                    <p className="text-xs text-gray-500">{item.time}</p>
                  </div>
                  <div className={`h-2 w-2 rounded-full ${
                    item.status === 'success' ? 'bg-green-500' :
                    item.status === 'warning' ? 'bg-orange-500' :
                    item.status === 'info' ? 'bg-mkb-blue' :
                    'bg-gray-400'
                  }`}></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-mkb-black flex items-center gap-2">
              <Database className="h-5 w-5" />
              Métriques Techniques
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-xl font-bold text-green-600">2.3s</div>
                  <div className="text-xs text-green-700">Temps de build</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-xl font-bold text-mkb-blue">847MB</div>
                  <div className="text-xs text-blue-700">Utilisation RAM</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <div className="text-xl font-bold text-mkb-yellow">15%</div>
                  <div className="text-xs text-yellow-700">CPU moyen</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-xl font-bold text-purple-600">2.1TB</div>
                  <div className="text-xs text-purple-700">Stockage libre</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-mkb-black">Actions Rapides</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button className="bg-mkb-blue hover:bg-mkb-blue/90 text-white">
                <GitBranch className="mr-2 h-4 w-4" />
                Nouveau Déploiement
              </Button>
              <Button variant="outline" className="border-mkb-yellow text-mkb-yellow hover:bg-mkb-yellow hover:text-white">
                <Bug className="mr-2 h-4 w-4" />
                Signaler Bug
              </Button>
              <Button variant="outline" className="border-gray-300">
                <Zap className="mr-2 h-4 w-4" />
                Lancer Script
              </Button>
              <Button variant="outline" className="border-gray-300">
                <Shield className="mr-2 h-4 w-4" />
                Scan Sécurité
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Footer */}
      <motion.div
        className="text-center py-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <p className="text-sm text-gray-500">
          Pôle Technique - <span className="text-mkb-blue font-semibold">#mkbpilot</span>
        </p>
      </motion.div>
    </div>
  );
}