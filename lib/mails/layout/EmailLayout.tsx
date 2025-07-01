import React from 'react';

interface EmailLayoutProps {
    children: React.ReactNode;
    title?: string;
    previewText?: string;
}

export const EmailLayout: React.FC<EmailLayoutProps> = ({
    children,
    title = 'MKB Automobile',
    previewText
}) => {
    return (
        <html lang="fr">
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>{title}</title>
                {previewText && <meta name="description" content={previewText} />}
                <style dangerouslySetInnerHTML={{
                    __html: `
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            
            * { margin: 0; padding: 0; box-sizing: border-box; }
            
            body { 
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background-color: #f3f4f6;
              padding: 20px;
              line-height: 1.6;
              color: #374151;
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
              padding: 32px 20px;
              text-align: center;
            }
            
            .content {
              padding: 32px 20px;
            }
            
            .footer {
              background-color: #1f2937;
              color: white;
              padding: 24px 20px;
              text-align: center;
              font-size: 14px;
            }
            
            .btn-primary {
              display: inline-block;
              background-color: #2bbbdc;
              color: white;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 6px;
              font-weight: 600;
              margin: 16px 0;
              transition: background-color 0.2s;
            }
            
            .btn-primary:hover {
              background-color: #1a9bb8;
            }
            
            .section-info {
              background-color: #f8fafc;
              border-left: 4px solid #2bbbdc;
              padding: 20px;
              margin: 20px 0;
              border-radius: 0 6px 6px 0;
            }
            
            .section-warning {
              background-color: #fef3c7;
              border: 1px solid #f59e0b;
              padding: 20px;
              margin: 20px 0;
              border-radius: 6px;
            }
            
            .section-success {
              background-color: #d1fae5;
              border: 1px solid #10b981;
              padding: 20px;
              margin: 20px 0;
              border-radius: 6px;
            }
            
            @media only screen and (max-width: 600px) {
              body { padding: 10px; }
              .email-container { margin: 0; }
              .header { padding: 24px 16px; }
              .content { padding: 24px 16px; }
              .btn-primary { display: block; text-align: center; }
            }
          `
                }} />
            </head>
            <body className="bg-gray-100 p-5 m-0 font-sans">
                <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-mkb-blue to-mkb-dark-blue text-white p-8 text-center">
                        <div className="text-3xl font-bold mb-2">MKB</div>
                        <h1 className="text-2xl font-semibold mb-2">MKB Automobile</h1>
                        <p className="text-lg opacity-90">Votre partenaire de confiance</p>
                    </div>

                    {/* Content */}
                    <div className="p-8">
                        {children}
                    </div>

                    {/* Footer */}
                    <div className="bg-mkb-black text-white p-6 text-center text-sm">
                        <p className="mb-2">Pour toute question, n&apos;hésitez pas à nous contacter</p>
                        <p className="mb-4">📧 contact@mkbautomobile.fr | 📞 +33 1 23 45 67 89</p>
                        <div className="flex justify-center space-x-4 mb-4">
                            <a href="https://www.mkbautomobile.fr" className="text-white hover:opacity-80 transition-opacity">
                                🌐 Site web
                            </a>
                            <a href="https://linkedin.com/company/mkb-automobile" className="text-white hover:opacity-80 transition-opacity">
                                💼 LinkedIn
                            </a>
                        </div>
                        <p className="text-xs opacity-70 mb-1">
                            © {new Date().getFullYear()} MKB Automobile. Tous droits réservés.
                        </p>
                        <p className="text-xs opacity-70">
                            123 Rue de l'Automobile, 75000 Paris | SIRET: 12345678901234
                        </p>
                    </div>
                </div>
            </body>
        </html>
    );
}; 