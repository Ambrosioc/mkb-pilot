import { EmailLayout } from '../layout/EmailLayout';

interface ResetPasswordEmailProps {
    user: {
        prenom: string;
        nom: string;
        email: string;
    };
    newPassword: string;
    resetBy: string;
}

export function ResetPasswordEmail({ user, newPassword, resetBy }: ResetPasswordEmailProps) {
    return (
        <EmailLayout>
            <div style={{ padding: '20px', backgroundColor: '#ffffff' }}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <h1 style={{ color: '#1e40af', fontSize: '24px', margin: '0' }}>
                        Réinitialisation de votre mot de passe
                    </h1>
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <p style={{ fontSize: '16px', color: '#374151', margin: '0 0 15px 0' }}>
                        Bonjour <strong>{user.prenom} {user.nom}</strong>,
                    </p>

                    <p style={{ fontSize: '16px', color: '#374151', margin: '0 0 15px 0' }}>
                        Votre mot de passe a été réinitialisé par <strong>{resetBy}</strong>.
                    </p>

                    <div style={{
                        backgroundColor: '#f3f4f6',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        padding: '20px',
                        margin: '20px 0',
                        textAlign: 'center'
                    }}>
                        <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 10px 0' }}>
                            Votre nouveau mot de passe temporaire :
                        </p>
                        <div style={{
                            backgroundColor: '#ffffff',
                            border: '2px solid #1e40af',
                            borderRadius: '6px',
                            padding: '15px',
                            margin: '10px 0',
                            fontFamily: 'monospace',
                            fontSize: '18px',
                            fontWeight: 'bold',
                            color: '#1e40af',
                            letterSpacing: '2px'
                        }}>
                            {newPassword}
                        </div>
                    </div>

                    <div style={{
                        backgroundColor: '#fef3c7',
                        border: '1px solid #f59e0b',
                        borderRadius: '8px',
                        padding: '15px',
                        margin: '20px 0'
                    }}>
                        <p style={{ fontSize: '14px', color: '#92400e', margin: '0' }}>
                            <strong>⚠️ Important :</strong> Ce mot de passe est temporaire.
                            Veuillez vous connecter et le changer immédiatement pour des raisons de sécurité.
                        </p>
                    </div>

                    <div style={{
                        backgroundColor: '#ecfdf5',
                        border: '1px solid #10b981',
                        borderRadius: '8px',
                        padding: '15px',
                        margin: '20px 0'
                    }}>
                        <p style={{ fontSize: '14px', color: '#065f46', margin: '0' }}>
                            <strong>🔐 Sécurité :</strong>
                            Ne partagez jamais votre mot de passe avec qui que ce soit.
                            L'équipe MKB ne vous demandera jamais votre mot de passe par email ou téléphone.
                        </p>
                    </div>
                </div>

                <div style={{
                    borderTop: '1px solid #e5e7eb',
                    paddingTop: '20px',
                    marginTop: '30px',
                    textAlign: 'center'
                }}>
                    <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 10px 0' }}>
                        Si vous n'avez pas demandé cette réinitialisation, contactez immédiatement votre administrateur.
                    </p>

                    <p style={{ fontSize: '14px', color: '#6b7280', margin: '0' }}>
                        <strong>MKB Dashboard</strong><br />
                        Support technique : support@mkbautomobile.fr
                    </p>
                </div>
            </div>
        </EmailLayout>
    );
} 