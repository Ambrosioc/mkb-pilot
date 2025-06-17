'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useTabsStore } from '@/store/useTabsStore';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function TabBar() {
  const { openTabs, activeTabId, setActiveTab, closeTab } = useTabsStore();

  if (openTabs.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border-b border-gray-200 px-6">
      <div className="flex items-center gap-1 overflow-x-auto">
        <AnimatePresence mode="popLayout">
          {openTabs.map((tab) => {
            const isActive = tab.id === activeTabId;
            
            return (
              <motion.div
                key={tab.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 border-b-2 transition-all duration-200 group min-w-0 max-w-48",
                  isActive
                    ? "border-mkb-blue bg-mkb-blue/5 text-mkb-blue"
                    : "border-transparent hover:bg-gray-50 text-gray-600 hover:text-gray-900"
                )}
              >
                <button
                  onClick={() => setActiveTab(tab.id)}
                  className="flex-1 text-left truncate text-sm font-medium min-w-0"
                  title={tab.label}
                >
                  {tab.label}
                </button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTab(tab.id);
                  }}
                  className={cn(
                    "h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-200",
                    isActive && "opacity-100"
                  )}
                >
                  <X className="h-3 w-3" />
                </Button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}