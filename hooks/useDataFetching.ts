import { useCallback, useEffect, useRef, useState } from 'react';

export interface PaginationConfig {
  itemsPerPage: number;
  cacheKey: string;
  cacheExpiryMinutes?: number;
}

export interface FetchOptions {
  page?: number;
  limit?: number;
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

export interface FetchResult<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  totalItems: number;
  refetch: () => Promise<void>;
}

export function useDataFetching<T>(
  fetchFunction: (options: FetchOptions) => Promise<{ data: T[]; totalItems: number }>,
  options: FetchOptions = {},
  dependencies: any[] = []
): FetchResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastFetchRef = useRef<number>(0);

  const fetchData = useCallback(async (fetchOptions: FetchOptions = {}) => {
    // Annuler la requête précédente si elle existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Créer un nouveau contrôleur d'annulation
    abortControllerRef.current = new AbortController();
    const fetchId = Date.now();
    lastFetchRef.current = fetchId;

    setLoading(true);
    setError(null);

    try {
      const result = await fetchFunction({ ...options, ...fetchOptions });
      
      // Vérifier si c'est toujours la requête la plus récente
      if (lastFetchRef.current === fetchId) {
        setData(result.data);
        setTotalItems(result.totalItems);
        setLoading(false);
      }
    } catch (err: any) {
      // Ignorer les erreurs d'annulation
      if (err.name === 'AbortError') {
        return;
      }
      
      if (lastFetchRef.current === fetchId) {
        setError(err.message || 'Une erreur est survenue');
        setLoading(false);
      }
    }
  }, [fetchFunction, options]);

  const refetch = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
    
    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, dependencies);

  return {
    data,
    loading,
    error,
    totalItems,
    refetch
  };
}

// Hook pour optimiser les appels API avec cache
export function useCachedDataFetching<T>(
  fetchFunction: (options: FetchOptions) => Promise<{ data: T[]; totalItems: number }>,
  cacheKey: string,
  options: FetchOptions = {},
  cacheDuration: number = 5 * 60 * 1000 // 5 minutes par défaut
): FetchResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState(0);

  const getCachedData = useCallback(() => {
    if (typeof window === 'undefined') return null;
    
    try {
      const cached = localStorage.getItem(cacheKey);
      if (!cached) return null;
      
      const { data: cachedData, timestamp, total } = JSON.parse(cached);
      const isExpired = Date.now() - timestamp > cacheDuration;
      
      if (isExpired) {
        localStorage.removeItem(cacheKey);
        return null;
      }
      
      return { data: cachedData, total };
    } catch {
      return null;
    }
  }, [cacheKey, cacheDuration]);

  const setCachedData = useCallback((data: T[], total: number) => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(cacheKey, JSON.stringify({
        data,
        total,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.warn('Erreur lors de la mise en cache:', error);
    }
  }, [cacheKey]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    // Vérifier le cache d'abord
    const cached = getCachedData();
    if (cached) {
      setData(cached.data);
      setTotalItems(cached.total);
      setLoading(false);
      return;
    }

    try {
      const result = await fetchFunction(options);
      setData(result.data);
      setTotalItems(result.totalItems);
      setCachedData(result.data, result.totalItems);
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  }, [fetchFunction, options, getCachedData, setCachedData]);

  const refetch = useCallback(async () => {
    // Supprimer le cache pour forcer un nouveau fetch
    if (typeof window !== 'undefined') {
      localStorage.removeItem(cacheKey);
    }
    await fetchData();
  }, [fetchData, cacheKey]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    totalItems,
    refetch
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

  const dataFetching = useDataFetching(
    fetchFunction, 
    {
      ...config,
      filters: {
        ...initialFilters,
        search: debouncedSearchTerm,
      }
    }, 
    [debouncedSearchTerm] // Tableau de dépendances
  );

  return {
    ...dataFetching,
    searchTerm,
    setSearchTerm,
    debouncedSearchTerm,
  };
} 