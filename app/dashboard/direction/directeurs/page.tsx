'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Users,
  Crown,
  Briefcase,
  Settings,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Clock,
  MessageSquare,
  Plus,
  Edit,
  Eye,
  Calendar
} from 'lucide-react';

const directorsData = [
  {
    id: 1,
    name: 'Alexandre Dubois',
    role: 'CEO',
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
    status: 'on-time',
    tasksCompleted: 15,
    totalTasks: 18,
    progression: 83,
    projects: [
      { name: 'Migration CRM', status: 'in-progress', progress: 75, deadline: '2024-03-30' },
      { name: 'Expansion Angola', status: 'planning', progress: 25, deadline: '2024-06-15' },
      { name: 'Refonte Site Web', status: 'completed', progress: 100, deadline: '2024-03-15' }
    ],
    recentActions: [
      { action: 'Validation budget Q2', date: '2024-03-10', type: 'approval' },
      { action: 'Réunion board mensuelle', date: '2024-03-08', type: 'meeting' },
      { action: 'Signature contrat Angola', date: '2024-03-05', type: 'contract' }
    ],
    comments: [
      { 
        id: 1, 
        author: 'CEO', 
        content: 'Excellent travail sur le Q1, objectifs dépassés de 18%', 
        date: '2024-03-10', 
        confidential: false 
      },
      { 
        id: 2, 
        author: 'COO', 
        content: 'Processus migration CRM à accélérer', 
        date: '2024-03-08', 
        confidential: true 
      }
    ],
    lastUpdate: '2h',
    nextMeeting: '2024-03-15 14:00'
  },
  {
    id: 2,
    name: 'Marie-Claire Fontaine',
    role: 'COO',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
    status: 'ahead',
    tasksCompleted: 22,
    totalTasks: 20,
    progression: 110,
    projects: [
      { name: 'Optimisation Processus', status: 'completed', progress: 100, deadline: '2024-03-10' },
      { name: 'Formation Équipes', status: 'in-progress', progress: 85, deadline: '2024-03-25' },
      { name: 'Audit Qualité', status: 'planning', progress: 15, deadline: '2024-04-30' }
    ],
    recentActions: [
      { action: 'Finalisation audit interne', date: '2024-03-12', type: 'completion' },
      { action: 'Formation managers', date: '2024-03-09', type: 'training' },
      { action: 'Optimisation workflow ACSG', date: '2024-03-07', type: 'optimization' }
    ],
    comments: [
      { 
        id: 1, 
        author: 'CEO', 
        content: 'Processus optimisés avec succès, gains de productivité mesurables', 
        date: '2024-03-12', 
        confidential: false 
      }
    ],
    lastUpdate: '4h',
    nextMeeting: '2024-03-16 10:00'
  },
  {
    id: 3,
    name: 'Thomas Leclerc',
    role: 'CTO',
    avatar: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
    status: 'on-time',
    tasksCompleted: 12,
    totalTasks: 15,
    progression: 80,
    projects: [
      { name: 'Infrastructure Cloud', status: 'in-progress', progress: 60, deadline: '2024-04-15' },
      { name: 'Sécurité Système', status: 'in-progress', progress: 70, deadline: '2024-03-30' },
      { name: 'API v2.0', status: 'planning', progress: 20, deadline: '2024-05-30' }
    ],
    recentActions: [
      { action: 'Déploiement v2.4.1', date: '2024-03-11', type: 'deployment' },
      { action: 'Audit sécurité', date: '2024-03-09', type: 'security' },
      { action: 'Migration base données', date: '2024-03-06', type: 'migration' }
    ],
    comments: [
      { 
        id: 1, 
        author: 'CEO', 
        content: 'Migration cloud en cours, sécurité renforcée selon planning', 
        date: '2024-03-11', 
        confidential: false 
      },
      { 
        id: 2, 
        author: 'COO', 
        content: 'Besoin de ressources supplémentaires pour API v2.0', 
        date: '2024-03-09', 
        confidential: true 
      }
    ],
    lastUpdate: '1h',
    nextMeeting: '2024-03-14 16:00'
  },
  {
    id: 4,
    name: 'Isabelle Moreau',
    role: 'CCO',
    avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
    status: 'behind',
    tasksCompleted: 8,
    totalTasks: 12,
    progression: 67,
    projects: [
      { name: 'Stratégie Client 360', status: 'delayed', progress: 45, deadline: '2024-03-20' },
      { name: 'Satisfaction B2B', status: 'in-progress', progress: 55, deadline: '2024-04-10' },
      { name: 'Programme Fidélité', status: 'planning', progress: 10, deadline: '2024-05-15' }
    ],
    recentActions: [
      { action: 'Analyse satisfaction client', date: '2024-03-10', type: 'analysis' },
      { action: 'Réunion équipe commerciale', date: '2024-03-08', type: 'meeting' },
      { action: 'Révision stratégie B2B', date: '2024-03-05', type: 'strategy' }
    ],
    comments: [
      { 
        id: 1, 
        author: 'CEO', 
        content: 'Retard sur satisfaction client, plan d\'action urgent nécessaire', 
        date: '2024-03-10', 
        confidential: true 
      },
      { 
        id: 2, 
        author: 'COO', 
        content: 'Support équipe commerciale à renforcer', 
        date: '2024-03-08', 
        confidential: false 
      }
    ],
    lastUpdate: '6h',
    nextMeeting: '2024-03-13 11:00'
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'ahead': return 'bg-green-100 text-green-800 border-green-200';
    case 'on-time': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'behind': return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'ahead': return CheckCircle;
    case 'on-time': return Clock;
    case 'behind': return AlertTriangle;
    default: return Clock;
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'ahead': return 'En avance';
    case 'on-time': return 'À jour';
    case 'behind': return 'En retard';
    default: return 'Inconnu';
  }
};

