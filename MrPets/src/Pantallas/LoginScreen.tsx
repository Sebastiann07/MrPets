import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../Services/useAuth';
import { colors } from '../Theme/colors';

export default function LoginScreen() {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { login, isLoading } = useAuth();
  const navigation = useNavigation<any>();

  const isValidEmail = (value: string) => {
    const email = value.trim();
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleLogin = async () => {
    setErrorMessage(null);
    const issues: string[] = [];
    const missing: string[] = [];

    if (!correo.trim()) missing.push('Correo');
    if (!password.trim()) missing.push('Contraseña');

    if (missing.length) {
      issues.push(`Falta: ${missing.join(', ')}`);
    }

    if (correo.trim() && !isValidEmail(correo)) {
      issues.push('Correo inválido (ej: usuario@dominio.com).');
    }

    if (password.trim() && password.trim().length < 6) {
      issues.push('La contraseña debe tener al menos 6 caracteres.');
    }

    if (issues.length) {
      const message = issues.join('\n');
      setErrorMessage(message);
      Alert.alert('Revisa tus datos', message);
      return;
    }
    try {
      console.log('Iniciando sesion con:', correo);
      await login(correo.trim().toLowerCase(), password);
    } catch (e: any) {
      console.error(e);
      const message = e?.message ? String(e.message) : 'No se pudo iniciar sesion';
      setErrorMessage(message);
      Alert.alert('Error de acceso', message);
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
          onChangeText={(value) => {
            setCorreo(value);
            if (errorMessage) setErrorMessage(null);
          }}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          value={password}
          onChangeText={(value) => {
            setPassword(value);
            if (errorMessage) setErrorMessage(null);
          }}
          secureTextEntry
        />

        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

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
  container: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: colors.background },
  title: { fontSize: 40, fontWeight: 'bold', color: colors.primary, textAlign: 'center' },
  subtitle: { fontSize: 16, color: colors.textMuted, textAlign: 'center', marginBottom: 40, marginTop: 8 },
  form: { gap: 16 },
  input: { backgroundColor: colors.surface, padding: 16, borderRadius: 12, fontSize: 16, borderWidth: 1, borderColor: colors.border, color: colors.text },
  errorText: { color: colors.danger, fontSize: 14, fontWeight: '700', lineHeight: 20 },
  button: { backgroundColor: colors.primary, padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: colors.textOnPrimary, fontSize: 16, fontWeight: 'bold' },
  linkButton: { alignItems: 'center', marginTop: 16 },
  linkText: { color: colors.primary, fontSize: 14, fontWeight: '600' }
});
