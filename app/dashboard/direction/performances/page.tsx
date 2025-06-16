'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp,
  Users,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  Filter,
  Search,
  Download,
  Eye,
  MoreHorizontal
} from 'lucide-react';

const polesData = [
  {
    id: 1,
    pole: 'Commercial',
    responsable: 'Marie Dubois',
    email: 'marie.dubois@mkb.com',
    volume: 1247,
    tauxErreur: 2.1,
    progression: 89,
    deadline: '2024-03-15',
    status: 'on-track',
    lastUpdate: '2h',
    objectifs: [
      { name: 'Ventes mensuelles', target: 1200, current: 1247, status: 'achieved' },
      { name: 'Leads qualifiés', target: 300, current: 347, status: 'exceeded' },
      { name: 'Taux conversion', target: 20, current: 23.5, status: 'exceeded' }
    ],
    risques: ['Concurrence accrue', 'Saisonnalité Q2'],
    actions: ['Relances clients', 'Formation équipe', 'Optimisation process']
  },
  {
    id: 2,
    pole: 'Technique',
    responsable: 'Jean Martin',
    email: 'jean.martin@mkb.com',
    volume: 156,
    tauxErreur: 0.8,
    progression: 95,
    deadline: '2024-03-20',
    status: 'ahead',
    lastUpdate: '1h',
    objectifs: [
      { name: 'Uptime système', target: 99.5, current: 99.8, status: 'exceeded' },
      { name: 'Bugs résolus', target: 40, current: 47, status: 'exceeded' },
      { name: 'Déploiements', target: 20, current: 23, status: 'exceeded' }
    ],
    risques: ['Charge serveur', 'Migration cloud'],
    actions: ['Monitoring renforcé', 'Tests automatisés', 'Documentation']
  },
  {
    id: 3,
    pole: 'Marketing',
    responsable: 'Sophie Laurent',
    email: 'sophie.laurent@mkb.com',
    volume: 45,
    tauxErreur: 3.2,
    progression: 78,
    deadline: '2024-03-18',
    status: 'at-risk',
    lastUpdate: '4h',
    objectifs: [
      { name: 'ROI campagnes', target: 300, current: 340, status: 'exceeded' },
      { name: 'Leads générés', target: 1500, current: 1234, status: 'behind' },
      { name: 'Impressions', target: 2000000, current: 2400000, status: 'exceeded' }
    ],
    risques: ['Budget serré', 'Concurrence digitale', 'Saisonnalité'],
    actions: ['Optimisation budget', 'A/B testing', 'Nouveaux canaux']
  },
  {
    id: 4,
    pole: 'ACSG',
    responsable: 'Pierre Durand',
    email: 'pierre.durand@mkb.com',
    volume: 892,
    tauxErreur: 1.5,
    progression: 87,
    deadline: '2024-03-22',
    status: 'on-track',
    lastUpdate: '3h',
    objectifs: [
      { name: 'Factures traitées', target: 1200, current: 1247, status: 'exceeded' },
      { name: 'Délai règlement', target: 30, current: 28, status: 'achieved' },
      { name: 'Satisfaction RH', target: 90, current: 94, status: 'exceeded' }
    ],
    risques: ['Charge administrative', 'Nouveaux processus'],
    actions: ['Automatisation', 'Formation équipe', 'Optimisation workflow']
  },
  {
    id: 5,
    pole: 'IT/Réseau',
    responsable: 'Claire Moreau',
    email: 'claire.moreau@mkb.com',
    volume: 67,
    tauxErreur: 0.3,
    progression: 98,
    deadline: '2024-03-10',
    status: 'ahead',
    lastUpdate: '30min',
    objectifs: [
      { name: 'Uptime réseau', target: 99.5, current: 99.9, status: 'exceeded' },
      { name: 'Postes maintenus', target: 45, current: 47, status: 'exceeded' },
      { name: 'Incidents résolus', target: 24, current: 23, status: 'achieved' }
    ],
    risques: ['Obsolescence matériel', 'Sécurité'],
    actions: ['Renouvellement parc', 'Audit sécurité', 'Formation utilisateurs']
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'ahead': return 'bg-green-100 text-green-800 border-green-200';
    case 'on-track': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'at-risk': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'delayed': return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'ahead': return CheckCircle;
    case 'on-track': return Target;
    case 'at-risk': return AlertTriangle;
    case 'delayed': return Clock;
    default: return Clock;
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'ahead': return 'En avance';
    case 'on-track': return 'À jour';
    case 'at-risk': return 'À risque';
    case 'delayed': return 'En retard';
    default: return 'Inconnu';
  }
};

