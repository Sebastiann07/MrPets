import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../Services/useAuth';
import { colors } from '../Theme/colors';

export default function LoginScreen() {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading } = useAuth();
  const navigation = useNavigation<any>();

  const handleLogin = async () => {
    if (!correo.trim() || !password.trim()) {
      Alert.alert('Error', 'Todos los campos son obligatorios');
      return;
    }
    try {
      console.log('Iniciando sesion con:', correo);
      await login(correo.trim(), password);
    } catch (e: any) {
      console.error(e);
      Alert.alert('Error de acceso', e.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>MrPets</Text>
      <Text style={styles.subtitle}>Bienvenido de nuevo</Text>
      
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Correo electrónico"
          value={correo}
          onChangeText={setCorreo}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity 
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Iniciando...' : 'Iniciar Sesión'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.linkButton}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.linkText}>¿No tienes cuenta? Regístrate</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#f8f9fa' },
  title: { fontSize: 40, fontWeight: 'bold', color: colors.primary, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 40, marginTop: 8 },
  form: { gap: 16 },
  input: { backgroundColor: 'white', padding: 16, borderRadius: 12, fontSize: 16, borderWidth: 1, borderColor: '#eee' },
  button: { backgroundColor: colors.primary, padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  linkButton: { alignItems: 'center', marginTop: 16 },
  linkText: { color: colors.primary, fontSize: 14, fontWeight: '600' }
});
