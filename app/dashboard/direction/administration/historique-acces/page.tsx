'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Clock,
  Search,
  Filter,
  Shield,
  AlertTriangle,
  CheckCircle,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  Ban,
  Eye,
  MapPin,
  Calendar
} from 'lucide-react';

const accessData = [
  {
    id: 1,
    user: 'Alexandre Dubois',
    email: 'alexandre.dubois@mkb.com',
    ip: '192.168.1.100',
    location: 'Paris, France',
    device: 'Chrome 122.0 / Windows 11',
    deviceType: 'desktop',
    timestamp: '2024-03-15 14:30:25',
    status: 'success',
    sessionDuration: '2h 45m',
    suspicious: false,
    actions: 12
  },
  {
    id: 2,
    user: 'Marie-Claire Fontaine',
    email: 'marie.fontaine@mkb.com',
    ip: '192.168.1.101',
    location: 'Paris, France',
    device: 'Safari 17.0 / macOS Sonoma',
    deviceType: 'desktop',
    timestamp: '2024-03-15 13:45:12',
    status: 'success',
    sessionDuration: '1h 20m',
    suspicious: false,
    actions: 8
  },
  {
    id: 3,
    user: 'Thomas Leclerc',
    email: 'thomas.leclerc@mkb.com',
    ip: '192.168.1.102',
    location: 'Paris, France',
    device: 'Firefox 124.0 / Ubuntu 22.04',
    deviceType: 'desktop',
    timestamp: '2024-03-15 12:15:45',
    status: 'success',
    sessionDuration: '3h 15m',
    suspicious: false,
    actions: 23
  },
  {
    id: 4,
    user: 'Sophie Laurent',
    email: 'sophie.laurent@mkb.com',
    ip: '203.45.67.89',
    location: 'Inconnu',
    device: 'Chrome 121.0 / Android 14',
    deviceType: 'mobile',
    timestamp: '2024-03-15 11:30:18',
    status: 'blocked',
    sessionDuration: '0m',
    suspicious: true,
    actions: 0
  },
  {
    id: 5,
    user: 'Jean Martin',
    email: 'jean.martin@mkb.com',
    ip: '192.168.1.105',
    location: 'Paris, France',
    device: 'Edge 122.0 / Windows 11',
    deviceType: 'desktop',
    timestamp: '2024-03-15 10:45:33',
    status: 'success',
    sessionDuration: '4h 30m',
    suspicious: false,
    actions: 34
  },
  {
    id: 6,
    user: 'Pierre Durand',
    email: 'pierre.durand@mkb.com',
    ip: '78.123.45.67',
    location: 'Lyon, France',
    device: 'Chrome 122.0 / Windows 10',
    deviceType: 'desktop',
    timestamp: '2024-03-15 09:20:15',
    status: 'suspicious',
    sessionDuration: '15m',
    suspicious: true,
    actions: 2
  },
  {
    id: 7,
    user: 'Isabelle Moreau',
    email: 'isabelle.moreau@mkb.com',
    ip: '192.168.1.103',
    location: 'Paris, France',
    device: 'Safari 17.0 / iPhone 15',
    deviceType: 'mobile',
    timestamp: '2024-03-15 08:15:42',
    status: 'success',
    sessionDuration: '45m',
    suspicious: false,
    actions: 5
  },
  {
    id: 8,
    user: 'Claire Moreau',
    email: 'claire.moreau@mkb.com',
    ip: '192.168.1.104',
    location: 'Paris, France',
    device: 'Chrome 122.0 / macOS Sonoma',
    deviceType: 'desktop',
    timestamp: '2024-03-15 07:30:28',
    status: 'success',
    sessionDuration: '6h 15m',
    suspicious: false,
    actions: 45
  }
];

const accessStats = [
  {
    title: 'Connexions Totales',
    value: '234',
    change: '+23',
    icon: Globe,
    color: 'text-mkb-blue',
  },
  {
    title: 'Sessions Actives',
    value: '18',
    change: '+3',
    icon: CheckCircle,
    color: 'text-green-600',
  },
  {
    title: 'Accès Suspects',
    value: '2',
    change: '+1',
    icon: AlertTriangle,
    color: 'text-orange-600',
  },
  {
    title: 'Sessions Bloquées',
    value: '1',
    change: '0',
    icon: Ban,
    color: 'text-red-600',
  },
];

const getDeviceIcon = (deviceType: string) => {
  switch (deviceType) {
    case 'mobile': return Smartphone;
    case 'tablet': return Tablet;
    case 'desktop': return Monitor;
    default: return Monitor;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'success': return 'bg-green-100 text-green-800';
    case 'suspicious': return 'bg-orange-100 text-orange-800';
    case 'blocked': return 'bg-red-100 text-red-800';
    case 'failed': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'success': return 'Réussie';
    case 'suspicious': return 'Suspecte';
    case 'blocked': return 'Bloquée';
    case 'failed': return 'Échouée';
    default: return 'Inconnu';
  }
};

