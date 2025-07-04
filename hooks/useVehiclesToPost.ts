import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export interface VehicleToPost {
  id: string;
  reference: string;
  brand_name: string;
  model_name: string;
  year: number;
  color: string;
  price: number;
  purchase_price: number;
  location: string;
  status: string;
  created_at: string;
  add_by_user_name: string;
}

export interface UseVehiclesToPostReturn {
  vehicles: VehicleToPost[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  count: number;
}

export function useVehiclesToPost(): UseVehiclesToPostReturn {
  const [vehicles, setVehicles] = useState<VehicleToPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVehiclesToPost = async () => {
    try {
      setLoading(true);
      setError(null);

      // Récupérer les véhicules à poster
      const { data, error: vehiclesError } = await supabase
        .from('cars_v2')
        .select(`
          id,
          reference,
          year,
          color,
          price,
          purchase_price,
          location,
          status,
          created_at,
          add_by_user
        `)
        .eq('status', 'disponible')
        .order('created_at', { ascending: false });

      if (vehiclesError) throw vehiclesError;

      // Récupérer les IDs des véhicules déjà postés
      const { data: postedVehicles, error: postedError } = await supabase
        .from('advertisements')
        .select('car_id');

      if (postedError) throw postedError;

      const postedIds = new Set(postedVehicles.map(v => v.car_id));

      // Filtrer les véhicules non postés
      const vehiclesToPost = (data || []).filter(v => !postedIds.has(v.id));

      // Récupérer les informations utilisateur pour les véhicules filtrés
      const userIds = Array.from(new Set(vehiclesToPost.map(v => v.add_by_user).filter(Boolean)));
      let usersMap: Record<string, { prenom: string; nom: string }> = {};

      if (userIds.length > 0) {
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('auth_user_id, prenom, nom')
          .in('auth_user_id', userIds);

        if (!usersError && usersData) {
          usersMap = usersData.reduce<Record<string, { prenom: string; nom: string }>>((acc, user) => {
            acc[user.auth_user_id] = { prenom: user.prenom, nom: user.nom };
            return acc;
          }, {});
        }
      }

      // Transformer les données
      const transformedData = vehiclesToPost.map(item => ({
        id: item.id,
        reference: item.reference,
        brand_name: 'N/A', // À récupérer via une relation si nécessaire
        model_name: 'N/A', // À récupérer via une relation si nécessaire
        year: item.year,
        color: item.color,
        price: item.price,
        purchase_price: item.purchase_price,
        location: item.location,
        status: item.status,
        created_at: item.created_at,
        add_by_user_name: usersMap[item.add_by_user] 
          ? `${usersMap[item.add_by_user].prenom} ${usersMap[item.add_by_user].nom}`
          : 'Utilisateur inconnu'
      }));

      setVehicles(transformedData);
    } catch (error) {
      console.error('Erreur lors de la récupération des véhicules à poster:', error);
      setError('Erreur lors du chargement des véhicules');
      toast.error('Erreur lors du chargement des véhicules');
    } finally {
      setLoading(false);
    }
  };

  const refresh = async () => {
    await fetchVehiclesToPost();
  };

  useEffect(() => {
    fetchVehiclesToPost();
  }, []);

  return {
    vehicles,
    loading,
    error,
    refresh,
    count: vehicles.length
  };
} 