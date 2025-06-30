'use client';

import { useAuthStore } from '@/store/useAuth';
import React, { useEffect } from 'react';

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const initialize = useAuthStore((state) => state.initialize);
    const initialized = useAuthStore((state) => state.initialized);

    useEffect(() => {
        if (!initialized) {
            initialize();
        }
    }, [initialized]);

    if (!initialized) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-mkb-blue"></div>
            </div>
        );
    }

    return <>{children}</>;
} 