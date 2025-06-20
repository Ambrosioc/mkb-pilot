'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Package,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  FileText,
  Receipt,
  ShoppingCart,
  User,
  Calendar,
  Archive,
  Copy,
  CheckCircle,
  Clock,
  AlertTriangle,
  Car,
  MoreHorizontal
} from 'lucide-react';
import { VehicleDrawer } from '@/components/forms/VehicleDrawer';
import { toast } from 'sonner';

const stockMetrics = [
  {
    title: 'Véhicules Total',
    value: '247',
    change: '+12',
    icon: Package,
    color: 'text-green-600',
  },
  {
    title: 'Disponibles',
    value: '156',
    change: '+8',
    icon: CheckCircle,
    color: 'text-mkb-blue',
  },
  {
    title: 'Réservés',
    value: '34',
    change: '+5',
    icon: Clock,
    color: 'text-orange-600',
  },
  {
    title: 'À Vérifier',
    value: '12',
    change: '-3',
    icon: AlertTriangle,
    color: 'text-red-600',
  },
];

const vehiclesData = [
  {
    id: 'VH-2024-001',
    reference: 'REF-001',
    brand: 'Peugeot',
    model: '308',
    year: 2023,
    price: 18500,
    status: 'disponible',
    location: 'Paris',
    assignedTo: 'Jean Martin',
    contact: 'Marie Dubois',
    lastUpdate: '2024-03-15',
    mileage: 25000,
    color: 'Blanc'
  },
  {
    id: 'VH-2024-002',
    reference: 'REF-002',
    brand: 'Renault',
    model: 'Clio',
    year: 2022,
    price: 14200,
    status: 'reserve',
    location: 'Lyon',
    assignedTo: 'Sophie Laurent',
    contact: 'Pierre Durand',
    lastUpdate: '2024-03-14',
    mileage: 18000,
    color: 'Noir'
  },
  {
    id: 'VH-2024-003',
    reference: 'REF-003',
    brand: 'Volkswagen',
    model: 'Golf',
    year: 2024,
    price: 22800,
    status: 'vendu',
    location: 'Marseille',
    assignedTo: 'Thomas Leclerc',
    contact: 'Claire Moreau',
    lastUpdate: '2024-03-13',
    mileage: 5000,
    color: 'Gris'
  },
  {
    id: 'VH-2024-004',
    reference: 'REF-004',
    brand: 'BMW',
    model: 'Série 3',
    year: 2023,
    price: 35000,
    status: 'a-verifier',
    location: 'Toulouse',
    assignedTo: 'Marie-Claire Fontaine',
    contact: 'Alexandre Dubois',
    lastUpdate: '2024-03-12',
    mileage: 12000,
    color: 'Bleu'
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'disponible': return 'bg-green-100 text-green-800';
    case 'reserve': return 'bg-orange-100 text-orange-800';
    case 'vendu': return 'bg-blue-100 text-blue-800';
    case 'a-verifier': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'disponible': return 'Disponible';
    case 'reserve': return 'Réservé';
    case 'vendu': return 'Vendu';
    case 'a-verifier': return 'À Vérifier';
    default: return 'Inconnu';
  }
};

export default function StockPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [isVehicleDrawerOpen, setIsVehicleDrawerOpen] = useState(false);

  const filteredVehicles = vehiclesData.filter(vehicle => {
    const matchesSearch = vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.reference.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || vehicle.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleVehicleAdded = () => {
    // Ici, vous pourriez recharger la liste des véhicules depuis Supabase
    toast.success('Véhicule ajouté avec succès !');
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
          <Package className="h-8 w-8 text-mkb-blue" />
          <div>
            <h1 className="text-3xl font-bold text-mkb-black">
              📦 Stock Central
            </h1>
            <p className="text-gray-600">
              Gestion centralisée de tous les véhicules MKB
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            className="bg-mkb-blue hover:bg-mkb-blue/90"
            onClick={() => setIsVehicleDrawerOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter Véhicule
          </Button>
        </div>
      </motion.div>

      {/* Metrics */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {stockMetrics.map((metric) => {
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
                  placeholder="Rechercher par marque, modèle, référence..."
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
                  <SelectItem value="disponible">Disponible</SelectItem>
                  <SelectItem value="reserve">Réservé</SelectItem>
                  <SelectItem value="vendu">Vendu</SelectItem>
                  <SelectItem value="a-verifier">À Vérifier</SelectItem>
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

      {/* Vehicles Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-mkb-black">
              Véhicules en Stock ({filteredVehicles.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Véhicule</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Prix</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Statut</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Assigné à</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Contact</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVehicles.map((vehicle, index) => (
                    <motion.tr
                      key={vehicle.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <Car className="h-5 w-5 text-mkb-blue" />
                          <div>
                            <div className="font-medium text-mkb-black">
                              {vehicle.brand} {vehicle.model}
                            </div>
                            <div className="text-sm text-gray-500">
                              {vehicle.reference} • {vehicle.year} • {vehicle.mileage.toLocaleString()} km
                            </div>
                            <div className="text-xs text-gray-400">
                              {vehicle.color} • {vehicle.location}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-mkb-black">
                          €{vehicle.price.toLocaleString()}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge className={getStatusColor(vehicle.status)}>
                          {getStatusText(vehicle.status)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{vehicle.assignedTo}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-mkb-blue" />
                          <span className="text-sm text-mkb-blue cursor-pointer hover:underline">
                            {vehicle.contact}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button variant="ghost" size="sm" title="Voir détails">
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm" title="Créer facture">
                            <Receipt className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm" title="Créer devis">
                            <FileText className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm" title="Plus d'actions">
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

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-mkb-black">Actions Rapides</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button 
                className="bg-mkb-blue hover:bg-mkb-blue/90 text-white"
                onClick={() => setIsVehicleDrawerOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Nouveau Véhicule
              </Button>
              <Button variant="outline" className="border-mkb-yellow text-mkb-yellow hover:bg-mkb-yellow hover:text-white">
                <Receipt className="mr-2 h-4 w-4" />
                Créer Facture
              </Button>
              <Button variant="outline" className="border-gray-300">
                <FileText className="mr-2 h-4 w-4" />
                Générer Devis
              </Button>
              <Button variant="outline" className="border-gray-300">
                <Archive className="mr-2 h-4 w-4" />
                Archiver Sélection
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
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <p className="text-sm text-gray-500">
          📦 Stock Central - <span className="text-mkb-blue font-semibold">#mkbpilot</span>
        </p>
      </motion.div>

      {/* Vehicle Drawer */}
      <VehicleDrawer 
        open={isVehicleDrawerOpen} 
        onOpenChange={setIsVehicleDrawerOpen}
        onSuccess={handleVehicleAdded}
      />
    </div>
  );
}