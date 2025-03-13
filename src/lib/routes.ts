/**
 * Application route definitions to maintain consistency
 * Use these constants when creating links to avoid mismatched routes
 */
export const routes = {
  home: '/',
  categories: '/categories',
  category: (slug: string) => `/categories/${slug}`,
  newTopic: (categorySlug: string) => `/categories/${categorySlug}/new`,
  topic: (slug: string) => `/topics/${slug}`,
  user: (id: string) => `/users/${id}`,
  profile: '/profile',
  search: (query?: string) => query ? `/search?q=${encodeURIComponent(query)}` : '/search',
}
