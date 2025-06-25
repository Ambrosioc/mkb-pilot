'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    Calendar,
    Car,
    DollarSign,
    Loader2,
    MapPin,
    Plus,
    Save,
    Tag,
    Users
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

// Types pour les données de référence
interface Brand {
    id: number;
    name: string;
}

interface Model {
    id: number;
    brand_id: number;
    name: string;
}

interface VehicleType {
    id: number;
    name: string;
}

interface FuelType {
    id: number;
    name: string;
}

interface Dealer {
    id: number;
    name: string;
}

interface DossierType {
    id: number;
    name: string;
}

// Schéma de validation du formulaire
const vehicleSchema = z.object({
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

    price: z.number({
        required_error: "Le prix est obligatoire",
        invalid_type_error: "Le prix doit être un nombre",
    }).min(0, "Le prix doit être positif").or(z.string().transform(val => parseInt(val, 10))),

    description: z.string().optional(),

    location: z.string().min(1, "La localisation est obligatoire"),
});

type VehicleFormValues = z.infer<typeof vehicleSchema>;

export default function AddVehiclePage() {
    const router = useRouter();
    const { user } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [models, setModels] = useState<Model[]>([]);
    const [filteredModels, setFilteredModels] = useState<Model[]>([]);
    const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
    const [fuelTypes, setFuelTypes] = useState<FuelType[]>([]);
    const [dealers, setDealers] = useState<Dealer[]>([]);
    const [dossierTypes, setDossierTypes] = useState<DossierType[]>([]);
    const [newBrandName, setNewBrandName] = useState('');
    const [newModelName, setNewModelName] = useState('');
    const [newVehicleTypeName, setNewVehicleTypeName] = useState('');
    const [newFuelTypeName, setNewFuelTypeName] = useState('');
    const [newDealerName, setNewDealerName] = useState('');
    const [showAddBrand, setShowAddBrand] = useState(false);
    const [showAddModel, setShowAddModel] = useState(false);
    const [showAddVehicleType, setShowAddVehicleType] = useState(false);
    const [showAddFuelType, setShowAddFuelType] = useState(false);
    const [showAddDealer, setShowAddDealer] = useState(false);

    // Initialiser le formulaire
    const form = useForm<VehicleFormValues>({
        resolver: zodResolver(vehicleSchema),
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
            description: '',
            location: '',
        },
    });

    // Charger les données de référence au chargement de la page
    useEffect(() => {
        fetchReferenceData();
    }, []);

    // Filtrer les modèles lorsque la marque change
    useEffect(() => {
        const brandId = form.watch('brand_id');
        if (brandId) {
            const filtered = models.filter(model => model.brand_id === Number(brandId));
            setFilteredModels(filtered);
        } else {
            setFilteredModels([]);
        }
    }, [form.watch('brand_id'), models]);

    // Charger toutes les données de référence
    const fetchReferenceData = async () => {
        try {
            // Charger les marques
            const { data: brandsData, error: brandsError } = await supabase
                .from('brands')
                .select('*')
                .order('name');

            if (brandsError) throw brandsError;
            setBrands(brandsData || []);

            // Charger les modèles
            const { data: modelsData, error: modelsError } = await supabase
                .from('models')
                .select('*')
                .order('name');

            if (modelsError) throw modelsError;
            setModels(modelsData || []);

            // Charger les types de véhicules
            const { data: vehicleTypesData, error: vehicleTypesError } = await supabase
                .from('vehicle_types')
                .select('*')
                .order('name');

            if (vehicleTypesError) throw vehicleTypesError;
            setVehicleTypes(vehicleTypesData || []);

            // Charger les types de carburant
            const { data: fuelTypesData, error: fuelTypesError } = await supabase
                .from('fuel_types')
                .select('*')
                .order('name');

            if (fuelTypesError) throw fuelTypesError;
            setFuelTypes(fuelTypesData || []);

            // Charger les marchands
            const { data: dealersData, error: dealersError } = await supabase
                .from('dealers')
                .select('*')
                .order('name');

            if (dealersError) throw dealersError;
            setDealers(dealersData || []);

            // Charger les types de dossier
            const { data: dossierTypesData, error: dossierTypesError } = await supabase
                .from('dossier_types')
                .select('*')
                .order('name');

            if (dossierTypesError) throw dossierTypesError;
            setDossierTypes(dossierTypesData || []);

        } catch (error) {
            console.error('Erreur lors du chargement des données de référence:', error);
            toast.error('Erreur lors du chargement des données');
        }
    };

    // Ajouter une nouvelle marque
    const handleAddBrand = async () => {
        if (!newBrandName.trim()) {
            toast.error('Veuillez entrer un nom de marque');
            return;
        }

        try {
            const { data, error } = await supabase
                .from('brands')
                .insert([{ name: newBrandName.trim() }])
                .select()
                .single();

            if (error) throw error;

            setBrands(prev => [...prev, data]);
            form.setValue('brand_id', data.id);
            setNewBrandName('');
            setShowAddBrand(false);
            toast.success('Marque ajoutée avec succès');
        } catch (error) {
            console.error('Erreur lors de l\'ajout de la marque:', error);
            toast.error('Erreur lors de l\'ajout de la marque');
        }
    };

    // Ajouter un nouveau modèle
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

        try {
            const { data, error } = await supabase
                .from('models')
                .insert([{
                    brand_id: Number(brandId),
                    name: newModelName.trim()
                }])
                .select()
                .single();

            if (error) throw error;

            setModels(prev => [...prev, data]);
            setFilteredModels(prev => [...prev, data]);
            form.setValue('model_id', data.id);
            setNewModelName('');
            setShowAddModel(false);
            toast.success('Modèle ajouté avec succès');
        } catch (error) {
            console.error('Erreur lors de l\'ajout du modèle:', error);
            toast.error('Erreur lors de l\'ajout du modèle');
        }
    };

    // Ajouter un nouveau type de véhicule
    const handleAddVehicleType = async () => {
        if (!newVehicleTypeName.trim()) {
            toast.error('Veuillez entrer un type de véhicule');
            return;
        }

        try {
            const { data, error } = await supabase
                .from('vehicle_types')
                .insert([{ name: newVehicleTypeName.trim() }])
                .select()
                .single();

            if (error) throw error;

            setVehicleTypes(prev => [...prev, data]);
            form.setValue('vehicle_type_id', data.id);
            setNewVehicleTypeName('');
            setShowAddVehicleType(false);
            toast.success('Type de véhicule ajouté avec succès');
        } catch (error) {
            console.error('Erreur lors de l\'ajout du type de véhicule:', error);
            toast.error('Erreur lors de l\'ajout du type de véhicule');
        }
    };

    // Ajouter un nouveau type de carburant
    const handleAddFuelType = async () => {
        if (!newFuelTypeName.trim()) {
            toast.error('Veuillez entrer un type de carburant');
            return;
        }

        try {
            const { data, error } = await supabase
                .from('fuel_types')
                .insert([{ name: newFuelTypeName.trim() }])
                .select()
                .single();

            if (error) throw error;

            setFuelTypes(prev => [...prev, data]);
            form.setValue('fuel_type_id', data.id);
            setNewFuelTypeName('');
            setShowAddFuelType(false);
            toast.success('Type de carburant ajouté avec succès');
        } catch (error) {
            console.error('Erreur lors de l\'ajout du type de carburant:', error);
            toast.error('Erreur lors de l\'ajout du type de carburant');
        }
    };

    // Ajouter un nouveau marchand
    const handleAddDealer = async () => {
        if (!newDealerName.trim()) {
            toast.error('Veuillez entrer un nom de marchand');
            return;
        }

        try {
            const { data, error } = await supabase
                .from('dealers')
                .insert([{ name: newDealerName.trim() }])
                .select()
                .single();

            if (error) throw error;

            setDealers(prev => [...prev, data]);
            form.setValue('dealer_id', data.id);
            setNewDealerName('');
            setShowAddDealer(false);
            toast.success('Marchand ajouté avec succès');
        } catch (error) {
            console.error('Erreur lors de l\'ajout du marchand:', error);
            toast.error('Erreur lors de l\'ajout du marchand');
        }
    };

    // Soumettre le formulaire
    const onSubmit = async (values: VehicleFormValues) => {
        if (!user) {
            toast.error('Vous devez être connecté pour ajouter un véhicule');
            return;
        }

        setIsSubmitting(true);

        try {
            // Insérer le véhicule dans la base de données
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
            router.push('/dashboard/pricing/angola');
        } catch (error) {
            console.error('Erreur lors de l\'ajout du véhicule:', error);
            toast.error('Erreur lors de l\'ajout du véhicule');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex items-center justify-between"
            >
                <div className="flex items-center gap-3">
                    <Car className="h-8 w-8 text-mkb-blue" />
                    <div>
                        <h1 className="text-3xl font-bold text-mkb-black">
                            Ajouter un véhicule
                        </h1>
                        <p className="text-gray-600">
                            Créer une nouvelle fiche véhicule pour le marché angolais
                        </p>
                    </div>
                </div>
                <div>
                    <Link href="/dashboard/pricing/angola">
                        <Button variant="outline">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Retour
                        </Button>
                    </Link>
                </div>
            </motion.div>

            {/* Form */}
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
                                                                // Réinitialiser le modèle quand la marque change
                                                                form.setValue('model_id', undefined as any);
                                                            }}
                                                            value={field.value?.toString()}
                                                        >
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Sélectionner une marque" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {brands.map((brand) => (
                                                                    <SelectItem key={brand.id} value={brand.id.toString()}>
                                                                        {brand.name}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="icon"
                                                            onClick={() => setShowAddBrand(!showAddBrand)}
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
                                                            disabled={!form.watch('brand_id')}
                                                        >
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Sélectionner un modèle" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {filteredModels.map((model) => (
                                                                    <SelectItem key={model.id} value={model.id.toString()}>
                                                                        {model.name}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="icon"
                                                            onClick={() => setShowAddModel(!showAddModel)}
                                                            disabled={!form.watch('brand_id')}
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
                                                <FormLabel>Année *</FormLabel>
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
                                                        >
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Sélectionner un type" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {vehicleTypes.map((type) => (
                                                                    <SelectItem key={type.id} value={type.id.toString()}>
                                                                        {type.name}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="icon"
                                                            onClick={() => setShowAddVehicleType(!showAddVehicleType)}
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
                                                        >
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Sélectionner un carburant" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {fuelTypes.map((type) => (
                                                                    <SelectItem key={type.id} value={type.id.toString()}>
                                                                        {type.name}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="icon"
                                                            onClick={() => setShowAddFuelType(!showAddFuelType)}
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
                                {/* Prix */}
                                <FormField
                                    control={form.control}
                                    name="price"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Prix (€) *</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
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
                                                        >
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Sélectionner un marchand" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {dealers.map((dealer) => (
                                                                    <SelectItem key={dealer.id} value={dealer.id.toString()}>
                                                                        {dealer.name}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="icon"
                                                            onClick={() => setShowAddDealer(!showAddDealer)}
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
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Sélectionner un type" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {dossierTypes.map((type) => (
                                                            <SelectItem key={type.id} value={type.id.toString()}>
                                                                {type.name}
                                                            </SelectItem>
                                                        ))}
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
                        <Link href="/dashboard/pricing/angola">
                            <Button type="button" variant="outline">
                                Annuler
                            </Button>
                        </Link>

                        <Button
                            type="submit"
                            disabled={isSubmitting}
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