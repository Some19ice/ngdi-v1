"use client"

import { useQuery, useMutation, UseQueryOptions, UseMutationOptions, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { toast } from 'sonner';

/**
 * Custom hook for using API services with React Query
 * Provides standardized error handling and loading states
 * 
 * @param queryKey The React Query cache key
 * @param queryFn The API function to call
 * @param options Additional React Query options
 */
export function useApiQuery<TData, TError = Error>(
  queryKey: unknown[],
  queryFn: () => Promise<TData>,
  options?: Omit<UseQueryOptions<TData, TError, TData, unknown[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery<TData, TError>({
    queryKey,
    queryFn,
    ...options,
    onError: (error) => {
      // Log the error
      console.error('API Query Error:', error);
      
      // Show toast notification
      toast.error(error instanceof Error ? error.message : 'An error occurred');
      
      // Call the original onError if provided
      if (options?.onError) {
        options.onError(error);
      }
    }
  });
}

/**
 * Custom hook for using API mutations with React Query
 * Provides standardized error handling and loading states
 * 
 * @param mutationFn The API function to call
 * @param options Additional React Query options
 */
export function useApiMutation<TData, TVariables, TError = Error>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: Omit<UseMutationOptions<TData, TError, TVariables>, 'mutationFn'>
) {
  return useMutation<TData, TError, TVariables>({
    mutationFn,
    ...options,
    onError: (error, variables, context) => {
      // Log the error
      console.error('API Mutation Error:', error);
      
      // Show toast notification
      toast.error(error instanceof Error ? error.message : 'An error occurred');
      
      // Call the original onError if provided
      if (options?.onError) {
        options.onError(error, variables, context);
      }
    }
  });
}

/**
 * Create a React Query client with default options
 */
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        retry: 1,
        refetchOnWindowFocus: true,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}

/**
 * Provider component for React Query
 */
export function ApiQueryProvider({ children }: { children: React.ReactNode }) {
  const queryClient = createQueryClient();
  
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

export default useApiQuery;
