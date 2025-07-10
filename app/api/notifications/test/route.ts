import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

// Route de test pour vérifier l'authentification
export async function GET(request: NextRequest) {
  try {
    const cookies = request.cookies;
    
    // Lister tous les cookies disponibles
    const allCookies = Array.from(cookies.getAll()).map(cookie => ({
      name: cookie.name,
      value: cookie.value.substring(0, 20) + '...' // Afficher seulement le début pour la sécurité
    }));

    console.log('Cookies disponibles:', allCookies);

    // Essayer de récupérer l'utilisateur sans token spécifique
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    return NextResponse.json({
      cookies: allCookies,
      user: user ? { id: user.id, email: user.email } : null,
      authError: authError?.message || null,
      authenticated: !!user
    });
  } catch (error) {
    console.error('Erreur de test:', error);
    return NextResponse.json({ error: 'Erreur de test' }, { status: 500 });
  }
} 