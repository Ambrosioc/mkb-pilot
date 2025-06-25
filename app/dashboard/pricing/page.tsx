'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
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

interface PricingStats {
    voDisponibles: number;
    vehiculesPostesMois: number;
    vehiculesPostesJour: number;
    moyennePostsCollaborateur: number;
    bestPriceur: {
        userId: string;
        total: number;
        name?: string;
    } | null;
    vehiculesAPoster: number;
    loading: boolean;
}

export default function PricingPage() {
    const router = useRouter();
    const [stats, setStats] = useState<PricingStats>({
        voDisponibles: 0,
        vehiculesPostesMois: 0,
        vehiculesPostesJour: 0,
        moyennePostsCollaborateur: 0,
        bestPriceur: null,
        vehiculesAPoster: 0,
        loading: true
    });

    useEffect(() => {
        fetchPricingStats();
    }, []);

    const fetchPricingStats = async () => {
        try {
            // 1. VO disponibles
            const { data: voDisponiblesData, error: voDisponiblesError } = await supabase
                .from('cars_v2')
                .select('count')
                .eq('status', 'disponible')
                .single();

            if (voDisponiblesError) throw voDisponiblesError;

            // 2. Véhicules postés ce mois-ci
            const { data: vehiculesPostesMoisData, error: vehiculesPostesMoisError } = await supabase
                .from('cars_v2')
                .select('count')
                .not('date_post', 'is', null)
                .gte('date_post', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
                .single();

            if (vehiculesPostesMoisError) throw vehiculesPostesMoisError;

            // 3. Véhicules postés aujourd'hui
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const { data: vehiculesPostesJourData, error: vehiculesPostesJourError } = await supabase
                .from('cars_v2')
                .select('count')
                .not('date_post', 'is', null)
                .gte('date_post', today.toISOString())
                .lt('date_post', new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString())
                .single();

            if (vehiculesPostesJourError) throw vehiculesPostesJourError;

            // 4. Moyenne de posts / collaborateur sur le mois
            const { data: moyennePostsData, error: moyennePostsError } = await supabase
                .rpc('get_average_posts_per_user_this_month');

            if (moyennePostsError) throw moyennePostsError;

            // 5. Best priceur du mois
            const { data: bestPriceurData, error: bestPriceurError } = await supabase
                .rpc('get_best_pricer_this_month');

            if (bestPriceurError) throw bestPriceurError;

            // 6. Nombre de véhicules à poster
            const { data: vehiculesAPosterData, error: vehiculesAPosterError } = await supabase
                .from('cars_v2')
                .select('count')
                .eq('status', 'prêt à poster')
                .single();

            if (vehiculesAPosterError) throw vehiculesAPosterError;

            // Si le best priceur existe, récupérer son nom
            let bestPriceurName = '';
            if (bestPriceurData && bestPriceurData.length > 0) {
                const { data: userData, error: userError } = await supabase
                    .from('users')
                    .select('prenom, nom')
                    .eq('id', bestPriceurData[0].user_id)
                    .single();

                if (!userError && userData) {
                    bestPriceurName = `${userData.prenom} ${userData.nom}`;
                }
            }

            setStats({
                voDisponibles: voDisponiblesData?.count || 0,
                vehiculesPostesMois: vehiculesPostesMoisData?.count || 0,
                vehiculesPostesJour: vehiculesPostesJourData?.count || 0,
                moyennePostsCollaborateur: moyennePostsData || 0,
                bestPriceur: bestPriceurData && bestPriceurData.length > 0
                    ? {
                        userId: bestPriceurData[0].user_id,
                        total: bestPriceurData[0].total,
                        name: bestPriceurName
                    }
                    : null,
                vehiculesAPoster: vehiculesAPosterData?.count || 0,
                loading: false
            });

        } catch (error) {
            console.error('Erreur lors de la récupération des statistiques:', error);
            toast.error('Erreur lors du chargement des données');
            setStats(prev => ({ ...prev, loading: false }));
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
                        {stats.loading ? (
                            <Skeleton className="h-8 w-24 mb-2" />
                        ) : (
                            <div className="text-2xl font-bold text-mkb-black">{stats.voDisponibles}</div>
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
                        {stats.loading ? (
                            <Skeleton className="h-8 w-24 mb-2" />
                        ) : (
                            <div className="text-2xl font-bold text-mkb-black">{stats.vehiculesPostesMois}</div>
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
                            Véhicules postés aujourd'hui
                        </CardTitle>
                        <Clock className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        {stats.loading ? (
                            <Skeleton className="h-8 w-24 mb-2" />
                        ) : (
                            <div className="text-2xl font-bold text-mkb-black">{stats.vehiculesPostesJour}</div>
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
                        {stats.loading ? (
                            <Skeleton className="h-8 w-24 mb-2" />
                        ) : (
                            <div className="text-2xl font-bold text-mkb-black">{stats.moyennePostsCollaborateur}</div>
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
                        {stats.loading ? (
                            <Skeleton className="h-8 w-24 mb-2" />
                        ) : stats.bestPriceur ? (
                            <div className="flex items-center gap-2">
                                <div className="text-2xl font-bold text-mkb-black">{stats.bestPriceur.name || 'Utilisateur #' + stats.bestPriceur.userId.substring(0, 4)}</div>
                                <Badge className="bg-yellow-100 text-yellow-800">🔥 {stats.bestPriceur.total} posts</Badge>
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
                            disabled={!stats.bestPriceur}
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
                        {stats.loading ? (
                            <Skeleton className="h-8 w-24 mb-2" />
                        ) : (
                            <div className="text-2xl font-bold text-mkb-black">{stats.vehiculesAPoster}</div>
                        )}
                        <p className="text-xs text-gray-500 mb-4">
                            Véhicules prêts à être publiés
                        </p>
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
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
                        {stats.loading ? (
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