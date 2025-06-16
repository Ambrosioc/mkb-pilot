'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Calendar,
  Plus,
  Eye,
  Download,
  Edit,
  Filter,
  Search,
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  Target
} from 'lucide-react';

const reportsData = [
  {
    id: 1,
    title: 'Rapport Hebdomadaire S11',
    type: 'weekly',
    date: '2024-03-15',
    author: 'Alexandre Dubois',
    status: 'published',
    priority: 'high',
    highlights: [
      'Chiffre d\'affaires: +18% vs S10',
      'Nouveaux clients: +25%',
      'Satisfaction globale: 94%',
      'Performance IT: 99.8% uptime'
    ],
    kpis: {
      revenue: '€2.4M',
      growth: '+18%',
      satisfaction: '94%',
      issues: 2
    },
    summary: 'Excellente performance cette semaine avec dépassement des objectifs sur tous les indicateurs clés.',
    nextActions: [
      'Accélérer migration CRM',
      'Renforcer équipe marketing',
      'Optimiser processus SAV'
    ]
  },
  {
    id: 2,
    title: 'Analyse Mensuelle Février 2024',
    type: 'monthly',
    date: '2024-03-01',
    author: 'Marie-Claire Fontaine',
    status: 'published',
    priority: 'high',
    highlights: [
      'ROI global: 340%',
      'Expansion Angola: Phase 1 terminée',
      'Optimisation IT: -15% coûts',
      'Formation équipes: 100% complété'
    ],
    kpis: {
      revenue: '€7.2M',
      growth: '+22%',
      satisfaction: '92%',
      issues: 5
    },
    summary: 'Mois exceptionnel avec croissance soutenue et optimisations réussies.',
    nextActions: [
      'Lancer Phase 2 Angola',
      'Recruter 3 développeurs',
      'Audit sécurité complet'
    ]
  },
  {
    id: 3,
    title: 'Rapport Trimestriel Q1 2024',
    type: 'quarterly',
    date: '2024-03-31',
    author: 'Direction Générale',
    status: 'draft',
    priority: 'critical',
    highlights: [
      'Objectifs Q1 dépassés de 15%',
      'Croissance équipe: +22%',
      'Innovation: 3 nouveaux produits',
      'Satisfaction client: record historique'
    ],
    kpis: {
      revenue: '€21.6M',
      growth: '+28%',
      satisfaction: '96%',
      issues: 8
    },
    summary: 'Trimestre record avec croissance exceptionnelle et innovation soutenue.',
    nextActions: [
      'Planifier Q2 2024',
      'Investir R&D',
      'Expansion internationale'
    ]
  },
  {
    id: 4,
    title: 'Rapport Hebdomadaire S10',
    type: 'weekly',
    date: '2024-03-08',
    author: 'Thomas Leclerc',
    status: 'published',
    priority: 'medium',
    highlights: [
      'Déploiement v2.4.1 réussi',
      'Migration cloud: 60% complété',
      'Sécurité: 0 incident',
      'Performance: +12% amélioration'
    ],
    kpis: {
      revenue: '€2.1M',
      growth: '+12%',
      satisfaction: '91%',
      issues: 1
    },
    summary: 'Semaine technique productive avec avancées significatives sur la migration.',
    nextActions: [
      'Continuer migration cloud',
      'Tests de charge',
      'Formation utilisateurs'
    ]
  },
  {
    id: 5,
    title: 'Analyse Stratégique Q2 2024',
    type: 'strategic',
    date: '2024-03-20',
    author: 'Isabelle Moreau',
    status: 'review',
    priority: 'high',
    highlights: [
      'Stratégie client 360°',
      'Nouveaux marchés identifiés',
      'Partenariats stratégiques',
      'Innovation produit'
    ],
    kpis: {
      revenue: 'Prévision €8.5M',
      growth: 'Objectif +25%',
      satisfaction: 'Cible 95%',
      issues: 3
    },
    summary: 'Analyse approfondie des opportunités Q2 avec recommandations stratégiques.',
    nextActions: [
      'Valider stratégie board',
      'Allouer ressources',
      'Lancer initiatives'
    ]
  }
];

const timelineData = [
  { date: '2024-03-15', event: 'Publication Rapport S11', type: 'report', status: 'completed' },
  { date: '2024-03-20', event: 'Révision Analyse Q2', type: 'review', status: 'pending' },
  { date: '2024-03-22', event: 'Rapport Hebdo S12', type: 'report', status: 'scheduled' },
  { date: '2024-03-31', event: 'Rapport Trimestriel Q1', type: 'report', status: 'draft' },
  { date: '2024-04-01', event: 'Présentation Board Q1', type: 'presentation', status: 'scheduled' }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'published': return 'bg-green-100 text-green-800';
    case 'draft': return 'bg-yellow-100 text-yellow-800';
    case 'review': return 'bg-blue-100 text-blue-800';
    case 'archived': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'critical': return 'bg-red-100 text-red-800';
    case 'high': return 'bg-orange-100 text-orange-800';
    case 'medium': return 'bg-blue-100 text-blue-800';
    case 'low': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'weekly': return Calendar;
    case 'monthly': return TrendingUp;
    case 'quarterly': return BarChart3;
    case 'strategic': return Target;
    default: return FileText;
  }
};

