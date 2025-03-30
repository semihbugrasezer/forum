import { Category } from "../../types/supabase";
import { createClient } from "@/lib/supabase/server";

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

interface ApiResponse<T> {
  data?: T;
  error?: {
    message: string;
    details: unknown;
  };
}

export const CategoryAPI = {
  async getCategories(): Promise<ApiResponse<Category[]>> {
    try {
      const supabase = await createClient();
      
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) {
        return {
          error: {
            message: `Kategoriler yüklenirken bir hata oluştu: ${error.message}`,
            details: error
          }
        };
      }
      
      return { data };
    } catch (error) {
      return {
        error: {
          message: `Kategoriler yüklenirken bir hata oluştu: ${error instanceof Error ? error.message : String(error)}`,
          details: error
        }
      };
    }
  },

  async getCategoryById(id: string): Promise<ApiResponse<Category>> {
    try {
      const supabase = await createClient();
      
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        return {
          error: {
            message: `Kategori alınamadı: ${error.message}`,
            details: error
          }
        };
      }
      
      return { data };
    } catch (error) {
      return {
        error: {
          message: `Kategori yüklenirken bir hata oluştu: ${error instanceof Error ? error.message : String(error)}`,
          details: error
        }
      };
    }
  },

  async createCategory(category: CreateCategoryRequest): Promise<ApiResponse<Category>> {
    try {
      const supabase = await createClient();
      
      // Validate required fields
      if (!category.name || !category.slug) {
        return {
          error: {
            message: 'Name and slug are required fields',
            details: 'Validation Error'
          }
        };
      }

      const { data, error } = await supabase
        .from('categories')
        .insert([category])
        .select()
        .single();
      
      if (error) {
        return {
          error: {
            message: `Kategori oluşturulamadı: ${error.message}`,
            details: error
          }
        };
      }
      
      return { data };
    } catch (error) {
      return {
        error: {
          message: `Kategori oluşturulurken bir hata oluştu: ${error instanceof Error ? error.message : String(error)}`,
          details: error
        }
      };
    }
  },

  async updateCategory(category: UpdateCategoryRequest): Promise<ApiResponse<Category>> {
    try {
      const supabase = await createClient();
      
      const { data, error } = await supabase
        .from('categories')
        .update(category)
        .eq('id', category.id)
        .select()
        .single();
      
      if (error) {
        return {
          error: {
            message: `Kategori güncellenemedi: ${error.message}`,
            details: error
          }
        };
      }
      
      return { data };
    } catch (error) {
      return {
        error: {
          message: `Kategori güncellenirken bir hata oluştu: ${error instanceof Error ? error.message : String(error)}`,
          details: error
        }
      };
    }
  },

  async deleteCategory(id: string): Promise<ApiResponse<DeleteCategoryResponse>> {
    try {
      const supabase = await createClient();
      
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
      
      if (error) {
        return {
          error: {
            message: `Kategori silinemedi: ${error.message}`,
            details: error
          }
        };
      }
      
      return { data: { success: true, message: 'Kategori başarıyla silindi' } };
    } catch (error) {
      return {
        error: {
          message: `Kategori silinirken bir hata oluştu: ${error instanceof Error ? error.message : String(error)}`,
          details: error
        }
      };
    }
  }
};

// Add named export for backward compatibility
export const categoryAPI = CategoryAPI;

// Add default export
export default CategoryAPI;
