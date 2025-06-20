'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuth';
import { useRouter, usePathname } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { Topbar } from '@/components/Topbar';
import { TabBar } from '@/components/ui/TabBar';
import { TabRenderer } from '@/components/ui/TabRenderer';
import { motion } from 'framer-motion';
import { useTabsStore } from '@/store/useTabsStore';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, initialized } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { openTabs, activeTabId, openTab, isTabOpen } = useTabsStore();

  useEffect(() => {
    if (initialized && !user) {
      router.push('/login');
    }
  }, [user, initialized, router]);

  // Synchroniser l'URL avec les onglets - SEULEMENT si l'onglet n'existe pas déjà
  useEffect(() => {
    if (pathname && pathname !== '/dashboard' && !isTabOpen(pathname)) {
      // Créer automatiquement un onglet pour la page actuelle si elle n'existe pas
      const pathSegments = pathname.split('/').filter(Boolean);
      const pageName = pathSegments[pathSegments.length - 1];
      
      // Créer un label plus lisible basé sur le path
      let pageLabel = pageName.charAt(0).toUpperCase() + pageName.slice(1).replace(/-/g, ' ');
      
      // Cas spéciaux pour des labels plus appropriés
      if (pathname.includes('/pricing/angola/add')) {
        pageLabel = 'Ajouter véhicule';
      } else if (pathname.includes('/pricing/angola')) {
        pageLabel = 'Pricing Angola';
      } else if (pathname.includes('/dashboard/acsg')) {
        pageLabel = 'ACSG';
      } else if (pathname.includes('/dashboard/commercial')) {
        pageLabel = 'Commercial';
      }
      
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
}