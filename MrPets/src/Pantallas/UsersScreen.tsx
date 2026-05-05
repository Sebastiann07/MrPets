import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useEffect, useState } from 'react';

import Header from '../Components/Header';
import UserCard from '../Components/UserCard';
import { colors } from '../Theme/colors';
import { useAuth } from '../Services/useAuth';
import type { AppTabParamList } from '../Navegacion/AppNavigator';
import { userService } from '../Services/userService';
import type { Cliente } from '../Models/models';

type Props = BottomTabScreenProps<AppTabParamList, 'UsersTab'>;

export default function UsersScreen({ navigation }: Props) {
  const { profile } = useAuth();
  const [users, setUsers] = useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const data = await userService.getAllUsers();
        setUsers(data);
      } catch (error) {
        Alert.alert('Error', error instanceof Error ? error.message : 'No se pudo cargar la lista de usuarios.');
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  if (profile?.rol !== 'admin') {
    return (
      <View style={styles.screen}>
        <Header title="MrPets" subtitle="Usuarios" />
        <View style={styles.blockedCard}>
          <Text style={styles.blockedTitle}>Acceso restringido</Text>
          <Text style={styles.blockedText}>Solo los administradores pueden consultar usuarios registrados.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Header title="MrPets" subtitle="Usuarios registrados" rightLabel="Perfil" onRightPress={() => navigation.navigate('ProfileTab')} />

      {isLoading ? (
        <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {users.map((user) => (
            <UserCard key={user.id} user={user} />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loader: {
    marginTop: 36,
  },
  content: {
    padding: 16,
    paddingBottom: 28,
  },
  blockedCard: {
    margin: 16,
    backgroundColor: colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
  },
  blockedTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
  },
  blockedText: {
    color: colors.textMuted,
    marginTop: 10,
    textAlign: 'center',
    lineHeight: 21,
  },
});
