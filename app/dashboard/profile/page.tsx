'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ProfilePhotoUploader } from '@/components/ui/ProfilePhotoUploader';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuth';
import { motion } from 'framer-motion';
import {
  Building2,
  Calendar,
  Edit,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  MessageSquare,
  Save,
  Shield,
  User
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface UserProfileData {
  id: string;
  auth_user_id: string;
  prenom: string;
  nom: string;
  email: string;
  telephone: string | null;
  date_creation: string;
  photo_url: string | null;
  role: {
    nom: string;
    niveau: number;
    description: string;
  } | null;
}

export default function ProfilePage() {
  const { user } = useAuthStore();
  const [profileImage, setProfileImage] = useState('https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2');
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  // Function to generate public URL from file path
  const getPublicUrl = (filePath: string | null) => {
    if (!filePath) return null;
    const { data: urlData } = supabase.storage
      .from('profile')
      .getPublicUrl(filePath);
    console.log('Generated URL:', urlData.publicUrl); // Debug log
    return urlData.publicUrl;
  };

  // États pour le changement de mot de passe
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // États pour la demande de modification
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [requestReason, setRequestReason] = useState('');
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const handlePhotoUploaded = (photoUrl: string) => {
    setProfileImage(photoUrl);
    // Refresh user data to get the updated photo_url from database
    fetchUserProfile();
  };

  const fetchUserProfile = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // First, fetch basic user data
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, auth_user_id, prenom, nom, email, telephone, date_creation, photo_url')
        .eq('auth_user_id', user.id)
        .single();

      if (userError) {
        console.error('Error fetching user data:', userError);
        throw userError;
      }

      // Then, fetch role data separately
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select(`
          role_id,
          roles (
            id,
            nom,
            niveau,
            description
          )
        `)
        .eq('user_id', userData.id)
        .single();

      if (roleError) {
        console.error('Error fetching role data:', roleError);
        // Continue without role data
      }

      // Set profile image if available
      if (userData.photo_url) {
        setProfileImage(getPublicUrl(userData.photo_url) || '');
      }

      // Extract role information
      const role = roleData?.roles || null;

      setUserProfile({
        id: userData.id,
        auth_user_id: userData.auth_user_id,
        prenom: userData.prenom,
        nom: userData.nom,
        email: userData.email,
        telephone: userData.telephone,
        date_creation: userData.date_creation,
        photo_url: userData.photo_url,
        role: role as { nom: string; niveau: number; description: string } | null
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast.error('Erreur lors du chargement du profil');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Les nouveaux mots de passe ne correspondent pas');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Le nouveau mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setIsChangingPassword(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) throw error;

      toast.success('Mot de passe mis à jour avec succès !');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });

    } catch (error) {
      console.error('Error updating password:', error);
      toast.error('Erreur lors de la mise à jour du mot de passe');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleProfileRequest = async () => {
    if (!requestReason.trim()) {
      toast.error('Veuillez préciser la raison de votre demande');
      return;
    }

    setIsSubmittingRequest(true);

    try {
      // In a real app, here we would call an API endpoint to send the request
      // For this demo, we'll simulate sending with a timeout
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast.success('Demande envoyée avec succès ! Vous recevrez une réponse sous 48h.');
      setRequestReason('');
      setIsRequestDialogOpen(false);
    } catch (error) {
      console.error('Error submitting request:', error);
      toast.error('Erreur lors de l\'envoi de la demande');
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // Fonction pour obtenir la couleur du badge selon le niveau du rôle
  const getRoleColor = (niveau: number) => {
    switch (niveau) {
      case 1: return 'bg-red-100 text-red-800 border-red-200'; // CEO
      case 2: return 'bg-purple-100 text-purple-800 border-purple-200'; // G4
      case 3: return 'bg-blue-100 text-blue-800 border-blue-200'; // Responsable de Pôle
      case 4: return 'bg-green-100 text-green-800 border-green-200'; // Collaborateur confirmé
      case 5: return 'bg-gray-100 text-gray-800 border-gray-200'; // Collaborateur simple
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 text-mkb-blue animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <User className="h-8 w-8 text-mkb-blue" />
          <div>
            <h1 className="text-3xl font-bold text-mkb-black">
              Mon Profil
            </h1>
            <p className="text-gray-600">
              Gérer vos informations personnelles et paramètres de sécurité
            </p>
          </div>
        </div>
        {userProfile?.role && (
          <div className="flex items-center gap-3">
            <Badge className={`${getRoleColor(userProfile.role.niveau)}`}>
              <Shield className="h-3 w-3 mr-1" />
              {userProfile.role.nom}
            </Badge>
          </div>
        )}
      </motion.div>

      {/* Profile Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-mkb-black flex items-center gap-2">
              <User className="h-5 w-5" />
              Informations Personnelles
            </CardTitle>
            <CardDescription>
              Ces informations sont en lecture seule. Utilisez le bouton de demande pour les modifier.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Photo de profil avec initiales par défaut */}
              <div className="flex flex-col items-center">
                <ProfilePhotoUploader
                  userId={userProfile?.auth_user_id || ''}
                  currentPhotoUrl={getPublicUrl(userProfile?.photo_url || null)}
                  onPhotoUploaded={handlePhotoUploaded}
                  size="lg"
                />

                <p className="text-sm text-gray-500 mt-2 text-center">
                  JPG, PNG ou WEBP (max. 5MB)
                </p>

                {/* Affichage du rôle avec badge coloré */}
                {userProfile?.role && (
                  <div className="mt-3 flex flex-col items-center">
                    <Badge
                      variant="outline"
                      className={`${getRoleColor(userProfile.role.niveau)} text-xs font-medium`}
                    >
                      {userProfile.role.nom}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1 text-center max-w-[200px]">
                      {userProfile.role.description}
                    </p>
                  </div>
                )}
              </div>

              {/* Informations */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-gray-700 font-medium">Prénom</Label>
                  <Input
                    value={userProfile?.prenom || ''}
                    readOnly
                    className="bg-gray-50 cursor-not-allowed"
                  />
                </div>
                <div>
                  <Label className="text-gray-700 font-medium">Nom</Label>
                  <Input
                    value={userProfile?.nom || ''}
                    readOnly
                    className="bg-gray-50 cursor-not-allowed"
                  />
                </div>
                <div>
                  <Label className="text-gray-700 font-medium">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      value={userProfile?.email || ''}
                      readOnly
                      className="pl-10 bg-gray-50 cursor-not-allowed"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-gray-700 font-medium">Rôle</Label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      value={userProfile?.role?.nom || 'Non défini'}
                      readOnly
                      className="pl-10 bg-gray-50 cursor-not-allowed"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-gray-700 font-medium">Téléphone</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      value={userProfile?.telephone || 'Non renseigné'}
                      readOnly
                      className="pl-10 bg-gray-50 cursor-not-allowed"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-gray-700 font-medium">Date d&apos;inscription</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      value={userProfile?.date_creation ? new Date(userProfile.date_creation).toLocaleDateString('fr-FR') : ''}
                      readOnly
                      className="pl-10 bg-gray-50 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Permissions */}
            {userProfile?.role && (
              <div className="mt-6">
                <Label className="text-gray-700 font-medium mb-3 block">Niveau d&apos;accès</Label>
                <div className="flex flex-wrap gap-2">
                  <Badge className={`${getRoleColor(userProfile.role.niveau)}`}>
                    Niveau {userProfile.role.niveau}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {userProfile.role.description}
                  </Badge>
                </div>
              </div>
            )}

            {/* Dernière connexion */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Dernière connexion :</strong> {new Date().toLocaleString('fr-FR')}
              </p>
            </div>

            {/* Bouton de demande de modification */}
            <div className="mt-6 flex justify-end">
              <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="border-mkb-blue text-mkb-blue hover:bg-mkb-blue hover:text-white">
                    <Edit className="h-4 w-4 mr-2" />
                    Demander une modification
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Demande de Modification de Profil</DialogTitle>
                    <DialogDescription>
                      Décrivez les modifications que vous souhaitez apporter à votre profil
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Raison de la demande</Label>
                      <Textarea
                        placeholder="Décrivez les modifications souhaitées (nom, email, département, etc.)"
                        value={requestReason}
                        onChange={(e) => setRequestReason(e.target.value)}
                        className="min-h-[100px]"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsRequestDialogOpen(false)}
                        disabled={isSubmittingRequest}
                      >
                        Annuler
                      </Button>
                      <Button
                        onClick={handleProfileRequest}
                        disabled={isSubmittingRequest}
                        className="bg-mkb-blue hover:bg-mkb-blue/90"
                      >
                        {isSubmittingRequest ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Envoi...
                          </>
                        ) : (
                          <>
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Envoyer la demande
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Password Change */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-mkb-black flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Changer le Mot de Passe
            </CardTitle>
            <CardDescription>
              Mettez à jour votre mot de passe pour sécuriser votre compte
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label className="text-gray-700 font-medium">Mot de passe actuel</Label>
                  <div className="relative">
                    <Input
                      type={showPasswords.current ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      className="pr-10"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('current')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <Label className="text-gray-700 font-medium">Nouveau mot de passe</Label>
                  <div className="relative">
                    <Input
                      type={showPasswords.new ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="pr-10"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('new')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <Label className="text-gray-700 font-medium">Confirmer le mot de passe</Label>
                  <div className="relative">
                    <Input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="pr-10"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('confirm')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">Exigences du mot de passe :</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Au moins 6 caractères</li>
                  <li>• Mélange de lettres et chiffres recommandé</li>
                  <li>• Évitez les mots de passe trop simples</li>
                </ul>
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={isChangingPassword}
                  className="bg-mkb-blue hover:bg-mkb-blue/90"
                >
                  {isChangingPassword ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Mise à jour...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Mettre à jour le mot de passe
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      {/* Security Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-mkb-black flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Informations de Sécurité
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-3 mb-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-800">Authentification 2FA</span>
                </div>
                <p className="text-sm text-green-700">
                  Activée et configurée pour votre compte
                </p>
                <Badge className="bg-green-100 text-green-800 mt-2">Actif</Badge>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="h-5 w-5 text-mkb-blue" />
                  <span className="font-medium text-blue-800">Dernière modification</span>
                </div>
                <p className="text-sm text-blue-700">
                  Mot de passe modifié le 1er mars 2024
                </p>
                <Badge className="bg-blue-100 text-blue-800 mt-2">Récent</Badge>
              </div>
            </div>

            <div className="mt-6 p-4 bg-mkb-yellow/10 rounded-lg border border-mkb-yellow/20">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-mkb-black" />
                <span className="font-medium text-mkb-black">Conseils de Sécurité</span>
              </div>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Changez votre mot de passe régulièrement</li>
                <li>• Ne partagez jamais vos identifiants</li>
                <li>• Déconnectez-vous des sessions inactives</li>
                <li>• Signalez toute activité suspecte</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Footer */}
      <motion.div
        className="text-center py-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <p className="text-sm text-gray-500">
          Mon Profil - <span className="text-mkb-blue font-semibold">#mkbpilot</span>
        </p>
      </motion.div>
    </div>
  );
}