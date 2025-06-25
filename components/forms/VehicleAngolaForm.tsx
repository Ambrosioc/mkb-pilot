'use client';

import { useAuth } from '@/hooks/useAuth';
import { useVehicleFormData } from '@/hooks/useVehicleFormData';
import { vehicleAngolaSchema, type VehicleAngolaFormValues } from '@/lib/schemas/vehicle-angola';
import { supabase } from '@/lib/supabase';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
    Calendar,
    Car,
    Euro,
    Loader2,
    MapPin,
    Plus,
    Save,
    Tag,
    Users
} from 'lucide-react';

interface VehicleAngolaFormProps {
    onSuccess?: () => void;
    onCancel?: () => void;
    className?: string;
}

export function VehicleAngolaForm({ onSuccess, onCancel, className }: VehicleAngolaFormProps) {
    const router = useRouter();
    const { user } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // State for new item inputs
    const [newBrandName, setNewBrandName] = useState('');
    const [newModelName, setNewModelName] = useState('');
    const [newVehicleTypeName, setNewVehicleTypeName] = useState('');
    const [newFuelTypeName, setNewFuelTypeName] = useState('');
    const [newDealerName, setNewDealerName] = useState('');

    // State for showing add dialogs
    const [showAddBrand, setShowAddBrand] = useState(false);
    const [showAddModel, setShowAddModel] = useState(false);
    const [showAddVehicleType, setShowAddVehicleType] = useState(false);
    const [showAddFuelType, setShowAddFuelType] = useState(false);
    const [showAddDealer, setShowAddDealer] = useState(false);

    // Initialize form
    const form = useForm<VehicleAngolaFormValues>({
        resolver: zodResolver(vehicleAngolaSchema),
        defaultValues: {
            brand_id: undefined,
            model_id: undefined,
            year: new Date().getFullYear(),
            mileage: 0,
            color: '',
            vehicle_type_id: undefined,
            fuel_type_id: undefined,
            doors: 5,
            seats: 5,
            dealer_id: undefined,
            dossier_type_id: undefined,
            price: 0,
            purchase_price: 0,
            description: '',
            location: '',
        },
    });

    // Get the selected brand ID for filtering models
    const selectedBrandId = form.watch('brand_id');

    // Load reference data
    const {
        brands,
        models,
        vehicleTypes,
        fuelTypes,
        dealers,
        dossierTypes,
        filteredModels,
        loading,
        error,
        addBrand,
        addModel,
        addVehicleType,
        addFuelType,
        addDealer,
        refreshData
    } = useVehicleFormData(selectedBrandId ? Number(selectedBrandId) : undefined);

    // Handle adding a new brand
    const handleAddBrand = async () => {
        if (!newBrandName.trim()) {
            toast.error('Veuillez entrer un nom de marque');
            return;
        }

        const newBrand = await addBrand(newBrandName);
        if (newBrand) {
            form.setValue('brand_id', newBrand.id);
            setNewBrandName('');
            setShowAddBrand(false);
        }
    };

    // Handle adding a new model
    const handleAddModel = async () => {
        const brandId = form.getValues('brand_id');

        if (!brandId) {
            toast.error('Veuillez d\'abord sélectionner une marque');
            return;
        }

        if (!newModelName.trim()) {
            toast.error('Veuillez entrer un nom de modèle');
            return;
        }

        const newModel = await addModel(Number(brandId), newModelName);
        if (newModel) {
            form.setValue('model_id', newModel.id);
            setNewModelName('');
            setShowAddModel(false);
        }
    };

    // Handle adding a new vehicle type
    const handleAddVehicleType = async () => {
        if (!newVehicleTypeName.trim()) {
            toast.error('Veuillez entrer un type de véhicule');
            return;
        }

        const newType = await addVehicleType(newVehicleTypeName);
        if (newType) {
            form.setValue('vehicle_type_id', newType.id);
            setNewVehicleTypeName('');
            setShowAddVehicleType(false);
        }
    };

    // Handle adding a new fuel type
    const handleAddFuelType = async () => {
        if (!newFuelTypeName.trim()) {
            toast.error('Veuillez entrer un type de carburant');
            return;
        }

        const newType = await addFuelType(newFuelTypeName);
        if (newType) {
            form.setValue('fuel_type_id', newType.id);
            setNewFuelTypeName('');
            setShowAddFuelType(false);
        }
    };

    // Handle adding a new dealer
    const handleAddDealer = async () => {
        if (!newDealerName.trim()) {
            toast.error('Veuillez entrer un nom de marchand');
            return;
        }

        const newDealer = await addDealer(newDealerName);
        if (newDealer) {
            form.setValue('dealer_id', newDealer.id);
            setNewDealerName('');
            setShowAddDealer(false);
        }
    };

    // Submit the form
    const onSubmit = async (values: VehicleAngolaFormValues) => {
        if (!user) {
            toast.error('Vous devez être connecté pour ajouter un véhicule');
            return;
        }

        setIsSubmitting(true);

        try {
            // Insert the vehicle into the database
            const { data, error } = await supabase
                .from('cars_v2')
                .insert([{
                    ...values,
                    user_id: user.id,
                    created_at: new Date().toISOString(),
                    status: 'disponible'
                }])
                .select()
                .single();

            if (error) throw error;

            toast.success('Véhicule ajouté avec succès');

            // Reset form
            form.reset();

            // Call success callback if provided
            if (onSuccess) {
                onSuccess();
            }

        } catch (error) {
            console.error('Erreur lors de l\'ajout du véhicule:', error);
            toast.error('Erreur lors de l\'ajout du véhicule');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle cancel
    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        } else {
            router.push('/dashboard/pricing/angola');
        }
    };

    // Show error if data loading failed
    if (error) {
        return (
            <div className="p-6 bg-red-50 rounded-lg border border-red-200">
                <h3 className="text-lg font-medium text-red-800 mb-2">Erreur de chargement</h3>
                <p className="text-red-600">{error}</p>
                <Button
                    onClick={refreshData}
                    variant="outline"
                    className="mt-4"
                >
                    Réessayer
                </Button>
            </div>
        );
    }

    return (
        <div className={className}>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    {/* Informations de base */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-mkb-black flex items-center gap-2">
                                    <Car className="h-5 w-5 text-mkb-blue" />
                                    Informations de base
                                </CardTitle>
                                <CardDescription>
                                    Caractéristiques principales du véhicule
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Marque et Modèle */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <FormField
                                            control={form.control}
                                            name="brand_id"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Marque *</FormLabel>
                                                    <div className="flex gap-2">
                                                        <Select
                                                            onValueChange={(value) => {
                                                                field.onChange(parseInt(value, 10));
                                                                // Reset model when brand changes
                                                                form.setValue('model_id', undefined as any);
                                                            }}
                                                            value={field.value?.toString()}
                                                            disabled={loading}
                                                        >
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Sélectionner une marque" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {brands.length === 0 ? (
                                                                    <div className="p-2 text-center text-sm text-gray-500">
                                                                        Aucune donnée trouvée
                                                                    </div>
                                                                ) : (
                                                                    brands.map((brand) => (
                                                                        <SelectItem key={brand.id} value={brand.id.toString()}>
                                                                            {brand.name}
                                                                        </SelectItem>
                                                                    ))
                                                                )}
                                                            </SelectContent>
                                                        </Select>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="icon"
                                                            onClick={() => setShowAddBrand(!showAddBrand)}
                                                            disabled={loading}
                                                        >
                                                            <Plus className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {showAddBrand && (
                                            <div className="flex gap-2 items-center mt-2">
                                                <Input
                                                    placeholder="Nouvelle marque"
                                                    value={newBrandName}
                                                    onChange={(e) => setNewBrandName(e.target.value)}
                                                />
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    onClick={handleAddBrand}
                                                >
                                                    Ajouter
                                                </Button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <FormField
                                            control={form.control}
                                            name="model_id"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Modèle *</FormLabel>
                                                    <div className="flex gap-2">
                                                        <Select
                                                            onValueChange={(value) => field.onChange(parseInt(value, 10))}
                                                            value={field.value?.toString()}
                                                            disabled={!form.watch('brand_id') || loading}
                                                        >
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Sélectionner un modèle" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {filteredModels.length === 0 ? (
                                                                    <div className="p-2 text-center text-sm text-gray-500">
                                                                        Aucun modèle trouvé
                                                                    </div>
                                                                ) : (
                                                                    filteredModels.map((model) => (
                                                                        <SelectItem key={model.id} value={model.id.toString()}>
                                                                            {model.name}
                                                                        </SelectItem>
                                                                    ))
                                                                )}
                                                            </SelectContent>
                                                        </Select>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="icon"
                                                            onClick={() => setShowAddModel(!showAddModel)}
                                                            disabled={!form.watch('brand_id') || loading}
                                                        >
                                                            <Plus className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {showAddModel && (
                                            <div className="flex gap-2 items-center mt-2">
                                                <Input
                                                    placeholder="Nouveau modèle"
                                                    value={newModelName}
                                                    onChange={(e) => setNewModelName(e.target.value)}
                                                />
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    onClick={handleAddModel}
                                                >
                                                    Ajouter
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Année, Kilométrage, Couleur */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="year"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Date de mise en circulation *</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                                        <Input
                                                            type="number"
                                                            placeholder="2024"
                                                            className="pl-10"
                                                            {...field}
                                                            onChange={(e) => field.onChange(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="mileage"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Kilométrage *</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        placeholder="50000"
                                                        {...field}
                                                        onChange={(e) => field.onChange(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="color"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Couleur *</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Blanc, Noir, Rouge..." {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Type de véhicule, Type de carburant */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <FormField
                                            control={form.control}
                                            name="vehicle_type_id"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Type de véhicule *</FormLabel>
                                                    <div className="flex gap-2">
                                                        <Select
                                                            onValueChange={(value) => field.onChange(parseInt(value, 10))}
                                                            value={field.value?.toString()}
                                                            disabled={loading}
                                                        >
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Sélectionner un type" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {vehicleTypes.length === 0 ? (
                                                                    <div className="p-2 text-center text-sm text-gray-500">
                                                                        Aucune donnée trouvée
                                                                    </div>
                                                                ) : (
                                                                    vehicleTypes.map((type) => (
                                                                        <SelectItem key={type.id} value={type.id.toString()}>
                                                                            {type.name}
                                                                        </SelectItem>
                                                                    ))
                                                                )}
                                                            </SelectContent>
                                                        </Select>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="icon"
                                                            onClick={() => setShowAddVehicleType(!showAddVehicleType)}
                                                            disabled={loading}
                                                        >
                                                            <Plus className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {showAddVehicleType && (
                                            <div className="flex gap-2 items-center mt-2">
                                                <Input
                                                    placeholder="Nouveau type de véhicule"
                                                    value={newVehicleTypeName}
                                                    onChange={(e) => setNewVehicleTypeName(e.target.value)}
                                                />
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    onClick={handleAddVehicleType}
                                                >
                                                    Ajouter
                                                </Button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <FormField
                                            control={form.control}
                                            name="fuel_type_id"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Type de carburant *</FormLabel>
                                                    <div className="flex gap-2">
                                                        <Select
                                                            onValueChange={(value) => field.onChange(parseInt(value, 10))}
                                                            value={field.value?.toString()}
                                                            disabled={loading}
                                                        >
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Sélectionner un carburant" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {fuelTypes.length === 0 ? (
                                                                    <div className="p-2 text-center text-sm text-gray-500">
                                                                        Aucune donnée trouvée
                                                                    </div>
                                                                ) : (
                                                                    fuelTypes.map((type) => (
                                                                        <SelectItem key={type.id} value={type.id.toString()}>
                                                                            {type.name}
                                                                        </SelectItem>
                                                                    ))
                                                                )}
                                                            </SelectContent>
                                                        </Select>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="icon"
                                                            onClick={() => setShowAddFuelType(!showAddFuelType)}
                                                            disabled={loading}
                                                        >
                                                            <Plus className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {showAddFuelType && (
                                            <div className="flex gap-2 items-center mt-2">
                                                <Input
                                                    placeholder="Nouveau type de carburant"
                                                    value={newFuelTypeName}
                                                    onChange={(e) => setNewFuelTypeName(e.target.value)}
                                                />
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    onClick={handleAddFuelType}
                                                >
                                                    Ajouter
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Nombre de portes, Nombre de places */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="doors"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Nombre de portes *</FormLabel>
                                                <Select
                                                    onValueChange={(value) => field.onChange(parseInt(value, 10))}
                                                    value={field.value?.toString()}
                                                    disabled={loading}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Sélectionner" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="3">3 portes</SelectItem>
                                                        <SelectItem value="4">4 portes</SelectItem>
                                                        <SelectItem value="5">5 portes</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="seats"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Nombre de places *</FormLabel>
                                                <Select
                                                    onValueChange={(value) => field.onChange(parseInt(value, 10))}
                                                    value={field.value?.toString()}
                                                    disabled={loading}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Sélectionner" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {[2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                                                            <SelectItem key={num} value={num.toString()}>
                                                                {num} places
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Informations commerciales */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-mkb-black flex items-center gap-2">
                                    <Tag className="h-5 w-5 text-mkb-blue" />
                                    Informations commerciales
                                </CardTitle>
                                <CardDescription>
                                    Détails de vente et classification
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Prix de vente et Prix d'achat */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="price"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Prix de vente (€) *</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                                        <Input
                                                            type="number"
                                                            placeholder="15000"
                                                            className="pl-10"
                                                            {...field}
                                                            onChange={(e) => field.onChange(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                                                        />
                                                    </div>
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
                                                <FormLabel>Prix d'achat (€) *</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                                        <Input
                                                            type="number"
                                                            placeholder="12000"
                                                            className="pl-10"
                                                            {...field}
                                                            onChange={(e) => field.onChange(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Marchand et Type de dossier */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <FormField
                                            control={form.control}
                                            name="dealer_id"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Marchand *</FormLabel>
                                                    <div className="flex gap-2">
                                                        <Select
                                                            onValueChange={(value) => field.onChange(parseInt(value, 10))}
                                                            value={field.value?.toString()}
                                                            disabled={loading}
                                                        >
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Sélectionner un marchand" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {dealers.length === 0 ? (
                                                                    <div className="p-2 text-center text-sm text-gray-500">
                                                                        Aucune donnée trouvée
                                                                    </div>
                                                                ) : (
                                                                    dealers.map((dealer) => (
                                                                        <SelectItem key={dealer.id} value={dealer.id.toString()}>
                                                                            {dealer.name}
                                                                        </SelectItem>
                                                                    ))
                                                                )}
                                                            </SelectContent>
                                                        </Select>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="icon"
                                                            onClick={() => setShowAddDealer(!showAddDealer)}
                                                            disabled={loading}
                                                        >
                                                            <Plus className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {showAddDealer && (
                                            <div className="flex gap-2 items-center mt-2">
                                                <Input
                                                    placeholder="Nouveau marchand"
                                                    value={newDealerName}
                                                    onChange={(e) => setNewDealerName(e.target.value)}
                                                />
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    onClick={handleAddDealer}
                                                >
                                                    Ajouter
                                                </Button>
                                            </div>
                                        )}
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="dossier_type_id"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Type de dossier *</FormLabel>
                                                <Select
                                                    onValueChange={(value) => field.onChange(parseInt(value, 10))}
                                                    value={field.value?.toString()}
                                                    disabled={loading}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Sélectionner un type" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {dossierTypes.length === 0 ? (
                                                            <div className="p-2 text-center text-sm text-gray-500">
                                                                Aucune donnée trouvée
                                                            </div>
                                                        ) : (
                                                            dossierTypes.map((type) => (
                                                                <SelectItem key={type.id} value={type.id.toString()}>
                                                                    {type.name}
                                                                </SelectItem>
                                                            ))
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Localisation */}
                                <FormField
                                    control={form.control}
                                    name="location"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Localisation *</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                                    <Input
                                                        placeholder="Paris, Lyon, Marseille..."
                                                        className="pl-10"
                                                        {...field}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Description */}
                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description</FormLabel>
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
                    </motion.div>

                    {/* Informations utilisateur */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-mkb-black flex items-center gap-2">
                                    <Users className="h-5 w-5 text-mkb-blue" />
                                    Informations de suivi
                                </CardTitle>
                                <CardDescription>
                                    Informations sur l'utilisateur et le suivi
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-8 h-8 bg-mkb-blue rounded-full flex items-center justify-center text-white">
                                            {user?.first_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                                        </div>
                                        <div>
                                            <p className="font-medium text-mkb-black">
                                                {user?.first_name && user?.last_name
                                                    ? `${user.first_name} ${user.last_name}`
                                                    : user?.email?.split('@')[0] || 'Utilisateur'}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {new Date().toLocaleDateString('fr-FR', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        Ce véhicule sera enregistré avec votre identifiant utilisateur pour le suivi des statistiques.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Boutons d'action */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="flex justify-end gap-4"
                    >
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleCancel}
                        >
                            Annuler
                        </Button>

                        <Button
                            type="submit"
                            disabled={isSubmitting || loading}
                            className="bg-mkb-blue hover:bg-mkb-blue/90"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Enregistrement...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Enregistrer le véhicule
                                </>
                            )}
                        </Button>
                    </motion.div>
                </form>
            </Form>
        </div>
    );
}