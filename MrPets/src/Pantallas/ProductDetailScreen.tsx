import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import Header from '../Components/Header';
import { Producto } from '../Models/models';
import { useAuth } from '../Services/useAuth';
import { orderService } from '../Services/orderService';
import { productService } from '../Services/productService';
import { colors } from '../Theme/colors';

export default function ProductDetailScreen() {
  const route = useRoute<RouteProp<any, any>>();
  const navigation = useNavigation<any>();
  const { profile } = useAuth();
  const productId = route.params?.productId;

  const [product, setProduct] = useState<Producto | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (productId) {
        const nextProduct = await productService.getProductById(productId);
        setProduct(nextProduct);
      }
      setLoading(false);
    }

    void load();
  }, [productId]);

  const handleBuy = async () => {
    if (!profile || !product) return;

    try {
      const order = await orderService.createOrder(profile.id, [
        {
          producto_id: product.id,
          cantidad: quantity,
          precio: product.precio,
        },
      ]);

      if (order) {
        Alert.alert('Exito', 'Pedido realizado correctamente');
        navigation.goBack();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo completar el pedido.';
      Alert.alert('Error', message);
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
              <TouchableOpacity onPress={() => setQuantity(Math.min(product.stock, quantity + 1))} style={styles.qtyBtn}>
                <Ionicons name="add" size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.buyButton} onPress={handleBuy} disabled={product.stock < 1}>
          <Text style={styles.buyButtonText}>Comprar ahora</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  image: { width: '100%', height: 300, resizeMode: 'cover' },
  content: { padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  price: { fontSize: 22, color: colors.primary, fontWeight: '600', marginBottom: 16 },
  description: { fontSize: 16, color: '#666', lineHeight: 24, marginBottom: 24 },
  quantityContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stockText: { fontSize: 16, color: '#666' },
  quantityControls: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0f0f0', borderRadius: 20 },
  qtyBtn: { padding: 10 },
  qtyText: { fontSize: 18, fontWeight: 'bold', paddingHorizontal: 16 },
  footer: { padding: 20, borderTopWidth: 1, borderColor: '#eee' },
  buyButton: { backgroundColor: colors.primary, padding: 16, borderRadius: 12, alignItems: 'center' },
  buyButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' }
});
