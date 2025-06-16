'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Shield,
  Plus,
  Search,
  Filter,
  Edit,
  Eye,
  Clock,
  User,
  CheckCircle,
  AlertTriangle,
  Settings
} from 'lucide-react';

const rolesData = [
  {
    id: 1,
    name: 'CEO',
    description: 'Directeur Général - Accès complet',
    level: 'G4',
    permissions: ['admin', 'g4', 'all-access', 'financial', 'strategic'],
    userCount: 1,
    color: 'bg-red-100 text-red-800',
    priority: 1
  },
  {
    id: 2,
    name: 'COO',
    description: 'Directeur des Opérations',
    level: 'G4',
    permissions: ['admin', 'g4', 'operations', 'hr', 'processes'],
    userCount: 1,
    color: 'bg-red-100 text-red-800',
    priority: 1
  },
  {
    id: 3,
    name: 'CTO',
    description: 'Directeur Technique',
    level: 'G4',
    permissions: ['admin', 'g4', 'technical', 'infrastructure', 'security'],
    userCount: 1,
    color: 'bg-red-100 text-red-800',
    priority: 1
  },
  {
    id: 4,
    name: 'CCO',
    description: 'Directeur Commercial',
    level: 'G4',
    permissions: ['admin', 'g4', 'commercial', 'sales', 'marketing'],
    userCount: 1,
    color: 'bg-red-100 text-red-800',
    priority: 1
  },
  {
    id: 5,
    name: 'Responsable Commercial',
    description: 'Manager équipe commerciale',
    level: 'Manager',
    permissions: ['manager', 'commercial', 'sales', 'team-lead'],
    userCount: 3,
    color: 'bg-blue-100 text-blue-800',
    priority: 2
  },
  {
    id: 6,
    name: 'Responsable Marketing',
    description: 'Manager équipe marketing',
    level: 'Manager',
    permissions: ['manager', 'marketing', 'campaigns', 'analytics'],
    userCount: 2,
    color: 'bg-blue-100 text-blue-800',
    priority: 2
  },
  {
    id: 7,
    name: 'Agent N1',
    description: 'Agent niveau 1 - Accès limité',
    level: 'Agent',
    permissions: ['basic', 'read-only', 'own-data'],
    userCount: 15,
    color: 'bg-green-100 text-green-800',
    priority: 3
  },
  {
    id: 8,
    name: 'Agent N2',
    description: 'Agent niveau 2 - Accès étendu',
    level: 'Agent',
    permissions: ['basic', 'read-write', 'team-data', 'reports'],
    userCount: 18,
    color: 'bg-green-100 text-green-800',
    priority: 3
  }
];

const roleChangesHistory = [
  {
    id: 1,
    user: 'Jean Martin',
    oldRole: 'Agent N2',
    newRole: 'Responsable Commercial',
    changedBy: 'Alexandre Dubois (CEO)',
    date: '2024-03-15 14:30',
    reason: 'Promotion suite à excellentes performances',
    status: 'approved'
  },
  {
    id: 2,
    user: 'Sophie Laurent',
    oldRole: 'Responsable Marketing',
    newRole: 'Agent N2',
    changedBy: 'Marie-Claire Fontaine (COO)',
    date: '2024-03-10 09:15',
    reason: 'Restructuration équipe marketing',
    status: 'pending'
  },
  {
    id: 3,
    user: 'Pierre Durand',
    oldRole: 'Agent N1',
    newRole: 'Agent N2',
    changedBy: 'Thomas Leclerc (CTO)',
    date: '2024-03-08 16:45',
    reason: 'Montée en compétences validée',
    status: 'approved'
  }
];

const roleStats = [
  {
    title: 'Rôles Définis',
    value: '8',
    change: '+1',
    icon: Shield,
    color: 'text-mkb-blue',
  },
  {
    title: 'Modifications ce mois',
    value: '12',
    change: '+5',
    icon: Edit,
    color: 'text-green-600',
  },
  {
    title: 'En attente validation',
    value: '3',
    change: '+2',
    icon: Clock,
    color: 'text-orange-600',
  },
  {
    title: 'Utilisateurs assignés',
    value: '42',
    change: '+3',
    icon: User,
    color: 'text-purple-600',
  },
];

