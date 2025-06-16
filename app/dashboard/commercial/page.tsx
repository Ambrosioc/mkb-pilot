'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingCart, 
  Users, 
  Building2, 
  Package,
  TrendingUp,
  DollarSign,
  Phone,
  Target,
  Calendar,
  BarChart3
} from 'lucide-react';

const commercialMetrics = [
  {
    title: 'Ventes Mensuelles',
    value: '€1.8M',
    change: '+22%',
    icon: DollarSign,
    color: 'text-green-600',
  },
  {
    title: 'Leads Actifs',
    value: '347',
    change: '+15%',
    icon: Users,
    color: 'text-mkb-blue',
  },
  {
    title: 'Taux Conversion',
    value: '23.5%',
    change: '+3.2%',
    icon: Target,
    color: 'text-purple-600',
  },
  {
    title: 'Véhicules Vendus',
    value: '156',
    change: '+18%',
    icon: Package,
    color: 'text-mkb-yellow',
  },
];

const commercialSections = [
  {
    title: 'Vente B2C',
    description: 'Gestion des ventes particuliers et relation client',
    icon: Users,
    activities: ['Leads & RDV', 'Relances commerciales', 'Classement vendeurs', 'Pipeline'],
    performance: 89,
  },
  {
    title: 'Achats / Reprises',
    description: 'Acquisition véhicules et dépôt-vente',
    icon: Package,
    activities: ['Véhicules repris', 'Rentabilité', 'Délais mise en vente'],
    performance: 76,
  },
  {
    title: 'Remarketing B2B',
    description: 'Relations professionnelles et marchands',
    icon: Building2,
    activities: ['Marchands actifs', 'Relances B2B', 'Satisfaction marchands'],
    performance: 82,
  },
];

export default function CommercialPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-3"
      >
        <ShoppingCart className="h-8 w-8 text-mkb-blue" />
        <div>
          <h1 className="text-3xl font-bold text-mkb-black">
            Pôle Commercial
          </h1>
          <p className="text-gray-600">
            Gestion des ventes B2C, achats/reprises et remarketing B2B
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
        {commercialMetrics.map((metric) => {
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
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {commercialSections.map((section, index) => {
          const Icon = section.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-mkb-black flex items-center gap-2">
                  <Icon className="h-5 w-5 text-mkb-blue" />
                  {section.title}
                </CardTitle>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Performance</span>
                    <span className="text-sm font-bold text-mkb-blue">{section.performance}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-mkb-blue h-2 rounded-full transition-all duration-300"
                      style={{ width: `${section.performance}%` }}
                    ></div>
                  </div>
                  <div className="space-y-1">
                    {section.activities.map((activity, actIndex) => (
                      <div key={actIndex} className="flex items-center text-xs text-gray-600">
                        <div className="w-1.5 h-1.5 bg-mkb-yellow rounded-full mr-2"></div>
                        {activity}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </motion.div>

      {/* Performance Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-mkb-black flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Performance Commerciale
            </CardTitle>
            <CardDescription>
              Évolution des ventes sur les 6 derniers mois
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between gap-4">
              {[
                { month: 'Jan', b2c: 85, b2b: 65, achats: 45 },
                { month: 'Fév', b2c: 78, b2b: 72, achats: 52 },
                { month: 'Mar', b2c: 92, b2b: 68, achats: 48 },
                { month: 'Avr', b2c: 88, b2b: 75, achats: 55 },
                { month: 'Mai', b2c: 95, b2b: 82, achats: 62 },
                { month: 'Jun', b2c: 89, b2b: 79, achats: 58 },
              ].map((data, index) => (
                <div key={index} className="flex flex-col items-center gap-2 flex-1">
                  <div className="flex items-end gap-1 h-40">
                    <div 
                      className="bg-mkb-blue rounded-t w-4"
                      style={{ height: `${(data.b2c / 100) * 100}%` }}
                      title="B2C"
                    ></div>
                    <div 
                      className="bg-mkb-yellow rounded-t w-4"
                      style={{ height: `${(data.b2b / 100) * 100}%` }}
                      title="B2B"
                    ></div>
                    <div 
                      className="bg-gray-400 rounded-t w-4"
                      style={{ height: `${(data.achats / 100) * 100}%` }}
                      title="Achats"
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500">{data.month}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-6 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-mkb-blue rounded-full"></div>
                <span>Vente B2C</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-mkb-yellow rounded-full"></div>
                <span>Remarketing B2B</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                <span>Achats/Reprises</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-mkb-black">Actions Rapides</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button className="bg-mkb-blue hover:bg-mkb-blue/90 text-white">
                <Phone className="mr-2 h-4 w-4" />
                Relances Jour
              </Button>
              <Button variant="outline" className="border-mkb-yellow text-mkb-yellow hover:bg-mkb-yellow hover:text-white">
                <Calendar className="mr-2 h-4 w-4" />
                Planifier RDV
              </Button>
              <Button variant="outline" className="border-gray-300">
                <TrendingUp className="mr-2 h-4 w-4" />
                Rapport Ventes
              </Button>
              <Button variant="outline" className="border-gray-300">
                <Target className="mr-2 h-4 w-4" />
                Objectifs Équipe
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
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <p className="text-sm text-gray-500">
          Pôle Commercial - <span className="text-mkb-blue font-semibold">#mkbpilot</span>
        </p>
      </motion.div>
    </div>
  );
}