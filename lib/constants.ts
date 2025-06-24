// Configuration de l'application
export const APP_CONFIG = {
  name: 'MKB Pilot',
  version: '1.0.0',
  description: 'Dashboard professionnel MKB Pilot',
  maxTabs: 6,
  defaultPageSize: 20,
  apiTimeout: 30000,
} as const;

// Couleurs de l'application
export const COLORS = {
  primary: '#2bbbdc',
  secondary: '#64748b',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
} as const;

// Statuts des modules
export const MODULE_STATUS = {
  excellent: 'excellent',
  good: 'good',
  attention: 'attention',
  critical: 'critical',
} as const;

// Types d'utilisateurs
export const USER_TYPES = {
  admin: 'admin',
  manager: 'manager',
  user: 'user',
} as const;

// Types de notifications
export const NOTIFICATION_TYPES = {
  info: 'info',
  success: 'success',
  warning: 'warning',
  error: 'error',
} as const;

// Types de contacts
export const CONTACT_TYPES = {
  particulier: 'particulier',
  professionnel: 'professionnel',
} as const;

// Statuts des véhicules
export const VEHICLE_STATUS = {
  disponible: 'disponible',
  reserve: 'reserve',
  vendu: 'vendu',
} as const;

// Types d'événements
export const EVENT_TYPES = {
  meeting: 'meeting',
  task: 'task',
  reminder: 'reminder',
  deadline: 'deadline',
} as const;

// Priorités des événements
export const EVENT_PRIORITIES = {
  low: 'low',
  medium: 'medium',
  high: 'high',
  critical: 'critical',
} as const;

// Statuts des événements
export const EVENT_STATUS = {
  pending: 'pending',
  in_progress: 'in_progress',
  completed: 'completed',
  cancelled: 'cancelled',
} as const;

// Types de rapports
export const REPORT_TYPES = {
  performance: 'performance',
  financial: 'financial',
  operational: 'operational',
  custom: 'custom',
} as const;

// Opérateurs de filtres
export const FILTER_OPERATORS = {
  eq: 'eq',
  neq: 'neq',
  gt: 'gt',
  gte: 'gte',
  lt: 'lte',
  lte: 'lte',
  like: 'like',
  in: 'in',
  not_in: 'not_in',
} as const;

// Directions de tri
export const SORT_DIRECTIONS = {
  asc: 'asc',
  desc: 'desc',
} as const;

// Langues supportées
export const SUPPORTED_LANGUAGES = {
  fr: {
    code: 'fr',
    name: 'Français',
    flag: '🇫🇷',
    direction: 'ltr' as const,
  },
  en: {
    code: 'en',
    name: 'English',
    flag: '🇬🇧',
    direction: 'ltr' as const,
  },
} as const;

// Thèmes disponibles
export const THEMES = {
  light: {
    name: 'light',
    primary: '#2bbbdc',
    secondary: '#64748b',
    accent: '#f1f5f9',
    background: '#ffffff',
    surface: '#f8fafc',
    text: '#0f172a',
    textSecondary: '#64748b',
  },
  dark: {
    name: 'dark',
    primary: '#2bbbdc',
    secondary: '#94a3b8',
    accent: '#1e293b',
    background: '#0f172a',
    surface: '#1e293b',
    text: '#f1f5f9',
    textSecondary: '#94a3b8',
  },
} as const;

// Messages d'erreur
export const ERROR_MESSAGES = {
  network: 'Erreur de connexion réseau',
  unauthorized: 'Accès non autorisé',
  forbidden: 'Accès interdit',
  notFound: 'Ressource non trouvée',
  serverError: 'Erreur serveur',
  validation: 'Données invalides',
  unknown: 'Erreur inconnue',
} as const;

// Messages de succès
export const SUCCESS_MESSAGES = {
  created: 'Créé avec succès',
  updated: 'Mis à jour avec succès',
  deleted: 'Supprimé avec succès',
  saved: 'Enregistré avec succès',
  uploaded: 'Téléchargé avec succès',
} as const;

// Formats de date
export const DATE_FORMATS = {
  short: 'dd/MM/yyyy',
  long: 'dd MMMM yyyy',
  time: 'HH:mm',
  datetime: 'dd/MM/yyyy HH:mm',
  iso: 'yyyy-MM-dd',
} as const;

// Formats de nombres
export const NUMBER_FORMATS = {
  currency: {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  },
  percentage: {
    style: 'percent',
    minimumFractionDigits: 1,
  },
  decimal: {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  },
} as const;

// Limites de l'application
export const LIMITS = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxUploadFiles: 5,
  maxSearchResults: 100,
  maxTagsPerItem: 10,
  maxDescriptionLength: 500,
  maxTitleLength: 100,
} as const;

// Regex patterns
export const PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^(\+33|0)[1-9](\d{8})$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
  url: /^https?:\/\/.+/,
} as const;

// Configuration des animations
export const ANIMATION_CONFIG = {
  duration: 0.3,
  ease: 'easeInOut',
  stagger: 0.1,
} as const;

// Configuration des breakpoints
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const; 