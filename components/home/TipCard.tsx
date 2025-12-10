import { ChefTip } from '@/app/services/recipeService';
import * as Icons from '@/components/ui/icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';

interface Props {
  tip: ChefTip;
  index: number;
}

const AnimatedView = Animated.createAnimatedComponent(View);

export const TipCard = ({ tip, index }: Props) => {
  const IconComponent = (Icons as any)[tip.icon] || Icons.ChefHat;

  return (
    <AnimatedView
      entering={FadeInRight.delay(index * 200).springify()}
      className="w-72 h-36 ml-4 rounded-2xl overflow-hidden shadow-lg shadow-gold-900/20"
    >
      <Pressable 
        className="flex-1"
        onPress={() => Alert.alert("Dica do Chef", tip.content)} // Placeholder de ação
        android_ripple={{ color: 'rgba(255, 255, 255, 0.1)' }}
      >
        <LinearGradient
          colors={['#4a3f1c', '#0F0F0F']} 
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="flex-1 p-5 justify-between border border-gold-500/20 rounded-2xl"
        >
          <View className="flex-row justify-between items-start">
              <IconComponent color="#C5A028" size={28} className="opacity-90" />
              <Text className="text-gold-500/40 text-[10px] font-geist-bold uppercase tracking-[2px]">CHEF'S SECRET</Text>
          </View>
          
          <View>
              <Text className="text-gold-100 text-lg font-geist-bold mb-1">{tip.title}</Text>
              <Text numberOfLines={2} className="text-stone-300 text-xs leading-relaxed font-geist-regular">
              {tip.content}
              </Text>
          </View>
        </LinearGradient>
      </Pressable>
    </AnimatedView>
  );
};