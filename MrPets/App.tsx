import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import AppErrorBoundary from './src/Components/AppErrorBoundary';
import AppNavigator from './src/Navegacion/AppNavigator';
import { AuthProvider } from './src/Services/useAuth';

export default function App() {
  return (
    <SafeAreaProvider>
      <AppErrorBoundary>
        <AuthProvider>
          <StatusBar style="dark" />
          <AppNavigator />
        </AuthProvider>
      </AppErrorBoundary>
    </SafeAreaProvider>
  );
}
