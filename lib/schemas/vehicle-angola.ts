import { z } from 'zod';

// Schéma pour le véhicule Angola
export const vehicleAngolaSchema = z.object({
  brand_id: z.number({
    required_error: "La marque est obligatoire",
    invalid_type_error: "La marque doit être un nombre",
  }).or(z.string().transform(val => parseInt(val, 10))),
  
  model_id: z.number({
    required_error: "Le modèle est obligatoire",
    invalid_type_error: "Le modèle doit être un nombre",
  }).or(z.string().transform(val => parseInt(val, 10))),
  
  year: z.number({
    required_error: "L'année est obligatoire",
    invalid_type_error: "L'année doit être un nombre",
  }).min(1900, "L'année doit être supérieure à 1900").max(new Date().getFullYear() + 1, "L'année ne peut pas être dans le futur").or(z.string().transform(val => parseInt(val, 10))),
  
  first_registration: z.string().optional(),
  
  mileage: z.number({
    required_error: "Le kilométrage est obligatoire",
    invalid_type_error: "Le kilométrage doit être un nombre",
  }).min(0, "Le kilométrage doit être positif").or(z.string().transform(val => parseInt(val, 10))),
  
  color: z.string().min(1, "La couleur est obligatoire"),
  
  vehicle_type_id: z.number({
    required_error: "Le type de véhicule est obligatoire",
    invalid_type_error: "Le type de véhicule doit être un nombre",
  }).or(z.string().transform(val => parseInt(val, 10))),
  
  fuel_type_id: z.number({
    required_error: "Le type de carburant est obligatoire",
    invalid_type_error: "Le type de carburant doit être un nombre",
  }).or(z.string().transform(val => parseInt(val, 10))),
  
  doors: z.number({
    required_error: "Le nombre de portes est obligatoire",
    invalid_type_error: "Le nombre de portes doit être un nombre",
  }).refine(val => [3, 4, 5].includes(val), "Le nombre de portes doit être 3, 4 ou 5").or(z.string().transform(val => parseInt(val, 10))),
  
  seats: z.number({
    required_error: "Le nombre de places est obligatoire",
    invalid_type_error: "Le nombre de places doit être un nombre",
  }).min(2, "Minimum 2 places").max(9, "Maximum 9 places").or(z.string().transform(val => parseInt(val, 10))),
  
  dealer_id: z.number({
    required_error: "Le marchand est obligatoire",
    invalid_type_error: "Le marchand doit être un nombre",
  }).or(z.string().transform(val => parseInt(val, 10))),
  
  dossier_type_id: z.number({
    required_error: "Le type de dossier est obligatoire",
    invalid_type_error: "Le type de dossier doit être un nombre",
  }).or(z.string().transform(val => parseInt(val, 10))),
  
  gearbox: z.string().optional(),
  
  din_power: z.number().optional().or(z.string().transform(val => val === '' ? undefined : parseInt(val, 10))),
  
  fiscal_power: z.number().optional().or(z.string().transform(val => val === '' ? undefined : parseInt(val, 10))),
  
  price: z.number({
    required_error: "Le prix est obligatoire",
    invalid_type_error: "Le prix doit être un nombre",
  }).min(0, "Le prix doit être positif").or(z.string().transform(val => val === '' ? 0 : parseInt(val, 10))),
  
  purchase_price: z.number({
    required_error: "Le prix d'achat est obligatoire",
    invalid_type_error: "Le prix d'achat doit être un nombre",
  }).min(0, "Le prix d'achat doit être positif").or(z.string().transform(val => val === '' ? 0 : parseInt(val, 10))),
  
  description: z.string().optional(),
  
  location: z.string().min(1, "La localisation est obligatoire"),
});

export type VehicleAngolaFormValues = z.infer<typeof vehicleAngolaSchema>;

// Schéma pour l'annonce
export const advertisementSchema = z.object({
  title: z.string().min(1, "Le titre est obligatoire"),
  description: z.string().min(1, "La description est obligatoire"),
  price: z.number().min(0, "Le prix doit être positif").or(z.string().transform(val => val === '' ? 0 : parseInt(val, 10))),
});

export type AdvertisementFormValues = z.infer<typeof advertisementSchema>;

// Types pour les données de référence
export interface Brand {
  id: number;
  name: string;
}

export interface Model {
  id: number;
  brand_id: number;
  name: string;
}

export interface VehicleType {
  id: number;
  name: string;
}

export interface FuelType {
  id: number;
  name: string;
}

export interface Dealer {
  id: number;
  name: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface DossierType {
  id: number;
  name: string;
  description?: string;
}