import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback, useMemo } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import Header from '../Components/Header';
import ProductCard from '../Components/ProductCard';
import { useAuth } from '../Services/useAuth';
import { useProducts } from '../Services/useProducts';
import { colors } from '../Theme/colors';

export default function HomeScreen() {
  const { profile } = useAuth();
  const { products, categories, refreshAll } = useProducts();
  const navigation = useNavigation<any>();

  useFocusEffect(
    useCallback(() => {
      void refreshAll();
    }, [refreshAll])
  );

  const countsByCategory = useMemo(() => {
    return categories.map((category) => ({
      category,
      total: products.filter((product) => product.categoria_id === category.id).length,
    }));
  }, [categories, products]);

  return (
    <View style={styles.container}>
      <Header title="MrPets" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Hola, {profile?.nombre || 'Amigo'}!</Text>
          <Text style={styles.subtitle}>Que necesita tu mascota hoy?</Text>
        </View>

        <View style={styles.statsRow}>
          {countsByCategory.map(({ category, total }) => (
            <TouchableOpacity
              key={category.id}
              style={styles.statCard}
              onPress={() =>
                navigation.navigate('ProductsTab', {
                  screen: 'ProductsList',
                  params: { initialCategoryId: category.id },
                })
              }
            >
              <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                {/* @ts-ignore */}
                <Ionicons name={category.icono || 'pricetag'} size={24} color={colors.primary} />
              </View>
              <Text style={styles.statTotal}>{total}</Text>
              <Text style={styles.statLabel}>{category.nombre}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Productos destacados</Text>
          <TouchableOpacity onPress={() => navigation.navigate('ProductsTab')}>
            <Text style={styles.seeAllText}>Ver todos</Text>
          </TouchableOpacity>
        </View>

        {products.slice(0, 3).map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onPress={() =>
              navigation.navigate('ProductsTab', {
                screen: 'ProductDetail',
                params: { productId: product.id },
              })
            }
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16 },
  welcomeSection: { marginBottom: 24 },
  welcomeText: { fontSize: 24, fontWeight: 'bold', color: colors.text, marginBottom: 4 },
  subtitle: { fontSize: 16, color: colors.textMuted },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  statCard: {
    flex: 1, minWidth: '45%', backgroundColor: colors.surface, padding: 16, borderRadius: 16,
    shadowColor: colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 8, elevation: 2,
  },
  iconContainer: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  statTotal: { fontSize: 24, fontWeight: 'bold', color: colors.text, marginBottom: 4 },
  statLabel: { fontSize: 14, color: colors.textMuted, fontWeight: '500' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: colors.text },
  seeAllText: { fontSize: 14, color: colors.primary, fontWeight: '600' },
});
