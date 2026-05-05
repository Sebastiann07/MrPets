import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Session } from '@supabase/supabase-js';

import { DEFAULT_CATEGORIES } from '../Utils/categories';
import type { AuthProfile, Category, Order, OrderStatus, Product, ProductInput, RegisterPayload, UpdateProfilePayload, UserRole } from '../Models/models';

const DEMO_DB_KEY = '@mrpets/demo-db';
const DEMO_SESSION_KEY = '@mrpets/demo-session';

type DemoUserRecord = AuthProfile & {
  password: string;
};

type DemoSessionRecord = {
  userId: string;
};

type DemoDatabase = {
  users: DemoUserRecord[];
  categories: Category[];
  products: Product[];
  orders: Order[];
};

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function createDemoSession(userId: string): Session {
  const now = Math.floor(Date.now() / 1000);

  return {
    access_token: `demo-access-${userId}`,
    refresh_token: `demo-refresh-${userId}`,
    token_type: 'bearer',
    expires_in: 60 * 60 * 24 * 7,
    expires_at: now + 60 * 60 * 24 * 7,
    user: {
      id: userId,
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    },
  } as Session;
}

function seedCategories(): Category[] {
  return DEFAULT_CATEGORIES.map((category, index) => ({
    id: `cat-${index + 1}`,
    nombre: category.name,
    descripcion: category.description,
    icono: category.icon,
  }));
}

