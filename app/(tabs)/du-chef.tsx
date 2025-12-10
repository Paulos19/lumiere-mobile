import { ChevronRight, Flame, Sparkles, User, Users } from '@/components/ui/icons'; // Ajuste imports conforme seus ícones
import { useMutation } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router'; // CORREÇÃO 1: Router Imperativo
import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

// Imports de Lógica
import { DuChefPreferences, recipeService } from '@/app/services/recipeService';
import { useRecipeStore } from '@/stores/useRecipeStore';

export default function DuChefScreen() {
  // OBS: Removemos 'const router = useRouter()' para evitar o erro de contexto.

  // --- STORE ACTIONS ---
  const generateDuChefRecipe = useRecipeStore((state) => state.generateDuChefRecipe);

  // --- ESTADOS DO FORMULÁRIO ---
  const [step, setStep] = useState<1 | 2>(1); // Controle de Passo
  const [loadingCardIndex, setLoadingCardIndex] = useState<number | null>(null);

  const [mode, setMode] = useState<'individual' | 'group'>('individual');
  const [guests, setGuests] = useState('2');
  const [budget, setBudget] = useState<'cheap' | 'medium' | 'expensive'>('medium');
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [restrictions, setRestrictions] = useState<string[]>([]);
  
  // Opções
  const cuisines = ['Brasileira', 'Italiana', 'Francesa', 'Japonesa', 'Mediterrânea', 'Vegetariana'];
  const healthTags = ['Diabetes', 'Hipertensão', 'Sem Glúten', 'Sem Lactose', 'Low Carb', 'Vegano'];

  // --- REACT QUERY MUTATION (Consultar Chef - Passo 1) ---
  const mutation = useMutation({
    mutationFn: recipeService.askDuChef,
    onSuccess: (data) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setStep(2);
    },
    onError: (error) => {
      Alert.alert("Erro", "O Chef não conseguiu sugerir menus agora.");
    }
  });

  const handleSubmit = () => {
    const payload: DuChefPreferences = {
      mode,
      guests: mode === 'individual' ? 1 : parseInt(guests) || 2,
      budget,
      restrictions,
      cuisine: selectedCuisines.length > 0 ? selectedCuisines : ['Variada'], // Fallback seguro
    };
    mutation.mutate(payload);
  };

  // --- HANDLER DE SELEÇÃO (CORREÇÃO 2 e 3) ---
  const handleSelectRecipe = async (suggestion: any, index: number) => {
    if (loadingCardIndex !== null) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setLoadingCardIndex(index);

    // Reconstrói as preferências para o contexto da IA
    const contextPrefs = {
      mode, guests, budget, restrictions, cuisine: selectedCuisines
    };

    try {
      // 1. Gera/Carrega a receita completa na Store
      await generateDuChefRecipe(suggestion.title, contextPrefs);

      // 2. Navega sem passar params (a Store já tem os dados)
      // Delay pequeno para garantir estabilidade visual
      setTimeout(() => {
        router.push('/recipe/result');
        setLoadingCardIndex(null);
      }, 100);

    } catch (error) {
      Alert.alert("Erro", "Não foi possível preparar esta receita completa.");
      setLoadingCardIndex(null);
    }
  };

  // Toggle helper
  const toggleSelection = (list: string[], setList: any, item: string) => {
    if (list.includes(item)) setList(list.filter(i => i !== item));
    else setList([...list, item]);
  };

  const handleReset = () => {
      setStep(1);
      mutation.reset();
  };

  return (
    <SafeAreaView className="flex-1 bg-deep-900" edges={['top']}>
      <LinearGradient colors={['#1a160e', '#0F0F0F']} className="flex-1">
        <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
          
          {/* HEADER */}
          <View className="px-6 py-8">
            <View className="flex-row items-center mb-2">
              <Sparkles color="#C5A028" size={24} />
              <Text className="text-gold-500 font-bold text-sm tracking-[3px] ml-2 uppercase">Lumiere AI</Text>
            </View>
            <Text className="text-4xl text-white font-bold">Du Chef</Text>
            <Text className="text-stone-400 mt-2 leading-relaxed">
              Crie uma experiência gastronômica única baseada no seu contexto atual.
            </Text>
          </View>

          {/* --- PASSO 1: FORMULÁRIO --- */}
          {step === 1 && (
            <Animated.View entering={FadeInDown.springify()} className="px-6 space-y-8">
              
              {/* 1. MODO */}
              <View>
                <Text className="text-white font-bold mb-4 text-lg">Quem vai comer?</Text>
                <View className="flex-row gap-4">
                  <TouchableOpacity 
                    onPress={() => setMode('individual')}
                    className={`flex-1 p-4 rounded-2xl border ${mode === 'individual' ? 'bg-gold-500/20 border-gold-500' : 'bg-deep-800 border-white/5'} items-center`}
                  >
                    <User color={mode === 'individual' ? '#C5A028' : '#78716c'} />
                    <Text className={`mt-2 font-bold ${mode === 'individual' ? 'text-gold-500' : 'text-stone-500'}`}>Solo</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    onPress={() => setMode('group')}
                    className={`flex-1 p-4 rounded-2xl border ${mode === 'group' ? 'bg-gold-500/20 border-gold-500' : 'bg-deep-800 border-white/5'} items-center`}
                  >
                    <Users color={mode === 'group' ? '#C5A028' : '#78716c'} />
                    <Text className={`mt-2 font-bold ${mode === 'group' ? 'text-gold-500' : 'text-stone-500'}`}>Acompanhado</Text>
                  </TouchableOpacity>
                </View>

                {mode === 'group' && (
                  <Animated.View entering={FadeInDown} className="mt-4">
                    <Text className="text-stone-400 text-xs mb-2 uppercase">Quantas Pessoas?</Text>
                    <TextInput 
                      value={guests}
                      onChangeText={setGuests}
                      keyboardType="number-pad"
                      className="bg-deep-800 text-white p-4 rounded-xl border border-white/10 font-bold text-lg"
                    />
                  </Animated.View>
                )}
              </View>

              {/* 2. ORÇAMENTO */}
              <View>
                <Text className="text-white font-bold mb-4 text-lg">Orçamento Sugerido</Text>
                <View className="flex-row bg-deep-800 p-1 rounded-xl border border-white/5">
                  {(['cheap', 'medium', 'expensive'] as const).map((b) => (
                    <TouchableOpacity
                      key={b}
                      onPress={() => setBudget(b)}
                      className={`flex-1 py-3 rounded-lg items-center ${budget === b ? 'bg-gold-500' : 'transparent'}`}
                    >
                      <Text className={`font-bold ${budget === b ? 'text-deep-900' : 'text-stone-400'}`}>
                        {b === 'cheap' ? '$' : b === 'medium' ? '$$' : '$$$'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* 3. SAÚDE */}
              <View>
                <Text className="text-white font-bold mb-4 text-lg">Saúde & Restrições</Text>
                <View className="flex-row flex-wrap gap-2">
                  {healthTags.map((tag) => (
                    <TouchableOpacity
                      key={tag}
                      onPress={() => toggleSelection(restrictions, setRestrictions, tag)}
                      className={`px-4 py-2 rounded-full border ${restrictions.includes(tag) ? 'bg-red-500/20 border-red-500' : 'bg-deep-800 border-white/5'}`}
                    >
                      <Text className={restrictions.includes(tag) ? 'text-red-400' : 'text-stone-400'}>{tag}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* 4. COZINHA */}
              <View>
                <Text className="text-white font-bold mb-4 text-lg">Preferência Culinária</Text>
                <View className="flex-row flex-wrap gap-2">
                  {cuisines.map((c) => (
                    <TouchableOpacity
                      key={c}
                      onPress={() => toggleSelection(selectedCuisines, setSelectedCuisines, c)}
                      className={`px-4 py-2 rounded-full border ${selectedCuisines.includes(c) ? 'bg-gold-500/20 border-gold-500' : 'bg-deep-800 border-white/5'}`}
                    >
                      <Text className={selectedCuisines.includes(c) ? 'text-gold-500' : 'text-stone-400'}>{c}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* BOTÃO */}
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={mutation.isPending}
                className="w-full bg-gold-500 py-4 rounded-2xl flex-row justify-center items-center shadow-lg shadow-gold-500/20 mt-4"
              >
                {mutation.isPending ? (
                  <ActivityIndicator color="#0F0F0F" />
                ) : (
                  <>
                    <Sparkles color="#0F0F0F" size={20} />
                    <Text className="text-deep-900 font-bold ml-2 text-lg uppercase tracking-wider">
                      Consultar Chef
                    </Text>
                  </>
                )}
              </TouchableOpacity>

            </Animated.View>
          )}

          {/* --- PASSO 2: RESULTADO --- */}
          {step === 2 && mutation.data && (
            <Animated.View entering={FadeInRight} className="px-6 pb-20">
              <TouchableOpacity 
                onPress={handleReset}
                className="mb-6 flex-row items-center p-2 -ml-2"
              >
                <Text className="text-gold-500 text-sm font-bold">← Nova Consulta</Text>
              </TouchableOpacity>

              <Text className="text-white font-bold text-2xl mb-2">Sugestões do Chef</Text>
              <Text className="text-stone-400 italic mb-6">"Aqui estão 3 opções desenhadas para você."</Text>

              {mutation.data.map((recipe: any, index: number) => {
                  const isLoadingThis = loadingCardIndex === index;
                  const isBlocked = loadingCardIndex !== null && !isLoadingThis;

                  return (
                    <TouchableOpacity
                      key={index}
                      disabled={loadingCardIndex !== null}
                      onPress={() => handleSelectRecipe(recipe, index)}
                      className={`mb-6 bg-deep-800 rounded-3xl overflow-hidden border shadow-xl transition-all ${
                          isLoadingThis ? 'border-gold-500 scale-[1.02]' : 'border-white/10'
                      } ${isBlocked ? 'opacity-50' : 'opacity-100'}`}
                    >
                        {/* Placeholder Visual / Loading */}
                        <View className="h-40 w-full bg-stone-900 items-center justify-center relative">
                            {isLoadingThis ? (
                                <ActivityIndicator size="large" color="#C5A028" />
                            ) : (
                                <Flame color="#383434" size={40} />
                            )}
                            
                            {!isLoadingThis && (
                                <View className="absolute bottom-3 right-3 bg-black/60 px-3 py-1 rounded-full border border-white/10">
                                    <Text className="text-white text-[10px] uppercase font-bold">Toque para Preparar</Text>
                                </View>
                            )}
                        </View>
                        
                        <View className="p-5">
                            <View className="flex-row justify-between items-start mb-2">
                                <Text className={`text-xl font-bold flex-1 mr-2 leading-tight ${isLoadingThis ? 'text-gold-500' : 'text-white'}`}>
                                    {recipe.title}
                                </Text>
                                {recipe.difficulty && (
                                    <View className="bg-gold-500/10 border border-gold-500/20 px-2 py-1 rounded">
                                        <Text className="text-gold-500 text-[10px] font-bold uppercase">{recipe.difficulty}</Text>
                                    </View>
                                )}
                            </View>
                            
                            <Text className="text-stone-400 text-sm leading-relaxed mb-4">
                                {recipe.description}
                            </Text>
                            
                            <View className="flex-row items-center justify-end border-t border-white/5 pt-4">
                                <Text className={`text-sm font-bold mr-2 ${isLoadingThis ? 'text-gold-500' : 'text-stone-500'}`}>
                                    {isLoadingThis ? "Escrevendo Receita..." : "Ver Receita Completa"}
                                </Text>
                                <ChevronRight color={isLoadingThis ? "#C5A028" : "#78716c"} size={16} />
                            </View>
                        </View>
                    </TouchableOpacity>
                  );
              })}
            </Animated.View>
          )}

        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}