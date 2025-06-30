import { FetchOptions } from '@/hooks/useDataFetching';
import { supabase } from '@/lib/supabase';

export interface PricingVehicle {
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

export interface PricingStats {
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

export interface PricingFilters {
  search?: string;
  location?: 'all' | 'FR' | 'ALL';
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export const pricingService = {
  async fetchPricingVehicles(options: FetchOptions): Promise<{ data: PricingVehicle[]; totalItems: number }> {
    const { page = 1, filters = {}, sortBy = 'created_at', sortOrder = 'desc' } = options;
    const itemsPerPage = 10;
    const from = (page - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;

    // Date de début du mois pour filtrer les véhicules du mois
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    firstDayOfMonth.setHours(0, 0, 0, 0);

    // Construire la requête de base
    let query = supabase
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
      .gte('created_at', firstDayOfMonth.toISOString());

    // Appliquer les filtres
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      query = query.or(`brand.ilike.%${searchTerm}%,model.ilike.%${searchTerm}%`);
    }

    if (filters.location && filters.location !== 'all') {
      query = query.eq('location', filters.location);
    }

    if (filters.userId) {
      query = query.eq('user_id', filters.userId);
    }

    if (filters.dateFrom) {
      query = query.gte('created_at', filters.dateFrom);
    }

    if (filters.dateTo) {
      query = query.lte('created_at', filters.dateTo);
    }

    // Appliquer le tri et la pagination
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Erreur lors de la récupération des véhicules: ${error.message}`);
    }

    // Transformer les données
    const transformedData: PricingVehicle[] = (data || []).map(item => ({
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

    return {
      data: transformedData,
      totalItems: count || 0,
    };
  },

  async fetchPricingStats(userId?: string): Promise<PricingStats> {
    try {
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

      // 4. Get average posts per user this month
      const { data: avgData, error: avgError } = await supabase
        .rpc('get_average_posts_per_user_this_month');

      if (avgError) throw avgError;

      // 5. Get best pricer this month
      const { data: bestPricerData, error: bestPricerError } = await supabase
        .rpc('get_best_pricer_this_month');

      if (bestPricerError) throw bestPricerError;

      // 6. Get vehicles to be posted
      const { data: toPostData, error: toPostError } = await supabase
        .from('cars_v2')
        .select('count')
        .eq('status', 'prêt à poster')
        .single();

      if (toPostError) throw toPostError;

      // 7. Get current user stats if logged in
      let userStats = { postedToday: 0, postedThisMonth: 0 };

      if (userId) {
        // Today's posts by user
        const { data: userTodayData, error: userTodayError } = await supabase
          .from('cars_v2')
          .select('count')
          .eq('user_id', userId)
          .gte('created_at', today.toISOString())
          .single();

        if (!userTodayError && userTodayData) {
          userStats.postedToday = userTodayData.count || 0;
        }

        // Month's posts by user
        const { data: userMonthData, error: userMonthError } = await supabase
          .from('cars_v2')
          .select('count')
          .eq('user_id', userId)
          .gte('created_at', firstDayOfMonth.toISOString())
          .single();

        if (!userMonthError && userMonthData) {
          userStats.postedThisMonth = userMonthData.count || 0;
        }
      }

      // 8. Get best pricer name if available
      let bestPricerName = '';
      if (bestPricerData && bestPricerData.user_id) {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('prenom, nom')
          .eq('id', bestPricerData.user_id)
          .single();

        if (!userError && userData) {
          bestPricerName = `${userData.prenom} ${userData.nom}`;
        }
      }

      return {
        vehiculesTotal: totalData?.count || 0,
        vehiculesPostesMois: monthData?.count || 0,
        vehiculesPostesJour: todayData?.count || 0,
        moyennePostsCollaborateur: avgData || 0,
        bestPriceur: bestPricerData ? {
          userId: bestPricerData.user_id,
          total: bestPricerData.total,
          name: bestPricerName,
        } : null,
        vehiculesAPoster: toPostData?.count || 0,
        userStats,
        loading: false,
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      return {
        vehiculesTotal: 0,
        vehiculesPostesMois: 0,
        vehiculesPostesJour: 0,
        moyennePostsCollaborateur: 0,
        bestPriceur: null,
        vehiculesAPoster: 0,
        userStats: { postedToday: 0, postedThisMonth: 0 },
        loading: false,
      };
    }
  },

  async getAvailableLocations(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('cars_v2')
        .select('location')
        .not('location', 'is', null);

      if (error) throw error;

      const locations = Array.from(new Set(data.map(item => item.location).filter(Boolean)));
      return locations.sort();
    } catch (error) {
      console.error('Erreur lors de la récupération des localisations:', error);
      return [];
    }
  },

  async getAvailableUsers(): Promise<Array<{ id: string; name: string }>> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, prenom, nom')
        .order('prenom');

      if (error) throw error;

      return data.map(user => ({
        id: user.id,
        name: `${user.prenom} ${user.nom}`,
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      return [];
    }
  },

  formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(price);
  },

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  },
}; 