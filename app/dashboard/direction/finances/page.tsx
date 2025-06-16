'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DollarSign,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Download,
  FileText,
  Calendar,
  Target,
  AlertTriangle,
  CheckCircle,
  Activity,
  Eye
} from 'lucide-react';

const financialKPIs = [
  {
    title: 'Chiffre d\'Affaires',
    value: '€2.4M',
    change: '+18%',
    target: '€2.5M',
    progress: 96,
    icon: DollarSign,
    color: 'text-green-600',
    trend: 'up'
  },
  {
    title: 'Dépenses Totales',
    value: '€1.82M',
    change: '+8%',
    target: '€1.9M',
    progress: 96,
    icon: TrendingDown,
    color: 'text-red-600',
    trend: 'up'
  },
  {
    title: 'Bénéfices',
    value: '€580K',
    change: '+38%',
    target: '€600K',
    progress: 97,
    icon: TrendingUp,
    color: 'text-mkb-blue',
    trend: 'up'
  },
  {
    title: 'Marge Nette',
    value: '24.2%',
    change: '+3.8%',
    target: '25%',
    progress: 97,
    icon: BarChart3,
    color: 'text-purple-600',
    trend: 'up'
  }
];

const monthlyData = [
  { 
    month: 'Janvier', 
    revenue: 2100000, 
    expenses: 1680000, 
    profit: 420000,
    margin: 20.0,
    growth: 15.2
  },
  { 
    month: 'Février', 
    revenue: 2250000, 
    expenses: 1750000, 
    profit: 500000,
    margin: 22.2,
    growth: 18.5
  },
  { 
    month: 'Mars', 
    revenue: 2400000, 
    expenses: 1820000, 
    profit: 580000,
    margin: 24.2,
    growth: 22.1
  }
];

const expenseBreakdown = [
  { category: 'Personnel', amount: 720000, percentage: 39.6, color: 'bg-mkb-blue' },
  { category: 'Marketing', amount: 364000, percentage: 20.0, color: 'bg-mkb-yellow' },
  { category: 'Technique', amount: 273000, percentage: 15.0, color: 'bg-green-500' },
  { category: 'Opérations', amount: 218400, percentage: 12.0, color: 'bg-purple-500' },
  { category: 'Administration', amount: 145600, percentage: 8.0, color: 'bg-orange-500' },
  { category: 'Autres', amount: 98800, percentage: 5.4, color: 'bg-gray-400' }
];

const revenueBySource = [
  { source: 'Ventes B2C', amount: 1440000, percentage: 60.0, color: 'bg-mkb-blue' },
  { source: 'Remarketing B2B', amount: 480000, percentage: 20.0, color: 'bg-mkb-yellow' },
  { source: 'Services', amount: 288000, percentage: 12.0, color: 'bg-green-500' },
  { source: 'Partenariats', amount: 144000, percentage: 6.0, color: 'bg-purple-500' },
  { source: 'Autres', amount: 48000, percentage: 2.0, color: 'bg-gray-400' }
];

const financialReports = [
  {
    id: 1,
    name: 'Rapport Mensuel Mars 2024',
    type: 'monthly',
    date: '2024-03-31',
    size: '2.1 MB',
    status: 'published'
  },
  {
    id: 2,
    name: 'Analyse Trimestrielle Q1',
    type: 'quarterly',
    date: '2024-03-31',
    size: '3.8 MB',
    status: 'draft'
  },
  {
    id: 3,
    name: 'Budget Prévisionnel Q2',
    type: 'budget',
    date: '2024-03-25',
    size: '1.9 MB',
    status: 'review'
  },
  {
    id: 4,
    name: 'Analyse ROI Campagnes',
    type: 'analysis',
    date: '2024-03-20',
    size: '1.4 MB',
    status: 'published'
  }
];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

const formatPercentage = (value: number) => {
  return `${value.toFixed(1)}%`;
};

