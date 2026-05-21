import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Alert, ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useCallback, useMemo, useState } from 'react';

import CategoryFilter from '../Components/CategoryFilter';
import Header from '../Components/Header';
import ProductCard from '../Components/ProductCard';
import { colors } from '../Theme/colors';
import { useAuth } from '../Services/useAuth';
import { useProducts } from '../Services/useProducts';
import type { ProductsStackParamList } from '../Navegacion/AppNavigator';
import type { Categoria, Producto } from '../Models/models';

type Props = NativeStackScreenProps<ProductsStackParamList, 'ProductsList'>;
type ProductForm = Omit<Producto, 'id' | 'created_at' | 'updated_at'>;

const EMPTY_PRODUCT: ProductForm = {
  nombre: '',
  descripcion: '',
  precio: 0,
  stock: 0,
  categoria_id: '',
  imagen_url: '',
};

const EMPTY_CATEGORY = {
  nombre: '',
  descripcion: '',
  icono: 'paw-outline',
};

export default function ProductsScreen({ navigation, route }: Props) {
  const { profile } = useAuth();
  const {
    products,
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
  } = useProducts(route.params?.initialCategoryId ?? null);

  const [productForm, setProductForm] = useState<ProductForm>(EMPTY_PRODUCT);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [categoryForm, setCategoryForm] = useState(EMPTY_CATEGORY);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  function resetProductForm() {
    setProductForm(EMPTY_PRODUCT);
    setEditingProductId(null);
  }

  function resetCategoryForm() {
    setCategoryForm(EMPTY_CATEGORY);
    setEditingCategoryId(null);
  }

  async function handleSaveProduct() {
    if (!productForm.nombre.trim() || !productForm.descripcion.trim() || !productForm.categoria_id) {
      Alert.alert('Datos incompletos', 'Completa nombre, descripcion y categoria.');
      return;
    }

    if (productForm.precio <= 0 || productForm.stock < 0) {
      Alert.alert('Datos invalidos', 'Revisa el precio y el stock del producto.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingProductId) {
        await editProduct(editingProductId, productForm);
        Alert.alert('Listo', 'Producto actualizado correctamente.');
      } else {
        await addProduct(productForm);
        Alert.alert('Listo', 'Producto creado correctamente.');
      }
      resetProductForm();
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'No se pudo guardar el producto.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSaveCategory() {
    if (!categoryForm.nombre.trim() || !categoryForm.descripcion.trim() || !categoryForm.icono.trim()) {
      Alert.alert('Datos incompletos', 'Completa todos los campos de categoria.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingCategoryId) {
        await editCategory(editingCategoryId, categoryForm as Omit<Categoria, 'id'>);
        Alert.alert('Listo', 'Categoria actualizada.');
      } else {
        await addCategory(categoryForm as Omit<Categoria, 'id'>);
        Alert.alert('Listo', 'Categoria creada.');
      }
      resetCategoryForm();
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'No se pudo guardar la categoria.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function loadProductToForm(product: Producto) {
    setEditingProductId(product.id);
    setProductForm({
      nombre: product.nombre,
      descripcion: product.descripcion,
      precio: product.precio,
      stock: product.stock,
      categoria_id: product.categoria_id,
      imagen_url: product.imagen_url ?? '',
    });
  }

  function loadCategoryToForm(category: Categoria) {
    setEditingCategoryId(category.id);
    setCategoryForm({
      nombre: category.nombre,
      descripcion: category.descripcion,
      icono: category.icono,
    });
  }

  return (
    <View style={styles.screen}>
      <Header
        title="MrPets"
        subtitle="Productos y categorias"
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
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>{editingProductId ? 'Editar producto' : 'Nuevo producto'}</Text>

            <TextInput
              style={styles.input}
              placeholder="Nombre"
              value={productForm.nombre}
              onChangeText={(value) => setProductForm((prev) => ({ ...prev, nombre: value }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Descripcion"
              value={productForm.descripcion}
              onChangeText={(value) => setProductForm((prev) => ({ ...prev, descripcion: value }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Precio"
              keyboardType="numeric"
              value={productForm.precio ? String(productForm.precio) : ''}
              onChangeText={(value) => setProductForm((prev) => ({ ...prev, precio: Number(value) || 0 }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Stock"
              keyboardType="numeric"
              value={productForm.stock ? String(productForm.stock) : ''}
              onChangeText={(value) => setProductForm((prev) => ({ ...prev, stock: Number(value) || 0 }))}
            />
            <TextInput
              style={styles.input}
              placeholder="URL de imagen (opcional)"
              value={productForm.imagen_url ?? ''}
              onChangeText={(value) => setProductForm((prev) => ({ ...prev, imagen_url: value }))}
            />

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryPicker}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[styles.categoryOption, productForm.categoria_id === category.id && styles.categoryOptionActive]}
                  onPress={() => setProductForm((prev) => ({ ...prev, categoria_id: category.id }))}
                >
                  <Text style={[styles.categoryOptionText, productForm.categoria_id === category.id && styles.categoryOptionTextActive]}>
                    {category.nombre}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.rowButtons}>
              <TouchableOpacity style={styles.primaryButton} onPress={() => void handleSaveProduct()} disabled={isSubmitting}>
                {isSubmitting ? <ActivityIndicator color={colors.textOnPrimary} /> : <Text style={styles.primaryButtonText}>Guardar producto</Text>}
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryButton} onPress={resetProductForm}>
                <Text style={styles.secondaryButtonText}>Limpiar</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.formTitle}>{editingCategoryId ? 'Editar categoria' : 'Nueva categoria'}</Text>
            <TextInput
              style={styles.input}
              placeholder="Nombre de la categoria"
              value={categoryForm.nombre}
              onChangeText={(value) => setCategoryForm((prev) => ({ ...prev, nombre: value }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Descripcion"
              value={categoryForm.descripcion}
              onChangeText={(value) => setCategoryForm((prev) => ({ ...prev, descripcion: value }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Icono Ionicons"
              value={categoryForm.icono}
              onChangeText={(value) => setCategoryForm((prev) => ({ ...prev, icono: value }))}
            />

            <View style={styles.rowButtons}>
              <TouchableOpacity style={styles.primaryButton} onPress={() => void handleSaveCategory()} disabled={isSubmitting}>
                <Text style={styles.primaryButtonText}>Guardar categoria</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryButton} onPress={resetCategoryForm}>
                <Text style={styles.secondaryButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>

            {categories.map((category) => (
              <View key={category.id} style={styles.adminRow}>
                <Text style={styles.adminRowText}>{category.nombre}</Text>
                <View style={styles.adminRowActions}>
                  <TouchableOpacity onPress={() => loadCategoryToForm(category)}>
                    <Ionicons name="create-outline" size={20} color={colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() =>
                      Alert.alert('Eliminar categoria', `Seguro que deseas eliminar ${category.nombre}?`, [
                        { text: 'Cancelar', style: 'cancel' },
                        {
                          text: 'Eliminar',
                          style: 'destructive',
                          onPress: () => void removeCategory(category.id).catch((error) => Alert.alert('Error', error instanceof Error ? error.message : 'No se pudo eliminar la categoria.')),
                        },
                      ])
                    }
                  >
                    <Ionicons name="trash-outline" size={20} color={colors.danger} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        ) : null}

        <Text style={styles.sectionTitle}>Catalogo</Text>

        {isLoading ? (
          <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
        ) : products.length === 0 ? (
          <Text style={styles.emptyText}>No hay productos para mostrar.</Text>
        ) : (
          products.map((product) => (
            <View key={product.id}>
              <ProductCard product={product} onPress={() => navigation.navigate('ProductDetail', { productId: product.id })} />

              {isAdmin ? (
                <View style={styles.rowButtons}>
                  <TouchableOpacity style={styles.secondaryButton} onPress={() => loadProductToForm(product)}>
                    <Text style={styles.secondaryButtonText}>Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() =>
                      Alert.alert('Eliminar producto', `Seguro que deseas eliminar ${product.nombre}?`, [
                        { text: 'Cancelar', style: 'cancel' },
                        {
                          text: 'Eliminar',
                          style: 'destructive',
                          onPress: () => void removeProduct(product.id).catch((error) => Alert.alert('Error', error instanceof Error ? error.message : 'No se pudo eliminar el producto.')),
                        },
                      ])
                    }
                  >
                    <Text style={styles.secondaryButtonText}>Eliminar</Text>
                  </TouchableOpacity>
                </View>
              ) : null}
            </View>
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
  formCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 24,
    padding: 16,
    marginTop: 12,
    marginBottom: 14,
  },
  formTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 10,
    marginTop: 4,
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.text,
    marginBottom: 10,
  },
  categoryPicker: {
    gap: 8,
    paddingVertical: 8,
  },
  categoryOption: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  categoryOptionActive: {
    backgroundColor: colors.primary,
  },
  categoryOptionText: {
    color: colors.text,
    fontWeight: '700',
  },
  categoryOptionTextActive: {
    color: colors.textOnPrimary,
  },
  rowButtons: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
    marginTop: 4,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: colors.textOnPrimary,
    fontWeight: '800',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: colors.primary,
    fontWeight: '800',
  },
  adminRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  adminRowText: {
    color: colors.text,
    fontWeight: '700',
  },
  adminRowActions: {
    flexDirection: 'row',
    gap: 12,
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
