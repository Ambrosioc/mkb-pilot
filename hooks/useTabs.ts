import { useTabsStore } from '@/store/useTabsStore';
import type { Tab } from '@/types';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

export function useTabs() {
  const {
    openTabs,
    activeTabId,
    maxTabs,
    openTab,
    closeTab,
    setActiveTab,
    closeAllTabs,
    isTabOpen,
    getActiveTab
  } = useTabsStore();
  
  const router = useRouter();

  const navigateToTab = useCallback((tab: Tab) => {
    const tabData: Omit<Tab, 'id'> = {
      name: tab.name,
      label: tab.label,
      path: tab.path
    };
    
    if (tab.icon) {
      tabData.icon = tab.icon;
    }
    
    openTab(tabData);
    router.push(tab.path);
  }, [openTab, router]);

  const closeTabAndNavigate = useCallback((tabId: string) => {
    const tab = openTabs.find(t => t.id === tabId);
    closeTab(tabId);
    
    // Naviguer vers l'onglet actif ou le dashboard
    const activeTab = getActiveTab();
    if (activeTab) {
      router.push(activeTab.path);
    } else {
      router.push('/dashboard');
    }
  }, [openTabs, closeTab, getActiveTab, router]);

  const canOpenNewTab = openTabs.length < maxTabs;
  const activeTab = getActiveTab();

  return {
    openTabs,
    activeTabId,
    activeTab,
    maxTabs,
    canOpenNewTab,
    openTab,
    closeTab,
    setActiveTab,
    closeAllTabs,
    isTabOpen,
    getActiveTab,
    navigateToTab,
    closeTabAndNavigate
  };
} 