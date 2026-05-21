import { supabase } from './supabaseClient';
import { Producto } from '../Models/models';

export const productService = {
  getProducts: async (): Promise<Producto[]> => {
    try {
      const { data, error } = await supabase.from('productos').select('*');
      if (error) {
        console.error('getProducts error:', error);
        return [];
      }
      return data || [];
    } catch (e) {
      console.error(e);
      return [];
    }
  },
  getProductById: async (id: string): Promise<Producto | null> => {
    try {
      const { data, error } = await supabase.from('productos').select('*').eq('id', id).single();
      if (error) {
        console.error('getProductById error:', error);
        return null;
      }
      return data;
    } catch (e) {
      console.error(e);
      return null;
    }
  },
  updateProductStock: async (id: string, stock: number): Promise<Producto | null> => {
    try {
      const { data, error } = await supabase
        .from('productos')
        .update({ stock })
        .eq('id', id)
        .select('*')
        .single();

      if (error) {
        console.error('updateProductStock error:', error);
        throw error;
      }

      return data;
    } catch (e) {
      console.error(e);
      throw e;
    }
  }
};
