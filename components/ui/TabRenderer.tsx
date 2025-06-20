'use client';

import { useTabsStore } from '@/store/useTabsStore';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';

// Import dynamique des pages principales
const DashboardPage = dynamic(() => import('@/app/dashboard/page'), { ssr: false });
const ProfilePage = dynamic(() => import('@/app/dashboard/profile/page'), { ssr: false });

// Import dynamique des modules centraux
const StockPage = dynamic(() => import('@/app/dashboard/stock/page'), { ssr: false });
const ContactsPage = dynamic(() => import('@/app/dashboard/contacts/page'), { ssr: false });

// Import dynamique des pôles
const CommercialPage = dynamic(() => import('@/app/dashboard/commercial/page'), { ssr: false });
const TransportPage = dynamic(() => import('@/app/dashboard/transport/page'), { ssr: false });
const PricingAngolaPage = dynamic(() => import('@/app/dashboard/pricing/angola/page'), { ssr: false });
const ACSGPage = dynamic(() => import('@/app/dashboard/acsg/page'), { ssr: false });
const MarketingPage = dynamic(() => import('@/app/dashboard/marketing/page'), { ssr: false });
const TechniquePage = dynamic(() => import('@/app/dashboard/technique/page'), { ssr: false });
const ITPage = dynamic(() => import('@/app/dashboard/it/page'), { ssr: false });
const EntretienPage = dynamic(() => import('@/app/dashboard/entretien/page'), { ssr: false });
const CoordinationPage = dynamic(() => import('@/app/dashboard/coordination/page'), { ssr: false });

// Import dynamique des pages Direction Générale
const DirectionPage = dynamic(() => import('@/app/dashboard/direction/page'), { ssr: false });
const DirectionGeneralePage = dynamic(() => import('@/app/dashboard/direction-generale/page'), { ssr: false });
const StatistiquesPage = dynamic(() => import('@/app/dashboard/direction/statistiques/page'), { ssr: false });
const PerformancesPage = dynamic(() => import('@/app/dashboard/direction/performances/page'), { ssr: false });
const DirecteursPage = dynamic(() => import('@/app/dashboard/direction/directeurs/page'), { ssr: false });
const RapportsPage = dynamic(() => import('@/app/dashboard/direction/rapports/page'), { ssr: false });
const DocumentsPage = dynamic(() => import('@/app/dashboard/direction/documents/page'), { ssr: false });
const FinancesPage = dynamic(() => import('@/app/dashboard/direction/finances/page'), { ssr: false });

// Import dynamique des pages Administration
const AdministrationPage = dynamic(() => import('@/app/dashboard/direction/administration/page'), { ssr: false });
const UtilisateursPage = dynamic(() => import('@/app/dashboard/direction/administration/utilisateurs/page'), { ssr: false });
const RolesPage = dynamic(() => import('@/app/dashboard/direction/administration/roles/page'), { ssr: false });
const LogsPage = dynamic(() => import('@/app/dashboard/direction/administration/logs/page'), { ssr: false });
const HistoriqueAccesPage = dynamic(() => import('@/app/dashboard/direction/administration/historique-acces/page'), { ssr: false });
const ParametresPage = dynamic(() => import('@/app/dashboard/direction/administration/parametres/page'), { ssr: false });

export function TabRenderer() {
  const { openTabs, activeTabId } = useTabsStore();
  const activeTab = openTabs.find(tab => tab.id === activeTabId);

  if (!activeTab) {
    return null;
  }

  const renderTabContent = () => {
    // Normaliser le path pour la comparaison
    const path = activeTab.path;

    // Pages principales
    if (path === '/dashboard') return <DashboardPage />;
    if (path === '/dashboard/profile') return <ProfilePage />;

    // Modules centraux
    if (path === '/dashboard/stock') return <StockPage />;
    if (path === '/dashboard/contacts') return <ContactsPage />;

    // Pôles principaux
    if (path === '/dashboard/commercial') return <CommercialPage />;
    if (path === '/dashboard/transport') return <TransportPage />;
    if (path === '/dashboard/pricing/angola') return <PricingAngolaPage />;
    if (path === '/dashboard/acsg') return <ACSGPage />;
    if (path === '/dashboard/marketing') return <MarketingPage />;
    if (path === '/dashboard/technique') return <TechniquePage />;
    if (path === '/dashboard/it') return <ITPage />;
    if (path === '/dashboard/entretien') return <EntretienPage />;
    if (path === '/dashboard/coordination') return <CoordinationPage />;

    // Direction Générale
    if (path === '/dashboard/direction') return <DirectionPage />;
    if (path === '/dashboard/direction-generale') return <DirectionGeneralePage />;
    if (path === '/dashboard/direction/statistiques') return <StatistiquesPage />;
    if (path === '/dashboard/direction/performances') return <PerformancesPage />;
    if (path === '/dashboard/direction/directeurs') return <DirecteursPage />;
    if (path === '/dashboard/direction/rapports') return <RapportsPage />;
    if (path === '/dashboard/direction/documents') return <DocumentsPage />;
    if (path === '/dashboard/direction/finances') return <FinancesPage />;

    // Administration
    if (path === '/dashboard/direction/administration' || path === '/dashboard/administration') return <AdministrationPage />;
    if (path === '/dashboard/direction/administration/utilisateurs') return <UtilisateursPage />;
    if (path === '/dashboard/direction/administration/roles') return <RolesPage />;
    if (path === '/dashboard/direction/administration/logs') return <LogsPage />;
    if (path === '/dashboard/direction/administration/historique-acces') return <HistoriqueAccesPage />;
    if (path === '/dashboard/direction/administration/parametres') return <ParametresPage />;

    // Page par défaut si aucune correspondance
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Page non trouvée</h2>
          <p className="text-gray-600">Le chemin &quot;{path}&quot; n&apos;est pas reconnu.</p>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      key={activeTab.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      {renderTabContent()}
    </motion.div>
  );
}