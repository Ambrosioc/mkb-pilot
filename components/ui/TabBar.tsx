'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTabsStore } from '@/store/useTabsStore';
import { AnimatePresence, motion } from 'framer-motion';
import { Chrome as Broom, Code, Crown, FileText, Globe, Home, Link2, Megaphone, Server, ShoppingCart, Tag, Truck, X } from 'lucide-react';

// Mapping des icônes pour chaque route
const getIconForPath = (path: string) => {
    if (path === '/dashboard') return Home;
    if (path.includes('/commercial')) return ShoppingCart;
    if (path.includes('/transport')) return Truck;
    if (path.includes('/pricing')) return Tag;
    if (path.includes('/acsg')) return FileText;
    if (path.includes('/marketing')) return Megaphone;
    if (path.includes('/technique')) return Code;
    if (path.includes('/it')) return Server;
    if (path.includes('/entretien')) return Broom;
    if (path.includes('/coordination')) return Link2;
    if (path.includes('/direction')) return Crown;
    if (path.includes('/angola')) return Globe;
    return Home;
};

export function TabBar() {
    const { openTabs, activeTabId, setActiveTab, closeTab } = useTabsStore();

    if (openTabs.length === 0) {
        return null;
    }

    return (
        <div className="bg-white border-b border-gray-200 px-6">
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
                <AnimatePresence mode="popLayout">
                    {openTabs.map((tab, index) => {
                        const isActive = tab.id === activeTabId;
                        const Icon = getIconForPath(tab.path);

                        return (
                            <motion.div
                                key={tab.id}
                                initial={{ opacity: 0, x: 20, scale: 0.9 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, x: -20, scale: 0.9 }}
                                transition={{
                                    duration: 0.2,
                                    delay: index * 0.05
                                }}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-3 border-b-2 transition-all duration-200 cursor-pointer group relative min-w-0 max-w-[200px]",
                                    isActive
                                        ? "border-mkb-blue bg-mkb-blue/5 text-mkb-blue"
                                        : "border-transparent hover:bg-gray-50 hover:border-gray-200 text-gray-600"
                                )}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                {/* Icône */}
                                <Icon className="h-4 w-4 flex-shrink-0" />

                                {/* Label avec ellipsis */}
                                <span className="font-medium text-sm truncate flex-1 min-w-0">
                                    {tab.label}
                                </span>

                                {/* Bouton fermer */}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={cn(
                                        "h-5 w-5 p-0 opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-600 transition-all duration-200 flex-shrink-0",
                                        isActive && "opacity-70"
                                    )}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        closeTab(tab.id);
                                    }}
                                >
                                    <X className="h-3 w-3" />
                                </Button>

                                {/* Indicateur d'onglet actif */}
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTabIndicator"
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-mkb-blue"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

                {/* Indicateur de limite d'onglets */}
                {openTabs.length >= 6 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-2 px-3 py-2 text-xs text-orange-600 bg-orange-50 rounded-md ml-2 flex-shrink-0"
                    >
                        <span>Limite atteinte (6/6)</span>
                    </motion.div>
                )}
            </div>
        </div>
    );
}