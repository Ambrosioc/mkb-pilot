'use client';

import { navigationItems } from '@/components/navigation/NavigationConfig';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useTabs } from '@/hooks/useTabs';
import { cn } from '@/lib/utils';
import type { MenuItem } from '@/types';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { memo } from 'react';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

interface MenuItemComponentProps {
  item: MenuItem;
  level: number;
  collapsed: boolean;
  pathname: string;
}

const MenuItemComponent = memo<MenuItemComponentProps>(({ item, level, collapsed, pathname }) => {
  const { navigateToTab } = useTabs();
  const isActive = pathname === item.href;
  const hasChildren = item.children && item.children.length > 0;
  const paddingLeft = level * 16;

  const handleClick = () => {
    if (item.href) {
      navigateToTab({
        id: '',
        name: item.title.toLowerCase().replace(/\s+/g, '-'),
        label: item.title,
        path: item.href,
        icon: item.icon?.name
      });
    }
  };

  if (hasChildren) {
    return (
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value={item.title} className="border-none">
          <AccordionTrigger
            className={cn(
              "flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors hover:bg-gray-100 rounded-lg",
              isActive && "bg-mkb-blue/10 text-mkb-blue",
              collapsed && "justify-center px-2"
            )}
            style={{ paddingLeft: collapsed ? 8 : paddingLeft }}
            hideChevron={true}
          >
            <item.icon className="h-4 w-4 flex-shrink-0" />
            {!collapsed && (
              <span className="flex-1 text-left">{item.title}</span>
            )}
          </AccordionTrigger>
          <AccordionContent className="pb-0">
            <div className="space-y-1">
              {item.children?.map((child) => (
                <MenuItemComponent
                  key={child.title}
                  item={child}
                  level={level + 1}
                  collapsed={collapsed}
                  pathname={pathname}
                />
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        "flex items-center gap-3 w-full px-4 py-3 text-sm font-medium transition-colors hover:bg-gray-100 rounded-lg",
        isActive && "bg-mkb-blue/10 text-mkb-blue",
        collapsed && "justify-center px-2"
      )}
      style={{ paddingLeft: collapsed ? 8 : paddingLeft }}
      title={collapsed ? item.title : undefined}
    >
      <item.icon className="h-4 w-4 flex-shrink-0" />
      {!collapsed && (
        <span className="flex-1 text-left">{item.title}</span>
      )}
    </button>
  );
});

MenuItemComponent.displayName = 'MenuItemComponent';

const Sidebar = memo<SidebarProps>(({ collapsed, onToggle }) => {
  const pathname = usePathname();

  return (
    <motion.aside
      className={cn(
        "bg-white border-r border-gray-200 flex flex-col transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
      initial={false}
      animate={{ width: collapsed ? 64 : 256 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2"
          >
            {/* Logo MKB */}
            <img src="/logo.png" alt="Logo MKB" className="w-28 h-10 object-contain" />
          </motion.div>
        )}

        <button
          onClick={onToggle}
          className={cn(
            "p-2 rounded-lg hover:bg-gray-100 transition-colors",
            collapsed && "mx-auto"
          )}
        >
          <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        <AnimatePresence mode="sync">
          {navigationItems.map((item) => (
            <MenuItemComponent
              key={item.title}
              item={item}
              level={0}
              collapsed={collapsed}
              pathname={pathname}
            />
          ))}
        </AnimatePresence>
      </nav>

      {/* Footer */}
      {!collapsed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="p-4 border-t border-gray-200"
        >
          <div className="text-xs text-gray-500 text-center">
            <p>Version 1.0.0</p>
            <p>© 2024 MKB Pilot</p>
          </div>
        </motion.div>
      )}
    </motion.aside>
  );
});

Sidebar.displayName = 'Sidebar';

export { Sidebar };
