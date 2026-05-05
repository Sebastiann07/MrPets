import { useCallback, useEffect, useState } from 'react';
import { categoryService } from './categoryService';
import { productService } from './productService';
import { Producto, Categoria } from '../Models/models';
import { supabase } from './supabaseClient';

export function useProducts(initialCategoryId?: string | null) {
  const [products, setProducts] = useState<Producto[]>([]);
  const [categories, setCategories] = useState<Categoria[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(initialCategoryId ?? null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshAll = useCallback(async () => {
    setIsLoading(true);
    const catData = await categoryService.getCategories();
    const prodData = await productService.getProducts();
    setCategories(catData);
    setProducts(prodData);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void refreshAll();
  }, [refreshAll]);

  const selectCategory = (categoryId: string | null) => {
    setSelectedCategoryId(categoryId);
  };

  const addProduct = async (input: any) => {
    await supabase.from('productos').insert([{...input, id: Date.now().toString()}]);
    await refreshAll();
  };

  const editProduct = async (productId: string, input: any) => {
    await supabase.from('productos').update(input).eq('id', productId);
    await refreshAll();
  };

  const removeProduct = async (productId: string) => {
    await supabase.from('productos').delete().eq('id', productId);
    await refreshAll();
  };

  const addCategory = async (input: any) => {
    await supabase.from('categorias').insert([{...input, id: Date.now().toString()}]);
    await refreshAll();
  };

  const editCategory = async (categoryId: string, input: any) => {
    await supabase.from('categorias').update(input).eq('id', categoryId);
    await refreshAll();
  };

  const removeCategory = async (categoryId: string) => {
    await supabase.from('categorias').delete().eq('id', categoryId);
    await refreshAll();
  };

  const filteredProducts = selectedCategoryId 
    ? products.filter(p => p.categoria_id === selectedCategoryId) 
    : products;

  return {
    products: filteredProducts,
    categories,
    selectedCategoryId,
    isLoading,
    refreshAll,
    selectCategory,
    addProduct,
    editProduct,
    removeProduct,
    addCategory,
    editCategory,
    removeCategory,
  };
}
