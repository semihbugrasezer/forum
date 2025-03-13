import { Category } from "../../types/supabase";

interface CreateCategoryRequest {
  name: string;
  description: string;
  slug: string;
  parentId?: string;
}

interface UpdateCategoryRequest {
  id: string;
  name?: string;
  description?: string;
  slug?: string;
  parentId?: string;
}

interface DeleteCategoryResponse {
  success: boolean;
  message: string;
}

class CategoryAPI {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";
  }

  async getCategories(): Promise<Category[]> {
    try {
      const response = await fetch(`${this.baseUrl}/categories`);
      if (!response.ok) throw new Error('Kategoriler alınamadı');
      return await response.json();
    } catch (error) {
      throw new Error('Kategoriler yüklenirken bir hata oluştu');
    }
  }

  async getCategoryById(id: string): Promise<Category> {
    try {
      const response = await fetch(`${this.baseUrl}/categories/${id}`);
      if (!response.ok) throw new Error('Kategori alınamadı');
      return await response.json();
    } catch (error) {
      throw new Error('Kategori yüklenirken bir hata oluştu');
    }
  }

  async createCategory(category: CreateCategoryRequest): Promise<Category> {
    try {
      const response = await fetch(`${this.baseUrl}/admin/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(category),
      });
      
      if (!response.ok) throw new Error('Kategori oluşturulamadı');
      return await response.json();
    } catch (error) {
      throw new Error('Kategori oluşturulurken bir hata oluştu');
    }
  }

  async updateCategory(category: UpdateCategoryRequest): Promise<Category> {
    try {
      const response = await fetch(`${this.baseUrl}/admin/categories/${category.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(category),
      });
      
      if (!response.ok) throw new Error('Kategori güncellenemedi');
      return await response.json();
    } catch (error) {
      throw new Error('Kategori güncellenirken bir hata oluştu');
    }
  }

  async deleteCategory(id: string): Promise<DeleteCategoryResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/admin/categories/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Kategori silinemedi');
      return await response.json();
    } catch (error) {
      throw new Error('Kategori silinirken bir hata oluştu');
    }
  }
}

export const categoryAPI = new CategoryAPI();