export default function FinancesPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [selectedView, setSelectedView] = useState('overview');

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
          <DollarSign className="h-8 w-8 text-mkb-blue" />
          <div>
            <h1 className="text-3xl font-bold text-mkb-black">
              Analyse Financière
            </h1>
            <p className="text-gray-600">
              Suivi des performances financières et rapports comptables
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Mensuel</SelectItem>
              <SelectItem value="quarterly">Trimestriel</SelectItem>
              <SelectItem value="yearly">Annuel</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
      </motion.div>

      {/* Financial KPIs */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {financialKPIs.map((kpi, index) => {
          const Icon = kpi.icon;
          
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {kpi.title}
                  </CardTitle>
                  <Icon className={`h-4 w-4 ${kpi.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold text-mkb-black">{kpi.value}</div>
                      <div className={`text-xs px-2 py-1 rounded-full ${
                        kpi.trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {kpi.change}
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Objectif: {kpi.target}</span>
                        <span className="font-medium">{kpi.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            kpi.progress >= 95 ? 'bg-green-500' :
                            kpi.progress >= 80 ? 'bg-mkb-blue' :
                            'bg-orange-500'
                          }`}
                          style={{ width: `${Math.min(kpi.progress, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Main Financial Charts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Tabs value={selectedView} onValueChange={setSelectedView}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="revenue">Revenus</TabsTrigger>
            <TabsTrigger value="expenses">Dépenses</TabsTrigger>
            <TabsTrigger value="reports">Rapports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-mkb-black flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Évolution Financière
                </CardTitle>
                <CardDescription>
                  Revenus, dépenses et bénéfices sur 3 mois
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex items-end justify-between gap-8">
                  {monthlyData.map((data, index) => (
                    <div key={index} className="flex flex-col items-center gap-4 flex-1">
                      <div className="flex items-end gap-2 h-60">
                        <div className="flex flex-col items-center gap-1">
                          <div 
                            className="bg-green-500 rounded-t w-8"
                            style={{ height: `${(data.revenue / 2500000) * 200}px` }}
                            title="Revenus"
                          ></div>
                          <span className="text-xs text-gray-500 transform -rotate-90 whitespace-nowrap">
                            Revenus
                          </span>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                          <div 
                            className="bg-red-500 rounded-t w-8"
                            style={{ height: `${(data.expenses / 2500000) * 200}px` }}
                            title="Dépenses"
                          ></div>
                          <span className="text-xs text-gray-500 transform -rotate-90 whitespace-nowrap">
                            Dépenses
                          </span>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                          <div 
                            className="bg-mkb-blue rounded-t w-8"
                            style={{ height: `${(data.profit / 2500000) * 200}px` }}
                            title="Bénéfices"
                          ></div>
                          <span className="text-xs text-gray-500 transform -rotate-90 whitespace-nowrap">
                            Bénéfices
                          </span>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-mkb-black">{data.month}</div>
                        <div className="text-xs text-gray-500">Marge: {formatPercentage(data.margin)}</div>
                        <div className="text-xs text-green-600">+{formatPercentage(data.growth)}</div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-center gap-8 mt-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span>Revenus</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                    <span>Dépenses</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-mkb-blue rounded"></div>
                    <span>Bénéfices</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-mkb-black">Répartition des Revenus</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {revenueBySource.map((source, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{source.source}</span>
                          <div className="text-right">
                            <div className="font-semibold">{formatCurrency(source.amount)}</div>
                            <div className="text-xs text-gray-500">{formatPercentage(source.percentage)}</div>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${source.color}`}
                            style={{ width: `${source.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-mkb-black">Analyse de Croissance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {monthlyData.map((data, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium">{data.month}</div>
                          <div className="text-sm text-gray-500">{formatCurrency(data.revenue)}</div>
                        </div>
                        <div className="text-right">
                          <div className={`font-semibold ${
                            data.growth > 20 ? 'text-green-600' :
                            data.growth > 15 ? 'text-mkb-blue' :
                            'text-orange-600'
                          }`}>
                            +{formatPercentage(data.growth)}
                          </div>
                          <div className="text-xs text-gray-500">croissance</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="expenses" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-mkb-black">Répartition des Dépenses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {expenseBreakdown.map((expense, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{expense.category}</span>
                          <div className="text-right">
                            <div className="font-semibold">{formatCurrency(expense.amount)}</div>
                            <div className="text-xs text-gray-500">{formatPercentage(expense.percentage)}</div>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${expense.color}`}
                            style={{ width: `${expense.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-mkb-black">Optimisations Possibles</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <div className="font-medium text-green-800">Personnel optimisé</div>
                        <div className="text-sm text-green-600">Économies: €45K/mois</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-orange-600" />
                      <div>
                        <div className="font-medium text-orange-800">Marketing à optimiser</div>
                        <div className="text-sm text-orange-600">Potentiel: €25K/mois</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <Activity className="h-5 w-5 text-mkb-blue" />
                      <div>
                        <div className="font-medium text-blue-800">Technique efficace</div>
                        <div className="text-sm text-blue-600">ROI: 340%</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-mkb-black flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Rapports Financiers
                </CardTitle>
                <CardDescription>
                  Accès aux rapports comptables et analyses financières
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {financialReports.map((report, index) => (
                    <motion.div
                      key={report.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-mkb-blue/10 rounded-lg">
                          <FileText className="h-5 w-5 text-mkb-blue" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-mkb-black">{report.name}</h3>
                          <p className="text-sm text-gray-500">{report.date} • {report.size}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={
                          report.status === 'published' ? 'bg-green-100 text-green-800' :
                          report.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }>
                          {report.status === 'published' ? 'Publié' :
                           report.status === 'draft' ? 'Brouillon' :
                           'En révision'}
                        </Badge>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Footer */}
      <motion.div
        className="text-center py-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <p className="text-sm text-gray-500">
          Analyse Financière - <span className="text-mkb-blue font-semibold">#mkbpilot</span>
        </p>
      </motion.div>
    </div>
  );
}