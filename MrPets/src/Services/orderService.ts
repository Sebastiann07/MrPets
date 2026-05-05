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
      const id = Date.now().toString();
      const subtotal = items.reduce((acc, item) => acc + item.cantidad * item.precio, 0);
      const impuesto = subtotal * 0.16; // Asumimos 16% o 0
      const total = subtotal + impuesto;
      
      const pedido: Pedido = { id, cliente_id: clienteId, estado: 'pendiente', subtotal, impuesto, total };
      const { data, error } = await supabase.from('pedidos').insert([pedido]).select().single();
      if (error) {
        console.error('createOrder error:', error);
        return null;
      }
      
      const detalles = items.map((item, index) => ({
        id: `${id}-${index}`,
        pedido_id: id,
        producto_id: item.producto_id,
        cantidad: item.cantidad,
        precio: item.precio
      }));
      const { error: errorDetalles } = await supabase.from('pedidos_detalle').insert(detalles);
      if (errorDetalles) {
         console.error('createOrderDetalle error:', errorDetalles);
      }
      return data;
    } catch (e) {
      console.error(e);
      return null;
    }
  }
};
