import { ArrowRight, ChefHat, Clock } from '@/components/ui/icons';
import { Recipe, useRecipeStore } from '@/stores/useRecipeStore';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router'; // useFocusEffect para recarregar ao voltar
import React, { useCallback } from 'react';
import { FlatList, Image, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MyRecipesScreen() {
  const router = useRouter();
  const { savedRecipes, fetchMyRecipes, isLoadingList, setCurrentRecipe } = useRecipeStore();

  // Recarrega a lista sempre que a tela ganha foco
  useFocusEffect(
    useCallback(() => {
      fetchMyRecipes();
    }, [])
  );

  const handleOpenRecipe = (recipe: Recipe) => {
    setCurrentRecipe(recipe);
    router.push('/recipe/result'); // Reutilizamos a tela de resultado!
  };

  const renderItem = ({ item }: { item: Recipe }) => (
    <TouchableOpacity 
      activeOpacity={0.9}
      onPress={() => handleOpenRecipe(item)}
      className="mb-6 bg-deep-800 rounded-2xl overflow-hidden border border-white/5 shadow-md"
    >
      <View className="h-48 w-full relative">
        {item.imageUrl ? (
          <Image 
            source={{ uri: item.imageUrl }} 
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-full items-center justify-center bg-deep-800">
            <ChefHat size={40} className="text-stone-600" />
          </View>
        )}
        
        {/* Gradiente para texto */}
        <LinearGradient
          colors={['transparent', 'rgba(15,15,15,0.9)']}
          className="absolute bottom-0 w-full h-24 justify-end p-4"
        >
          <View className="flex-row items-center justify-between">
             <View className="flex-1 mr-4">
                <Text className="text-xs text-gold-500 font-bold uppercase tracking-widest mb-1">
                  {item.category || 'Gourmet'}
                </Text>
                <Text className="text-white font-display text-xl leading-tight" numberOfLines={1}>
                  {item.title}
                </Text>
             </View>
          </View>
        </LinearGradient>
      </View>

      <View className="p-4 flex-row justify-between items-center bg-deep-800">
         <View className="flex-row items-center gap-4">
            <View className="flex-row items-center gap-1.5">
               <Clock size={14} className="text-stone-500" />
               <Text className="text-stone-400 text-xs font-medium">{item.prepTime || '30m'}</Text>
            </View>
            <View className="h-3 w-[1px] bg-white/10" />
            <Text className="text-stone-400 text-xs font-medium">
               {item.difficulty || 'Média'}
            </Text>
         </View>

         <View className="w-8 h-8 rounded-full bg-white/5 items-center justify-center">
            <ArrowRight size={14} className="text-gold-500" />
         </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-deep-900">
      <SafeAreaView className="flex-1" edges={['top']}>
        <View className="px-6 py-4 border-b border-white/5 mb-2">
          <Text className="text-gold-500 font-display text-3xl">Menu</Text>
          <Text className="text-stone-400 font-serif italic text-sm">Suas coleções culinárias</Text>
        </View>

        {savedRecipes.length === 0 && !isLoadingList ? (
          <View className="flex-1 items-center justify-center p-8 opacity-50">
            <ChefHat size={60} className="text-stone-600 mb-4" />
            <Text className="text-stone-500 text-center font-serif text-lg">
              Seu livro de receitas está vazio.
            </Text>
            <Text className="text-stone-600 text-center text-sm mt-2">
              Vá ao Atelier para criar sua primeira obra.
            </Text>
          </View>
        ) : (
          <FlatList
            data={savedRecipes}
            keyExtractor={(item) => item.id || item.title}
            renderItem={renderItem}
            contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl 
                refreshing={isLoadingList} 
                onRefresh={fetchMyRecipes} 
                tintColor="#D4AF37" 
                colors={['#D4AF37']} 
              />
            }
          />
        )}
      </SafeAreaView>
    </View>
  );
}