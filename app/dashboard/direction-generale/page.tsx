'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Crown,
  TrendingUp,
  Users,
  DollarSign,
  Target,
  BarChart3,
  Calendar,
  FileText,
  Upload,
  Download,
  Eye,
  Filter,
  Plus,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  PieChart,
  LineChart,
  Building2,
  Briefcase,
  Shield,
  Zap
} from 'lucide-react';

// Mock data pour les KPI consolidés
const consolidatedKPIs = [
  {
    title: 'Chiffre d\'Affaires Total',
    value: '€2.4M',
    change: '+18%',
    icon: DollarSign,
    color: 'text-green-600',
    period: 'Ce mois'
  },
  {
    title: 'Véhicules Traités',
    value: '1,847',
    change: '+12%',
    icon: Target,
    color: 'text-mkb-blue',
    period: 'Ce mois'
  },
  {
    title: 'Performance RH',
    value: '94%',
    change: '+3%',
    icon: Users,
    color: 'text-purple-600',
    period: 'Satisfaction'
  },
  {
    title: 'Tickets SAV',
    value: '23',
    change: '-15%',
    icon: Shield,
    color: 'text-orange-600',
    period: 'En cours'
  },
  {
    title: 'Campagnes Marketing',
    value: '12',
    change: '+4',
    icon: TrendingUp,
    color: 'text-mkb-yellow',
    period: 'Actives'
  },
  {
    title: 'ROI Global',
    value: '340%',
    change: '+45%',
    icon: BarChart3,
    color: 'text-green-600',
    period: 'Trimestre'
  }
];

// Mock data pour les performances des pôles
const polesPerformance = [
  {
    pole: 'Commercial',
    responsable: 'Marie Dubois',
    volume: 1247,
    tauxErreur: 2.1,
    progression: 89,
    deadline: '2024-03-15',
    status: 'on-track'
  },
  {
    pole: 'Technique',
    responsable: 'Jean Martin',
    volume: 156,
    tauxErreur: 0.8,
    progression: 95,
    deadline: '2024-03-20',
    status: 'ahead'
  },
  {
    pole: 'Marketing',
    responsable: 'Sophie Laurent',
    volume: 45,
    tauxErreur: 3.2,
    progression: 78,
    deadline: '2024-03-18',
    status: 'at-risk'
  },
  {
    pole: 'ACSG',
    responsable: 'Pierre Durand',
    volume: 892,
    tauxErreur: 1.5,
    progression: 87,
    deadline: '2024-03-22',
    status: 'on-track'
  },
  {
    pole: 'IT/Réseau',
    responsable: 'Claire Moreau',
    volume: 67,
    tauxErreur: 0.3,
    progression: 98,
    deadline: '2024-03-10',
    status: 'ahead'
  }
];

// Mock data pour les directeurs G4
const directorsG4 = [
  {
    name: 'Alexandre Dubois',
    role: 'CEO',
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
    status: 'on-time',
    tasksCompleted: 15,
    totalTasks: 18,
    projects: ['Migration CRM', 'Expansion Angola', 'Refonte Site'],
    lastComment: 'Excellent travail sur le Q1, objectifs dépassés',
    lastUpdate: '2h'
  },
  {
    name: 'Marie-Claire Fontaine',
    role: 'COO',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
    status: 'ahead',
    tasksCompleted: 22,
    totalTasks: 20,
    projects: ['Optimisation Processus', 'Formation Équipes'],
    lastComment: 'Processus optimisés avec succès, gains de productivité',
    lastUpdate: '4h'
  },
  {
    name: 'Thomas Leclerc',
    role: 'CTO',
    avatar: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
    status: 'on-time',
    tasksCompleted: 12,
    totalTasks: 15,
    projects: ['Infrastructure Cloud', 'Sécurité Système'],
    lastComment: 'Migration cloud en cours, sécurité renforcée',
    lastUpdate: '1h'
  },
  {
    name: 'Isabelle Moreau',
    role: 'CCO',
    avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
    status: 'behind',
    tasksCompleted: 8,
    totalTasks: 12,
    projects: ['Stratégie Client', 'Satisfaction B2B'],
    lastComment: 'Retard sur satisfaction client, plan d\'action en cours',
    lastUpdate: '6h'
  }
];

// Mock data pour les rapports
const reports = [
  {
    id: 1,
    title: 'Rapport Hebdomadaire S11',
    type: 'weekly',
    date: '2024-03-15',
    author: 'Direction Générale',
    status: 'published',
    highlights: ['CA +18%', 'Nouveaux clients +25%', 'Satisfaction 94%']
  },
  {
    id: 2,
    title: 'Analyse Mensuelle Février',
    type: 'monthly',
    date: '2024-03-01',
    author: 'Direction Générale',
    status: 'published',
    highlights: ['ROI 340%', 'Expansion Angola', 'Optimisation IT']
  },
  {
    id: 3,
    title: 'Rapport Trimestriel Q1',
    type: 'quarterly',
    date: '2024-03-31',
    author: 'Direction Générale',
    status: 'draft',
    highlights: ['Objectifs dépassés', 'Croissance 22%', 'Innovation']
  }
];

