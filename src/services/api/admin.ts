import { ForumSettings, UpdateSettingsResponse } from "../../types/settings";
import { User } from "../../types/supabase";

interface BanUserRequest {
  userId: string;
  reason: string;
  duration?: number; // in days
}

interface ModerateContentRequest {
  contentId: string;
  contentType: 'topic' | 'comment';
  action: 'approve' | 'reject' | 'flag';
  reason?: string;
}

interface ModerateContentResponse {
  success: boolean;
  message: string;
}

class AdminAPI {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.REACT_APP_API_URL || "";
  }

  async getSettings(): Promise<ForumSettings> {
    try {
      const response = await fetch(`${this.baseUrl}/admin/settings`);
      if (!response.ok) throw new Error('Ayarlar alınamadı');
      return await response.json();
    } catch (error) {
      throw new Error('Ayarlar yüklenirken bir hata oluştu');
    }
  }

  async updateSettings(settings: ForumSettings): Promise<UpdateSettingsResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/admin/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });
      
      if (!response.ok) throw new Error('Ayarlar güncellenemedi');
      return await response.json();
    } catch (error) {
      throw new Error('Ayarlar kaydedilirken bir hata oluştu');
    }
  }

  async getUsers(): Promise<User[]> {
    try {
      const response = await fetch(`${this.baseUrl}/admin/users`);
      if (!response.ok) throw new Error('Kullanıcılar alınamadı');
      return await response.json();
    } catch (error) {
      throw new Error('Kullanıcılar yüklenirken bir hata oluştu');
    }
  }

  async getUserById(id: string): Promise<User> {
    try {
      const response = await fetch(`${this.baseUrl}/admin/users/${id}`);
      if (!response.ok) throw new Error('Kullanıcı alınamadı');
      return await response.json();
    } catch (error) {
      throw new Error('Kullanıcı yüklenirken bir hata oluştu');
    }
  }

  async banUser(request: BanUserRequest): Promise<ModerateContentResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/admin/users/${request.userId}/ban`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      
      if (!response.ok) throw new Error('Kullanıcı yasaklanamadı');
      return await response.json();
    } catch (error) {
      throw new Error('Kullanıcı yasaklanırken bir hata oluştu');
    }
  }

  async moderateContent(request: ModerateContentRequest): Promise<ModerateContentResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/admin/moderation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      
      if (!response.ok) throw new Error('İçerik moderasyonu yapılamadı');
      return await response.json();
    } catch (error) {
      throw new Error('İçerik moderasyonu yapılırken bir hata oluştu');
    }
  }
}

export const adminAPI = new AdminAPI();
