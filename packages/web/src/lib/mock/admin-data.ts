/**
 * Mock data for admin dashboard and analytics
 */

// Dashboard stats
export const mockDashboardStats = {
  totalUsers: 128,
  totalMetadata: 543,
  userRoleDistribution: [
    { role: "ADMIN", _count: { id: 3 } },
    { role: "USER", _count: { id: 87 } },
    { role: "NODE_OFFICER", _count: { id: 38 } },
  ],
  recentMetadataCount: 23,
  userGrowthPoints: 15,
  metadataByFrameworkCount: 4,
  topOrganizationsCount: 12,
}

// Analytics data
export const mockAnalyticsData = {
  metadataByCategory: [
    { name: "Climate", value: 124, color: "#10B981" },
    { name: "Biodiversity", value: 98, color: "#3B82F6" },
    { name: "Forestry", value: 78, color: "#8B5CF6" },
    { name: "Agriculture", value: 145, color: "#F59E0B" },
    { name: "Water", value: 65, color: "#06B6D4" },
    { name: "Energy", value: 33, color: "#EF4444" },
  ],
  userActivity: [
    {
      date: "2023-01",
      uploads: 54,
      downloads: 120,
      views: 342,
    },
    {
      date: "2023-02",
      uploads: 67,
      downloads: 145,
      views: 389,
    },
    {
      date: "2023-03",
      uploads: 72,
      downloads: 168,
      views: 421,
    },
    {
      date: "2023-04",
      uploads: 85,
      downloads: 201,
      views: 476,
    },
    {
      date: "2023-05",
      uploads: 98,
      downloads: 198,
      views: 512,
    },
    {
      date: "2023-06",
      uploads: 105,
      downloads: 213,
      views: 543,
    },
  ],
  organizationActivity: [
    {
      name: "Federal Ministry of Environment",
      uploads: 87,
      downloads: 156,
      engagement: 79,
    },
    {
      name: "National Space Research",
      uploads: 65,
      downloads: 120,
      engagement: 65,
    },
    {
      name: "UNDP Nigeria",
      uploads: 54,
      downloads: 98,
      engagement: 45,
    },
    {
      name: "Nigerian Conservation Foundation",
      uploads: 43,
      downloads: 78,
      engagement: 39,
    },
    {
      name: "Climate Change Council",
      uploads: 38,
      downloads: 67,
      engagement: 31,
    },
  ],
  geographicDistribution: [
    { name: "North Central", value: 112 },
    { name: "North East", value: 76 },
    { name: "North West", value: 98 },
    { name: "South East", value: 87 },
    { name: "South South", value: 124 },
    { name: "South West", value: 145 },
  ],
  dataQualityMetrics: [
    { label: "Complete Metadata", value: 78, color: "#10B981" },
    { label: "Partial Metadata", value: 18, color: "#F59E0B" },
    { label: "Minimal Metadata", value: 4, color: "#EF4444" },
  ],
}

// Users data
export const mockUsersData = {
  users: Array.from({ length: 20 }, (_, i) => ({
    id: `user-${i + 1}`,
    email: `user${i + 1}@example.com`,
    firstName: `First${i + 1}`,
    lastName: `Last${i + 1}`,
    role: i === 0 ? "ADMIN" : i < 5 ? "NODE_OFFICER" : "USER",
    organization: `Organization ${(i % 5) + 1}`,
    createdAt: new Date(Date.now() - i * 86400000),
    status: i % 10 === 0 ? "INACTIVE" : "ACTIVE",
  })),
  total: 128,
  page: 1,
  totalPages: 7,
}

// Organizations data
export const mockOrganizationsData = {
  organizations: Array.from({ length: 12 }, (_, i) => ({
    id: `org-${i + 1}`,
    name: `Organization ${i + 1}`,
    type: i % 3 === 0 ? "GOVERNMENT" : i % 3 === 1 ? "NGO" : "ACADEMIC",
    country: "Nigeria",
    state: ["Lagos", "Abuja", "Kano", "Rivers", "Enugu"][i % 5],
    contactEmail: `contact@organization${i + 1}.org`,
    website: `https://organization${i + 1}.org`,
    memberCount: Math.floor(Math.random() * 50) + 5,
    datasetCount: Math.floor(Math.random() * 30),
    createdAt: new Date(Date.now() - i * 86400000 * 7),
  })),
  total: 12,
  page: 1,
  totalPages: 1,
}

// Metadata entries
export const mockMetadataData = {
  metadata: Array.from({ length: 15 }, (_, i) => ({
    id: `metadata-${i + 1}`,
    title: `Environmental Dataset ${i + 1}`,
    description: `Comprehensive dataset about environmental factors in Nigeria ${i + 1}`,
    category: ["Climate", "Biodiversity", "Forestry", "Agriculture", "Water"][
      i % 5
    ],
    format: ["CSV", "GeoJSON", "XLS", "NetCDF", "TIFF"][i % 5],
    createdBy: `user${(i % 20) + 1}@example.com`,
    organization: `Organization ${(i % 12) + 1}`,
    spatialCoverage: "Nigeria",
    temporalCoverage: `2020-${(i % 12) + 1} to 2023-${(i % 12) + 1}`,
    status: i % 10 === 0 ? "PENDING" : "PUBLISHED",
    createdAt: new Date(Date.now() - i * 86400000 * 5),
    downloadCount: Math.floor(Math.random() * 200),
    viewCount: Math.floor(Math.random() * 500) + 200,
  })),
  total: 543,
  page: 1,
  totalPages: 37,
}
