import {
  Brand,
  Dealer,
  DossierType,
  FuelType,
  Model,
  VehicleType
} from '@/lib/schemas/vehicle-angola';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export interface VehicleFormData {
  brands: Brand[];
  models: Model[];
  vehicleTypes: VehicleType[];
  fuelTypes: FuelType[];
  dealers: Dealer[];
  dossierTypes: DossierType[];
  filteredModels: Model[];
  loading: boolean;
  error: string | null;
}

export function useVehicleFormData(selectedBrandId?: number) {
  const [data, setData] = useState<VehicleFormData>({
    brands: [],
    models: [],
    vehicleTypes: [],
    fuelTypes: [],
    dealers: [],
    dossierTypes: [],
    filteredModels: [],
    loading: true,
    error: null
  });

  // Fetch all reference data on component mount
  useEffect(() => {
    fetchReferenceData();
  }, []);

  // Filter models when brand changes
  useEffect(() => {
    if (selectedBrandId) {
      const filtered = data.models.filter(model => model.brand_id === selectedBrandId);
      setData(prev => ({ ...prev, filteredModels: filtered }));
    } else {
      setData(prev => ({ ...prev, filteredModels: [] }));
    }
  }, [selectedBrandId, data.models]);

  // Fetch all reference data from Supabase
  const fetchReferenceData = async () => {
    try {
      setData(prev => ({ ...prev, loading: true, error: null }));

      // Fetch brands
      const { data: brandsData, error: brandsError } = await supabase
        .from('brands')
        .select('*')
        .order('name');
      
      if (brandsError) throw new Error(`Error fetching brands: ${brandsError.message}`);

      // Fetch models
      const { data: modelsData, error: modelsError } = await supabase
        .from('models')
        .select('*')
        .order('name');
      
      if (modelsError) throw new Error(`Error fetching models: ${modelsError.message}`);

      // Fetch vehicle types
      const { data: vehicleTypesData, error: vehicleTypesError } = await supabase
        .from('car_types')
        .select('*')
        .order('name');
      
      if (vehicleTypesError) throw new Error(`Error fetching vehicle types: ${vehicleTypesError.message}`);

      // Fetch fuel types
      const { data: fuelTypesData, error: fuelTypesError } = await supabase
        .from('fuel_types')
        .select('*')
        .order('name');
      
      if (fuelTypesError) throw new Error(`Error fetching fuel types: ${fuelTypesError.message}`);

      // Fetch dealers
      const { data: dealersData, error: dealersError } = await supabase
        .from('dealers')
        .select('*')
        .order('name');
      
      if (dealersError) throw new Error(`Error fetching dealers: ${dealersError.message}`);

      // Fetch dossier types
      const { data: dossierTypesData, error: dossierTypesError } = await supabase
        .from('dossier_types')
        .select('*')
        .order('name');
      
      if (dossierTypesError) throw new Error(`Error fetching dossier types: ${dossierTypesError.message}`);

      // Update state with all fetched data
      setData({
        brands: brandsData || [],
        models: modelsData || [],
        vehicleTypes: vehicleTypesData || [],
        fuelTypes: fuelTypesData || [],
        dealers: dealersData || [],
        dossierTypes: dossierTypesData || [],
        filteredModels: selectedBrandId 
          ? (modelsData || []).filter(model => model.brand_id === selectedBrandId)
          : [],
        loading: false,
        error: null
      });

    } catch (error) {
      console.error('Error fetching reference data:', error);
      setData(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'An unknown error occurred' 
      }));
      toast.error('Erreur lors du chargement des données de référence');
    }
  };

  // Add a new brand
  const addBrand = async (name: string): Promise<Brand | null> => {
    try {
      const { data: newBrand, error } = await supabase
        .from('brands')
        .insert([{ name: name.trim() }])
        .select()
        .single();

      if (error) throw error;

      setData(prev => ({
        ...prev,
        brands: [...prev.brands, newBrand]
      }));

      toast.success('Marque ajoutée avec succès');
      return newBrand;
    } catch (error) {
      console.error('Error adding brand:', error);
      toast.error('Erreur lors de l\'ajout de la marque');
      return null;
    }
  };

  // Add a new model
  const addModel = async (brandId: number, name: string): Promise<Model | null> => {
    try {
      const { data: newModel, error } = await supabase
        .from('models')
        .insert([{ brand_id: brandId, name: name.trim() }])
        .select()
        .single();

      if (error) throw error;

      setData(prev => ({
        ...prev,
        models: [...prev.models, newModel],
        filteredModels: selectedBrandId === brandId 
          ? [...prev.filteredModels, newModel]
          : prev.filteredModels
      }));

      toast.success('Modèle ajouté avec succès');
      return newModel;
    } catch (error) {
      console.error('Error adding model:', error);
      toast.error('Erreur lors de l\'ajout du modèle');
      return null;
    }
  };

  // Add a new vehicle type
  const addVehicleType = async (name: string): Promise<VehicleType | null> => {
    try {
      const { data: newType, error } = await supabase
        .from('vehicle_types')
        .insert([{ name: name.trim() }])
        .select()
        .single();

      if (error) throw error;

      setData(prev => ({
        ...prev,
        vehicleTypes: [...prev.vehicleTypes, newType]
      }));

      toast.success('Type de véhicule ajouté avec succès');
      return newType;
    } catch (error) {
      console.error('Error adding vehicle type:', error);
      toast.error('Erreur lors de l\'ajout du type de véhicule');
      return null;
    }
  };

  // Add a new fuel type
  const addFuelType = async (name: string): Promise<FuelType | null> => {
    try {
      const { data: newType, error } = await supabase
        .from('fuel_types')
        .insert([{ name: name.trim() }])
        .select()
        .single();

      if (error) throw error;

      setData(prev => ({
        ...prev,
        fuelTypes: [...prev.fuelTypes, newType]
      }));

      toast.success('Type de carburant ajouté avec succès');
      return newType;
    } catch (error) {
      console.error('Error adding fuel type:', error);
      toast.error('Erreur lors de l\'ajout du type de carburant');
      return null;
    }
  };

  // Add a new dealer
  const addDealer = async (name: string): Promise<Dealer | null> => {
    try {
      const { data: newDealer, error } = await supabase
        .from('dealers')
        .insert([{ name: name.trim() }])
        .select()
        .single();

      if (error) throw error;

      setData(prev => ({
        ...prev,
        dealers: [...prev.dealers, newDealer]
      }));

      toast.success('Marchand ajouté avec succès');
      return newDealer;
    } catch (error) {
      console.error('Error adding dealer:', error);
      toast.error('Erreur lors de l\'ajout du marchand');
      return null;
    }
  };

  // Refresh all data
  const refreshData = () => {
    fetchReferenceData();
  };

  return {
    ...data,
    addBrand,
    addModel,
    addVehicleType,
    addFuelType,
    addDealer,
    refreshData
  };
}