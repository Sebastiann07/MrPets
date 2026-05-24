import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useCallback, useMemo } from 'react';

import CategoryFilter from '../Components/CategoryFilter';
import Header from '../Components/Header';
import ProductCard from '../Components/ProductCard';
import type { ProductsStackParamList } from '../Navegacion/AppNavigator';
import { useAuth } from '../Services/useAuth';
import { useProducts } from '../Services/useProducts';
import { colors } from '../Theme/colors';

type Props = NativeStackScreenProps<ProductsStackParamList, 'ProductsList'>;

export default function ProductsScreen({ navigation, route }: Props) {
  const { profile } = useAuth();
  const { products, categories, selectedCategoryId, isLoading, refreshAll, selectCategory, removeProduct } =
    useProducts(route.params?.initialCategoryId ?? null);

  const isAdmin = profile?.rol === 'admin';
  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === selectedCategoryId) ?? null,
    [categories, selectedCategoryId]
  );

  useFocusEffect(
    useCallback(() => {
      void refreshAll();
    }, [refreshAll])
  );

  function confirmDeleteProduct(productId: string, productName: string) {
    Alert.alert('Eliminar producto', `Seguro que deseas eliminar ${productName}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () =>
          void removeProduct(productId).catch((error) =>
            Alert.alert('Error', error instanceof Error ? error.message : 'No se pudo eliminar el producto.')
          ),
      },
    ]);
  }

  return (
    <View style={styles.screen}>
      <Header
        title="MrPets"
        subtitle="Productos"
        rightLabel={selectedCategory ? 'Limpiar filtro' : undefined}
        onRightPress={selectedCategory ? () => void selectCategory(null) : undefined}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <CategoryFilter
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={(id) => void selectCategory(id)}
        />

        {isAdmin ? (
          <TouchableOpacity style={styles.createButton} onPress={() => navigation.navigate('AdminCrearProducto')}>
            <Ionicons name="add" size={22} color={colors.textOnPrimary} />
            <Text style={styles.createButtonText}>Nuevo producto</Text>
          </TouchableOpacity>
        ) : null}

        <Text style={styles.sectionTitle}>Catalogo</Text>

        {isLoading ? (
          <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
        ) : products.length === 0 ? (
          <Text style={styles.emptyText}>No hay productos para mostrar.</Text>
        ) : (
          products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onPress={() => navigation.navigate('ProductDetail', { productId: product.id })}
              isAdmin={isAdmin}
              onEdit={() => navigation.navigate('AdminCrearProducto', { productId: product.id })}
              onDelete={() => confirmDeleteProduct(product.id, product.nombre)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 28,
  },
  createButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginTop: 12,
    marginBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  createButtonText: {
    color: colors.textOnPrimary,
    fontWeight: '900',
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 12,
  },
  loader: {
    marginTop: 28,
  },
  emptyText: {
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 20,
    fontWeight: '700',
  },
});
