'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Link2, 
  Target, 
  Zap, 
  Shield,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  TrendingUp,
  Activity,
  FileText
} from 'lucide-react';

const coordinationMetrics = [
  {
    title: 'Projets Actifs',
    value: '12',
    change: '+3',
    icon: Target,
    color: 'text-green-600',
  },
  {
    title: 'Urgences Traitées',
    value: '8',
    change: '+2',
    icon: Zap,
    color: 'text-mkb-blue',
  },
  {
    title: 'Blocages Résolus',
    value: '15',
    change: '+7',
    icon: Shield,
    color: 'text-purple-600',
  },
  {
    title: 'Taux Résolution',
    value: '94%',
    change: '+5%',
    icon: TrendingUp,
    color: 'text-mkb-yellow',
  },
];

const coordinationSections = [
  {
    title: 'Projets Transverses',
    description: 'Coordination des projets inter-pôles',
    icon: Target,
    status: 'active',
    projects: 12,
    completed: 8,
    progress: 87,
  },
  {
    title: 'Urgences',
    description: 'Gestion des situations critiques',
    icon: Zap,
    status: 'monitoring',
    urgent: 3,
    resolved: 8,
    progress: 72,
  },
  {
    title: 'Blocages',
    description: 'Résolution des obstacles opérationnels',
    icon: Shield,
    status: 'active',
    blocked: 2,
    resolved: 15,
    progress: 88,
  },
  {
    title: 'Reporting Global',
    description: 'Synthèse et reporting transversal',
    icon: BarChart3,
    status: 'active',
    reports: 24,
    automated: 18,
    progress: 95,
  },
];

const activeProjects = [
  {
    name: 'Migration CRM',
    poles: ['Commercial', 'Technique', 'ACSG'],
    progress: 75,
    priority: 'high',
    deadline: '15 Mars'
  },
  {
    name: 'Optimisation Pricing Angola',
    poles: ['Pricing Angola', 'Commercial'],
    progress: 60,
    priority: 'medium',
    deadline: '30 Mars'
  },
  {
    name: 'Refonte Site Web',
    poles: ['Marketing', 'Technique'],
    progress: 90,
    priority: 'high',
    deadline: '10 Mars'
  },
  {
    name: 'Formation Équipes',
    poles: ['ACSG', 'Direction'],
    progress: 45,
    priority: 'low',
    deadline: '15 Avril'
  },
];

const urgentIssues = [
  {
    issue: 'Panne serveur principal',
    pole: 'IT/Réseau',
    severity: 'critical',
    time: '2h',
    status: 'in-progress'
  },
  {
    issue: 'Bug système facturation',
    pole: 'Technique',
    severity: 'high',
    time: '4h',
    status: 'assigned'
  },
  {
    issue: 'Problème réseau Angola',
    pole: 'Pricing Angola',
    severity: 'medium',
    time: '6h',
    status: 'pending'
  },
];

