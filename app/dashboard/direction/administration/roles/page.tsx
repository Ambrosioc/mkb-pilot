'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PoleManager } from '@/components/ui/PoleManager';
import { RoleManager } from '@/components/ui/RoleManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { poleService } from '@/lib/services/poleService';
import { roleService, RoleStats } from '@/lib/services/roleService';
import { motion } from 'framer-motion';
import {
  Building2,
  Edit,
  Loader2,
  Shield,
  Users
} from 'lucide-react';
import { useEffect, useState } from 'react';

export default function RolesPage() {
  const [roleStats, setRoleStats] = useState<RoleStats | null>(null);
  const [poleStats, setPoleStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Charger les statistiques
  const loadStats = async () => {
    try {
      setLoading(true);
      const [rolesStats, polesStats] = await Promise.all([
        roleService.fetchRoleStats(),
        poleService.fetchPoles()
      ]);

      setRoleStats(rolesStats);
      setPoleStats({
        total: polesStats.length,
        actifs: polesStats.length,
        inactifs: 0
      });
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleRolesUpdated = () => {
    loadStats();
  };

  const handlePolesUpdated = () => {
    loadStats();
  };

  const stats = [
    {
      title: 'Rôles Définis',
      value: roleStats?.total.toString() || '0',
      change: '+0',
      icon: Shield,
      color: 'text-mkb-blue',
    },
    {
      title: 'Pôles Définis',
      value: poleStats?.total.toString() || '0',
      change: '+0',
      icon: Building2,
      color: 'text-green-600',
    },
    {
      title: 'Utilisateurs avec rôles',
      value: roleStats?.utilisateursParRole.reduce((acc, item) => acc + item.user_count, 0).toString() || '0',
      change: '+0',
      icon: Users,
      color: 'text-purple-600',
    },
    {
      title: 'Modifications récentes',
      value: '0',
      change: '+0',
      icon: Edit,
      color: 'text-orange-600',
    },
  ];

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
              Gestion des Rôles et Pôles
            </h1>
            <p className="text-gray-600">
              Gérer les permissions, rôles et pôles des utilisateurs
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {stats.map((stat) => {
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
                <div className="text-2xl font-bold text-mkb-black">
                  {loading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-mkb-blue" />
                  ) : (
                    stat.value
                  )}
                </div>
                <p className="text-xs text-green-600">
                  {stat.change} vs mois précédent
                </p>
              </CardContent>
            </Card>
          );
        })}
      </motion.div>

      {/* Tabs pour Rôles et Pôles */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Tabs defaultValue="roles" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="roles" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Gestion des Rôles
            </TabsTrigger>
            <TabsTrigger value="poles" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Gestion des Pôles
            </TabsTrigger>
          </TabsList>

          <TabsContent value="roles" className="space-y-6">
            <RoleManager onRolesUpdated={handleRolesUpdated} />

            {/* Statistiques détaillées des rôles */}
            {roleStats && roleStats.utilisateursParRole.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Répartition des Utilisateurs par Rôle</CardTitle>
                  <CardDescription>
                    Nombre d'utilisateurs assignés à chaque rôle
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {roleStats.utilisateursParRole.map((item) => (
                      <div key={item.role_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-mkb-blue/10 flex items-center justify-center">
                            <Users className="h-4 w-4 text-mkb-blue" />
                          </div>
                          <div>
                            <div className="font-medium text-mkb-black">{item.role_nom}</div>
                            <div className="text-sm text-gray-600">{item.user_count} utilisateur(s)</div>
                          </div>
                        </div>
                        <Badge className="bg-mkb-blue/10 text-mkb-blue">
                          {item.user_count}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="poles" className="space-y-6">
            <PoleManager onPolesUpdated={handlePolesUpdated} />
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Footer */}
      <motion.div
        className="text-center py-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <p className="text-sm text-gray-500">
          Gestion des Rôles et Pôles - <span className="text-mkb-blue font-semibold">#mkbpilot</span>
        </p>
      </motion.div>
    </div>
  );
}