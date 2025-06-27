'use client';

import { supabase } from '@/lib/supabase';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Calendar,
  Car,
  DollarSign,
  FileText,
  Loader2,
  MapPin,
  Save,
  Upload,
  X
} from 'lucide-react';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

import { z } from 'zod';

// Schéma pour le véhicule
const vehicleSchema = z.object({
  reference: z.string().min(1, 'La référence est obligatoire'),
  marque: z.string().min(1, 'La marque est obligatoire'),
  modele: z.string().min(1, 'Le modèle est obligatoire'),
  annee: z.coerce.number().min(1900, 'Année invalide').max(new Date().getFullYear() + 1, 'Année invalide'),
  kilometrage: z.coerce.number().min(0, 'Le kilométrage doit être positif'),
  couleur: z.string().min(1, 'La couleur est obligatoire'),
  type: z.string().min(1, 'Le type de véhicule est obligatoire'),
  emplacement: z.string().min(1, 'L\'emplacement est obligatoire'),
  purchase_price: z.coerce.number().min(0, 'Le prix d\'achat doit être positif'),
  prix_vente: z.coerce.number().min(0, 'Le prix de vente doit être positif'),
  stock_status: z.enum(['disponible', 'vendu', 'réservé']),
  description: z.string().optional(),
  photos: z.array(z.string()).optional().default([]),
});

type VehicleFormData = z.infer<typeof vehicleSchema>;

interface VehicleDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function VehicleDrawer({ open, onOpenChange, onSuccess }: VehicleDrawerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);

  const form = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      reference: '',
      marque: '',
      modele: '',
      annee: new Date().getFullYear(),
      kilometrage: 0,
      couleur: '',
      type: '',
      emplacement: '',
      purchase_price: 0,
      prix_vente: 0,
      stock_status: 'disponible',
      description: '',
      photos: [],
    },
  });

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    // Simuler l'upload des photos (conversion en base64 pour le moment)
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setUploadedPhotos(prev => [...prev, result]);
        form.setValue('photos', [...uploadedPhotos, result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    const newPhotos = uploadedPhotos.filter((_, i) => i !== index);
    setUploadedPhotos(newPhotos);
    form.setValue('photos', newPhotos);
  };

  const onSubmit = async (data: VehicleFormData) => {
    setIsSubmitting(true);

    try {
      // Ajouter la date de création
      const vehicleData = {
        ...data,
        created_at: new Date().toISOString(),
        photos: uploadedPhotos,
      };

      // Insérer dans Supabase
      const { data: newVehicle, error } = await supabase
        .from('stock_vehicles')
        .insert([vehicleData])
        .select('id')
        .single();

      if (error) {
        console.error('Erreur lors de la création du véhicule:', error);
        throw new Error(`Erreur lors de la création du véhicule: ${error.message}`);
      }

      toast.success('Véhicule ajouté avec succès !');

      // Réinitialiser le formulaire
      form.reset();
      setUploadedPhotos([]);

      // Fermer le drawer
      onOpenChange(false);

      // Callback de succès
      if (onSuccess) {
        onSuccess();
      }

    } catch (error) {
      console.error('Erreur:', error);
      toast.error(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-[85vh] max-h-[85vh] p-0">
        <div className="flex flex-col h-full">
          <DrawerHeader className="border-b pb-4 px-4">
            <DrawerTitle className="text-xl font-bold text-mkb-black flex items-center gap-2">
              <Car className="h-5 w-5 text-mkb-blue" />
              Ajouter un Véhicule
            </DrawerTitle>
            <DrawerDescription>
              Créer une nouvelle fiche véhicule dans le stock central
            </DrawerDescription>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto px-4 py-6">
            <Form form={form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Référence, Marque, Modèle */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="reference"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-mkb-black font-medium">Référence *</FormLabel>
                        <FormControl>
                          <Input placeholder="REF-2024-001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="marque"
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
                    name="modele"
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

                {/* Année, Kilométrage, Couleur */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="annee"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-mkb-black font-medium">Année *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                              type="number"
                              placeholder="2024"
                              className="pl-10"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="kilometrage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-mkb-black font-medium">Kilométrage *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="50000"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="couleur"
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
                </div>

                {/* Type, Emplacement, Statut */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="type"
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
                    name="emplacement"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-mkb-black font-medium">Emplacement *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input placeholder="Paris, Lyon, Marseille..." className="pl-10" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="stock_status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-mkb-black font-medium">Statut *</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Statut" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="disponible">Disponible</SelectItem>
                              <SelectItem value="réservé">Réservé</SelectItem>
                              <SelectItem value="vendu">Vendu</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Prix d'achat et de vente */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="purchase_price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-mkb-black font-medium">Prix d&apos;achat (€) *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                              type="number"
                              placeholder="15000"
                              className="pl-10"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="prix_vente"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-mkb-black font-medium">Prix de vente (€) *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                              type="number"
                              placeholder="18000"
                              className="pl-10"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-mkb-black font-medium">Description</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <FileText className="absolute left-3 top-3 text-gray-400 h-4 w-4" />
                          <Textarea
                            placeholder="Description du véhicule, équipements, état général..."
                            className="pl-10 min-h-[120px]"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Photos */}
                <div className="space-y-4">
                  <FormLabel className="text-mkb-black font-medium">Photos du véhicule</FormLabel>

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
              </form>
            </Form>
          </div>

          <DrawerFooter className="border-t pt-4 px-4 mt-auto">
            <div className="flex justify-end gap-4">
              <DrawerClose asChild>
                <Button variant="outline">
                  <X className="mr-2 h-4 w-4" />
                  Annuler
                </Button>
              </DrawerClose>

              <Button
                onClick={form.handleSubmit(onSubmit)}
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
                    Ajouter au stock
                  </>
                )}
              </Button>
            </div>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}