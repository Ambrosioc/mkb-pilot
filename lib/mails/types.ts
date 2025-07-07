
/**
 * Types de base pour tous les emails
 */
export interface BaseEmailProps {
  recipientName: string;
  recipientEmail: string;
}

/**
 * Types pour les templates spécifiques
 */
export interface WelcomeEmailProps extends BaseEmailProps {
  ctaLink?: string;
  companyName?: string;
}

export interface ConfirmEmailProps extends BaseEmailProps {
  ctaLink: string;
  token?: string;
  expiresIn?: string;
}

export interface ResetPasswordProps extends BaseEmailProps {
  ctaLink: string;
  token?: string;
  expiresIn?: string;
  previewText?: string;
}

export interface DocumentEmailProps extends BaseEmailProps {
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

export interface SendDocumentProps extends BaseEmailProps {
  documentType: 'devis' | 'facture';
  documentNumber: string;
  vehicleInfo: string;
  message?: string;
  downloadLink?: string;
}

/**
 * Types pour Mailjet
 */
export interface MailjetRecipient {
  Email: string;
  Name?: string;
}

export interface MailjetAttachment {
  ContentType: string;
  Filename: string;
  Base64Content: string;
}

export interface MailjetEmailData {
  subject: string;
  htmlContent: string;
  textContent?: string;
  recipients: MailjetRecipient[];
  attachments?: MailjetAttachment[];
  bcc?: MailjetRecipient[];
  templateId?: number;
  templateVariables?: Record<string, any>;
}

/**
 * Types pour les réponses d'API
 */
export interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  details?: any;
}

/**
 * Type pour les pièces jointes d'email
 */
export interface EmailAttachment {
  filename: string;
  content: string; // Base64
  contentType: string;
}

/**
 * Type pour les destinataires d'email
 */
export interface EmailRecipient {
  email: string;
  name?: string;
}

/**
 * Type pour les options d'envoi d'email
 */
export interface SendEmailOptions {
  to: EmailRecipient[];
  subject: string;
  html: string;
  text?: string;
  attachments?: EmailAttachment[];
  cc?: EmailRecipient[];
  bcc?: EmailRecipient[];
}