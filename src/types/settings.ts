export interface ForumSettings {
  siteName: string;
  siteDescription: string;
  allowRegistration: boolean;
  allowGuestPosting: boolean;
  requireEmailVerification: boolean;
  topicsPerPage: number;
  commentsPerPage: number;
  enableUserProfiles: boolean;
  enableUserAvatars: boolean;
  enableUserSignatures: boolean;
  enableUserTitles: boolean;
  enableUserBadges: boolean;
  enableUserRanks: boolean;
  enableUserReputation: boolean;
  enableUserFollowing: boolean;
  enableUserBlocking: boolean;
  enableUserMessaging: boolean;
  enableUserNotifications: boolean;
  enableUserSubscriptions: boolean;
  enableUserBookmarks: boolean;
  enableUserLikes: boolean;
  enableUserFlags: boolean;
  enableUserReports: boolean;
  enableUserModeration: boolean;
  enableUserAdministration: boolean;
  enableUserAnalytics: boolean;
  enableUserAPI: boolean;
  enableUserSSO: boolean;
  enableUserOAuth: boolean;
  enableUserLDAP: boolean;
  enableUserSAML: boolean;
}

export interface UpdateSettingsResponse {
  success: boolean;
  message: string;
  settings: ForumSettings;
}
