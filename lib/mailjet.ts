import createClient from 'node-mailjet';

// Types pour les emails
export interface EmailAttachment {
  ContentType: string;
  Filename: string;
  Base64Content: string;
}

export interface EmailRecipient {
  Email: string;
  Name?: string;
}

export interface EmailOptions {
  subject: string;
  htmlContent: string;
  textContent?: string;
  recipients: EmailRecipient[];
  attachments?: EmailAttachment[];
  templateId?: number;
  templateVariables?: Record<string, any>;
  cc?: EmailRecipient[];
  bcc?: EmailRecipient[];
  replyTo?: EmailRecipient;
}

// Initialisation du client Mailjet
export const mailjet = new createClient({
  apiKey: process.env.MAILJET_API_KEY || '',
  apiSecret: process.env.MAILJET_SECRET_KEY || '',
});

// Fonction pour envoyer un email
export async function sendEmail(options: EmailOptions) {
  const {
    subject,
    htmlContent,
    textContent,
    recipients,
    attachments = [],
    templateId,
    templateVariables,
    cc = [],
    bcc = [],
    replyTo,
  } = options;

  // Logs de debug pour le développement uniquement
  if (process.env.NODE_ENV === 'development') {
    console.log('MAILJET: Envoi d\'email - Sujet:', subject);
    console.log('MAILJET: Destinataires:', recipients.map(r => r.Email));
  }

  try {
    // Préparer les données pour l'API Mailjet
    const data = {
      Messages: [
        {
          From: {
            Email: process.env.MAILJET_SENDER_EMAIL,
            Name: process.env.MAILJET_SENDER_NAME,
          },
          To: recipients,
          Subject: subject,
          HTMLPart: htmlContent,
          TextPart: textContent,
          Attachments: attachments,
          ...(templateId && { TemplateID: templateId }),
          ...(templateVariables && { Variables: templateVariables }),
          ...(cc.length > 0 && { Cc: cc }),
          ...(bcc.length > 0 && { Bcc: bcc }),
          ...(replyTo && { ReplyTo: replyTo }),
          CustomID: `mkb-${Date.now()}`,
        },
      ],
    };

    // Envoyer l'email via l'API Mailjet
    const result = await mailjet.post('send', { version: 'v3.1' }).request(data);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('MAILJET: Email envoyé avec succès - Message ID:', (result.body as any).Messages?.[0]?.MessageID);
    }
    
    return {
      success: true,
      messageId: (result.body as any).Messages?.[0]?.MessageID,
      data: result.body,
    };
  } catch (error) {
    console.error('MAILJET: Erreur lors de l\'envoi de l\'email:', error instanceof Error ? error.message : 'Erreur inconnue');
    return {
      success: false,
      error: error,
    };
  }
}

