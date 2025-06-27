import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { useVehicleFormData } from '@/hooks/useVehicleFormData';
import { advertisementSchema, vehicleAngolaSchema, type AdvertisementFormValues, type VehicleAngolaFormValues } from '@/lib/schemas/vehicle-angola';
import { useVehicleFormStore } from '@/lib/store/vehicleFormStore';
import { supabase } from '@/lib/supabase';
import { uploadImageToServer } from '@/lib/uploadImage';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Car, Check, Image, Loader2, Plus, Upload, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface VehicleAngolaFormProps {
    onSuccess?: () => void;
    onCancel?: () => void;
}

export function VehicleAngolaForm({ onSuccess, onCancel }: VehicleAngolaFormProps) {
    const router = useRouter();
    const { user } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedBrandId, setSelectedBrandId] = useState<number | undefined>(undefined);

    // Get form data from custom hook
    const {
        brands,
        filteredModels,
        vehicleTypes,
        fuelTypes,
        dealers,
        dossierTypes,
        loading,
        error,
        addBrand,
        addModel
    } = useVehicleFormData(selectedBrandId);

    // Get state from Zustand store
    const {
        currentStep,
        vehicleId,
        vehicleRef,
        advertisementId,
        images,
        setStep,
        nextStep,
        prevStep,
        setVehicleId,
        setVehicleRef,
        setAdvertisementId,
        addImages,
        removeImage,
        clearImages,
        reorderImages,
        setImageUploading,
        setImageUploaded,
        setImageError,
        reset
    } = useVehicleFormStore();

    // Initialize vehicle form with zod resolver
    const vehicleForm = useForm<VehicleAngolaFormValues>({
        resolver: zodResolver(vehicleAngolaSchema),
        defaultValues: {
            brand_id: undefined,
            model_id: undefined,
            year: new Date().getFullYear(),
            first_registration: '',
            mileage: 0,
            color: '',
            vehicle_type_id: undefined,
            fuel_type_id: undefined,
            doors: 5,
            seats: 5,
            dealer_id: undefined,
            dossier_type_id: undefined,
            gearbox: '',
            din_power: undefined,
            fiscal_power: undefined,
            price: 0,
            purchase_price: 0,
            description: '',
            location: ''
        }
    });

    // Initialize advertisement form
    const advertisementForm = useForm<AdvertisementFormValues>({
        resolver: zodResolver(advertisementSchema),
        defaultValues: {
            title: '',
            description: '',
            price: 0
        }
    });

    // Watch brand_id to filter models
    const watchBrandId = vehicleForm.watch('brand_id');
    const watchFirstRegistration = vehicleForm.watch('first_registration');

    // Update selectedBrandId when brand_id changes
    useEffect(() => {
        if (watchBrandId) {
            setSelectedBrandId(Number(watchBrandId));
        }
    }, [watchBrandId]);

    // Update year when first_registration changes
    useEffect(() => {
        if (watchFirstRegistration) {
            const parts = watchFirstRegistration.split('/');
            if (parts.length === 2) {
                const year = parseInt(parts[1], 10);
                if (!isNaN(year) && year >= 1900 && year <= new Date().getFullYear() + 1) {
                    vehicleForm.setValue('year', year);
                }
            }
        }
    }, [watchFirstRegistration, vehicleForm]);

    // Handle vehicle form submission
    const onSubmitVehicle = async (data: VehicleAngolaFormValues) => {
        setIsSubmitting(true);

        try {
            // Extract year from first_registration if not already set
            if (data.first_registration && !data.year) {
                const parts = data.first_registration.split('/');
                if (parts.length === 2) {
                    const year = parseInt(parts[1], 10);
                    if (!isNaN(year)) {
                        data.year = year;
                    }
                }
            }

            // Prepare vehicle data
            const vehicleData = {
                brand_id: brands.find(b => b.id === Number(data.brand_id))?.id,
                model_id: filteredModels.find(m => m.id === Number(data.model_id))?.id,
                year: data.year,
                first_registration: data.first_registration,
                mileage: data.mileage,
                color: data.color,
                vehicle_type_id: vehicleTypes.find(t => t.id === Number(data.vehicle_type_id))?.id,
                fuel_type_id: fuelTypes.find(f => f.id === Number(data.fuel_type_id))?.id,
                dealer_id: dealers.find(d => d.id === Number(data.dealer_id))?.id,
                dossier_type_id: dossierTypes.find(d => d.id === Number(data.dossier_type_id))?.id,
                nb_doors: data.doors,
                nb_seats: data.seats,
                price: data.price,
                purchase_price: data.purchase_price,
                location: data.location,
                gearbox: data.gearbox,
                din_power: data.din_power,
                fiscal_power: data.fiscal_power,
                status: 'disponible',
                user_id: user?.id,
                posted_by_user: user?.id,
            };

            let result;

            // If we already have a vehicle ID, update it
            if (vehicleId) {
                const { data: updatedVehicle, error: updateError } = await supabase
                    .from('cars_v2')
                    .update(vehicleData)
                    .eq('id', vehicleId)
                    .select('id, ref_auto')
                    .single();

                if (updateError) throw updateError;
                result = updatedVehicle;

                toast.success('Véhicule mis à jour avec succès !');
            } else {
                // Otherwise, insert a new vehicle
                const { data: newVehicle, error: insertError } = await supabase
                    .from('cars_v2')
                    .insert([vehicleData])
                    .select('id, ref_auto')
                    .single();

                if (insertError) throw insertError;
                result = newVehicle;

                // Store the vehicle ID
                setVehicleId(newVehicle.id);

                toast.success('Véhicule ajouté avec succès !');
            }

            // Store the vehicle reference
            setVehicleRef(result.ref_auto);

            // Pre-fill advertisement form with vehicle data
            advertisementForm.setValue('title', `${brands.find(b => b.id === Number(data.brand_id))?.name || ''} ${filteredModels.find(m => m.id === Number(data.model_id))?.name || ''} ${data.year}`);
            advertisementForm.setValue('price', data.price);

            // Move to next step
            nextStep();
        } catch (error) {
            console.error('Error submitting vehicle form:', error);
            toast.error('Erreur lors de l\'ajout du véhicule');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle advertisement form submission
    const onSubmitAdvertisement = async (data: AdvertisementFormValues) => {
        if (!vehicleId) {
            toast.error('ID du véhicule manquant');
            return;
        }

        setIsSubmitting(true);

        try {
            // Prepare advertisement data
            const advertisementData = {
                car_id: vehicleId,
                title: data.title,
                description: data.description,
                price: data.price,
                photos: []
            };

            let result;

            // If we already have an advertisement ID, update it
            if (advertisementId) {
                const { data: updatedAd, error: updateError } = await supabase
                    .from('advertisements')
                    .update(advertisementData)
                    .eq('id', advertisementId)
                    .select('id')
                    .single();

                if (updateError) throw updateError;
                result = updatedAd;

                toast.success('Annonce mise à jour avec succès !');
            } else {
                // Otherwise, insert a new advertisement
                const { data: newAd, error: insertError } = await supabase
                    .from('advertisements')
                    .insert([advertisementData])
                    .select('id')
                    .single();

                if (insertError) throw insertError;
                result = newAd;

                // Store the advertisement ID
                setAdvertisementId(newAd.id);

                // Add entry to post_logs
                const { error: logError } = await supabase
                    .from('post_logs')
                    .insert([{
                        car_id: vehicleId,
                        user_id: user?.id,
                        post_date: new Date().toISOString()
                    }]);

                if (logError) {
                    console.error('Error adding post log:', logError);
                }

                toast.success('Annonce créée avec succès !');
            }

            // Move to next step
            nextStep();
        } catch (error) {
            console.error('Error submitting advertisement form:', error);
            toast.error('Erreur lors de la création de l\'annonce');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle image upload
    const uploadImages = async () => {
        if (!vehicleRef || !vehicleId || images.length === 0) {
            toast.error('Veuillez ajouter au moins une image');
            return;
        }

        setIsSubmitting(true);
        console.log('Starting upload process...', { vehicleRef, vehicleId, imagesCount: images.length });

        try {
            // Upload each image
            const uploadedUrls: string[] = [];

            for (let i = 0; i < images.length; i++) {
                const image = images[i];
                console.log(`Processing image ${i + 1}/${images.length}:`, image.file.name);

                // Skip already uploaded images
                if (image.uploaded) {
                    if (image.url) {
                        uploadedUrls.push(image.url);
                    }
                    continue;
                }

                // Set image as uploading
                setImageUploading(image.id, true);

                // Rename file to match order
                const fileExtension = image.file.name.split('.').pop();
                const newFileName = `image-${i + 1}.${fileExtension}`;
                const renamedFile = new File([image.file], newFileName, { type: image.file.type });

                console.log(`Uploading ${newFileName}...`);

                // Upload image using the corrected function
                const result = await uploadImageToServer(renamedFile, vehicleRef, Number(vehicleId));

                console.log(`Upload result for ${newFileName}:`, result);

                if (result.success && result.filePath) {
                    setImageUploaded(image.id, true, result.filePath);
                    uploadedUrls.push(result.filePath);
                    console.log(`Successfully uploaded ${newFileName} to ${result.filePath}`);
                } else {
                    setImageError(image.id, result.error || 'Failed to upload');
                    console.error(`Failed to upload ${newFileName}:`, result.error);
                }
            }

            // Update advertisement with image URLs if we have any
            if (advertisementId && uploadedUrls.length > 0) {
                console.log('Updating advertisement with photos:', uploadedUrls);
                const { error: updateError } = await supabase
                    .from('advertisements')
                    .update({ photos: uploadedUrls })
                    .eq('id', advertisementId);

                if (updateError) {
                    console.error('Error updating advertisement with photos:', updateError);
                    toast.error('Erreur lors de la mise à jour des photos');
                } else {
                    console.log('Successfully updated advertisement with photos');
                }
            }

            // Check if all images were uploaded successfully
            const allUploaded = images.every(img => img.uploaded);

            if (allUploaded) {
                toast.success('Toutes les images ont été téléchargées avec succès !');
                console.log('All images uploaded successfully');

                // Call onSuccess callback if provided
                if (onSuccess) {
                    onSuccess();
                }
            } else {
                toast.warning('Certaines images n\'ont pas pu être téléchargées');
                console.warn('Some images failed to upload');
            }
        } catch (error) {
            console.error('Error uploading images:', error);
            toast.error('Une erreur est survenue lors du téléchargement des images');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Dropzone configuration
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.webp']
        },
        maxFiles: 10,
        disabled: isSubmitting,
        onDrop: (acceptedFiles) => {
            // Check if adding these files would exceed the limit
            if (images.length + acceptedFiles.length > 10) {
                toast.error('Vous ne pouvez pas télécharger plus de 10 images');
                return;
            }

            addImages(acceptedFiles);
        }
    });

    // Handle drag end for reordering images
    const onDragEnd = useCallback((result: any) => {
        if (!result.destination) return;
        reorderImages(result.source.index, result.destination.index);
    }, [reorderImages]);

    // Handle adding a new brand
    const handleAddBrand = async () => {
        const brandName = prompt('Entrez le nom de la nouvelle marque:');
        if (!brandName) return;

        const newBrand = await addBrand(brandName);
        if (newBrand) {
            vehicleForm.setValue('brand_id', newBrand.id);
            setSelectedBrandId(newBrand.id);
        }
    };

    // Handle adding a new model
    const handleAddModel = async () => {
        if (!selectedBrandId) {
            toast.error('Veuillez d\'abord sélectionner une marque');
            return;
        }

        const modelName = prompt('Entrez le nom du nouveau modèle:');
        if (!modelName) return;

        const newModel = await addModel(selectedBrandId, modelName);
        if (newModel) {
            vehicleForm.setValue('model_id', newModel.id);
        }
    };

    // Reset form when component unmounts
    useEffect(() => {
        return () => {
            reset();
        };
    }, [reset]);

    // Loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 text-mkb-blue animate-spin" />
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="text-center p-6 bg-red-50 rounded-lg border border-red-200">
                <p className="text-red-600">{error}</p>
                <Button
                    className="mt-4"
                    variant="outline"
                    onClick={() => router.push('/dashboard/pricing/angola')}
                >
                    Retour
                </Button>
            </div>
        );
    }

    // Render step content
    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <Form form={vehicleForm} onSubmit={vehicleForm.handleSubmit(onSubmitVehicle)} className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-xl font-bold text-mkb-black flex items-center gap-2">
                                    <Car className="h-5 w-5 text-mkb-blue" />
                                    Étape 1: Informations du véhicule
                                </CardTitle>
                                <CardDescription>
                                    Renseignez les informations techniques du véhicule
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Marque et Modèle */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <FormField
                                            control={vehicleForm.control}
                                            name="brand_id"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-mkb-black font-medium">Marque *</FormLabel>
                                                    <div className="flex gap-2">
                                                        <FormControl>
                                                            <Select
                                                                onValueChange={(value) => {
                                                                    field.onChange(Number(value));
                                                                    setSelectedBrandId(Number(value));
                                                                    // Reset model when brand changes
                                                                    vehicleForm.setValue('model_id', null as any);
                                                                }}
                                                                value={field.value?.toString()}
                                                            >
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Sélectionner une marque" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {brands.map((brand) => (
                                                                        <SelectItem key={brand.id} value={brand.id.toString()}>
                                                                            {brand.name}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </FormControl>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="icon"
                                                            onClick={handleAddBrand}
                                                        >
                                                            <Plus className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <FormField
                                            control={vehicleForm.control}
                                            name="model_id"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-mkb-black font-medium">Modèle *</FormLabel>
                                                    <div className="flex gap-2">
                                                        <FormControl>
                                                            <Select
                                                                onValueChange={(value) => field.onChange(Number(value))}
                                                                value={field.value?.toString()}
                                                                disabled={!selectedBrandId}
                                                            >
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder={selectedBrandId ? "Sélectionner un modèle" : "Sélectionnez d'abord une marque"} />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {filteredModels.map((model) => (
                                                                        <SelectItem key={model.id} value={model.id.toString()}>
                                                                            {model.name}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </FormControl>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="icon"
                                                            onClick={handleAddModel}
                                                            disabled={!selectedBrandId}
                                                        >
                                                            <Plus className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                {/* Première immatriculation et Kilométrage */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        control={vehicleForm.control}
                                        name="first_registration"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-mkb-black font-medium">Première immatriculation (MM/YYYY) *</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="01/2024"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={vehicleForm.control}
                                        name="mileage"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-mkb-black font-medium">Kilométrage *</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        placeholder="0"
                                                        {...field}
                                                        onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Couleur et Boîte de vitesses */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        control={vehicleForm.control}
                                        name="color"
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
                                        control={vehicleForm.control}
                                        name="gearbox"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-mkb-black font-medium">Boîte de vitesses</FormLabel>
                                                <FormControl>
                                                    <Select
                                                        onValueChange={field.onChange}
                                                        value={field.value}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Sélectionner" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Manuelle">Manuelle</SelectItem>
                                                            <SelectItem value="Automatique">Automatique</SelectItem>
                                                            <SelectItem value="Semi-automatique">Semi-automatique</SelectItem>
                                                            <SelectItem value="Séquentielle">Séquentielle</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Type de véhicule, Type de carburant */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        control={vehicleForm.control}
                                        name="vehicle_type_id"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-mkb-black font-medium">Type de véhicule *</FormLabel>
                                                <FormControl>
                                                    <Select
                                                        onValueChange={(value) => field.onChange(Number(value))}
                                                        value={field.value?.toString()}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Sélectionner un type" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {vehicleTypes.map((type) => (
                                                                <SelectItem key={type.id} value={type.id.toString()}>
                                                                    {type.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={vehicleForm.control}
                                        name="fuel_type_id"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-mkb-black font-medium">Type de carburant *</FormLabel>
                                                <FormControl>
                                                    <Select
                                                        onValueChange={(value) => field.onChange(Number(value))}
                                                        value={field.value?.toString()}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Sélectionner un type" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {fuelTypes.map((type) => (
                                                                <SelectItem key={type.id} value={type.id.toString()}>
                                                                    {type.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Puissance DIN et Puissance fiscale */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        control={vehicleForm.control}
                                        name="din_power"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-mkb-black font-medium">Puissance DIN (ch)</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        placeholder="0"
                                                        {...field}
                                                        value={field.value === undefined ? '' : field.value}
                                                        onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={vehicleForm.control}
                                        name="fiscal_power"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-mkb-black font-medium">Puissance fiscale (CV)</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        placeholder="0"
                                                        {...field}
                                                        value={field.value === undefined ? '' : field.value}
                                                        onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Portes, Places */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        control={vehicleForm.control}
                                        name="doors"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-mkb-black font-medium">Nombre de portes *</FormLabel>
                                                <FormControl>
                                                    <Select
                                                        onValueChange={(value) => field.onChange(Number(value))}
                                                        value={field.value?.toString()}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Sélectionner" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="3">3 portes</SelectItem>
                                                            <SelectItem value="4">4 portes</SelectItem>
                                                            <SelectItem value="5">5 portes</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={vehicleForm.control}
                                        name="seats"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-mkb-black font-medium">Nombre de places *</FormLabel>
                                                <FormControl>
                                                    <Select
                                                        onValueChange={(value) => field.onChange(Number(value))}
                                                        value={field.value?.toString()}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Sélectionner" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {[2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                                                                <SelectItem key={num} value={num.toString()}>
                                                                    {num} places
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Marchand, Type de dossier */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        control={vehicleForm.control}
                                        name="dealer_id"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-mkb-black font-medium">Marchand *</FormLabel>
                                                <FormControl>
                                                    <Select
                                                        onValueChange={(value) => field.onChange(Number(value))}
                                                        value={field.value?.toString()}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Sélectionner un marchand" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {dealers.length > 0 ? (
                                                                dealers.map((dealer) => (
                                                                    <SelectItem key={dealer.id} value={dealer.id.toString()}>
                                                                        {dealer.name}
                                                                    </SelectItem>
                                                                ))
                                                            ) : (
                                                                <SelectItem value="0">Aucun marchand trouvé</SelectItem>
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={vehicleForm.control}
                                        name="dossier_type_id"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-mkb-black font-medium">Type de dossier *</FormLabel>
                                                <FormControl>
                                                    <Select
                                                        onValueChange={(value) => field.onChange(Number(value))}
                                                        value={field.value?.toString()}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Sélectionner un type" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {dossierTypes.map((type) => (
                                                                <SelectItem key={type.id} value={type.id.toString()}>
                                                                    {type.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Prix d'achat, Prix de vente */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        control={vehicleForm.control}
                                        name="purchase_price"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-mkb-black font-medium">Prix d&apos;achat (€) *</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        placeholder="0"
                                                        {...field}
                                                        onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={vehicleForm.control}
                                        name="price"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-mkb-black font-medium">Prix de vente (€) *</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        placeholder="0"
                                                        {...field}
                                                        onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Localisation */}
                                <FormField
                                    control={vehicleForm.control}
                                    name="location"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-mkb-black font-medium">Localisation *</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Adresse ou dépôt du véhicule"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Description */}
                                <FormField
                                    control={vehicleForm.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-mkb-black font-medium">Description</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Description du véhicule, équipements, état général..."
                                                    className="min-h-[120px]"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        {/* Buttons */}
                        <div className="flex justify-end gap-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onCancel}
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
                                        <ArrowRight className="mr-2 h-4 w-4" />
                                        Suivant
                                    </>
                                )}
                            </Button>
                        </div>
                    </Form>
                );

            case 2:
                return (
                    <Form form={advertisementForm} onSubmit={advertisementForm.handleSubmit(onSubmitAdvertisement)} className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-xl font-bold text-mkb-black flex items-center gap-2">
                                    <Car className="h-5 w-5 text-mkb-blue" />
                                    Étape 2: Informations de l&apos;annonce
                                </CardTitle>
                                <CardDescription>
                                    Renseignez les informations de vente pour le véhicule {vehicleRef}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Titre */}
                                <FormField
                                    control={advertisementForm.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-mkb-black font-medium">Titre de l&apos;annonce *</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Ex: Peugeot 308 1.6 HDi 120ch Allure"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Description */}
                                <FormField
                                    control={advertisementForm.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-mkb-black font-medium">Description de l&apos;annonce *</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Description détaillée du véhicule, équipements, état..."
                                                    className="min-h-[200px]"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Prix */}
                                <FormField
                                    control={advertisementForm.control}
                                    name="price"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-mkb-black font-medium">Prix affiché (€) *</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="0"
                                                    {...field}
                                                    onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        {/* Buttons */}
                        <div className="flex justify-between gap-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={prevStep}
                                disabled={isSubmitting}
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Précédent
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
                                        <ArrowRight className="mr-2 h-4 w-4" />
                                        Suivant
                                    </>
                                )}
                            </Button>
                        </div>
                    </Form>
                );

            case 3:
                return (
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-xl font-bold text-mkb-black flex items-center gap-2">
                                    <Image className="h-5 w-5 text-mkb-blue" />
                                    Étape 3: Ajout des photos
                                </CardTitle>
                                <CardDescription>
                                    Téléchargez et organisez les photos pour le véhicule {vehicleRef}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Dropzone */}
                                <div
                                    {...getRootProps()}
                                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${isDragActive ? 'border-mkb-blue bg-mkb-blue/5' : 'border-gray-300 hover:border-mkb-blue hover:bg-gray-50'
                                        }`}
                                >
                                    <input {...getInputProps()} />
                                    <Upload className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-600 mb-2">
                                        {isDragActive
                                            ? "Déposez les images ici..."
                                            : "Glissez-déposez des images ici, ou cliquez pour sélectionner"}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        PNG, JPG ou WEBP (Max. 10 fichiers)
                                    </p>
                                </div>

                                {/* Image Preview and Reordering */}
                                {images.length > 0 && (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-sm font-medium">
                                                Images sélectionnées ({images.length}/10)
                                            </h3>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={clearImages}
                                                disabled={isSubmitting}
                                            >
                                                <X className="h-4 w-4 mr-2" />
                                                Tout supprimer
                                            </Button>
                                        </div>

                                        <DragDropContext onDragEnd={onDragEnd}>
                                            <Droppable droppableId="images" direction="horizontal">
                                                {(provided) => (
                                                    <div
                                                        {...provided.droppableProps}
                                                        ref={provided.innerRef}
                                                        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
                                                    >
                                                        <AnimatePresence>
                                                            {images.map((image, index) => (
                                                                <Draggable
                                                                    key={image.id}
                                                                    draggableId={image.id}
                                                                    index={index}
                                                                    isDragDisabled={isSubmitting}
                                                                >
                                                                    {(provided) => (
                                                                        <div
                                                                            ref={provided.innerRef}
                                                                            {...provided.draggableProps}
                                                                            {...provided.dragHandleProps}
                                                                        >
                                                                            <motion.div
                                                                                initial={{ opacity: 0, scale: 0.8 }}
                                                                                animate={{ opacity: 1, scale: 1 }}
                                                                                exit={{ opacity: 0, scale: 0.8 }}
                                                                                className="relative group"
                                                                            >
                                                                                <div className="relative border rounded-md overflow-hidden aspect-video bg-gray-100">
                                                                                    <img
                                                                                        src={image.preview}
                                                                                        alt={`Preview ${index + 1}`}
                                                                                        className="w-full h-full object-cover"
                                                                                    />
                                                                                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all">
                                                                                        {image.uploading && (
                                                                                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
                                                                                                <Loader2 className="h-8 w-8 text-white animate-spin" />
                                                                                            </div>
                                                                                        )}
                                                                                        {image.uploaded && (
                                                                                            <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                                                                                                <Check className="h-4 w-4" />
                                                                                            </div>
                                                                                        )}
                                                                                        {image.error && (
                                                                                            <div className="absolute inset-0 flex items-center justify-center bg-red-500 bg-opacity-40">
                                                                                                <p className="text-white text-xs p-1">{image.error}</p>
                                                                                            </div>
                                                                                        )}
                                                                                    </div>
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={() => removeImage(image.id)}
                                                                                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                                        disabled={isSubmitting}
                                                                                    >
                                                                                        <X className="h-4 w-4" />
                                                                                    </button>
                                                                                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                                                                                        image-{index + 1}
                                                                                    </div>
                                                                                </div>
                                                                            </motion.div>
                                                                        </div>
                                                                    )}
                                                                </Draggable>
                                                            ))}
                                                        </AnimatePresence>
                                                        {provided.placeholder}
                                                    </div>
                                                )}
                                            </Droppable>
                                        </DragDropContext>
                                    </div>
                                )}

                                {/* Instructions */}
                                <div className="bg-gray-50 p-4 rounded-lg text-sm">
                                    <h4 className="font-medium mb-2">Instructions:</h4>
                                    <ul className="list-disc pl-5 space-y-1 text-gray-600">
                                        <li>Glissez-déposez pour réorganiser les images</li>
                                        <li>La première image sera l&apos;image principale</li>
                                        <li>Les images seront renommées automatiquement (image-1.jpg, image-2.jpg, etc.)</li>
                                        <li>Formats acceptés: JPG, PNG, WEBP</li>
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Buttons */}
                        <div className="flex justify-between gap-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={prevStep}
                                disabled={isSubmitting}
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Précédent
                            </Button>

                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        if (onSuccess) onSuccess();
                                    }}
                                    disabled={isSubmitting}
                                >
                                    Ignorer cette étape
                                </Button>

                                <Button
                                    type="button"
                                    onClick={uploadImages}
                                    disabled={isSubmitting || images.length === 0}
                                    className="bg-mkb-blue hover:bg-mkb-blue/90 text-white min-w-[140px]"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Téléchargement...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="mr-2 h-4 w-4" />
                                            Télécharger {images.length > 0 ? `(${images.length})` : ''}
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    // Render step indicator
    const renderStepIndicator = () => {
        return (
            <div className="flex items-center justify-center mb-8">
                <div className="flex items-center">
                    {[1, 2, 3].map((step) => (
                        <React.Fragment key={step}>
                            <div
                                className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep === step
                                    ? 'bg-mkb-blue text-white'
                                    : currentStep > step
                                        ? 'bg-green-500 text-white'
                                        : 'bg-gray-200 text-gray-600'
                                    }`}
                            >
                                {currentStep > step ? <Check className="h-4 w-4" /> : step}
                            </div>
                            {step < 3 && (
                                <div
                                    className={`w-16 h-1 ${currentStep > step ? 'bg-green-500' : 'bg-gray-200'
                                        }`}
                                ></div>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {renderStepIndicator()}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    {renderStepContent()}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}