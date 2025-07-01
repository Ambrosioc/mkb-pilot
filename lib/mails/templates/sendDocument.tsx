/* eslint-disable react/no-unescaped-entities */
import { BaseEmail } from '../base';

interface SendDocumentTemplateProps {
  recipientName: string;
  recipientEmail: string;
  documentType: 'devis' | 'facture';
  documentNumber: string;
  vehicleInfo: string;
  message?: string;
  downloadLink?: string;
}

export const SendDocumentTemplate = ({
  recipientName,
  recipientEmail,
  documentType,
  documentNumber,
  vehicleInfo,
  message,
  downloadLink
}: SendDocumentTemplateProps) => {
  const documentTypeCapitalized = documentType === 'devis' ? 'Devis' : 'Facture';

  return (
    <BaseEmail
      title={`${documentTypeCapitalized} ${documentNumber} - MKB Automobile`}
      previewText={`Votre ${documentType} ${documentNumber} pour ${vehicleInfo}`}
    >
      {/* Header */}
      <div style={{
        padding: '20px 0',
        textAlign: 'center',
        borderBottom: '1px solid #eee'
      }}>
        <h1 style={{
          color: '#333',
          fontSize: '24px',
          margin: '0'
        }}>
          MKB Automobile
        </h1>
        <p style={{
          color: '#666',
          fontSize: '16px',
          margin: '10px 0 0'
        }}>
          {documentTypeCapitalized} {documentNumber}
        </p>
      </div>

      {/* Content */}
      <div style={{ padding: '20px 0' }}>
        <h2 style={{
          color: '#333',
          fontSize: '20px',
          marginBottom: '20px'
        }}>
          Bonjour {recipientName},
        </h2>

        <p style={{
          color: '#666',
          fontSize: '16px',
          lineHeight: '1.6',
          marginBottom: '20px'
        }}>
          Veuillez trouver ci-joint votre <strong>{documentType}</strong>
          <strong> {documentNumber}</strong> pour le véhicule suivant :
        </p>

        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '20px',
          borderRadius: '5px',
          marginBottom: '20px',
          borderLeft: '4px solid #2bbbdc'
        }}>
          <h3 style={{
            color: '#333',
            fontSize: '18px',
            margin: '0 0 10px'
          }}>
            Informations du véhicule
          </h3>
          <p style={{
            color: '#666',
            fontSize: '16px',
            margin: '0',
            lineHeight: '1.6'
          }}>
            {vehicleInfo}
          </p>
        </div>

        {message && (
          <div style={{
            backgroundColor: '#fff3cd',
            border: '1px solid #ffeaa7',
            padding: '15px',
            borderRadius: '5px',
            marginBottom: '20px'
          }}>
            <h4 style={{
              color: '#856404',
              fontSize: '16px',
              margin: '0 0 10px'
            }}>
              Message de l'équipe MKB Automobile
            </h4>
            <p style={{
              color: '#856404',
              fontSize: '14px',
              margin: '0',
              lineHeight: '1.6'
            }}>
              {message}
            </p>
          </div>
        )}

        <div style={{
          backgroundColor: '#e8f5e8',
          border: '1px solid #c3e6c3',
          padding: '20px',
          borderRadius: '5px',
          marginBottom: '30px'
        }}>
          <h3 style={{
            color: '#2d5a2d',
            fontSize: '18px',
            margin: '0 0 15px'
          }}>
            Prochaines étapes
          </h3>
          <ul style={{
            color: '#2d5a2d',
            fontSize: '14px',
            lineHeight: '1.6',
            margin: '0',
            paddingLeft: '20px'
          }}>
            <li>Examinez attentivement le {documentType}</li>
            <li>Contactez-nous pour toute question ou modification</li>
            <li>Confirmez votre accord par email ou téléphone</li>
            <li>Nous procéderons selon vos instructions</li>
          </ul>
        </div>

        {downloadLink && (
          <div style={{ textAlign: 'center', margin: '30px 0' }}>
            <a
              href={downloadLink}
              style={{
                backgroundColor: '#2bbbdc',
                color: '#fff',
                padding: '12px 24px',
                textDecoration: 'none',
                borderRadius: '5px',
                display: 'inline-block',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            >
              Télécharger le {documentType}
            </a>
          </div>
        )}

        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '20px',
          borderRadius: '5px',
          marginTop: '30px'
        }}>
          <h3 style={{
            color: '#333',
            fontSize: '18px',
            margin: '0 0 15px'
          }}>
            Nos coordonnées
          </h3>
          <div style={{
            color: '#666',
            fontSize: '14px',
            lineHeight: '1.6'
          }}>
            <p style={{ margin: '0 0 5px' }}>
              <strong>MKB Automobile</strong><br />
              📧 contact@mkbautomobile.com<br />
              📞 +33 1 23 45 67 89<br />
              🌐 www.mkbautomobile.com
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        borderTop: '1px solid #eee',
        padding: '20px 0',
        textAlign: 'center',
        color: '#666'
      }}>
        <p style={{ margin: '0 0 10px' }}>
          Pour toute question concernant ce {documentType}, n'hésitez pas à nous contacter.
        </p>
        <p style={{ margin: '0', fontSize: '12px' }}>
          Cet email a été envoyé à {recipientEmail}
        </p>
      </div>
    </BaseEmail>
  );
};