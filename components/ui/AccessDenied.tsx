import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Shield } from 'lucide-react';
import Link from 'next/link';

interface AccessDeniedProps {
    poleName?: string;
    message?: string;
}

export function AccessDenied({ poleName, message }: AccessDeniedProps) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                        <Shield className="h-8 w-8 text-red-600" />
                    </div>
                    <CardTitle className="text-xl font-semibold text-gray-900">
                        Accès Refusé
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                    <p className="text-gray-600">
                        {message ||
                            (poleName
                                ? `Vous n&apos;avez pas les permissions nécessaires pour accéder au pôle &quot;${poleName}&quot;.`
                                : "Vous n&apos;avez pas les permissions nécessaires pour accéder à cette page."
                            )
                        }
                    </p>
                    <p className="text-sm text-gray-500">
                        Contactez votre administrateur si vous pensez qu'il s'agit d'une erreur.
                    </p>
                    <div className="pt-4">
                        <Link href="/dashboard">
                            <Button className="w-full">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Retour au tableau de bord
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 