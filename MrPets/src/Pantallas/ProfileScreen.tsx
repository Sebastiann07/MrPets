import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import Header from '../Components/Header';
import UserCard from '../Components/UserCard';
import { Pedido } from '../Models/models';
import { useAuth } from '../Services/useAuth';
import { orderService } from '../Services/orderService';
import { colors } from '../Theme/colors';

export default function ProfileScreen() {
  const { profile, logout } = useAuth();
  const navigation = useNavigation<any>();
  const [orders, setOrders] = useState<Pedido[]>([]);

  useEffect(() => {
    if (profile?.id) {
      void orderService.getOrdersByUser(profile.id).then(setOrders);
    }
  }, [profile]);

  const handleLogout = async () => {
    await logout();
  };

  if (!profile) return null;

  return (
    <View style={styles.container}>
      <Header title="Mi Perfil" />

      <View style={styles.content}>
        <UserCard user={profile} />

        <View style={styles.actions}>
          {profile.rol === 'admin' ? (
            <TouchableOpacity style={[styles.actionBtn, styles.adminBtn]} onPress={() => navigation.navigate('UsersTab')}>
              <Text style={styles.adminBtnText}>Gestionar usuarios</Text>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity style={[styles.actionBtn, styles.logoutBtn]} onPress={handleLogout}>
            <Text style={styles.logoutBtnText}>Cerrar sesion</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Mis pedidos</Text>
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.orderCard}>
              <Text style={styles.orderDate}>Pedido: {item.id}</Text>
              <Text style={styles.orderTotal}>Total: ${item.total}</Text>
              <Text style={[styles.orderStatus, { color: item.estado === 'pagado' ? 'green' : colors.primary }]}>
                {item.estado}
              </Text>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>No tienes pedidos aun.</Text>}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  content: { padding: 16, flex: 1 },
  actions: { gap: 12, marginBottom: 24, marginTop: 12 },
  actionBtn: { padding: 16, borderRadius: 12, alignItems: 'center' },
  adminBtn: { backgroundColor: '#e3f2fd', borderWidth: 1, borderColor: '#2196f3' },
  adminBtnText: { color: '#1976d2', fontSize: 16, fontWeight: 'bold' },
  logoutBtn: { backgroundColor: '#ffebee', borderWidth: 1, borderColor: '#f44336' },
  logoutBtnText: { color: '#d32f2f', fontSize: 16, fontWeight: 'bold' },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  orderCard: { backgroundColor: 'white', padding: 16, borderRadius: 12, marginBottom: 12 },
  orderDate: { fontSize: 14, color: '#666' },
  orderTotal: { fontSize: 18, fontWeight: 'bold', marginVertical: 4 },
  orderStatus: { fontSize: 14, fontWeight: 'bold', textTransform: 'uppercase' },
  emptyText: { color: '#666', textAlign: 'center', marginTop: 24 }
});
