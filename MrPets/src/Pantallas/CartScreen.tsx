import { Ionicons } from '@expo/vector-icons';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import Header from '../Components/Header';
import type { AppTabParamList } from '../Navegacion/AppNavigator';
import { useAuth } from '../Services/useAuth';
import { useCart } from '../Services/useCart';
import { orderService } from '../Services/orderService';
import { colors } from '../Theme/colors';

type Props = BottomTabScreenProps<AppTabParamList, 'CartTab'>;

export default function CartScreen({ navigation }: Props) {
  const { profile } = useAuth();
  const { items, itemCount, total, updateQuantity, removeItem, clear } = useCart();

  const handleCheckout = async () => {
    if (!profile) return;
    if (items.length === 0) return;

    try {
      const order = await orderService.createOrder(
        profile.id,
        items.map((entry) => ({
          producto_id: entry.product.id,
          cantidad: entry.quantity,
          precio: entry.product.precio,
        }))
      );

      if (order) {
        Alert.alert('Exito', 'Pedido realizado correctamente');
        clear();
        navigation.navigate('HomeTab');
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'No se pudo completar el pedido.');
    }
  };

  return (
    <View style={styles.screen}>
      <Header title="MrPets" subtitle="Carrito" rightLabel="Productos" onRightPress={() => navigation.navigate('ProductsTab')} />

      {items.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Ionicons name="cart-outline" size={46} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>Tu carrito esta vacio</Text>
          <Text style={styles.emptyText}>Agrega productos para verlos aqui.</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('ProductsTab')}>
            <Text style={styles.primaryButtonText}>Ir a productos</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView contentContainerStyle={styles.content}>
            {items.map((entry) => (
              <View key={entry.product.id} style={styles.itemCard}>
                <View style={styles.itemRowTop}>
                  <View style={styles.itemTextWrap}>
                    <Text style={styles.itemTitle} numberOfLines={1}>
                      {entry.product.nombre}
                    </Text>
                    <Text style={styles.itemSubtitle}>${Number(entry.product.precio).toLocaleString()} c/u</Text>
                  </View>

                  <TouchableOpacity onPress={() => removeItem(entry.product.id)} style={styles.removeBtn}>
                    <Ionicons name="trash-outline" size={18} color={colors.danger} />
                  </TouchableOpacity>
                </View>

                <View style={styles.itemRowBottom}>
                  <View style={styles.qtyControls}>
                    <TouchableOpacity
                      onPress={() => updateQuantity(entry.product.id, entry.quantity - 1)}
                      style={styles.qtyBtn}
                      disabled={entry.quantity <= 1}
                    >
                      <Ionicons name="remove" size={18} color={entry.quantity <= 1 ? colors.textMuted : colors.primary} />
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{entry.quantity}</Text>
                    <TouchableOpacity onPress={() => updateQuantity(entry.product.id, entry.quantity + 1)} style={styles.qtyBtn}>
                      <Ionicons name="add" size={18} color={colors.primary} />
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.itemTotal}>
                    ${(entry.quantity * Number(entry.product.precio)).toLocaleString()}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>

          <View style={styles.footer}>
            <View style={styles.footerRow}>
              <Text style={styles.footerLabel}>Items</Text>
              <Text style={styles.footerValue}>{itemCount}</Text>
            </View>
            <View style={styles.footerRow}>
              <Text style={styles.footerLabel}>Total</Text>
              <Text style={styles.footerTotal}>${total.toLocaleString()}</Text>
            </View>

            <TouchableOpacity style={styles.checkoutButton} onPress={() => void handleCheckout()}>
              <Text style={styles.checkoutButtonText}>Confirmar compra</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
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
    paddingBottom: 24,
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 10,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '900',
    marginTop: 6,
  },
  emptyText: {
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 21,
  },
  primaryButton: {
    marginTop: 10,
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
  },
  primaryButtonText: {
    color: colors.textOnPrimary,
    fontWeight: '800',
  },
  itemCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    padding: 14,
    marginBottom: 12,
  },
  itemRowTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  itemTextWrap: {
    flex: 1,
  },
  itemTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  itemSubtitle: {
    color: colors.textMuted,
    marginTop: 4,
  },
  removeBtn: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemRowBottom: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  qtyControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 6,
  },
  qtyBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    color: colors.text,
    fontWeight: '900',
    minWidth: 22,
    textAlign: 'center',
  },
  itemTotal: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: 16,
    backgroundColor: colors.surface,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  footerLabel: {
    color: colors.textMuted,
  },
  footerValue: {
    color: colors.text,
    fontWeight: '800',
  },
  footerTotal: {
    color: colors.text,
    fontWeight: '900',
    fontSize: 18,
  },
  checkoutButton: {
    marginTop: 10,
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: colors.textOnPrimary,
    fontWeight: '900',
    fontSize: 16,
  },
});
