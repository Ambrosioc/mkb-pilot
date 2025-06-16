'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  DollarSign, 
  Settings, 
  Users,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  Calculator,
  UserCheck
} from 'lucide-react';

const acsgMetrics = [
  {
    title: 'Factures Traitées',
    value: '1,247',
    change: '+8%',
    icon: FileText,
    color: 'text-green-600',
  },
  {
    title: 'Règlements En Cours',
    value: '€89,450',
    change: '-12%',
    icon: DollarSign,
    color: 'text-mkb-blue',
  },
  {
    title: 'Tickets SAV',
    value: '23',
    change: '+5',
    icon: Settings,
    color: 'text-orange-600',
  },
  {
    title: 'Employés Actifs',
    value: '47',
    change: '+2',
    icon: Users,
    color: 'text-mkb-yellow',
  },
];

const acsgSections = [
  {
    title: 'Factures',
    description: 'Gestion et traitement des factures clients et fournisseurs',
    icon: FileText,
    status: 'active',
    tasks: ['Émission factures', 'Validation comptable', 'Archivage numérique'],
    completion: 92,
  },
  {
    title: 'Suivi Règlements',
    description: 'Monitoring des paiements et relances clients',
    icon: DollarSign,
    status: 'active',
    tasks: ['Relances automatiques', 'Suivi encaissements', 'Reporting financier'],
    completion: 87,
  },
  {
    title: 'SAV',
    description: 'Service après-vente et support client',
    icon: Settings,
    status: 'attention',
    tasks: ['Tickets support', 'Résolution problèmes', 'Satisfaction client'],
    completion: 78,
  },
  {
    title: 'RH',
    description: 'Gestion des ressources humaines et administration',
    icon: Users,
    status: 'active',
    tasks: ['Gestion paie', 'Recrutement', 'Formation équipes'],
    completion: 85,
  },
];

export default function ACSGPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-3"
      >
        <FileText className="h-8 w-8 text-mkb-blue" />
        <div>
          <h1 className="text-3xl font-bold text-mkb-black">
            Pôle ACSG
          </h1>
          <p className="text-gray-600">
            Administration, Comptabilité, SAV et Gestion RH
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
        {acsgMetrics.map((metric) => {
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

      {/* Sections Overview */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {acsgSections.map((section, index) => {
          const Icon = section.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-mkb-black flex items-center gap-2">
                    <Icon className="h-5 w-5 text-mkb-blue" />
                    {section.title}
                  </CardTitle>
                  <Badge 
                    variant={section.status === 'active' ? 'default' : 'destructive'}
                    className={section.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}
                  >
                    {section.status === 'active' ? 'Actif' : 'Attention'}
                  </Badge>
                </div>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Progression</span>
                    <span className="text-sm font-bold text-mkb-blue">{section.completion}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        section.completion >= 90 ? 'bg-green-500' :
                        section.completion >= 80 ? 'bg-mkb-blue' :
                        'bg-orange-500'
                      }`}
                      style={{ width: `${section.completion}%` }}
                    ></div>
                  </div>
                  <div className="space-y-1">
                    {section.tasks.map((task, taskIndex) => (
                      <div key={taskIndex} className="flex items-center text-xs text-gray-600">
                        <CheckCircle className="w-3 h-3 text-green-500 mr-2" />
                        {task}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </motion.div>

      {/* Financial Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-mkb-black flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Aperçu Financier
            </CardTitle>
            <CardDescription>
              Situation comptable et financière du mois
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600 mb-1">€2.1M</div>
                <div className="text-sm text-green-700">Chiffre d'Affaires</div>
                <div className="text-xs text-green-600 mt-1">+15% vs N-1</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-mkb-blue mb-1">€1.7M</div>
                <div className="text-sm text-blue-700">Encaissements</div>
                <div className="text-xs text-blue-600 mt-1">81% du CA</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600 mb-1">€89K</div>
                <div className="text-sm text-orange-700">En Attente</div>
                <div className="text-xs text-orange-600 mt-1">-12% vs mois dernier</div>
              </div>
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
                  action: 'Facture #2024-0156 émise',
                  time: 'Il y a 2h',
                  status: 'success'
                },
                {
                  action: 'Relance client Dupont SA',
                  time: 'Il y a 4h',
                  status: 'warning'
                },
                {
                  action: 'Ticket SAV #789 résolu',
                  time: 'Il y a 6h',
                  status: 'success'
                },
                {
                  action: 'Nouveau collaborateur intégré',
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

        <Card>
          <CardHeader>
            <CardTitle className="text-mkb-black flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Équipe ACSG
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: 'Marie Dubois', role: 'Responsable Comptabilité', status: 'online' },
                { name: 'Jean Martin', role: 'Gestionnaire SAV', status: 'online' },
                { name: 'Sophie Laurent', role: 'RH Manager', status: 'away' },
                { name: 'Pierre Durand', role: 'Assistant Administratif', status: 'offline' }
              ].map((member, index) => (
                <div key={index} className="flex items-center gap-3 p-2">
                  <div className="w-8 h-8 bg-mkb-blue rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-mkb-black">{member.name}</p>
                    <p className="text-xs text-gray-500">{member.role}</p>
                  </div>
                  <div className={`h-2 w-2 rounded-full ${
                    member.status === 'online' ? 'bg-green-500' :
                    member.status === 'away' ? 'bg-yellow-500' :
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
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-mkb-black">Actions Rapides</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button className="bg-mkb-blue hover:bg-mkb-blue/90 text-white">
                <FileText className="mr-2 h-4 w-4" />
                Nouvelle Facture
              </Button>
              <Button variant="outline" className="border-mkb-yellow text-mkb-yellow hover:bg-mkb-yellow hover:text-white">
                <DollarSign className="mr-2 h-4 w-4" />
                Suivi Règlements
              </Button>
              <Button variant="outline" className="border-gray-300">
                <Settings className="mr-2 h-4 w-4" />
                Tickets SAV
              </Button>
              <Button variant="outline" className="border-gray-300">
                <Users className="mr-2 h-4 w-4" />
                Gestion RH
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
          Pôle ACSG - <span className="text-mkb-blue font-semibold">#mkbpilot</span>
        </p>
      </motion.div>
    </div>
  );
}