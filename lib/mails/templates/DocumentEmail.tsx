import React from 'react';

interface DocumentEmailProps {
    recipientName: string;
    recipientEmail: string;
    documentType: 'devis' | 'facture';
    documentNumber: string;
    vehicleInfo: string;
    message?: string;
    companyInfo?: {
        name: string;
        address: string;
        phone: string;
        email: string;
        website: string;
        siret: string;
        tva: string;
    };
}

export const DocumentEmail: React.FC<DocumentEmailProps> = ({
    recipientName,
    recipientEmail,
    documentType,
    documentNumber,
    vehicleInfo,
    message,
    companyInfo = {
        name: 'MKB Automobile',
        address: '123 Rue de l\'Automobile, 75000 Paris',
        phone: '+33 1 23 45 67 89',
        email: 'contact@mkbautomobile.fr',
        website: 'www.mkbautomobile.fr',
        siret: '12345678901234',
        tva: 'FR12345678901',
    }
}) => {
    const documentTypeCapitalized = documentType === 'devis' ? 'Devis' : 'Facture';
    const currentDate = new Date().toLocaleDateString('fr-FR');

    return (
        <div style={{
            fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
            lineHeight: 1.6,
            color: '#333',
            backgroundColor: '#f4f4f4',
            padding: '20px 0',
            margin: 0
        }}>
            <div style={{
                maxWidth: '600px',
                margin: '0 auto',
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}>
                {/* Header */}
                <div style={{
                    background: 'linear-gradient(135deg, #2bbbdc 0%, #1a9bb8 100%)',
                    color: 'white',
                    padding: '30px 20px',
                    textAlign: 'center'
                }}>
                    <h1 style={{
                        fontSize: '28px',
                        fontWeight: 600,
                        marginBottom: '5px',
                        margin: 0
                    }}>
                        {companyInfo.name}
                    </h1>
                    <p style={{
                        fontSize: '18px',
                        opacity: 0.9,
                        margin: '10px 0'
                    }}>
                        {documentTypeCapitalized} {documentNumber}
                    </p>
                    <div style={{
                        backgroundColor: '#2bbbdc',
                        color: 'white',
                        padding: '8px 15px',
                        borderRadius: '20px',
                        display: 'inline-block',
                        fontWeight: 600,
                        marginTop: '10px'
                    }}>
                        Date: {currentDate}
                    </div>
                </div>

                {/* Content */}
                <div style={{ padding: '30px 20px' }}>
                    <div style={{
                        fontSize: '18px',
                        marginBottom: '25px',
                        color: '#2c3e50'
                    }}>
                        Bonjour <strong>{recipientName}</strong>,
                    </div>

                    <div style={{
                        fontSize: '16px',
                        marginBottom: '25px',
                        color: '#555'
                    }}>
                        Veuillez trouver ci-joint votre <strong>{documentType}</strong> <strong>{documentNumber}</strong> pour le véhicule suivant :
                    </div>

                    {/* Vehicle Information */}
                    <div style={{
                        backgroundColor: '#f8f9fa',
                        borderLeft: '4px solid #2bbbdc',
                        padding: '20px',
                        margin: '25px 0',
                        borderRadius: '0 5px 5px 0'
                    }}>
                        <h3 style={{
                            color: '#2c3e50',
                            fontSize: '18px',
                            marginBottom: '10px',
                            margin: 0
                        }}>
                            🚗 Informations du véhicule
                        </h3>
                        <p style={{
                            color: '#555',
                            fontSize: '16px',
                            fontWeight: 500,
                            margin: 0
                        }}>
                            {vehicleInfo}
                        </p>
                    </div>

                    {/* Custom Message */}
                    {message && (
                        <div style={{
                            backgroundColor: '#fff3cd',
                            border: '1px solid #ffeaa7',
                            padding: '20px',
                            margin: '25px 0',
                            borderRadius: '5px'
                        }}>
                            <h4 style={{
                                color: '#856404',
                                fontSize: '16px',
                                marginBottom: '10px',
                                margin: 0
                            }}>
                                💬 Message de l&apos;équipe {companyInfo.name}
                            </h4>
                            <p style={{
                                color: '#856404',
                                fontSize: '14px',
                                lineHeight: 1.6,
                                margin: 0
                            }}>
                                {message}
                            </p>
                        </div>
                    )}

                    {/* Next Steps */}
                    <div style={{
                        backgroundColor: '#e8f5e8',
                        border: '1px solid #c3e6c3',
                        padding: '20px',
                        margin: '25px 0',
                        borderRadius: '5px'
                    }}>
                        <h3 style={{
                            color: '#2d5a2d',
                            fontSize: '18px',
                            marginBottom: '15px',
                            margin: 0
                        }}>
                            📋 Prochaines étapes
                        </h3>
                        <ul style={{
                            color: '#2d5a2d',
                            fontSize: '14px',
                            lineHeight: 1.6,
                            paddingLeft: '20px',
                            margin: 0
                        }}>
                            <li style={{ marginBottom: '8px' }}>Examinez attentivement le {documentType}</li>
                            <li style={{ marginBottom: '8px' }}>Contactez-nous pour toute question ou modification</li>
                            <li style={{ marginBottom: '8px' }}>Confirmez votre accord par email ou téléphone</li>
                            <li style={{ marginBottom: '8px' }}>Nous procéderons selon vos instructions</li>
                        </ul>
                    </div>

                    {/* Company Information */}
                    <div style={{
                        backgroundColor: '#f8f9fa',
                        padding: '20px',
                        margin: '25px 0',
                        borderRadius: '5px',
                        border: '1px solid #e9ecef'
                    }}>
                        <h3 style={{
                            color: '#2c3e50',
                            fontSize: '18px',
                            marginBottom: '15px',
                            margin: 0
                        }}>
                            📞 Nos coordonnées
                        </h3>
                        <div style={{
                            color: '#555',
                            fontSize: '14px',
                            lineHeight: 1.8
                        }}>
                            <p style={{ marginBottom: '5px' }}><strong>{companyInfo.name}</strong></p>
                            <p style={{ marginBottom: '5px' }}>📍 {companyInfo.address}</p>
                            <p style={{ marginBottom: '5px' }}>📧 {companyInfo.email}</p>
                            <p style={{ marginBottom: '5px' }}>📞 {companyInfo.phone}</p>
                            <p style={{ marginBottom: '5px' }}>🌐 {companyInfo.website}</p>
                            <p style={{ marginBottom: '5px' }}>SIRET: {companyInfo.siret}</p>
                            <p style={{ marginBottom: '5px' }}>TVA: {companyInfo.tva}</p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div style={{
                    backgroundColor: '#2c3e50',
                    color: 'white',
                    padding: '20px',
                    textAlign: 'center',
                    fontSize: '14px'
                }}>
                    <p style={{ marginBottom: '5px' }}>
                        Pour toute question concernant ce {documentType}, n&apos;hésitez pas à nous contacter.
                    </p>
                    <p style={{ marginBottom: '5px', fontSize: '12px', opacity: 0.8 }}>
                        Cet email a été envoyé à {recipientEmail}
                    </p>
                    <p style={{ margin: 0, fontSize: '12px', opacity: 0.8 }}>
                        © {new Date().getFullYear()} {companyInfo.name}. Tous droits réservés.
                    </p>
                </div>
            </div>
        </div>
    );
}; 