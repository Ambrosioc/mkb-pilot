import { z } from 'zod';

export const vehicleStockSchema = z.object({
  brand_id: z.number({
    required_error: 'La marque est requise',
  }).min(1, 'La marque est requise'),
  
  model_id: z.number({
    required_error: 'Le modèle est requis',
  }).min(1, 'Le modèle est requis'),
  
  first_registration: z.string().optional(),
  
  mileage: z.number().min(0, 'Le kilométrage doit être positif').optional(),
  
  color: z.string().min(1, 'La couleur est requise'),
  
  car_type_id: z.number({
    required_error: 'Le type de véhicule est requis',
  }).min(1, 'Le type de véhicule est requis'),
  
  fuel_type_id: z.number({
    required_error: 'Le type de carburant est requis',
  }).min(1, 'Le type de carburant est requis'),
  
  dealer_id: z.number().optional(),
  
  dossier_type_id: z.number().optional(),
  
  nb_doors: z.number().min(2, 'Le nombre de portes doit être au moins 2').max(5, 'Le nombre de portes ne peut pas dépasser 5'),
  
  nb_seats: z.number().min(1, 'Le nombre de places doit être au moins 1').max(9, 'Le nombre de places ne peut pas dépasser 9'),
  
  price: z.number().min(0, 'Le prix doit être positif').optional(),
  
  purchase_price: z.number().min(0, 'Le prix d\'achat doit être positif').optional(),
  
  location: z.string().min(1, 'La localisation est requise'),
  
  gearbox: z.string().min(1, 'La boîte de vitesses est requise'),
  
  din_power: z.number().optional(),
  
  fiscal_power: z.number().optional(),
  
  source_url: z.string().url('L\'URL source doit être valide').min(1, 'L\'URL source est requise'),
});

export type VehicleStockFormValues = z.infer<typeof vehicleStockSchema>; 