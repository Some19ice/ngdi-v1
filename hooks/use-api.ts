import { useState, useCallback } from "react"
import { api } from "@/lib/api-client"
import { toast } from "@/components/ui/use-toast"

interface UseApiOptions<T> {
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
  successMessage?: string
}

interface UseApiResult<T> {
  data: T | null
  error: Error | null
  isLoading: boolean
  mutate: () => Promise<void>
}

export function useApi<T>(
  apiFunction: () => Promise<T>,
  options: UseApiOptions<T> = {}
): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const mutate = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const result = await apiFunction()
      setData(result)
      options.onSuccess?.(result)
      if (options.successMessage) {
        toast({
          title: "Success",
          description: options.successMessage,
        })
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error("An error occurred")
      setError(error)
      options.onError?.(error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      })
    } finally {
      setIsLoading(false)
    }
  }, [apiFunction, options])

  return { data, error, isLoading, mutate }
}

interface UseMutationOptions<T, U> {
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
  successMessage?: string
  invalidateQueries?: (() => Promise<U>)[]
}

interface UseMutationResult<T, P extends any[]> {
  data: T | null
  error: Error | null
  isLoading: boolean
  mutate: (...args: P) => Promise<void>
}

export function useMutation<T, P extends any[], U = any>(
  mutationFn: (...args: P) => Promise<T>,
  options: UseMutationOptions<T, U> = {}
): UseMutationResult<T, P> {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const mutate = useCallback(
    async (...args: P) => {
      try {
        setIsLoading(true)
        setError(null)
        const result = await mutationFn(...args)
        setData(result)
        options.onSuccess?.(result)
        if (options.successMessage) {
          toast({
            title: "Success",
            description: options.successMessage,
          })
        }
        if (options.invalidateQueries) {
          await Promise.all(options.invalidateQueries.map((query) => query()))
        }
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("An error occurred")
        setError(error)
        options.onError?.(error)
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message,
        })
      } finally {
        setIsLoading(false)
      }
    },
    [mutationFn, options]
  )

  return { data, error, isLoading, mutate }
}

// Example usage:
// const { data: user, error, isLoading } = useApi(() => api.getCurrentUser());
// const { mutate: updateUser, isLoading: isUpdating } = useMutation(
//   (data: UserUpdateInput) => api.updateUser(data),
//   {
//     successMessage: 'Profile updated successfully',
//     invalidateQueries: [() => api.getCurrentUser()],
//   }
// );