const getObjectifStatus = (status: string) => {
  switch (status) {
    case 'exceeded': return { color: 'text-green-600', text: 'Dépassé' };
    case 'achieved': return { color: 'text-blue-600', text: 'Atteint' };
    case 'behind': return { color: 'text-orange-600', text: 'En retard' };
    default: return { color: 'text-gray-600', text: 'En cours' };
  }
};

export default function PerformancesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPole, setSelectedPole] = useState<number | null>(null);

  const filteredPoles = polesData.filter(pole => {
    const matchesSearch = pole.pole.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pole.responsable.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || pole.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
            Performances des Pôles
          </h1>
          <p className="text-gray-600">
            Suivi détaillé des indicateurs et statuts de progression
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Rechercher un pôle ou responsable..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="ahead">En avance</SelectItem>
                  <SelectItem value="on-track">À jour</SelectItem>
                  <SelectItem value="at-risk">À risque</SelectItem>
                  <SelectItem value="delayed">En retard</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Plus de filtres
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Performance Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-mkb-black flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Tableau de Performance
            </CardTitle>
            <CardDescription>
              Vue d'ensemble des performances par pôle
            </CardDescription>
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
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPoles.map((pole, index) => {
                    const StatusIcon = getStatusIcon(pole.status);
                    
                    return (
                      <motion.tr
                        key={pole.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="border-b hover:bg-gray-50 cursor-pointer"
                        onClick={() => setSelectedPole(selectedPole === pole.id ? null : pole.id)}
                      >
                        <td className="py-3 px-4">
                          <div className="font-medium text-mkb-black">{pole.pole}</div>
                          <div className="text-xs text-gray-500">Mis à jour il y a {pole.lastUpdate}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-gray-900">{pole.responsable}</div>
                          <div className="text-xs text-gray-500">{pole.email}</div>
                        </td>
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
                          <Badge className={`${getStatusColor(pole.status)} border`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {getStatusText(pole.status)}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Detailed View */}
      {selectedPole && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {(() => {
            const pole = polesData.find(p => p.id === selectedPole);
            if (!pole) return null;

            return (
              <Card>
                <CardHeader>
                  <CardTitle className="text-mkb-black">
                    Détail - Pôle {pole.pole}
                  </CardTitle>
                  <CardDescription>
                    Analyse approfondie des performances et objectifs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Objectifs */}
                    <div>
                      <h3 className="font-semibold text-mkb-black mb-3">Objectifs</h3>
                      <div className="space-y-3">
                        {pole.objectifs.map((obj, index) => {
                          const statusInfo = getObjectifStatus(obj.status);
                          const progress = (obj.current / obj.target) * 100;
                          
                          return (
                            <div key={index} className="p-3 border rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">{obj.name}</span>
                                <span className={`text-xs ${statusInfo.color}`}>
                                  {statusInfo.text}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-sm mb-1">
                                <span>{obj.current}</span>
                                <span className="text-gray-500">/ {obj.target}</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    obj.status === 'exceeded' ? 'bg-green-500' :
                                    obj.status === 'achieved' ? 'bg-blue-500' :
                                    'bg-orange-500'
                                  }`}
                                  style={{ width: `${Math.min(progress, 100)}%` }}
                                ></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Risques */}
                    <div>
                      <h3 className="font-semibold text-mkb-black mb-3">Risques Identifiés</h3>
                      <div className="space-y-2">
                        {pole.risques.map((risque, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-orange-50 rounded">
                            <AlertTriangle className="h-4 w-4 text-orange-600" />
                            <span className="text-sm text-orange-800">{risque}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div>
                      <h3 className="font-semibold text-mkb-black mb-3">Actions en Cours</h3>
                      <div className="space-y-2">
                        {pole.actions.map((action, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                            <CheckCircle className="h-4 w-4 text-blue-600" />
                            <span className="text-sm text-blue-800">{action}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })()}
        </motion.div>
      )}

      {/* Footer */}
      <motion.div
        className="text-center py-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <p className="text-sm text-gray-500">
          Performances des Pôles - <span className="text-mkb-blue font-semibold">#mkbpilot</span>
        </p>
      </motion.div>
    </div>
  );
}