'use client';

import { useTabsStore } from '@/store/useTabsStore';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';

// Import dynamique de la page d'accueil
const HomePage = dynamic(() => import('@/app/dashboard/page'), { ssr: false });

// Modules centraux
const StockPage = dynamic(() => import('@/app/dashboard/stock/page'), { ssr: false });
const ContactsPage = dynamic(() => import('@/app/dashboard/contacts/page'), { ssr: false });

// Pôles principaux
const CommercialPage = dynamic(() => import('@/app/dashboard/commercial/page'), { ssr: false });
const TransportPage = dynamic(() => import('@/app/dashboard/transport/page'), { ssr: false });
const PricingAngolaPage = dynamic(() => import('@/app/dashboard/pricing/angola/page'), { ssr: false });
const ACSGPage = dynamic(() => import('@/app/dashboard/acsg/page'), { ssr: false });
const MarketingPage = dynamic(() => import('@/app/dashboard/marketing/page'), { ssr: false });
const TechniquePage = dynamic(() => import('@/app/dashboard/technique/page'), { ssr: false });
const ITPage = dynamic(() => import('@/app/dashboard/it/page'), { ssr: false });
const EntretienPage = dynamic(() => import('@/app/dashboard/entretien/page'), { ssr: false });
const CoordinationPage = dynamic(() => import('@/app/dashboard/coordination/page'), { ssr: false });

// Direction Générale
const DirectionPage = dynamic(() => import('@/app/dashboard/direction/page'), { ssr: false });
const DirectionGeneralePage = dynamic(() => import('@/app/dashboard/direction-generale/page'), { ssr: false });
const StatistiquesPage = dynamic(() => import('@/app/dashboard/direction/statistiques/page'), { ssr: false });
const PerformancesPage = dynamic(() => import('@/app/dashboard/direction/performances/page'), { ssr: false });
const DirecteursPage = dynamic(() => import('@/app/dashboard/direction/directeurs/page'), { ssr: false });
const RapportsPage = dynamic(() => import('@/app/dashboard/direction/rapports/page'), { ssr: false });
const DocumentsPage = dynamic(() => import('@/app/dashboard/direction/documents/page'), { ssr: false });
const FinancesPage = dynamic(() => import('@/app/dashboard/direction/finances/page'), { ssr: false });

// Administration
const AdministrationPage = dynamic(() => import('@/app/dashboard/direction/administration/page'), { ssr: false });
const UtilisateursPage = dynamic(() => import('@/app/dashboard/direction/administration/utilisateurs/page'), { ssr: false });
const RolesPage = dynamic(() => import('@/app/dashboard/direction/administration/roles/page'), { ssr: false });
const LogsPage = dynamic(() => import('@/app/dashboard/direction/administration/logs/page'), { ssr: false });
const HistoriqueAccesPage = dynamic(() => import('@/app/dashboard/direction/administration/historique-acces/page'), { ssr: false });
const ParametresPage = dynamic(() => import('@/app/dashboard/direction/administration/parametres/page'), { ssr: false });

// Profil
const ProfilePage = dynamic(() => import('@/app/dashboard/profile/page'), { ssr: false });

export function TabRenderer() {
  const { openTabs, activeTabId } = useTabsStore();

  // Si aucun onglet n'est ouvert, afficher la page d'accueil
  if (openTabs.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="h-full"
      >
        <HomePage />
      </motion.div>
    );
  }

  // Trouver l'onglet actif
  const activeTab = openTabs.find(tab => tab.id === activeTabId);

  if (!activeTab) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-600 mb-2">Aucun onglet sélectionné</h2>
          <p className="text-gray-500">Sélectionnez un onglet pour commencer</p>
        </div>
      </div>
    );
  }

  // Fonction pour rendre le contenu basé sur le path
  const renderTabContent = (path: string) => {
    switch (path) {
      // Page d'accueil
      case '/dashboard':
        return <HomePage />;

      // Modules centraux
      case '/dashboard/stock':
        return <StockPage />;
      case '/dashboard/contacts':
        return <ContactsPage />;

      // Pôles principaux
      case '/dashboard/commercial':
        return <CommercialPage />;
      case '/dashboard/transport':
        return <TransportPage />;
      case '/dashboard/pricing/angola':
        return <PricingAngolaPage />;
      case '/dashboard/acsg':
        return <ACSGPage />;
      case '/dashboard/marketing':
        return <MarketingPage />;
      case '/dashboard/technique':
        return <TechniquePage />;
      case '/dashboard/it':
        return <ITPage />;
      case '/dashboard/entretien':
        return <EntretienPage />;
      case '/dashboard/coordination':
        return <CoordinationPage />;

      // Direction Générale
      case '/dashboard/direction':
        return <DirectionPage />;
      case '/dashboard/direction-generale':
        return <DirectionGeneralePage />;
      case '/dashboard/direction/statistiques':
        return <StatistiquesPage />;
      case '/dashboard/direction/performances':
        return <PerformancesPage />;
      case '/dashboard/direction/directeurs':
        return <DirecteursPage />;
      case '/dashboard/direction/rapports':
        return <RapportsPage />;
      case '/dashboard/direction/documents':
        return <DocumentsPage />;
      case '/dashboard/direction/finances':
        return <FinancesPage />;

      // Administration
      case '/dashboard/direction/administration':
      case '/dashboard/administration':
        return <AdministrationPage />;
      case '/dashboard/direction/administration/utilisateurs':
        return <UtilisateursPage />;
      case '/dashboard/direction/administration/roles':
        return <RolesPage />;
      case '/dashboard/direction/administration/logs':
        return <LogsPage />;
      case '/dashboard/direction/administration/historique-acces':
        return <HistoriqueAccesPage />;
      case '/dashboard/direction/administration/parametres':
        return <ParametresPage />;

      // Profil
      case '/dashboard/profile':
        return <ProfilePage />;

      // Page par défaut pour les paths non reconnus
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-red-600 mb-2">Page non trouvée</h2>
              <p className="text-gray-600">Le chemin &quot;{path}&quot; n&apos;est pas reconnu.</p>
              <p className="text-sm text-gray-400">
                Vérifiez que la page existe ou contactez l'administrateur.
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <motion.div
      key={activeTab.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      {renderTabContent(activeTab.path)}
    </motion.div>
  );
}