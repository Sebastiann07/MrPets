import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors } from '../Theme/colors';

type Props = {
  children: React.ReactNode;
};

type State = {
  errorMessage: string | null;
};

export default class AppErrorBoundary extends React.Component<Props, State> {
  state: State = {
    errorMessage: null,
  };

  static getDerivedStateFromError(error: Error): State {
    return {
      errorMessage: error.message,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[app-error-boundary]', error, errorInfo);
  }

  render() {
    if (!this.state.errorMessage) {
      return this.props.children;
    }

    return (
      <View style={styles.screen}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>MrPets encontro un error al renderizar</Text>
          <Text style={styles.message}>{this.state.errorMessage}</Text>
          <Text style={styles.hint}>
            Ahora ya no deberiamos ver pantalla blanca: este mensaje nos ayuda a identificar el componente exacto que esta fallando.
          </Text>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
  },
  message: {
    color: colors.danger,
    textAlign: 'center',
    marginTop: 16,
    fontWeight: '700',
  },
  hint: {
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 20,
  },
});
