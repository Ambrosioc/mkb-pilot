'use client';

import { Sidebar } from '@/components/Sidebar';
import { Topbar } from '@/components/Topbar';
import { TabBar } from '@/components/ui/TabBar';
import { TabRenderer } from '@/components/ui/TabRenderer';
import { useAuth } from '@/hooks/useAuth';
import { useTabs } from '@/hooks/useTabs';
import { motion } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import React, { memo, useEffect, useState } from 'react';

const DashboardLayout = memo(({ children }: { children: React.ReactNode }) => {
  const { user, initialized } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { openTab, isTabOpen } = useTabs();

  useEffect(() => {
    if (initialized && !user) {
      router.push('/login');
    }
  }, [user, initialized, router]);

  // Synchroniser l'URL avec les onglets
  useEffect(() => {
    if (pathname && pathname !== '/dashboard' && !isTabOpen(pathname)) {
      const pathSegments = pathname.split('/').filter(Boolean);
      const pageName = pathSegments[pathSegments.length - 1];

      if (!pageName) return;

      // Créer un label plus lisible basé sur le path
      let pageLabel = pageName.charAt(0).toUpperCase() + pageName.slice(1).replace(/-/g, ' ');

      // Cas spéciaux pour des labels plus appropriés
      const labelMappings: Record<string, string> = {
        '/pricing/angola/add': 'Ajouter véhicule',
        '/pricing/angola': 'Pricing Angola',
        '/dashboard/acsg': 'ACSG',
        '/dashboard/commercial': 'Commercial',
        '/dashboard/direction': 'Direction',
        '/dashboard/marketing': 'Marketing',
        '/dashboard/technique': 'Technique',
        '/dashboard/it': 'IT',
        '/dashboard/entretien': 'Entretien',
        '/dashboard/coordination': 'Coordination',
        '/dashboard/transport': 'Transport',
        '/dashboard/stock': 'Stock',
        '/dashboard/contacts': 'Contacts',
      };

      pageLabel = labelMappings[pathname] || pageLabel;

      openTab({
        name: pageName,
        label: pageLabel,
        path: pathname
      });
    }
  }, [pathname, openTab, isTabOpen]);

  if (!initialized) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-mkb-blue"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <TabBar />

        <motion.main
          className="flex-1 overflow-y-auto p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <TabRenderer />
        </motion.main>
      </div>
    </div>
  );
});

DashboardLayout.displayName = 'DashboardLayout';

export default DashboardLayout;