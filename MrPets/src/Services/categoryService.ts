import { supabase } from './supabaseClient';
import { Categoria } from '../Models/models';

export const categoryService = {
  getCategories: async (): Promise<Categoria[]> => {
    try {
      const { data, error } = await supabase.from('categorias').select('*');
      if (error) {
        console.error('Categories error:', error);
        return [];
      }
      return data || [];
    } catch (e) {
      console.error(e);
      return [];
    }
  }
};
