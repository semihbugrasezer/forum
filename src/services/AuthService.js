import { authApi } from "./api";

export const AuthService = {
  async signup(email, password, displayName) {
    try {
      const response = await authApi.signup(email, password, displayName);
      return response;
    } catch (error) {
      throw error;
    }
  },

  async login(email, password) {
    try {
      const response = await authApi.login(email, password);
      return response;
    } catch (error) {
      throw error;
    }
  },

  async logout() {
    try {
      await authApi.logout();
    } catch (error) {
      throw error;
    }
  },

  async getCurrentUser() {
    try {
      const response = await authApi.getCurrentUser();
      return response;
    } catch (error) {
      throw error;
    }
  },

  async updateProfile(data) {
    try {
      const response = await authApi.updateProfile(data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  async resetPassword(email) {
    try {
      await authApi.resetPassword(email);
    } catch (error) {
      throw error;
    }
  },

  async updatePassword(newPassword) {
    try {
      await authApi.updatePassword(newPassword);
    } catch (error) {
      throw error;
    }
  },
};
