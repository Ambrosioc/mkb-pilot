'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Tab {
  id: string;
  name: string;
  label: string;
  path: string;
  icon?: string;
}

interface TabsState {
  openTabs: Tab[];
  activeTabId: string | null;
  maxTabs: number;
  openTab: (tab: Omit<Tab, 'id'>) => void;
  closeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  closeAllTabs: () => void;
  isTabOpen: (path: string) => boolean;
  getActiveTab: () => Tab | null;
}

export const useTabsStore = create<TabsState>()(
  persist(
    (set, get) => ({
      openTabs: [],
      activeTabId: null,
      maxTabs: 6,

      openTab: (tabData) => {
        const { openTabs, maxTabs, activeTabId } = get();
        
        // Générer un ID unique basé sur le path
        const tabId = `tab-${tabData.path.replace(/\//g, '-')}`;
        
        // Vérifier si l'onglet existe déjà
        const existingTab = openTabs.find(tab => tab.path === tabData.path);
        
        if (existingTab) {
          // Si l'onglet existe, le rendre actif
          set({ activeTabId: existingTab.id });
          return;
        }
        
        // Si on a atteint la limite, ne pas ajouter de nouvel onglet
        if (openTabs.length >= maxTabs) {
          console.warn(`Maximum de ${maxTabs} onglets atteint`);
          return;
        }
        
        // Créer le nouvel onglet
        const newTab: Tab = {
          id: tabId,
          ...tabData
        };
        
        // Ajouter l'onglet et le rendre actif
        set({
          openTabs: [...openTabs, newTab],
          activeTabId: newTab.id
        });
      },

      closeTab: (tabId) => {
        const { openTabs, activeTabId } = get();
        const updatedTabs = openTabs.filter(tab => tab.id !== tabId);
        
        let newActiveTabId = activeTabId;
        
        // Si on ferme l'onglet actif, activer un autre onglet
        if (activeTabId === tabId) {
          if (updatedTabs.length > 0) {
            // Activer l'onglet précédent ou le premier disponible
            const closedTabIndex = openTabs.findIndex(tab => tab.id === tabId);
            const newIndex = Math.max(0, closedTabIndex - 1);
            newActiveTabId = updatedTabs[newIndex]?.id || null;
          } else {
            newActiveTabId = null;
          }
        }
        
        set({
          openTabs: updatedTabs,
          activeTabId: newActiveTabId
        });
      },

      setActiveTab: (tabId) => {
        const { openTabs } = get();
        const tabExists = openTabs.some(tab => tab.id === tabId);
        
        if (tabExists) {
          set({ activeTabId: tabId });
        }
      },

      closeAllTabs: () => {
        set({
          openTabs: [],
          activeTabId: null
        });
      },

      isTabOpen: (path) => {
        const { openTabs } = get();
        return openTabs.some(tab => tab.path === path);
      },

      getActiveTab: () => {
        const { openTabs, activeTabId } = get();
        return openTabs.find(tab => tab.id === activeTabId) || null;
      }
    }),
    {
      name: 'mkb-tabs-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        openTabs: state.openTabs,
        activeTabId: state.activeTabId
      }),
    }
  )
);