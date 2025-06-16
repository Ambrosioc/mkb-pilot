'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Chrome as Broom, 
  Calendar, 
  UserCheck, 
  Building2,
  CheckCircle,
  Clock,
  AlertTriangle,
  MapPin,
  Users,
  ClipboardCheck,
  Wrench,
  Sparkles
} from 'lucide-react';

const entretienMetrics = [
  {
    title: 'Tâches Planifiées',
    value: '34',
    change: '+6',
    icon: Calendar,
    color: 'text-green-600',
  },
  {
    title: 'Validations Faites',
    value: '28',
    change: '+12',
    icon: UserCheck,
    color: 'text-mkb-blue',
  },
  {
    title: 'Locaux Entretenus',
    value: '8/8',
    change: '100%',
    icon: Building2,
    color: 'text-purple-600',
  },
  {
    title: 'Satisfaction',
    value: '94%',
    change: '+3%',
    icon: CheckCircle,
    color: 'text-mkb-yellow',
  },
];

const entretienSections = [
  {
    title: 'Planning',
    description: 'Organisation et planification des tâches d\'entretien',
    icon: Calendar,
    status: 'active',
    tasks: 34,
    completed: 28,
    progress: 82,
  },
  {
    title: 'Validation',
    description: 'Contrôle qualité et validation des interventions',
    icon: UserCheck,
    status: 'active',
    validations: 28,
    pending: 6,
    progress: 88,
  },
  {
    title: 'État des Locaux',
    description: 'Monitoring et maintenance des espaces de travail',
    icon: Building2,
    status: 'monitoring',
    locations: 8,
    issues: 2,
    progress: 75,
  },
];

const locationsStatus = [
  { name: 'Accueil/Réception', status: 'excellent', lastCleaning: '2h', score: 95 },
  { name: 'Open Space Commercial', status: 'good', lastCleaning: '4h', score: 88 },
  { name: 'Bureaux Direction', status: 'excellent', lastCleaning: '1h', score: 98 },
  { name: 'Salle de Réunion', status: 'good', lastCleaning: '6h', score: 85 },
  { name: 'Cuisine/Pause', status: 'attention', lastCleaning: '8h', score: 72 },
  { name: 'Sanitaires', status: 'good', lastCleaning: '3h', score: 90 },
];

const todayTasks = [
  { task: 'Nettoyage sols Open Space', time: '09:00', status: 'completed', assignee: 'Marie D.' },
  { task: 'Vidage corbeilles étage 1', time: '10:30', status: 'completed', assignee: 'Jean M.' },
  { task: 'Nettoyage vitres accueil', time: '14:00', status: 'in-progress', assignee: 'Sophie L.' },
  { task: 'Désinfection sanitaires', time: '16:00', status: 'pending', assignee: 'Pierre R.' },
];