// Mock data pour les documents stratégiques
const strategicDocs = [
  {
    id: 1,
    name: 'Plan Stratégique 2024-2026',
    type: 'pdf',
    size: '2.4 MB',
    uploadDate: '2024-03-10',
    uploader: 'Alexandre Dubois',
    category: 'Stratégie'
  },
  {
    id: 2,
    name: 'Budget Prévisionnel Q2',
    type: 'xlsx',
    size: '1.8 MB',
    uploadDate: '2024-03-12',
    uploader: 'Marie-Claire Fontaine',
    category: 'Finance'
  },
  {
    id: 3,
    name: 'Roadmap Technique 2024',
    type: 'pdf',
    size: '3.1 MB',
    uploadDate: '2024-03-08',
    uploader: 'Thomas Leclerc',
    category: 'Technique'
  }
];

// Mock data pour les finances
const financialData = {
  revenue: [
    { month: 'Jan', value: 2100000 },
    { month: 'Fév', value: 2250000 },
    { month: 'Mar', value: 2400000 }
  ],
  expenses: [
    { month: 'Jan', value: 1680000 },
    { month: 'Fév', value: 1750000 },
    { month: 'Mar', value: 1820000 }
  ],
  profit: [
    { month: 'Jan', value: 420000 },
    { month: 'Fév', value: 500000 },
    { month: 'Mar', value: 580000 }
  ]
};

