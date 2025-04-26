/**
 * Generate test data for metadata
 */
export function generateMetadata(count = 5) {
  return Array.from({ length: count }, (_, i) => ({
    id: `metadata-${i + 1}`,
    title: `Test Metadata ${i + 1}`,
    description: `Description for test metadata ${i + 1}`,
    keywords: ['test', 'metadata', `keyword-${i + 1}`],
    createdAt: new Date(Date.now() - i * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - i * 43200000).toISOString(),
    createdBy: `user-${i % 3 + 1}`,
    status: i % 5 === 0 ? 'draft' : 'published',
  }));
}

/**
 * Generate test data for users
 */
export function generateUsers(count = 5) {
  return Array.from({ length: count }, (_, i) => ({
    id: `user-${i + 1}`,
    name: `User ${i + 1}`,
    email: `user${i + 1}@example.com`,
    role: i === 0 ? 'ADMIN' : 'USER',
    emailVerified: new Date().toISOString(),
    createdAt: new Date(Date.now() - i * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - i * 43200000).toISOString(),
  }));
}

/**
 * Generate test data for organizations
 */
export function generateOrganizations(count = 3) {
  return Array.from({ length: count }, (_, i) => ({
    id: `org-${i + 1}`,
    name: `Organization ${i + 1}`,
    description: `Description for organization ${i + 1}`,
    type: i % 2 === 0 ? 'government' : 'ngo',
    createdAt: new Date(Date.now() - i * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - i * 43200000).toISOString(),
  }));
}
