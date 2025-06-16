'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import {
    BarChart3,
    Calendar,
    Car,
    DollarSign,
    FileText,
    Globe,
    Plus,
    Target,
    TrendingUp,
    Users
} from 'lucide-react';
import Link from 'next/link';

const pricingMetrics = [
    {
        title: 'Prix moyen',
        value: '€8,450',
        change: '+15%',
        icon: DollarSign,
        color: 'text-green-600',
    },
    {
        title: 'Clients Angola',
        value: '23',
        change: '+8%',
        icon: Users,
        color: 'text-mkb-blue',
    },
    {
        title: 'Taux conversion',
        value: '67%',
        change: '+5%',
        icon: Target,
        color: 'text-purple-600',
    },
    {
        title: 'Revenus totaux',
        value: '€194,350',
        change: '+22%',
        icon: TrendingUp,
        color: 'text-mkb-yellow',
    },
];

const pricingTiers = [
    {
        name: 'Basique',
        price: '€3,500',
        description: 'Pour les petites entreprises',
        features: [
            'Immatriculation standard',
            'Support par email',
            'Documentation de base',
            'Suivi simple'
        ],
        popular: false,
    },
    {
        name: 'Professional',
        price: '€8,500',
        description: 'Pour les entreprises moyennes',
        features: [
            'Immatriculation complète',
            'Support prioritaire',
            'Documentation complète',
            'Suivi avancé',
            'Conseils personnalisés',
            'Reporting mensuel'
        ],
        popular: true,
    },
    {
        name: 'Enterprise',
        price: '€15,000',
        description: 'Pour les grandes entreprises',
        features: [
            'Service complet premium',
            'Support 24/7',
            'Documentation exhaustive',
            'Suivi en temps réel',
            'Conseils stratégiques',
            'Reporting personnalisé',
            'Gestionnaire dédié',
            'Formation équipe'
        ],
        popular: false,
    },
];

