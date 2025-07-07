'use client';

import { usePoleAccess } from '@/hooks/usePoleAccess';
import { ReactNode } from 'react';

interface PoleAccessSectionProps {
    poleName: string;
    requiredAccess: 'read' | 'write' | 'manage';
    children: ReactNode;
    fallback?: ReactNode;
}

export function PoleAccessSection({
    poleName,
    requiredAccess,
    children,
    fallback
}: PoleAccessSectionProps) {
    const { canRead, canWrite, canManage, loading } = usePoleAccess(poleName);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mkb-blue"></div>
            </div>
        );
    }

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
    }

    if (!hasAccess) {
        return fallback || null;
    }

    return <>{children}</>;
} 