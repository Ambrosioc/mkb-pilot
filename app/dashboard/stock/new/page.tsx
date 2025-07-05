'use client';

import { withPoleAccess } from '@/components/auth/withPoleAccess';
import { VehicleStockForm } from '@/components/forms/VehicleStockForm';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowLeft, Car } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

function NewVehiclePageContent() {
    const router = useRouter();

    const handleSuccess = () => {
        // Option 1: Rediriger vers la liste du stock
        router.push('/dashboard/stock');

        // Option 2: Proposer d'ajouter un autre véhicule
        // Le formulaire se réinitialise automatiquement
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
                            Créer une nouvelle fiche véhicule pour le stock
                        </p>
                    </div>
                </div>
                <div>
                    <Link href="/dashboard/stock">
                        <Button variant="outline">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Retour au stock
                        </Button>
                    </Link>
                </div>
            </motion.div>

            {/* Form */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
            >
                <VehicleStockForm
                    onSuccess={handleSuccess}
                    onCancel={() => router.push('/dashboard/stock')}
                />
            </motion.div>
        </div>
    );
}

export default withPoleAccess(NewVehiclePageContent, {
    poleName: 'Stock',
    requiredAccess: 'write'
}); 