'use client';

import { VehicleDetailDrawer } from '@/components/forms/VehicleDetailDrawer';
import { VehicleDrawer } from '@/components/forms/VehicleDrawer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataFilters, FilterConfig } from '@/components/ui/DataFilters';
import { Pagination } from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSearchableDataFetching } from '@/hooks/useDataFetching';
import { Vehicle, vehicleService } from '@/lib/services/vehicleService';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Archive,
  Car,
  CheckCircle,
  Clock,
  Edit3,
  Eye,
  FileText,
  Package,
  Plus,
  Receipt,
  User
} from 'lucide-react';
import { useRouter } from 'next/navigation';
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
    value: '0',
    change: '+0',
    icon: Package,
    color: 'text-green-600',
  },
  {
    title: 'Disponibles',
    value: '0',
    change: '+0',
    icon: CheckCircle,
    color: 'text-mkb-blue',
  },
  {
    title: 'Réservés',
    value: '0',
    change: '+0',
    icon: Clock,
    color: 'text-orange-600',
  },
  {
    title: 'Vendus',
    value: '0',
    change: '+0',
    icon: Receipt,
    color: 'text-blue-600',
  },
  {
    title: 'À Vérifier',
    value: '0',
    change: '+0',
    icon: AlertTriangle,
    color: 'text-red-600',
  },
];

