/**
 * Advanced React Query Configuration
 * Optimized cache management and query invalidation strategies
 */

import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import { ErrorLogger, AppError } from './errors';
import { toast } from '@/hooks/use-toast';

/**
 * Global error handler for queries
 */
function handleQueryError(error: unknown) {
  const appError = ErrorLogger.logAndParse(error as Error);

  // Show toast for user feedback
  toast({
    title: 'Erro ao carregar dados',
    description: appError.message,
    variant: 'destructive',
  });
}

/**
 * Global error handler for mutations
 */
function handleMutationError(error: unknown) {
  const appError = ErrorLogger.logAndParse(error as Error);

  toast({
    title: 'Erro ao salvar',
    description: appError.message,
    variant: 'destructive',
  });
}

/**
 * Create optimized Query Client with advanced caching
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: handleQueryError,
    }),
    mutationCache: new MutationCache({
      onError: handleMutationError,
    }),
    defaultOptions: {
      queries: {
        // Stale time: Data considered fresh for 5 minutes
        staleTime: 1000 * 60 * 5,

        // Garbage collection time: Cache retained for 10 minutes
        gcTime: 1000 * 60 * 10,

        // Retry failed requests 2 times with exponential backoff
        retry: (failureCount, error) => {
          // Don't retry on 4xx errors (client errors)
          if (error instanceof AppError && error.statusCode >= 400 && error.statusCode < 500) {
            return false;
          }
          return failureCount < 2;
        },

        // Retry delay with exponential backoff
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

        // Don't refetch on window focus in production (can be expensive)
        refetchOnWindowFocus: import.meta.env.DEV,

        // Refetch on reconnect
        refetchOnReconnect: true,

        // Refetch on mount if data is stale
        refetchOnMount: true,
      },
      mutations: {
        // Retry mutations once
        retry: 1,
        retryDelay: 1000,
      },
    },
  });
}

/**
 * Query Key Factory - Standardized query keys for better invalidation
 */
export const queryKeys = {
  // Eventos
  eventos: {
    all: ['eventos'] as const,
    lists: () => [...queryKeys.eventos.all, 'list'] as const,
    list: (filters: Record<string, any>) =>
      [...queryKeys.eventos.lists(), filters] as const,
    details: () => [...queryKeys.eventos.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.eventos.details(), id] as const,
  },

  // Equipes
  equipes: {
    all: ['equipes'] as const,
    lists: () => [...queryKeys.equipes.all, 'list'] as const,
    list: (filters: Record<string, any>) =>
      [...queryKeys.equipes.lists(), filters] as const,
    details: () => [...queryKeys.equipes.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.equipes.details(), id] as const,
    atletas: (id: string) => [...queryKeys.equipes.detail(id), 'atletas'] as const,
  },

  // Atletas
  atletas: {
    all: ['atletas'] as const,
    lists: () => [...queryKeys.atletas.all, 'list'] as const,
    list: (filters: Record<string, any>) =>
      [...queryKeys.atletas.lists(), filters] as const,
    details: () => [...queryKeys.atletas.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.atletas.details(), id] as const,
  },

  // Partidas
  partidas: {
    all: ['partidas'] as const,
    lists: () => [...queryKeys.partidas.all, 'list'] as const,
    list: (filters: Record<string, any>) =>
      [...queryKeys.partidas.lists(), filters] as const,
    details: () => [...queryKeys.partidas.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.partidas.details(), id] as const,
    evento: (eventoId: string) =>
      [...queryKeys.partidas.all, 'evento', eventoId] as const,
  },

  // Rankings
  rankings: {
    all: ['rankings'] as const,
    evento: (eventoId: string) =>
      [...queryKeys.rankings.all, 'evento', eventoId] as const,
    categoria: (eventoId: string, categoria: string) =>
      [...queryKeys.rankings.evento(eventoId), categoria] as const,
  },

  // User
  user: {
    all: ['user'] as const,
    profile: () => [...queryKeys.user.all, 'profile'] as const,
    roles: () => [...queryKeys.user.all, 'roles'] as const,
    equipes: () => [...queryKeys.user.all, 'equipes'] as const,
  },
};

/**
 * Query Invalidation Helpers
 * Smart invalidation strategies for different mutations
 */
export class QueryInvalidator {
  private queryClient: QueryClient;

  constructor(queryClient: QueryClient) {
    this.queryClient = queryClient;
  }

  /**
   * Invalidate after creating an evento
   */
  async invalidateEventoCreated() {
    await Promise.all([
      this.queryClient.invalidateQueries({ queryKey: queryKeys.eventos.lists() }),
      this.queryClient.invalidateQueries({ queryKey: queryKeys.user.profile() }),
    ]);
  }

