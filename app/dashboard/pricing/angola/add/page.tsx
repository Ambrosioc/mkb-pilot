'use client';

import { VehicleAngolaForm } from '@/components/forms/VehicleAngolaForm';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowLeft, Car } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AddVehiclePage() {
    const router = useRouter();

    const handleSuccess = () => {
        router.push('/dashboard/pricing/angola');
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
            <VehicleAngolaForm
                onSuccess={handleSuccess}
                onCancel={() => router.push('/dashboard/pricing/angola')}
            />
        </div>
    );
}