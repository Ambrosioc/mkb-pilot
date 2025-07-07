'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useVehicleFormData } from '@/hooks/useVehicleFormData';
import { vehicleStockSchema, type VehicleStockFormValues } from '@/lib/schemas/vehicle-stock';
import { supabase } from '@/lib/supabase';
import { zodResolver } from '@hookform/resolvers/zod';
import { Car, Loader2, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface VehicleStockFormProps {
    onSuccess?: () => void;
    onCancel?: () => void;
}

export function VehicleStockForm({ onSuccess, onCancel }: VehicleStockFormProps) {
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
        loading,
        error,
        addBrand,
        addModel
    } = useVehicleFormData(selectedBrandId);

    // Initialize form with zod resolver
    const form = useForm<VehicleStockFormValues>({
        resolver: zodResolver(vehicleStockSchema),
        defaultValues: {
            brand_id: undefined,
            model_id: undefined,
            first_registration: '',
            mileage: undefined,
            color: '',
            car_type_id: undefined,
            fuel_type_id: undefined,
            dealer_id: undefined,
            dossier_type_id: undefined,
            nb_doors: 5,
            nb_seats: 5,
            price: undefined,
            purchase_price: undefined,
            location: '',
            gearbox: '',
            din_power: undefined,
            fiscal_power: undefined,
            source_url: ''
        }
    });

    // Handle brand selection
    const handleBrandChange = (brandId: number) => {
        setSelectedBrandId(brandId);
        form.setValue('brand_id', brandId);
        form.setValue('model_id', null as any); // Reset model when brand changes
    };

    // Handle model selection
    const handleModelChange = (modelId: number) => {
        form.setValue('model_id', modelId);
    };

    // Handle form submission
    const onSubmit = async (data: VehicleStockFormValues) => {
        if (!user) {
            toast.error('Vous devez être connecté pour ajouter un véhicule');
            return;
        }

        setIsSubmitting(true);

        try {
            // Insert vehicle into cars_v2 table
            const { data: vehicleData, error: vehicleError } = await supabase
                .from('cars_v2')
                .insert([
                    {
                        brand_id: data.brand_id,
                        model_id: data.model_id,
                        year: data.first_registration ? new Date(data.first_registration).getFullYear() : new Date().getFullYear(),
                        first_registration: data.first_registration,
                        mileage: data.mileage,
                        color: data.color,
                        car_type_id: data.car_type_id,
                        fuel_type_id: data.fuel_type_id,
                        dealer_id: data.dealer_id,
                        dossier_type_id: data.dossier_type_id,
                        nb_doors: data.nb_doors,
                        nb_seats: data.nb_seats,
                        price: data.price,
                        purchase_price: data.purchase_price,
                        location: data.location,
                        gearbox: data.gearbox,
                        din_power: data.din_power,
                        fiscal_power: data.fiscal_power,
                        source_url: data.source_url,
                        user_id: user.id,
                        status: 'disponible',
                        add_by_user: user.id
                    }
                ])
                .select('id, reference')
                .single();

            if (vehicleError) {
                throw vehicleError;
            }

            toast.success(`Véhicule ${vehicleData.reference} ajouté avec succès !`);

            // Reset form
            form.reset();
            setSelectedBrandId(undefined);

            // Call success callback or redirect
            if (onSuccess) {
                onSuccess();
            } else {
                router.push('/dashboard/stock');
            }

        } catch (error) {
            console.error('Error creating vehicle:', error);
            toast.error('Erreur lors de la création du véhicule');
        } finally {
            setIsSubmitting(false);
        }
    };

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
                    onClick={onCancel || (() => router.push('/dashboard/stock'))}
                >
                    Retour
                </Button>
            </div>
        );
    }

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Car className="h-5 w-5 text-mkb-blue" />
                    Ajouter un véhicule au stock
                </CardTitle>
                <CardDescription>
                    Remplissez les informations du véhicule à ajouter au stock
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form form={form} onSubmit={form.handleSubmit(onSubmit)}>
                    <div className="space-y-6">
                        {/* Marque et Modèle */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="brand_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-mkb-black font-medium">Marque *</FormLabel>
                                        <div className="flex gap-2">
                                            <FormControl>
                                                <Select
                                                    onValueChange={(value) => handleBrandChange(Number(value))}
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
                                                size="sm"
                                                onClick={() => {
                                                    const brandName = prompt('Nom de la nouvelle marque:');
                                                    if (brandName) {
                                                        addBrand(brandName);
                                                    }
                                                }}
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="model_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-mkb-black font-medium">Modèle *</FormLabel>
                                        <div className="flex gap-2">
                                            <FormControl>
                                                <Select
                                                    onValueChange={(value) => handleModelChange(Number(value))}
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
                                            {selectedBrandId && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        const modelName = prompt('Nom du nouveau modèle:');
                                                        if (modelName) {
                                                            addModel(selectedBrandId, modelName);
                                                        }
                                                    }}
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Type de véhicule et Type de carburant */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="car_type_id"
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
                                control={form.control}
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
                                                    {fuelTypes.map((fuel) => (
                                                        <SelectItem key={fuel.id} value={fuel.id.toString()}>
                                                            {fuel.name}
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

                        {/* Boîte de vitesses */}
                        <FormField
                            control={form.control}
                            name="gearbox"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-mkb-black font-medium">Boîte de vitesses *</FormLabel>
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

                        {/* Puissance DIN et Puissance fiscale */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
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
                                control={form.control}
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

                        {/* Kilométrage et Première immatriculation */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="mileage"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-mkb-black font-medium">Kilométrage (km)</FormLabel>
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
                                control={form.control}
                                name="first_registration"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-mkb-black font-medium">Première immatriculation</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="month"
                                                placeholder="MM/YYYY"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Couleur */}
                        <FormField
                            control={form.control}
                            name="color"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-mkb-black font-medium">Couleur *</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Blanc"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Nombre de portes et Nombre de places */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="nb_doors"
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
                                                    <SelectItem value="2">2 portes</SelectItem>
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
                                control={form.control}
                                name="nb_seats"
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
                                                    <SelectItem value="2">2 places</SelectItem>
                                                    <SelectItem value="3">3 places</SelectItem>
                                                    <SelectItem value="4">4 places</SelectItem>
                                                    <SelectItem value="5">5 places</SelectItem>
                                                    <SelectItem value="6">6 places</SelectItem>
                                                    <SelectItem value="7">7 places</SelectItem>
                                                    <SelectItem value="8">8 places</SelectItem>
                                                    <SelectItem value="9">9 places</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Prix et Prix d'achat */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="price"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-mkb-black font-medium">Prix de vente (€)</FormLabel>
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
                                control={form.control}
                                name="purchase_price"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-mkb-black font-medium">Prix d'achat (€)</FormLabel>
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

                        {/* Localisation et URL source */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="location"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-mkb-black font-medium">Localisation *</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Paris, France"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="source_url"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-mkb-black font-medium">URL source *</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="url"
                                                placeholder="https://example.com/vehicle"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Buttons */}
                        <div className="flex justify-between pt-6">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onCancel || (() => router.push('/dashboard/stock'))}
                            >
                                Annuler
                            </Button>
                            <Button
                                type="submit"
                                className="bg-mkb-blue hover:bg-mkb-blue/90"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Création...
                                    </>
                                ) : (
                                    <>
                                        <Car className="mr-2 h-4 w-4" />
                                        Ajouter le véhicule
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </Form>
            </CardContent>
        </Card>
    );
} 