'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, ShoppingCart, Tag, FileText, Megaphone, Code, Server, 
  Chrome as Broom, Link2, Crown, TrendingUp, BarChart3, Users, 
  Calendar, Phone, Target, Package, DollarSign, Clock, UserCheck, 
  Building2, MessageSquare, Zap, Shield, Settings, ChevronLeft,
  Truck, MapPin, History, Handshake, Globe
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useTabsStore } from '@/store/useTabsStore';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

interface MenuItem {
  title: string;
  icon: React.ComponentType<any>;
  href?: string;
  children?: MenuItem[];
}

const navigationItems: MenuItem[] = [
  {
    title: 'Accueil',
    icon: Home,
    href: '/dashboard',
  },
  // Modules Centraux
  {
    title: 'Stock',
    icon: Package,
    href: '/dashboard/stock',
  },
  {
    title: 'Contacts',
    icon: Users,
    href: '/dashboard/contacts',
  },
  {
    title: 'Pôle Direction Générale',
    icon: Crown,
    children: [
      {
        title: 'Statistiques',
        icon: BarChart3,
        href: '/dashboard/direction/statistiques',
      },
      {
        title: 'Performances',
        icon: TrendingUp,
        href: '/dashboard/direction/performances',
      },
      {
        title: 'Directeurs G4',
        icon: Users,
        href: '/dashboard/direction/directeurs',
      },
      {
        title: 'Rapports',
        icon: Calendar,
        href: '/dashboard/direction/rapports',
      },
      {
        title: 'Documents',
        icon: FileText,
        href: '/dashboard/direction/documents',
      },
      {
        title: 'Finances',
        icon: DollarSign,
        href: '/dashboard/direction/finances',
      },
      {
        title: 'Administration',
        icon: Settings,
        href: '/dashboard/administration',
        children: [
          {
            title: 'Utilisateurs',
            icon: Users,
            href: '/dashboard/direction/administration/utilisateurs',
          },
          {
            title: 'Rôles',
            icon: Shield,
            href: '/dashboard/direction/administration/roles',
          },
          {
            title: 'Logs',
            icon: FileText,
            href: '/dashboard/direction/administration/logs',
          },
          {
            title: 'Historique Accès',
            icon: Clock,
            href: '/dashboard/direction/administration/historique-acces',
          },
          {
            title: 'Paramètres',
            icon: Settings,
            href: '/dashboard/direction/administration/parametres',
          },
        ],
      },
    ],
  },
  {
    title: 'Pôle Commercial',
    icon: ShoppingCart,
    href: '/dashboard/commercial',
    children: [
      {
        title: 'Vente B2C',
        icon: Users,
        children: [
          {
            title: 'Leads & RDV',
            icon: Calendar,
            href: '/dashboard/commercial/b2c/leads-rdv',
          },
          {
            title: 'Relances commerciales',
            icon: Phone,
            href: '/dashboard/commercial/b2c/relances',
          },
          {
            title: 'Classement vendeurs',
            icon: Target,
            href: '/dashboard/commercial/b2c/classement',
          },
          {
            title: 'Ventes mensuelles',
            icon: BarChart3,
            href: '/dashboard/commercial/b2c/ventes',
          },
          {
            title: 'Pipeline',
            icon: TrendingUp,
            href: '/dashboard/commercial/b2c/pipeline',
          },
        ],
      },
      {
        title: 'Achats / Reprises / Dépôt-Vente',
        icon: Package,
        children: [
          {
            title: 'Véhicules repris',
            icon: Package,
            href: '/dashboard/commercial/achats/vehicules-repris',
          },
          {
            title: 'Rentabilité',
            icon: DollarSign,
            href: '/dashboard/commercial/achats/rentabilite',
          },
          {
            title: 'Délais mise en vente',
            icon: Clock,
            href: '/dashboard/commercial/achats/delais',
          },
          {
            title: 'Relation vendeurs',
            icon: UserCheck,
            href: '/dashboard/commercial/achats/relation-vendeurs',
          },
        ],
      },
      {
        title: 'Remarketing – B2B',
        icon: Building2,
        children: [
          {
            title: 'Marchands actifs/inactifs',
            icon: Users,
            href: '/dashboard/commercial/b2b/marchands',
          },
          {
            title: 'Relances B2B',
            icon: Phone,
            href: '/dashboard/commercial/b2b/relances',
          },
          {
            title: 'Propositions / diffusion',
            icon: MessageSquare,
            href: '/dashboard/commercial/b2b/propositions',
          },
          {
            title: 'Stocks partenaires',
            icon: Package,
            href: '/dashboard/commercial/b2b/stocks',
          },
          {
            title: 'Satisfaction marchands',
            icon: Target,
            href: '/dashboard/commercial/b2b/satisfaction',
          },
        ],
      },
    ],
  },
  {
    title: 'Pôle Transport',
    icon: Truck,
    href: '/dashboard/transport',
    children: [
      {
        title: 'Suivi des livraisons',
        icon: Package,
        href: '/dashboard/transport',
      },
      {
        title: 'Planning des chauffeurs',
        icon: Calendar,
        href: '/dashboard/transport',
      },
      {
        title: 'Historique des transports',
        icon: History,
        href: '/dashboard/transport',
      },
      {
        title: 'Partenaires logistiques',
        icon: Handshake,
        href: '/dashboard/transport',
      },
    ],
  },
  {
    title: 'Pôle Pricing',
    icon: Tag,
    children: [
      {
        title: 'Angola',
        icon: Globe,
        href: '/dashboard/pricing/angola',
      },
    ],
  },
  {
    title: 'Pôle ACSG',
    icon: FileText,
    href: '/dashboard/acsg',
  },
  {
    title: 'Pôle Marketing',
    icon: Megaphone,
    href: '/dashboard/marketing',
    children: [
      {
        title: 'Campagnes Meta',
        icon: Target,
        href: '/dashboard/marketing/campagnes-meta',
      },
      {
        title: 'Réseaux sociaux',
        icon: MessageSquare,
        href: '/dashboard/marketing/reseaux-sociaux',
      },
      {
        title: 'Stats d\'acquisition',
        icon: BarChart3,
        href: '/dashboard/marketing/stats-acquisition',
      },
    ],
  },
  {
    title: 'Pôle Technique',
    icon: Code,
    href: '/dashboard/technique',
    children: [
      {
        title: 'Mises à jour',
        icon: Zap,
        href: '/dashboard/technique/mises-a-jour',
      },
      {
        title: 'Bugs & support',
        icon: Settings,
        href: '/dashboard/technique/bugs-support',
      },
      {
        title: 'Automatisations',
        icon: Zap,
        href: '/dashboard/technique/automatisations',
      },
      {
        title: 'Sécurité',
        icon: Shield,
        href: '/dashboard/technique/securite',
      },
    ],
  },
  {
    title: 'IT / Réseau',
    icon: Server,
    href: '/dashboard/it',
    children: [
      {
        title: 'Réseau & infra',
        icon: Server,
        href: '/dashboard/it/reseau-infra',
      },
      {
        title: 'Maintenance postes',
        icon: Settings,
        href: '/dashboard/it/maintenance-postes',
      },
      {
        title: 'Optimisation',
        icon: Zap,
        href: '/dashboard/it/optimisation',
      },
    ],
  },
  {
    title: 'Entretien & Services',
    icon: Broom,
    href: '/dashboard/entretien',
    children: [
      {
        title: 'Planning',
        icon: Calendar,
        href: '/dashboard/entretien/planning',
      },
      {
        title: 'Validation',
        icon: UserCheck,
        href: '/dashboard/entretien/validation',
      },
      {
        title: 'État des locaux',
        icon: Building2,
        href: '/dashboard/entretien/etat-locaux',
      },
    ],
  },
  {
    title: 'Coordination des Services',
    icon: Link2,
    href: '/dashboard/coordination',
    children: [
      {
        title: 'Projets transverses',
        icon: Target,
        href: '/dashboard/coordination/projets-transverses',
      },
      {
        title: 'Urgences',
        icon: Zap,
        href: '/dashboard/coordination/urgences',
      },
      {
        title: 'Blocages',
        icon: Shield,
        href: '/dashboard/coordination/blocages',
      },
      {
        title: 'Reporting global',
        icon: BarChart3,
        href: '/dashboard/coordination/reporting-global',
      },
    ],
  },
];