function seedProducts(categories: Category[]): Product[] {
  const food = categories.find((item) => item.nombre === 'Comida') ?? categories[0];
  const toys = categories.find((item) => item.nombre === 'Juguetes') ?? categories[1];
  const accessories = categories.find((item) => item.nombre === 'Accesorios') ?? categories[2];
  const medicines = categories.find((item) => item.nombre === 'Medicamentos') ?? categories[3];

  return [
    {
      id: 'prod-1',
      nombre: 'Croquetas Premium Canino',
      descripcion: 'Alimento balanceado para perros adultos con proteina de pollo.',
      precio: 18.5,
      stock: 24,
      categoriaId: food.id,
      imagenUrl: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=900&q=80',
      categoria: food,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'prod-2',
      nombre: 'Raton interactivo para gato',
      descripcion: 'Juguete con textura suave y cascabel interno para mantener activo a tu gato.',
      precio: 9.9,
      stock: 18,
      categoriaId: toys.id,
      imagenUrl: 'https://images.unsplash.com/photo-1511044568932-338cba0ad803?auto=format&fit=crop&w=900&q=80',
      categoria: toys,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'prod-3',
      nombre: 'Correa reflectiva',
      descripcion: 'Correa resistente para paseos nocturnos con material reflectivo.',
      precio: 14.75,
      stock: 12,
      categoriaId: accessories.id,
      imagenUrl: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=900&q=80',
      categoria: accessories,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'prod-4',
      nombre: 'Suplemento vitaminas',
      descripcion: 'Complemento nutricional para reforzar defensas en mascotas pequenas.',
      precio: 22.0,
      stock: 9,
      categoriaId: medicines.id,
      imagenUrl: 'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?auto=format&fit=crop&w=900&q=80',
      categoria: medicines,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
}

function seedUsers(): DemoUserRecord[] {
  const createdAt = new Date().toISOString();

  return [
    {
      id: 'demo-admin',
      nombreCompleto: 'Admin Demo',
      email: 'admin@mrpets.demo',
      rol: 'admin',
      activo: true,
      createdAt,
      password: 'admin123',
    },
    {
      id: 'demo-cliente',
      nombreCompleto: 'Cliente Demo',
      email: 'cliente@mrpets.demo',
      rol: 'cliente',
      activo: true,
      createdAt,
      password: 'cliente123',
    },
  ];
}

function seedOrders(products: Product[]): Order[] {
  const firstProduct = products[0];
  if (!firstProduct) return [];

  return [
    {
      id: 'order-1',
      usuarioId: 'demo-cliente',
      productoId: firstProduct.id,
      cantidad: 1,
      estado: 'pendiente',
      total: firstProduct.precio,
      producto: firstProduct,
      createdAt: new Date().toISOString(),
    },
  ];
}

function buildSeedDatabase(): DemoDatabase {
  const categories = seedCategories();
  const products = seedProducts(categories);

  return {
    users: seedUsers(),
    categories,
    products,
    orders: seedOrders(products),
  };
}

async function persistDatabase(database: DemoDatabase) {
  await AsyncStorage.setItem(DEMO_DB_KEY, JSON.stringify(database));
}

function normalizeProduct(product: Product, categories: Category[]): Product {
  const category = categories.find((item) => item.id === product.categoriaId) ?? null;
  return {
    ...product,
    categoria: category,
  };
}

function normalizeOrder(order: Order, products: Product[]): Order {
  const product = products.find((item) => item.id === order.productoId) ?? null;
  return {
    ...order,
    producto: product,
  };
}

function normalizeDatabase(database: DemoDatabase): DemoDatabase {
  const products = database.products.map((product) => normalizeProduct(product, database.categories));
  const orders = database.orders.map((order) => normalizeOrder(order, products));

  return {
    users: database.users,
    categories: database.categories,
    products,
    orders,
  };
}

export function stripPassword(user: DemoUserRecord): AuthProfile {
  const { password: _password, ...profile } = user;
  return profile;
}

export async function getDemoDatabase(): Promise<DemoDatabase> {
  const raw = await AsyncStorage.getItem(DEMO_DB_KEY);
  if (!raw) {
    const seed = buildSeedDatabase();
    await persistDatabase(seed);
    return seed;
  }

  try {
    const parsed = JSON.parse(raw) as DemoDatabase;
    const normalized = normalizeDatabase(parsed);
    await persistDatabase(normalized);
    return normalized;
  } catch (error) {
    console.error('[demo-store] invalid database, reseeding', error);
    const seed = buildSeedDatabase();
    await persistDatabase(seed);
    return seed;
  }
}

export async function updateDemoDatabase(updater: (database: DemoDatabase) => DemoDatabase | Promise<DemoDatabase>) {
  const current = await getDemoDatabase();
  const next = normalizeDatabase(await updater(current));
  await persistDatabase(next);
  return next;
}

export async function getDemoSession(): Promise<Session | null> {
  const raw = await AsyncStorage.getItem(DEMO_SESSION_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as DemoSessionRecord;
    if (!parsed.userId) return null;
    return createDemoSession(parsed.userId);
  } catch (error) {
    console.error('[demo-store] invalid session', error);
    await AsyncStorage.removeItem(DEMO_SESSION_KEY);
    return null;
  }
}

export async function setDemoSession(userId: string | null) {
  if (!userId) {
    await AsyncStorage.removeItem(DEMO_SESSION_KEY);
    return;
  }

  await AsyncStorage.setItem(DEMO_SESSION_KEY, JSON.stringify({ userId } satisfies DemoSessionRecord));
}

export async function getDemoProfileById(userId: string) {
  const database = await getDemoDatabase();
  const user = database.users.find((item) => item.id === userId && item.activo);
  return user ? stripPassword(user) : null;
}

export async function signInDemo(email: string, password: string) {
  const database = await getDemoDatabase();
  const user = database.users.find(
    (item) => item.email.toLowerCase() === email.trim().toLowerCase() && item.password === password && item.activo
  );

  if (!user) {
    throw new Error('Credenciales incorrectas');
  }

  await setDemoSession(user.id);

  return {
    session: createDemoSession(user.id),
    profile: stripPassword(user),
  };
}

export async function signUpDemo(payload: RegisterPayload) {
  const normalizedEmail = payload.email.trim().toLowerCase();

  const nextDatabase = await updateDemoDatabase((database) => {
    const existing = database.users.some((user) => user.email.toLowerCase() === normalizedEmail);
    if (existing) {
      throw new Error('Ya existe un usuario con ese correo.');
    }

    const nextUser: DemoUserRecord = {
      id: createId('user'),
      nombreCompleto: payload.nombreCompleto.trim(),
      email: normalizedEmail,
      rol: 'cliente',
      activo: true,
      createdAt: new Date().toISOString(),
      password: payload.password,
    };

    return {
      ...database,
      users: [nextUser, ...database.users],
    };
  });

  const user = nextDatabase.users[0];
  await setDemoSession(user.id);

  return {
    session: createDemoSession(user.id),
    profile: stripPassword(user),
  };
}

export async function getDemoCategories() {
  const database = await getDemoDatabase();
  return [...database.categories].sort((a, b) => a.nombre.localeCompare(b.nombre));
}

export async function createDemoCategory(input: Omit<Category, 'id'>) {
  await updateDemoDatabase((database) => ({
    ...database,
    categories: [
      ...database.categories,
      {
        id: createId('cat'),
        nombre: input.nombre.trim(),
        descripcion: input.descripcion.trim(),
        icono: input.icono.trim(),
      },
    ],
  }));
}

export async function updateDemoCategory(categoryId: string, input: Omit<Category, 'id'>) {
  await updateDemoDatabase((database) => ({
    ...database,
    categories: database.categories.map((category) =>
      category.id === categoryId
        ? {
            ...category,
            nombre: input.nombre.trim(),
            descripcion: input.descripcion.trim(),
            icono: input.icono.trim(),
          }
        : category
    ),
  }));
}

export async function deleteDemoCategory(categoryId: string) {
  await updateDemoDatabase((database) => {
    const hasProducts = database.products.some((product) => product.categoriaId === categoryId);
    if (hasProducts) {
      throw new Error('No puedes eliminar una categoria con productos asociados.');
    }

    return {
      ...database,
      categories: database.categories.filter((category) => category.id !== categoryId),
    };
  });
}

export async function getDemoProducts(categoryId?: string | null) {
  const database = await getDemoDatabase();
  const source = categoryId ? database.products.filter((product) => product.categoriaId === categoryId) : database.products;

  return [...source]
    .sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))
    .map((product) => normalizeProduct(product, database.categories));
}

