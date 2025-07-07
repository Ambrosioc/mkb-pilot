'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    Car,
    Clock,
    MapPinned,
    Plus,
    Search,
    User
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import PriceVehicleDrawer from './PriceVehicleDrawer';

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

export default function VehiclesToPostPage() {
    const { user } = useAuth();
    const [vehicles, setVehicles] = useState<VehicleToPost[]>([]);
    const [filteredVehicles, setFilteredVehicles] = useState<VehicleToPost[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedVehicle, setSelectedVehicle] = useState<VehicleToPost | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);

    useEffect(() => {
        fetchVehiclesToPost();
    }, []);

    useEffect(() => {
        // Filtrer les véhicules basé sur la recherche
        const filtered = vehicles.filter(vehicle => {
            const matchesSearch =
                vehicle.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
                vehicle.brand_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                vehicle.model_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                vehicle.color.toLowerCase().includes(searchTerm.toLowerCase());

            return matchesSearch;
        });

        setFilteredVehicles(filtered);
    }, [vehicles, searchTerm]);

    const fetchVehiclesToPost = async () => {
        try {
            setLoading(true);

            // Récupérer les véhicules à poster avec les relations brands et models
            const { data, error } = await supabase
                .from('cars_v2')
                .select(`
          id,
          reference,
          year,
          color,
          price,
          purchase_price,
          location,
          status,
          created_at,
          add_by_user,
          brand_id,
          model_id,
          brands!inner(name),
          models!inner(name)
        `)
                .eq('status', 'disponible')
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Récupérer les IDs des véhicules déjà postés
            const { data: postedVehicles, error: postedError } = await supabase
                .from('advertisements')
                .select('car_id');

            if (postedError) throw postedError;

            const postedIds = new Set((postedVehicles || []).map(v => v.car_id));

            // Filtrer les véhicules non postés
            const vehiclesToPost = (data || []).filter(v => !postedIds.has(v.id));

            // Récupérer les informations utilisateur pour les véhicules filtrés
            const userIds = Array.from(new Set(vehiclesToPost.map(v => v.add_by_user).filter(Boolean)));
            let usersMap: Record<string, { prenom: string; nom: string }> = {};

            if (userIds.length > 0) {
                const { data: usersData, error: usersError } = await supabase
                    .from('users')
                    .select('auth_user_id, prenom, nom')
                    .in('auth_user_id', userIds);

                if (!usersError && usersData) {
                    usersMap = usersData.reduce<Record<string, { prenom: string; nom: string }>>((acc, user) => {
                        acc[user.auth_user_id] = { prenom: user.prenom, nom: user.nom };
                        return acc;
                    }, {});
                }
            }

            // Transformer les données
            const transformedData = vehiclesToPost.map(item => ({
                id: item.id,
                reference: item.reference,
                brand_name: (item.brands as any)?.name || 'N/A',
                model_name: (item.models as any)?.name || 'N/A',
                year: item.year,
                color: item.color,
                price: item.price,
                purchase_price: item.purchase_price,
                location: item.location,
                status: item.status,
                created_at: item.created_at,
                add_by_user_name: usersMap[item.add_by_user]
                    ? `${usersMap[item.add_by_user].prenom} ${usersMap[item.add_by_user].nom}`
                    : 'Utilisateur inconnu'
            }));

            setVehicles(transformedData);
        } catch (error) {
            console.error('Erreur lors de la récupération des véhicules à poster:', error);
            toast.error('Erreur lors du chargement des véhicules');
        } finally {
            setLoading(false);
        }
    };

    const handlePriceVehicle = (vehicle: VehicleToPost) => {
        setSelectedVehicle(vehicle);
        setDrawerOpen(true);
    };

    const handlePricingSuccess = () => {
        setDrawerOpen(false);
        setSelectedVehicle(null);
        fetchVehiclesToPost(); // Rafraîchir la liste
        toast.success('Véhicule pricé avec succès !');
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(price);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
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
                    <Car className="h-8 w-8 text-red-600" />
                    <div>
                        <h1 className="text-3xl font-bold text-mkb-black">
                            Véhicules à Poster
                        </h1>
                        <p className="text-gray-600">
                            Véhicules prêts à être publiés sur les plateformes
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/dashboard/pricing">
                        <Button variant="outline" className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Retour au Dashboard
                        </Button>
                    </Link>
                </div>
            </motion.div>

            {/* Stats Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
            >
                <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-red-800">
                                    {loading ? '...' : filteredVehicles.length} véhicules à poster
                                </h3>
                                <p className="text-sm text-red-600">
                                    Prêts à être publiés sur les plateformes
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="h-5 w-5 text-red-600" />
                                <span className="text-sm text-red-600">
                                    Mis à jour à {new Date().toLocaleTimeString('fr-FR')}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Search and Filters */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-mkb-black flex items-center gap-2">
                                <Car className="h-5 w-5" />
                                Liste des véhicules à poster
                            </CardTitle>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <Input
                                    placeholder="Rechercher un véhicule..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 w-80"
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="space-y-4">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                                        <Skeleton className="h-12 w-12 rounded-full" />
                                        <div className="space-y-2 flex-1">
                                            <Skeleton className="h-4 w-[250px]" />
                                            <Skeleton className="h-4 w-[200px]" />
                                        </div>
                                        <Skeleton className="h-10 w-32" />
                                    </div>
                                ))}
                            </div>
                        ) : filteredVehicles.length === 0 ? (
                            <div className="text-center py-12">
                                <Car className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-700">
                                    {searchTerm ? 'Aucun véhicule trouvé' : 'Aucun véhicule à poster'}
                                </h3>
                                <p className="text-gray-500 mt-2">
                                    {searchTerm
                                        ? 'Essayez de modifier vos critères de recherche.'
                                        : 'Tous les véhicules disponibles ont déjà été publiés.'}
                                </p>
                                {!searchTerm && (
                                    <Link href="/dashboard/stock/new">
                                        <Button className="mt-4 bg-mkb-blue hover:bg-mkb-blue/90">
                                            <Plus className="h-4 w-4 mr-2" />
                                            Ajouter un véhicule
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredVehicles.map((vehicle, index) => (
                                    <motion.div
                                        key={vehicle.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: index * 0.05 }}
                                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                                                <Car className="h-6 w-6 text-red-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-mkb-black">
                                                    {vehicle.brand_name} {vehicle.model_name}
                                                </h4>
                                                <p className="text-sm text-gray-600">
                                                    {vehicle.reference} • {vehicle.year} • {vehicle.color}
                                                </p>
                                                <div className="flex items-center gap-4 mt-1">
                                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                                        <MapPinned className="h-3 w-3" />
                                                        {vehicle.location}
                                                    </span>
                                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                                        <User className="h-3 w-3" />
                                                        {vehicle.add_by_user_name}
                                                    </span>
                                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {formatDate(vehicle.created_at)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <div className="font-semibold text-green-600">
                                                    {formatPrice(vehicle.price)}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    Achat: {formatPrice(vehicle.purchase_price)}
                                                </div>
                                            </div>
                                            <Button
                                                onClick={() => handlePriceVehicle(vehicle)}
                                                className="bg-mkb-blue hover:bg-mkb-blue/90"
                                            >
                                                Poster ce véhicule
                                            </Button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>

            {/* Price Vehicle Drawer */}
            {selectedVehicle && (
                <PriceVehicleDrawer
                    vehicle={selectedVehicle}
                    open={drawerOpen}
                    onOpenChange={setDrawerOpen}
                    onSuccess={handlePricingSuccess}
                />
            )}
        </div>
    );
}
