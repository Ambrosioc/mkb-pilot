import type { MenuItem } from '@/types';
import {
  BarChart3,
  Clock,
  Crown,
  DollarSign,
  FileText,
  Globe,
  Home,
  Package,
  Settings,
  Shield,
  Users
} from 'lucide-react';

export const navigationItems: MenuItem[] = [
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
      // {
      //   title: 'Statistiques',
      //   icon: BarChart3,
      //   href: '/dashboard/direction/statistiques',
      // },
      // {
      //   title: 'Performances',
      //   icon: TrendingUp,
      //   href: '/dashboard/direction/performances',
      // },
      // {
      //   title: 'Directeurs G4',
      //   icon: Users,
      //   href: '/dashboard/direction/directeurs',
      // },
      // {
      //   title: 'Rapports',
      //   icon: Calendar,
      //   href: '/dashboard/direction/rapports',
      // },
      // {
      //   title: 'Documents',
      //   icon: FileText,
      //   href: '/dashboard/direction/documents',
      // },
      // {
      //   title: 'Finances',
      //   icon: DollarSign,
      //   href: '/dashboard/direction/finances',
      // },
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
  // {
  //   title: 'Pôle Commercial',
  //   icon: ShoppingCart,
  //   href: '/dashboard/commercial',
  //   children: [
  //     {
  //       title: 'Vente B2C',
  //       icon: Users,
  //       children: [
  //         {
  //           title: 'Leads & RDV',
  //           icon: Calendar,
  //           href: '/dashboard/commercial/b2c/leads-rdv',
  //         },
  //         {
  //           title: 'Relances commerciales',
  //           icon: Phone,
  //           href: '/dashboard/commercial/b2c/relances',
  //         },
  //         {
  //           title: 'Classement vendeurs',
  //           icon: Target,
  //           href: '/dashboard/commercial/b2c/classement',
  //         },
  //         {
  //           title: 'Ventes mensuelles',
  //           icon: BarChart3,
  //           href: '/dashboard/commercial/b2c/ventes',
  //         },
  //         {
  //           title: 'Pipeline',
  //           icon: TrendingUp,
  //           href: '/dashboard/commercial/b2c/pipeline',
  //         },
  //       ],
  //     },
  //     {
  //       title: 'Achats / Reprises / Dépôt-Vente',
  //       icon: Package,
  //       children: [
  //         {
  //           title: 'Véhicules repris',
  //           icon: Package,
  //           href: '/dashboard/commercial/achats/vehicules-repris',
  //         },
  //         {
  //           title: 'Rentabilité',
  //           icon: DollarSign,
  //           href: '/dashboard/commercial/achats/rentabilite',
  //         },
  //         {
  //           title: 'Délais mise en vente',
  //           icon: Clock,
  //           href: '/dashboard/commercial/achats/delais',
  //         },
  //         {
  //           title: 'Relation vendeurs',
  //           icon: UserCheck,
  //           href: '/dashboard/commercial/achats/relation-vendeurs',
  //         },
  //       ],
  //     },
  //     {
  //       title: 'Remarketing – B2B',
  //       icon: Building2,
  //       children: [
  //         {
  //           title: 'Marchands actifs/inactifs',
  //           icon: Users,
  //           href: '/dashboard/commercial/b2b/marchands',
  //         },
  //         {
  //           title: 'Relances B2B',
  //           icon: Phone,
  //           href: '/dashboard/commercial/b2b/relances',
  //         },
  //         {
  //           title: 'Propositions / diffusion',
  //           icon: MessageSquare,
  //           href: '/dashboard/commercial/b2b/propositions',
  //         },
  //         {
  //           title: 'Stocks partenaires',
  //           icon: Package,
  //           href: '/dashboard/commercial/b2b/stocks',
  //         },
  //       ],
  //     },
  //   ],
  // },
  // {
  //   title: 'Pôle Transport',
  //   icon: Truck,
  //   href: '/dashboard/transport',
  //   children: [
  //     {
  //       title: 'Livraisons',
  //       icon: MapPin,
  //       href: '/dashboard/transport/livraisons',
  //     },
  //     {
  //       title: 'Chauffeurs',
  //       icon: Users,
  //       href: '/dashboard/transport/chauffeurs',
  //     },
  //     {
  //       title: 'Partenaires',
  //       icon: Handshake,
  //       href: '/dashboard/transport/partenaires',
  //     },
  //   ],
  // },
  {
    title: 'Pôle Pricing',
    icon: DollarSign,
    href: '/dashboard/pricing',
    children: [
      {
        title: 'Dashboard',
        icon: BarChart3,
        href: '/dashboard/pricing',
      },
      {
        title: 'Angola',
        icon: Globe,
        href: '/dashboard/pricing/angola',
      },
    ],
  },
  // {
  //   title: 'Pôle ACSG',
  //   icon: FileText,
  //   href: '/dashboard/acsg',
  //   children: [
  //     {
  //       title: 'Administration',
  //       icon: Settings,
  //       href: '/dashboard/acsg/administration',
  //     },
  //     {
  //       title: 'Comptabilité',
  //       icon: DollarSign,
  //       href: '/dashboard/acsg/comptabilite',
  //     },
  //     {
  //       title: 'SAV',
  //       icon: MessageSquare,
  //       href: '/dashboard/acsg/sav',
  //     },
  //     {
  //       title: 'Gestion RH',
  //       icon: Users,
  //       href: '/dashboard/acsg/rh',
  //     },
  //   ],
  // },
  // {
  //   title: 'Pôle Marketing',
  //   icon: Megaphone,
  //   href: '/dashboard/marketing',
  //   children: [
  //     {
  //       title: 'Campagnes',
  //       icon: Target,
  //       href: '/dashboard/marketing/campagnes',
  //     },
  //     {
  //       title: 'Réseaux sociaux',
  //       icon: MessageSquare,
  //       href: '/dashboard/marketing/reseaux-sociaux',
  //     },
  //     {
  //       title: 'Analytics',
  //       icon: BarChart3,
  //       href: '/dashboard/marketing/analytics',
  //     },
  //   ],
  // },
  // {
  //   title: 'Pôle Technique',
  //   icon: Code,
  //   href: '/dashboard/technique',
  //   children: [
  //     {
  //       title: 'Maintenance',
  //       icon: Settings,
  //       href: '/dashboard/technique/maintenance',
  //     },
  //     {
  //       title: 'Équipements',
  //       icon: Package,
  //       href: '/dashboard/technique/equipements',
  //     },
  //   ],
  // },
  // {
  //   title: 'Pôle IT',
  //   icon: Server,
  //   href: '/dashboard/it',
  //   children: [
  //     {
  //       title: 'Infrastructure',
  //       icon: Server,
  //       href: '/dashboard/it/infrastructure',
  //     },
  //     {
  //       title: 'Sécurité',
  //       icon: Shield,
  //       href: '/dashboard/it/securite',
  //     },
  //     {
  //       title: 'Support',
  //       icon: MessageSquare,
  //       href: '/dashboard/it/support',
  //     },
  //   ],
  // },
  // {
  //   title: 'Pôle Entretien',
  //   icon: Broom,
  //   href: '/dashboard/entretien',
  //   children: [
  //     {
  //       title: 'Planning',
  //       icon: Calendar,
  //       href: '/dashboard/entretien/planning',
  //     },
  //     {
  //       title: 'Équipes',
  //       icon: Users,
  //       href: '/dashboard/entretien/equipes',
  //     },
  //   ],
  // },
  // {
  //   title: 'Pôle Coordination',
  //   icon: Link2,
  //   href: '/dashboard/coordination',
  //   children: [
  //     {
  //       title: 'Projets',
  //       icon: Target,
  //       href: '/dashboard/coordination/projets',
  //     },
  //     {
  //       title: 'Ressources',
  //       icon: Users,
  //       href: '/dashboard/coordination/ressources',
  //     },
  //   ],
  // },
];