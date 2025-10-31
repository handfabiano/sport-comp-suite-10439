/**
 * Infinite Scroll Hook
 * Provides infinite scrolling functionality with React Query
 */

import { useRef, useCallback, useState } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { executeSupabaseQuery } from '@/lib/supabase-interceptor';

export interface InfiniteScrollOptions<T> {
  table: string;
  pageSize?: number;
  queryKey: string[];
  select?: string;
  orderBy?: { column: string; ascending?: boolean };
  filters?: Record<string, any>;
  enabled?: boolean;
}

export interface InfiniteScrollResult<T> {
  data: T[];
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  refetch: () => void;
  observerRef: (node: HTMLDivElement | null) => void;
}

/**
 * Hook for infinite scroll with automatic pagination
 */
export function useInfiniteScroll<T>({
  table,
  pageSize = 20,
  queryKey,
  select = '*',
  orderBy,
  filters = {},
  enabled = true,
}: InfiniteScrollOptions<T>): InfiniteScrollResult<T> {
  const observer = useRef<IntersectionObserver>();

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: [...queryKey, filters],
    queryFn: async ({ pageParam = 0 }) => {
      const from = pageParam * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from(table)
        .select(select, { count: 'exact' })
        .range(from, to);

      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          query = query.eq(key, value);
        }
      });

      // Apply ordering
      if (orderBy) {
        query = query.order(orderBy.column, {
          ascending: orderBy.ascending ?? true,
        });
      }

      return executeSupabaseQuery(() => query, {
        resource: table,
        action: 'fetch',
      }).then((result: any) => ({
        data: result,
        nextPage: result.length === pageSize ? pageParam + 1 : undefined,
      }));
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
    enabled,
  });

  // Intersection Observer callback
  const lastElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading || isFetchingNextPage) return;

      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      });

      if (node) observer.current.observe(node);
    },
    [isLoading, isFetchingNextPage, hasNextPage, fetchNextPage]
  );

  // Flatten pages into single array
  const flattenedData = data?.pages.flatMap((page) => page.data) ?? [];

  return {
    data: flattenedData,
    isLoading,
    isFetchingNextPage,
    hasNextPage: hasNextPage ?? false,
    fetchNextPage,
    refetch,
    observerRef: lastElementRef,
  };
}

/**
 * Hook for paginated data with traditional pagination (prev/next buttons)
 */
export interface PaginatedOptions<T> {
  table: string;
  pageSize?: number;
  queryKey: string[];
  select?: string;
  orderBy?: { column: string; ascending?: boolean };
  filters?: Record<string, any>;
  enabled?: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  refetch: () => void;
}

export function usePagination<T>({
  table,
  pageSize = 20,
  queryKey,
  select = '*',
  orderBy,
  filters = {},
  enabled = true,
}: PaginatedOptions<T>): PaginatedResult<T> {
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading, refetch } = useQuery({
    queryKey: [...queryKey, currentPage, filters],
    queryFn: async () => {
      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from(table)
        .select(select, { count: 'exact' })
        .range(from, to);

      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          query = query.eq(key, value);
        }
      });

      // Apply ordering
      if (orderBy) {
        query = query.order(orderBy.column, {
          ascending: orderBy.ascending ?? true,
        });
      }

      const result = await executeSupabaseQuery(() => query, {
        resource: table,
        action: 'fetch',
      });

      return result;
    },
    enabled,
  });

  const totalCount = (data as any)?.count ?? 0;
  const totalPages = Math.ceil(totalCount / pageSize);
  const items = Array.isArray(data) ? data : [];

  return {
    data: items,
    isLoading,
    currentPage,
    totalPages,
    totalCount,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
    goToPage: (page: number) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
      }
    },
    nextPage: () => {
      if (currentPage < totalPages) {
        setCurrentPage((prev) => prev + 1);
      }
    },
    previousPage: () => {
      if (currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      }
    },
    refetch,
  };
}

