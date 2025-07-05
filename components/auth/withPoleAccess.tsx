import { AccessDenied } from '@/components/ui/AccessDenied';
import { Skeleton } from '@/components/ui/skeleton';
import { usePoleAccess } from '@/hooks/usePoleAccess';
import { ComponentType } from 'react';

interface WithPoleAccessOptions {
    poleName: string;
    requiredAccess?: 'read' | 'write' | 'manage';
    fallback?: ComponentType<any>;
    loadingComponent?: ComponentType<any>;
}

// Composant de chargement par défaut
const DefaultLoading = () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-56" />
        </div>
    </div>
);

export function withPoleAccess<P extends object>(
    WrappedComponent: ComponentType<P>,
    options: WithPoleAccessOptions
) {
    const {
        poleName,
        requiredAccess = 'read',
        fallback: FallbackComponent = AccessDenied,
        loadingComponent: LoadingComponent = DefaultLoading
    } = options;

    return function ProtectedComponent(props: P) {
        const { canRead, canWrite, canManage, loading, error } = usePoleAccess(poleName);

        // Affichage du chargement
        if (loading) {
            return <LoadingComponent />;
        }

        // Gestion des erreurs
        if (error) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                        <h2 className="text-xl font-semibold text-red-600 mb-2">Erreur de chargement</h2>
                        <p className="text-gray-600">{error}</p>
                    </div>
                </div>
            );
        }

        // Vérification des permissions
        let hasAccess = false;
        switch (requiredAccess) {
            case 'read':
                hasAccess = canRead;
                break;
            case 'write':
                hasAccess = canWrite;
                break;
            case 'manage':
                hasAccess = canManage;
                break;
            default:
                hasAccess = canRead;
        }

        // Si pas d'accès, afficher le composant de fallback
        if (!hasAccess) {
            return <FallbackComponent poleName={poleName} />;
        }

        // Si accès autorisé, afficher le composant protégé
        return <WrappedComponent {...props} />;
    };
} 