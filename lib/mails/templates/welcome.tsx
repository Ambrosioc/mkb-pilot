/* eslint-disable react/no-unescaped-entities */
import React from 'react';
import { EmailLayout } from '../layout/EmailLayout';
import { WelcomeEmailProps } from '../types';

export const WelcomeEmail: React.FC<WelcomeEmailProps> = ({
  recipientName,
  recipientEmail,
  ctaLink,
  companyName = 'MKB Automobile'
}) => {
  return (
    <EmailLayout
      title={`Bienvenue chez ${companyName}`}
      previewText={`Bienvenue ${recipientName} ! Nous sommes ravis de vous accueillir chez ${companyName}.`}
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Bienvenue chez {companyName} ! 🎉
        </h2>
        <p className="text-lg text-gray-600 mb-6">
          Bonjour <strong>{recipientName}</strong>,
        </p>
        <p className="text-gray-700 mb-6">
          Nous sommes ravis de vous accueillir dans notre communauté.
          Votre compte a été créé avec succès et vous avez maintenant accès à toutes nos fonctionnalités.
        </p>
      </div>

      <div className="section-info">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          🚗 Que pouvez-vous faire maintenant ?
        </h3>
        <ul className="text-gray-700 space-y-2">
          <li>• Parcourir notre catalogue de véhicules</li>
          <li>• Demander des devis personnalisés</li>
          <li>• Suivre vos documents et factures</li>
          <li>• Contacter notre équipe commerciale</li>
        </ul>
      </div>

      {ctaLink && (
        <div className="text-center">
          <a
            href={ctaLink}
            className="btn-primary"
          >
            Commencer à explorer
          </a>
        </div>
      )}

      <div className="section-success">
        <h3 className="text-lg font-semibold text-green-800 mb-3">
          💡 Besoin d&apos;aide ?
        </h3>
        <p className="text-green-700">
          Notre équipe est là pour vous accompagner. N&apos;hésitez pas à nous contacter
          pour toute question concernant nos services ou nos véhicules.
        </p>
      </div>

      <div className="text-center mt-8">
        <p className="text-gray-600">
          Merci de nous faire confiance,
        </p>
        <p className="text-gray-800 font-semibold">
          L&apos;équipe {companyName}
        </p>
      </div>
    </EmailLayout>
  );
};