import { ArrowLeft, ChefHat, Clock, Gauge } from '@/components/ui/icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams(); // Pega o ID da URL
  const router = useRouter();

  // TODO: Aqui você usaria o useQuery(['recipe', id], fetchRecipeById) para pegar os dados reais
  // Por enquanto, vamos simular visualmente
  const blurhash = 'L6PZfSi_.AyE_3t7t7R**0o#DgR4';

  return (
    <View className="flex-1 bg-deep-900">
      <Stack.Screen options={{ headerShown: false }} />
      
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
        {/* HEADER COM IMAGEM */}
        <View className="h-[450px] relative">
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1595295333158-4742f28fbd85?q=80&w=800&auto=format&fit=crop' }} // Placeholder
            placeholder={blurhash}
            className="w-full h-full absolute"
            contentFit="cover"
          />
          <LinearGradient
            colors={['rgba(0,0,0,0.3)', 'transparent', '#0F0F0F']}
            className="absolute inset-0"
          />
          
          {/* Botão Voltar */}
          <SafeAreaView className="absolute top-4 left-4">
            <TouchableOpacity 
                onPress={() => router.back()}
                className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full items-center justify-center border border-white/10"
            >
                <ArrowLeft color="white" size={20} />
            </TouchableOpacity>
          </SafeAreaView>

          {/* Título Sobreposto */}
          <View className="absolute bottom-0 p-6 w-full">
             <View className="flex-row gap-2 mb-4">
                <View className="bg-gold-500 px-3 py-1 rounded-md">
                    <Text className="text-deep-900 font-bold text-xs uppercase">Prato Principal</Text>
                </View>
             </View>
             <Text className="text-4xl text-white font-geist-bold leading-tight shadow-xl">
                Risoto de Açafrão com Vieiras
             </Text>
          </View>
        </View>

        {/* CONTEÚDO */}
        <View className="px-6 mt-6">
            {/* Metadados */}
            <View className="flex-row justify-between mb-8 p-4 bg-deep-800 rounded-2xl border border-white/5">
                <View className="items-center">
                    <Clock color="#C5A028" size={20} className="mb-2"/>
                    <Text className="text-stone-400 text-xs uppercase">Tempo</Text>
                    <Text className="text-white font-bold">45 min</Text>
                </View>
                <View className="w-[1px] bg-white/10 h-full" />
                <View className="items-center">
                    <Gauge color="#C5A028" size={20} className="mb-2"/>
                    <Text className="text-stone-400 text-xs uppercase">Nível</Text>
                    <Text className="text-white font-bold">Médio</Text>
                </View>
                <View className="w-[1px] bg-white/10 h-full" />
                <View className="items-center">
                    <ChefHat color="#C5A028" size={20} className="mb-2"/>
                    <Text className="text-stone-400 text-xs uppercase">Porções</Text>
                    <Text className="text-white font-bold">2 Pessoas</Text>
                </View>
            </View>

            <Text className="text-white text-xl font-geist-bold mb-4">Ingredientes</Text>
            <Text className="text-stone-300 font-geist-regular leading-7 mb-8">
                • 300g de arroz arbóreo{'\n'}
                • 1g de açafrão em pistilo{'\n'}
                • 500ml de caldo de legumes{'\n'}
                • 100ml de vinho branco seco
            </Text>

            <Text className="text-white text-xl font-geist-bold mb-4">Modo de Preparo</Text>
            <Text className="text-stone-300 font-geist-regular leading-7">
                1. Em uma panela, aqueça o caldo de legumes.{'\n'}
                2. Em outra panela, refogue a cebola na manteiga.{'\n'}
                3. Adicione o arroz e o vinho branco.
            </Text>
        </View>
      </ScrollView>
    </View>
  );
}