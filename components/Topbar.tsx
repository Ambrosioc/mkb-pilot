'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { LanguageSelector } from '@/components/ui/LanguageSelector';
import { NotificationDropdown } from '@/components/ui/NotificationDropdown';
import { useAuthStore } from '@/store/useAuth';
import { motion } from 'framer-motion';
import { LogOut, Search, User } from 'lucide-react';
import Link from 'next/link';
import { memo } from 'react';

export const Topbar = memo(() => {
  const { user, signOut } = useAuthStore();

  const handleSignOut = async () => {
    await signOut();
  };

  // Fonction pour générer les initiales à partir du prénom et nom
  const getUserInitials = () => {
    if (!user) return 'U';

    const firstName = user.first_name || '';
    const lastName = user.last_name || '';

    const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : '';
    const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';

    return `${firstInitial}${lastInitial}` || user.email?.charAt(0).toUpperCase() || 'U';
  };

  const getUserDisplayName = () => {
    if (!user) return 'Utilisateur';

    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
    return fullName || user.email?.split('@')[0] || 'Utilisateur';
  };

  return (
    <motion.header
      className="bg-white border-b border-gray-100 px-6 py-3"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between">
        {/* Left Section - Empty now */}
        <div></div>

        {/* Center Section - Search */}
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Rechercher..."
              className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors h-9"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 text-xs bg-gray-200 rounded border">⌘</kbd>
              <kbd className="px-1.5 py-0.5 text-xs bg-gray-200 rounded border">K</kbd>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Language Selector */}
          <LanguageSelector />

          {/* Notifications */}
          <NotificationDropdown />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0 hover:bg-gray-100">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={user?.photo_url || ""}
                    alt="Profile"
                  />
                  <AvatarFallback className="bg-mkb-blue text-white text-sm font-semibold">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {getUserDisplayName()}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/profile">
                  <User className="mr-2 h-4 w-4" />
                  <span>Mon Profil</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Déconnexion</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.header>
  );
});

Topbar.displayName = 'Topbar';