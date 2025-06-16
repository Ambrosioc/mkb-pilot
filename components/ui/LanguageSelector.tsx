'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe, Check } from 'lucide-react';

interface Language {
  code: string;
  name: string;
  flag: string;
}

const languages: Language[] = [
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
];

// Fonction utilitaire pour récupérer la langue actuelle
export const getCurrentLang = (): string => {
  if (typeof window === 'undefined') return 'fr'; // Valeur par défaut côté serveur
  return localStorage.getItem('mkb-language') || 'fr';
};

// Fonction utilitaire pour sauvegarder la langue
const setCurrentLang = (langCode: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('mkb-language', langCode);
  }
};

export function LanguageSelector() {
  const [selectedLang, setSelectedLang] = useState<string>('fr');

  // Charger la langue sauvegardée au montage du composant
  useEffect(() => {
    const savedLang = getCurrentLang();
    setSelectedLang(savedLang);
  }, []);

  // Trouver la langue actuelle dans la liste
  const currentLanguage = languages.find(lang => lang.code === selectedLang) || languages[0];

  const handleLanguageChange = (langCode: string) => {
    setSelectedLang(langCode);
    setCurrentLang(langCode);
    
    // Ici vous pourrez ajouter la logique de traduction plus tard
    console.log('Langue sélectionnée:', langCode);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-gray-100 transition-colors"
          title={`Langue actuelle: ${currentLanguage.name}`}
        >
          <span className="text-base" role="img" aria-label={currentLanguage.name}>
            {currentLanguage.flag}
          </span>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-48">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className="flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-base" role="img" aria-label={language.name}>
                {language.flag}
              </span>
              <span className="font-medium text-mkb-black">
                {language.name}
              </span>
            </div>
            {selectedLang === language.code && (
              <Check className="h-4 w-4 text-mkb-blue" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}