  /**
   * Invalidate after updating an evento
   */
  async invalidateEventoUpdated(eventoId: string) {
    await Promise.all([
      this.queryClient.invalidateQueries({ queryKey: queryKeys.eventos.lists() }),
      this.queryClient.invalidateQueries({ queryKey: queryKeys.eventos.detail(eventoId) }),
    ]);
  }

  /**
   * Invalidate after creating/updating equipe
   */
  async invalidateEquipeChanged(equipeId?: string, eventoId?: string) {
    const invalidations = [
      this.queryClient.invalidateQueries({ queryKey: queryKeys.equipes.lists() }),
    ];

    if (equipeId) {
      invalidations.push(
        this.queryClient.invalidateQueries({ queryKey: queryKeys.equipes.detail(equipeId) })
      );
    }

    if (eventoId) {
      invalidations.push(
        this.queryClient.invalidateQueries({ queryKey: queryKeys.eventos.detail(eventoId) })
      );
    }

    await Promise.all(invalidations);
  }

  /**
   * Invalidate after adding atleta to equipe
   */
  async invalidateAtletaAddedToEquipe(atletaId: string, equipeId: string) {
    await Promise.all([
      this.queryClient.invalidateQueries({ queryKey: queryKeys.atletas.detail(atletaId) }),
      this.queryClient.invalidateQueries({ queryKey: queryKeys.equipes.detail(equipeId) }),
      this.queryClient.invalidateQueries({ queryKey: queryKeys.equipes.atletas(equipeId) }),
    ]);
  }

  /**
   * Invalidate after partida ends (affects rankings)
   */
  async invalidatePartidaFinished(partidaId: string, eventoId: string) {
    await Promise.all([
      this.queryClient.invalidateQueries({ queryKey: queryKeys.partidas.detail(partidaId) }),
      this.queryClient.invalidateQueries({ queryKey: queryKeys.partidas.evento(eventoId) }),
      this.queryClient.invalidateQueries({ queryKey: queryKeys.rankings.evento(eventoId) }),
      this.queryClient.invalidateQueries({ queryKey: queryKeys.eventos.detail(eventoId) }),
    ]);
  }

  /**
   * Invalidate all data (nuclear option - use sparingly)
   */
  async invalidateAll() {
    await this.queryClient.invalidateQueries();
  }

  /**
   * Clear all cache (for logout)
   */
  clearAll() {
    this.queryClient.clear();
  }
}

/**
 * Prefetch Helper - Prefetch data for better UX
 */
export class QueryPrefetcher {
  private queryClient: QueryClient;

  constructor(queryClient: QueryClient) {
    this.queryClient = queryClient;
  }

  /**
   * Prefetch evento details when hovering over link
   */
  async prefetchEvento(eventoId: string, fetchFn: () => Promise<any>) {
    await this.queryClient.prefetchQuery({
      queryKey: queryKeys.eventos.detail(eventoId),
      queryFn: fetchFn,
      staleTime: 1000 * 60, // 1 minute
    });
  }

  /**
   * Prefetch equipe details
   */
  async prefetchEquipe(equipeId: string, fetchFn: () => Promise<any>) {
    await this.queryClient.prefetchQuery({
      queryKey: queryKeys.equipes.detail(equipeId),
      queryFn: fetchFn,
      staleTime: 1000 * 60,
    });
  }

  /**
   * Prefetch atleta details
   */
  async prefetchAtleta(atletaId: string, fetchFn: () => Promise<any>) {
    await this.queryClient.prefetchQuery({
      queryKey: queryKeys.atletas.detail(atletaId),
      queryFn: fetchFn,
      staleTime: 1000 * 60,
    });
  }
}

/**
 * Optimistic Update Helpers
 */
export class OptimisticUpdater {
  private queryClient: QueryClient;

  constructor(queryClient: QueryClient) {
    this.queryClient = queryClient;
  }

  /**
   * Optimistically update placar da partida
   */
  updatePartidaPlacar(
    partidaId: string,
    placarA: number,
    placarB: number
  ): () => void {
    const queryKey = queryKeys.partidas.detail(partidaId);

    // Snapshot previous value
    const previousData = this.queryClient.getQueryData(queryKey);

    // Optimistically update
    this.queryClient.setQueryData(queryKey, (old: any) => ({
      ...old,
      placar_a: placarA,
      placar_b: placarB,
    }));

    // Return rollback function
    return () => {
      this.queryClient.setQueryData(queryKey, previousData);
    };
  }

  /**
   * Optimistically add atleta to list
   */
  addAtletaToList(newAtleta: any): () => void {
    const queryKey = queryKeys.atletas.lists();

    const previousData = this.queryClient.getQueryData(queryKey);

    this.queryClient.setQueryData(queryKey, (old: any) => {
      if (!old) return [newAtleta];
      return [newAtleta, ...old];
    });

    return () => {
      this.queryClient.setQueryData(queryKey, previousData);
    };
  }
}
