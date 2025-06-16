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
  Users,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Lock,
  Unlock,
  RotateCcw,
  Mail,
  Calendar,
  Shield,
  Eye,
  MoreHorizontal
} from 'lucide-react';

const usersData = [
  {
    id: 1,
    name: 'Alexandre Dubois',
    email: 'alexandre.dubois@mkb.com',
    role: 'CEO',
    status: 'active',
    lastLogin: '2024-03-15 14:30',
    createdAt: '2024-01-15',
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
    department: 'Direction',
    permissions: ['admin', 'g4', 'all-access']
  },
  {
    id: 2,
    name: 'Marie-Claire Fontaine',
    email: 'marie.fontaine@mkb.com',
    role: 'COO',
    status: 'active',
    lastLogin: '2024-03-15 13:45',
    createdAt: '2024-01-15',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
    department: 'Direction',
    permissions: ['admin', 'g4', 'operations']
  },
  {
    id: 3,
    name: 'Thomas Leclerc',
    email: 'thomas.leclerc@mkb.com',
    role: 'CTO',
    status: 'active',
    lastLogin: '2024-03-15 15:20',
    createdAt: '2024-01-15',
    avatar: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
    department: 'Technique',
    permissions: ['admin', 'g4', 'technical']
  },
  {
    id: 4,
    name: 'Isabelle Moreau',
    email: 'isabelle.moreau@mkb.com',
    role: 'CCO',
    status: 'active',
    lastLogin: '2024-03-15 11:15',
    createdAt: '2024-01-15',
    avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
    department: 'Commercial',
    permissions: ['admin', 'g4', 'commercial']
  },
  {
    id: 5,
    name: 'Jean Martin',
    email: 'jean.martin@mkb.com',
    role: 'Responsable Commercial',
    status: 'active',
    lastLogin: '2024-03-15 16:00',
    createdAt: '2024-02-01',
    avatar: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
    department: 'Commercial',
    permissions: ['manager', 'commercial']
  },
  {
    id: 6,
    name: 'Sophie Laurent',
    email: 'sophie.laurent@mkb.com',
    role: 'Responsable Marketing',
    status: 'suspended',
    lastLogin: '2024-03-10 09:30',
    createdAt: '2024-02-15',
    avatar: 'https://images.pexels.com/photos/1239288/pexels-photo-1239288.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
    department: 'Marketing',
    permissions: ['manager', 'marketing']
  },
  {
    id: 7,
    name: 'Pierre Durand',
    email: 'pierre.durand@mkb.com',
    role: 'Agent N2',
    status: 'active',
    lastLogin: '2024-03-15 12:45',
    createdAt: '2024-03-01',
    avatar: 'https://images.pexels.com/photos/2379006/pexels-photo-2379006.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
    department: 'ACSG',
    permissions: ['agent', 'acsg']
  }
];

const userStats = [
  {
    title: 'Total Utilisateurs',
    value: '47',
    change: '+3',
    icon: Users,
    color: 'text-mkb-blue',
  },
  {
    title: 'Utilisateurs Actifs',
    value: '42',
    change: '+2',
    icon: Shield,
    color: 'text-green-600',
  },
  {
    title: 'Comptes Suspendus',
    value: '5',
    change: '+1',
    icon: Lock,
    color: 'text-orange-600',
  },
  {
    title: 'Nouveaux ce mois',
    value: '8',
    change: '+8',
    icon: Calendar,
    color: 'text-purple-600',
  },
];

const getRoleColor = (role: string) => {
  if (['CEO', 'COO', 'CTO', 'CCO'].includes(role)) return 'bg-red-100 text-red-800';
  if (role.includes('Responsable')) return 'bg-blue-100 text-blue-800';
  if (role.includes('Agent')) return 'bg-green-100 text-green-800';
  return 'bg-gray-100 text-gray-800';
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800';
    case 'suspended': return 'bg-red-100 text-red-800';
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default function UtilisateursPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const filteredUsers = usersData.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
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
          <Users className="h-8 w-8 text-mkb-blue" />
          <div>
            <h1 className="text-3xl font-bold text-mkb-black">
              Gestion des Utilisateurs
            </h1>
            <p className="text-gray-600">
              Créer, modifier et gérer les comptes utilisateurs
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-mkb-blue hover:bg-mkb-blue/90">
                <Plus className="h-4 w-4 mr-2" />
                Nouvel Utilisateur
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Créer un Nouvel Utilisateur</DialogTitle>
                <DialogDescription>
                  Ajouter un nouveau compte utilisateur au système
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Nom complet</Label>
                    <Input placeholder="Nom Prénom" />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input type="email" placeholder="email@mkb.com" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Rôle</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un rôle" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="agent-n1">Agent N1</SelectItem>
                        <SelectItem value="agent-n2">Agent N2</SelectItem>
                        <SelectItem value="agent-n3">Agent N3</SelectItem>
                        <SelectItem value="responsable">Responsable</SelectItem>
                        <SelectItem value="g4">Membre G4</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Département</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un département" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="direction">Direction</SelectItem>
                        <SelectItem value="commercial">Commercial</SelectItem>
                        <SelectItem value="technique">Technique</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="acsg">ACSG</SelectItem>
                        <SelectItem value="it">IT/Réseau</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Mot de passe temporaire</Label>
                  <Input type="password" placeholder="••••••••" />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button className="bg-mkb-blue hover:bg-mkb-blue/90">
                    Créer l'utilisateur
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
        {userStats.map((stat) => {
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
                  placeholder="Rechercher par nom ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Tous les rôles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les rôles</SelectItem>
                  <SelectItem value="CEO">CEO</SelectItem>
                  <SelectItem value="COO">COO</SelectItem>
                  <SelectItem value="CTO">CTO</SelectItem>
                  <SelectItem value="CCO">CCO</SelectItem>
                  <SelectItem value="Responsable Commercial">Responsable</SelectItem>
                  <SelectItem value="Agent N2">Agent</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="suspended">Suspendu</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
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

      {/* Users Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-mkb-black">
              Liste des Utilisateurs ({filteredUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Utilisateur</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Rôle</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Département</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Statut</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Dernière connexion</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user, index) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={user.avatar} 
                            alt={user.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div>
                            <div className="font-medium text-mkb-black">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={getRoleColor(user.role)}>
                          {user.role}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{user.department}</td>
                      <td className="py-3 px-4 text-center">
                        <Badge className={getStatusColor(user.status)}>
                          {user.status === 'active' ? 'Actif' : 
                           user.status === 'suspended' ? 'Suspendu' : 'En attente'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center text-sm text-gray-600">
                        {user.lastLogin}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            {user.status === 'active' ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                          </Button>
                          <Button variant="ghost" size="sm">
                            <RotateCcw className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
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
          Gestion des Utilisateurs - <span className="text-mkb-blue font-semibold">#mkbpilot</span>
        </p>
      </motion.div>
    </div>
  );
}