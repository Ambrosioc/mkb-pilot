'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ToastNotificationProps {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    onClose: (id: string) => void;
    duration?: number;
}

export function ToastNotification({
    id,
    title,
    message,
    type,
    onClose,
    duration = 5000
}: ToastNotificationProps) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(() => onClose(id), 300); // Attendre l'animation de sortie
        }, duration);

        return () => clearTimeout(timer);
    }, [id, duration, onClose]);

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <CheckCircle className="h-5 w-5 text-green-600" />;
            case 'warning':
                return <AlertTriangle className="h-5 w-5 text-orange-600" />;
            case 'error':
                return <AlertTriangle className="h-5 w-5 text-red-600" />;
            default:
                return <Info className="h-5 w-5 text-blue-600" />;
        }
    };

    const getBgColor = () => {
        switch (type) {
            case 'success':
                return 'bg-green-50 border-green-200';
            case 'warning':
                return 'bg-orange-50 border-orange-200';
            case 'error':
                return 'bg-red-50 border-red-200';
            default:
                return 'bg-blue-50 border-blue-200';
        }
    };

    const getTextColor = () => {
        switch (type) {
            case 'success':
                return 'text-green-800';
            case 'warning':
                return 'text-orange-800';
            case 'error':
                return 'text-red-800';
            default:
                return 'text-blue-800';
        }
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, x: 300, scale: 0.3 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 300, scale: 0.5 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className={`fixed top-4 right-4 z-50 max-w-sm w-full p-4 rounded-lg shadow-lg border ${getBgColor()}`}
                >
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                            {getIcon()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className={`text-sm font-medium ${getTextColor()}`}>
                                {title}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                                {message}
                            </p>
                        </div>
                        <button
                            onClick={() => {
                                setIsVisible(false);
                                setTimeout(() => onClose(id), 300);
                            }}
                            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

interface ToastContainerProps {
    notifications: Array<{
        id: string;
        title: string;
        message: string;
        type: 'info' | 'success' | 'warning' | 'error';
    }>;
    onClose: (id: string) => void;
}

export function ToastContainer({ notifications, onClose }: ToastContainerProps) {
    return (
        <div className="fixed top-4 right-4 z-50 space-y-2">
            {notifications.map((notification) => (
                <ToastNotification
                    key={notification.id}
                    {...notification}
                    onClose={onClose}
                />
            ))}
        </div>
    );
} 