export default function StockPage() {
  const router = useRouter();
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [isVehicleDrawerOpen, setIsVehicleDrawerOpen] = useState(false);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [metrics, setMetrics] = useState<StockMetric[]>(stockMetrics);
  const [availableBrands, setAvailableBrands] = useState<string[]>([]);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [availableLocations, setAvailableLocations] = useState<string[]>([]);

  // Configuration de la pagination et du cache
  const paginationConfig = {
    itemsPerPage: 10,
    cacheKey: 'stock_vehicles',
    cacheExpiryMinutes: 5,
  };

  // Hook de récupération des données avec recherche
  const {
    data: vehicles,
    loading,
    error,
    totalItems,
    searchTerm,
    setSearchTerm,
    filters,
    updateFilters,
    clearFilters,
    refetch,
  } = useSearchableDataFetching<Vehicle>(
    vehicleService.fetchVehicles,
    paginationConfig,
    { status: 'all', brand: 'all', location: 'all' } // Filtres par défaut
  );

  // Charger les données initiales
  useEffect(() => {
    fetchInitialData();
  }, []);

  // Suppression de l'effet problématique qui causait une boucle infinie
  // Les filtres par défaut sont maintenant gérés par le hook useSearchableDataFetching

  const fetchInitialData = async () => {
    try {
      // Charger les statistiques
      const stats = await vehicleService.fetchVehicleStats();
      updateMetrics(stats);

      // Charger les options de filtres
      const [brands, locations] = await Promise.all([
        vehicleService.getAvailableBrands(),
        vehicleService.getAvailableLocations(),
      ]);

      setAvailableBrands(brands);
      setAvailableLocations(locations);
    } catch (error) {
      console.error('Erreur lors du chargement des données initiales:', error);
    }
  };

  const updateMetrics = (stats: any) => {
    const [totalMetric, disponiblesMetric, reservesMetric, vendusMetric, aVerifierMetric] = stockMetrics;
    setMetrics([
      { ...totalMetric, value: stats.total.toString() } as StockMetric,
      { ...disponiblesMetric, value: stats.disponibles.toString() } as StockMetric,
      { ...reservesMetric, value: stats.reserves.toString() } as StockMetric,
      { ...vendusMetric, value: stats.vendus.toString() } as StockMetric,
      { ...aVerifierMetric, value: stats.aVerifier.toString() } as StockMetric,
    ]);
  };

  // Configuration des filtres
  const filterConfigs: FilterConfig[] = [
    {
      key: 'status',
      type: 'select',
      label: 'Statut',
      placeholder: 'Filtrer par statut',
      options: [
        { value: 'disponible', label: 'Disponible' },
        { value: 'reserve', label: 'Réservé' },
        { value: 'vendu', label: 'Vendu' },
        { value: 'a-verifier', label: 'À Vérifier' },
      ],
      defaultValue: 'all',
    },
    {
      key: 'brand',
      type: 'select',
      label: 'Marque',
      placeholder: 'Filtrer par marque',
      options: availableBrands.map(brand => ({ value: brand, label: brand })),
      defaultValue: 'all',
    },
    {
      key: 'location',
      type: 'select',
      label: 'Localisation',
      placeholder: 'Filtrer par localisation',
      options: availableLocations.map(location => ({ value: location, label: location })),
      defaultValue: 'all',
    },
  ];

  // Gestion des filtres
  const handleFilterChange = (key: string, value: any) => {
    updateFilters(key, value);
  };

  const handleClearFilters = () => {
    clearFilters();
  };

  const handleRefresh = () => {
    refetch();
    fetchInitialData();
  };

  // Gestion des événements
  const handleVehicleAdded = () => {
    refetch();
    fetchInitialData();
    toast.success('Véhicule ajouté avec succès !');
  };

  const handleViewVehicle = (vehicleId: string) => {
    setSelectedVehicle(vehicleId);
    setIsDetailDrawerOpen(true);
  };

  const handleStatusChange = async (vehicleId: string, newStatus: string) => {
    try {
      await vehicleService.updateVehicleStatus(vehicleId, newStatus);
      toast.success('Statut mis à jour avec succès !');

      // Rafraîchir les données de manière optimisée
      await Promise.all([
        refetch(), // Rafraîchir la liste des véhicules
        fetchInitialData() // Rafraîchir les statistiques
      ]);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      toast.error('Erreur lors de la mise à jour du statut');
    }
  };

  // Utilitaires d'affichage
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
            onClick={() => router.push('/dashboard/stock/new')}
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter Véhicule
          </Button>
        </div>
      </motion.div>

      {/* Metrics */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6"
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
            <DataFilters
              filters={filterConfigs}
              values={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
              onRefresh={handleRefresh}
              searchValue={searchTerm}
              onSearchChange={setSearchTerm}
              searchPlaceholder="Rechercher par marque, modèle, référence..."
              loading={loading}
            />
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
              Véhicules en Stock ({totalItems})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mkb-blue"></div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <AlertTriangle className="h-12 w-12 text-red-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700">Erreur de chargement</h3>
                <p className="text-gray-500 mt-2">{error}</p>
                <Button
                  className="mt-4 bg-mkb-blue hover:bg-mkb-blue/90"
                  onClick={handleRefresh}
                >
                  Réessayer
                </Button>
              </div>
            ) : vehicles.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700">Aucun véhicule trouvé</h3>
                <p className="text-gray-500 mt-2">Modifiez vos filtres ou ajoutez un nouveau véhicule.</p>
                <Button
                  className="mt-4 bg-mkb-blue hover:bg-mkb-blue/90"
                  onClick={() => router.push('/dashboard/stock/new')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un véhicule
                </Button>
              </div>
            ) : (
              <>
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
                      {vehicles.map((vehicle, index) => (
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
                            <div onClick={(e) => e.stopPropagation()} className="flex items-center justify-center gap-2">
                              <Select
                                value={vehicle.status}
                                onValueChange={(newStatus) => handleStatusChange(vehicle.id, newStatus)}
                              >
                                <SelectTrigger className="w-36 border-0 bg-transparent hover:bg-gray-50 focus:ring-0">
                                  <SelectValue>
                                    <div className="flex items-center gap-2">
                                      <Badge className={getStatusColor(vehicle.status)}>
                                        {getStatusText(vehicle.status)}
                                      </Badge>
                                      <Edit3 className="h-3 w-3 text-gray-400" />
                                    </div>
                                  </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="disponible">
                                    <div className="flex items-center gap-2">
                                      <Badge className="bg-green-100 text-green-800">Disponible</Badge>
                                      <span className="text-sm text-gray-600">Véhicule disponible à la vente</span>
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="reserve">
                                    <div className="flex items-center gap-2">
                                      <Badge className="bg-orange-100 text-orange-800">Réservé</Badge>
                                      <span className="text-sm text-gray-600">Véhicule réservé par un client</span>
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="vendu">
                                    <div className="flex items-center gap-2">
                                      <Badge className="bg-blue-100 text-blue-800">Vendu</Badge>
                                      <span className="text-sm text-gray-600">Véhicule vendu</span>
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="a-verifier">
                                    <div className="flex items-center gap-2">
                                      <Badge className="bg-red-100 text-red-800">À Vérifier</Badge>
                                      <span className="text-sm text-gray-600">Véhicule nécessitant une vérification</span>
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
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
                                  setTimeout(() => {
                                    (document.querySelector('[data-value="documents"]') as HTMLElement)?.click();
                                  }, 500);
                                }}
                              >
                                <FileText className="h-3 w-3" />
                              </Button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalItems > paginationConfig.itemsPerPage && (
                  <div className="mt-6">
                    <Pagination
                      currentPage={1}
                      totalPages={Math.ceil(totalItems / paginationConfig.itemsPerPage)}
                      onPageChange={(page) => {
                        // TODO: Implémenter la pagination
                      }}
                      hasNextPage={1 < Math.ceil(totalItems / paginationConfig.itemsPerPage)}
                      hasPrevPage={false}
                      totalItems={totalItems}
                      itemsPerPage={paginationConfig.itemsPerPage}
                    />
                  </div>
                )}
              </>
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
                onClick={() => router.push('/dashboard/stock/new')}
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
      {isVehicleDrawerOpen && (
        <VehicleDrawer
          open={isVehicleDrawerOpen}
          onOpenChange={setIsVehicleDrawerOpen}
          onSuccess={handleVehicleAdded}
        />
      )}

      {/* Vehicle Detail Drawer */}
      {isDetailDrawerOpen && selectedVehicle && (
        <VehicleDetailDrawer
          open={isDetailDrawerOpen}
          onOpenChange={setIsDetailDrawerOpen}
          vehicleId={selectedVehicle}
        />
      )}
    </div>
  );
}