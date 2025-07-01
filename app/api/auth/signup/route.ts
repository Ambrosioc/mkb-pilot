import { customSignUp } from '@/lib/supabase-auth-helpers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('🚀 [API SIGNUP] Nouvelle requête d\'inscription reçue');
  
  try {
    const body = await request.json();
    const { email, password, firstName, lastName } = body;

    console.log('📝 [API SIGNUP] Données reçues:', { email, firstName, lastName, passwordLength: password?.length });

    if (!email || !password || !firstName || !lastName) {
      console.log('❌ [API SIGNUP] Champs manquants');
      return NextResponse.json(
        { success: false, error: 'Tous les champs sont requis' },
        { status: 400 }
      );
    }

    console.log('👤 [API SIGNUP] Appel de customSignUp...');
    const { data, error } = await customSignUp(email, password, firstName, lastName);

    if (error) {
      console.error('❌ [API SIGNUP] Erreur lors de l\'inscription:', error);
      // Retourner le message d'erreur spécifique
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la création du compte';
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: 400 }
      );
    }

    console.log('✅ [API SIGNUP] Inscription réussie, utilisateur créé:', data?.user?.id);
    return NextResponse.json({ success: true, user: data?.user });
  } catch (error) {
    console.error('❌ [API SIGNUP] Erreur serveur:', error);
    
    // Gérer les erreurs spécifiques
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Erreur serveur lors de la création du compte' },
      { status: 500 }
    );
  }
}