export default function EntretienPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-3"
      >
        <Broom className="h-8 w-8 text-mkb-blue" />
        <div>
          <h1 className="text-3xl font-bold text-mkb-black">
            Entretien & Services
          </h1>
          <p className="text-gray-600">
            Gestion de l'entretien, planning et maintenance des locaux
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
        {entretienMetrics.map((metric) => {
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

      {/* Entretien Sections */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {entretienSections.map((section, index) => {
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
                    <span className="text-sm font-medium">Progression</span>
                    <span className="text-sm font-bold text-mkb-blue">{section.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        section.progress >= 85 ? 'bg-green-500' :
                        section.progress >= 70 ? 'bg-mkb-blue' :
                        'bg-orange-500'
                      }`}
                      style={{ width: `${section.progress}%` }}
                    ></div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="font-semibold text-mkb-black">
                        {section.tasks || section.validations || section.locations}
                      </div>
                      <div className="text-gray-500">
                        {section.tasks ? 'Tâches' : 
                         section.validations ? 'Validations' : 
                         'Locaux'}
                      </div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="font-semibold text-mkb-black">
                        {section.completed || section.pending || section.issues}
                      </div>
                      <div className="text-gray-500">
                        {section.completed ? 'Terminées' : 
                         section.pending ? 'En attente' : 
                         'Problèmes'}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </motion.div>

      {/* Locations Status & Today's Tasks */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-mkb-black flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              État des Locaux
            </CardTitle>
            <CardDescription>
              Status de propreté par zone
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {locationsStatus.map((location, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`h-3 w-3 rounded-full ${
                      location.status === 'excellent' ? 'bg-green-500' :
                      location.status === 'good' ? 'bg-mkb-blue' :
                      location.status === 'attention' ? 'bg-orange-500' :
                      'bg-red-500'
                    }`}></div>
                    <div>
                      <p className="font-medium text-mkb-black">{location.name}</p>
                      <p className="text-xs text-gray-500">Nettoyé il y a {location.lastCleaning}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-mkb-blue">{location.score}%</p>
                    <p className="text-xs text-gray-500">qualité</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-mkb-black flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5" />
              Planning du Jour
            </CardTitle>
            <CardDescription>
              Tâches d'entretien programmées aujourd'hui
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todayTasks.map((task, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`h-3 w-3 rounded-full ${
                      task.status === 'completed' ? 'bg-green-500' :
                      task.status === 'in-progress' ? 'bg-mkb-blue' :
                      'bg-gray-400'
                    }`}></div>
                    <div>
                      <p className="font-medium text-mkb-black">{task.task}</p>
                      <p className="text-xs text-gray-500">{task.assignee} - {task.time}</p>
                    </div>
                  </div>
                  <Badge 
                    variant="secondary"
                    className={
                      task.status === 'completed' ? 'bg-green-100 text-green-800' :
                      task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }
                  >
                    {task.status === 'completed' ? 'Terminé' :
                     task.status === 'in-progress' ? 'En cours' :
                     'En attente'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Team Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-mkb-black flex items-center gap-2">
              <Users className="h-5 w-5" />
              Performance de l'Équipe
            </CardTitle>
            <CardDescription>
              Statistiques de l'équipe d'entretien ce mois
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Sparkles className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-600 mb-1">94%</div>
                <div className="text-sm text-green-700">Satisfaction</div>
                <div className="text-xs text-green-600 mt-1">+3% vs mois dernier</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Clock className="h-8 w-8 text-mkb-blue mx-auto mb-2" />
                <div className="text-2xl font-bold text-mkb-blue mb-1">98%</div>
                <div className="text-sm text-blue-700">Ponctualité</div>
                <div className="text-xs text-blue-600 mt-1">Excellent</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <CheckCircle className="h-8 w-8 text-mkb-yellow mx-auto mb-2" />
                <div className="text-2xl font-bold text-mkb-yellow mb-1">156</div>
                <div className="text-sm text-yellow-700">Tâches Réalisées</div>
                <div className="text-xs text-yellow-600 mt-1">+12 vs mois dernier</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Wrench className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-600 mb-1">4</div>
                <div className="text-sm text-purple-700">Équipiers</div>
                <div className="text-xs text-purple-600 mt-1">Équipe complète</div>
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
                  action: 'Nettoyage complet salle de réunion',
                  time: 'Il y a 1h',
                  status: 'success'
                },
                {
                  action: 'Maintenance distributeur café',
                  time: 'Il y a 2h',
                  status: 'success'
                },
                {
                  action: 'Signalement fuite sanitaires',
                  time: 'Il y a 4h',
                  status: 'warning'
                },
                {
                  action: 'Réapprovisionnement produits',
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
                <Calendar className="mr-2 h-4 w-4" />
                Nouveau Planning
              </Button>
              <Button variant="outline" className="border-mkb-yellow text-mkb-yellow hover:bg-mkb-yellow hover:text-white">
                <UserCheck className="mr-2 h-4 w-4" />
                Valider Tâche
              </Button>
              <Button variant="outline" className="border-gray-300">
                <AlertTriangle className="mr-2 h-4 w-4" />
                Signaler Problème
              </Button>
              <Button variant="outline" className="border-gray-300">
                <Building2 className="mr-2 h-4 w-4" />
                Inspecter Locaux
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
          Entretien & Services - <span className="text-mkb-blue font-semibold">#mkbpilot</span>
        </p>
      </motion.div>
    </div>
  );
}