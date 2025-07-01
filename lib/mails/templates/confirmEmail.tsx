/* eslint-disable react/no-unescaped-entities */
import React from 'react';
import { EmailLayout } from '../layout/EmailLayout';
import { ConfirmEmailProps } from '../types';

export const ConfirmEmailTemplate: React.FC<ConfirmEmailProps> = ({
  recipientName,
  recipientEmail,
  ctaLink,
  token,
  expiresIn = '24 heures'
}) => {
  return (
    <EmailLayout
      title="Confirmez votre adresse email"
      previewText={`Bonjour ${recipientName}, veuillez confirmer votre adresse email pour activer votre compte.`}
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Confirmez votre adresse email ✉️
        </h2>
        <p className="text-lg text-gray-600 mb-6">
          Bonjour <strong>{recipientName}</strong>,
        </p>
        <p className="text-gray-700 mb-6">
          Merci de vous être inscrit chez MKB Automobile.
          Pour activer votre compte et accéder à toutes nos fonctionnalités,
          veuillez confirmer votre adresse email en cliquant sur le bouton ci-dessous.
        </p>
      </div>

      <div className="section-warning">
        <h3 className="text-lg font-semibold text-yellow-800 mb-3">
          ⚠️ Action requise
        </h3>
        <p className="text-yellow-700">
          Ce lien de confirmation expirera dans <strong>{expiresIn}</strong>.
          Si vous ne confirmez pas votre email dans ce délai, vous devrez demander un nouveau lien.
        </p>
      </div>

      <div className="text-center my-8">
        <a
          href={ctaLink}
          className="btn-primary"
        >
          Confirmer mon adresse email
        </a>
      </div>

      <div className="section-info">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          🔒 Sécurité
        </h3>
        <p className="text-gray-700 mb-3">
          Ce lien est sécurisé et ne peut être utilisé qu&apos;une seule fois.
          Si vous n&apos;avez pas créé de compte chez MKB Automobile,
          vous pouvez ignorer cet email en toute sécurité.
        </p>
        {token && (
          <p className="text-xs text-gray-500">
            Token de sécurité: <code className="bg-gray-100 px-1 rounded">{token}</code>
          </p>
        )}
      </div>

      <div className="text-center mt-8">
        <p className="text-gray-600">
          Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :
        </p>
        <p className="text-sm text-mkb-blue break-all mt-2">
          {ctaLink}
        </p>
      </div>

      <div className="text-center mt-8">
        <p className="text-gray-600">
          Merci de votre confiance,
        </p>
        <p className="text-gray-800 font-semibold">
          L&apos;équipe MKB Automobile
        </p>
      </div>
    </EmailLayout>
  );
};