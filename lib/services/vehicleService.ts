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

export const vehicleService = {
  async fetchVehicles(options: FetchOptions): Promise<{ data: Vehicle[]; totalItems: number }> {
    const { page = 1, filters = {}, sortBy = 'created_at', sortOrder = 'desc' } = options;
    const itemsPerPage = 10;
    const from = (page - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;

    // Construire la requête de base
    let query = supabase
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
        price,
        created_at,
        updated_at,
        status
      `, { count: 'exact' });

    // Appliquer les filtres
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      query = query.or(`brand.ilike.%${searchTerm}%,model.ilike.%${searchTerm}%,reference.ilike.%${searchTerm}%`);
    }

    if (filters.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }

    if (filters.brand && filters.brand !== 'all') {
      query = query.eq('brand', filters.brand);
    }

    if (filters.model && filters.model !== 'all') {
      query = query.eq('model', filters.model);
    }

    if (filters.location && filters.location !== 'all') {
      query = query.eq('location', filters.location);
    }

    if (filters.minPrice) {
      query = query.gte('price', filters.minPrice);
    }

    if (filters.maxPrice) {
      query = query.lte('price', filters.maxPrice);
    }

    if (filters.year) {
      query = query.eq('year', filters.year);
    }

    // Appliquer le tri et la pagination
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Erreur lors de la récupération des véhicules: ${error.message}`);
    }

    // Transformer les données
    const transformedData: Vehicle[] = (data || []).map(car => ({
      id: car.id,
      reference: car.reference || `REF-${car.id.substring(0, 6)}`,
      brand: car.brand || 'N/A',
      model: car.model || 'N/A',
      year: car.year || 0,
      price: car.price || 0,
      status: car.status || 'disponible',
      location: car.location || 'Non spécifié',
      assignedTo: 'Non assigné', // À implémenter avec une jointure
      contact: 'Non spécifié', // À implémenter avec une jointure
      lastUpdate: car.updated_at ? new Date(car.updated_at).toLocaleDateString() : new Date(car.created_at).toLocaleDateString(),
      mileage: car.mileage || 0,
      color: car.color || 'Non spécifié',
      created_at: car.created_at,
      updated_at: car.updated_at,
    }));

    return {
      data: transformedData,
      totalItems: count || 0,
    };
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
        supabase.from('cars_v2').select('*', { count: 'exact', head: true }).in('status', ['reserve', 'réservé']),
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
        .from('cars_v2')
        .select('brand')
        .not('brand', 'is', null);

      if (error) throw error;

      const brands = Array.from(new Set(data.map(item => item.brand).filter(Boolean)));
      return brands.sort();
    } catch (error) {
      console.error('Erreur lors de la récupération des marques:', error);
      return [];
    }
  },

  async getAvailableModels(brand?: string): Promise<string[]> {
    try {
      let query = supabase
        .from('cars_v2')
        .select('model')
        .not('model', 'is', null);

      if (brand) {
        query = query.eq('brand', brand);
      }

      const { data, error } = await query;

      if (error) throw error;

      const models = Array.from(new Set(data.map(item => item.model).filter(Boolean)));
      return models.sort();
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
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', vehicleId);

      if (error) throw error;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      throw new Error(`Erreur lors de la mise à jour du statut: ${error}`);
    }
  },
}; 