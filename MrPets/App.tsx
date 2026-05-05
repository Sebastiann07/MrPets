import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import AppErrorBoundary from './src/Components/AppErrorBoundary';
import AppNavigator from './src/Navegacion/AppNavigator';
import { AuthProvider } from './src/Services/useAuth';
import { CartProvider } from './src/Services/useCart';

export default function App() {
  return (
    <SafeAreaProvider>
      <AppErrorBoundary>
        <AuthProvider>
          <CartProvider>
            <StatusBar style="dark" />
            <AppNavigator />
          </CartProvider>
        </AuthProvider>
      </AppErrorBoundary>
    </SafeAreaProvider>
  );
}