export default function RolesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [selectedRole, setSelectedRole] = useState<number | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const filteredRoles = rolesData.filter(role => {
    const matchesSearch = role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         role.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = levelFilter === 'all' || role.level === levelFilter;
    return matchesSearch && matchesLevel;
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
          <Shield className="h-8 w-8 text-mkb-blue" />
          <div>
            <h1 className="text-3xl font-bold text-mkb-black">
              Attribution des Rôles
            </h1>
            <p className="text-gray-600">
              Gérer les permissions et rôles des utilisateurs
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-mkb-blue hover:bg-mkb-blue/90">
                <Plus className="h-4 w-4 mr-2" />
                Nouveau Rôle
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Créer un Nouveau Rôle</DialogTitle>
                <DialogDescription>
                  Définir un nouveau rôle avec ses permissions
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Nom du rôle</Label>
                    <Input placeholder="Ex: Responsable SAV" />
                  </div>
                  <div>
                    <Label>Niveau</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un niveau" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="G4">G4 - Direction</SelectItem>
                        <SelectItem value="Manager">Manager</SelectItem>
                        <SelectItem value="Agent">Agent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Description</Label>
                  <Input placeholder="Description du rôle et responsabilités" />
                </div>
                <div>
                  <Label>Permissions</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {['admin', 'commercial', 'technique', 'marketing', 'acsg', 'reports'].map(permission => (
                      <label key={permission} className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm capitalize">{permission}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button className="bg-mkb-blue hover:bg-mkb-blue/90">
                    Créer le rôle
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {roleStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-mkb-black">{stat.value}</div>
                <p className="text-xs text-green-600">
                  {stat.change} vs mois précédent
                </p>
              </CardContent>
            </Card>
          );
        })}
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Rechercher un rôle..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Tous les niveaux" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les niveaux</SelectItem>
                  <SelectItem value="G4">G4 - Direction</SelectItem>
                  <SelectItem value="Manager">Manager</SelectItem>
                  <SelectItem value="Agent">Agent</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtrer
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Roles Grid & History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Roles List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-mkb-black">
                Rôles Définis ({filteredRoles.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredRoles.map((role, index) => (
                  <motion.div
                    key={role.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-mkb-black">{role.name}</h3>
                          <Badge className={role.color}>
                            {role.level}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{role.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-mkb-blue">{role.userCount}</p>
                        <p className="text-xs text-gray-500">utilisateurs</p>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <p className="text-xs font-medium text-gray-700 mb-2">Permissions:</p>
                      <div className="flex flex-wrap gap-1">
                        {role.permissions.map((permission, pIndex) => (
                          <span key={pIndex} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                            {permission}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-3 w-3 mr-1" />
                        Voir
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-3 w-3 mr-1" />
                        Modifier
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Settings className="h-3 w-3 mr-1" />
                        Permissions
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Role Changes History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-mkb-black">Historique des Changements</CardTitle>
              <CardDescription>
                Modifications récentes des rôles utilisateurs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {roleChangesHistory.map((change, index) => (
                  <motion.div
                    key={change.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="p-4 border rounded-lg"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-mkb-black">{change.user}</h4>
                        <p className="text-sm text-gray-600">
                          {change.oldRole} → {change.newRole}
                        </p>
                      </div>
                      <Badge className={
                        change.status === 'approved' ? 'bg-green-100 text-green-800' :
                        change.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }>
                        {change.status === 'approved' ? 'Approuvé' :
                         change.status === 'pending' ? 'En attente' :
                         'Rejeté'}
                      </Badge>
                    </div>
                    
                    <p className="text-xs text-gray-600 mb-2">{change.reason}</p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Validé par: {change.changedBy}</span>
                      <span>{change.date}</span>
                    </div>
                    
                    {change.status === 'pending' && (
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Approuver
                        </Button>
                        <Button size="sm" variant="outline">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Rejeter
                        </Button>
                      </div>
                    )}
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
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <p className="text-sm text-gray-500">
          Attribution des Rôles - <span className="text-mkb-blue font-semibold">#mkbpilot</span>
        </p>
      </motion.div>
    </div>
  );
}