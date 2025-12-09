import { cn } from '@/lib/utils';
import { ResizeMode, Video } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  ArrowLeft, Bookmark, Check,
  ChefHat, Clock,
  Film,
  Flame,
  Loader2,
  Quote,
  Users
} from '@/components/ui/icons';
import { useRecipeStore } from '@/stores/useRecipeStore';

export default function RecipeResultScreen() {
  const router = useRouter();
  
  const { 
    currentRecipe: recipe, 
    toggleSaveCurrentRecipe, 
    savedRecipes,
    generateStepVideo,
    generatingStepIndex
  } = useRecipeStore();
  
  const [activeTab, setActiveTab] = useState<'details' | 'prep'>('details');
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [videoError, setVideoError] = useState<Record<number, boolean>>({}); // Estado para erros de vídeo

  useEffect(() => {
    if (recipe && savedRecipes.length > 0) {
      const exists = savedRecipes.some(r => r.title === recipe.title);
      setIsSaved(exists);
    }
  }, [recipe, savedRecipes]);

  const handleToggleSave = async () => {
    try { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch(e) {}
    const newState = !isSaved;
    setIsSaved(newState);
    const success = await toggleSaveCurrentRecipe();
    if (!success && newState) {
       setIsSaved(false);
       Alert.alert("Erro", "Não foi possível salvar a receita.");
    }
  };

  const handleGenerateVideo = async (index: number, stepText: string) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      // Limpa erro anterior se houver
      setVideoError(prev => ({...prev, [index]: false}));
      await generateStepVideo(index, stepText);
    } catch (error) {
      Alert.alert("Erro", "O Chef não conseguiu filmar este passo agora. Tente novamente.");
    }
  };

  // --- FUNÇÃO AUXILIAR PARA MARKDOWN ---
  // Transforma "**Texto**" em texto negrito dourado sem os asteriscos
  const renderStepText = (text: string) => {
    // Regex para separar o que está entre ** **
    const parts = text.split(/(\*\*.*?\*\*)/g);

    return (
      <Text className="text-stone-300 leading-7 flex-1 text-base">
        {parts.map((part, index) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            // Remove os asteriscos (primeiros 2 e últimos 2 caracteres)
            const cleanText = part.slice(2, -2);
            return (
              <Text key={index} className="font-bold text-gold-400">
                {cleanText}
              </Text>
            );
          }
          // Retorna texto normal
          return <Text key={index}>{part}</Text>;
        })}
      </Text>
    );
  };
  // ------------------------------------

  if (!recipe) return null;

  return (
    <View className="flex-1 bg-deep-900">
      <StatusBar barStyle="light-content" />
      
      <ScrollView className="pb-32" showsVerticalScrollIndicator={false}>
        
        {/* --- 1. HERO IMAGE (Limpa, sem texto sobreposto) --- */}
        <View className="relative w-full h-[450px]">
           {/* Imagem */}
           {recipe.imageUrl ? (
             <Image 
               source={{ uri: recipe.imageUrl }} 
               className="w-full h-full"
               resizeMode="cover"
               onLoadEnd={() => setImageLoaded(true)}
             />
           ) : (
             <View className="w-full h-full bg-deep-800 items-center justify-center">
               <ChefHat size={60} className="text-stone-600" />
             </View>
           )}

           {/* Header Flutuante (Botões) */}
           <SafeAreaView className="absolute top-0 w-full z-50 flex-row justify-between items-center px-6 pt-2">
              <TouchableOpacity 
                onPress={() => router.back()}
                className="w-10 h-10 rounded-full bg-deep-900/50 backdrop-blur-md items-center justify-center border border-white/10 active:bg-deep-800"
              >
                <ArrowLeft size={20} className="text-white" />
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={handleToggleSave}
                className={cn(
                  "flex-row items-center px-4 py-2 rounded-full backdrop-blur-md border transition-all gap-2",
                  isSaved 
                    ? "bg-gold-500 border-gold-500" 
                    : "bg-deep-900/50 border-gold-500/50"
                )}
              >
                {isSaved ? (
                  <>
                    <Check size={14} className="text-deep-900" strokeWidth={3} />
                    <Text className="text-deep-900 text-[10px] font-bold uppercase tracking-widest">Salvo</Text>
                  </>
                ) : (
                  <>
                    <Bookmark size={14} className="text-gold-400" />
                    <Text className="text-gold-400 text-[10px] font-bold uppercase tracking-widest">Salvar</Text>
                  </>
                )}
              </TouchableOpacity>
           </SafeAreaView>

           {/* Gradiente Sutil na Base */}
           <LinearGradient
              colors={['transparent', '#0F0F0F']}
              style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 100 }}
           />
        </View>

        {/* --- 2. TÍTULO E CONTEÚDO PRINCIPAL (Abaixo da Imagem) --- */}
        <View className="px-6 pt-6 bg-deep-900 rounded-t-3xl -mt-6 relative z-10">
          
          {/* Badges de Categoria */}
          <View className="flex-row gap-2 mb-4">
              <View className="px-3 py-1 bg-gold-500/10 border border-gold-500/30 rounded-full">
                <Text className="text-gold-500 text-[10px] font-bold uppercase tracking-widest">
                    {recipe.category || 'Gourmet'}
                </Text>
              </View>
              <View className="px-3 py-1 bg-deep-800 border border-white/10 rounded-full">
                <Text className="text-stone-400 text-[10px] font-bold uppercase tracking-widest">
                    {recipe.difficulty || 'Média'}
                </Text>
              </View>
          </View>

          {/* Título em Dourado */}
          <Text className="text-4xl font-display text-gold-500 leading-tight mb-4">
            {recipe.title}
          </Text>

          <Text className="text-stone-400 font-serif italic text-lg leading-relaxed mb-8">
            {recipe.description}
          </Text>

          {/* Stats Bar */}
          <View className="flex-row justify-between bg-deep-800/50 border border-white/5 rounded-xl p-5 mb-10">
             <View className="items-center gap-1">
                <Clock size={18} className="text-gold-500" />
                <Text className="text-stone-500 text-[9px] uppercase tracking-widest">Tempo</Text>
                <Text className="text-white font-bold">{recipe.prepTime}</Text>
             </View>
             <View className="w-[1px] bg-white/10 h-full" />
             <View className="items-center gap-1">
                <Users size={18} className="text-gold-500" />
                <Text className="text-stone-500 text-[9px] uppercase tracking-widest">Porções</Text>
                <Text className="text-white font-bold">{recipe.portions || '1'}</Text>
             </View>
             <View className="w-[1px] bg-white/10 h-full" />
             <View className="items-center gap-1">
                <Flame size={18} className="text-gold-500" />
                <Text className="text-stone-500 text-[9px] uppercase tracking-widest">Calorias</Text>
                <Text className="text-white font-bold">{recipe.macros?.calories || '-'}</Text>
             </View>
          </View>

          {/* --- 3. NAVEGAÇÃO DE ABAS --- */}
          <View className="flex-row border-b border-white/10 mb-8">
            <TouchableOpacity 
              onPress={() => setActiveTab('details')}
              className={cn("mr-6 pb-3", activeTab === 'details' ? "border-b-2 border-gold-500" : "")}
            >
              <Text className={cn(
                "uppercase tracking-widest text-xs font-bold",
                activeTab === 'details' ? "text-gold-400" : "text-stone-600"
              )}>Ingredientes</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => setActiveTab('prep')}
              className={cn("pb-3", activeTab === 'prep' ? "border-b-2 border-gold-500" : "")}
            >
              <Text className={cn(
                "uppercase tracking-widest text-xs font-bold",
                activeTab === 'prep' ? "text-gold-400" : "text-stone-600"
              )}>Modo de Preparo</Text>
            </TouchableOpacity>
          </View>

          {/* --- 4. CONTEÚDO DAS ABAS --- */}
          <View className="min-h-[200px]">
            {activeTab === 'details' ? (
              // ABA INGREDIENTES
              <View className="gap-4">
                 {recipe.ingredients?.map((ing, i) => (
                   <View key={i} className="flex-row items-center gap-4 py-2 border-b border-white/5">
                      <View className="w-1.5 h-1.5 rounded-full bg-gold-500" />
                      <Text className="text-stone-300 font-light flex-1">{ing}</Text>
                   </View>
                 ))}

                 {recipe.platingTips && (
                    <View className="mt-8 mb-6 bg-gradient-to-br from-deep-800 to-deep-900 border-l-4 border-gold-500 rounded-r-lg p-6 relative overflow-hidden shadow-lg shadow-black/30">
                        <Quote size={120} className="text-gold-500 absolute -top-4 -right-4 opacity-5 rotate-12" />
                        <View className="flex-row items-center gap-2 mb-4">
                            <ChefHat size={18} className="text-gold-500" />
                            <Text className="text-gold-400 text-[10px] font-bold uppercase tracking-[0.2em]">Toque do Chef</Text>
                        </View>
                        <Text className="font-serif italic text-xl text-stone-200 leading-relaxed z-10">"{recipe.platingTips}"</Text>
                    </View>
                 )}
              </View>
            ) : (
              // ABA PREPARO (COM VÍDEO FIX)
              <View className="gap-12">
                 {recipe.instructions?.map((step, i) => {
                   const hasVideoUrl = recipe.stepVideos && recipe.stepVideos[i];
                   const isGeneratingThis = generatingStepIndex === i;
                   const hasError = videoError[i];

                   return (
                     <View key={i} className="relative">
                        {/* Texto do Passo com Markdown Parser */}
                        <View className="flex-row items-start gap-4 mb-4">
                            <View className="w-8 h-8 rounded-full bg-deep-800 border border-gold-500/20 items-center justify-center shrink-0 mt-1">
                                <Text className="text-gold-500 font-display text-lg">{i + 1}</Text>
                            </View>
                            {/* Usa a função auxiliar aqui */}
                            {renderStepText(step)}
                        </View>

                        {/* AÇÃO: Gerar Vídeo */}
                        {!hasVideoUrl && !hasError && (
                          <View className="pl-12">
                             <TouchableOpacity
                                onPress={() => handleGenerateVideo(i, step)}
                                disabled={isGeneratingThis || generatingStepIndex !== null}
                                className={cn(
                                  "flex-row items-center self-start gap-2 px-4 py-2 rounded-lg border transition-all",
                                  isGeneratingThis 
                                    ? "bg-gold-500/10 border-gold-500/30" 
                                    : "bg-deep-800 border-white/10 active:bg-gold-500/5"
                                )}
                             >
                                {isGeneratingThis ? (
                                  <Loader2 size={14} className="text-gold-500 animate-spin" />
                                ) : (
                                  <Film size={14} className={generatingStepIndex !== null ? "text-stone-500" : "text-gold-500"} />
                                )}
                                <Text className={cn(
                                  "text-[10px] uppercase tracking-widest font-bold",
                                  isGeneratingThis ? "text-gold-500" : "text-stone-300"
                                )}>
                                  {isGeneratingThis ? "Gerando Cena..." : "Visualizar Cena"}
                                </Text>
                             </TouchableOpacity>
                          </View>
                        )}

                        {/* Feedback de Erro */}
                        {hasError && (
                           <View className="pl-12 mt-2">
                             <Text className="text-red-500 text-xs">Falha ao carregar vídeo.</Text>
                           </View>
                        )}

                        {/* PLAYER DE VÍDEO (FIX) */}
                        {hasVideoUrl && !hasError && (
                          <View className="ml-12 mt-4 rounded-xl overflow-hidden border border-white/10 bg-black aspect-video relative group shadow-lg">
                             <Video
                                source={{ uri: hasVideoUrl }}
                                style={{ width: '100%', height: '100%', backgroundColor: '#000' }}
                                useNativeControls
                                resizeMode={ResizeMode.CONTAIN} // Mudado para CONTAIN para garantir que apareça
                                isLooping
                                shouldPlay={true} // Tenta dar autoplay
                                onError={(e) => {
                                   console.log("Video Error:", e);
                                   setVideoError(prev => ({...prev, [i]: true}));
                                }}
                             />
                             <View className="absolute top-3 right-3 px-2 py-1 bg-black/60 rounded-md border border-white/10 pointer-events-none">
                                <Text className="text-[8px] text-gold-500 uppercase tracking-widest font-bold">AI Cinema</Text>
                             </View>
                          </View>
                        )}
                     </View>
                   );
                 })}
              </View>
            )}
          </View>

        </View>
      </ScrollView>
    </View>
  );
}