export type SeedCategory = {
  name: string;
  description: string;
  icon: string;
};

export const DEFAULT_CATEGORIES: SeedCategory[] = [
  { name: 'Comida', description: 'Alimentos para mascotas de todas las edades.', icon: 'restaurant-outline' },
  { name: 'Juguetes', description: 'Juguetes para entretenimiento y estimulo.', icon: 'football-outline' },
  { name: 'Accesorios', description: 'Camas, collares, correas y mas.', icon: 'gift-outline' },
  { name: 'Medicamentos', description: 'Productos de salud y bienestar.', icon: 'medkit-outline' },
];
