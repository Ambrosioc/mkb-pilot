import { usePoleAccess } from '@/hooks/usePoleAccess';
import { ReactNode } from 'react';

interface PoleProtectedProps {
    poleName: string;
    requiredAccess?: 'read' | 'write' | 'manage';
    children: ReactNode;
    fallback?: ReactNode;
    showWhenNoAccess?: boolean;
}

export function PoleProtected({
    poleName,
    requiredAccess = 'read',
    children,
    fallback,
    showWhenNoAccess = false
}: PoleProtectedProps) {
    const { canRead, canWrite, canManage, loading } = usePoleAccess(poleName);

    // Pendant le chargement, ne rien afficher
    if (loading) {
        return null;
    }

    // Déterminer si l'utilisateur a l'accès requis
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

    // Si pas d'accès et qu'on ne veut pas afficher quand pas d'accès
    if (!hasAccess && !showWhenNoAccess) {
        return fallback ? <>{fallback}</> : null;
    }

    // Si pas d'accès mais qu'on veut afficher quelque chose
    if (!hasAccess && showWhenNoAccess) {
        return fallback ? <>{fallback}</> : null;
    }

    // Si accès autorisé, afficher le contenu
    return <>{children}</>;
}

// Composant pour afficher du contenu seulement si l'utilisateur N'A PAS l'accès
export function PoleProtectedInverse({
    poleName,
    requiredAccess = 'read',
    children,
    fallback
}: Omit<PoleProtectedProps, 'showWhenNoAccess'>) {
    return (
        <PoleProtected
            poleName={poleName}
            requiredAccess={requiredAccess}
            fallback={fallback}
            showWhenNoAccess={true}
        >
            {children}
        </PoleProtected>
    );
} 