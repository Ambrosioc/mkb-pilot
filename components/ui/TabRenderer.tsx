'use client';

import { useTabsStore } from '@/store/useTabsStore';
import { motion } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function TabRenderer() {
    const router = useRouter();
    const pathname = usePathname();
    const { getActiveTab, openTabs, activeTabId } = useTabsStore();

    const activeTab = getActiveTab();

    // Synchroniser l'URL avec l'onglet actif
    useEffect(() => {
        if (activeTab && activeTab.path !== pathname) {
            router.push(activeTab.path);
        }
    }, [activeTab, pathname, router]);

    // Si aucun onglet n'est ouvert, afficher un message d'accueil
    if (!activeTab || openTabs.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex-1 flex items-center justify-center bg-gray-50"
            >
                <div className="text-center space-y-4 max-w-md">
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <div className="bg-mkb-blue text-white px-4 py-3 rounded-xl text-2xl font-bold">
                            MKB
                        </div>
                        <span className="text-mkb-blue text-2xl font-semibold">Pilot</span>
                    </div>

                    <h2 className="text-2xl font-bold text-mkb-black mb-2">
                        Bienvenue sur votre dashboard
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Sélectionnez un élément dans la sidebar pour commencer à naviguer.
                        Vos onglets s'ouvriront automatiquement ici.
                    </p>

                    <div className="bg-mkb-blue/5 border border-mkb-blue/20 rounded-lg p-4">
                        <h3 className="font-semibold text-mkb-blue mb-2">💡 Astuce</h3>
                        <p className="text-sm text-gray-700">
                            Vous pouvez ouvrir jusqu'à 6 onglets simultanément.
                            Cliquez sur l'icône ✕ pour fermer un onglet.
                        </p>
                    </div>
                </div>
            </motion.div>
        );
    }

    // Le contenu de la page sera rendu par Next.js via le routing
    // Ce composant sert principalement à synchroniser l'état des onglets avec l'URL
    return null;
}