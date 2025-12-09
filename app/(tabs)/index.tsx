import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Componentes e Stores
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChefHat } from '@/components/ui/icons';
import { useAuthStore } from '@/stores/useAuthStore';

export default function AtelierScreen() {
  const { user } = useAuthStore();
  const router = useRouter(); // Hook de navegação
  
  // Pega o primeiro nome ou usa "Chef" como fallback
  const userName = user?.name?.split(' ')[0] || 'Chef';

  return (
    <View className="flex-1 bg-deep-900">
      <SafeAreaView className="flex-1" edges={['top']}>
        <ScrollView className="p-6 pb-24 gap-8">
          
          {/* --- HEADER --- */}
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-stone-400 font-serif italic text-sm">
                Bon appétit,
              </Text>
              <Text className="text-gold-500 font-display text-2xl">
                {userName}
              </Text>
            </View>
            <View className="bg-deep-800 p-2 rounded-full border border-white/5">
              <ChefHat className="text-gold-500 w-6 h-6" />
            </View>
          </View>

          {/* --- CALL TO ACTION (NOVO MENU) --- */}
          <Card className="border-gold-500/30 bg-deep-800/80 overflow-hidden relative">
            {/* Elemento decorativo de fundo */}
            <View className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
               <ChefHat size={120} color="#C5A028" />
            </View>

            <CardHeader>
              <CardTitle className="text-2xl">Novo Menu Exclusivo</CardTitle>
            </CardHeader>
            
            <CardContent>
              <Text className="text-stone-400 mb-6 font-serif">
                O Chef está pronto. Conte-me seus objetivos e o que temos na despensa hoje.
              </Text>
              
              {/* Botão que abre o Modal de Criação */}
              <Button 
                label="Iniciar Consultoria" 
                onPress={() => router.push('/recipe/create')} 
              />
            </CardContent>
          </Card>

          {/* --- STATUS RÁPIDO (DASHBOARD) --- */}
          <View className="flex-row gap-4">
            <Card className="flex-1 bg-deep-800/40">
              <CardContent className="p-4 items-center justify-center py-6">
                <Text className="text-3xl font-display text-white">0</Text>
                <Text className="text-xs text-stone-500 uppercase tracking-widest mt-1">Receitas</Text>
              </CardContent>
            </Card>
            <Card className="flex-1 bg-deep-800/40">
               <CardContent className="p-4 items-center justify-center py-6">
                <Text className="text-3xl font-display text-white">Free</Text>
                <Text className="text-xs text-stone-500 uppercase tracking-widest mt-1">Plano</Text>
              </CardContent>
            </Card>
          </View>

          {/* --- HISTÓRICO RECENTE --- */}
          <View>
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-gold-400 font-bold uppercase tracking-widest text-sm">Últimas Criações</Text>
              <Button variant="link" label="Ver todas" textClass="text-xs normal-case" />
            </View>
            
            {/* Placeholder de Lista Vazia */}
            <Card className="bg-deep-800/30 border-dashed border-stone-800 h-32 items-center justify-center">
              <Text className="text-stone-600 font-serif italic">Nenhuma receita criada ainda</Text>
            </Card>
          </View>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}