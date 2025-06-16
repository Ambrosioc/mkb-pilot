'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Server, 
  Settings, 
  Zap,
  Monitor,
  Wifi,
  HardDrive,
  Cpu,
  MemoryStick,
  Network,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity
} from 'lucide-react';

const itMetrics = [
  {
    title: 'Serveurs Actifs',
    value: '12/12',
    change: '100%',
    icon: Server,
    color: 'text-green-600',
  },
  {
    title: 'Postes Maintenus',
    value: '47',
    change: '+3',
    icon: Monitor,
    color: 'text-mkb-blue',
  },
  {
    title: 'Uptime Réseau',
    value: '99.9%',
    change: '+0.1%',
    icon: Network,
    color: 'text-purple-600',
  },
  {
    title: 'Optimisations',
    value: '23',
    change: '+8',
    icon: Zap,
    color: 'text-mkb-yellow',
  },
];

const itSections = [
  {
    title: 'Réseau & Infrastructure',
    description: 'Gestion des serveurs, réseau et infrastructure IT',
    icon: Network,
    status: 'operational',
    servers: 12,
    bandwidth: '1Gb/s',
    progress: 98,
  },
  {
    title: 'Maintenance Postes',
    description: 'Support et maintenance des postes de travail',
    icon: Monitor,
    status: 'active',
    workstations: 47,
    tickets: 8,
    progress: 85,
  },
  {
    title: 'Optimisation',
    description: 'Performance et optimisation des systèmes',
    icon: Zap,
    status: 'monitoring',
    optimizations: 23,
    savings: '15%',
    progress: 92,
  },
];

const networkStatus = [
  { device: 'Routeur Principal', status: 'online', ip: '192.168.1.1', uptime: '45 jours' },
  { device: 'Switch Core', status: 'online', ip: '192.168.1.2', uptime: '45 jours' },
  { device: 'Firewall', status: 'online', ip: '192.168.1.3', uptime: '30 jours' },
  { device: 'Access Point WiFi', status: 'warning', ip: '192.168.1.10', uptime: '2 jours' },
];

const serverMetrics = [
  { name: 'CPU Usage', value: 23, unit: '%', status: 'good' },
  { name: 'RAM Usage', value: 67, unit: '%', status: 'warning' },
  { name: 'Disk Usage', value: 45, unit: '%', status: 'good' },
  { name: 'Network I/O', value: 12, unit: 'MB/s', status: 'good' },
];

