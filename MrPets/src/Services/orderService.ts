import { supabase } from './supabaseClient';
import { Pedido, PedidoDetalle } from '../Models/models';

export const orderService = {
  getOrdersByUser: async (clienteId: string): Promise<Pedido[]> => {
    try {
      const { data, error } = await supabase.from('pedidos').select('*').eq('cliente_id', clienteId);
      if (error) {
        console.error('getOrders error:', error);
        return [];
      }
      return data || [];
    } catch (e) {
      console.error(e);
      return [];
    }
  },
  createOrder: async (clienteId: string, items: { producto_id: string, cantidad: number, precio: number }[]): Promise<Pedido | null> => {
    try {
      const { data, error } = await supabase.rpc('create_order_and_decrement_stock', {
        p_cliente_id: clienteId,
        p_items: items,
      });

      if (error) {
        console.error('createOrder error:', error);
        throw new Error(error.message || 'No se pudo completar el pedido.');
      }

      const first = Array.isArray(data) ? data[0] : data;
      if (!first) {
        throw new Error('No se pudo completar el pedido.');
      }
      return first;
    } catch (e) {
      console.error(e);
      throw e instanceof Error ? e : new Error('No se pudo completar el pedido.');
    }
  }
};
