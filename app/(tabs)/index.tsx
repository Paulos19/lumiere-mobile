import { ChefHat, Sparkles } from '@/components/ui/icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router'; // Importante para navegação
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Serviços e Tipos (Criados na etapa anterior)
import {
  ChefTip,
  fetchChefTipsMock,
  fetchCommunityRecipesMock,
  fetchMyRecipes,
  RecipeSummary
} from '@/app/services/recipeService';

import { useAuthStore } from '@/stores/useAuthStore';

// Componentes da Home (Criados na etapa anterior)
import { RecipeCard } from '@/components/home/RecipeCard';
import { TipCard } from '@/components/home/TipCard';

export default function HomeScreen() {
  const { user } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = React.useState(false);

  // --- REACT QUERY HOOKS (Busca de dados em paralelo) ---
  
  // 1. Minhas Receitas (Real do Backend)
  const myRecipesQuery = useQuery<RecipeSummary[]>({
    queryKey: ['myRecipes', user?.id], // Cache chaveado pelo ID do usuário
    queryFn: fetchMyRecipes,
    enabled: !!user?.id, // Só busca se tiver usuário logado
  });

  // 2. Receitas da Comunidade (Mock)
  const communityQuery = useQuery<RecipeSummary[]>({
    queryKey: ['communityRecipes'],
    queryFn: fetchCommunityRecipesMock,
    staleTime: 1000 * 60 * 10, // Cache de 10 minutos
  });

  // 3. Dicas do Chef (Mock)
  const tipsQuery = useQuery<ChefTip[]>({
    queryKey: ['chefTips'],
    queryFn: fetchChefTipsMock,
    staleTime: 1000 * 60 * 60, // Cache de 1 hora
  });

  // Estado de carregamento inicial (somente na primeira carga)
  const isLoadingAll = (myRecipesQuery.isLoading || communityQuery.isLoading || tipsQuery.isLoading) && !refreshing;
  
  // Função de Pull-to-Refresh
  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    // Recarrega todas as queries em paralelo
    await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['myRecipes'] }),
        queryClient.invalidateQueries({ queryKey: ['communityRecipes'] }),
        queryClient.invalidateQueries({ queryKey: ['chefTips'] }),
    ]);
    setRefreshing(false);
  }, [queryClient]);

  // --- LOADING SCREEN ---
  if (isLoadingAll) {
    return (
      <View className="flex-1 bg-deep-900 justify-center items-center relative">
         <LinearGradient colors={['#0F0F0F', '#1a160e']} className="absolute inset-0" />
         <ActivityIndicator size="large" color="#C5A028" />
         <Text className="text-gold-500 mt-4 font-geist-regular tracking-widest animate-pulse">
             PREPARANDO O ATELIER...
         </Text>
      </View>
    );
  }

  const firstName = user?.name?.split(' ')[0] || 'Chef';

  return (
    <SafeAreaView className="flex-1 bg-deep-900" edges={['top']}>
      <StatusBar style="light" />
      
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }} // Espaço extra no final
        refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh} 
              tintColor="#C5A028" // Cor do spinner nativo
              colors={["#C5A028"]} // Android
              progressBackgroundColor="#1c1917" // Android
            />
        }
      >
        
        {/* === HEADER / BANNER PRINCIPAL === */}
        <View className="h-72 relative mb-8 overflow-hidden">
           {/* Imagem de fundo do banner */}
           <Image
              source={{ uri: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=1974&auto=format&fit=crop" }}
              className="absolute w-full h-full opacity-60"
              contentFit="cover"
              transition={1000}
            />
             {/* Gradiente dramático por cima */}
             <LinearGradient
                colors={['rgba(15, 15, 15, 0.1)', '#0F0F0F']}
                className="absolute w-full h-full"
              />

          <View className="flex-1 p-6 justify-end pb-10">
             <View className="flex-row items-center mb-2 opacity-80">
                 <Sparkles color="#C5A028" size={18} />
                 <Text className="text-gold-400 uppercase tracking-[3px] ml-2 font-geist-bold text-xs">Bem-vindo ao Atelier</Text>
             </View>
            <Text className="text-4xl text-white font-geist-bold">
              Olá, <Text className="text-gold-500">{firstName}</Text>.
            </Text>
             <Text className="text-stone-300 text-lg font-geist-regular mt-2">
              O que vamos criar hoje?
            </Text>
            
             {/* Botão de Ação Rápida no Banner - NAVEGAÇÃO ADICIONADA */}
             <TouchableOpacity 
                className="mt-6 bg-gold-500 px-6 py-3 rounded-full self-start flex-row items-center shadow-lg shadow-gold-500/20 active:scale-95 transition-transform"
                activeOpacity={0.9}
                onPress={() => router.push('/recipe/create')}
             >
                <ChefHat color="#0F0F0F" size={20} />
                <Text className="text-deep-900 font-geist-bold ml-2">Nova Criação IA</Text>
             </TouchableOpacity>
          </View>
        </View>


        {/* === SEÇÃO 1: DICAS DO CHEF (Carrossel Horizontal) === */}
        {tipsQuery.data && tipsQuery.data.length > 0 && (
            <View className="mb-10">
              <SectionHeader title="Segredos do Chef" subtitle="Técnicas para elevar seu nível" />
              
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingRight: 20 }}
                className="mt-4"
              >
                 {tipsQuery.data.map((tip, index) => (
                   <TipCard key={tip.id} tip={tip} index={index} />
                 ))}
              </ScrollView>
            </View>
        )}


        {/* === SEÇÃO 2: MINHAS CRIAÇÕES RECENTES === */}
        <View className="mb-8">
          <SectionHeader 
            title="Suas Criações" 
            subtitle="Recentes do seu portfólio" 
            actionLabel={myRecipesQuery.data && myRecipesQuery.data.length > 0 ? "Ver todas" : undefined}
            onAction={() => router.push('/(tabs)/recipes')} // Navega para a aba de receitas
          />
          
          {myRecipesQuery.isError && (
             <Text className="text-red-500 mx-6 font-geist-regular">
               Não foi possível carregar suas receitas.
             </Text>
          )}

          {/* Empty State */}
          {myRecipesQuery.data && myRecipesQuery.data.length === 0 && (
              <TouchableOpacity 
                activeOpacity={0.8}
                onPress={() => router.push('/recipe/create')}
                className="mx-4 p-8 bg-deep-800/50 rounded-3xl border border-dashed border-stone-700 items-center"
              >
                  <ChefHat size={40} color="#78716c" className="mb-4 opacity-50"/>
                  <Text className="text-stone-400 font-geist-regular text-center">
                    Você ainda não tem receitas.{'\n'}Comece sua primeira criação com IA!
                  </Text>
              </TouchableOpacity>
          )}

          {/* Lista de Receitas (Mostra apenas as 3 primeiras na Home) */}
          {myRecipesQuery.data?.slice(0, 3).map((recipe, index) => (
             <RecipeCard key={recipe.id} recipe={recipe} index={index} />
          ))}
        </View>


        {/* === SEÇÃO 3: INSPIRAÇÃO DA COMUNIDADE === */}
        <View className="mb-8">
             <SectionHeader title="Inspiração da Comunidade" subtitle="O que outros chefs estão cozinhando" />
            
            {communityQuery.data?.map((recipe, index) => (
                // Offset no index para animação fluida (começa depois das minhas receitas)
                <RecipeCard key={recipe.id} recipe={recipe} index={index + 3} />
            ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// --- Componente Helper para Cabeçalhos ---
const SectionHeader = ({ title, subtitle, actionLabel, onAction }: any) => (
  <View className="mx-6 mb-4 flex-row justify-between items-end">
    <View>
      <Text className="text-white text-xl font-geist-bold tracking-tight">{title}</Text>
      {subtitle && <Text className="text-stone-400 text-xs font-geist-regular mt-1">{subtitle}</Text>}
    </View>
    {actionLabel && onAction && (
      <TouchableOpacity onPress={onAction} hitSlop={10}>
        <Text className="text-gold-500 text-sm font-geist-regular">{actionLabel} →</Text>
      </TouchableOpacity>
    )}
  </View>
);