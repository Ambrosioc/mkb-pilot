'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Target,
  Shield,
  Megaphone,
  Code,
  Server,
  FileText,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';

const kpisByPole = [
  {
    pole: 'Commercial',
    icon: Target,
    color: 'text-mkb-blue',
    kpis: [
      { name: 'Ventes Mensuelles', value: '€1.8M', change: '+22%', trend: 'up' },
      { name: 'Leads Actifs', value: '347', change: '+15%', trend: 'up' },
      { name: 'Taux Conversion', value: '23.5%', change: '+3.2%', trend: 'up' },
      { name: 'Véhicules Vendus', value: '156', change: '+18%', trend: 'up' }
    ]
  },
  {
    pole: 'Marketing',
    icon: Megaphone,
    color: 'text-purple-600',
    kpis: [
      { name: 'Impressions Totales', value: '2.4M', change: '+32%', trend: 'up' },
      { name: 'Clics Générés', value: '45,678', change: '+18%', trend: 'up' },
      { name: 'ROI Campagnes', value: '340%', change: '+45%', trend: 'up' },
      { name: 'Leads Qualifiés', value: '1,234', change: '+25%', trend: 'up' }
    ]
  },
  {
    pole: 'Technique',
    icon: Code,
    color: 'text-green-600',
    kpis: [
      { name: 'Uptime Système', value: '99.8%', change: '+0.2%', trend: 'up' },
      { name: 'Bugs Résolus', value: '47', change: '+12', trend: 'up' },
      { name: 'Déploiements', value: '23', change: '+8', trend: 'up' },
      { name: 'Automatisations', value: '156', change: '+15', trend: 'up' }
    ]
  },
  {
    pole: 'ACSG',
    icon: FileText,
    color: 'text-orange-600',
    kpis: [
      { name: 'Factures Traitées', value: '1,247', change: '+8%', trend: 'up' },
      { name: 'Règlements En Cours', value: '€89,450', change: '-12%', trend: 'down' },
      { name: 'Tickets SAV', value: '23', change: '+5', trend: 'up' },
      { name: 'Satisfaction RH', value: '94%', change: '+3%', trend: 'up' }
    ]
  },
  {
    pole: 'IT/Réseau',
    icon: Server,
    color: 'text-blue-600',
    kpis: [
      { name: 'Serveurs Actifs', value: '12/12', change: '100%', trend: 'stable' },
      { name: 'Postes Maintenus', value: '47', change: '+3', trend: 'up' },
      { name: 'Uptime Réseau', value: '99.9%', change: '+0.1%', trend: 'up' },
      { name: 'Optimisations', value: '23', change: '+8', trend: 'up' }
    ]
  }
];

const globalTrends = [
  { metric: 'Chiffre d\'Affaires', current: 2400000, previous: 2030000, target: 2500000 },
  { metric: 'Véhicules Traités', current: 1847, previous: 1650, target: 1900 },
  { metric: 'Satisfaction Client', current: 94, previous: 91, target: 95 },
  { metric: 'Performance Équipes', current: 87, previous: 82, target: 90 }
];

