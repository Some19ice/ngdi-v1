import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import type {
  MetadataResponse,
  MetadataSearchParams,
  MetadataSearchResponse,
} from "@/types/metadata"

export function useMetadata(id: string) {
  return useQuery({
    queryKey: ["metadata", id],
    queryFn: async () => {
      const response = await api.get<{ data: MetadataResponse }>(
        `/metadata/${id}`
      )
      return response.data.data
    },
  })
}

export function useMetadataList(params: MetadataSearchParams) {
  return useQuery({
    queryKey: ["metadata", "list", params],
    queryFn: async () => {
      const response = await api.get<{ data: MetadataSearchResponse }>(
        "/metadata",
        {
          params,
        }
      )
      return response.data.data
    },
    placeholderData: (previousData) => previousData,
  })
}

export function useCreateMetadata() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Partial<MetadataResponse>) => {
      const response = await api.post<{ data: MetadataResponse }>(
        "/metadata",
        data
      )
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["metadata"] })
    },
  })
}

export function useUpdateMetadata() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      data: Partial<MetadataResponse>
    }) => {
      const response = await api.put<{ data: MetadataResponse }>(
        `/metadata/${id}`,
        data
      )
      return response.data.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["metadata", variables.id],
      })
      queryClient.invalidateQueries({
        queryKey: ["metadata", "list"],
      })
    },
  })
}

export function useDeleteMetadata() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => api.delete<void>(`/metadata/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["metadata"] })
    },
  })
}