export default function ITPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-3"
      >
        <Server className="h-8 w-8 text-mkb-blue" />
        <div>
          <h1 className="text-3xl font-bold text-mkb-black">
            IT / Réseau
          </h1>
          <p className="text-gray-600">
            Infrastructure, réseau et maintenance des équipements informatiques
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
        {itMetrics.map((metric) => {
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

      {/* IT Sections */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {itSections.map((section, index) => {
          const Icon = section.icon;
          const getStatusColor = (status: string) => {
            switch (status) {
              case 'operational': return 'bg-green-100 text-green-800';
              case 'active': return 'bg-blue-100 text-blue-800';
              case 'monitoring': return 'bg-orange-100 text-orange-800';
              default: return 'bg-gray-100 text-gray-800';
            }
          };

          const getStatusText = (status: string) => {
            switch (status) {
              case 'operational': return 'Opérationnel';
              case 'active': return 'Actif';
              case 'monitoring': return 'Surveillance';
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
                        {section.servers || section.workstations || section.optimizations}
                      </div>
                      <div className="text-gray-500">
                        {section.servers ? 'Serveurs' : 
                         section.workstations ? 'Postes' : 
                         'Optimisations'}
                      </div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="font-semibold text-mkb-black">
                        {section.bandwidth || section.tickets || section.savings}
                      </div>
                      <div className="text-gray-500">
                        {section.bandwidth ? 'Bande passante' : 
                         section.tickets ? 'Tickets' : 
                         'Économies'}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </motion.div>

      {/* Network Status & Server Metrics */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-mkb-black flex items-center gap-2">
              <Wifi className="h-5 w-5" />
              État du Réseau
            </CardTitle>
            <CardDescription>
              Status des équipements réseau critiques
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {networkStatus.map((device, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`h-3 w-3 rounded-full ${
                      device.status === 'online' ? 'bg-green-500' :
                      device.status === 'warning' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}></div>
                    <div>
                      <p className="font-medium text-mkb-black">{device.device}</p>
                      <p className="text-xs text-gray-500">{device.ip}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-mkb-blue">{device.uptime}</p>
                    <p className="text-xs text-gray-500">uptime</p>
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
              Métriques Serveurs
            </CardTitle>
            <CardDescription>
              Performance en temps réel des serveurs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {serverMetrics.map((metric, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-mkb-black">{metric.name}</span>
                    <span className="text-sm font-bold text-mkb-blue">
                      {metric.value}{metric.unit}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        metric.status === 'good' ? 'bg-green-500' :
                        metric.status === 'warning' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(metric.value, 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Infrastructure Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-mkb-black flex items-center gap-2">
              <HardDrive className="h-5 w-5" />
              Vue d'ensemble Infrastructure
            </CardTitle>
            <CardDescription>
              Capacités et utilisation des ressources
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Cpu className="h-8 w-8 text-mkb-blue mx-auto mb-2" />
                <div className="text-2xl font-bold text-mkb-blue mb-1">23%</div>
                <div className="text-sm text-blue-700">CPU Global</div>
                <div className="text-xs text-blue-600 mt-1">48 cores disponibles</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <MemoryStick className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-600 mb-1">67%</div>
                <div className="text-sm text-green-700">RAM Utilisée</div>
                <div className="text-xs text-green-600 mt-1">128GB total</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <HardDrive className="h-8 w-8 text-mkb-yellow mx-auto mb-2" />
                <div className="text-2xl font-bold text-mkb-yellow mb-1">45%</div>
                <div className="text-sm text-yellow-700">Stockage</div>
                <div className="text-xs text-yellow-600 mt-1">5TB total</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Network className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-600 mb-1">12MB/s</div>
                <div className="text-sm text-purple-700">Trafic Réseau</div>
                <div className="text-xs text-purple-600 mt-1">1Gb/s disponible</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Activities */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
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
                  action: 'Maintenance serveur DB terminée',
                  time: 'Il y a 1h',
                  status: 'success'
                },
                {
                  action: 'Mise à jour firewall appliquée',
                  time: 'Il y a 3h',
                  status: 'success'
                },
                {
                  action: 'Remplacement disque dur Poste #23',
                  time: 'Il y a 5h',
                  status: 'success'
                },
                {
                  action: 'Optimisation réseau WiFi',
                  time: 'Hier',
                  status: 'info'
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
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-mkb-black">Actions Rapides</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button className="bg-mkb-blue hover:bg-mkb-blue/90 text-white">
                <Server className="mr-2 h-4 w-4" />
                Monitoring Serveurs
              </Button>
              <Button variant="outline" className="border-mkb-yellow text-mkb-yellow hover:bg-mkb-yellow hover:text-white">
                <Monitor className="mr-2 h-4 w-4" />
                Support Poste
              </Button>
              <Button variant="outline" className="border-gray-300">
                <Network className="mr-2 h-4 w-4" />
                Test Réseau
              </Button>
              <Button variant="outline" className="border-gray-300">
                <Zap className="mr-2 h-4 w-4" />
                Optimisation
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
        transition={{ duration: 0.5, delay: 0.7 }}
      >
        <p className="text-sm text-gray-500">
          IT / Réseau - <span className="text-mkb-blue font-semibold">#mkbpilot</span>
        </p>
      </motion.div>
    </div>
  );
}