export default function StatistiquesPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedPole, setSelectedPole] = useState('all');

  const formatValue = (value: number, type: string) => {
    if (type === 'currency') return `€${(value / 1000000).toFixed(1)}M`;
    if (type === 'number') return value.toLocaleString();
    if (type === 'percentage') return `${value}%`;
    return value.toString();
  };

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
          <h1 className="text-3xl font-bold text-mkb-black">
            Statistiques Consolidées
          </h1>
          <p className="text-gray-600">
            KPIs globaux par pôle avec tendances et analyses
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Cette semaine</SelectItem>
              <SelectItem value="month">Ce mois</SelectItem>
              <SelectItem value="quarter">Ce trimestre</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedPole} onValueChange={setSelectedPole}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Tous les pôles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les pôles</SelectItem>
              <SelectItem value="commercial">Commercial</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
              <SelectItem value="technique">Technique</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </div>
      </motion.div>

      {/* Global Trends */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-mkb-black flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Tendances Globales
            </CardTitle>
            <CardDescription>
              Évolution des métriques clés vs objectifs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {globalTrends.map((trend, index) => {
                const progress = (trend.current / trend.target) * 100;
                const change = ((trend.current - trend.previous) / trend.previous) * 100;
                
                return (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-mkb-black text-sm mb-3">{trend.metric}</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-mkb-black">
                          {formatValue(trend.current, trend.metric.includes('Affaires') ? 'currency' : 
                                                    trend.metric.includes('%') || trend.metric.includes('Satisfaction') || trend.metric.includes('Performance') ? 'percentage' : 'number')}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          change > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {change > 0 ? '+' : ''}{change.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            progress >= 100 ? 'bg-green-500' :
                            progress >= 80 ? 'bg-mkb-blue' :
                            'bg-orange-500'
                          }`}
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Objectif: {formatValue(trend.target, trend.metric.includes('Affaires') ? 'currency' : 
                                                                  trend.metric.includes('%') || trend.metric.includes('Satisfaction') || trend.metric.includes('Performance') ? 'percentage' : 'number')}</span>
                        <span>{progress.toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* KPIs by Pole */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-mkb-black">
            KPIs par Pôle
          </h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filtrer
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {kpisByPole.map((pole, poleIndex) => {
            const Icon = pole.icon;
            
            return (
              <motion.div
                key={pole.pole}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: poleIndex * 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-mkb-black flex items-center gap-2">
                      <Icon className={`h-5 w-5 ${pole.color}`} />
                      Pôle {pole.pole}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {pole.kpis.map((kpi, kpiIndex) => (
                        <motion.div
                          key={kpiIndex}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2, delay: kpiIndex * 0.05 }}
                          className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-mkb-black text-sm">{kpi.name}</h4>
                            {kpi.trend === 'up' ? (
                              <TrendingUp className="h-4 w-4 text-green-600" />
                            ) : kpi.trend === 'down' ? (
                              <TrendingDown className="h-4 w-4 text-red-600" />
                            ) : (
                              <div className="h-4 w-4 bg-gray-400 rounded-full"></div>
                            )}
                          </div>
                          <div className="space-y-1">
                            <div className="text-xl font-bold text-mkb-black">{kpi.value}</div>
                            <div className={`text-xs px-2 py-1 rounded-full inline-block ${
                              kpi.change.startsWith('+') ? 'bg-green-100 text-green-700' : 
                              kpi.change.startsWith('-') ? 'bg-red-100 text-red-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {kpi.change} vs période précédente
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Comparative Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-mkb-black flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Analyse Comparative
            </CardTitle>
            <CardDescription>
              Performance relative des pôles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between gap-4">
              {kpisByPole.map((pole, index) => {
                const avgPerformance = pole.kpis.reduce((acc, kpi) => {
                  const changeValue = parseFloat(kpi.change.replace(/[+%]/g, ''));
                  return acc + Math.abs(changeValue);
                }, 0) / pole.kpis.length;
                
                return (
                  <div key={index} className="flex flex-col items-center gap-2 flex-1">
                    <div className="flex items-end gap-1 h-40">
                      <div 
                        className={`rounded-t w-8 ${pole.color.replace('text-', 'bg-')}`}
                        style={{ height: `${(avgPerformance / 30) * 100}%` }}
                        title={pole.pole}
                      ></div>
                    </div>
                    <div className="text-center">
                      <pole.icon className={`h-4 w-4 ${pole.color} mx-auto mb-1`} />
                      <span className="text-xs text-gray-500">{pole.pole}</span>
                      <div className="text-xs font-semibold text-mkb-black">
                        {avgPerformance.toFixed(1)}%
                      </div>
                    </div>
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
          Statistiques Consolidées - <span className="text-mkb-blue font-semibold">#mkbpilot</span>
        </p>
      </motion.div>
    </div>
  );
}