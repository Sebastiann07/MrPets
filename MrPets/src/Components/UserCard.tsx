import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Cliente } from '../Models/models';

export default function UserCard({ user }: { user: Cliente }) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.name}>{user.nombre}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{user.rol}</Text>
        </View>
      </View>
      <Text style={styles.email}>{user.correo}</Text>
      <Text style={styles.email}>ID: {user.id}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  roleBadge: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    color: '#1976d2',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  email: {
    fontSize: 14,
    color: '#666',
  },
});
