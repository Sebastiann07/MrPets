# MrPets (Fase 1)

Proyecto Expo + React Native con Supabase.

## Requisitos
- Node.js + npm
- App Expo Go (Android/iOS) o emulador

## Configuración
1. Crea un archivo `.env` (puedes copiar `.env.example`).

Variables requeridas:
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

2. Instala dependencias:

```bash
npm install
```

## Ejecutar

```bash
npm start
```

Luego:
- Escanea el QR con **Expo Go**, o
- Presiona `a` para Android emulator / `i` para iOS simulator (si aplica).

## Base de datos (Supabase)
- Esquema SQL: `db/schema.sql`
- Entidades (tablas) mínimas (≥4):
  - `clientes`
  - `categorias`
  - `productos`
  - `pedidos`
  - `pedidos_detalle`

Para crear la BD:
1. Abre Supabase → **SQL Editor**
2. Pega y ejecuta el contenido de `db/schema.sql`

## Estructura del proyecto
- Pantallas: `src/Pantallas/`
- Navegación: `src/Navegacion/`
- Servicios (Supabase / lógica): `src/Services/`
- Componentes reutilizables: `src/Components/`
- Modelos/types: `src/Models/`
- Tema: `src/Theme/`

## Vistas base + navegación
- Login: `src/Pantallas/LoginScreen.tsx`
- Home: `src/Pantallas/HomeScreen.tsx`
- Navegación Auth/App:
  - `src/Navegacion/AuthNavigator.tsx`
  - `src/Navegacion/AppNavigator.tsx`
