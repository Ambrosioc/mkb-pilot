'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/store/useAuth';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🚀 [REGISTER] Soumission du formulaire d\'inscription');

    if (!email || !password || !firstName || !lastName) {
      console.log('❌ [REGISTER] Champs manquants');
      toast.error('Veuillez remplir tous les champs', {
        description: 'Tous les champs sont obligatoires pour créer votre compte.',
        duration: 5000,
      });
      return;
    }

    if (password.length < 6) {
      console.log('❌ [REGISTER] Mot de passe trop court');
      toast.error('Mot de passe trop court', {
        description: 'Le mot de passe doit contenir au moins 6 caractères.',
        duration: 5000,
      });
      return;
    }

    console.log('📤 [REGISTER] Envoi de la requête d\'inscription...');
    setLoading(true);

    try {
      // Utiliser notre API d'inscription personnalisée
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          firstName,
          lastName,
        }),
      });

      console.log('📥 [REGISTER] Réponse reçue:', response.status);
      const data = await response.json();
      console.log('📄 [REGISTER] Données de réponse:', data);

      if (!data.success) {
        console.log('❌ [REGISTER] Échec de l\'inscription:', data.error);
        // Gérer les erreurs spécifiques avec des toasts appropriés
        if (data.error.includes('déjà utilisée') ||
          data.error.includes('already registered') ||
          data.error.includes('already exists') ||
          data.error.includes('duplicate key') ||
          data.error.includes('User already registered')) {
          toast.error('Compte déjà existant', {
            description: 'Un compte avec cette adresse email existe déjà. Veuillez vous connecter ou utiliser une autre adresse email.',
            duration: 8000,
            action: {
              label: 'Se connecter',
              onClick: () => router.push('/login'),
            },
          });
        } else if (data.error.includes('mot de passe')) {
          toast.error('Mot de passe invalide', {
            description: data.error,
            duration: 5000,
          });
        } else if (data.error.includes('email valide')) {
          toast.error('Email invalide', {
            description: 'Veuillez saisir une adresse email valide.',
            duration: 5000,
          });
        } else {
          toast.error('Erreur lors de la création du compte', {
            description: data.error || 'Une erreur inattendue s&apos;est produite. Veuillez réessayer.',
            duration: 6000,
          });
        }
        return;
      }

      console.log('✅ [REGISTER] Inscription réussie!');
      toast.success('Compte créé avec succès !', {
        description: 'Votre compte a été créé. Vous pouvez maintenant vous connecter avec votre email et mot de passe.',
        duration: 8000,
        action: {
          label: 'Aller à la connexion',
          onClick: () => router.push('/login'),
        },
      });

      // Rediriger vers la page de connexion après un délai
      setTimeout(() => {
        router.push('/login');
      }, 2000);

    } catch (error) {
      console.error('❌ [REGISTER] Erreur de connexion:', error);
      toast.error('Erreur de connexion', {
        description: 'Impossible de contacter le serveur. Vérifiez votre connexion internet et réessayez.',
        duration: 6000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-mkb-yellow/10 via-white to-mkb-blue/10 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl border-0">
          <CardHeader className="text-center pb-2">
            <img src="/logo.png" alt="Logo MKB" className="mx-auto mb-6 w-40 h-28 object-contain" />
            <CardTitle className="text-2xl font-bold text-mkb-black">
              Créer un compte
            </CardTitle>
            <CardDescription className="text-gray-600">
              Rejoignez MKB Pilot dès aujourd&apos;hui
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-mkb-black font-medium">
                  Nom et Prénom
                </Label>
                <div className="relative">
                  <div className="flex gap-2">
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Votre nom"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="Votre prénom"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-mkb-black font-medium">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="votre@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 border-gray-300 focus:border-mkb-blue focus:ring-mkb-blue"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-mkb-black font-medium">
                  Mot de passe
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 border-gray-300 focus:border-mkb-blue focus:ring-mkb-blue"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  Minimum 6 caractères
                </p>
              </div>

              <Button
                type="submit"
                className="w-full bg-mkb-blue hover:bg-mkb-blue/90 text-white font-medium py-2"
                disabled={loading}
              >
                {loading ? 'Création...' : 'Créer mon compte'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Déjà un compte ?{' '}
                <Link
                  href="/login"
                  className="text-mkb-blue hover:text-mkb-blue/80 font-medium"
                >
                  Se connecter
                </Link>
              </p>
            </div>

            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                <span className="text-mkb-blue font-medium">#mkbpilot</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}