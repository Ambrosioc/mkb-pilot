import { supabase } from '@/lib/supabase';
import { customSignUp } from '@/lib/supabase-auth-helpers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, firstName, lastName } = body;

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { success: false, error: 'Tous les champs sont requis' },
        { status: 400 }
      );
    }
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

    // Créer le profil utilisateur dans la table users
    if (data?.user) {
      try {
        // Vérifier si la fonction RPC existe, sinon utiliser une insertion directe
        const rpcParams = {
          auth_user_id: data.user.id,
          prenom: firstName,
          nom: lastName,
          email: data.user.email!
        };
        
        const { error: rpcError } = await supabase
          .rpc('create_user_profile', rpcParams);

        if (rpcError) {
          // Insertion directe dans la table users
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              id: data.user.id,
              auth_user_id: data.user.id,
              prenom: firstName,
              nom: lastName,
              email: data.user.email!,
              actif: true,
              date_creation: new Date().toISOString()
            });

          if (insertError) {
            console.error('❌ [API SIGNUP] Erreur lors de la création du profil utilisateur:', insertError);
            // Ne pas faire échouer l'inscription si la création du profil échoue
          }
        }
      } catch (profileError) {
        console.error('❌ [API SIGNUP] Erreur lors de la création du profil utilisateur:', profileError);
        // Ne pas faire échouer l'inscription si la création du profil échoue
      }
    }
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