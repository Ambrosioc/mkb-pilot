import '@/app/globals.css';
import type { Metadata } from 'next';
import { AuthProvider } from '@/store/useAuth';
import { Toaster } from '@/components/ui/sonner';

export const metadata: Metadata = {
  title: 'MKB Pilot - Dashboard',
  description: 'Dashboard professionnel MKB Pilot #mkbpilot',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="font-montserrat">
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}