export async function getDemoProductById(productId: string) {
  const database = await getDemoDatabase();
  const product = database.products.find((item) => item.id === productId);
  return product ? normalizeProduct(product, database.categories) : null;
}

export async function createDemoProduct(input: ProductInput) {
  await updateDemoDatabase((database) => ({
    ...database,
    products: [
      {
        id: createId('prod'),
        nombre: input.nombre.trim(),
        descripcion: input.descripcion.trim(),
        precio: input.precio,
        stock: input.stock,
        categoriaId: input.categoriaId,
        imagenUrl: input.imagenUrl?.trim() || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      ...database.products,
    ],
  }));
}

export async function updateDemoProduct(productId: string, input: ProductInput) {
  await updateDemoDatabase((database) => ({
    ...database,
    products: database.products.map((product) =>
      product.id === productId
        ? {
            ...product,
            nombre: input.nombre.trim(),
            descripcion: input.descripcion.trim(),
            precio: input.precio,
            stock: input.stock,
            categoriaId: input.categoriaId,
            imagenUrl: input.imagenUrl?.trim() || null,
            updatedAt: new Date().toISOString(),
          }
        : product
    ),
  }));
}

export async function deleteDemoProduct(productId: string) {
  await updateDemoDatabase((database) => ({
    ...database,
    products: database.products.filter((product) => product.id !== productId),
    orders: database.orders.filter((order) => order.productoId !== productId),
  }));
}

export async function getDemoUsers() {
  const database = await getDemoDatabase();
  return [...database.users]
    .sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))
    .map(stripPassword);
}

export async function updateDemoProfile(userId: string, payload: UpdateProfilePayload) {
  await updateDemoDatabase((database) => {
    const normalizedEmail = payload.email.trim().toLowerCase();
    const emailInUse = database.users.some((user) => user.id !== userId && user.email.toLowerCase() === normalizedEmail);

    if (emailInUse) {
      throw new Error('Ese correo ya esta en uso.');
    }

    return {
      ...database,
      users: database.users.map((user) =>
        user.id === userId
          ? {
              ...user,
              nombreCompleto: payload.nombreCompleto.trim(),
              email: normalizedEmail,
            }
          : user
      ),
    };
  });
}

export async function deactivateDemoProfile(userId: string) {
  await updateDemoDatabase((database) => ({
    ...database,
    users: database.users.map((user) =>
      user.id === userId
        ? {
            ...user,
            activo: false,
          }
        : user
    ),
  }));
}

export async function getDemoOrdersByUser(userId: string) {
  const database = await getDemoDatabase();
  return database.orders
    .filter((order) => order.usuarioId === userId)
    .sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))
    .map((order) => normalizeOrder(order, database.products));
}

export async function createDemoOrder(input: {
  usuarioId: string;
  productoId: string;
  cantidad: number;
  total: number;
}) {
  await updateDemoDatabase((database) => ({
    ...database,
    orders: [
      {
        id: createId('order'),
        usuarioId: input.usuarioId,
        productoId: input.productoId,
        cantidad: input.cantidad,
        estado: 'carrito',
        total: input.total,
        createdAt: new Date().toISOString(),
      },
      ...database.orders,
    ],
  }));
}

export async function updateDemoOrder(orderId: string, payload: { cantidad?: number; estado?: OrderStatus; total?: number }) {
  await updateDemoDatabase((database) => ({
    ...database,
    orders: database.orders.map((order) =>
      order.id === orderId
        ? {
            ...order,
            ...payload,
          }
        : order
    ),
  }));
}

export async function cancelDemoOrder(orderId: string) {
  await updateDemoDatabase((database) => ({
    ...database,
    orders: database.orders.filter((order) => order.id !== orderId),
  }));
}
