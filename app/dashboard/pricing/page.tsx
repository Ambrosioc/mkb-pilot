'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { usePricingStats } from '@/hooks/usePricingStats';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import {
    ArrowRight,
    BarChart3,
    Calendar,
    Car,
    Clock,
    Crown,
    DollarSign,
    Globe,
    ListChecks,
    Plus,
    Users
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function PricingPage() {
    const router = useRouter();
    const [voDisponibles, setVoDisponibles] = useState(0);
    const [loading, setLoading] = useState(true);

    // Utiliser le nouveau hook pour les statistiques
    const {
        postedStats,
        vehiclesToPost,
        loading: statsLoading,
        error: statsError
    } = usePricingStats();

    useEffect(() => {
        fetchVoDisponibles();
    }, []);

    const fetchVoDisponibles = async () => {
        try {
            // VO disponibles (véhicules en stock avec status 'disponible')
            const { data: voDisponiblesData, error: voDisponiblesError } = await supabase
                .from('cars_v2')
                .select('count')
                .eq('status', 'disponible')
                .single();

            if (voDisponiblesError) throw voDisponiblesError;

            setVoDisponibles(voDisponiblesData?.count || 0);
        } catch (error) {
            console.error('Erreur lors de la récupération des VO disponibles:', error);
            toast.error('Erreur lors du chargement des données');
        } finally {
            setLoading(false);
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
                    <DollarSign className="h-8 w-8 text-mkb-blue" />
                    <div>
                        <h1 className="text-3xl font-bold text-mkb-black">
                            Pricing Dashboard
                        </h1>
                        <p className="text-gray-600">
                            Suivi des performances et des indicateurs clés du pricing
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/dashboard/pricing/angola">
                        <Button variant="outline" className="gap-2">
                            <Globe className="h-4 w-4" />
                            Pricing Angola
                        </Button>
                    </Link>
                </div>
            </motion.div>

            {/* Stats Grid */}
            <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
            >
                {/* 1. VO disponibles */}
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            VO disponibles
                        </CardTitle>
                        <Car className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <Skeleton className="h-8 w-24 mb-2" />
                        ) : (
                            <div className="text-2xl font-bold text-mkb-black">{voDisponibles}</div>
                        )}
                        <p className="text-xs text-gray-500 mb-4">
                            Véhicules actuellement en stock
                        </p>
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => router.push('/dashboard/stock')}
                        >
                            Voir le stock
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </CardContent>
                </Card>

                {/* 2. Véhicules postés ce mois-ci */}
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            Véhicules postés ce mois-ci
                        </CardTitle>
                        <Calendar className="h-4 w-4 text-mkb-blue" />
                    </CardHeader>
                    <CardContent>
                        {statsLoading ? (
                            <Skeleton className="h-8 w-24 mb-2" />
                        ) : (
                            <div className="text-2xl font-bold text-mkb-black">{postedStats.posted_this_month}</div>
                        )}
                        <p className="text-xs text-gray-500 mb-4">
                            Publications depuis le début du mois
                        </p>
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                        >
                            Voir les publications
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </CardContent>
                </Card>

                {/* 3. Véhicules postés aujourd'hui */}
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            Véhicules postés aujourd&apos;hui
                        </CardTitle>
                        <Clock className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        {statsLoading ? (
                            <Skeleton className="h-8 w-24 mb-2" />
                        ) : (
                            <div className="text-2xl font-bold text-mkb-black">{postedStats.posted_today}</div>
                        )}
                        <p className="text-xs text-gray-500 mb-4">
                            Publications du jour
                        </p>
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                        >
                            Voir les posts du jour
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </CardContent>
                </Card>

                {/* 4. Moyenne de posts / collaborateur */}
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            Moyenne posts / collaborateur
                        </CardTitle>
                        <Users className="h-4 w-4 text-mkb-yellow" />
                    </CardHeader>
                    <CardContent>
                        {statsLoading ? (
                            <Skeleton className="h-8 w-24 mb-2" />
                        ) : (
                            <div className="text-2xl font-bold text-mkb-black">{postedStats.avg_posts_per_user.toFixed(1)}</div>
                        )}
                        <p className="text-xs text-gray-500 mb-4">
                            Moyenne mensuelle par utilisateur
                        </p>
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                        >
                            Détail par collaborateur
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </CardContent>
                </Card>

                {/* 5. Best priceur du mois */}
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            Best priceur du mois
                        </CardTitle>
                        <Crown className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        {statsLoading ? (
                            <Skeleton className="h-8 w-24 mb-2" />
                        ) : postedStats.best_pricer_user_id ? (
                            <div className="flex items-center gap-2">
                                <div className="text-2xl font-bold text-mkb-black">
                                    {postedStats.best_pricer_name || `Utilisateur #${postedStats.best_pricer_user_id.substring(0, 8)}`}
                                </div>
                                <Badge className="bg-yellow-100 text-yellow-800">🔥 {postedStats.best_pricer_total} posts</Badge>
                            </div>
                        ) : (
                            <div className="text-sm text-gray-500">Aucune donnée disponible</div>
                        )}
                        <p className="text-xs text-gray-500 mb-4">
                            Collaborateur le plus productif
                        </p>
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            disabled={!postedStats.best_pricer_user_id}
                        >
                            Voir le profil
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </CardContent>
                </Card>

                {/* 6. Véhicules à poster */}
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            Véhicules à poster
                        </CardTitle>
                        <ListChecks className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        {statsLoading ? (
                            <Skeleton className="h-8 w-24 mb-2" />
                        ) : (
                            <div className="text-2xl font-bold text-mkb-black">{vehiclesToPost.length}</div>
                        )}
                        <p className="text-xs text-gray-500 mb-4">
                            Véhicules prêts à être publiés
                        </p>
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => router.push('/dashboard/pricing/to-post')}
                        >
                            Voir la liste
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Performance Chart */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                <Card>
                    <CardHeader>
                        <CardTitle className="text-mkb-black flex items-center gap-2">
                            <BarChart3 className="h-5 w-5" />
                            Performance Mensuelle
                        </CardTitle>
                        <CardDescription>
                            Évolution des publications sur les 30 derniers jours
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {statsLoading ? (
                            <div className="space-y-3">
                                <Skeleton className="h-[250px] w-full" />
                            </div>
                        ) : (
                            <div className="h-[250px] flex items-center justify-center">
                                <p className="text-gray-500">Graphique de performance à implémenter</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
            >
                <Card>
                    <CardHeader>
                        <CardTitle className="text-mkb-black">Actions Rapides</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Link href="/dashboard/pricing/angola/add">
                                <Button className="w-full bg-mkb-blue hover:bg-mkb-blue/90 text-white">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Ajouter un véhicule
                                </Button>
                            </Link>
                            <Button variant="outline" className="border-mkb-yellow text-mkb-yellow hover:bg-mkb-yellow hover:text-white">
                                <ListChecks className="mr-2 h-4 w-4" />
                                Voir les véhicules à poster
                            </Button>
                            <Button variant="outline" className="border-gray-300">
                                <BarChart3 className="mr-2 h-4 w-4" />
                                Rapport mensuel
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Footer */}
            <motion.div
                className="text-center py-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
            >
                <p className="text-sm text-gray-500">
                    Pricing Dashboard - <span className="text-mkb-blue font-semibold">#mkbpilot</span>
                </p>
            </motion.div>
        </div>
    );
}