export default function DirectionGeneraleG4Page() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedPole, setSelectedPole] = useState('all');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ahead': return 'bg-green-100 text-green-800';
      case 'on-time': case 'on-track': return 'bg-blue-100 text-blue-800';
      case 'behind': case 'at-risk': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ahead': return 'En avance';
      case 'on-time': case 'on-track': return 'À jour';
      case 'behind': case 'at-risk': return 'En retard';
      default: return 'Inconnu';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header avec accès restreint */}
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
              Tableau de bord exécutif réservé aux membres du G4
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <Shield className="h-3 w-3 mr-1" />
            Accès Restreint
          </Badge>
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
        </div>
      </motion.div>

      {/* 1. Statistiques consolidées */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-mkb-black flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              KPI Consolidés par Pôle
            </CardTitle>
            <CardDescription>
              Indicateurs clés de performance globaux
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {consolidatedKPIs.map((kpi, index) => {
                const Icon = kpi.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Icon className={`h-5 w-5 ${kpi.color}`} />
                      <span className="text-xs text-gray-500">{kpi.period}</span>
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold text-mkb-black text-sm">{kpi.title}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-mkb-black">{kpi.value}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          kpi.change.startsWith('+') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {kpi.change}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* 2. Performances des pôles */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-mkb-black flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Performances des Pôles
                </CardTitle>
                <CardDescription>
                  Suivi détaillé des indicateurs par pôle
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Select value={selectedPole} onValueChange={setSelectedPole}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Tous les pôles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les pôles</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                    <SelectItem value="technique">Technique</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtrer
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Pôle</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Responsable</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Volume</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Taux d'erreur</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Progression</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Deadline</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {polesPerformance.map((pole, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-mkb-black">{pole.pole}</td>
                      <td className="py-3 px-4 text-gray-600">{pole.responsable}</td>
                      <td className="py-3 px-4 text-center font-semibold">{pole.volume.toLocaleString()}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          pole.tauxErreur < 1 ? 'bg-green-100 text-green-700' :
                          pole.tauxErreur < 3 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {pole.tauxErreur}%
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                pole.progression >= 90 ? 'bg-green-500' :
                                pole.progression >= 70 ? 'bg-mkb-blue' :
                                'bg-orange-500'
                              }`}
                              style={{ width: `${pole.progression}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-semibold w-10">{pole.progression}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center text-sm text-gray-600">{pole.deadline}</td>
                      <td className="py-3 px-4 text-center">
                        <Badge className={getStatusColor(pole.status)}>
                          {getStatusText(pole.status)}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* 3. Suivi des directeurs G4 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-mkb-black flex items-center gap-2">
              <Users className="h-5 w-5" />
              Suivi des Directeurs G4
            </CardTitle>
            <CardDescription>
              Performance individuelle des membres du comité de direction
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {directorsG4.map((director, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <img 
                      src={director.avatar} 
                      alt={director.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-mkb-black">{director.name}</h3>
                          <p className="text-sm text-gray-600">{director.role}</p>
                        </div>
                        <Badge className={getStatusColor(director.status)}>
                          {getStatusText(director.status)}
                        </Badge>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span>Tâches accomplies</span>
                            <span className="font-semibold">{director.tasksCompleted}/{director.totalTasks}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-mkb-blue h-2 rounded-full"
                              style={{ width: `${(director.tasksCompleted / director.totalTasks) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">Projets pilotés:</p>
                          <div className="flex flex-wrap gap-1">
                            {director.projects.map((project, pIndex) => (
                              <span key={pIndex} className="text-xs bg-mkb-blue/10 text-mkb-blue px-2 py-1 rounded">
                                {project}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 p-3 rounded">
                          <p className="text-xs text-gray-600 mb-1">Dernier commentaire CEO:</p>
                          <p className="text-sm italic">"{director.lastComment}"</p>
                          <p className="text-xs text-gray-500 mt-1">Il y a {director.lastUpdate}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* 4. Rapports et 5. Documents stratégiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rapports hebdo & mensuels */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-mkb-black flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Rapports & Timeline
                </CardTitle>
                <Button size="sm" className="bg-mkb-blue hover:bg-mkb-blue/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reports.map((report, index) => (
                  <div key={report.id} className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className={`w-3 h-3 rounded-full mt-2 ${
                      report.status === 'published' ? 'bg-green-500' : 'bg-yellow-500'
                    }`}></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-mkb-black">{report.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          {report.type === 'weekly' ? 'Hebdo' : 
                           report.type === 'monthly' ? 'Mensuel' : 'Trimestriel'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{report.date} • {report.author}</p>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {report.highlights.map((highlight, hIndex) => (
                          <span key={hIndex} className="text-xs bg-mkb-yellow/20 text-mkb-black px-2 py-1 rounded">
                            {highlight}
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-3 w-3 mr-1" />
                          Voir
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="h-3 w-3 mr-1" />
                          PDF
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Documents stratégiques */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-mkb-black flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Documents Stratégiques
                </CardTitle>
                <Button size="sm" variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {strategicDocs.map((doc, index) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded flex items-center justify-center text-xs font-bold ${
                        doc.type === 'pdf' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {doc.type.toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-medium text-mkb-black">{doc.name}</h4>
                        <p className="text-xs text-gray-500">
                          {doc.size} • {doc.uploadDate} • {doc.uploader}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {doc.category}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* 6. Finances */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-mkb-black flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Analyse Financière
            </CardTitle>
            <CardDescription>
              Évolution du chiffre d'affaires, dépenses et bénéfices
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-600">€2.4M</div>
                <div className="text-sm text-green-700">Chiffre d'Affaires</div>
                <div className="text-xs text-green-600 mt-1">+18% vs mois dernier</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <TrendingUp className="h-8 w-8 text-red-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-red-600">€1.82M</div>
                <div className="text-sm text-red-700">Dépenses</div>
                <div className="text-xs text-red-600 mt-1">+8% vs mois dernier</div>
              </div>
              <div className="text-center p-4 bg-mkb-blue/10 rounded-lg">
                <BarChart3 className="h-8 w-8 text-mkb-blue mx-auto mb-2" />
                <div className="text-2xl font-bold text-mkb-blue">€580K</div>
                <div className="text-sm text-blue-700">Bénéfices</div>
                <div className="text-xs text-mkb-blue mt-1">+38% vs mois dernier</div>
              </div>
            </div>

            <div className="h-64 flex items-end justify-between gap-4">
              {financialData.revenue.map((data, index) => (
                <div key={index} className="flex flex-col items-center gap-2 flex-1">
                  <div className="flex items-end gap-1 h-40">
                    <div 
                      className="bg-green-500 rounded-t w-6"
                      style={{ height: `${(data.value / 2500000) * 100}%` }}
                      title="Revenus"
                    ></div>
                    <div 
                      className="bg-red-500 rounded-t w-6"
                      style={{ height: `${(financialData.expenses[index].value / 2500000) * 100}%` }}
                      title="Dépenses"
                    ></div>
                    <div 
                      className="bg-mkb-blue rounded-t w-6"
                      style={{ height: `${(financialData.profit[index].value / 2500000) * 100}%` }}
                      title="Bénéfices"
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500">{data.month}</span>
                </div>
              ))}
            </div>
            
            <div className="flex justify-center gap-6 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Revenus</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>Dépenses</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-mkb-blue rounded-full"></div>
                <span>Bénéfices</span>
              </div>
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
          Direction Générale G4 - <span className="text-mkb-blue font-semibold">#mkbpilot</span> - Accès Restreint
        </p>
      </motion.div>
    </div>
  );
}