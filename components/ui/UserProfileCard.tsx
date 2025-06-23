'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuth';
import { Calendar, Mail, Phone, Shield } from 'lucide-react';
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

export function UserProfileCard() {
    const { user } = useAuthStore();
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

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-lg">Mon Profil</CardTitle>
                <CardDescription>Informations personnelles</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                        <AvatarImage src={profile.photo_url || ''} alt={`${profile.prenom} ${profile.nom}`} />
                        <AvatarFallback className="bg-mkb-blue text-white">
                            {profile.prenom.charAt(0)}{profile.nom.charAt(0)}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-medium text-mkb-black">{profile.prenom} {profile.nom}</p>
                        <div className="flex items-center mt-1">
                            {profile.role && (
                                <Badge className="bg-mkb-blue text-white text-xs">
                                    <Shield className="h-3 w-3 mr-1" />
                                    {profile.role.nom}
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-4 space-y-2 text-sm">
                    <div className="flex items-center text-gray-600">
                        <Mail className="h-4 w-4 mr-2 text-gray-400" />
                        {profile.email}
                    </div>
                    {profile.telephone && (
                        <div className="flex items-center text-gray-600">
                            <Phone className="h-4 w-4 mr-2 text-gray-400" />
                            {profile.telephone}
                        </div>
                    )}
                    <div className="flex items-center text-gray-600">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        Membre depuis {new Date(profile.date_creation).toLocaleDateString()}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}