'use client';

import { useTabsStore } from '@/store/useTabsStore';
import dynamic from 'next/dynamic';
import React, { useMemo } from 'react';

// Import dynamique des composants pour éviter les problèmes de hydration
const DashboardPage = dynamic(() => import('@/app/dashboard/page'), { ssr: false });
const CommercialPage = dynamic(() => import('@/app/dashboard/commercial/page'), { ssr: false });
const TransportPage = dynamic(() => import('@/app/dashboard/transport/page'), { ssr: false });
const PricingAngolaPage = dynamic(() => import('@/app/dashboard/pricing/angola/page'), { ssr: false });
const ACSGPage = dynamic(() => import('@/app/dashboard/acsg/page'), { ssr: false });
const MarketingPage = dynamic(() => import('@/app/dashboard/marketing/page'), { ssr: false });
const TechniquePage = dynamic(() => import('@/app/dashboard/technique/page'), { ssr: false });
const ITPage = dynamic(() => import('@/app/dashboard/it/page'), { ssr: false });
const EntretienPage = dynamic(() => import('@/app/dashboard/entretien/page'), { ssr: false });
const CoordinationPage = dynamic(() => import('@/app/dashboard/coordination/page'), { ssr: false });
const DirectionGeneralePage = dynamic(() => import('@/app/dashboard/direction-generale/page'), { ssr: false });
const DirectionPage = dynamic(() => import('@/app/dashboard/direction/page'), { ssr: false });
const StatistiquesPage = dynamic(() => import('@/app/dashboard/direction/statistiques/page'), { ssr: false });
const PerformancesPage = dynamic(() => import('@/app/dashboard/direction/performances/page'), { ssr: false });
const DirecteursPage = dynamic(() => import('@/app/dashboard/direction/directeurs/page'), { ssr: false });
const RapportsPage = dynamic(() => import('@/app/dashboard/direction/rapports/page'), { ssr: false });
const DocumentsPage = dynamic(() => import('@/app/dashboard/direction/documents/page'), { ssr: false });
const FinancesPage = dynamic(() => import('@/app/dashboard/direction/finances/page'), { ssr: false });
const AdministrationPage = dynamic(() => import('@/app/dashboard/direction/administration/page'), { ssr: false });
const UtilisateursPage = dynamic(() => import('@/app/dashboard/direction/administration/utilisateurs/page'), { ssr: false });
const RolesPage = dynamic(() => import('@/app/dashboard/direction/administration/roles/page'), { ssr: false });
const LogsPage = dynamic(() => import('@/app/dashboard/direction/administration/logs/page'), { ssr: false });
const HistoriqueAccesPage = dynamic(() => import('@/app/dashboard/direction/administration/historique-acces/page'), { ssr: false });
const ParametresPage = dynamic(() => import('@/app/dashboard/direction/administration/parametres/page'), { ssr: false });
const ProfilePage = dynamic(() => import('@/app/dashboard/profile/page'), { ssr: false });

export function TabRenderer() {
  const { getActiveTab } = useTabsStore();
  const activeTab = getActiveTab();

  const ComponentToRender = useMemo(() => {
    if (!activeTab) return null;

    // Mapping des paths vers les composants
    const pathComponentMap: Record<string, React.ComponentType> = {
      '/dashboard': DashboardPage,
      '/dashboard/commercial': CommercialPage,
      '/dashboard/transport': TransportPage,
      '/dashboard/pricing/angola': PricingAngolaPage,
      '/dashboard/acsg': ACSGPage,
      '/dashboard/marketing': MarketingPage,
      '/dashboard/technique': TechniquePage,
      '/dashboard/it': ITPage,
      '/dashboard/entretien': EntretienPage,
      '/dashboard/coordination': CoordinationPage,
      '/dashboard/direction-generale': DirectionGeneralePage,
      '/dashboard/direction': DirectionPage,
      '/dashboard/direction/statistiques': StatistiquesPage,
      '/dashboard/direction/performances': PerformancesPage,
      '/dashboard/direction/directeurs': DirecteursPage,
      '/dashboard/direction/rapports': RapportsPage,
      '/dashboard/direction/documents': DocumentsPage,
      '/dashboard/direction/finances': FinancesPage,
      '/dashboard/direction/administration': AdministrationPage,
      '/dashboard/direction/administration/utilisateurs': UtilisateursPage,
      '/dashboard/direction/administration/roles': RolesPage,
      '/dashboard/direction/administration/logs': LogsPage,
      '/dashboard/direction/administration/historique-acces': HistoriqueAccesPage,
      '/dashboard/direction/administration/parametres': ParametresPage,
      '/dashboard/profile': ProfilePage,
    };

    return pathComponentMap[activeTab.path] || null;
  }, [activeTab]);

  if (!activeTab || !ComponentToRender) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-600 mb-2">
            Page non trouvée
          </h2>
          <p className="text-gray-500">
            {activeTab ? `Le chemin "${activeTab.path}" n'est pas reconnu.` : 'Aucun onglet actif.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div key={activeTab.id} className="h-full">
      <ComponentToRender />
    </div>
  );
}