import '@/app/globals.css';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { Toaster } from '@/components/ui/sonner';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'MKB Pilot - Dashboard',
  description: 'Dashboard professionnel MKB Pilot #mkbpilot',
  icons: {
    icon: '/favicon.ico',
  },
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