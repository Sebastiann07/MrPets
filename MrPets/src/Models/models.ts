export type Cliente = {
  id: string;
  nombre: string;
  correo: string;
  password?: string;
  rol: 'admin' | 'cliente';
  activo: boolean;
  created_at?: string;
};

export type AuthProfile = Cliente & {
  nombreCompleto?: string;
  email?: string;
  createdAt?: string;
};
export type UserRole = Cliente['rol'];

export type Categoria = {
  id: string;
  nombre: string;
  descripcion: string;
  icono: string;
  created_at?: string;
};

export type Category = Categoria;

export type Producto = {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  categoria_id: string;
  imagen_url?: string;
  created_at?: string;
  updated_at?: string;
};

export type Product = {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  categoriaId: string;
  imagenUrl?: string | null;
  categoria?: Category | null;
  createdAt?: string;
  updatedAt?: string;
};

export type ProductInput = {
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  categoriaId: string;
  imagenUrl?: string | null;
};

export type Pedido = {
  id: string;
  cliente_id: string;
  estado: 'carrito' | 'pendiente' | 'pagado' | 'cancelado';
  subtotal: number;
  impuesto: number;
  total: number;
  created_at?: string;
};

export type OrderStatus = Pedido['estado'] | 'entregado';

export type Order = {
  id: string;
  usuarioId: string;
  productoId: string;
  cantidad: number;
  estado: OrderStatus;
  total: number;
  producto?: Product | null;
  createdAt?: string;
};

export type PedidoDetalle = {
  id: string;
  pedido_id: string;
  producto_id: string;
  cantidad: number;
  precio: number;
  created_at?: string;
};

export type RegisterPayload = {
  nombreCompleto: string;
  email: string;
  password: string;
};

export type UpdateProfilePayload = {
  nombreCompleto: string;
  email: string;
};
