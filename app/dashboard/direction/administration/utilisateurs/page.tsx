'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserDetailDialog } from '@/components/ui/UserDetailDialog';
import { useAuth } from '@/hooks/useAuth';
import { User, userService, UserStats } from '@/lib/services/userService';
import { motion } from 'framer-motion';
import {
  Calendar,
  Edit,
  Eye,
  Filter,
  Loader2,
  Lock,
  Plus,
  RotateCcw,
  Search,
  Shield,
  Unlock,
  Users
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

interface UserStatsDisplay {
  title: string;
  value: string;
  change: string;
  icon: typeof Users;
  color: string;
}

const getRoleColor = (roleName: string) => {
  if (['CEO'].includes(roleName)) return 'bg-red-100 text-red-800';
  if (['G4'].includes(roleName)) return 'bg-orange-100 text-orange-800';
  if (roleName.includes('Responsable')) return 'bg-blue-100 text-blue-800';
  if (roleName.includes('Collaborateur')) return 'bg-green-100 text-green-800';
  return 'bg-gray-100 text-gray-800';
};

const getStatusColor = (actif: boolean) => {
  return actif ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
};

export default function UtilisateursPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats>({ total: 0, actifs: 0, inactifs: 0, nouveauxCeMois: 0 });
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isUserDetailDialogOpen, setIsUserDetailDialogOpen] = useState(false);

  // État pour le formulaire de création
  const [formData, setFormData] = useState({
    prenom: '',
    nom: '',
    email: '',
    telephone: '',
    role_id: '',
    password: ''
  });

  const { user: adminUser } = useAuth();

  // Charger les données
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [usersData, statsData, rolesData] = await Promise.all([
        userService.fetchUsers(),
        userService.fetchUserStats(),
        userService.getAvailableRoles()
      ]);

      console.log('📊 Données chargées:', {
        users: usersData,
        stats: statsData,
        roles: rolesData
      });

      setUsers(usersData);
      setStats(statsData);
      setRoles(rolesData);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filtrer les utilisateurs
  const filteredUsers = users.filter(user => {
    const fullName = `${user.prenom} ${user.nom}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role?.nom === roleFilter;
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'actif' && user.actif) ||
      (statusFilter === 'inactif' && !user.actif);
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Créer un utilisateur
  const handleCreateUser = async () => {
    if (!formData.prenom || !formData.nom || !formData.email || !formData.role_id || !formData.password) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setCreatingUser(true);
      const adminName = adminUser ? `${adminUser.first_name || ''} ${adminUser.last_name || ''}`.trim() : 'Administrateur';
      await userService.createUser({
        prenom: formData.prenom,
        nom: formData.nom,
        email: formData.email,
        telephone: formData.telephone || undefined,
        role_id: parseInt(formData.role_id),
        password: formData.password
      }, adminName);

      toast.success('Utilisateur créé avec succès');
      setIsCreateDialogOpen(false);
      setFormData({ prenom: '', nom: '', email: '', telephone: '', role_id: '', password: '' });
      loadData(); // Recharger les données
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      toast.error('Erreur lors de la création de l\'utilisateur');
    } finally {
      setCreatingUser(false);
    }
  };

  // Mettre à jour le statut d'un utilisateur
  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const adminName = adminUser ? `${adminUser.first_name || ''} ${adminUser.last_name || ''}`.trim() : 'Administrateur';
      await userService.updateUserStatus(userId, !currentStatus, adminName);
      toast.success(`Utilisateur ${!currentStatus ? 'activé' : 'désactivé'} avec succès`);
      loadData(); // Recharger les données
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      toast.error('Erreur lors de la mise à jour du statut');
    }
  };

  // Réinitialiser le mot de passe
  const handleResetPassword = async (userId: string) => {
    const newPassword = Math.random().toString(36).slice(-8); // Mot de passe temporaire
    try {
      const adminName = adminUser ? `${adminUser.first_name || ''} ${adminUser.last_name || ''}`.trim() : 'Administrateur';
      await userService.resetUserPassword(userId, newPassword, adminName);
      toast.success(`Mot de passe réinitialisé: ${newPassword}`);
    } catch (error) {
      console.error('Erreur lors de la réinitialisation:', error);
      toast.error('Erreur lors de la réinitialisation du mot de passe');
    }
  };

  // Ouvrir le dialogue de détails d'un utilisateur
  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setIsUserDetailDialogOpen(true);
  };

  // Fermer le dialogue de détails
  const handleCloseUserDetail = () => {
    setIsUserDetailDialogOpen(false);
    setSelectedUser(null);
  };

  // Callback quand un utilisateur est mis à jour
  const handleUserUpdated = () => {
    loadData();
  };

  // Préparer les statistiques pour l'affichage
  const userStatsDisplay: UserStatsDisplay[] = [
    {
      title: 'Total Utilisateurs',
      value: stats.total.toString(),
      change: '+0',
      icon: Users,
      color: 'text-mkb-blue',
    },
    {
      title: 'Utilisateurs Actifs',
      value: stats.actifs.toString(),
      change: '+0',
      icon: Shield,
      color: 'text-green-600',
    },
    {
      title: 'Comptes Inactifs',
      value: stats.inactifs.toString(),
      change: '+0',
      icon: Lock,
      color: 'text-orange-600',
    },
    {
      title: 'Nouveaux ce mois',
      value: stats.nouveauxCeMois.toString(),
      change: '+0',
      icon: Calendar,
      color: 'text-purple-600',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-mkb-blue" />
      </div>
    );
  }

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
                    <Label>Prénom *</Label>
                    <Input
                      placeholder="Prénom"
                      value={formData.prenom}
                      onChange={(e) => setFormData(prev => ({ ...prev, prenom: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Nom *</Label>
                    <Input
                      placeholder="Nom"
                      value={formData.nom}
                      onChange={(e) => setFormData(prev => ({ ...prev, nom: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Email *</Label>
                    <Input
                      type="email"
                      placeholder="email@mkb.com"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Téléphone</Label>
                    <Input
                      placeholder="+33 1 23 45 67 89"
                      value={formData.telephone}
                      onChange={(e) => setFormData(prev => ({ ...prev, telephone: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <Label>Rôle *</Label>
                  <Select value={formData.role_id} onValueChange={(value) => setFormData(prev => ({ ...prev, role_id: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un rôle" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id.toString()}>
                          {role.nom} (Niveau {role.niveau})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Mot de passe temporaire *</Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button
                    className="bg-mkb-blue hover:bg-mkb-blue/90"
                    onClick={handleCreateUser}
                    disabled={creatingUser}
                  >
                    {creatingUser ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Création...
                      </>
                    ) : (
                      'Créer l\'utilisateur'
                    )}
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
        {userStatsDisplay.map((stat) => {
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
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.nom}>
                      {role.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="actif">Actif</SelectItem>
                  <SelectItem value="inactif">Inactif</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={loadData}>
                <Filter className="h-4 w-4 mr-2" />
                Actualiser
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
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Pôles</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Statut</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Date de création</th>
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
                          <div className="w-10 h-10 rounded-full bg-mkb-blue/10 flex items-center justify-center">
                            <span className="text-mkb-blue font-semibold text-sm">
                              {user.prenom.charAt(0)}{user.nom.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-mkb-black">{user.prenom} {user.nom}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                            {user.telephone && (
                              <div className="text-xs text-gray-400">{user.telephone}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {user.role ? (
                          <Badge className={getRoleColor(user.role.nom)}>
                            {user.role.nom} (Niveau {user.role.niveau})
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-800">Aucun rôle</Badge>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {user.poles && user.poles.length > 0 ? (
                            user.poles.map((pole) => (
                              <Badge key={pole.id} className="bg-blue-100 text-blue-800 text-xs">
                                {pole.pole_name}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-gray-500 text-sm">Aucun pôle</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge className={getStatusColor(user.actif)}>
                          {user.actif ? 'Actif' : 'Inactif'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center text-sm text-gray-600">
                        {new Date(user.date_creation).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Voir les détails"
                            onClick={() => handleViewUser(user)}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Modifier"
                            onClick={() => handleViewUser(user)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            title={user.actif ? 'Désactiver' : 'Activer'}
                            onClick={() => handleToggleStatus(user.id, user.actif)}
                          >
                            {user.actif ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Réinitialiser le mot de passe"
                            onClick={() => handleResetPassword(user.id)}
                          >
                            <RotateCcw className="h-3 w-3" />
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

      {/* Dialogue de détails utilisateur */}
      <UserDetailDialog
        user={selectedUser}
        open={isUserDetailDialogOpen}
        onOpenChange={handleCloseUserDetail}
        onUserUpdated={handleUserUpdated}
        adminName={adminUser ? `${adminUser.first_name || ''} ${adminUser.last_name || ''}`.trim() : 'Administrateur'}
      />
    </div>
  );
}