'use client';

import { ToastContainer } from '@/components/ui/ToastNotification';
import { useToastNotifications } from '@/hooks/useToastNotifications';
import { createContext, ReactNode, useContext } from 'react';

interface ToastContextType {
    addToast: (notification: { title: string; message: string; type: 'info' | 'success' | 'warning' | 'error' }) => string;
    removeToast: (id: string) => void;
    clearAllToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const { toasts, addToast, removeToast, clearAllToasts } = useToastNotifications();

    return (
        <ToastContext.Provider value={{ addToast, removeToast, clearAllToasts }}>
            {children}
            <ToastContainer notifications={toasts} onClose={removeToast} />
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
} 