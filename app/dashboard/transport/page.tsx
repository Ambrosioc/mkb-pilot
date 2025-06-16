'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Truck, 
  Package, 
  Calendar, 
  History,
  Handshake,
  MapPin,
  Clock,
  CheckCircle,
  AlertTriangle,
  Users,
  Route,
  Fuel,
  TrendingUp
} from 'lucide-react';

const transportMetrics = [
  {
    title: 'Livraisons en cours',
    value: '23',
    change: '+5',
    icon: Package,
    color: 'text-green-600',
  },
  {
    title: 'Chauffeurs actifs',
    value: '12',
    change: '+2',
    icon: Users,
    color: 'text-mkb-blue',
  },
  {
    title: 'Véhicules disponibles',
    value: '8/15',
    change: '53%',
    icon: Truck,
    color: 'text-purple-600',
  },
  {
    title: 'Taux de livraison',
    value: '94%',
    change: '+3%',
    icon: TrendingUp,
    color: 'text-mkb-yellow',
  },
];

const transportSections = [
  {
    title: 'Suivi des livraisons',
    description: 'Tracking en temps réel des livraisons en cours',
    icon: Package,
    status: 'active',
    livraisons: 23,
    enCours: 18,
    progress: 78,
  },
  {
    title: 'Planning des chauffeurs',
    description: 'Organisation des tournées et planning équipe',
    icon: Calendar,
    status: 'active',
    chauffeurs: 12,
    disponibles: 8,
    progress: 92,
  },
  {
    title: 'Historique des transports',
    description: 'Archive des livraisons et statistiques',
    icon: History,
    status: 'monitoring',
    transports: 1247,
    moisDernier: 156,
    progress: 85,
  },
  {
    title: 'Partenaires logistiques',
    description: 'Gestion des transporteurs et sous-traitants',
    icon: Handshake,
    status: 'active',
    partenaires: 8,
    actifs: 6,
    progress: 88,
  },
];

const livraisons = [
  { 
    id: 'LIV-2024-001', 
    destination: 'Paris 15ème', 
    chauffeur: 'Jean Dupont', 
    status: 'en-route', 
    eta: '14:30',
    vehicules: 3
  },
  { 
    id: 'LIV-2024-002', 
    destination: 'Lyon Centre', 
    chauffeur: 'Marie Martin', 
    status: 'livree', 
    eta: '12:15',
    vehicules: 2
  },
  { 
    id: 'LIV-2024-003', 
    destination: 'Marseille Nord', 
    chauffeur: 'Pierre Durand', 
    status: 'retard', 
    eta: '16:45',
    vehicules: 1
  },
  { 
    id: 'LIV-2024-004', 
    destination: 'Toulouse Sud', 
    chauffeur: 'Sophie Laurent', 
    status: 'planifiee', 
    eta: '09:00',
    vehicules: 4
  },
];

