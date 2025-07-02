import { sendEmailConfirmation } from '@/lib/mailjet';
import { supabase } from '@/lib/supabase';
import { sendEmail, sendPasswordResetEmail } from './mailjet';

// Fonction pour désactiver les emails automatiques de Supabase
// Note: Ceci doit être fait dans l'interface Supabase, pas via code
export function disableSupabaseEmails() {
  console.log('Pour désactiver les emails automatiques de Supabase:');
  console.log('1. Allez dans le dashboard Supabase > Authentication > Email Templates');
  console.log('2. Pour chaque template (Confirmation, Invitation, Magic Link, Reset Password):');
  console.log('   - Décochez la case "Enable email template"');
  console.log('   - Cliquez sur "Save"');
}

// Générer un lien de confirmation d'email
export async function generateEmailConfirmationLink(email: string): Promise<string | null> {
  try {
    const { data, error } = await supabase.auth.admin.generateLink({
      type: 'signup',
      email,
      password: 'temporary-password', // Mot de passe temporaire requis par l'API
    });

    if (error) {
      console.error('Erreur lors de la génération du lien de confirmation:', error);
      return null;
    }

    return data.properties.action_link;
  } catch (error) {
    console.error('Erreur lors de la génération du lien de confirmation:', error);
    return null;
  }
}

// Générer un lien de réinitialisation de mot de passe
export async function generatePasswordResetLink(email: string): Promise<string | null> {
  try {
    // Utiliser la méthode standard de Supabase qui ne nécessite pas de privilèges admin
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
    });

    if (error) {
      console.error('Erreur lors de la génération du lien de réinitialisation:', error);
      return null;
    }

    // La méthode resetPasswordForEmail envoie directement l'email
    // Nous retournons un lien factice pour indiquer le succès
    return 'email_sent';
  } catch (error) {
    console.error('Erreur lors de la génération du lien de réinitialisation:', error);
    return null;
  }
}

// Envoyer un email de confirmation personnalisé
export async function sendCustomEmailConfirmation(email: string, firstName?: string, lastName?: string) {
  try {
    const confirmationLink = await generateEmailConfirmationLink(email);
    if (!confirmationLink) {
      throw new Error('Impossible de générer le lien de confirmation');
    }

    const result = await sendEmailConfirmation(
      { email, first_name: firstName, last_name: lastName },
      confirmationLink
    );

    return result.success;
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email de confirmation:', error);
    return false;
  }
}

// Envoyer un email de réinitialisation de mot de passe personnalisé
export async function sendCustomPasswordReset(email: string, firstName?: string, lastName?: string) {
  console.log('🔧 [PASSWORD RESET] Début de la réinitialisation pour:', email);
  
  try {
    // Générer un lien de réinitialisation avec Supabase
    console.log('🔗 [PASSWORD RESET] Génération du lien de réinitialisation...');
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
    });

    console.log('📊 [PASSWORD RESET] Réponse de Supabase:', { data, error });

    if (error) {
      console.error('❌ [PASSWORD RESET] Erreur lors de la génération du lien:', error);
      return false;
    }

    // Créer un lien de réinitialisation personnalisé
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?email=${encodeURIComponent(email)}`;
    
    console.log('📧 [PASSWORD RESET] Envoi de l\'email via Mailjet...');
    
    // Envoyer l'email via Mailjet
    const result = await sendPasswordResetEmail(
      { email, first_name: firstName, last_name: lastName },
      resetLink
    );

    if (!result.success) {
      console.error('❌ [PASSWORD RESET] Erreur lors de l\'envoi de l\'email via Mailjet:', result.error);
      return false;
    }

    console.log('✅ [PASSWORD RESET] Email de réinitialisation envoyé avec succès à:', email);
    console.log('🔗 [PASSWORD RESET] Lien de réinitialisation:', resetLink);
    return true;
  } catch (error) {
    console.error('❌ [PASSWORD RESET] Erreur lors de l\'envoi de l\'email de réinitialisation:', error);
    return false;
  }
}

// Envoyer un email de bienvenue après inscription
export async function sendCustomWelcomeEmail(email: string, firstName: string, lastName: string) {
  console.log('🎉 [WELCOME EMAIL] Début de l\'envoi de l\'email de bienvenue');
  console.log('📧 [WELCOME EMAIL] Destinataire:', email);
  console.log('👤 [WELCOME EMAIL] Nom:', `${firstName} ${lastName}`);
  
  try {
    // Créer le contenu HTML simple pour l'email de bienvenue
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="fr">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Bienvenue chez MKB Automobile</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #1f2937; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9fafb; }
            .button { display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>MKB Automobile</h1>
            </div>
            <div class="content">
              <h2>Bienvenue ${firstName} ${lastName} !</h2>
              <p>Votre compte a été créé avec succès sur notre plateforme MKB Automobile.</p>
              <p>Vous pouvez dès maintenant vous connecter et commencer à utiliser nos services.</p>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/login" class="button">Se connecter</a>
              <p>Si vous avez des questions, n'hésitez pas à nous contacter.</p>
            </div>
            <div class="footer">
              <p>Cordialement,<br>L'équipe MKB Automobile</p>
            </div>
          </div>
        </body>
      </html>
    `;

    console.log('📄 [WELCOME EMAIL] HTML généré avec succès');
    console.log('📤 [WELCOME EMAIL] Envoi via Mailjet...');

    const result = await sendEmail({
      recipients: [{ Email: email, Name: `${firstName} ${lastName}` }],
      subject: 'Bienvenue chez MKB Automobile !',
      htmlContent,
      textContent: `Bonjour ${firstName} ${lastName}, Bienvenue chez MKB Automobile ! Votre compte a été créé avec succès. Vous pouvez dès maintenant vous connecter et commencer à utiliser notre plateforme. Cordialement, L'équipe MKB Automobile`,
    });

    console.log('✅ [WELCOME EMAIL] Email de bienvenue envoyé:', result.success);
    if (!result.success) {
      console.error('❌ [WELCOME EMAIL] Échec de l\'envoi:', result.error);
    }

    return result.success;
  } catch (error) {
    console.error('❌ [WELCOME EMAIL] Erreur lors de l\'envoi de l\'email de bienvenue:', error);
    return false;
  }
}

