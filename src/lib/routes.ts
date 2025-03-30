/**
 * Routes utility to centralize all application paths
 */
export const routes = {
  home: '/',
  forum: {
    home: '/forum',
    topics: {
      list: '/forum/topics',
      view: (slug: string) => `/forum/topics/${slug}`,
      create: '/forum/new-topic',
      edit: (id: string) => `/forum/topics/edit/${id}`,
    },
    categories: {
      list: '/forum/categories',
      view: (slug: string) => `/forum/categories/${slug}`,
    },
    profile: '/forum/profile',
    notifications: '/forum/notifications',
    messages: '/forum/messages',
  },
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
  },
  admin: {
    dashboard: '/admin',
    users: '/admin/users',
    topics: {
      list: '/admin/topics',
      create: '/admin/topics/new',
      edit: (id: string) => `/admin/topics/edit/${id}`,
      pending: '/admin/topics/pending',
      archived: '/admin/topics/archived',
    },
    categories: '/admin/categories',
    settings: '/admin/settings',
  },
  user: {
    profile: '/user-profile',
    settings: '/user-profile/settings',
  },
  search: '/search',
};

/**
 * Get a redirect URL with an optional return path
 */
export function getRedirectUrl(path: string, returnTo?: string) {
  if (returnTo) {
    return `${path}?redirectTo=${encodeURIComponent(returnTo)}`;
  }
  return path;
}

export default routes;
