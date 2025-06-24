// Types de base
export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  user_metadata?: {
    role?: string;
    full_name?: string
    avatar_url?: string;
  };
}

// Types pour les onglets
export interface Tab {
  id: string;
  name: string;
  label: string;
  path: string;
  icon?: string;
}

// Types pour la navigation
export interface MenuItem {
  title: string;
  icon: React.ComponentType<any>;
  href?: string;
  children?: MenuItem[];
}

// Types pour les métriques
export interface Metric {
  title: string;
  value: string | number;
  change?: string;
  icon?: React.ComponentType<any>;
  color?: string;
}

// Types pour les modules
export interface Module {
  title: string;
  icon: React.ComponentType<any>;
  href: string;
  description: string;
  status: 'excellent' | 'good' | 'attention' | 'critical';
  metrics: Record<string, any>;
  activities: string[];
}

// Types pour les contacts
export interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  type: 'particulier' | 'professionnel';
  tags: string[];
  created_at: string;
  updated_at: string;
}

// Types pour les véhicules
export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  status: 'disponible' | 'reserve' | 'vendu';
  location: string;
  created_at: string;
  updated_at: string;
}

// Types pour les notifications
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  created_at: string;
}

// Types pour les permissions
export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
}

// Types pour les rôles
export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  created_at: string;
  updated_at: string;
}

// Types pour les logs
export interface Log {
  id: string;
  user_id: string;
  action: string;
  resource: string;
  details: Record<string, any>;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

// Types pour les paramètres
export interface Setting {
  id: string;
  key: string;
  value: string;
  description: string;
  category: string;
  updated_at: string;
}

// Types pour les rapports
export interface Report {
  id: string;
  title: string;
  description: string;
  type: 'performance' | 'financial' | 'operational' | 'custom';
  data: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// Types pour les événements
export interface Event {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  type: 'meeting' | 'task' | 'reminder' | 'deadline';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  assigned_to?: string;
  created_at: string;
  updated_at: string;
}

// Types pour les API responses
export interface ApiResponse<T> {
  data: T;
  error: string | null;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error: string | null;
}

// Types pour les filtres
export interface Filter {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'in' | 'not_in';
  value: any;
}

export interface Sort {
  field: string;
  direction: 'asc' | 'desc';
}

// Types pour les requêtes
export interface QueryParams {
  page?: number;
  limit?: number;
  filters?: Filter[];
  sort?: Sort[];
  search?: string;
}

// Types pour les erreurs
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
}

// Types pour les thèmes
export interface Theme {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
}

// Types pour les langues
export interface Language {
  code: string;
  name: string;
  flag: string;
  direction: 'ltr' | 'rtl';
}

// Types pour les configurations
export interface AppConfig {
  name: string;
  version: string;
  environment: 'development' | 'staging' | 'production';
  apiUrl: string;
  features: Record<string, boolean>;
  limits: Record<string, number>;
} 