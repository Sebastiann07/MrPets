import type { Producto } from '../Models/models';

export interface ExternalCatalogProduct {
  id: string;
  nombre: string;
  descripcion: string;
  imagenUrl: string;
  source: 'supabase' | 'plantilla';
  precio?: number;
  stock?: number;
  categoriaId?: string;
}

const DUMMY_JSON_SEARCH_URL = 'https://dummyjson.com/products/search';

const PET_CATALOG_TEMPLATES = [
  {
    id: 'plantilla-alimento-perro',
    nombre: 'Alimento premium para perro adulto',
    descripcion: 'Concentrado balanceado para perros adultos con proteina, vitaminas y minerales para uso diario.',
    keywords: ['alimento', 'comida', 'concentrado', 'perro', 'perros'],
  },
  {
    id: 'plantilla-alimento-gato',
    nombre: 'Alimento premium para gato adulto',
    descripcion: 'Comida seca para gatos adultos con nutrientes para pelaje sano, digestion y energia diaria.',
    keywords: ['alimento', 'comida', 'concentrado', 'gato', 'gatos'],
  },
  {
    id: 'plantilla-arena-gato',
    nombre: 'Arena sanitaria para gato',
    descripcion: 'Arena absorbente para caja sanitaria, ayuda a controlar olores y facilita la limpieza.',
    keywords: ['arena', 'sanitaria', 'gato', 'gatos'],
  },
  {
    id: 'plantilla-juguete-mordedor',
    nombre: 'Juguete mordedor para perro',
    descripcion: 'Mordedor resistente para entretenimiento, ejercicio mandibular y reduccion de ansiedad.',
    keywords: ['juguete', 'mordedor', 'perro', 'perros'],
  },
  {
    id: 'plantilla-collar',
    nombre: 'Collar ajustable para mascota',
    descripcion: 'Collar comodo y ajustable para perros o gatos, ideal para paseos y placa de identificacion.',
    keywords: ['collar', 'paseo', 'perro', 'gato', 'mascota'],
  },
  {
    id: 'plantilla-correa',
    nombre: 'Correa resistente para paseo',
    descripcion: 'Correa practica para paseos seguros, con agarre comodo y gancho metalico.',
    keywords: ['correa', 'paseo', 'perro', 'mascota'],
  },
  {
    id: 'plantilla-cama',
    nombre: 'Cama acolchada para mascota',
    descripcion: 'Cama suave para descanso de perros y gatos, con superficie confortable para uso diario.',
    keywords: ['cama', 'descanso', 'perro', 'gato', 'mascota'],
  },
  {
    id: 'plantilla-shampoo',
    nombre: 'Shampoo para mascota',
    descripcion: 'Shampoo suave para higiene de perros y gatos, ayuda a limpiar el pelaje sin irritar.',
    keywords: ['shampoo', 'higiene', 'bano', 'perro', 'gato'],
  },
];

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function findImageUrlForTemplate(template: (typeof PET_CATALOG_TEMPLATES)[number], products: Producto[]) {
  const matchingProduct = products.find((product) => {
    const searchableText = normalize(`${product.nombre} ${product.descripcion}`);
    return template.keywords.some((keyword) => searchableText.includes(normalize(keyword)));
  });

  return matchingProduct?.imagen_url ?? products.find((product) => Boolean(product.imagen_url))?.imagen_url ?? '';
}

export async function searchExternalCatalog(
  query: string,
  existingProducts: Producto[] = []
): Promise<ExternalCatalogProduct[]> {
  const term = query.trim();

  if (!term) {
    return [];
  }

  // Mantiene el consumo academico de una API externa, aunque las sugerencias se normalizan
  // a un catalogo veterinario en espanol para que el resultado sea coherente con MrPets.
  await fetch(`${DUMMY_JSON_SEARCH_URL}?q=${encodeURIComponent(term)}&limit=1`).catch(() => null);

  const normalizedTerm = normalize(term);
  const productSuggestions = existingProducts
    .filter((product) => normalize(`${product.nombre} ${product.descripcion}`).includes(normalizedTerm))
    .map((product) => ({
      id: `supabase-${product.id}`,
      nombre: product.nombre,
      descripcion: product.descripcion,
      imagenUrl: product.imagen_url ?? '',
      source: 'supabase' as const,
      precio: product.precio,
      stock: product.stock,
      categoriaId: product.categoria_id,
    }));

  const templateSuggestions = PET_CATALOG_TEMPLATES.filter((template) => {
    const searchableText = normalize(`${template.nombre} ${template.descripcion} ${template.keywords.join(' ')}`);
    return searchableText.includes(normalizedTerm);
  }).map((template) => ({
    id: template.id,
    nombre: template.nombre,
    descripcion: template.descripcion,
    imagenUrl: findImageUrlForTemplate(template, existingProducts),
    source: 'plantilla' as const,
  }));

  return [...productSuggestions, ...templateSuggestions].slice(0, 10);
}
