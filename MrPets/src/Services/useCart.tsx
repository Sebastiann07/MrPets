import React, { createContext, useContext, useMemo, useState } from 'react';

import type { Producto } from '../Models/models';

export type CartItem = {
  product: Producto;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  total: number;
  addItem: (product: Producto, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function clampQuantity(product: Producto, quantity: number) {
  const safe = Math.max(1, Math.floor(quantity || 1));
  if (typeof product.stock === 'number' && product.stock > 0) {
    return Math.min(product.stock, safe);
  }
  return safe;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  function addItem(product: Producto, quantity = 1) {
    setItems((prev) => {
      const existing = prev.find((entry) => entry.product.id === product.id);
      const nextQty = clampQuantity(product, (existing?.quantity ?? 0) + quantity);

      if (existing) {
        return prev.map((entry) => (entry.product.id === product.id ? { ...entry, product, quantity: nextQty } : entry));
      }

      return [...prev, { product, quantity: clampQuantity(product, quantity) }];
    });
  }

  function updateQuantity(productId: string, quantity: number) {
    setItems((prev) => {
      const existing = prev.find((entry) => entry.product.id === productId);
      if (!existing) return prev;

      if (quantity <= 0) {
        return prev.filter((entry) => entry.product.id !== productId);
      }

      const nextQty = clampQuantity(existing.product, quantity);
      return prev.map((entry) => (entry.product.id === productId ? { ...entry, quantity: nextQty } : entry));
    });
  }

  function removeItem(productId: string) {
    setItems((prev) => prev.filter((entry) => entry.product.id !== productId));
  }

  function clear() {
    setItems([]);
  }

  const value = useMemo<CartContextValue>(() => {
    const itemCount = items.reduce((acc, entry) => acc + entry.quantity, 0);
    const total = items.reduce((acc, entry) => acc + entry.quantity * Number(entry.product.precio || 0), 0);

    return {
      items,
      itemCount,
      total,
      addItem,
      updateQuantity,
      removeItem,
      clear,
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe usarse dentro de CartProvider');
  }
  return context;
}
