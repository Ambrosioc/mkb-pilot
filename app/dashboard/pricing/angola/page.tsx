'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Car,
  Filter,
  Flag,
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

interface PricingStats {
  vehiculesTotal: number;
  vehiculesPostesMois: number;
  vehiculesPostesJour: number;
  moyennePostsCollaborateur: number;
  bestPriceur: {
    userId: string;
    total: number;
    name?: string;
  } | null;
  vehiculesAPoster: number;
  userStats: {
    postedToday: number;
    postedThisMonth: number;
  };
  loading: boolean;
}

interface Vehicle {
  id: string;
  brand: string;
  model: string;
  price: number;
  purchase_price: number;
  location: 'FR' | 'ALL';
  created_at: string;
  user: {
    prenom: string;
    nom: string;
  };
}

const VEHICLES_PER_PAGE = 10;
const VEHICLE_CACHE_KEY = 'priced_vehicles_month_cache';

export default function PricingAngolaPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [stats, setStats] = useState<PricingStats>({
    vehiculesTotal: 0,
    vehiculesPostesMois: 0,
    vehiculesPostesJour: 0,
    moyennePostsCollaborateur: 0,
    bestPriceur: null,
    vehiculesAPoster: 0,
    userStats: {
      postedToday: 0,
      postedThisMonth: 0
    },
    loading: true
  });
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalVehicles, setTotalVehicles] = useState(0);
  const fetchedStatsRef = useRef(false);

  useEffect(() => {
    console.log('useEffect[]: fetchPricingStats');
    if (!fetchedStatsRef.current) {
      fetchPricingStats();
      fetchedStatsRef.current = true;
    }
  }, []);

  useEffect(() => {
    console.log('useEffect[currentPage]: fetchVehicles', currentPage);
    fetchVehicles(currentPage);
  }, [currentPage]);

  useEffect(() => {
    console.log('useEffect[vehicles, searchTerm]: filter vehicles');
    // Filter vehicles based on search term only
    const filtered = vehicles.filter(vehicle => {
      const matchesSearch =
        vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.model.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesSearch;
    });

    setFilteredVehicles(filtered);
  }, [vehicles, searchTerm]);

  const fetchPricingStats = async () => {
    try {
      setStats(prev => ({ ...prev, loading: true }));

      // 1. Get total vehicles
      const { data: totalData, error: totalError } = await supabase
        .from('cars_v2')
        .select('count')
        .single();

      if (totalError) throw totalError;

      // 2. Get vehicles posted this month
      const firstDayOfMonth = new Date();
      firstDayOfMonth.setDate(1);
      firstDayOfMonth.setHours(0, 0, 0, 0);

      const { data: monthData, error: monthError } = await supabase
        .from('cars_v2')
        .select('count')
        .gte('created_at', firstDayOfMonth.toISOString())
        .single();

      if (monthError) throw monthError;

      // 3. Get vehicles posted today
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data: todayData, error: todayError } = await supabase
        .from('cars_v2')
        .select('count')
        .gte('created_at', today.toISOString())
        .single();

      if (todayError) throw todayError;

      // 4. Get average posts per user this month (placeholder for now)
      let avgData = 0;
      try {
        const { data: avgResult, error: avgError } = await supabase
          .rpc('get_average_posts_per_user_this_month');
        if (!avgError && avgResult !== null) {
          avgData = avgResult;
        }
      } catch (error) {
        console.warn("Function get_average_posts_per_user_this_month not available, using default value");
        avgData = 0;
      }

      // 5. Get best pricer this month (placeholder for now)
      let bestPricerData = null;
      try {
        const { data: bestResult, error: bestPricerError } = await supabase
          .rpc('get_best_pricer_this_month');
        if (!bestPricerError && bestResult) {
          bestPricerData = bestResult;
        }
      } catch (error) {
        console.warn("Function get_best_pricer_this_month not available, using default value");
        bestPricerData = null;
      }

      // 6. Get vehicles to be posted
      const { data: toPostData, error: toPostError } = await supabase
        .from('cars_v2')
        .select('count')
        .eq('status', 'prêt à poster')
        .single();

      if (toPostError) throw toPostError;

      // 7. Get current user stats if logged in
      let userStats = { postedToday: 0, postedThisMonth: 0 };

      if (user) {
        // Today's posts by user
        const { data: userTodayData, error: userTodayError } = await supabase
          .from('cars_v2')
          .select('count')
          .eq('user_id', user.id)
          .gte('created_at', today.toISOString())
          .single();

        if (!userTodayError && userTodayData) {
          userStats.postedToday = userTodayData.count || 0;
        }

        // Month's posts by user
        const { data: userMonthData, error: userMonthError } = await supabase
          .from('cars_v2')
          .select('count')
          .eq('user_id', user.id)
          .gte('created_at', firstDayOfMonth.toISOString())
          .single();

        if (!userMonthError && userMonthData) {
          userStats.postedThisMonth = userMonthData.count || 0;
        }
      }

      // 8. Get best pricer name if available
      let bestPricerName = '';
      if (bestPricerData && bestPricerData.length > 0) {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('prenom, nom')
          .eq('id', bestPricerData[0].user_id)
          .single();

        if (!userError && userData) {
          bestPricerName = `${userData.prenom} ${userData.nom}`;
        }
      }

      // Update stats state
      setStats({
        vehiculesTotal: totalData?.count || 0,
        vehiculesPostesMois: monthData?.count || 0,
        vehiculesPostesJour: todayData?.count || 0,
        moyennePostsCollaborateur: avgData || 0,
        bestPriceur: bestPricerData && bestPricerData.length > 0
          ? {
            userId: bestPricerData[0].user_id,
            total: bestPricerData[0].total,
            name: bestPricerName
          }
          : null,
        vehiculesAPoster: toPostData?.count || 0,
        userStats,
        loading: false
      });

    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      toast.error('Erreur lors du chargement des données');
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  const fetchVehicles = async (page = 1, forceRefresh = false) => {
    try {
      setLoading(true);
      const firstDayOfMonth = new Date();
      firstDayOfMonth.setDate(1);
      firstDayOfMonth.setHours(0, 0, 0, 0);

      // Vérifier le cache seulement si pas de forceRefresh
      if (!forceRefresh) {
        const cacheRaw = typeof window !== 'undefined' ? localStorage.getItem(VEHICLE_CACHE_KEY) : null;
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

      // Fetch paginé depuis l'API
      const from = (page - 1) * VEHICLES_PER_PAGE;
      const to = from + VEHICLES_PER_PAGE - 1;

      const { data, error, count } = await supabase
        .from('cars_v2')
        .select(`
          id,
          brand,
          model,
          price,
          purchase_price,
          location,
          created_at,
          users:user_id (
            prenom,
            nom
          )
        `, { count: 'exact' })
        .gte('created_at', firstDayOfMonth.toISOString())
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      // Transform data
      const transformedData = (data || []).map(item => ({
        id: item.id,
        brand: item.brand || 'N/A',
        model: item.model || 'N/A',
        price: item.price || 0,
        purchase_price: item.purchase_price || 0,
        location: item.location || 'FR',
        created_at: item.created_at,
        user: {
          prenom: item.users?.[0]?.prenom || 'Utilisateur',
          nom: item.users?.[0]?.nom || 'inconnu'
        }
      }));

      setVehicles(transformedData);
      setFilteredVehicles(transformedData);
      setTotalVehicles(count || 0);

      // Mettre à jour le cache
      if (typeof window !== 'undefined') {
        localStorage.setItem(
          VEHICLE_CACHE_KEY,
          JSON.stringify({
            vehicles: transformedData,
            total: count || 0,
            lastFetched: new Date().toISOString(),
            page
          })
        );
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des véhicules:', error);
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
      fetchPricingStats(),
      fetchVehicles(currentPage, true) // forceRefresh = true
    ]);
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
            {stats.loading ? (
              <Skeleton className="h-8 w-24 mb-2" />
            ) : (
              <div className="text-2xl font-bold text-mkb-black">{stats.vehiculesPostesMois}</div>
            )}
            <p className="text-xs text-gray-500 mb-4">
              Publications depuis le début du mois
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => router.push('/dashboard/stock')}
            >
              Voir tous les véhicules
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        {/* 2. Véhicules postés aujourd'hui */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Véhicules postés aujourd'hui
            </CardTitle>
            <Target className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            {stats.loading ? (
              <Skeleton className="h-8 w-24 mb-2" />
            ) : (
              <div className="text-2xl font-bold text-mkb-black">{stats.vehiculesPostesJour}</div>
            )}
            <p className="text-xs text-gray-500 mb-4">
              Publications du jour
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
            >
              Voir les posts du jour
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
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
            {stats.loading ? (
              <Skeleton className="h-8 w-24 mb-2" />
            ) : (
              <div className="text-2xl font-bold text-mkb-black">{stats.moyennePostsCollaborateur}</div>
            )}
            <p className="text-xs text-gray-500 mb-4">
              Moyenne mensuelle par utilisateur
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
            >
              Détail par collaborateur
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
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
            {stats.loading ? (
              <Skeleton className="h-8 w-24 mb-2" />
            ) : stats.bestPriceur ? (
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold text-mkb-black">{stats.bestPriceur.name || 'Utilisateur #' + stats.bestPriceur.userId.substring(0, 4)}</div>
                <Badge className="bg-yellow-100 text-yellow-800">🔥 {stats.bestPriceur.total} posts</Badge>
              </div>
            ) : (
              <div className="text-sm text-gray-500">Aucune donnée disponible</div>
            )}
            <p className="text-xs text-gray-500 mb-4">
              Collaborateur le plus productif
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              disabled={!stats.bestPriceur}
            >
              Voir le profil
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
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
            {stats.loading ? (
              <Skeleton className="h-8 w-24 mb-2" />
            ) : (
              <div className="text-2xl font-bold text-mkb-black">{stats.vehiculesAPoster}</div>
            )}
            <p className="text-xs text-gray-500 mb-4">
              Véhicules prêts à être publiés
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
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
              {stats.loading ? (
                <Skeleton className="h-8 w-24 mb-2" />
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Aujourd'hui:</span>
                    <span className="font-bold text-mkb-blue">{stats.userStats.postedToday}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Ce mois:</span>
                    <span className="font-bold text-mkb-blue">{stats.userStats.postedThisMonth}</span>
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
                Véhicules pricés ce mois-ci
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
                    : 'Aucun véhicule n\'a été pricé ce mois-ci.'}
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
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Prix d'achat</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Marge</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Pricé par</th>
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
                              {vehicle.brand} {vehicle.model}
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
                          <td className="py-3 px-4">
                            <div className="text-sm">
                              {vehicle.user.prenom} {vehicle.user.nom}
                            </div>
                          </td>
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
              <Button variant="outline" className="border-mkb-yellow text-mkb-yellow hover:bg-mkb-yellow hover:text-white">
                <Filter className="mr-2 h-4 w-4" />
                Filtrer
              </Button>
              <Button variant="outline" className="border-gray-300">
                <Flag className="mr-2 h-4 w-4" />
                Mes véhicules
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