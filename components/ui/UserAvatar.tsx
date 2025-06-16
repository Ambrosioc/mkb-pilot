'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, User, X } from 'lucide-react';
import { toast } from 'sonner';

interface UserAvatarProps {
  currentImage?: string;
  userName: string;
  onImageChange?: (imageUrl: string) => void;
  size?: 'sm' | 'md' | 'lg';
}

export function UserAvatar({ 
  currentImage, 
  userName, 
  onImageChange,
  size = 'lg' 
}: UserAvatarProps) {
  const [imageUrl, setImageUrl] = useState(currentImage || '');
  const [isUploading, setIsUploading] = useState(false);

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-32 h-32'
  };

  const iconSizes = {
    sm: 'h-6 w-6',
    md: 'h-10 w-10',
    lg: 'h-16 w-16'
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image valide');
      return;
    }

    // Vérifier la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('L\'image ne doit pas dépasser 5MB');
      return;
    }

    setIsUploading(true);

    // Simuler l'upload avec FileReader pour l'aperçu local
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImageUrl(result);
      onImageChange?.(result);
      setIsUploading(false);
      toast.success('Photo de profil mise à jour !');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageUrl('');
    onImageChange?.('');
    toast.success('Photo de profil supprimée');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <motion.div
          className={`${sizeClasses[size]} rounded-full overflow-hidden border-4 border-white shadow-lg bg-mkb-blue flex items-center justify-center`}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={userName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center text-white">
              {userName ? (
                <span className={`font-bold ${size === 'lg' ? 'text-2xl' : size === 'md' ? 'text-lg' : 'text-sm'}`}>
                  {getInitials(userName)}
                </span>
              ) : (
                <User className={iconSizes[size]} />
              )}
            </div>
          )}
        </motion.div>

        {imageUrl && size === 'lg' && (
          <button
            onClick={handleRemoveImage}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {isUploading && (
          <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        )}
      </div>

      {size === 'lg' && (
        <div className="flex gap-2">
          <label htmlFor="avatar-upload">
            <Button 
              variant="outline" 
              size="sm" 
              className="cursor-pointer"
              disabled={isUploading}
            >
              <Upload className="h-4 w-4 mr-2" />
              {imageUrl ? 'Changer' : 'Ajouter'} la photo
            </Button>
            <Input
              id="avatar-upload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>
      )}
    </div>
  );
}