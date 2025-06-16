import { z } from 'zod';

// Schema pour les informations du véhicule (table cars_v2)
export const vehicleSchema = z.object({
  reference: z.string().min(1, 'La référence est obligatoire'),
  brand: z.string().min(1, 'La marque est obligatoire'),
  model: z.string().min(1, 'Le modèle est obligatoire'),
  year: z.number().min(1900, 'Année invalide').max(new Date().getFullYear() + 1, 'Année invalide'),
  first_registration: z.string().min(1, 'La première immatriculation est obligatoire'),
  mileage: z.number().min(0, 'Le kilométrage doit être positif'),
  type: z.string().min(1, 'Le type de véhicule est obligatoire'),
  color: z.string().min(1, 'La couleur est obligatoire'),
  fuel_type: z.string().min(1, 'Le type de carburant est obligatoire'),
  gearbox: z.string().min(1, 'Le type de boîte est obligatoire'),
  din_power: z.number().min(0, 'La puissance DIN doit être positive'),
  nb_seats: z.number().min(1, 'Le nombre de places doit être au moins 1').max(50, 'Nombre de places invalide'),
  nb_doors: z.number().min(2, 'Le nombre de portes doit être au moins 2').max(10, 'Nombre de portes invalide'),
  average_consumption: z.number().min(0, 'La consommation moyenne doit être positive'),
  road_consumption: z.number().min(0, 'La consommation route doit être positive'),
  city_consumption: z.number().min(0, 'La consommation ville doit être positive'),
  emissions: z.number().min(0, 'Les émissions doivent être positives'),
  location: z.string().min(1, 'La localisation est obligatoire'),
  fiscal_power: z.number().min(0, 'La puissance fiscale doit être positive'),
});

// Schema pour l'annonce (table advertisements_v4)
export const advertisementSchema = z.object({
  title: z.string().min(1, 'Le titre est obligatoire').max(200, 'Le titre est trop long'),
  description: z.string().min(10, 'La description doit contenir au moins 10 caractères').max(2000, 'La description est trop longue'),
  price: z.number().min(0, 'Le prix doit être positif'),
  photos: z.array(z.string()).optional().default([]),
});

// Schema combiné pour le formulaire complet
export const vehicleFormSchema = z.object({
  vehicle: vehicleSchema,
  advertisement: advertisementSchema,
});

export type VehicleFormData = z.infer<typeof vehicleFormSchema>;
export type VehicleData = z.infer<typeof vehicleSchema>;
export type AdvertisementData = z.infer<typeof advertisementSchema>;