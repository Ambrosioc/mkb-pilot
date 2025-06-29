import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

export interface PaginationConfig {
  itemsPerPage: number;
  cacheKey: string;
  cacheExpiryMinutes?: number;
}

export interface FetchOptions {
  page?: number;
  forceRefresh?: boolean;
  filters?: Record<string, any>;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationState {
  currentPage: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface DataFetchingState<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  pagination: PaginationState;
  filters: Record<string, any>;
}

export interface CacheEntry<T> {
  data: T[];
  totalItems: number;
  lastFetched: string;
  page: number;
  filters: Record<string, any>;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export function useDataFetching<T>(
  fetchFunction: (options: FetchOptions) => Promise<{ data: T[]; totalItems: number }>,
  config: PaginationConfig,
  initialFilters: Record<string, any> = {}
) {
  const [state, setState] = useState<DataFetchingState<T>>({
    data: [],
    loading: true,
    error: null,
    pagination: {
      currentPage: 1,
      totalItems: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPrevPage: false,
    },
    filters: initialFilters,
  });

  // Mémoisation de la clé de cache basée sur les filtres
  const cacheKey = useMemo(() => {
    const filtersString = JSON.stringify(state.filters);
    return `${config.cacheKey}_${filtersString}`;
  }, [config.cacheKey, state.filters]);

  // Fonction pour vérifier si le cache est valide
  const isCacheValid = useCallback((cache: CacheEntry<T> | null): boolean => {
    if (!cache) return false;

    const now = new Date();
    const lastFetched = new Date(cache.lastFetched);
    const expiryMinutes = config.cacheExpiryMinutes || 5; // 5 minutes par défaut
    const expiryTime = new Date(lastFetched.getTime() + expiryMinutes * 60 * 1000);

    return now < expiryTime;
  }, [config.cacheExpiryMinutes]);

  // Fonction pour récupérer les données du cache
  const getCachedData = useCallback((key: string): CacheEntry<T> | null => {
    if (typeof window === 'undefined') return null;

    try {
      const cached = localStorage.getItem(key);
      if (!cached) return null;

      const parsed: CacheEntry<T> = JSON.parse(cached);
      return isCacheValid(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }, [isCacheValid]);

  // Fonction pour sauvegarder dans le cache
  const saveToCache = useCallback((key: string, data: T[], totalItems: number, page: number) => {
    if (typeof window === 'undefined') return;

    const cacheEntry: CacheEntry<T> = {
      data,
      totalItems,
      lastFetched: new Date().toISOString(),
      page,
      filters: state.filters,
      sortBy: state.filters.sortBy,
      sortOrder: state.filters.sortOrder,
    };

    try {
      localStorage.setItem(key, JSON.stringify(cacheEntry));
    } catch (error) {
      console.warn('Erreur lors de la sauvegarde du cache:', error);
    }
  }, [state.filters]);

  // Fonction principale de récupération des données
  const fetchData = useCallback(async (options: FetchOptions = {}) => {
    const {
      page = 1,
      forceRefresh = false,
      filters = state.filters,
      sortBy,
      sortOrder,
    } = options;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Vérifier le cache si pas de forceRefresh
      if (!forceRefresh) {
        const cached = getCachedData(cacheKey);
        if (cached && cached.page === page) {
          const totalPages = Math.ceil(cached.totalItems / config.itemsPerPage);
          setState(prev => ({
            ...prev,
            data: cached.data,
            loading: false,
            pagination: {
              currentPage: page,
              totalItems: cached.totalItems,
              totalPages,
              hasNextPage: page < totalPages,
              hasPrevPage: page > 1,
            },
            filters,
          }));
          return;
        }
      }

      // Récupérer les données depuis l'API
      const { data, totalItems } = await fetchFunction({
        page,
        filters,
        sortBy,
        sortOrder,
      });

      const totalPages = Math.ceil(totalItems / config.itemsPerPage);

      // Sauvegarder dans le cache
      saveToCache(cacheKey, data, totalItems, page);

      setState(prev => ({
        ...prev,
        data,
        loading: false,
        pagination: {
          currentPage: page,
          totalItems,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
        filters,
      }));

    } catch (error) {
      console.error('Erreur lors de la récupération des données:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      }));
      toast.error('Erreur lors du chargement des données');
    }
  }, [fetchFunction, config.itemsPerPage, cacheKey, getCachedData, saveToCache, state.filters]);

  // Fonction pour changer de page
  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= state.pagination.totalPages) {
      fetchData({ page });
    }
  }, [fetchData, state.pagination.totalPages]);

  // Fonction pour aller à la page suivante
  const nextPage = useCallback(() => {
    if (state.pagination.hasNextPage) {
      goToPage(state.pagination.currentPage + 1);
    }
  }, [goToPage, state.pagination.hasNextPage, state.pagination.currentPage]);

  // Fonction pour aller à la page précédente
  const prevPage = useCallback(() => {
    if (state.pagination.hasPrevPage) {
      goToPage(state.pagination.currentPage - 1);
    }
  }, [goToPage, state.pagination.hasPrevPage, state.pagination.currentPage]);

  // Fonction pour appliquer des filtres
  const applyFilters = useCallback((newFilters: Record<string, any>) => {
    const updatedFilters = { ...state.filters, ...newFilters };
    setState(prev => ({ ...prev, filters: updatedFilters }));
    fetchData({ page: 1, filters: updatedFilters, forceRefresh: true });
  }, [state.filters, fetchData]);

  // Fonction pour rafraîchir les données
  const refresh = useCallback(() => {
    fetchData({ forceRefresh: true });
  }, [fetchData]);

  // Fonction pour vider le cache
  const clearCache = useCallback(() => {
    if (typeof window === 'undefined') return;

    try {
      // Supprimer toutes les entrées de cache qui commencent par la clé de base
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(config.cacheKey)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.warn('Erreur lors de la suppression du cache:', error);
    }
  }, [config.cacheKey]);

  // Chargement initial
  useEffect(() => {
    fetchData({ page: 1 });
  }, []); // Seulement au montage

  return {
    // État
    data: state.data,
    loading: state.loading,
    error: state.error,
    pagination: state.pagination,
    filters: state.filters,

    // Actions
    fetchData,
    goToPage,
    nextPage,
    prevPage,
    applyFilters,
    refresh,
    clearCache,

    // Utilitaires
    isEmpty: state.data.length === 0 && !state.loading,
    hasData: state.data.length > 0,
  };
}

// Hook spécialisé pour les données avec recherche
export function useSearchableDataFetching<T>(
  fetchFunction: (options: FetchOptions) => Promise<{ data: T[]; totalItems: number }>,
  config: PaginationConfig,
  initialFilters: Record<string, any> = {}
) {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Debounce pour la recherche
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Mettre à jour les filtres quand le terme de recherche change
  useEffect(() => {
    const updatedFilters = {
      ...initialFilters,
      search: debouncedSearchTerm,
    };
    dataFetching.applyFilters(updatedFilters);
  }, [debouncedSearchTerm]);

  const dataFetching = useDataFetching(fetchFunction, config, {
    ...initialFilters,
    search: debouncedSearchTerm,
  });

  return {
    ...dataFetching,
    searchTerm,
    setSearchTerm,
    debouncedSearchTerm,
  };
} 