export default function PricingAngolaPage() {
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
                    <Globe className="h-8 w-8 text-mkb-blue" />
                    <div>
                        <h1 className="text-3xl font-bold text-mkb-black">
                            Pricing Angola
                        </h1>
                        <p className="text-gray-600">
                            Gestion des tarifs et analyse des prix pour le marché angolais
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/dashboard/pricing/angola/add">
                        <Button className="bg-mkb-blue hover:bg-mkb-blue/90 text-white">
                            <Plus className="h-4 w-4 mr-2" />
                            Ajouter un véhicule
                        </Button>
                    </Link>
                </div>
            </motion.div>

            {/* Metrics */}
            <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
            >
                {pricingMetrics.map((metric) => {
                    const Icon = metric.icon;
                    return (
                        <Card key={metric.title} className="hover:shadow-lg transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">
                                    {metric.title}
                                </CardTitle>
                                <Icon className={`h-4 w-4 ${metric.color}`} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-mkb-black">{metric.value}</div>
                                <p className="text-xs text-green-600">
                                    {metric.change} vs mois précédent
                                </p>
                            </CardContent>
                        </Card>
                    );
                })}
            </motion.div>

            {/* Quick Actions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
            >
                <Card className="border-mkb-blue/20 bg-mkb-blue/5">
                    <CardHeader>
                        <CardTitle className="text-mkb-black flex items-center gap-2">
                            <Car className="h-5 w-5 text-mkb-blue" />
                            Actions Rapides
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Link href="/dashboard/pricing/angola/add">
                                <Button className="w-full bg-mkb-blue hover:bg-mkb-blue/90 text-white h-16 flex flex-col gap-1">
                                    <Plus className="h-5 w-5" />
                                    <span className="text-sm">Nouveau véhicule</span>
                                </Button>
                            </Link>
                            <Button variant="outline" className="w-full h-16 flex flex-col gap-1">
                                <BarChart3 className="h-5 w-5" />
                                <span className="text-sm">Voir les statistiques</span>
                            </Button>
                            <Button variant="outline" className="w-full h-16 flex flex-col gap-1">
                                <FileText className="h-5 w-5" />
                                <span className="text-sm">Exporter données</span>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Pricing Tiers */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                <Card>
                    <CardHeader>
                        <CardTitle className="text-mkb-black flex items-center gap-2">
                            <BarChart3 className="h-5 w-5" />
                            Plans tarifaires Angola
                        </CardTitle>
                        <CardDescription>
                            Structure de prix adaptée au marché angolais
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {pricingTiers.map((tier) => (
                                <motion.div
                                    key={tier.name}
                                    whileHover={{ scale: 1.02 }}
                                    className={`relative p-6 rounded-lg border-2 ${tier.popular
                                        ? 'border-mkb-blue bg-mkb-blue/5'
                                        : 'border-gray-200 bg-white'
                                        }`}
                                >
                                    {tier.popular && (
                                        <Badge className="absolute -top-3 left-6 bg-mkb-blue text-white">
                                            Plus populaire
                                        </Badge>
                                    )}

                                    <div className="text-center mb-4">
                                        <h3 className="text-xl font-bold text-mkb-black">{tier.name}</h3>
                                        <p className="text-gray-600 text-sm">{tier.description}</p>
                                    </div>

                                    <div className="text-center mb-6">
                                        <span className="text-3xl font-bold text-mkb-black">{tier.price}</span>
                                        <span className="text-gray-500">/dossier</span>
                                    </div>

                                    <ul className="space-y-3 mb-6">
                                        {tier.features.map((feature, index) => (
                                            <li key={index} className="flex items-center text-sm">
                                                <div className="h-2 w-2 bg-mkb-blue rounded-full mr-3"></div>
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>

                                    <Button
                                        className={`w-full ${tier.popular
                                            ? 'bg-mkb-blue hover:bg-mkb-blue/90'
                                            : 'bg-gray-900 hover:bg-gray-800'
                                            }`}
                                    >
                                        Sélectionner ce plan
                                    </Button>
                                </motion.div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Analysis Section */}
            <motion.div
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
            >
                <Card>
                    <CardHeader>
                        <CardTitle className="text-mkb-black flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Analyse des tendances
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="p-4 bg-green-50 rounded-lg">
                                <p className="text-sm font-medium text-green-800">Tendance positive</p>
                                <p className="text-xs text-green-600">
                                    Augmentation de 22% des revenus ce trimestre
                                </p>
                            </div>

                            <div className="p-4 bg-blue-50 rounded-lg">
                                <p className="text-sm font-medium text-blue-800">Plan Professional</p>
                                <p className="text-xs text-blue-600">
                                    70% des clients choisissent ce plan
                                </p>
                            </div>

                            <div className="p-4 bg-yellow-50 rounded-lg">
                                <p className="text-sm font-medium text-yellow-800">Opportunité</p>
                                <p className="text-xs text-yellow-600">
                                    Potentiel d'expansion sur le segment Enterprise
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-mkb-black flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Prochaines actions
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {[
                                {
                                    task: 'Révision des prix Q2 2024',
                                    date: '15 Mars 2024',
                                    priority: 'high'
                                },
                                {
                                    task: 'Analyse concurrence Angola',
                                    date: '22 Mars 2024',
                                    priority: 'medium'
                                },
                                {
                                    task: 'Formation équipe nouveaux tarifs',
                                    date: '30 Mars 2024',
                                    priority: 'medium'
                                },
                                {
                                    task: 'Rapport mensuel pricing',
                                    date: '5 Avril 2024',
                                    priority: 'low'
                                }
                            ].map((item, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="text-sm font-medium text-mkb-black">{item.task}</p>
                                        <p className="text-xs text-gray-500">{item.date}</p>
                                    </div>
                                    <div className={`h-3 w-3 rounded-full ${item.priority === 'high' ? 'bg-red-500' :
                                        item.priority === 'medium' ? 'bg-mkb-yellow' :
                                            'bg-green-500'
                                        }`}></div>
                                </div>
                            ))}
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
                    Pricing Angola - <span className="text-mkb-blue font-semibold">#mkbpilot</span>
                </p>
            </motion.div>
        </div>
    );
}