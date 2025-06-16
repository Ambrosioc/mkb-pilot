'use client';

import { VehicleForm } from '@/components/forms/VehicleForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function AddVehiclePage() {
    const router = useRouter();

    const handleSuccess = (vehicleId: string, advertisementId: string) => {
        toast.success(`Véhicule créé avec succès ! ID: ${vehicleId}`);

        // Rediriger vers la page de détail du véhicule ou la liste
        setTimeout(() => {
            router.push('/dashboard/pricing/angola');
        }, 2000);
    };

    const handleCancel = () => {
        router.back();
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
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/pricing/angola">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Retour
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-mkb-black">
                            Ajouter un véhicule
                        </h1>
                        <p className="text-gray-600">
                            Créez une nouvelle fiche véhicule avec son annonce associée
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Instructions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
            >
                <Card className="border-mkb-blue/20 bg-mkb-blue/5">
                    <CardHeader>
                        <CardTitle className="text-mkb-black flex items-center gap-2">
                            <Plus className="h-5 w-5 text-mkb-blue" />
                            Instructions
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <h4 className="font-medium text-mkb-black mb-2">Informations véhicule</h4>
                                <ul className="space-y-1 text-gray-600">
                                    <li>• Renseignez tous les champs obligatoires (*)</li>
                                    <li>• Vérifiez la référence unique du véhicule</li>
                                    <li>• Les consommations sont en L/100km</li>
                                    <li>• Les émissions CO2 en g/km</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-medium text-mkb-black mb-2">Annonce de vente</h4>
                                <ul className="space-y-1 text-gray-600">
                                    <li>• Rédigez un titre accrocheur</li>
                                    <li>• Description détaillée recommandée</li>
                                    <li>• Ajoutez plusieurs photos de qualité</li>
                                    <li>• Prix en euros, sans décimales</li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Formulaire */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                <VehicleForm
                    onSuccess={handleSuccess}
                    onCancel={handleCancel}
                />
            </motion.div>

            {/* Footer */}
            <motion.div
                className="text-center py-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
            >
                <p className="text-sm text-gray-500">
                    Ajout véhicule - <span className="text-mkb-blue font-semibold">#mkbpilot</span>
                </p>
            </motion.div>
        </div>
    );
}