export default function CoordinationPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-3"
      >
        <Link2 className="h-8 w-8 text-mkb-blue" />
        <div>
          <h1 className="text-3xl font-bold text-mkb-black">
            Coordination des Services
          </h1>
          <p className="text-gray-600">
            Pilotage transversal, gestion des urgences et coordination inter-pôles
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
        {coordinationMetrics.map((metric) => {
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

      {/* Coordination Sections */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {coordinationSections.map((section, index) => {
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
                    <span className="text-sm font-medium">Efficacité</span>
                    <span className="text-sm font-bold text-mkb-blue">{section.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        section.progress >= 90 ? 'bg-green-500' :
                        section.progress >= 75 ? 'bg-mkb-blue' :
                        'bg-orange-500'
                      }`}
                      style={{ width: `${section.progress}%` }}
                    ></div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="font-semibold text-mkb-black">
                        {section.projects || section.urgent || section.blocked || section.reports}
                      </div>
                      <div className="text-gray-500">
                        {section.projects ? 'Projets' : 
                         section.urgent ? 'Urgents' : 
                         section.blocked ? 'Bloqués' : 
                         'Rapports'}
                      </div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="font-semibold text-mkb-black">
                        {section.completed || section.resolved || section.automated}
                      </div>
                      <div className="text-gray-500">
                        {section.completed ? 'Terminés' : 
                         section.resolved ? 'Résolus' : 
                         'Automatisés'}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </motion.div>

      {/* Active Projects & Urgent Issues */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-mkb-black flex items-center gap-2">
              <Target className="h-5 w-5" />
              Projets Transverses Actifs
            </CardTitle>
            <CardDescription>
              Projets impliquant plusieurs pôles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeProjects.map((project, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-mkb-black">{project.name}</h3>
                    <Badge 
                      variant="secondary"
                      className={
                        project.priority === 'high' ? 'bg-red-100 text-red-800' :
                        project.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }
                    >
                      {project.priority === 'high' ? 'Haute' :
                       project.priority === 'medium' ? 'Moyenne' :
                       'Basse'}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {project.poles.map((pole, poleIndex) => (
                      
                      <span key={poleIndex} className="text-xs bg-mkb-blue/10 text-mkb-blue px-2 py-1 rounded">
                        {pole}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex-1 mr-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-mkb-blue h-2 rounded-full transition-all duration-300"
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-mkb-blue">{project.progress}%</p>
                      <p className="text-xs text-gray-500">Échéance: {project.deadline}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-mkb-black flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Urgences en Cours
            </CardTitle>
            <CardDescription>
              Situations critiques nécessitant une attention immédiate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {urgentIssues.map((issue, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`h-3 w-3 rounded-full ${
                      issue.severity === 'critical' ? 'bg-red-500' :
                      issue.severity === 'high' ? 'bg-orange-500' :
                      'bg-yellow-500'
                    }`}></div>
                    <div>
                      <p className="font-medium text-mkb-black">{issue.issue}</p>
                      <p className="text-xs text-gray-500">{issue.pole} - Il y a {issue.time}</p>
                    </div>
                  </div>
                  <Badge 
                    variant="secondary"
                    className={
                      issue.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                      issue.status === 'assigned' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }
                  >
                    {issue.status === 'in-progress' ? 'En cours' :
                     issue.status === 'assigned' ? 'Assigné' :
                     'En attente'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Global Performance Dashboard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-mkb-black flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Performance Globale des Pôles
            </CardTitle>
            <CardDescription>
              Vue d'ensemble de l'efficacité par pôle
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                { pole: 'Commercial', performance: 87, trend: 'up' },
                { pole: 'Technique', performance: 92, trend: 'up' },
                { pole: 'Marketing', performance: 78, trend: 'down' },
                { pole: 'ACSG', performance: 85, trend: 'stable' },
                { pole: 'IT/Réseau', performance: 95, trend: 'up' },
              ].map((data, index) => (
                <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-lg font-bold text-mkb-black mb-1">{data.performance}%</div>
                  <div className="text-sm text-gray-700 mb-2">{data.pole}</div>
                  <div className={`text-xs flex items-center justify-center gap-1 ${
                    data.trend === 'up' ? 'text-green-600' :
                    data.trend === 'down' ? 'text-red-600' :
                    'text-gray-600'
                  }`}>
                    {data.trend === 'up' ? '↗' : data.trend === 'down' ? '↘' : '→'}
                    {data.trend === 'up' ? 'En hausse' : data.trend === 'down' ? 'En baisse' : 'Stable'}
                  </div>
                </div>
              ))}
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
              Activités de Coordination
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                {
                  action: 'Réunion coordination Migration CRM',
                  time: 'Il y a 1h',
                  status: 'success'
                },
                {
                  action: 'Résolution blocage Pricing Angola',
                  time: 'Il y a 3h',
                  status: 'success'
                },
                {
                  action: 'Escalade urgence serveur principal',
                  time: 'Il y a 5h',
                  status: 'warning'
                },
                {
                  action: 'Rapport mensuel inter-pôles généré',
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
                <Target className="mr-2 h-4 w-4" />
                Nouveau Projet
              </Button>
              <Button variant="outline" className="border-mkb-yellow text-mkb-yellow hover:bg-mkb-yellow hover:text-white">
                <Zap className="mr-2 h-4 w-4" />
                Signaler Urgence
              </Button>
              <Button variant="outline" className="border-gray-300">
                <Shield className="mr-2 h-4 w-4" />
                Résoudre Blocage
              </Button>
              <Button variant="outline" className="border-gray-300">
                <FileText className="mr-2 h-4 w-4" />
                Rapport Global
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
          Coordination des Services - <span className="text-mkb-blue font-semibold">#mkbpilot</span>
        </p>
      </motion.div>
    </div>
  );
}