import { supabase } from './supabaseClient';
import { Cliente } from '../Models/models';

export const authService = {
  login: async (correo: string, password: string): Promise<Cliente | null> => {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('correo', correo)
        .eq('password', password)
        .single();
      if (error) {
        console.error('Login error:', error);
        return null;
      }
      return data;
    } catch (e) {
      console.error(e);
      return null;
    }
  },

  register: async (nombre: string, correo: string, password: string): Promise<Cliente | null> => {
    try {
      const id = Date.now().toString();
      const { data, error } = await supabase
        .from('clientes')
        .insert([{ id, nombre, correo, password, rol: 'cliente' }])
        .select()
        .single();
      if (error) {
        console.error('Register error:', error);
        return null;
      }
      return data;
    } catch (e) {
      console.error(e);
      return null;
    }
  },

  logout: async () => {
    // Session managed locally
  }
};
