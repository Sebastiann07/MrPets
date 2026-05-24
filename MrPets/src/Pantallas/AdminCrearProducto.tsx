import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import Header from '../Components/Header';
import type { ProductsStackParamList } from '../Navegacion/AppNavigator';
import type { ExternalCatalogProduct } from '../Services/externalCatalogAPI';
import { searchExternalCatalog } from '../Services/externalCatalogAPI';
import { useProducts } from '../Services/useProducts';
import { colors } from '../Theme/colors';

type Props = NativeStackScreenProps<ProductsStackParamList, 'AdminCrearProducto'>;

type ProductFormState = {
  nombre: string;
  descripcion: string;
  imagenUrl: string;
  precio: string;
  stock: string;
  categoriaId: string;
};

const EMPTY_FORM: ProductFormState = {
  nombre: '',
  descripcion: '',
  imagenUrl: '',
  precio: '',
  stock: '',
  categoriaId: '',
};

export default function AdminCrearProducto({ navigation, route }: Props) {
  const productId = route.params?.productId;
  const { products, categories, addProduct, editProduct, refreshAll } = useProducts();

  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<ExternalCatalogProduct[]>([]);
  const [form, setForm] = useState<ProductFormState>(EMPTY_FORM);
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [hasLoadedProduct, setHasLoadedProduct] = useState(false);

  const loadProductForEdit = useCallback(() => {
    if (!productId || hasLoadedProduct) {
      return;
    }

    const product = products.find((item) => item.id === productId);

    if (!product) {
      return;
    }

    setForm({
      nombre: product.nombre,
      descripcion: product.descripcion,
      imagenUrl: product.imagen_url ?? '',
      precio: String(product.precio),
      stock: String(product.stock),
      categoriaId: product.categoria_id,
    });
    setSearchTerm(product.nombre);
    setHasLoadedProduct(true);
  }, [hasLoadedProduct, productId, products]);

  useEffect(() => {
    void refreshAll();
  }, [refreshAll]);

  useEffect(() => {
    loadProductForEdit();
  }, [loadProductForEdit]);

  async function handleSearch() {
    setSearchError(null);
    setIsSearching(true);

    try {
      const results = await searchExternalCatalog(searchTerm, products);
      setSuggestions(results);

      if (results.length === 0) {
        setSearchError('No se encontraron plantillas para ese termino.');
      }
    } catch (error) {
      setSuggestions([]);
      setSearchError(error instanceof Error ? error.message : 'No se pudo consultar el catalogo externo.');
    } finally {
      setIsSearching(false);
    }
  }

  function applyTemplate(product: ExternalCatalogProduct) {
    // La plantilla solo llena datos descriptivos; precio y stock quedan en manos del administrador.
    setForm((prev) => ({
      ...prev,
      nombre: product.nombre,
      descripcion: product.descripcion,
      imagenUrl: product.imagenUrl,
      precio: product.precio !== undefined ? String(product.precio) : prev.precio,
      stock: product.stock !== undefined ? String(product.stock) : prev.stock,
      categoriaId: product.categoriaId ?? prev.categoriaId,
    }));
    setSuggestions([]);
    setSearchTerm(product.nombre);
  }

  async function handleSaveProduct() {
    const price = Number(form.precio);
    const stock = Number(form.stock);

    if (!form.nombre.trim() || !form.descripcion.trim() || !form.categoriaId) {
      Alert.alert('Datos incompletos', 'Completa nombre, descripcion y categoria.');
      return;
    }

    if (!Number.isFinite(price) || price <= 0 || !Number.isFinite(stock) || stock < 0) {
      Alert.alert('Datos invalidos', 'Revisa el precio y el stock del producto.');
      return;
    }

    setIsSaving(true);

    try {
      const productPayload = {
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim(),
        imagen_url: form.imagenUrl.trim(),
        precio: price,
        stock,
        categoria_id: form.categoriaId,
      };

      if (productId) {
        await editProduct(productId, productPayload);
        Alert.alert('Listo', 'Producto actualizado correctamente.');
      } else {
        await addProduct(productPayload);
        Alert.alert('Listo', 'Producto creado correctamente.');
      }

      setForm(EMPTY_FORM);
      setSearchTerm('');
      setSuggestions([]);
      setSearchError(null);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'No se pudo guardar el producto.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <View style={styles.screen}>
      <Header title="MrPets" subtitle={productId ? 'Editar producto' : 'Crear producto'} showBack />

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.searchBox}>
          <Text style={styles.sectionTitle}>Buscar plantilla de producto en catalogo externo</Text>

          <View style={styles.searchRow}>
            <TextInput
              style={[styles.input, styles.searchInput]}
              placeholder="Buscar por nombre"
              value={searchTerm}
              onChangeText={setSearchTerm}
              onSubmitEditing={() => void handleSearch()}
              returnKeyType="search"
            />
            <TouchableOpacity style={styles.iconButton} onPress={() => void handleSearch()} disabled={isSearching}>
              {isSearching ? (
                <ActivityIndicator color={colors.textOnPrimary} />
              ) : (
                <Ionicons name="search" size={22} color={colors.textOnPrimary} />
              )}
            </TouchableOpacity>
          </View>

          {searchError ? <Text style={styles.errorText}>{searchError}</Text> : null}

          {suggestions.length > 0 ? (
            <View style={styles.suggestions}>
              {suggestions.map((item) => (
                <TouchableOpacity key={item.id} style={styles.suggestionItem} onPress={() => applyTemplate(item)}>
                  {item.imagenUrl ? <Image source={{ uri: item.imagenUrl }} style={styles.suggestionImage} /> : null}
                  <View style={styles.suggestionTextWrap}>
                    <Text style={styles.suggestionTitle} numberOfLines={1}>
                      {item.nombre}
                    </Text>
                    <Text style={styles.suggestionMeta}>
                      {item.source === 'supabase' ? 'Producto existente' : 'Plantilla para mascota'}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : null}
        </View>

        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Datos del producto</Text>

          <TextInput
            style={styles.input}
            placeholder="Nombre"
            value={form.nombre}
            onChangeText={(value) => setForm((prev) => ({ ...prev, nombre: value }))}
          />
          <TextInput
            style={[styles.input, styles.multilineInput]}
            placeholder="Descripcion"
            value={form.descripcion}
            onChangeText={(value) => setForm((prev) => ({ ...prev, descripcion: value }))}
            multiline
          />
          <TextInput
            style={styles.input}
            placeholder="URL de la Imagen"
            value={form.imagenUrl}
            onChangeText={(value) => setForm((prev) => ({ ...prev, imagenUrl: value }))}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Precio"
            value={form.precio}
            onChangeText={(value) => setForm((prev) => ({ ...prev, precio: value }))}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Stock"
            value={form.stock}
            onChangeText={(value) => setForm((prev) => ({ ...prev, stock: value }))}
            keyboardType="numeric"
          />

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryPicker}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[styles.categoryOption, form.categoriaId === category.id && styles.categoryOptionActive]}
                onPress={() => setForm((prev) => ({ ...prev, categoriaId: category.id }))}
              >
                <Text style={[styles.categoryText, form.categoriaId === category.id && styles.categoryTextActive]}>
                  {category.nombre}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.saveButton} onPress={() => void handleSaveProduct()} disabled={isSaving}>
            {isSaving ? (
              <ActivityIndicator color={colors.textOnPrimary} />
            ) : (
              <Text style={styles.saveButtonText}>{productId ? 'Actualizar producto' : 'Guardar producto'}</Text>
            )}
          </TouchableOpacity>
        </View>
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
  searchBox: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
  },
  formCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 14,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 10,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.text,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    marginBottom: 0,
  },
  multilineInput: {
    minHeight: 88,
    textAlignVertical: 'top',
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: colors.danger,
    marginTop: 10,
    fontWeight: '700',
  },
  suggestions: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: 12,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  suggestionImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: colors.surfaceAlt,
  },
  suggestionTitle: {
    flex: 1,
    color: colors.text,
    fontWeight: '800',
  },
  suggestionTextWrap: {
    flex: 1,
  },
  suggestionMeta: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 3,
    fontWeight: '700',
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
  categoryText: {
    color: colors.text,
    fontWeight: '700',
  },
  categoryTextActive: {
    color: colors.textOnPrimary,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: colors.textOnPrimary,
    fontWeight: '900',
    fontSize: 16,
  },
});
