import { api } from "@/lib/api"
import {
  MetadataRequest,
  MetadataResponse,
  MetadataSearchParams,
  MetadataSearchResponse,
} from "@/types/metadata"
import { ApiResponse } from "@/types/api"

export const metadataService = {
  async createMetadata(data: MetadataRequest): Promise<MetadataResponse> {
    const response = await api.post<ApiResponse<MetadataResponse>>(
      "/metadata",
      data
    )
    return response.data.data
  },

  async getMetadataById(id: string): Promise<MetadataResponse> {
    const response = await api.get<ApiResponse<MetadataResponse>>(
      `/metadata/${id}`
    )
    return response.data.data
  },

  async updateMetadata(
    id: string,
    data: Partial<MetadataRequest>
  ): Promise<MetadataResponse> {
    const response = await api.put<ApiResponse<MetadataResponse>>(
      `/metadata/${id}`,
      data
    )
    return response.data.data
  },

  async deleteMetadata(id: string): Promise<void> {
    await api.delete<ApiResponse<void>>(`/metadata/${id}`)
  },

  async searchMetadata(
    params: MetadataSearchParams
  ): Promise<MetadataSearchResponse> {
    const response = await api.get<ApiResponse<MetadataSearchResponse>>(
      "/metadata/search",
      {
        params: {
          page: params.page,
          limit: params.limit,
          search: params.search,
          category: params.category,
          dateFrom: params.dateFrom,
          dateTo: params.dateTo,
          sortBy: params.sortBy,
          sortOrder: params.sortOrder,
        },
      }
    )
    return response.data.data
  },

  async getUserMetadata(
    params: MetadataSearchParams
  ): Promise<MetadataSearchResponse> {
    const response = await api.get<ApiResponse<MetadataSearchResponse>>(
      "/metadata/user",
      {
        params: {
          page: params.page,
          limit: params.limit,
          search: params.search,
          category: params.category,
          dateFrom: params.dateFrom,
          dateTo: params.dateTo,
          sortBy: params.sortBy,
          sortOrder: params.sortOrder,
        },
      }
    )
    return response.data.data
  },
}
