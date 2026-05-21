import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import Header from '../Components/Header';
import { Producto } from '../Models/models';
import { useAuth } from '../Services/useAuth';
import { useCart } from '../Services/useCart';
import { productService } from '../Services/productService';
import { colors } from '../Theme/colors';

export default function ProductDetailScreen() {
  const route = useRoute<RouteProp<any, any>>();
  const navigation = useNavigation<any>();
  const { profile } = useAuth();
  const { addItem } = useCart();
  const productId = route.params?.productId;
  const isAdmin = profile?.rol === 'admin';

  const [product, setProduct] = useState<Producto | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    void loadProduct();
  }, [productId]);

  async function loadProduct() {
    setLoading(true);
    try {
      if (productId) {
        const nextProduct = await productService.getProductById(productId);
        setProduct(nextProduct);
      }
    } finally {
      setLoading(false);
    }
  }

  const handleAddToCart = () => {
    if (!profile || !product) return;
    if (product.stock < 1) return;

    addItem(product, quantity);
    Alert.alert('Listo', 'Producto agregado al carrito');
    navigation.goBack();
  };

  const handleIncreaseStock = async () => {
    if (!isAdmin || !product) return;

    setIsSubmitting(true);
    try {
      const updatedProduct = await productService.updateProductStock(product.id, product.stock + quantity);
      if (updatedProduct) {
        setProduct(updatedProduct);
      } else {
        await loadProduct();
      }
      setQuantity(1);
      Alert.alert('Listo', 'Stock actualizado correctamente.');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'No se pudo actualizar el stock.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <View style={styles.container}><Text>Cargando...</Text></View>;
  }

  if (!product) {
    return <View style={styles.container}><Text>Producto no encontrado</Text></View>;
  }

  return (
    <View style={styles.container}>
      <Header title="Detalles" showBack />
      <ScrollView>
        {product.imagen_url ? (
          <Image source={{ uri: product.imagen_url }} style={styles.image} />
        ) : null}
        <View style={styles.content}>
          <Text style={styles.title}>{product.nombre}</Text>
          <Text style={styles.price}>${product.precio}</Text>
          <Text style={styles.description}>{product.descripcion}</Text>

          <View style={styles.quantityContainer}>
            <Text style={styles.stockText}>Disponibles: {product.stock}</Text>
            <View style={styles.quantityControls}>
              <TouchableOpacity onPress={() => setQuantity(Math.max(1, quantity - 1))} style={styles.qtyBtn}>
                <Ionicons name="remove" size={20} color={colors.primary} />
              </TouchableOpacity>
              <Text style={styles.qtyText}>{quantity}</Text>
              <TouchableOpacity
                onPress={() => setQuantity(isAdmin ? quantity + 1 : Math.min(product.stock, quantity + 1))}
                style={styles.qtyBtn}
              >
                <Ionicons name="add" size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.helperText}>
            {isAdmin ? 'Cantidad a agregar al inventario' : 'Cantidad a agregar al carrito'}
          </Text>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.buyButton, (!isAdmin && (product.stock < 1 || !profile)) || isSubmitting ? styles.buyButtonDisabled : null]}
          onPress={isAdmin ? () => void handleIncreaseStock() : handleAddToCart}
          disabled={(!isAdmin && (product.stock < 1 || !profile)) || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color={colors.textOnPrimary} />
          ) : (
            <Text style={styles.buyButtonText}>
              {isAdmin ? 'Agregar al inventario' : profile ? 'Agregar al carrito' : 'Inicia sesion para comprar'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  image: { width: '100%', height: 300, resizeMode: 'cover' },
  content: { padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  price: { fontSize: 22, color: colors.primary, fontWeight: '600', marginBottom: 16 },
  description: { fontSize: 16, color: colors.textMuted, lineHeight: 24, marginBottom: 24 },
  quantityContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stockText: { fontSize: 16, color: colors.textMuted },
  helperText: { fontSize: 14, color: colors.textMuted, marginTop: 12 },
  quantityControls: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceAlt, borderRadius: 20 },
  qtyBtn: { padding: 10 },
  qtyText: { fontSize: 18, fontWeight: 'bold', paddingHorizontal: 16 },
  footer: { padding: 20, borderTopWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  buyButton: { backgroundColor: colors.primary, padding: 16, borderRadius: 12, alignItems: 'center' },
  buyButtonDisabled: { opacity: 0.65 },
  buyButtonText: { color: colors.textOnPrimary, fontSize: 18, fontWeight: 'bold' }
});
