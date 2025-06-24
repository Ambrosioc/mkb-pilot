'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

interface UserProfile {
    id: string;
    prenom: string;
    nom: string;
    email: string;
    telephone: string | null;
    photo_url: string | null;
    date_creation: string;
    role: {
        nom: string;
        niveau: number;
    } | null;
}

interface UserProfileCardProps {
    className?: string;
}

export const UserProfileCard = ({ className }: UserProfileCardProps) => {
    const { user, getFullName } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserProfile = async () => {
            if (!user) return;

            try {
                // Fetch user profile with role information
                const { data, error } = await supabase
                    .from('users')
                    .select(`
            id,
            prenom,
            nom,
            email,
            telephone,
            photo_url,
            date_creation,
            user_roles!inner (
              role_id
            ),
            roles:user_roles!inner(roles(
              nom,
              niveau
            ))
          `)
                    .eq('auth_user_id', user.id)
                    .single();

                if (error) throw error;

                // Transform the data to match our UserProfile interface
                const userProfile: UserProfile = {
                    id: data.id,
                    prenom: data.prenom,
                    nom: data.nom,
                    email: data.email,
                    telephone: data.telephone,
                    photo_url: data.photo_url,
                    date_creation: data.date_creation,
                    role: data.roles?.[0]?.roles?.[0] || null
                };

                setProfile(userProfile);
            } catch (error) {
                console.error('Error fetching user profile:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, [user]);

    if (loading) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                        <div className="animate-pulse bg-gray-200 h-12 w-12 rounded-full"></div>
                        <div className="space-y-2 flex-1">
                            <div className="animate-pulse bg-gray-200 h-4 w-3/4 rounded"></div>
                            <div className="animate-pulse bg-gray-200 h-3 w-1/2 rounded"></div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!profile) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="text-center text-gray-500">
                        <p>Profil non disponible</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const fullName = getFullName();
    const initials = fullName
        .split(' ')
        .map(name => name.charAt(0))
        .join('')
        .toUpperCase();

    return (
        <Card className={className}>
            <CardHeader className="text-center">
                <CardTitle>Profil Utilisateur</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex justify-center">
                    <Avatar className="h-20 w-20">
                        <AvatarImage src={profile.photo_url || ''} alt={fullName} />
                        <AvatarFallback className="text-lg font-semibold">
                            {initials || profile.email?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                </div>

                <div className="space-y-2 text-center">
                    <h3 className="text-lg font-semibold">{fullName}</h3>
                    <p className="text-sm text-muted-foreground">{profile.email}</p>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Prénom:</span>
                        <span>{profile.prenom || 'Non renseigné'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Nom:</span>
                        <span>{profile.nom || 'Non renseigné'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Membre depuis:</span>
                        <span>{new Date(profile.date_creation).toLocaleDateString('fr-FR')}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};