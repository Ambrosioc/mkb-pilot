'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { usePriceVehicleImageStore } from '@/lib/store/priceVehicleImageStore';
import { supabase } from '@/lib/supabase';
import { uploadMultipleImages } from '@/lib/uploadImage';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import { Car, Check, Loader2, Save, Upload, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

interface VehicleToPost {
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

interface PriceVehicleDrawerProps {
    vehicle: VehicleToPost;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

const pricingSchema = z.object({
    title: z.string().min(5, 'Le titre doit contenir au moins 5 caractères'),
    description: z.string().min(20, 'La description doit contenir au moins 20 caractères'),
    status: z.enum(['active', 'inactive']).default('active')
});

type PricingFormData = z.infer<typeof pricingSchema>;

export default function PriceVehicleDrawer({
    vehicle,
    open,
    onOpenChange,
    onSuccess
}: PriceVehicleDrawerProps) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);

    // Get image store
    const {
        images,
        addImages,
        removeImage,
        clearImages,
        reorderImages,
        setImageUploading,
        setImageUploaded,
        setImageError,
        reset: resetImages
    } = usePriceVehicleImageStore();

    const form = useForm<PricingFormData>({
        resolver: zodResolver(pricingSchema),
        defaultValues: {
            title: `${vehicle.brand_name} ${vehicle.model_name} ${vehicle.year} - ${vehicle.color}`,
            description: `Véhicule ${vehicle.brand_name} ${vehicle.model_name} de ${vehicle.year}, couleur ${vehicle.color}. Véhicule en excellent état, prêt à partir.`,
            status: 'active'
        }
    });

    // Dropzone configuration
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.webp']
        },
        maxFiles: 10,
        disabled: loading,
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

    // Reset images when drawer closes
    useEffect(() => {
        if (!open) {
            resetImages();
        }
    }, [open, resetImages]);

    const uploadImages = async () => {
        if (images.length === 0) {
            return []; // No images to upload
        }

        console.log('Starting upload process...', { vehicleRef: vehicle.reference, vehicleId: vehicle.id, imagesCount: images.length });

        try {
            // Prepare files for upload (rename them to match order)
            const filesToUpload: File[] = [];
            const imageIds: string[] = [];
            const uploadOrder: number[] = []; // Pour garder trace de l'ordre

            for (let i = 0; i < images.length; i++) {
                const image = images[i];

                // Skip already uploaded images
                if (image.uploaded) {
                    continue;
                }

                // Set image as uploading
                setImageUploading(image.id, true);
                imageIds.push(image.id);
                uploadOrder.push(i); // Garder trace de l'ordre original

                // Rename file to match order in the store (pas l'index de la boucle)
                const fileExtension = image.file.name.split('.').pop();
                const newFileName = `photo-${i + 1}.${fileExtension}`; // i est l'index dans le store
                const renamedFile = new File([image.file], newFileName, { type: image.file.type });

                filesToUpload.push(renamedFile);
                console.log(`Prepared ${newFileName} for upload (store index: ${i})`);
            }

            if (filesToUpload.length === 0) {
                // All images already uploaded, return their URLs
                return images.filter(img => img.uploaded && img.url).map(img => img.url!);
            }

            console.log(`Uploading ${filesToUpload.length} images...`);

            // Upload all images in parallel using uploadMultipleImages
            const result = await uploadMultipleImages(filesToUpload, vehicle.reference, Number(vehicle.id));

            console.log('Upload result:', result);

            if (result.success) {
                // All images uploaded successfully
                // Utiliser l'ordre original pour associer les URLs aux bonnes images
                result.filePaths.forEach((filePath, uploadIndex) => {
                    const originalIndex = uploadOrder[uploadIndex];
                    const imageId = imageIds[uploadIndex];
                    setImageUploaded(imageId, true, filePath);
                    console.log(`Successfully uploaded image ${originalIndex + 1} to ${filePath}`);
                });

                // Return all image URLs (uploaded + already existing)
                // Récupérer les URLs des nouvelles images uploadées dans le bon ordre
                const newUploadedUrls = result.filePaths;

                // Récupérer les URLs des images déjà uploadées
                const existingUrls = images
                    .filter(img => img.uploaded && img.url && !imageIds.includes(img.id))
                    .map(img => img.url!);

                // Combiner toutes les URLs
                const allUrls = [...newUploadedUrls, ...existingUrls];

                console.log('📸 URLs combinées:', {
                    newUploaded: newUploadedUrls,
                    existing: existingUrls,
                    all: allUrls
                });

                toast.success('Toutes les images ont été téléchargées avec succès !');
                return allUrls;
            } else {
                // Some images failed
                console.error('Upload errors:', result.errors);

                // Mark failed images with errors
                result.errors.forEach((error, uploadIndex) => {
                    const imageId = imageIds[uploadIndex];
                    setImageError(imageId, error);
                });

                // Mark successful images
                result.filePaths.forEach((filePath, uploadIndex) => {
                    const imageId = imageIds[uploadIndex];
                    setImageUploaded(imageId, true, filePath);
                });

                toast.warning(`${result.errors.length} image(s) n'ont pas pu être téléchargées`);

                // Return successful uploads + existing URLs
                const newUploadedUrls = result.filePaths;
                const existingUrls = images
                    .filter(img => img.uploaded && img.url && !imageIds.includes(img.id))
                    .map(img => img.url!);

                const successfulUrls = [...newUploadedUrls, ...existingUrls];

                console.log('📸 URLs réussies:', {
                    newUploaded: newUploadedUrls,
                    existing: existingUrls,
                    all: successfulUrls
                });

                return successfulUrls;
            }
        } catch (error) {
            console.error('Error uploading images:', error);
            toast.error('Une erreur est survenue lors du téléchargement des images');
            return [];
        }
    };

    const onSubmit = async (data: PricingFormData) => {
        if (!user) {
            toast.error('Vous devez être connecté pour pricer un véhicule');
            return;
        }

        try {
            setLoading(true);

            console.log('🚀 Début du processus de pricing...', {
                vehicleId: vehicle.id,
                vehicleRef: vehicle.reference,
                user: user.id,
                formData: data
            });

            // Upload images first
            const imageUrls = await uploadImages();
            console.log('📸 URLs des images uploadées:', imageUrls);

            // Préparer les données de l'annonce
            const advertisementData = {
                car_id: vehicle.id,
                title: data.title,
                description: data.description,
                price: vehicle.price,
                photos: imageUrls,
                status: data.status,
                posted_by_user: user.id
            };

            console.log('📝 Données de l\'annonce à créer:', advertisementData);

            // Créer l'annonce dans la table advertisements
            const { data: createdAd, error } = await supabase
                .from('advertisements')
                .insert([advertisementData])
                .select('*')
                .single();

            if (error) {
                console.error('❌ Erreur détaillée lors de la création de l\'annonce:', {
                    message: error.message,
                    details: error.details,
                    hint: error.hint,
                    code: error.code,
                    fullError: error
                });
                throw error;
            }

            console.log('✅ Annonce créée avec succès:', createdAd);

            toast.success('Véhicule pricé avec succès !');
            onSuccess();
        } catch (error) {
            console.error('❌ Erreur lors du pricing:', error);

            // Gestion d'erreur plus détaillée
            let errorMessage = 'Erreur lors du pricing du véhicule';

            if (error && typeof error === 'object') {
                if ('message' in error) {
                    errorMessage = error.message as string;
                } else if ('details' in error) {
                    errorMessage = `Erreur de validation: ${error.details}`;
                }
            }

            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(price);
    };

    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerContent>
                <div className="mx-auto w-full max-w-2xl flex flex-col" style={{ maxHeight: '80vh' }}>
                    <DrawerHeader>
                        <DrawerTitle className="flex items-center gap-2">
                            <Car className="h-5 w-5 text-mkb-blue" />
                            Pricer le véhicule
                        </DrawerTitle>
                    </DrawerHeader>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {/* Informations du véhicule */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Informations du véhicule</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Référence</label>
                                        <p className="text-sm">{vehicle.reference}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Véhicule</label>
                                        <p className="text-sm">{vehicle.brand_name} {vehicle.model_name}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Année</label>
                                        <p className="text-sm">{vehicle.year}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Couleur</label>
                                        <p className="text-sm">{vehicle.color}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Prix d&apos;achat</label>
                                        <p className="text-sm text-red-600">{formatPrice(vehicle.purchase_price)}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Formulaire de pricing */}
                        <Form form={form} onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            {/* Affichage du prix de vente (non modifiable) */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-600">Prix de vente</label>
                                <div className="flex items-center px-3 py-2 border border-input bg-muted text-sm rounded-md">
                                    <span className="font-semibold text-green-600">{formatPrice(vehicle.price)}</span>
                                </div>
                                <p className="text-xs text-gray-500">Le prix de vente ne peut pas être modifié</p>
                            </div>

                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Titre de l&apos;annonce</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Titre attractif pour l'annonce" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Description détaillée du véhicule..."
                                                className="min-h-[120px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Section Upload d'images */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <Upload className="h-5 w-5 text-mkb-blue" />
                                    <h3 className="text-lg font-medium">Photos du véhicule</h3>
                                </div>

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
                                                disabled={loading}
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
                                                        <AnimatePresence mode="sync">
                                                            {images.map((image, index) => (
                                                                <Draggable
                                                                    key={image.id}
                                                                    draggableId={image.id}
                                                                    index={index}
                                                                    isDragDisabled={loading}
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
                                                                                        disabled={loading}
                                                                                    >
                                                                                        <X className="h-4 w-4" />
                                                                                    </button>
                                                                                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                                                                                        photo-{index + 1}
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
                                        <li>Les images seront renommées automatiquement (photo-1.jpg, photo-2.jpg, etc.)</li>
                                        <li>Formats acceptés: JPG, PNG, WEBP</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => onOpenChange(false)}
                                    disabled={loading}
                                >
                                    Annuler
                                </Button>
                                <Button type="submit" disabled={loading} className="bg-mkb-blue hover:bg-mkb-blue/90">
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Publication...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" />
                                            Publier l&apos;annonce
                                        </>
                                    )}
                                </Button>
                            </div>
                        </Form>
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    );
} 