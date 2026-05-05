import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../Services/useAuth';
import { colors } from '../Theme/colors';

export default function RegisterScreen() {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { register, isLoading } = useAuth();
  const navigation = useNavigation<any>();

  const isValidEmail = (value: string) => {
    const email = value.trim();
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleRegister = async () => {
    setErrorMessage(null);
    const issues: string[] = [];
    const missing: string[] = [];

    if (!nombre.trim()) missing.push('Nombre completo');
    if (!correo.trim()) missing.push('Correo');
    if (!password.trim()) missing.push('Contraseña');

    if (missing.length) {
      issues.push(`Falta: ${missing.join(', ')}`);
    }

    if (nombre.trim() && nombre.trim().length < 2) {
      issues.push('El nombre debe tener al menos 2 caracteres.');
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
      console.log('Registrando usuario nuevo:', correo);
      await register(nombre.trim(), correo.trim().toLowerCase(), password);
    } catch (e: any) {
      console.error(e);
      const message = e?.message ? String(e.message) : 'No se pudo crear la cuenta';
      setErrorMessage(message);
      Alert.alert('Error al registrar', message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crear Cuenta</Text>
      
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Nombre completo"
          value={nombre}
          onChangeText={(value) => {
            setNombre(value);
            if (errorMessage) setErrorMessage(null);
          }}
        />
        
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
          onPress={handleRegister}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Registrando...' : 'Registrarse'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.linkButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.linkText}>¿Ya tienes cuenta? Inicia sesión</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: colors.background },
  title: { fontSize: 32, fontWeight: 'bold', color: colors.primary, marginBottom: 40, textAlign: 'center' },
  form: { gap: 16 },
  input: { backgroundColor: colors.surface, padding: 16, borderRadius: 12, fontSize: 16, borderWidth: 1, borderColor: colors.border, color: colors.text },
  errorText: { color: colors.danger, fontSize: 14, fontWeight: '700', lineHeight: 20 },
  button: { backgroundColor: colors.primary, padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: colors.textOnPrimary, fontSize: 16, fontWeight: 'bold' },
  linkButton: { alignItems: 'center', marginTop: 16 },
  linkText: { color: colors.primary, fontSize: 14, fontWeight: '600' }
});