// Fonction pour envoyer un email de bienvenue
export async function sendWelcomeEmail(user: { email: string; first_name: string; last_name: string }) {
  const { email, first_name, last_name } = user;
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Bienvenue chez MKB Pilot</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { max-width: 150px; }
        .content { background-color: #f9f9f9; padding: 20px; border-radius: 5px; }
        .footer { margin-top: 30px; font-size: 12px; color: #777; text-align: center; }
        .button { display: inline-block; background-color: #2bbbdc; color: white; padding: 10px 20px; 
                 text-decoration: none; border-radius: 5px; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="https://example.com/logo.png" alt="MKB Pilot" class="logo">
          <h1>Bienvenue chez MKB Pilot !</h1>
        </div>
        <div class="content">
          <p>Bonjour ${first_name} ${last_name},</p>
          <p>Nous sommes ravis de vous accueillir sur la plateforme MKB Pilot. Votre compte a été créé avec succès.</p>
          <p>Vous pouvez dès maintenant vous connecter et commencer à utiliser notre plateforme.</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/login" class="button">Se connecter</a>
          </p>
          <p>Si vous avez des questions, n'hésitez pas à contacter notre équipe support.</p>
          <p>Cordialement,<br>L'équipe MKB Pilot</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} MKB Pilot. Tous droits réservés.</p>
          <p>Cet email a été envoyé à ${email}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    subject: 'Bienvenue chez MKB Pilot',
    htmlContent,
    textContent: `Bonjour ${first_name} ${last_name}, Bienvenue chez MKB Pilot ! Votre compte a été créé avec succès. Vous pouvez dès maintenant vous connecter et commencer à utiliser notre plateforme. Cordialement, L'équipe MKB Pilot`,
    recipients: [{ Email: email, Name: `${first_name} ${last_name}` }],
  });
}

// Fonction pour envoyer un email de confirmation d'adresse email
export async function sendEmailConfirmation(user: { email: string; first_name?: string; last_name?: string }, confirmationLink: string) {
  const { email, first_name = '', last_name = '' } = user;
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Confirmation de votre adresse email</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { max-width: 150px; }
        .content { background-color: #f9f9f9; padding: 20px; border-radius: 5px; }
        .footer { margin-top: 30px; font-size: 12px; color: #777; text-align: center; }
        .button { display: inline-block; background-color: #2bbbdc; color: white; padding: 10px 20px; 
                 text-decoration: none; border-radius: 5px; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="https://example.com/logo.png" alt="MKB Pilot" class="logo">
          <h1>Confirmation de votre adresse email</h1>
        </div>
        <div class="content">
          <p>Bonjour ${first_name} ${last_name},</p>
          <p>Merci de confirmer votre adresse email en cliquant sur le bouton ci-dessous :</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="${confirmationLink}" class="button">Confirmer mon email</a>
          </p>
          <p>Si vous n'avez pas demandé cette confirmation, vous pouvez ignorer cet email.</p>
          <p>Ce lien expirera dans 24 heures.</p>
          <p>Cordialement,<br>L'équipe MKB Pilot</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} MKB Pilot. Tous droits réservés.</p>
          <p>Cet email a été envoyé à ${email}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    subject: 'Confirmation de votre adresse email - MKB Pilot',
    htmlContent,
    textContent: `Bonjour ${first_name} ${last_name}, Merci de confirmer votre adresse email en cliquant sur le lien suivant : ${confirmationLink}. Si vous n'avez pas demandé cette confirmation, vous pouvez ignorer cet email. Ce lien expirera dans 24 heures. Cordialement, L'équipe MKB Pilot`,
    recipients: [{ Email: email, Name: `${first_name} ${last_name}` }],
  });
}

// Fonction pour envoyer un email de réinitialisation de mot de passe
export async function sendPasswordResetEmail(user: { email: string; first_name?: string; last_name?: string }, resetLink: string) {
  const { email, first_name = '', last_name = '' } = user;
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Réinitialisation de votre mot de passe</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { max-width: 150px; }
        .content { background-color: #f9f9f9; padding: 20px; border-radius: 5px; }
        .footer { margin-top: 30px; font-size: 12px; color: #777; text-align: center; }
        .button { display: inline-block; background-color: #2bbbdc; color: white; padding: 10px 20px; 
                 text-decoration: none; border-radius: 5px; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="https://example.com/logo.png" alt="MKB Pilot" class="logo">
          <h1>Réinitialisation de votre mot de passe</h1>
        </div>
        <div class="content">
          <p>Bonjour ${first_name} ${last_name},</p>
          <p>Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" class="button">Réinitialiser mon mot de passe</a>
          </p>
          <p>Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email.</p>
          <p>Ce lien expirera dans 1 heure.</p>
          <p>Cordialement,<br>L'équipe MKB Pilot</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} MKB Pilot. Tous droits réservés.</p>
          <p>Cet email a été envoyé à ${email}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    subject: 'Réinitialisation de votre mot de passe - MKB Pilot',
    htmlContent,
    textContent: `Bonjour ${first_name} ${last_name}, Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le lien suivant pour créer un nouveau mot de passe : ${resetLink}. Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email. Ce lien expirera dans 1 heure. Cordialement, L'équipe MKB Pilot`,
    recipients: [{ Email: email, Name: `${first_name} ${last_name}` }],
  });
}

// Fonction pour envoyer un document (devis/facture) par email
export async function sendDocumentEmail(
  recipient: { email: string; name: string },
  document: { 
    type: 'devis' | 'facture';
    number: string;
    pdfBase64: string;
    vehicleInfo: string;
  },
  message?: string
) {
  const { email, name } = recipient;
  const { type, number, pdfBase64, vehicleInfo } = document;
  
  const documentType = type === 'devis' ? 'Devis' : 'Facture';
  const fileName = `${documentType}_${number}.pdf`;
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${documentType} ${number} - MKB Pilot</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { max-width: 150px; }
        .content { background-color: #f9f9f9; padding: 20px; border-radius: 5px; }
        .footer { margin-top: 30px; font-size: 12px; color: #777; text-align: center; }
        .button { display: inline-block; background-color: #2bbbdc; color: white; padding: 10px 20px; 
                 text-decoration: none; border-radius: 5px; font-weight: bold; }
        .message { border-left: 4px solid #2bbbdc; padding-left: 15px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="https://example.com/logo.png" alt="MKB Pilot" class="logo">
          <h1>Votre ${documentType.toLowerCase()} ${number}</h1>
        </div>
        <div class="content">
          <p>Bonjour ${name},</p>
          <p>Veuillez trouver ci-joint votre ${documentType.toLowerCase()} ${number} pour le véhicule :</p>
          <p><strong>${vehicleInfo}</strong></p>
          
          ${message ? `<div class="message"><p>${message}</p></div>` : ''}
          
          <p>Le document est également disponible en pièce jointe à cet email.</p>
          <p>Pour toute question concernant ce ${documentType.toLowerCase()}, n'hésitez pas à nous contacter.</p>
          <p>Cordialement,<br>L'équipe MKB Pilot</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} MKB Pilot. Tous droits réservés.</p>
          <p>Cet email a été envoyé à ${email}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    subject: `${documentType} ${number} - MKB Pilot`,
    htmlContent,
    textContent: `Bonjour ${name}, Veuillez trouver ci-joint votre ${documentType.toLowerCase()} ${number} pour le véhicule : ${vehicleInfo}. ${message ? `Message : ${message}` : ''} Pour toute question concernant ce ${documentType.toLowerCase()}, n'hésitez pas à nous contacter. Cordialement, L'équipe MKB Pilot`,
    recipients: [{ Email: email, Name: name }],
    attachments: [
      {
        ContentType: 'application/pdf',
        Filename: fileName,
        Base64Content: pdfBase64,
      },
    ],
  });
}