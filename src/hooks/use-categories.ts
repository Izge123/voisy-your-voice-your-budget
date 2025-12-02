import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Category {
  id: string;
  user_id: string;
  name: string;
  type: 'expense' | 'income' | 'savings';
  icon: string | null;
  color: string | null;
  parent_id: string | null;
  created_at: string | null;
  children?: Category[];
}

// Transform flat categories array into tree structure
const buildCategoryTree = (categories: Category[]): Category[] => {
  const categoryMap = new Map<string, Category>();
  const rootCategories: Category[] = [];

  // First pass: create map and initialize children arrays
  categories.forEach(category => {
    categoryMap.set(category.id, { ...category, children: [] });
  });

  // Second pass: build tree structure
  categories.forEach(category => {
    const node = categoryMap.get(category.id)!;
    
    // Fix circular references: if parent_id equals id, treat as root category
    if (category.parent_id && category.parent_id !== category.id) {
      const parent = categoryMap.get(category.parent_id);
      if (parent && parent.id !== category.id) {
        parent.children!.push(node);
      } else {
        // Parent not found or circular reference - add to root
        rootCategories.push(node);
      }
    } else {
      rootCategories.push(node);
    }
  });

  return rootCategories;
};

export const useCategories = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: categories = [], isLoading, error } = useQuery({
    queryKey: ['categories', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (error) throw error;
      return data as Category[];
    },
    enabled: !!user,
  });

  const categoriesTree = buildCategoryTree(categories);

  const addCategory = useMutation({
    mutationFn: async (newCategory: Omit<Category, 'id' | 'user_id' | 'created_at'>) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('categories')
        .insert({
          user_id: user.id,
          name: newCategory.name,
          type: newCategory.type,
          icon: newCategory.icon,
          color: newCategory.color,
          parent_id: newCategory.parent_id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Категория создана');
    },
    onError: (error) => {
      toast.error('Ошибка при создании категории');
      console.error('Add category error:', error);
    },
  });

  const updateCategory = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Category> }) => {
      const { data, error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Категория обновлена');
    },
    onError: (error) => {
      toast.error('Ошибка при обновлении категории');
      console.error('Update category error:', error);
    },
  });

  const deleteCategory = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Категория удалена');
    },
    onError: (error) => {
      toast.error('Ошибка при удалении категории');
      console.error('Delete category error:', error);
    },
  });

  return {
    categories,
    categoriesTree,
    isLoading,
    error,
    addCategory: addCategory.mutate,
    updateCategory: updateCategory.mutate,
    deleteCategory: deleteCategory.mutate,
    isAddingCategory: addCategory.isPending,
    isUpdatingCategory: updateCategory.isPending,
    isDeletingCategory: deleteCategory.isPending,
  };
};
