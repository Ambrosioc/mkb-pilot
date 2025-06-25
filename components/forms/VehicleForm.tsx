'use client';

import { supabase } from '@/lib/supabase';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import {
  Car,
  FileText,
  Loader2,
  Save,
  Upload,
  X
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

import { vehicleFormSchema, type VehicleFormData } from '@/lib/schemas/vehicle';

interface VehicleFormProps {
  onSuccess?: (vehicleId: string, advertisementId: string) => void;
  onCancel?: () => void;
  className?: string;
}

export function VehicleForm({ onSuccess, onCancel, className }: VehicleFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);

  const form = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: {
      vehicle: {
        reference: '',
        brand: '',
        model: '',
        year: new Date().getFullYear(),
        first_registration: '',
        mileage: 0,
        type: '',
        color: '',
        fuel_type: '',
        gearbox: '',
        din_power: 0,
        nb_seats: 5,
        nb_doors: 4,
        average_consumption: 0,
        road_consumption: 0,
        city_consumption: 0,
        emissions: 0,
        location: '',
        fiscal_power: 0,
      },
      advertisement: {
        title: '',
        description: '',
        price: 0,
        photos: [],
      },
    },
  });

  // Réinitialiser le formulaire quand le composant est monté
  useEffect(() => {
    form.reset();
    setUploadedPhotos([]);
    setIsSubmitting(false);
  }, [form]);

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    // Simuler l'upload des photos (conversion en base64 pour le moment)
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setUploadedPhotos(prev => [...prev, result]);
        form.setValue('advertisement.photos', [...uploadedPhotos, result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    const newPhotos = uploadedPhotos.filter((_, i) => i !== index);
    setUploadedPhotos(newPhotos);
    form.setValue('advertisement.photos', newPhotos);
  };

  const onSubmit = async (data: VehicleFormData) => {
    console.log('🚀 Début de la soumission du formulaire', data);
    setIsSubmitting(true);

    try {
      // Vérifier la connexion Supabase
      const { data: testConnection, error: connectionError } = await supabase
        .from('cars_v2')
        .select('count')
        .limit(1);

      if (connectionError) {
        console.error('❌ Erreur de connexion Supabase:', connectionError);
        throw new Error(`Erreur de connexion à la base de données: ${connectionError.message}`);
      }

      console.log('✅ Connexion Supabase OK');

      // 1. Créer le véhicule dans cars_v2
      console.log('📝 Création du véhicule...', data.vehicle);
      const { data: vehicleData, error: vehicleError } = await supabase
        .from('cars_v2')
        .insert([data.vehicle])
        .select('id')
        .single();

      if (vehicleError) {
        console.error('❌ Erreur création véhicule:', vehicleError);
        throw new Error(`Erreur lors de la création du véhicule: ${vehicleError.message}`);
      }

      console.log('✅ Véhicule créé avec succès:', vehicleData);

      // 2. Créer l'annonce dans advertisements_v4 avec le car_id
      const advertisementPayload = {
        ...data.advertisement,
        car_id: vehicleData.id,
        photos: uploadedPhotos,
      };

      console.log('📝 Création de l\'annonce...', advertisementPayload);
      const { data: advertisementData, error: advertisementError } = await supabase
        .from('advertisements_v4')
        .insert([advertisementPayload])
        .select('id')
        .single();

      if (advertisementError) {
        console.error('❌ Erreur création annonce:', advertisementError);
        throw new Error(`Erreur lors de la création de l'annonce: ${advertisementError.message}`);
      }

      console.log('✅ Annonce créée avec succès:', advertisementData);

      toast.success('Véhicule et annonce créés avec succès !');

      // Reset du formulaire
      form.reset();
      setUploadedPhotos([]);

      // Callback de succès
      onSuccess?.(vehicleData.id, advertisementData.id);

    } catch (error) {
      console.error('💥 Erreur lors de la soumission:', error);
      toast.error(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    // Réinitialiser le formulaire avant de fermer
    form.reset();
    setUploadedPhotos([]);
    setIsSubmitting(false);
    onCancel?.();
  };

  return (
    <div className={className}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Section 1: Informations véhicule */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-mkb-black flex items-center gap-2">
                  <Car className="h-5 w-5 text-mkb-blue" />
                  Informations du véhicule
                </CardTitle>
                <CardDescription>
                  Renseignez les caractéristiques techniques du véhicule
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Ligne 1: Référence, Marque, Modèle */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="vehicle.reference"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-mkb-black font-medium">Référence *</FormLabel>
                        <FormControl>
                          <Input placeholder="AB 12345" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="vehicle.brand"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-mkb-black font-medium">Marque *</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner une marque" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Peugeot">Peugeot</SelectItem>
                              <SelectItem value="Renault">Renault</SelectItem>
                              <SelectItem value="Citroën">Citroën</SelectItem>
                              <SelectItem value="Volkswagen">Volkswagen</SelectItem>
                              <SelectItem value="BMW">BMW</SelectItem>
                              <SelectItem value="Mercedes">Mercedes</SelectItem>
                              <SelectItem value="Audi">Audi</SelectItem>
                              <SelectItem value="Toyota">Toyota</SelectItem>
                              <SelectItem value="Ford">Ford</SelectItem>
                              <SelectItem value="Autre">Autre</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="vehicle.model"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-mkb-black font-medium">Modèle *</FormLabel>
                        <FormControl>
                          <Input placeholder="308, Clio, Golf..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Ligne 2: Année, Première immatriculation, Kilométrage */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="vehicle.year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-mkb-black font-medium">Année *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="2024"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="vehicle.first_registration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-mkb-black font-medium">Première immatriculation *</FormLabel>
                        <FormControl>
                          <Input placeholder="01/2024" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="vehicle.mileage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-mkb-black font-medium">Kilométrage *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="50000"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Ligne 3: Type, Couleur, Carburant, Boîte */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <FormField
                    control={form.control}
                    name="vehicle.type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-mkb-black font-medium">Type *</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Berline">Berline</SelectItem>
                              <SelectItem value="Break">Break</SelectItem>
                              <SelectItem value="SUV">SUV</SelectItem>
                              <SelectItem value="Coupé">Coupé</SelectItem>
                              <SelectItem value="Cabriolet">Cabriolet</SelectItem>
                              <SelectItem value="Monospace">Monospace</SelectItem>
                              <SelectItem value="Citadine">Citadine</SelectItem>
                              <SelectItem value="Utilitaire">Utilitaire</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="vehicle.color"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-mkb-black font-medium">Couleur *</FormLabel>
                        <FormControl>
                          <Input placeholder="Blanc, Noir, Rouge..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="vehicle.fuel_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-mkb-black font-medium">Carburant *</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Carburant" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Essence">Essence</SelectItem>
                              <SelectItem value="Diesel">Diesel</SelectItem>
                              <SelectItem value="Hybride">Hybride</SelectItem>
                              <SelectItem value="Électrique">Électrique</SelectItem>
                              <SelectItem value="GPL">GPL</SelectItem>
                              <SelectItem value="Autre">Autre</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="vehicle.gearbox"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-mkb-black font-medium">Boîte *</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Boîte" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Manuelle">Manuelle</SelectItem>
                              <SelectItem value="Automatique">Automatique</SelectItem>
                              <SelectItem value="Semi-automatique">Semi-automatique</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Ligne 4: Puissances et caractéristiques */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <FormField
                    control={form.control}
                    name="vehicle.din_power"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-mkb-black font-medium">Puissance DIN (ch)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="150"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="vehicle.fiscal_power"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-mkb-black font-medium">Puissance fiscale (CV)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="7"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="vehicle.nb_seats"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-mkb-black font-medium">Nb places</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="5"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="vehicle.nb_doors"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-mkb-black font-medium">Nb portes</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="4"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Ligne 5: Consommations et émissions */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <FormField
                    control={form.control}
                    name="vehicle.average_consumption"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-mkb-black font-medium">Conso. moyenne (L/100km)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.1"
                            placeholder="6.5"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="vehicle.road_consumption"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-mkb-black font-medium">Conso. route (L/100km)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.1"
                            placeholder="5.8"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="vehicle.city_consumption"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-mkb-black font-medium">Conso. ville (L/100km)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.1"
                            placeholder="7.2"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="vehicle.emissions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-mkb-black font-medium">Émissions CO2 (g/km)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="120"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Localisation */}
                <FormField
                  control={form.control}
                  name="vehicle.location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-mkb-black font-medium">Localisation *</FormLabel>
                      <FormControl>
                        <Input placeholder="Paris, Lyon, Marseille..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* Section 2: Annonce associée */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-mkb-black flex items-center gap-2">
                  <FileText className="h-5 w-5 text-mkb-blue" />
                  Annonce associée
                </CardTitle>
                <CardDescription>
                  Créez l'annonce de vente pour ce véhicule
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Titre et Prix */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="advertisement.title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-mkb-black font-medium">Titre de l'annonce *</FormLabel>
                        <FormControl>
                          <Input placeholder="Peugeot 308 1.6 HDi 120ch Active" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="advertisement.price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-mkb-black font-medium">Prix (€) *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="15000"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Description */}
                <FormField
                  control={form.control}
                  name="advertisement.description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-mkb-black font-medium">Description *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Décrivez le véhicule, son état, ses équipements..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Photos */}
                <div className="space-y-4">
                  <Label className="text-mkb-black font-medium">Photos du véhicule</Label>

                  {/* Upload zone */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-mkb-blue transition-colors">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                      id="photo-upload"
                    />
                    <label htmlFor="photo-upload" className="cursor-pointer">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">Cliquez pour ajouter des photos</p>
                      <p className="text-xs text-gray-500 mt-1">JPG, PNG, WebP (max 5MB par fichier)</p>
                    </label>
                  </div>

                  {/* Photos uploadées */}
                  {uploadedPhotos.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {uploadedPhotos.map((photo, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={photo}
                            alt={`Photo ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border"
                          />
                          <button
                            type="button"
                            onClick={() => removePhoto(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Boutons d'action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex items-center justify-end gap-4"
          >
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Annuler
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-mkb-blue hover:bg-mkb-blue/90 text-white min-w-[140px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Créer le véhicule
                </>
              )}
            </Button>
          </motion.div>
        </form>
      </Form>
    </div>
  );
}