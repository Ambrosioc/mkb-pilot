import { FetchOptions } from '@/hooks/useDataFetching';
import { supabase } from '@/lib/supabase';

export interface Vehicle {
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
  created_at: string;
  updated_at: string;
  photos: string[];
}

export interface VehicleFilters {
  search?: string;
  status?: string;
  brand?: string;
  model?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  year?: number;
}

// Interface pour le type de retour de la fonction RPC
interface VehicleSearchResult {
  id: string;
  reference: string;
  vehicle_year: number;
  mileage: number;
  color: string;
  vehicle_location: string;
  price: number;
  created_at: string;
  updated_at: string;
  vehicle_status: string;
  brand_name: string;
  model_name: string;
  photos: string[];
  total_count: number;
}

export const vehicleService = {
  async fetchVehicles(options: FetchOptions): Promise<{ data: Vehicle[]; totalItems: number }> {
    const { page = 1, limit = 10, filters = {}, sortBy = 'created_at', sortOrder = 'desc' } = options;

    try {
      // Utiliser la fonction RPC pour la recherche multi-champs
      const { data, error } = await supabase
        .rpc('search_vehicles_multi', {
          search_param: filters.search || null,
          status_param: filters.status !== 'all' ? filters.status : null,
          brand_param: filters.brand !== 'all' ? filters.brand : null,
          location_param: filters.location !== 'all' ? filters.location : null,
          min_price_param: filters.minPrice || null,
          max_price_param: filters.maxPrice || null,
          year_param: filters.year || null,
          page_param: page,
          limit_count_param: limit,
        }) as { data: VehicleSearchResult[] | null; error: any };

      if (error) {
        throw new Error(`Erreur lors de la récupération des véhicules: ${error.message}`);
      }

      // Transformer les données
      const transformedData: Vehicle[] = (data || []).map((car: VehicleSearchResult) => ({
        id: car.id,
        reference: car.reference || `REF-${car.id.substring(0, 6)}`,
        brand: car.brand_name || 'N/A',
        model: car.model_name || 'N/A',
        year: car.vehicle_year || 0,
        price: car.price || 0,
        status: car.vehicle_status || 'disponible',
        location: car.vehicle_location || 'Non spécifié',
        assignedTo: 'Non assigné', // À implémenter avec une jointure
        contact: 'Non spécifié', // À implémenter avec une jointure
        lastUpdate: car.updated_at ? new Date(car.updated_at).toLocaleDateString() : new Date(car.created_at).toLocaleDateString(),
        mileage: car.mileage || 0,
        color: car.color || 'Non spécifié',
        created_at: car.created_at,
        updated_at: car.updated_at,
        photos: car.photos || [],
      }));

      // Récupérer le total depuis le premier élément (si disponible)
      const totalItems = data && data.length > 0 ? data[0].total_count : 0;

      return {
        data: transformedData,
        totalItems,
      };
    } catch (error) {
      console.error('Erreur dans fetchVehicles:', error);
      throw error;
    }
  },

  async fetchVehicleStats() {
    try {
      // Récupérer le total des véhicules
      const { count: total, error: totalError } = await supabase
        .from('cars_v2')
        .select('*', { count: 'exact', head: true });

      if (totalError) throw totalError;

      // Compter les véhicules par statut avec des requêtes séparées pour plus de précision
      const [
        { count: disponibles },
        { count: reserves },
        { count: vendus },
        { count: aVerifier }
      ] = await Promise.all([
        supabase.from('cars_v2').select('*', { count: 'exact', head: true }).eq('status', 'disponible'),
        supabase.from('cars_v2').select('*', { count: 'exact', head: true }).eq('status', 'reserve'),
        supabase.from('cars_v2').select('*', { count: 'exact', head: true }).eq('status', 'vendu'),
        supabase.from('cars_v2').select('*', { count: 'exact', head: true }).eq('status', 'a-verifier')
      ]);

      return {
        total: total || 0,
        disponibles: disponibles || 0,
        reserves: reserves || 0,
        vendus: vendus || 0,
        aVerifier: aVerifier || 0,
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  },

  async getAvailableBrands(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('brands')
        .select('name')
        .order('name');

      if (error) throw error;

      return data.map(brand => brand.name);
    } catch (error) {
      console.error('Erreur lors de la récupération des marques:', error);
      return [];
    }
  },

  async getAvailableModels(brand?: string): Promise<string[]> {
    try {
      let query = supabase
        .from('models')
        .select('name')
        .order('name');

      if (brand) {
        // D'abord récupérer l'ID de la marque
        const { data: brandData, error: brandError } = await supabase
          .from('brands')
          .select('id')
          .eq('name', brand)
          .single();

        if (brandError) throw brandError;

        // Puis récupérer les modèles de cette marque
        query = query.eq('brand_id', brandData.id);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data.map(model => model.name);
    } catch (error) {
      console.error('Erreur lors de la récupération des modèles:', error);
      return [];
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

  async updateVehicleStatus(vehicleId: string, newStatus: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('cars_v2')
        .update({ status: newStatus })
        .eq('id', vehicleId);

      if (error) throw error;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      throw error;
    }
  },
}; 