const getProjectStatusColor = (status: string) => {
  switch (status) {
    case 'completed': return 'bg-green-100 text-green-800';
    case 'in-progress': return 'bg-blue-100 text-blue-800';
    case 'planning': return 'bg-yellow-100 text-yellow-800';
    case 'delayed': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default function DirecteursPage() {
  const [selectedDirector, setSelectedDirector] = useState<number | null>(null);
  const [newComment, setNewComment] = useState('');
  const [isConfidential, setIsConfidential] = useState(false);

  const addComment = (directorId: number) => {
    if (!newComment.trim()) return;
    
    // Ici on ajouterait la logique pour sauvegarder le commentaire
    console.log('Nouveau commentaire pour', directorId, ':', newComment, 'Confidentiel:', isConfidential);
    
    setNewComment('');
    setIsConfidential(false);
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
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-mkb-blue" />
          <div>
            <h1 className="text-3xl font-bold text-mkb-black">
              Suivi Directeurs G4
            </h1>
            <p className="text-gray-600">
              Performance individuelle des membres du comité de direction
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <Crown className="h-3 w-3 mr-1" />
            Niveau G4
          </Badge>
        </div>
      </motion.div>

      {/* Directors Overview */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {directorsData.map((director, index) => {
          const StatusIcon = getStatusIcon(director.status);
          
          return (
            <motion.div
              key={director.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <img 
                      src={director.avatar} 
                      alt={director.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="text-xl font-bold text-mkb-black">{director.name}</h3>
                          <p className="text-mkb-blue font-medium">{director.role}</p>
                        </div>
                        <Badge className={`${getStatusColor(director.status)} border`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {getStatusText(director.status)}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-500">
                        Dernière mise à jour: il y a {director.lastUpdate}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Progress */}
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="font-medium">Tâches accomplies</span>
                      <span className="font-bold text-mkb-blue">
                        {director.tasksCompleted}/{director.totalTasks}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full transition-all duration-300 ${
                          director.progression >= 100 ? 'bg-green-500' :
                          director.progression >= 80 ? 'bg-mkb-blue' :
                          'bg-orange-500'
                        }`}
                        style={{ width: `${Math.min(director.progression, 100)}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {director.progression}% de progression
                    </div>
                  </div>

                  {/* Projects */}
                  <div>
                    <h4 className="font-medium text-mkb-black mb-2">Projets pilotés</h4>
                    <div className="space-y-2">
                      {director.projects.slice(0, 2).map((project, pIndex) => (
                        <div key={pIndex} className="flex items-center justify-between text-sm">
                          <span className="flex-1">{project.name}</span>
                          <div className="flex items-center gap-2">
                            <Badge className={getProjectStatusColor(project.status)} variant="secondary">
                              {project.status === 'completed' ? 'Terminé' :
                               project.status === 'in-progress' ? 'En cours' :
                               project.status === 'planning' ? 'Planifié' :
                               'Retardé'}
                            </Badge>
                            <span className="text-xs font-medium w-10">{project.progress}%</span>
                          </div>
                        </div>
                      ))}
                      {director.projects.length > 2 && (
                        <div className="text-xs text-gray-500">
                          +{director.projects.length - 2} autres projets
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Next Meeting */}
                  <div className="flex items-center gap-2 p-2 bg-mkb-blue/5 rounded">
                    <Calendar className="h-4 w-4 text-mkb-blue" />
                    <span className="text-sm text-mkb-blue">
                      Prochain RDV: {director.nextMeeting}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => setSelectedDirector(director.id)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Détails
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-3">
                            <img 
                              src={director.avatar} 
                              alt={director.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                            {director.name} - {director.role}
                          </DialogTitle>
                          <DialogDescription>
                            Suivi détaillé des activités et performances
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Projects Detail */}
                          <div>
                            <h3 className="font-semibold text-mkb-black mb-3">Projets en Cours</h3>
                            <div className="space-y-3">
                              {director.projects.map((project, pIndex) => (
                                <div key={pIndex} className="p-3 border rounded-lg">
                                  <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-medium">{project.name}</h4>
                                    <Badge className={getProjectStatusColor(project.status)} variant="secondary">
                                      {project.status === 'completed' ? 'Terminé' :
                                       project.status === 'in-progress' ? 'En cours' :
                                       project.status === 'planning' ? 'Planifié' :
                                       'Retardé'}
                                    </Badge>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                                    <div 
                                      className={`h-2 rounded-full ${
                                        project.status === 'completed' ? 'bg-green-500' :
                                        project.status === 'in-progress' ? 'bg-mkb-blue' :
                                        project.status === 'delayed' ? 'bg-red-500' :
                                        'bg-yellow-500'
                                      }`}
                                      style={{ width: `${project.progress}%` }}
                                    ></div>
                                  </div>
                                  <div className="flex justify-between text-xs text-gray-500">
                                    <span>{project.progress}% complété</span>
                                    <span>Échéance: {project.deadline}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Recent Actions */}
                          <div>
                            <h3 className="font-semibold text-mkb-black mb-3">Actions Récentes</h3>
                            <div className="space-y-2">
                              {director.recentActions.map((action, aIndex) => (
                                <div key={aIndex} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                                  <div className={`w-2 h-2 rounded-full ${
                                    action.type === 'completion' ? 'bg-green-500' :
                                    action.type === 'meeting' ? 'bg-blue-500' :
                                    action.type === 'approval' ? 'bg-purple-500' :
                                    'bg-gray-500'
                                  }`}></div>
                                  <div className="flex-1">
                                    <p className="text-sm font-medium">{action.action}</p>
                                    <p className="text-xs text-gray-500">{action.date}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Comments Section */}
                        <div className="mt-6">
                          <h3 className="font-semibold text-mkb-black mb-3">Commentaires & Notes</h3>
                          <div className="space-y-3 mb-4">
                            {director.comments.map((comment) => (
                              <div key={comment.id} className={`p-3 rounded-lg border-l-4 ${
                                comment.confidential ? 'bg-red-50 border-red-500' : 'bg-blue-50 border-blue-500'
                              }`}>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-medium text-sm">{comment.author}</span>
                                  <div className="flex items-center gap-2">
                                    {comment.confidential && (
                                      <Badge variant="destructive" className="text-xs">
                                        Confidentiel
                                      </Badge>
                                    )}
                                    <span className="text-xs text-gray-500">{comment.date}</span>
                                  </div>
                                </div>
                                <p className="text-sm">{comment.content}</p>
                              </div>
                            ))}
                          </div>

                          {/* Add Comment */}
                          <div className="space-y-3">
                            <Textarea
                              placeholder="Ajouter une note confidentielle..."
                              value={newComment}
                              onChange={(e) => setNewComment(e.target.value)}
                              className="min-h-[80px]"
                            />
                            <div className="flex items-center justify-between">
                              <label className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={isConfidential}
                                  onChange={(e) => setIsConfidential(e.target.checked)}
                                  className="rounded"
                                />
                                <span className="text-sm">Note confidentielle</span>
                              </label>
                              <Button 
                                onClick={() => addComment(director.id)}
                                disabled={!newComment.trim()}
                                size="sm"
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Ajouter
                              </Button>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Button variant="outline" size="sm">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Note
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Summary Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-mkb-black flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Résumé G4
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {directorsData.filter(d => d.status === 'ahead').length}
                </div>
                <div className="text-sm text-green-700">En avance</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-mkb-blue">
                  {directorsData.filter(d => d.status === 'on-time').length}
                </div>
                <div className="text-sm text-blue-700">À jour</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {directorsData.filter(d => d.status === 'behind').length}
                </div>
                <div className="text-sm text-red-700">En retard</div>
              </div>
              <div className="text-center p-4 bg-mkb-yellow/20 rounded-lg">
                <div className="text-2xl font-bold text-mkb-black">
                  {Math.round(directorsData.reduce((acc, d) => acc + d.progression, 0) / directorsData.length)}%
                </div>
                <div className="text-sm text-gray-700">Progression moyenne</div>
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
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <p className="text-sm text-gray-500">
          Suivi Directeurs G4 - <span className="text-mkb-blue font-semibold">#mkbpilot</span> - Confidentiel
        </p>
      </motion.div>
    </div>
  );
}