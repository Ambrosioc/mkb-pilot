/* eslint-disable react/no-unescaped-entities */
import React from 'react';

/**
 * Composant de base pour tous les emails
 * Fournit une structure HTML commune et des styles de base
 */
export function BaseEmail({
    title,
    previewText = '',
    children
}: {
    title: string;
    previewText?: string;
    children: React.ReactNode
}) {
    return (
        <html lang="fr">
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <meta name="color-scheme" content="light" />
                <meta name="supported-color-schemes" content="light" />
                <title>{title}</title>
                {previewText && <meta name="description" content={previewText} />}
                <style dangerouslySetInnerHTML={{
                    __html: `
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 0;
            width: 100% !important;
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
            color: #333333;
            line-height: 1.6;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            max-width: 150px;
            height: auto;
          }
          .content {
            background-color: #f9f9f9;
            padding: 20px;
            border-radius: 5px;
          }
          .footer {
            margin-top: 30px;
            font-size: 12px;
            color: #777777;
            text-align: center;
          }
          .button {
            display: inline-block;
            background-color: #2bbbdc;
            color: white !important;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            text-align: center;
          }
          .button:hover {
            background-color: #249eb8;
          }
          @media only screen and (max-width: 600px) {
            .container {
              width: 100% !important;
              padding: 10px !important;
            }
            .content {
              padding: 15px !important;
            }
          }
        `}} />
            </head>
            <body>
                <div className="container">
                    <div className="header">
                        <img
                            src="https://www.mkbautomobile.com/logo.png"
                            alt="MKB Automobile"
                            className="logo"
                        />
                    </div>
                    <div className="content">
                        {children}
                    </div>
                    <div className="footer">
                        <p>© {new Date().getFullYear()} MKB Automobile. Tous droits réservés.</p>
                        <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
                    </div>
                </div>
            </body>
        </html>
    );
} 