export default function HistoriqueAccesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deviceFilter, setDeviceFilter] = useState('all');
  const [selectedAccess, setSelectedAccess] = useState<number | null>(null);
  const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false);

  const filteredAccess = accessData.filter(access => {
    const matchesSearch = access.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         access.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         access.ip.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || access.status === statusFilter;
    const matchesDevice = deviceFilter === 'all' || access.deviceType === deviceFilter;
    return matchesSearch && matchesStatus && matchesDevice;
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
          <Clock className="h-8 w-8 text-mkb-blue" />
          <div>
            <h1 className="text-3xl font-bold text-mkb-black">
              Historique des Accès
            </h1>
            <p className="text-gray-600">
              Suivi des connexions et détection d'anomalies
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Dialog open={isBlockDialogOpen} onOpenChange={setIsBlockDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">
                <Ban className="h-4 w-4 mr-2" />
                Bloquer IP
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Bloquer une Adresse IP</DialogTitle>
                <DialogDescription>
                  Bloquer l'accès pour une adresse IP spécifique
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Adresse IP</label>
                  <Input placeholder="192.168.1.100" />
                </div>
                <div>
                  <label className="text-sm font-medium">Raison du blocage</label>
                  <Input placeholder="Activité suspecte détectée" />
                </div>
                <div>
                  <label className="text-sm font-medium">Durée</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner la durée" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1h">1 heure</SelectItem>
                      <SelectItem value="24h">24 heures</SelectItem>
                      <SelectItem value="7d">7 jours</SelectItem>
                      <SelectItem value="30d">30 jours</SelectItem>
                      <SelectItem value="permanent">Permanent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsBlockDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button className="bg-red-600 hover:bg-red-700">
                    Bloquer IP
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
        {accessStats.map((stat) => {
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
                  {stat.change} vs hier
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
            <div className="flex items-center gap-4 flex-wrap">
              <div className="relative flex-1 min-w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Rechercher par utilisateur, email ou IP..."
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
                  <SelectItem value="success">Réussie</SelectItem>
                  <SelectItem value="suspicious">Suspecte</SelectItem>
                  <SelectItem value="blocked">Bloquée</SelectItem>
                  <SelectItem value="failed">Échouée</SelectItem>
                </SelectContent>
              </Select>
              <Select value={deviceFilter} onValueChange={setDeviceFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Device" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="desktop">Desktop</SelectItem>
                  <SelectItem value="mobile">Mobile</SelectItem>
                  <SelectItem value="tablet">Tablet</SelectItem>
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

      {/* Access History Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-mkb-black">
              Historique des Connexions ({filteredAccess.length})
            </CardTitle>
            <CardDescription>
              Détail des tentatives de connexion et sessions actives
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Utilisateur</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">IP / Localisation</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Device</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Statut</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Durée</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Actions</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Contrôles</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAccess.map((access, index) => {
                    const DeviceIcon = getDeviceIcon(access.deviceType);
                    
                    return (
                      <motion.tr
                        key={access.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className={`border-b hover:bg-gray-50 ${access.suspicious ? 'bg-orange-50' : ''}`}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div>
                              <div className="font-medium text-mkb-black">{access.user}</div>
                              <div className="text-sm text-gray-500">{access.email}</div>
                            </div>
                            {access.suspicious && (
                              <AlertTriangle className="h-4 w-4 text-orange-600" />
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium text-gray-900">{access.ip}</div>
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {access.location}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <DeviceIcon className="h-4 w-4 text-gray-600" />
                            <div>
                              <div className="text-sm font-medium">{access.device.split('/')[0]}</div>
                              <div className="text-xs text-gray-500">{access.device.split('/')[1]}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge className={getStatusColor(access.status)}>
                            {getStatusText(access.status)}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div>
                            <div className="text-sm font-medium">{access.sessionDuration}</div>
                            <div className="text-xs text-gray-500">{access.actions} actions</div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center text-sm text-gray-600">
                          {access.timestamp}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-3 w-3" />
                            </Button>
                            {access.suspicious && (
                              <Button variant="ghost" size="sm" className="text-red-600">
                                <Ban className="h-3 w-3" />
                              </Button>
                            )}
                            <Button variant="ghost" size="sm">
                              <Shield className="h-3 w-3" />
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

      {/* Security Alerts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-mkb-black flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Alertes de Sécurité
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center gap-3">
                  <Ban className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="font-medium text-red-800">Connexion bloquée</p>
                    <p className="text-sm text-red-600">IP: 203.45.67.89 - sophie.laurent@mkb.com</p>
                  </div>
                </div>
                <Badge className="bg-red-100 text-red-800">Critique</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="font-medium text-orange-800">Activité suspecte</p>
                    <p className="text-sm text-orange-600">IP: 78.123.45.67 - pierre.durand@mkb.com</p>
                  </div>
                </div>
                <Badge className="bg-orange-100 text-orange-800">Attention</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">Système sécurisé</p>
                    <p className="text-sm text-green-600">Aucune menace détectée dans les dernières 24h</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800">OK</Badge>
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
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <p className="text-sm text-gray-500">
          Historique des Accès - <span className="text-mkb-blue font-semibold">#mkbpilot</span>
        </p>
      </motion.div>
    </div>
  );
}