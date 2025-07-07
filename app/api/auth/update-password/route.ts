import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Créer un client Supabase avec la clé de service pour les opérations admin
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Cette clé a les privilèges admin
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email et mot de passe requis' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Le mot de passe doit contenir au moins 6 caractères' },
        { status: 400 }
      );
    }

    console.log('🔧 [UPDATE PASSWORD] Tentative de mise à jour pour:', email);

    // D'abord, récupérer tous les utilisateurs pour trouver celui avec l'email
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (userError) {
      console.error('❌ [UPDATE PASSWORD] Erreur lors de la récupération des utilisateurs:', userError);
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la récupération des informations utilisateur' },
        { status: 500 }
      );
    }

    // Trouver l'utilisateur par email
    const user = userData.users.find(u => u.email === email);
    
    if (!user) {
      console.error('❌ [UPDATE PASSWORD] Aucun utilisateur trouvé avec cet email:', email);
      return NextResponse.json(
        { success: false, error: 'Aucun utilisateur trouvé avec cet email' },
        { status: 404 }
      );
    }

    console.log('✅ [UPDATE PASSWORD] Utilisateur trouvé:', user.id);

    // Maintenant mettre à jour le mot de passe avec l'ID correct
    const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      { password: password }
    );

    if (updateError) {
      console.error('❌ [UPDATE PASSWORD] Erreur lors de la mise à jour:', updateError);
      return NextResponse.json(
        { success: false, error: updateError.message },
        { status: 500 }
      );
    }

    console.log('✅ [UPDATE PASSWORD] Mot de passe mis à jour avec succès pour:', email);
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('❌ [UPDATE PASSWORD] Erreur serveur:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
} 