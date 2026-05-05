import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Producto } from '../Models/models';
import { colors } from '../Theme/colors';

interface ProductCardProps {
  product: Producto;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  isAdmin?: boolean;
}

export default function ProductCard({
  product,
  onPress,
  onEdit,
  onDelete,
  isAdmin,
}: ProductCardProps) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.8}
    >
      {product.imagen_url ? (
        <Image
          source={{ uri: product.imagen_url }}
          style={styles.image}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Text style={styles.placeholderText}>IMG</Text>
        </View>
      )}

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {product.nombre}
        </Text>
        <Text style={styles.description} numberOfLines={2}>
          {product.descripcion}
        </Text>

        <View style={styles.footer}>
          <Text style={styles.price}>${product.precio.toLocaleString()}</Text>
          <View
            style={[
              styles.stockBadge,
              product.stock === 0 && styles.outOfStock,
            ]}
          >
            <Text
              style={[
                styles.stockText,
                product.stock === 0 && styles.outOfStockText,
              ]}
            >
              {product.stock > 0 ? `${product.stock} disp.` : 'Agotado'}
            </Text>
          </View>
        </View>
      </View>

      {isAdmin && (
        <View style={styles.adminActions}>
          <TouchableOpacity onPress={onEdit} style={styles.actionBtn}>
            <Text style={styles.actionText}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onDelete}
            style={[styles.actionBtn, styles.deleteBtn]}
          >
            <Text style={[styles.actionText, styles.deleteText]}>Borrar</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    height: 150,
    width: '100%',
    backgroundColor: '#f5f5f5',
  },
  imagePlaceholder: {
    height: 150,
    width: '100%',
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#999',
    fontWeight: 'bold',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  stockBadge: {
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  outOfStock: {
    backgroundColor: '#ffebee',
  },
  stockText: {
    fontSize: 12,
    color: '#2e7d32',
    fontWeight: '600',
  },
  outOfStockText: {
    color: '#c62828',
  },
  adminActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  actionBtn: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
  },
  deleteBtn: {
    borderLeftWidth: 1,
    borderLeftColor: '#eee',
  },
  actionText: {
    color: colors.primary,
    fontWeight: '600',
  },
  deleteText: {
    color: '#d32f2f',
  },
});
