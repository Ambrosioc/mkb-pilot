import { sendEmail } from '@/lib/mailjet';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Template HTML simple pour l'email de réinitialisation
function generateResetPasswordEmail(user: any, newPassword: string, resetBy: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Réinitialisation de votre mot de passe</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { color: #1e40af; font-size: 24px; margin: 0; }
        .content { margin-bottom: 20px; }
        .password-box { 
          background-color: #f3f4f6; 
          border: 1px solid #d1d5db; 
          border-radius: 8px; 
          padding: 20px; 
          margin: 20px 0;
          text-align: center;
        }
        .password-display { 
          background-color: #ffffff; 
          border: 2px solid #1e40af; 
          border-radius: 6px; 
          padding: 15px; 
          margin: 10px 0;
          font-family: monospace;
          font-size: 18px;
          font-weight: bold;
          color: #1e40af;
          letter-spacing: 2px;
        }
        .warning { 
          background-color: #fef3c7; 
          border: 1px solid #f59e0b; 
          border-radius: 8px; 
          padding: 15px; 
          margin: 20px 0;
        }
        .security { 
          background-color: #ecfdf5; 
          border: 1px solid #10b981; 
          border-radius: 8px; 
          padding: 15px; 
          margin: 20px 0;
        }
        .footer { 
          border-top: 1px solid #e5e7eb; 
          padding-top: 20px; 
          margin-top: 30px;
          text-align: center;
          font-size: 14px;
          color: #6b7280;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Réinitialisation de votre mot de passe</h1>
        </div>
        
        <div class="content">
          <p style="font-size: 16px; color: #374151; margin: 0 0 15px 0;">
            Bonjour <strong>${user.prenom} ${user.nom}</strong>,
          </p>
          
          <p style="font-size: 16px; color: #374151; margin: 0 0 15px 0;">
            Votre mot de passe a été réinitialisé par <strong>${resetBy}</strong>.
          </p>

          <div class="password-box">
            <p style="font-size: 14px; color: #6b7280; margin: 0 0 10px 0;">
              Votre nouveau mot de passe temporaire :
            </p>
            <div class="password-display">
              ${newPassword}
            </div>
          </div>

          <div class="warning">
            <p style="font-size: 14px; color: #92400e; margin: 0;">
              <strong>⚠️ Important :</strong> Ce mot de passe est temporaire. 
              Veuillez vous connecter et le changer immédiatement pour des raisons de sécurité.
            </p>
          </div>

          <div class="security">
            <p style="font-size: 14px; color: #065f46; margin: 0;">
              <strong>🔐 Sécurité :</strong> 
              Ne partagez jamais votre mot de passe avec qui que ce soit. 
              L'équipe MKB ne vous demandera jamais votre mot de passe par email ou téléphone.
            </p>
          </div>
        </div>

        <div class="footer">
          <p style="margin: 0 0 10px 0;">
            Si vous n'avez pas demandé cette réinitialisation, contactez immédiatement votre administrateur.
          </p>
          
          <p style="margin: 0;">
            <strong>MKB Dashboard</strong><br />
            Support technique : support@mkbautomobile.fr
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export async function POST(request: NextRequest) {
  try {
    const { userId, newPassword, resetBy } = await request.json();

    if (!userId || !newPassword || !resetBy) {
      return NextResponse.json(
        { error: 'Paramètres manquants' },
        { status: 400 }
      );
    }

    // 1. Mettre à jour le mot de passe dans Supabase Auth
    const { error: authError } = await supabase.auth.admin.updateUserById(userId, {
      password: newPassword
    });

    if (authError) {
      console.error('Erreur lors de la mise à jour du mot de passe:', authError);
      return NextResponse.json(
        { error: 'Erreur lors de la réinitialisation du mot de passe' },
        { status: 500 }
      );
    }

    // 2. Récupérer les informations de l'utilisateur
    const { data: user, error: userError } = await supabase
      .from('users')
      .select(`
        *,
        user_roles(
          role_id,
          date_attribution,
          roles(
            id,
            nom,
            niveau,
            description
          )
        )
      `)
      .eq('id', userId)
      .single();

    if (userError || !user) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', userError);
      return NextResponse.json(
        { error: 'Utilisateur introuvable' },
        { status: 404 }
      );
    }

    // 3. Vérifier si Mailjet est configuré et envoyer l'email
    const isMailjetConfigured = process.env.MAILJET_API_KEY && process.env.MAILJET_SECRET_KEY;

    if (isMailjetConfigured) {
      try {
        // Générer le contenu HTML de l'email
        const htmlContent = generateResetPasswordEmail(user, newPassword, resetBy);

        // Envoyer l'email
        await sendEmail({
          subject: 'Réinitialisation de votre mot de passe',
          htmlContent,
          recipients: [{ Email: user.email, Name: `${user.prenom} ${user.nom}` }],
        });
      } catch (emailError) {
        console.warn('Erreur lors de l\'envoi de l\'email (le mot de passe a quand même été réinitialisé):', emailError);
      }
    } else {
      console.warn('Mailjet non configuré - l\'email de réinitialisation n\'a pas été envoyé');
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Mot de passe réinitialisé avec succès',
      newPassword 
    });

  } catch (error) {
    console.error('Erreur lors de la réinitialisation du mot de passe:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
} 