import { usePoleAccess } from '@/hooks/usePoleAccess';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface UsePoleRedirectOptions {
  poleName: string;
  requiredAccess?: 'read' | 'write' | 'manage';
  redirectTo?: string;
  redirectIfNoAccess?: boolean;
}

export function usePoleRedirect({
  poleName,
  requiredAccess = 'read',
  redirectTo = '/dashboard',
  redirectIfNoAccess = true
}: UsePoleRedirectOptions) {
  const { canRead, canWrite, canManage, loading, error } = usePoleAccess(poleName);
  const router = useRouter();

  useEffect(() => {
    // Ne rien faire pendant le chargement
    if (loading) return;

    // En cas d'erreur, rediriger vers le dashboard
    if (error) {
      console.error('Erreur d\'accès au pôle:', error);
      if (redirectIfNoAccess) {
        router.push(redirectTo);
      }
      return;
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

    // Si pas d'accès et redirection activée
    if (!hasAccess && redirectIfNoAccess) {
      router.push(redirectTo);
    }
  }, [loading, error, canRead, canWrite, canManage, requiredAccess, redirectTo, redirectIfNoAccess, router]);

  return {
    hasAccess: (() => {
      switch (requiredAccess) {
        case 'read':
          return canRead;
        case 'write':
          return canWrite;
        case 'manage':
          return canManage;
        default:
          return canRead;
      }
    })(),
    loading,
    error,
    canRead,
    canWrite,
    canManage
  };
} 