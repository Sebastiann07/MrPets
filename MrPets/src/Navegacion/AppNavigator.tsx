import { Ionicons } from '@expo/vector-icons';
import type { NavigatorScreenParams } from '@react-navigation/native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { colors } from '../Theme/colors';
import { useAuth } from '../Services/useAuth';
import AuthNavigator from './AuthNavigator';
import HomeScreen from '../Pantallas/HomeScreen';
import ProductDetailScreen from '../Pantallas/ProductDetailScreen';
import ProductsScreen from '../Pantallas/ProductsScreen';
import ProfileScreen from '../Pantallas/ProfileScreen';
import UsersScreen from '../Pantallas/UsersScreen';

export type ProductsStackParamList = {
  ProductsList: { initialCategoryId?: string | null } | undefined;
  ProductDetail: { productId: string };
};

export type AppTabParamList = {
  HomeTab: undefined;
  ProductsTab: NavigatorScreenParams<ProductsStackParamList> | undefined;
  UsersTab: undefined;
  ProfileTab: undefined;
};

const Tab = createBottomTabNavigator<AppTabParamList>();
const ProductsStack = createNativeStackNavigator<ProductsStackParamList>();

function ProductsNavigator() {
  return (
    <ProductsStack.Navigator screenOptions={{ headerShown: false }}>
      <ProductsStack.Screen name="ProductsList" component={ProductsScreen} />
      <ProductsStack.Screen name="ProductDetail" component={ProductDetailScreen} />
    </ProductsStack.Navigator>
  );
}

function AuthenticatedTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: styles.tabBar,
        tabBarIcon: ({ color, size }) => {
          const iconMap: Record<keyof AppTabParamList, keyof typeof Ionicons.glyphMap> = {
            HomeTab: 'home',
            ProductsTab: 'pricetags',
            UsersTab: 'people',
            ProfileTab: 'person-circle',
          };

          return <Ionicons name={iconMap[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} options={{ title: 'Inicio' }} />
      <Tab.Screen name="ProductsTab" component={ProductsNavigator} options={{ title: 'Productos' }} />
      <Tab.Screen name="UsersTab" component={UsersScreen} options={{ title: 'Usuarios' }} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ title: 'Perfil' }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loaderWrap}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return <NavigationContainer>{isAuthenticated ? <AuthenticatedTabs /> : <AuthNavigator />}</NavigationContainer>;
}

const styles = StyleSheet.create({
  loaderWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  tabBar: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    height: 66,
    paddingBottom: 8,
    paddingTop: 6,
  },
});
