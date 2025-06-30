'use client';

import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { uploadProfilePhoto } from '@/lib/uploadImage';
import { useAuthStore } from '@/store/useAuth';
import { Camera, Loader2, Upload, X } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';

interface ProfilePhotoUploaderProps {
    userId: string;
    currentPhotoUrl?: string | null;
    onPhotoUploaded: (photoUrl: string) => void;
    size?: 'sm' | 'md' | 'lg';
}

export function ProfilePhotoUploader({
    userId,
    currentPhotoUrl,
    onPhotoUploaded,
    size = 'md'
}: ProfilePhotoUploaderProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const { refreshUserData } = useAuthStore();

    const sizeClasses = {
        sm: 'h-16 w-16',
        md: 'h-20 w-20',
        lg: 'h-24 w-24'
    };

    const iconSizes = {
        sm: 'h-4 w-4',
        md: 'h-5 w-5',
        lg: 'h-6 w-6'
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.webp']
        },
        maxFiles: 1,
        disabled: isUploading,
        onDrop: (acceptedFiles) => {
            const file = acceptedFiles[0];
            if (file) {
                // Create preview
                const reader = new FileReader();
                reader.onload = (e) => {
                    setPreview(e.target?.result as string);
                };
                reader.readAsDataURL(file);
            }
        }
    });

    const handleUpload = useCallback(async () => {
        if (!preview) {
            toast.error('Veuillez sélectionner une image');
            return;
        }

        setIsUploading(true);

        try {
            // Convert preview back to file
            const response = await fetch(preview);
            const blob = await response.blob();
            const file = new File([blob], 'profile-photo.jpg', { type: 'image/jpeg' });

            // Upload to Supabase Storage
            const result = await uploadProfilePhoto(file, userId);

            if (result.success && result.filePath) {
                // Update user profile in database
                const { error: updateError } = await supabase
                    .from('users')
                    .update({ photo_url: result.filePath })
                    .eq('id', userId);

                if (updateError) {
                    console.error('Error updating user photo_url:', updateError);
                    toast.error('Erreur lors de la mise à jour du profil');
                    return;
                }

                toast.success('Photo de profil mise à jour avec succès !');
                onPhotoUploaded(result.filePath);
                setPreview(null);
                refreshUserData();
            } else {
                toast.error(`Erreur lors de l'upload: ${result.error}`);
            }
        } catch (error) {
            console.error('Error uploading profile photo:', error);
            toast.error('Une erreur est survenue lors de l\'upload');
        } finally {
            setIsUploading(false);
        }
    }, [preview, userId, onPhotoUploaded, refreshUserData]);

    const clearPreview = () => {
        setPreview(null);
    };

    return (
        <div className="flex flex-col items-center gap-4">
            {/* Photo Preview */}
            <div className="relative">
                <div className={`${sizeClasses[size]} rounded-full overflow-hidden border-2 border-gray-200 bg-gray-100`}>
                    {(preview || currentPhotoUrl) ? (
                        <img
                            src={preview || currentPhotoUrl || ''}
                            alt="Photo de profil"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                            <Camera className={`${iconSizes[size]} text-gray-400`} />
                        </div>
                    )}
                </div>

                {/* Upload Button Overlay */}
                <div
                    {...getRootProps()}
                    className={`absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity cursor-pointer rounded-full ${isUploading ? 'pointer-events-none' : ''}`}
                >
                    <input {...getInputProps()} />
                    {isUploading ? (
                        <Loader2 className={`${iconSizes[size]} text-white animate-spin`} />
                    ) : (
                        <Upload className={`${iconSizes[size]} text-white`} />
                    )}
                </div>
            </div>

            {/* Upload Controls */}
            {preview && (
                <div className="flex gap-2">
                    <Button
                        onClick={handleUpload}
                        disabled={isUploading}
                        size="sm"
                        className="bg-mkb-blue hover:bg-mkb-blue/90"
                    >
                        {isUploading ? (
                            <>
                                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                Upload...
                            </>
                        ) : (
                            <>
                                <Upload className="mr-2 h-3 w-3" />
                                Confirmer
                            </>
                        )}
                    </Button>
                    <Button
                        onClick={clearPreview}
                        disabled={isUploading}
                        variant="outline"
                        size="sm"
                    >
                        <X className="h-3 w-3" />
                    </Button>
                </div>
            )}

            {/* Dropzone Area */}
            {!preview && (
                <div
                    {...getRootProps()}
                    className={`w-full max-w-xs p-4 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isDragActive
                        ? 'border-mkb-blue bg-mkb-blue/5'
                        : 'border-gray-300 hover:bg-gray-50'
                        } ${isUploading ? 'pointer-events-none opacity-50' : ''}`}
                >
                    <input {...getInputProps()} />
                    <div className="flex flex-col items-center text-center">
                        <Upload className="h-6 w-6 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600">
                            <span className="font-medium">Cliquez pour sélectionner</span> ou glissez-déposez
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            PNG, JPG ou WEBP (max. 5MB)
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
} 