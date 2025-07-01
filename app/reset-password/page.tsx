'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ResetPasswordPage() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [email, setEmail] = useState<string>('');
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        // Récupérer l'email depuis l'URL
        const emailParam = searchParams.get('email');
        if (emailParam) {
            setEmail(emailParam);
        }
    }, [searchParams]);

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setMessage({ type: 'error', text: 'Les mots de passe ne correspondent pas' });
            return;
        }

        if (password.length < 6) {
            setMessage({ type: 'error', text: 'Le mot de passe doit contenir au moins 6 caractères' });
            return;
        }

        if (!email) {
            setMessage({ type: 'error', text: 'Email manquant. Veuillez utiliser le lien depuis votre email.' });
            return;
        }

        setLoading(true);
        setMessage(null);

        try {
            // Utiliser notre API pour la réinitialisation de mot de passe
            const response = await fetch('/api/auth/update-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                }),
            });

            const data = await response.json();

            if (!data.success) {
                setMessage({ type: 'error', text: data.error || 'Une erreur est survenue' });
            } else {
                setMessage({
                    type: 'success',
                    text: 'Mot de passe mis à jour avec succès ! Vous allez être redirigé vers la page de connexion.'
                });
                setTimeout(() => {
                    router.push('/login');
                }, 3000);
            }
        } catch (error) {
            console.error('Erreur lors de la réinitialisation:', error);
            setMessage({
                type: 'error',
                text: 'Une erreur est survenue lors de la réinitialisation du mot de passe'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        Réinitialiser votre mot de passe
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Entrez votre nouveau mot de passe ci-dessous
                    </p>
                    {email && (
                        <p className="mt-1 text-sm text-gray-500">
                            Pour : {email}
                        </p>
                    )}
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Nouveau mot de passe</CardTitle>
                        <CardDescription>
                            Votre mot de passe doit contenir au moins 6 caractères
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleResetPassword} className="space-y-4">
                            <div>
                                <Label htmlFor="password">Nouveau mot de passe</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="mt-1"
                                    placeholder="Entrez votre nouveau mot de passe"
                                />
                            </div>

                            <div>
                                <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    className="mt-1"
                                    placeholder="Confirmez votre nouveau mot de passe"
                                />
                            </div>

                            {message && (
                                <Alert className={message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                                    {message.type === 'success' ? (
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                    ) : (
                                        <AlertCircle className="h-4 w-4 text-red-600" />
                                    )}
                                    <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                                        {message.text}
                                    </AlertDescription>
                                </Alert>
                            )}

                            <Button
                                type="submit"
                                disabled={loading || !email}
                                className="w-full"
                            >
                                {loading ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <div className="text-center space-y-2">
                    <Button
                        variant="link"
                        onClick={() => router.push('/forgot-password')}
                        className="text-sm text-gray-600 hover:text-gray-900"
                    >
                        Demander un nouveau lien
                    </Button>
                    <br />
                    <Button
                        variant="link"
                        onClick={() => router.push('/login')}
                        className="text-sm text-gray-600 hover:text-gray-900"
                    >
                        Retour à la connexion
                    </Button>
                </div>
            </div>
        </div>
    );
} 