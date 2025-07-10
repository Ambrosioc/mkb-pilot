'use client';

import { useTabsStore } from '@/store/useTabsStore';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';

// Import dynamique des pages
const DashboardPage = dynamic(() => import('@/app/dashboard/page'), { ssr: false });
const StockPage = dynamic(() => import('@/app/dashboard/stock/page'), { ssr: false });
const NewStockPage = dynamic(() => import('@/app/dashboard/stock/new/page'), { ssr: false });
const ContactsPage = dynamic(() => import('@/app/dashboard/contacts/page'), { ssr: false });
const CommercialPage = dynamic(() => import('@/app/dashboard/commercial/page'), { ssr: false });
const ACSGPage = dynamic(() => import('@/app/dashboard/acsg/page'), { ssr: false });
const MarketingPage = dynamic(() => import('@/app/dashboard/marketing/page'), { ssr: false });
const TechniquePage = dynamic(() => import('@/app/dashboard/technique/page'), { ssr: false });
const ITPage = dynamic(() => import('@/app/dashboard/it/page'), { ssr: false });
const EntretienPage = dynamic(() => import('@/app/dashboard/entretien/page'), { ssr: false });
const CoordinationPage = dynamic(() => import('@/app/dashboard/coordination/page'), { ssr: false });
const PricingPage = dynamic(() => import('@/app/dashboard/pricing/page'), { ssr: false });
const PricingToPostPage = dynamic(() => import('@/app/dashboard/pricing/to-post/page'), { ssr: false });
const PricingAngolaPage = dynamic(() => import('@/app/dashboard/pricing/angola/page'), { ssr: false });
const PricingAngolaAddPage = dynamic(() => import('@/app/dashboard/pricing/angola/add/page'), { ssr: false });
const DirectionGeneralePage = dynamic(() => import('@/app/dashboard/direction-generale/page'), { ssr: false });
const DirectionPage = dynamic(() => import('@/app/dashboard/direction/page'), { ssr: false });
const ProfilePage = dynamic(() => import('@/app/dashboard/profile/page'), { ssr: false });
const AdministrationPage = dynamic(() => import('@/app/dashboard/direction/administration/page'), { ssr: false });
const LogsPage = dynamic(() => import('@/app/dashboard/direction/administration/logs/page'), { ssr: false });
const HistoriqueAccesPage = dynamic(() => import('@/app/dashboard/direction/administration/historique-acces/page'), { ssr: false });
const ParametresPage = dynamic(() => import('@/app/dashboard/direction/administration/parametres/page'), { ssr: false });
const RolesPage = dynamic(() => import('@/app/dashboard/direction/administration/roles/page'), { ssr: false });
const UtilisateursPage = dynamic(() => import('@/app/dashboard/direction/administration/utilisateurs/page'), { ssr: false });



export function TabRenderer() {
  const { openTabs, activeTabId } = useTabsStore();
  const pathname = usePathname();

  // Si aucun onglet n'est ouvert, afficher la page d'accueil
  if (openTabs.length === 0) {
    return <DashboardPage />;
  }

  // Trouver l'onglet actif
  const activeTab = openTabs.find(tab => tab.id === activeTabId);

  if (!activeTab) {
    return <DashboardPage />;
  }

  // Rendu conditionnel basé sur le chemin de l'onglet actif
  switch (activeTab.path) {
    case '/dashboard':
      return <DashboardPage />;
    case '/dashboard/stock':
      return <StockPage />;
    case '/dashboard/stock/new':
      return <NewStockPage />;
    case '/dashboard/contacts':
      return <ContactsPage />;
    case '/dashboard/commercial':
      return <CommercialPage />;
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
    case '/dashboard/pricing':
      return <PricingPage />;
    case '/dashboard/pricing/to-post':
      return <PricingToPostPage />;
    case '/dashboard/pricing/angola':
      return <PricingAngolaPage />;
    case '/dashboard/pricing/angola/add':
      return <PricingAngolaAddPage />;
    case '/dashboard/direction-generale':
      return <DirectionGeneralePage />;
    case '/dashboard/direction':
      return <DirectionPage />;
    case '/dashboard/profile':
      return <ProfilePage />;
    case '/dashboard/direction/administration':
      return <AdministrationPage />;
    case '/dashboard/direction/administration/roles':
      return <RolesPage />;
    case '/dashboard/direction/administration/utilisateurs':
      return <UtilisateursPage />;
    case '/dashboard/direction/administration/logs':
      return <LogsPage />;
    case '/dashboard/direction/administration/historique-acces':
      return <HistoriqueAccesPage />;
    case '/dashboard/direction/administration/parametres':
      return <ParametresPage />;
    default:
      // Fallback pour les chemins non gérés
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">Page non trouvée: {activeTab.path}</p>
        </div>
      );
  }
}