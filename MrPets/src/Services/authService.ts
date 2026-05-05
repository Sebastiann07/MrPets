import { supabase } from './supabaseClient';
import { Cliente } from '../Models/models';

export const authService = {
  login: async (correo: string, password: string): Promise<Cliente> => {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('correo', correo)
      .eq('password', password)
      .single();

    if (error || !data) {
      console.error('Login error:', error);
      throw new Error('Correo o contraseña incorrectos');
    }

    return data;
  },

  register: async (nombre: string, correo: string, password: string): Promise<Cliente> => {
    const id = Date.now().toString();
    const { data, error } = await supabase
      .from('clientes')
      .insert([{ id, nombre, correo, password, rol: 'cliente' }])
      .select()
      .single();

    if (error || !data) {
      console.error('Register error:', error);
      const code = (error as any)?.code as string | undefined;
      const message = String((error as any)?.message ?? '');

      if (code === '23505' || /duplicate|unique/i.test(message)) {
        throw new Error('Este correo ya esta registrado');
      }

      throw new Error('No se pudo crear la cuenta');
    }

    return data;
  },

  logout: async () => {
    // Session managed locally
  }
};