export default function TransportPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-3"
      >
        <Truck className="h-8 w-8 text-mkb-blue" />
        <div>
          <h1 className="text-3xl font-bold text-mkb-black">
            Pôle Transport
          </h1>
          <p className="text-gray-600">
            Gestion des livraisons, planning chauffeurs et partenaires logistiques
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
        {transportMetrics.map((metric) => {
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

      {/* Transport Sections */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {transportSections.map((section, index) => {
          const Icon = section.icon;
          const getStatusColor = (status: string) => {
            switch (status) {
              case 'active': return 'bg-green-100 text-green-800';
              case 'monitoring': return 'bg-orange-100 text-orange-800';
              default: return 'bg-gray-100 text-gray-800';
            }
          };

          const getStatusText = (status: string) => {
            switch (status) {
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
                        section.progress >= 90 ? 'bg-green-500' :
                        section.progress >= 80 ? 'bg-mkb-blue' :
                        'bg-orange-500'
                      }`}
                      style={{ width: `${section.progress}%` }}
                    ></div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="font-semibold text-mkb-black">
                        {section.livraisons || section.chauffeurs || section.transports || section.partenaires}
                      </div>
                      <div className="text-gray-500">
                        {section.livraisons ? 'Livraisons' : 
                         section.chauffeurs ? 'Chauffeurs' : 
                         section.transports ? 'Transports' : 
                         'Partenaires'}
                      </div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="font-semibold text-mkb-black">
                        {section.enCours || section.disponibles || section.moisDernier || section.actifs}
                      </div>
                      <div className="text-gray-500">
                        {section.enCours ? 'En cours' : 
                         section.disponibles ? 'Disponibles' : 
                         section.moisDernier ? 'Ce mois' : 
                         'Actifs'}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </motion.div>

      {/* Livraisons en cours */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-mkb-black flex items-center gap-2">
              <Route className="h-5 w-5" />
              Livraisons en Cours
            </CardTitle>
            <CardDescription>
              Suivi en temps réel des livraisons actives
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {livraisons.map((livraison, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`h-3 w-3 rounded-full ${
                      livraison.status === 'livree' ? 'bg-green-500' :
                      livraison.status === 'en-route' ? 'bg-mkb-blue' :
                      livraison.status === 'retard' ? 'bg-red-500' :
                      'bg-gray-400'
                    }`}></div>
                    <div>
                      <p className="font-medium text-mkb-black">{livraison.id}</p>
                      <p className="text-xs text-gray-500">
                        <MapPin className="inline h-3 w-3 mr-1" />
                        {livraison.destination} • {livraison.chauffeur}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge 
                      variant="secondary"
                      className={
                        livraison.status === 'livree' ? 'bg-green-100 text-green-800' :
                        livraison.status === 'en-route' ? 'bg-blue-100 text-blue-800' :
                        livraison.status === 'retard' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }
                    >
                      {livraison.status === 'livree' ? 'Livrée' :
                       livraison.status === 'en-route' ? 'En route' :
                       livraison.status === 'retard' ? 'Retard' :
                       'Planifiée'}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">
                      <Clock className="inline h-3 w-3 mr-1" />
                      ETA: {livraison.eta}
                    </p>
                    <p className="text-xs text-mkb-blue">
                      {livraison.vehicules} véhicule{livraison.vehicules > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Performance Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-mkb-black flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Performance Transport
            </CardTitle>
            <CardDescription>
              Indicateurs clés de performance logistique
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-600 mb-1">94%</div>
                <div className="text-sm text-green-700">Taux de livraison</div>
                <div className="text-xs text-green-600 mt-1">+3% vs mois dernier</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Clock className="h-8 w-8 text-mkb-blue mx-auto mb-2" />
                <div className="text-2xl font-bold text-mkb-blue mb-1">2.3h</div>
                <div className="text-sm text-blue-700">Temps moyen</div>
                <div className="text-xs text-blue-600 mt-1">-15min vs objectif</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <Fuel className="h-8 w-8 text-mkb-yellow mx-auto mb-2" />
                <div className="text-2xl font-bold text-mkb-yellow mb-1">€2,450</div>
                <div className="text-sm text-yellow-700">Coût carburant</div>
                <div className="text-xs text-yellow-600 mt-1">-8% vs mois dernier</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Route className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-600 mb-1">1,247</div>
                <div className="text-sm text-purple-700">Km parcourus</div>
                <div className="text-xs text-purple-600 mt-1">+12% vs mois dernier</div>
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
                <Package className="mr-2 h-4 w-4" />
                Nouvelle Livraison
              </Button>
              <Button variant="outline" className="border-mkb-yellow text-mkb-yellow hover:bg-mkb-yellow hover:text-white">
                <Calendar className="mr-2 h-4 w-4" />
                Planning Chauffeurs
              </Button>
              <Button variant="outline" className="border-gray-300">
                <History className="mr-2 h-4 w-4" />
                Historique
              </Button>
              <Button variant="outline" className="border-gray-300">
                <Handshake className="mr-2 h-4 w-4" />
                Partenaires
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
          Pôle Transport - <span className="text-mkb-blue font-semibold">#mkbpilot</span>
        </p>
      </motion.div>
    </div>
  );
}