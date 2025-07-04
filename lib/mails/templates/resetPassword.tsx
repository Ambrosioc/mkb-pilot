import { BaseEmail } from '../base';
import { ResetPasswordProps } from '../types';

/**
 * Template d'email de réinitialisation de mot de passe
 */
export function ResetPasswordTemplate({
  recipientEmail,
  recipientName,
  token,
  ctaLink,
  expiresIn = '1 heure',
  previewText
}: ResetPasswordProps) {
  return (
    <BaseEmail
      title="Réinitialisation de votre mot de passe"
      previewText={previewText || `Réinitialisation du mot de passe pour ${recipientEmail}`}
    >
      <h1 style={{ color: '#2bbbdc', textAlign: 'center', marginBottom: '20px' }}>
        Réinitialisation de votre mot de passe
      </h1>

      <p>Bonjour {recipientName},</p>

      <p>
        Vous avez demandé la réinitialisation de votre mot de passe pour le compte associé à l'adresse <strong>{recipientEmail}</strong>.
      </p>

      <p style={{ color: '#666', fontSize: '16px', lineHeight: '1.6', marginBottom: '20px' }}>
        Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe&nbsp;:
      </p>

      <div style={{ textAlign: 'center', margin: '30px 0' }}>
        <a href={ctaLink} className="button">
          Réinitialiser mon mot de passe
        </a>
      </div>

      <p style={{ color: '#666', fontSize: '16px', lineHeight: '1.6', marginBottom: '20px' }}>
        Vous recevez cet email car vous avez demandé la réinitialisation de votre mot de passe sur MKB Automobile. Si ce n&apos;est pas le cas, ignorez cet email.
      </p>

      <p style={{ color: '#666', fontSize: '16px', lineHeight: '1.6', marginBottom: '20px' }}>
        Ce lien expirera dans 1 heure.
      </p>

      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '5px', fontSize: '12px' }}>
        <p style={{ margin: '0' }}>
          Si le bouton ne fonctionne pas, vous pouvez copier et coller le lien suivant dans votre navigateur :
        </p>
        <p style={{ margin: '10px 0', wordBreak: 'break-all' }}>
          <a href={ctaLink} style={{ color: '#2bbbdc' }}>{ctaLink}</a>
        </p>
      </div>

      <p style={{ color: '#666', fontSize: '16px', lineHeight: '1.6', marginBottom: '20px' }}>
        Cordialement,<br />L&apos;équipe MKB Automobile
      </p>
    </BaseEmail>
  );
}