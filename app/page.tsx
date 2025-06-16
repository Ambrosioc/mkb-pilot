'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuth';

export default function HomePage() {
  const { user, initialized } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (initialized) {
      if (user) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [user, initialized, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-mkb-blue/10 via-white to-mkb-yellow/10 flex items-center justify-center">
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="bg-mkb-blue text-white px-4 py-3 rounded-xl text-2xl font-bold">
            MKB
          </div>
          <span className="text-mkb-blue text-2xl font-semibold">Pilot</span>
        </div>
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-mkb-blue mx-auto"></div>
        <p className="mt-4 text-gray-600">Chargement...</p>
      </div>
    </div>
  );
}