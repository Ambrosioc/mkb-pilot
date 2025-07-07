import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export interface PostedVehiclesStats {
  total_posted: number;
  posted_today: number;
  posted_this_month: number;
  avg_posts_per_user: number;
  best_pricer_user_id: string | null;
  best_pricer_total: number;
  best_pricer_name: string | null;
  user_posted_today: number;
  user_posted_this_month: number;
}

export interface PostedVehicle {
  id: number;
  reference: string;
  brand_name: string;
  model_name: string;
  price: number;
  purchase_price: number;
  location: string;
  created_at: string;
  posted_by_user_id: string;
  posted_by_user_name: string;
  photos: string[];
}

export interface VehicleToPost {
  car_id: number;
  reference: string;
  brand_name: string;
  model_name: string;
  year: number;
  color: string;
  price: number;
  status: string;
}

export interface PricingStats {
  postedStats: PostedVehiclesStats;
  vehiclesToPost: VehicleToPost[];
  loading: boolean;
  error: string | null;
}

export function usePricingStats(
  startDate?: Date,
  endDate?: Date,
  userId?: string
) {
  const { user } = useAuth();
  const [stats, setStats] = useState<PricingStats>({
    postedStats: {
      total_posted: 0,
      posted_today: 0,
      posted_this_month: 0,
      avg_posts_per_user: 0,
      best_pricer_user_id: null,
      best_pricer_total: 0,
      best_pricer_name: null,
      user_posted_today: 0,
      user_posted_this_month: 0
    },
    vehiclesToPost: [],
    loading: true,
    error: null
  });

  const fetchPostedVehiclesStats = async () => {
    try {
      setStats(prev => ({ ...prev, loading: true, error: null }));

      // Appeler la fonction RPC pour obtenir les statistiques
      const { data: statsData, error: statsError } = await supabase
        .rpc('get_posted_vehicles_stats', {
          p_start_date: startDate?.toISOString() || null,
          p_end_date: endDate?.toISOString() || null,
          p_user_id: userId || null // Ne pas utiliser user?.id pour les stats globales
        });

      if (statsError) {
        console.error('Erreur lors de la récupération des statistiques:', statsError);
        throw statsError;
      }

      // Récupérer les véhicules à poster
      const { data: vehiclesToPostData, error: vehiclesToPostError } = await supabase
        .rpc('get_vehicles_to_post');

      if (vehiclesToPostError) {
        console.error('Erreur lors de la récupération des véhicules à poster:', vehiclesToPostError);
        throw vehiclesToPostError;
      }

      // Récupérer le nom du meilleur priceur si disponible
      let bestPricerName = null;
      if (statsData && statsData[0]?.best_pricer_user_id) {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('prenom, nom')
          .eq('auth_user_id', statsData[0].best_pricer_user_id)
          .single();

        if (!userError && userData) {
          bestPricerName = `${userData.prenom} ${userData.nom}`;
        }
      }

      setStats({
        postedStats: {
          total_posted: statsData?.[0]?.total_posted || 0,
          posted_today: statsData?.[0]?.posted_today || 0,
          posted_this_month: statsData?.[0]?.posted_this_month || 0,
          avg_posts_per_user: Number(statsData?.[0]?.avg_posts_per_user || 0),
          best_pricer_user_id: statsData?.[0]?.best_pricer_user_id || null,
          best_pricer_total: statsData?.[0]?.best_pricer_total || 0,
          best_pricer_name: bestPricerName,
          user_posted_today: statsData?.[0]?.user_posted_today || 0,
          user_posted_this_month: statsData?.[0]?.user_posted_this_month || 0
        },
        vehiclesToPost: vehiclesToPostData || [],
        loading: false,
        error: null
      });

    } catch (error) {
      console.error('Erreur dans usePricingStats:', error);
      setStats(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      }));
      toast.error('Erreur lors du chargement des statistiques');
    }
  };

  const fetchPostedVehicles = async (
    page = 1,
    limit = 10,
    forceRefresh = false
  ): Promise<{ vehicles: PostedVehicle[]; total: number }> => {
    try {
      const offset = (page - 1) * limit;

      const { data, error } = await supabase
        .rpc('get_posted_vehicles', {
          p_start_date: startDate?.toISOString() || null,
          p_end_date: endDate?.toISOString() || null,
          p_user_id: userId || null, // Ne pas utiliser user?.id pour récupérer tous les véhicules
          p_limit: limit,
          p_offset: offset
        });

      if (error) {
        console.error('Erreur lors de la récupération des véhicules postés:', error);
        throw error;
      }

      // Pour obtenir le total, on fait une requête séparée
      let countQuery = supabase
        .from('advertisements')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDate?.toISOString() || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
        .lt('created_at', endDate?.toISOString() || new Date().toISOString());

      // Filtrer par utilisateur seulement si un userId est spécifié
      if (userId) {
        countQuery = countQuery.eq('posted_by_user', userId);
      }

      const { count, error: countError } = await countQuery;

      if (countError) {
        console.error('Erreur lors du comptage:', countError);
        throw countError;
      }

      return {
        vehicles: data || [],
        total: count || 0
      };

    } catch (error) {
      console.error('Erreur dans fetchPostedVehicles:', error);
      toast.error('Erreur lors du chargement des véhicules postés');
      throw error;
    }
  };

  const refreshStats = () => {
    fetchPostedVehiclesStats();
  };

  useEffect(() => {
    fetchPostedVehiclesStats();
  }, [startDate, endDate, userId, user?.id]);

  return {
    ...stats,
    fetchPostedVehicles,
    refreshStats
  };
} 