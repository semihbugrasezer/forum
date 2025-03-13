import { User } from '@supabase/supabase-js';

export type Post = {
  id: string;
  title: string;
  content: string;
  author: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  likes: number;
  comments: Comment[];
  categoryId: string;
  categoryName: string;
};

export type Comment = {
  id: string;
  content: string;
  author: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
};

export type UserProfile = {
  id: string;
  username: string;
  displayName: string;
  email: string;
  photoURL?: string;
  role: 'admin' | 'user';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Category = {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
};

export type Topic = {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorPhotoURL?: string;
  categoryId: string;
  categoryName: string;
  createdAt: string;
  updatedAt: string;
  lastReplyAt?: string;
  lastReplyBy?: string;
  replies: Reply[];
};

export type Reply = {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  authorPhotoURL?: string;
  createdAt: string;
  updatedAt: string;
};

export type AuthContextType = {
  currentUser: User | null;
  loading: boolean;
  signup: (email: string, password: string, displayName: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  error: string | null;
};

export type PremiumContextType = {
  isPremium: boolean;
  loading: boolean;
  subscribe: (priceId: string) => Promise<void>;
  cancelSubscription: () => Promise<void>;
};

export type Notification = {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  createdAt: string;
  read: boolean;
  userId: string;
};

export type Feature = {
  name: string;
  included: boolean;
  value?: string;
}; 