interface MenuItemComponentProps {
  item: MenuItem;
  level: number;
  collapsed: boolean;
  pathname: string;
}

function MenuItemComponent({ item, level, collapsed, pathname }: MenuItemComponentProps) {
  const { openTab, isTabOpen } = useTabsStore();
  const hasChildren = item.children && item.children.length > 0;
  const isActive = item.href === pathname;
  const hasActiveChild = item.children?.some(child => 
    child.href === pathname || 
    child.children?.some(subChild => subChild.href === pathname)
  );

  const Icon = item.icon;
  const paddingLeft = collapsed ? 'pl-3' : `pl-${3 + level * 4}`;

  const handleClick = () => {
    if (item.href) {
      // Vérifier si c'est la page d'accueil
      const isHome = item.href === '/dashboard';
      
      // Vérifier si l'onglet est déjà ouvert
      const tabAlreadyOpen = isTabOpen(item.href);
      
      // Si l'onglet n'est pas déjà ouvert, l'ajouter
      if (!tabAlreadyOpen) {
        openTab({
          name: isHome ? 'home' : item.title.toLowerCase().replace(/\s+/g, '-'),
          label: item.title,
          path: item.href
        });
      }
    }
  };

  // Pour les éléments sans enfants ou les sous-éléments
  if (!hasChildren || level > 0) {
    const content = (
      <div
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 cursor-pointer group",
          paddingLeft,
          isActive 
            ? "bg-[#2bbbdc]/10 border-l-4 border-[#2bbbdc] text-[#2bbbdc] font-medium" 
            : hasActiveChild
            ? "bg-[#2bbbdc]/5 text-[#2bbbdc]"
            : "hover:bg-gray-100 text-gray-700 hover:text-[#2bbbdc]"
        )}
        onClick={handleClick}
      >
        <Icon className="h-5 w-5 flex-shrink-0" />
        
        {!collapsed && (
          <>
            <span className="font-medium text-sm flex-1">{item.title}</span>
            {item.title === 'Administration' && (
              <Badge className="bg-red-100 text-red-800 text-xs px-1.5 py-0.5">
                G4
              </Badge>
            )}
          </>
        )}
      </div>
    );

    return content;
  }

  // Pour les éléments de niveau 0 avec enfants - utiliser l'accordéon
  return null; // Ces éléments seront gérés par l'accordéon principal
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const [openAccordion, setOpenAccordion] = useState<string>('');

  // Déterminer quel accordéon doit être ouvert par défaut basé sur le pathname
  React.useEffect(() => {
    const currentPole = navigationItems.find(item => 
      item.children && (
        item.href === pathname ||
        item.children.some(child => 
          child.href === pathname || 
          child.children?.some(subChild => subChild.href === pathname)
        )
      )
    );
    
    if (currentPole && !collapsed) {
      setOpenAccordion(currentPole.title);
    }
  }, [pathname, collapsed]);

  // Filtrer les éléments pour l'accordéon (niveau 0 avec enfants)
  const accordionItems = navigationItems.filter(item => item.children && item.children.length > 0);
  const simpleItems = navigationItems.filter(item => !item.children || item.children.length === 0);

  return (
    <motion.div
      className={cn(
        "bg-white border-r border-gray-200 h-screen flex flex-col shadow-sm",
        collapsed ? "w-16" : "w-80"
      )}
      animate={{ width: collapsed ? 64 : 320 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-gray-200">
        <motion.div
          className="flex items-center gap-3"
          animate={{ opacity: collapsed ? 0 : 1 }}
          transition={{ duration: 0.2 }}
        >
          {!collapsed && (
            <>
              <div className="bg-[#2bbbdc] text-white px-3 py-2 rounded-lg text-lg font-bold">
                MKB
              </div>
              <span className="text-[#2bbbdc] text-lg font-semibold">Pilot</span>
            </>
          )}
        </motion.div>
        
        <button
          onClick={onToggle}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft 
            className={cn(
              "h-5 w-5 transition-transform duration-300 text-gray-600",
              collapsed && "rotate-180"
            )} 
          />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-1">
          {/* Éléments simples (sans enfants) */}
          {simpleItems.map((item, index) => (
            <MenuItemComponent
              key={index}
              item={item}
              level={0}
              collapsed={collapsed}
              pathname={pathname}
            />
          ))}

          {/* Séparateur pour les modules centraux */}
          {!collapsed && (
            <div className="my-4">
              <div className="h-px bg-gray-200"></div>
              <div className="text-xs text-gray-500 mt-2 px-3 font-medium">MODULES CENTRAUX</div>
            </div>
          )}

          {/* Accordéon pour les éléments avec enfants */}
          {!collapsed && (
            <Accordion 
              type="single" 
              value={openAccordion} 
              onValueChange={setOpenAccordion}
              className="space-y-1"
            >
              {accordionItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = item.href === pathname;
                const hasActiveChild = item.children?.some(child => 
                  child.href === pathname || 
                  child.children?.some(subChild => subChild.href === pathname)
                );

                return (
                  <AccordionItem 
                    key={item.title} 
                    value={item.title}
                    className="border-none"
                  >
                    <AccordionTrigger 
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 hover:no-underline hover:bg-gray-100 [&[data-state=open]]:bg-[#2bbbdc]/5",
                        isActive 
                          ? "bg-[#2bbbdc]/10 border-l-4 border-[#2bbbdc] text-[#2bbbdc] font-medium" 
                          : hasActiveChild
                          ? "bg-[#2bbbdc]/5 text-[#2bbbdc]"
                          : "text-gray-700 hover:text-[#2bbbdc]"
                      )}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <Icon className="h-5 w-5 flex-shrink-0" />
                        <span className="font-medium text-sm">{item.title}</span>
                        {item.title === 'Pôle Direction Générale' && (
                          <Badge className="bg-red-100 text-red-800 text-xs px-1.5 py-0.5">
                            G4
                          </Badge>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-0">
                      <div className="ml-2 border-l border-gray-200 pl-4 space-y-1">
                        {item.children?.map((child, childIndex) => (
                          <div key={childIndex}>
                            <MenuItemComponent
                              item={child}
                              level={1}
                              collapsed={false}
                              pathname={pathname}
                            />
                            {/* Sous-enfants pour les éléments de niveau 2 */}
                            {child.children && (
                              <div className="ml-6 space-y-1 mt-1">
                                {child.children.map((subChild, subIndex) => (
                                  <MenuItemComponent
                                    key={subIndex}
                                    item={subChild}
                                    level={2}
                                    collapsed={false}
                                    pathname={pathname}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          )}

          {/* Version collapsed - afficher seulement les icônes */}
          {collapsed && accordionItems.map((item, index) => (
            <MenuItemComponent
              key={index}
              item={item}
              level={0}
              collapsed={collapsed}
              pathname={pathname}
            />
          ))}
        </div>
      </nav>
    </motion.div>
  );
}