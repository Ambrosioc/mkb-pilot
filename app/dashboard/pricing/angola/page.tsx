'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { usePricingStats, type PostedVehicle } from '@/hooks/usePricingStats';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Car,
  Filter,
  Globe,
  MapPinned,
  Plus,
  Search,
  Target,
  TrendingUp,
  User,
  Users
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

const VEHICLES_PER_PAGE = 10;
const getVehicleCacheKey = (showMyVehiclesOnly: boolean) =>
  `priced_vehicles_month_cache_${showMyVehiclesOnly ? 'my' : 'all'}`;

export default function PricingAngolaPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<PostedVehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<PostedVehicle[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalVehicles, setTotalVehicles] = useState(0);
  const [showMyVehiclesOnly, setShowMyVehiclesOnly] = useState(false);
  const fetchedStatsRef = useRef(false);

  // Utiliser le nouveau hook pour les statistiques
  const {
    postedStats,
    vehiclesToPost,
    loading: statsLoading,
    error: statsError,
    fetchPostedVehicles,
    refreshStats
  } = usePricingStats(undefined, undefined, showMyVehiclesOnly ? user?.id : undefined);

  // Hook pour les stats personnelles de l'utilisateur connecté (toujours user.id)
  const {
    postedStats: myStats,
    loading: myStatsLoading,
    error: myStatsError
  } = usePricingStats(undefined, undefined, user?.id);

  useEffect(() => {
    console.log('useEffect[]: fetchPricingStats');
    if (!fetchedStatsRef.current) {
      fetchPostedVehiclesStats();
      fetchedStatsRef.current = true;
    }
  }, []);

  useEffect(() => {
    console.log('useEffect[currentPage, showMyVehiclesOnly]: fetchVehicles', currentPage, showMyVehiclesOnly);
    fetchVehicles(currentPage);
  }, [currentPage, showMyVehiclesOnly]);

  useEffect(() => {
    console.log('useEffect[vehicles, searchTerm]: filter vehicles');
    // Filter vehicles based on search term only
    const filtered = vehicles.filter(vehicle => {
      const matchesSearch =
        vehicle.brand_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.model_name.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesSearch;
    });

    setFilteredVehicles(filtered);
  }, [vehicles, searchTerm]);

  const fetchPostedVehiclesStats = async () => {
    // Cette fonction est maintenant gérée par le hook usePricingStats
    // On peut l'appeler pour rafraîchir les données si nécessaire
    refreshStats();
  };

  const fetchVehicles = async (page = 1, forceRefresh = false) => {
    try {
      setLoading(true);
      const firstDayOfMonth = new Date();
      firstDayOfMonth.setDate(1);
      firstDayOfMonth.setHours(0, 0, 0, 0);

      // Vérifier le cache seulement si pas de forceRefresh
      if (!forceRefresh) {
        const cacheKey = getVehicleCacheKey(showMyVehiclesOnly);
        const cacheRaw = typeof window !== 'undefined' ? localStorage.getItem(cacheKey) : null;
        if (cacheRaw) {
          try {
            const cache = JSON.parse(cacheRaw);
            const { vehicles: cachedVehicles, total, lastFetched, page: cachedPage } = cache;

            // Vérifier si le cache est récent (moins de 5 minutes) et pour la même page
            const cacheAge = new Date().getTime() - new Date(lastFetched).getTime();
            const isRecent = cacheAge < 5 * 60 * 1000; // 5 minutes
            const isSamePage = cachedPage === page;

            if (isRecent && isSamePage && cachedVehicles && total) {
              setTotalVehicles(total);
              setVehicles(cachedVehicles);
              setFilteredVehicles(cachedVehicles);
              setLoading(false);
              return;
            }
          } catch (error) {
            console.warn('Erreur lors de la lecture du cache:', error);
          }
        }
      }

      // Utiliser le nouveau hook pour récupérer les véhicules postés
      const result = await fetchPostedVehicles(page, VEHICLES_PER_PAGE, forceRefresh);

      setVehicles(result.vehicles);
      setFilteredVehicles(result.vehicles);
      setTotalVehicles(result.total);

      // Mettre à jour le cache
      if (typeof window !== 'undefined') {
        const cacheKey = getVehicleCacheKey(showMyVehiclesOnly);
        localStorage.setItem(
          cacheKey,
          JSON.stringify({
            vehicles: result.vehicles,
            total: result.total,
            lastFetched: new Date().toISOString(),
            page
          })
        );
      }
    } catch (error: any) {
      console.error('Erreur lors de la récupération des véhicules:', error);
      console.error('Détails de l\'erreur:', {
        message: error?.message,
        code: error?.code,
        details: error?.details,
        hint: error?.hint
      });
      toast.error('Erreur lors du chargement des véhicules');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(price);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Pagination controls
  const totalPages = Math.ceil(totalVehicles / VEHICLES_PER_PAGE);
  const handlePrevPage = () => setCurrentPage((p) => Math.max(1, p - 1));
  const handleNextPage = () => setCurrentPage((p) => Math.min(totalPages, p + 1));

  // Fonction pour rafraîchir les données
  const refreshData = async () => {
    await Promise.all([
      refreshStats(),
      fetchVehicles(currentPage, true) // forceRefresh = true
    ]);
  };

  // Fonction pour basculer entre mes véhicules et tous les véhicules
  const toggleMyVehicles = () => {
    setShowMyVehiclesOnly(!showMyVehiclesOnly);
    setCurrentPage(1); // Reset to first page when switching

    // Nettoyer le cache pour forcer le rechargement des données
    if (typeof window !== 'undefined') {
      localStorage.removeItem(getVehicleCacheKey(showMyVehiclesOnly));
      localStorage.removeItem(getVehicleCacheKey(!showMyVehiclesOnly));
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
          <Globe className="h-8 w-8 text-mkb-blue" />
          <div>
            <h1 className="text-3xl font-bold text-mkb-black">
              Pricing – Équipe Angola
            </h1>
            <p className="text-gray-600">
              Suivi des véhicules pricés pour le marché français
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/pricing">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Button>
          </Link>
          <Link href="/dashboard/pricing/angola/add">
            <Button className="bg-mkb-blue hover:bg-mkb-blue/90 gap-2">
              <Plus className="h-4 w-4" />
              Ajouter un véhicule
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {/* 1. Véhicules postés ce mois-ci */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Véhicules postés ce mois-ci
            </CardTitle>
            <Calendar className="h-4 w-4 text-mkb-blue" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-24 mb-2" />
            ) : (
              <div className="text-2xl font-bold text-mkb-black">{postedStats.posted_this_month}</div>
            )}
            <p className="text-xs text-gray-500">
              Publications depuis le début du mois
            </p>
          </CardContent>
        </Card>

        {/* 2. Véhicules postés aujourd'hui */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Véhicules postés aujourd&apos;hui
            </CardTitle>
            <Target className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-24 mb-2" />
            ) : (
              <div className="text-2xl font-bold text-mkb-black">{postedStats.posted_today}</div>
            )}
            <p className="text-xs text-gray-500">
              Publications du jour
            </p>
          </CardContent>
        </Card>

        {/* 3. Moyenne de posts / collaborateur */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Moyenne posts / collaborateur
            </CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-24 mb-2" />
            ) : (
              <div className="text-2xl font-bold text-mkb-black">{postedStats.avg_posts_per_user.toFixed(1)}</div>
            )}
            <p className="text-xs text-gray-500">
              Moyenne mensuelle par utilisateur
            </p>
          </CardContent>
        </Card>

        {/* 4. Best priceur du mois */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Best priceur du mois
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-24 mb-2" />
            ) : postedStats.best_pricer_user_id ? (
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold text-mkb-black">
                  {postedStats.best_pricer_name || `Utilisateur #${postedStats.best_pricer_user_id.substring(0, 8)}`}
                </div>
                <Badge className="bg-yellow-100 text-yellow-800">🔥 {postedStats.best_pricer_total} posts</Badge>
              </div>
            ) : (
              <div className="text-sm text-gray-500">Aucune donnée disponible</div>
            )}
            <p className="text-xs text-gray-500">
              Collaborateur le plus productif
            </p>
          </CardContent>
        </Card>

        {/* 5. Véhicules à poster */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Véhicules à poster
            </CardTitle>
            <Car className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-24 mb-2" />
            ) : (
              <div className="text-2xl font-bold text-mkb-black">{vehiclesToPost.length}</div>
            )}
            <p className="text-xs text-gray-500 mb-4">
              Véhicules prêts à être publiés
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => router.push('/dashboard/pricing/to-post')}
            >
              Voir la liste
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        {/* 6. Mes statistiques */}
        {user && (
          <Card className="hover:shadow-lg transition-shadow border-mkb-blue/20 bg-mkb-blue/5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Mes statistiques
              </CardTitle>
              <User className="h-4 w-4 text-mkb-blue" />
            </CardHeader>
            <CardContent>
              {myStatsLoading ? (
                <Skeleton className="h-8 w-24 mb-2" />
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Aujourd&apos;hui:</span>
                    <span className="font-bold text-mkb-blue">{myStats.user_posted_today}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Ce mois:</span>
                    <span className="font-bold text-mkb-blue">{myStats.user_posted_this_month}</span>
                  </div>
                </div>
              )}
              <div className="mt-4">
                <Link href="/dashboard/pricing/angola/add">
                  <Button
                    className="w-full bg-mkb-blue hover:bg-mkb-blue/90"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter un véhicule
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* Vehicles List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-mkb-black flex items-center gap-2">
                <Car className="h-5 w-5" />
                {showMyVehiclesOnly ? 'Mes véhicules pricés ce mois-ci' : 'Véhicules pricés par l\'équipe ce mois-ci'}
              </CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-60"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[250px]" />
                      <Skeleton className="h-4 w-[200px]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredVehicles.length === 0 ? (
              <div className="text-center py-12">
                <Car className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700">Aucun véhicule trouvé</h3>
                <p className="text-gray-500 mt-2">
                  {searchTerm
                    ? 'Essayez de modifier vos filtres de recherche.'
                    : showMyVehiclesOnly
                      ? 'Vous n\'avez pas encore pricé de véhicules ce mois-ci.'
                      : 'Aucun véhicule n\'a été pricé par l\'équipe ce mois-ci.'}
                </p>
                <Link href="/dashboard/pricing/angola/add">
                  <Button className="mt-4 bg-mkb-blue hover:bg-mkb-blue/90">
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter un véhicule
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Véhicule</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700"><MapPinned /></th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Prix de vente</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Prix d&apos;achat</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Marge</th>
                      {!showMyVehiclesOnly && (
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Pricé par</th>
                      )}
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredVehicles.map((vehicle, index) => {
                      const margin = vehicle.price - vehicle.purchase_price;
                      const marginPercent = vehicle.purchase_price > 0
                        ? ((margin / vehicle.purchase_price) * 100).toFixed(1)
                        : 'N/A';

                      return (
                        <motion.tr
                          key={vehicle.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className="border-b hover:bg-gray-50"
                        >
                          <td className="py-3 px-4">
                            <div className="text-mkb-black">
                              {vehicle.brand_name} {vehicle.model_name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {vehicle.reference}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Badge className={vehicle.location === 'FR'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                            }>
                              {vehicle.location}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-right font-medium">
                            {formatPrice(vehicle.price)}
                          </td>
                          <td className="py-3 px-4 text-right">
                            {formatPrice(vehicle.purchase_price)}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className={`font-medium ${margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {formatPrice(margin)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {marginPercent !== 'N/A' ? `${marginPercent}%` : 'N/A'}
                            </div>
                          </td>
                          {!showMyVehiclesOnly && (
                            <td className="py-3 px-4">
                              <div className="text-sm">
                                {vehicle.posted_by_user_name}
                              </div>
                            </td>
                          )}
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {formatDate(vehicle.created_at)}
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-4 mt-4">
                    <Button variant="outline" size="sm" onClick={handlePrevPage} disabled={currentPage === 1}>
                      Précédent
                    </Button>
                    <span className="text-sm text-gray-600">
                      Page {currentPage} sur {totalPages}
                    </span>
                    <Button variant="outline" size="sm" onClick={handleNextPage} disabled={currentPage === totalPages}>
                      Suivant
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-mkb-black">Actions Rapides</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/dashboard/pricing/angola/add">
                <Button className="w-full bg-mkb-blue hover:bg-mkb-blue/90 text-white">
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter un véhicule
                </Button>
              </Link>
              <Button
                variant="outline"
                className={`border-mkb-yellow text-mkb-yellow hover:bg-mkb-yellow hover:text-white ${showMyVehiclesOnly ? 'bg-mkb-yellow text-white' : ''}`}
                onClick={toggleMyVehicles}
              >
                <User className="mr-2 h-4 w-4" />
                {showMyVehiclesOnly ? 'Voir l\'équipe' : 'Mes véhicules'}
              </Button>
              <Button variant="outline" className="border-gray-300">
                <Filter className="mr-2 h-4 w-4" />
                Filtrer
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
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <p className="text-sm text-gray-500">
          Pricing Angola - <span className="text-mkb-blue font-semibold">#mkbpilot</span>
        </p>
      </motion.div>
    </div>
  );
}