export default function RapportsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedReport, setSelectedReport] = useState<number | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const filteredReports = reportsData.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    const matchesType = typeFilter === 'all' || report.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
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
        <div className="flex items-center gap-3">
          <Calendar className="h-8 w-8 text-mkb-blue" />
          <div>
            <h1 className="text-3xl font-bold text-mkb-black">
              Rapports & Timeline
            </h1>
            <p className="text-gray-600">
              Rapports hebdomadaires, mensuels et analyses stratégiques
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-mkb-blue hover:bg-mkb-blue/90">
                <Plus className="h-4 w-4 mr-2" />
                Nouveau Rapport
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Créer un Nouveau Rapport</DialogTitle>
                <DialogDescription>
                  Générer un rapport hebdomadaire, mensuel ou stratégique
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Type de rapport</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner le type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Hebdomadaire</SelectItem>
                        <SelectItem value="monthly">Mensuel</SelectItem>
                        <SelectItem value="quarterly">Trimestriel</SelectItem>
                        <SelectItem value="strategic">Stratégique</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Priorité</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner la priorité" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="critical">Critique</SelectItem>
                        <SelectItem value="high">Haute</SelectItem>
                        <SelectItem value="medium">Moyenne</SelectItem>
                        <SelectItem value="low">Basse</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Titre du rapport</label>
                  <Input placeholder="Ex: Rapport Hebdomadaire S12" />
                </div>
                <div>
                  <label className="text-sm font-medium">Résumé exécutif</label>
                  <Textarea placeholder="Résumé des points clés..." className="min-h-[100px]" />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button className="bg-mkb-blue hover:bg-mkb-blue/90">
                    Créer le Rapport
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
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
                  placeholder="Rechercher un rapport..."
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
                  <SelectItem value="published">Publié</SelectItem>
                  <SelectItem value="draft">Brouillon</SelectItem>
                  <SelectItem value="review">En révision</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="weekly">Hebdomadaire</SelectItem>
                  <SelectItem value="monthly">Mensuel</SelectItem>
                  <SelectItem value="quarterly">Trimestriel</SelectItem>
                  <SelectItem value="strategic">Stratégique</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reports List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-mkb-black flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Rapports Récents
              </CardTitle>
              <CardDescription>
                {filteredReports.length} rapport(s) trouvé(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredReports.map((report, index) => {
                  const TypeIcon = getTypeIcon(report.type);
                  
                  return (
                    <motion.div
                      key={report.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setSelectedReport(selectedReport === report.id ? null : report.id)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <TypeIcon className="h-5 w-5 text-mkb-blue" />
                          <div>
                            <h3 className="font-semibold text-mkb-black">{report.title}</h3>
                            <p className="text-sm text-gray-500">{report.author} • {report.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(report.status)}>
                            {report.status === 'published' ? 'Publié' :
                             report.status === 'draft' ? 'Brouillon' :
                             report.status === 'review' ? 'En révision' :
                             'Archivé'}
                          </Badge>
                          <Badge className={getPriorityColor(report.priority)}>
                            {report.priority === 'critical' ? 'Critique' :
                             report.priority === 'high' ? 'Haute' :
                             report.priority === 'medium' ? 'Moyenne' :
                             'Basse'}
                          </Badge>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 mb-3">{report.summary}</p>

                      <div className="grid grid-cols-2 gap-3 mb-3">
                        {Object.entries(report.kpis).map(([key, value]) => (
                          <div key={key} className="text-center p-2 bg-gray-50 rounded">
                            <div className="font-semibold text-mkb-black text-sm">{value}</div>
                            <div className="text-xs text-gray-500 capitalize">{key}</div>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {report.highlights.slice(0, 2).map((highlight, hIndex) => (
                            <span key={hIndex} className="text-xs bg-mkb-yellow/20 text-mkb-black px-2 py-1 rounded">
                              {highlight}
                            </span>
                          ))}
                          {report.highlights.length > 2 && (
                            <span className="text-xs text-gray-500">
                              +{report.highlights.length - 2} autres
                            </span>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      {selectedReport === report.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          transition={{ duration: 0.3 }}
                          className="mt-4 pt-4 border-t"
                        >
                          <div className="space-y-3">
                            <div>
                              <h4 className="font-medium text-mkb-black mb-2">Points Clés</h4>
                              <div className="space-y-1">
                                {report.highlights.map((highlight, hIndex) => (
                                  <div key={hIndex} className="flex items-center text-sm">
                                    <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
                                    {highlight}
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div>
                              <h4 className="font-medium text-mkb-black mb-2">Actions Suivantes</h4>
                              <div className="space-y-1">
                                {report.nextActions.map((action, aIndex) => (
                                  <div key={aIndex} className="flex items-center text-sm">
                                    <Clock className="h-3 w-3 text-mkb-blue mr-2" />
                                    {action}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-mkb-black flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Timeline des Rapports
              </CardTitle>
              <CardDescription>
                Planification et suivi des échéances
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {timelineData.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-center gap-4"
                  >
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full ${
                        item.status === 'completed' ? 'bg-green-500' :
                        item.status === 'pending' ? 'bg-orange-500' :
                        item.status === 'draft' ? 'bg-yellow-500' :
                        'bg-mkb-blue'
                      }`}></div>
                      {index < timelineData.length - 1 && (
                        <div className="w-px h-8 bg-gray-200 mt-2"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-mkb-black">{item.event}</h4>
                        <Badge variant="outline" className="text-xs">
                          {item.status === 'completed' ? 'Terminé' :
                           item.status === 'pending' ? 'En attente' :
                           item.status === 'draft' ? 'Brouillon' :
                           'Planifié'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500">{item.date}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Footer */}
      <motion.div
        className="text-center py-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <p className="text-sm text-gray-500">
          Rapports & Timeline - <span className="text-mkb-blue font-semibold">#mkbpilot</span>
        </p>
      </motion.div>
    </div>
  );
}