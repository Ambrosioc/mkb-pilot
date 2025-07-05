// Types pour le système de pôles
export interface PoleAccess {
  canRead: boolean;
  canWrite: boolean;
  canManage: boolean;
}

export interface UserPole {
  pole_id: number;
  pole_name: string;
  pole_description: string;
  role_level: number;
  can_read: boolean;
  can_write: boolean;
  can_manage: boolean;
}

export interface PoleAccessResponse {
  role_level: number | null;
  can_read: boolean;
  can_write: boolean;
  can_manage: boolean;
}

// Matrice d'accès basée sur les niveaux de rôle
export const poleAccessMatrix: Record<number, PoleAccess> = {
  1: { canRead: true, canWrite: true, canManage: true },     // CEO
  2: { canRead: true, canWrite: true, canManage: true },     // G4
  3: { canRead: true, canWrite: true, canManage: true },     // Responsable de Pôle
  4: { canRead: true, canWrite: true, canManage: false },    // Collaborateur confirmé
  5: { canRead: true, canWrite: false, canManage: false },   // Collaborateur simple
} as const;

// Fonction utilitaire pour obtenir les permissions à partir d'un niveau
export function getPoleAccess(roleLevel: number): PoleAccess {
  return poleAccessMatrix[roleLevel] || { canRead: false, canWrite: false, canManage: false };
}

// Fonction pour vérifier si un utilisateur a accès à une action spécifique
export function hasPoleAccess(roleLevel: number, action: keyof PoleAccess): boolean {
  const access = getPoleAccess(roleLevel);
  return access[action];
} 