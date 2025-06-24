'use client';

import { VehicleDetailDrawer } from '@/components/forms/VehicleDetailDrawer';
import { VehicleDrawer } from '@/components/forms/VehicleDrawer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Archive,
  Car,
  CheckCircle,
  Clock,
  Eye,
  FileText,
  Filter,
  MoreHorizontal,
  Package,
  Plus,
  Receipt,
  Search,
  User
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface StockMetric {
  title: string;
  value: string;
  change: string;
  icon: typeof Package;
  color: string;
}

const stockMetrics: StockMetric[] = [
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

interface Vehicle {
  id: string;
  reference: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  status: string;
  location: string;
  assignedTo: string;
  contact: string;
  lastUpdate: string;
  mileage: number;
  color: string;
}

export default function StockPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [isVehicleDrawerOpen, setIsVehicleDrawerOpen] = useState(false);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [vehiclesData, setVehiclesData] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState<StockMetric[]>(stockMetrics);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    setIsLoading(true);
    try {
      // Fetch vehicles from Supabase
      const { data, error } = await supabase
        .from('cars_v2')
        .select(`
          id,
          reference,
          brand,
          model,
          year,
          mileage,
          color,
          location,
          price_sale,
          created_at,
          updated_at,
          status
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform data to match our interface
      const transformedData: Vehicle[] = data.map(car => ({
        id: car.id,
        reference: car.reference || `REF-${car.id.substring(0, 6)}`,
        brand: car.brand,
        model: car.model,
        year: car.year,
        price: car.price_sale || 0,
        status: car.status || 'disponible',
        location: car.location || 'Non spécifié',
        assignedTo: 'Non assigné', // This would come from a join in a real app
        contact: 'Non spécifié', // This would come from a join in a real app
        lastUpdate: car.updated_at ? new Date(car.updated_at).toLocaleDateString() : new Date(car.created_at).toLocaleDateString(),
        mileage: car.mileage,
        color: car.color
      }));

      setVehiclesData(transformedData);

      // Update metrics
      const total = transformedData.length;
      const disponibles = transformedData.filter(v => v.status === 'disponible').length;
      const reserves = transformedData.filter(v => v.status === 'reserve' || v.status === 'réservé').length;
      const aVerifier = transformedData.filter(v => v.status === 'a-verifier').length;

      const [totalMetric, disponiblesMetric, reservesMetric, aVerifierMetric] = stockMetrics;
      setMetrics([
        { ...totalMetric, value: total.toString() } as StockMetric,
        { ...disponiblesMetric, value: disponibles.toString() } as StockMetric,
        { ...reservesMetric, value: reserves.toString() } as StockMetric,
        { ...aVerifierMetric, value: aVerifier.toString() } as StockMetric,
      ]);

    } catch (error) {
      console.error('Error fetching vehicles:', error);
      toast.error('Erreur lors du chargement des véhicules');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredVehicles = vehiclesData.filter(vehicle => {
    const matchesSearch = vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.reference.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || vehicle.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleVehicleAdded = () => {
    fetchVehicles();
    toast.success('Véhicule ajouté avec succès !');
  };

  const handleViewVehicle = (vehicleId: string) => {
    setSelectedVehicle(vehicleId);
    setIsDetailDrawerOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'disponible': return 'bg-green-100 text-green-800';
      case 'reserve': case 'réservé': return 'bg-orange-100 text-orange-800';
      case 'vendu': return 'bg-blue-100 text-blue-800';
      case 'a-verifier': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'disponible': return 'Disponible';
      case 'reserve': case 'réservé': return 'Réservé';
      case 'vendu': return 'Vendu';
      case 'a-verifier': return 'À Vérifier';
      default: return 'Inconnu';
    }
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
        {metrics.map((metric) => {
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
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mkb-blue"></div>
              </div>
            ) : filteredVehicles.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700">Aucun véhicule trouvé</h3>
                <p className="text-gray-500 mt-2">Modifiez vos filtres ou ajoutez un nouveau véhicule.</p>
                <Button
                  className="mt-4 bg-mkb-blue hover:bg-mkb-blue/90"
                  onClick={() => setIsVehicleDrawerOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un véhicule
                </Button>
              </div>
            ) : (
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
                        className="border-b hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleViewVehicle(vehicle.id)}
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
                          <div className="flex items-center justify-center gap-1" onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Voir détails"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewVehicle(vehicle.id);
                              }}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Créer facture"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewVehicle(vehicle.id);
                                // Delay to allow drawer to open first
                                setTimeout(() => {
                                  (document.querySelector('[data-value="documents"]') as HTMLElement)?.click();
                                }, 500);
                              }}
                            >
                              <Receipt className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Créer devis"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewVehicle(vehicle.id);
                                // Delay to allow drawer to open first
                                setTimeout(() => {
                                  (document.querySelector('[data-value="documents"]') as HTMLElement)?.click();
                                }, 500);
                              }}
                            >
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
            )}
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

      {/* Vehicle Detail Drawer */}
      <VehicleDetailDrawer
        open={isDetailDrawerOpen}
        onOpenChange={setIsDetailDrawerOpen}
        vehicleId={selectedVehicle || ''}
      />
    </div>
  );
}