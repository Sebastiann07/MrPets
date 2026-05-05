import { supabase } from './supabaseClient';
import { Cliente } from '../Models/models';

export const userService = {
  getProfile: async (id: string): Promise<Cliente | null> => {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('id', id)
        .single();
      if (error) {
        console.error('Profile error:', error);
        return null;
      }
      return data;
    } catch (e) {
      console.error(e);
      return null;
    }
  },
  getAllUsers: async (): Promise<Cliente[]> => {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*');
      if (error) {
        console.error('getAllUsers error:', error);
        return [];
      }
      return data || [];
    } catch (e) {
      console.error(e);
      return [];
    }
  }
};
