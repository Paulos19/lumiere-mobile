import { useAuthStore } from "@/stores/useAuthStore";
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View } from "react-native";
import "../global.css";

export default function RootLayout() {
  const { hydrate, user, isLoading } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  // 1. Carregamento de fontes (Geist ou fallback)
  const [loaded] = useFonts({
    'Geist-Regular': require('../assets/fonts/Geist-Regular.ttf'),
    'Geist-Bold': require('../assets/fonts/Geist-Bold.ttf'),
  });

  // 2. Hidratar a sessão do usuário ao iniciar o App
  useEffect(() => {
    hydrate();
  }, []);

  // 3. Sistema de Proteção de Rotas
  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    
    // Se não tem usuário e não está na tela de login/registro -> Manda pro Login
    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login');
    } 
    // Se tem usuário e tenta acessar login/registro -> Manda pra Home
    else if (user && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [user, segments, isLoading]);

  // Tela de Loading enquanto fontes ou sessão carregam
  if (!loaded || isLoading) {
    return <View className="flex-1 bg-deep-900" />;
  }

  return (
    <>
      <StatusBar style="light" />
      {/* Configuração Global de Estilo do Container */}
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0F0F0F' } }}>
        
        {/* Grupo de Autenticação (Login/Register) */}
        <Stack.Screen name="(auth)" />
        
        {/* Navegação Principal (Abas) */}
        <Stack.Screen name="(tabs)" />
        
        {/* Telas Modais (Criação de Receita) */}
        <Stack.Screen 
          name="recipe/create" 
          options={{ 
            presentation: 'modal', // Faz a tela subir de baixo para cima
            headerShown: false,
          }} 
        />
        
        {/* Tela de Resultado (Pode ser standard ou modal, aqui deixamos padrão) */}
        <Stack.Screen name="recipe/result" />

      </Stack>
    </>
  );
}