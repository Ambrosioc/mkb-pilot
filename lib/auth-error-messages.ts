import { AuthError } from '@supabase/supabase-js';

/**
 * Traduit les messages d'erreur d'authentification Supabase en français
 */
export function getAuthErrorMessage(error: AuthError | null): string {
  if (!error) return '';

  // Gestion des codes d'erreur spécifiques
  switch (error.message) {
    case 'Invalid login credentials':
      return 'Les identifiants de connexion sont incorrects. Veuillez vérifier votre email et mot de passe.';
    
    case 'Email not confirmed':
      return 'Votre adresse email n\'est pas confirmée. Veuillez vérifier votre boîte mail et cliquer sur le lien de confirmation.';
    
    case 'User not found':
      return 'Aucun compte trouvé avec cette adresse email.';
    
    case 'Too many requests':
      return 'Trop de tentatives de connexion. Veuillez patienter quelques minutes avant de réessayer.';
    
    case 'Password should be at least 6 characters':
      return 'Le mot de passe doit contenir au moins 6 caractères.';
    
    case 'Unable to validate email address: invalid format':
      return 'Format d\'adresse email invalide.';
    
    case 'Signup disabled':
      return 'L\'inscription est temporairement désactivée.';
    
    case 'User already registered':
      return 'Un compte existe déjà avec cette adresse email.';
    
    case 'Unable to send email':
      return 'Impossible d\'envoyer l\'email. Veuillez réessayer plus tard.';
    
    case 'Token expired':
      return 'Votre session a expiré. Veuillez vous reconnecter.';
    
    case 'Invalid token':
      return 'Token invalide. Veuillez vous reconnecter.';
    
    default:
      // Si c'est un code d'erreur spécifique
      if (error.message.includes('invalid_credentials')) {
        return 'Les identifiants de connexion sont incorrects. Veuillez vérifier votre email et mot de passe.';
      }
      
      if (error.message.includes('email')) {
        return 'Problème avec l\'adresse email. Veuillez vérifier le format.';
      }
      
      if (error.message.includes('password')) {
        return 'Problème avec le mot de passe. Veuillez vérifier vos informations.';
      }
      
      // Message générique pour les autres erreurs
      return `Erreur de connexion: ${error.message}`;
  }
}

/**
 * Vérifie si l'erreur est liée aux identifiants invalides
 */
export function isInvalidCredentialsError(error: AuthError | null): boolean {
  if (!error) return false;
  
  return error.message === 'Invalid login credentials' || 
         error.message.includes('invalid_credentials');
}

/**
 * Vérifie si l'erreur est liée à un email non confirmé
 */
export function isEmailNotConfirmedError(error: AuthError | null): boolean {
  if (!error) return false;
  
  return error.message === 'Email not confirmed';
}

/**
 * Vérifie si l'erreur est liée à un utilisateur non trouvé
 */
export function isUserNotFoundError(error: AuthError | null): boolean {
  if (!error) return false;
  
  return error.message === 'User not found';
} 