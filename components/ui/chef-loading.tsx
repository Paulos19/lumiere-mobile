import { ChefHat } from '@/components/ui/icons';
import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming
} from 'react-native-reanimated';

const TIPS = [
  "Selecionando os melhores ingredientes...",
  "Calculando os macros perfeitos...",
  "Ajustando o tempero...",
  "Empratando com precisão Michelin...",
  "Harmonizando sabores..."
];

export function ChefLoading() {
  // Animação de Escala (Pulso)
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.5);
  
  // Estado para rotacionar as frases
  const [tipIndex, setTipIndex] = React.useState(0);

  useEffect(() => {
    // Inicia o pulso eterno
    scale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1, // Infinito
      true // Reverse
    );

    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000 }),
        withTiming(0.5, { duration: 1000 })
      ),
      -1,
      true
    );

    // Troca a frase a cada 3 segundos
    const interval = setInterval(() => {
      setTipIndex((current) => (current + 1) % TIPS.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View className="flex-1 bg-deep-900 items-center justify-center p-8">
      
      {/* Círculo de Luz Pulsante */}
      <Animated.View style={animatedStyle} className="mb-8">
        <View className="w-32 h-32 rounded-full bg-gold-500/10 items-center justify-center border border-gold-500/30 shadow-lg shadow-gold-500/20">
          <ChefHat size={64} className="text-gold-500" />
        </View>
      </Animated.View>

      <Text className="text-2xl font-display text-gold-500 mb-2 tracking-widest text-center">
        LE CHEF
      </Text>
      
      <Text className="text-stone-400 font-serif italic text-lg text-center h-8">
        {TIPS[tipIndex]}
      </Text>

      <View className="absolute bottom-12">
        <Text className="text-stone-600 text-xs uppercase tracking-[0.2em]">
          Lumière AI Cuisine
        </Text>
      </View>
    </View>
  );
}