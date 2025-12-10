import { Clock, Gauge } from '@/components/ui/icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { RecipeSummary } from '@/app/services/recipeService';

interface Props {
  recipe: RecipeSummary;
  index: number;
}

const AnimatedView = Animated.createAnimatedComponent(View);

export const RecipeCard = ({ recipe, index }: Props) => {
  const router = useRouter();
  const blurhash = 'L6PZfSi_.AyE_3t7t7R**0o#DgR4';

  const handlePress = () => {
    // A MÁGICA ACONTECE AQUI:
    // Serializamos o objeto receita inteiro para passar para a próxima tela.
    // Isso evita ter que fazer um novo fetch só para ver os detalhes.
    router.push({
      pathname: '/recipe/result', 
      params: { 
        recipeData: JSON.stringify(recipe) 
      }
    });
  };

  return (
    <AnimatedView
      entering={FadeInDown.delay(index * 150).springify().damping(12)}
      className="mb-6 mx-4 h-64 overflow-hidden rounded-3xl shadow-xl shadow-black/50 bg-deep-800"
    >
      <Pressable 
        className="flex-1" 
        onPress={handlePress}
        android_ripple={{ color: 'rgba(197, 160, 40, 0.2)' }}
      >
        <Image
          source={recipe.imageUrl ? { uri: recipe.imageUrl } : { uri: 'https://placehold.co/600x400/141E1B/D4AF37?text=Sem+Imagem' }}
          placeholder={blurhash}
          contentFit="cover"
          transition={500}
          className="w-full h-full absolute"
        />

        <LinearGradient
          colors={['transparent', 'rgba(15, 15, 15, 0.9)', '#0F0F0F']}
          locations={[0, 0.5, 1]}
          className="w-full h-full absolute"
        />

        <View className="flex-1 p-5 justify-end">
          <View className="flex-row gap-3 mb-3">
            {recipe.difficulty && (
              <View className="flex-row items-center bg-gold-500/20 px-3 py-1 rounded-full border border-gold-500/30 backdrop-blur-md">
                <Gauge size={14} color="#C5A028" />
                <Text className="text-gold-300 text-xs font-geist-bold ml-1 uppercase tracking-wider">
                  {recipe.difficulty}
                </Text>
              </View>
            )}
            {recipe.prepTime && (
              <View className="flex-row items-center bg-stone-900/60 px-3 py-1 rounded-full backdrop-blur-md">
                <Clock size={14} color="#a8a29e" />
                <Text className="text-stone-300 text-xs font-geist-regular ml-1">
                  {recipe.prepTime}
                </Text>
              </View>
            )}
          </View>

          <Text className="text-white text-2xl font-geist-bold leading-tight mb-1 shadow-sm">
            {recipe.title}
          </Text>
          
          {recipe.description && (
            <Text numberOfLines={2} className="text-stone-300 text-sm font-geist-regular leading-snug opacity-90">
              {recipe.description}
            </Text>
          )}
        </View>
      </Pressable>
    </AnimatedView>
  );
};