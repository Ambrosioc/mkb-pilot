import { sendEmail } from '@/lib/mailjet';
import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

// Vérification de l'authentification
async function verifyAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return null;
  }

  return data.user;
}

// Enregistrement d'un log d'envoi d'email
async function logEmailSent(
  userId: string,
  documentId: string | null,
  recipientEmail: string,
  documentType: 'devis' | 'facture' | 'autre',
  success: boolean,
  error?: string
) {
  try {
    await supabase.from('email_logs').insert({
      user_id: userId,
      document_id: documentId,
      recipient_email: recipientEmail,
      document_type: documentType,
      success,
      error_message: error,
      sent_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Erreur lors de l\'enregistrement du log d\'email:', err);
  }
}

// Route pour envoyer un email générique
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, subject, htmlContent, textContent, attachments, templateId, templateVariables } = body;

    if (!to || !Array.isArray(to) || to.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Destinataires requis' },
        { status: 400 }
      );
    }

    if (!subject) {
      return NextResponse.json(
        { success: false, error: 'Sujet requis' },
        { status: 400 }
      );
    }

    if (!htmlContent && !textContent && !templateId) {
      return NextResponse.json(
        { success: false, error: 'Contenu HTML, texte ou template requis' },
        { status: 400 }
      );
    }

    const result = await sendEmail({
      recipients: to,
      subject,
      htmlContent,
      textContent,
      attachments: attachments || [],
      templateId,
      templateVariables,
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        messageId: result.messageId,
        message: 'Email envoyé avec succès'
      });
    } else {
      console.error('SEND-EMAIL API: Échec de l\'envoi:', result.error);
      return NextResponse.json(
        {
          success: false,
          error: 'Échec de l\'envoi de l\'email',
          details: result.error
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('SEND-EMAIL API: Erreur serveur:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur serveur lors de l\'envoi de l\'email',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}

// Route pour envoyer un document (devis/facture)
export async function PUT(request: NextRequest) {
  // Vérifier l'authentification
  const user = await verifyAuth(request);
  if (!user) {
    return NextResponse.json(
      { success: false, error: 'Non autorisé' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const {
      documentId,
      recipientEmail,
      recipientName,
      documentType,
      documentNumber,
      pdfBase64,
      vehicleInfo,
      message,
      sendCopy
    } = body;

    // Validation des champs requis
    if (!recipientEmail || !documentType || !documentNumber || !pdfBase64 || !vehicleInfo) {
      return NextResponse.json(
        { success: false, error: 'Champs requis manquants' },
        { status: 400 }
      );
    }

    // Générer le HTML directement
    const documentTypeCapitalized = documentType === 'devis' ? 'Devis' : 'Facture';
    const currentDate = new Date().toLocaleDateString('fr-FR');

    const htmlContent = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${documentTypeCapitalized} ${documentNumber} - MKB Automobile</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            background-color: #f4f4f4;
            padding: 20px 0;
        }
        .email-container { 
            max-width: 600px; 
            margin: 0 auto; 
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header { 
            background: linear-gradient(135deg, #2bbbdc 0%, #1a9bb8 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
        }
        .header h1 { 
            font-size: 28px;
            font-weight: 600;
            margin-bottom: 5px;
        }
        .header .document-info { 
            font-size: 18px;
            opacity: 0.9;
        }
        .content { 
            padding: 30px 20px; 
        }
        .greeting { 
            font-size: 18px;
            margin-bottom: 25px;
            color: #2c3e50;
        }
        .main-message { 
            font-size: 16px;
            margin-bottom: 25px;
            color: #555;
        }
        .vehicle-section { 
            background-color: #f8f9fa; 
            border-left: 4px solid #2bbbdc;
            padding: 20px;
            margin: 25px 0;
            border-radius: 0 5px 5px 0;
        }
        .vehicle-section h3 { 
            color: #2c3e50;
            font-size: 18px;
            margin-bottom: 10px;
        }
        .vehicle-info { 
            color: #555;
            font-size: 16px;
            font-weight: 500;
        }
        .custom-message { 
            background-color: #fff3cd; 
            border: 1px solid #ffeaa7;
            padding: 20px;
            margin: 25px 0;
            border-radius: 5px;
        }
        .custom-message h4 { 
            color: #856404;
            font-size: 16px;
            margin-bottom: 10px;
        }
        .custom-message p { 
            color: #856404;
            font-size: 14px;
            line-height: 1.6;
        }
        .next-steps { 
            background-color: #e8f5e8; 
            border: 1px solid #c3e6c3;
            padding: 20px;
            margin: 25px 0;
            border-radius: 5px;
        }
        .next-steps h3 { 
            color: #2d5a2d;
            font-size: 18px;
            margin-bottom: 15px;
        }
        .next-steps ul { 
            color: #2d5a2d;
            font-size: 14px;
            line-height: 1.6;
            padding-left: 20px;
        }
        .next-steps li { 
            margin-bottom: 8px;
        }
        .company-info { 
            background-color: #f8f9fa; 
            padding: 20px;
            margin: 25px 0;
            border-radius: 5px;
            border: 1px solid #e9ecef;
        }
        .company-info h3 { 
            color: #2c3e50;
            font-size: 18px;
            margin-bottom: 15px;
        }
        .company-details { 
            color: #555;
            font-size: 14px;
            line-height: 1.8;
        }
        .company-details p { 
            margin-bottom: 5px;
        }
        .footer { 
            background-color: #2c3e50;
            color: white;
            padding: 20px;
            text-align: center;
            font-size: 14px;
        }
        .footer p { 
            margin-bottom: 5px;
        }
        .footer .small { 
            font-size: 12px;
            opacity: 0.8;
        }
        .document-number { 
            background-color: #2bbbdc;
            color: white;
            padding: 8px 15px;
            border-radius: 20px;
            display: inline-block;
            font-weight: 600;
            margin-top: 10px;
        }
        @media only screen and (max-width: 600px) {
            .email-container { margin: 0 10px; }
            .header { padding: 20px 15px; }
            .content { padding: 20px 15px; }
            .header h1 { font-size: 24px; }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>MKB Automobile</h1>
            <p class="document-info">${documentTypeCapitalized} ${documentNumber}</p>
            <div class="document-number">Date: ${currentDate}</div>
        </div>
        
        <div class="content">
            <div class="greeting">
                Bonjour <strong>${recipientName || recipientEmail}</strong>,
            </div>
            
            <div class="main-message">
                Veuillez trouver ci-joint votre <strong>${documentType}</strong> <strong>${documentNumber}</strong> pour le véhicule suivant :
            </div>
            
            <div class="vehicle-section">
                <h3>🚗 Informations du véhicule</h3>
                <p class="vehicle-info">${vehicleInfo}</p>
            </div>
            
            ${message ? `
            <div class="custom-message">
                <h4>💬 Message de l'équipe MKB Automobile</h4>
                <p>${message}</p>
            </div>
            ` : ''}
            
            <div class="next-steps">
                <h3>📋 Prochaines étapes</h3>
                <ul>
                    <li>Examinez attentivement le ${documentType}</li>
                    <li>Contactez-nous pour toute question ou modification</li>
                    <li>Confirmez votre accord par email ou téléphone</li>
                    <li>Nous procéderons selon vos instructions</li>
                </ul>
            </div>
            
            <div class="company-info">
                <h3>📞 Nos coordonnées</h3>
                <div class="company-details">
                    <p><strong>MKB Automobile</strong></p>
                    <p>📍 123 Rue de l'Automobile, 75000 Paris</p>
                    <p>📧 contact@mkbautomobile.fr</p>
                    <p>📞 +33 1 23 45 67 89</p>
                    <p>🌐 www.mkbautomobile.fr</p>
                    <p>SIRET: 12345678901234</p>
                    <p>TVA: FR12345678901</p>
                </div>
            </div>
        </div>
        
        <div class="footer">
            <p>Pour toute question concernant ce ${documentType}, n'hésitez pas à nous contacter.</p>
            <p class="small">Cet email a été envoyé à ${recipientEmail}</p>
            <p class="small">© ${new Date().getFullYear()} MKB Automobile. Tous droits réservés.</p>
        </div>
    </div>
</body>
</html>`;

    const textContent = `Bonjour ${recipientName || recipientEmail}, Veuillez trouver ci-joint votre ${documentType} ${documentNumber} pour le véhicule : ${vehicleInfo}. ${message ? `Message : ${message}` : ''} Pour toute question concernant ce ${documentType}, n'hésitez pas à nous contacter. Cordialement, L'équipe MKB Pilot`;

    // Préparer les destinataires
    const recipients = [{ Email: recipientEmail, Name: recipientName || recipientEmail }];

    // Ajouter l'expéditeur en copie si demandé
    const bcc = sendCopy && user.email ? [{ Email: user.email, Name: 'Moi' }] : undefined;

    // Préparer la pièce jointe
    const fileName = `${documentTypeCapitalized}_${documentNumber}.pdf`;

    const attachments = [{
      ContentType: 'application/pdf',
      Filename: fileName,
      Base64Content: pdfBase64,
    }];

    // Envoyer l'email
    const result = await sendEmail({
      subject: `${documentTypeCapitalized} ${documentNumber} - MKB Pilot`,
      htmlContent,
      textContent,
      recipients,
      attachments,
      bcc
    });

    // Enregistrer le log d'envoi
    await logEmailSent(
      user.id,
      documentId,
      recipientEmail,
      documentType,
      result.success,
      result.success ? undefined : 'Erreur lors de l\'envoi'
    );

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: 'Erreur lors de l\'envoi de l\'email' },
        { status: 500 }
      );
    }

    // Mettre à jour le statut du document si documentId est fourni
    if (documentId) {
      await supabase
        .from('sales_documents')
        .update({
          sent_by_email: true,
          status: 'sent',
          sent_at: new Date().toISOString()
        })
        .eq('id', documentId);
    }

    return NextResponse.json({
      success: true,
      messageId: result.messageId
    });
  } catch (error) {
    console.error('Erreur lors de l\'envoi du document:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}