// Remplacer la fonction de signup de Supabase pour envoyer nos propres emails
export async function customSignUp(email: string, password: string, firstName: string, lastName: string) {
  console.log('🚀 [SIGNUP] Début de l\'inscription utilisateur');
  console.log('📧 [SIGNUP] Email:', email);
  console.log('👤 [SIGNUP] Prénom reçu:', firstName);
  console.log('👤 [SIGNUP] Nom reçu:', lastName);
  console.log('👤 [SIGNUP] Nom complet:', `${firstName} ${lastName}`);
  
  try {
    // Créer l'utilisateur sans confirmation automatique
    console.log('👤 [SIGNUP] Création de l\'utilisateur dans Supabase...');
    console.log('👤 [SIGNUP] Metadata à envoyer:', {
      first_name: firstName,
      last_name: lastName,
      role: 'user',
    });
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          role: 'user',
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      }
    });

    if (error) {
      console.error('❌ [SIGNUP] Erreur lors de la création de l\'utilisateur:', error);
      // Gérer spécifiquement l'erreur d'email déjà existant
      if (error.message.includes('User already registered') || 
          error.message.includes('already registered') ||
          error.message.includes('already exists') ||
          error.message.includes('duplicate key') ||
          error.message.includes('A user with this email address has already been registered') ||
          error.message.includes('User already exists')) {
        throw new Error('Un compte avec cette adresse email existe déjà. Veuillez vous connecter ou utiliser une autre adresse email.');
      }
      
      // Gérer d'autres erreurs courantes
      if (error.message.includes('Password should be at least')) {
        throw new Error('Le mot de passe doit contenir au moins 6 caractères.');
      }
      
      if (error.message.includes('Invalid email')) {
        throw new Error('Veuillez saisir une adresse email valide.');
      }
      
      // Erreur générique pour les autres cas
      throw new Error('Erreur lors de la création du compte. Veuillez réessayer.');
    }

    console.log('✅ [SIGNUP] Utilisateur créé avec succès dans Supabase');
    console.log('🆔 [SIGNUP] User ID:', data.user?.id);

    // Envoyer seulement l'email de bienvenue (pas de confirmation personnalisée pour l'instant)
    if (data.user) {
      console.log('📧 [SIGNUP] Envoi de l\'email de bienvenue...');
      try {
        await sendCustomWelcomeEmail(email, firstName, lastName);
        console.log('✅ [SIGNUP] Email de bienvenue envoyé avec succès');
      } catch (emailError) {
        console.error('❌ [SIGNUP] Erreur lors de l\'envoi de l\'email de bienvenue:', emailError);
        // Ne pas faire échouer l'inscription si l'email échoue
      }
    }

    console.log('🎉 [SIGNUP] Inscription terminée avec succès');
    return { data, error: null };
  } catch (error) {
    console.error('❌ [SIGNUP] Erreur lors de l\'inscription:', error);
    return { data: null, error };
  }
}

// Remplacer la fonction de réinitialisation de mot de passe de Supabase
export async function customResetPassword(email: string) {
  try {
    // Récupérer les informations de l'utilisateur
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('prenom, nom')
      .eq('email', email)
      .single();

    if (userError && userError.code !== 'PGRST116') {
      console.error('Erreur lors de la récupération des informations utilisateur:', userError);
    }

    // Envoyer notre propre email de réinitialisation
    const success = await sendCustomPasswordReset(
      email, 
      userData?.prenom, 
      userData?.nom
    );

    return { success, error: null };
  } catch (error) {
    console.error('Erreur lors de la réinitialisation du mot de passe:', error);
    return { success: false, error };
  }
}