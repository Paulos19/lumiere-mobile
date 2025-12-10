import { ChevronRight, Flame, Sparkles, User, Users } from '@/components/ui/icons';
import { useMutation } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

// Import dos Serviços (Certifique-se de ter atualizado o services/recipeService.ts)
import { askDuChef, DuChefPreferences, generateFullDuChefRecipe } from '@/app/services/recipeService';

export default function DuChefScreen() {
  const router = useRouter();

  // --- ESTADOS DO FORMULÁRIO ---
  const [mode, setMode] = useState<'individual' | 'group'>('individual');
  const [guests, setGuests] = useState('2');
  const [budget, setBudget] = useState<'cheap' | 'medium' | 'expensive'>('medium');
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [restrictions, setRestrictions] = useState<string[]>([]);
  
  // Estado para controlar qual card está carregando a receita completa (Passo 2)
  const [generatingTitle, setGeneratingTitle] = useState<string | null>(null);

  // Dados para UI
  const cuisines = ['Brasileira', 'Italiana', 'Francesa', 'Japonesa', 'Mediterrânea', 'Vegetariana', 'Indiana', 'Tailandesa'];
  const healthTags = ['Diabetes', 'Hipertensão', 'Sem Glúten', 'Sem Lactose', 'Low Carb', 'Vegano', 'Keto'];

  // --- MUTATION 1: CONSULTA (Gera a Lista de Ideias) ---
  const consultMutation = useMutation({
    mutationFn: askDuChef,
    onError: (error) => {
      Alert.alert("Erro no Chef", "Não foi possível consultar as sugestões. Tente novamente.");
    }
  });

  // Handler do Botão "Consultar Chef"
  const handleConsult = () => {
    // Validação básica
    if (mode === 'group' && !guests) {
      Alert.alert("Atenção", "Informe o número de pessoas.");
      return;
    }

    const payload: DuChefPreferences = {
      mode,
      guests: mode === 'individual' ? 1 : parseInt(guests),
      budget,
      restrictions,
      cuisine: selectedCuisines,
      goal: mode === 'individual' ? 'Saudável' : undefined
    };
    
    consultMutation.mutate(payload);
  };

  // --- MUTATION 2 (Implícita): GERAÇÃO DE RECEITA COMPLETA ---
  const handleSelectRecipe = async (suggestion: any) => {
    if (generatingTitle) return; // Evita duplo clique
    
    setGeneratingTitle(suggestion.title); // Ativa o loading no card específico
    
    try {
      // Reconstrói o payload original para manter o contexto
      const contextData: DuChefPreferences = {
        mode,
        guests: mode === 'individual' ? 1 : parseInt(guests),
        budget,
        restrictions,
        cuisine: selectedCuisines,
      };

      // Chama o serviço que bate no Next.js -> N8N
      const fullRecipe = await generateFullDuChefRecipe(suggestion.title, contextData);

      // Navega para a tela de resultado passando o objeto completo
      router.push({
        pathname: '/recipe/result',
        params: { recipeData: JSON.stringify(fullRecipe) }
      });

    } catch (error) {
      Alert.alert("Erro", "O Chef não conseguiu escrever a receita completa agora. Tente outra opção.");
      console.error(error);
    } finally {
      setGeneratingTitle(null);
    }
  };

  // Helpers de seleção
  const toggleSelection = (list: string[], setList: any, item: string) => {
    if (list.includes(item)) setList(list.filter((i: string) => i !== item));
    else setList([...list, item]);
  };

  return (
    <SafeAreaView className="flex-1 bg-deep-900" edges={['top']}>
      <LinearGradient colors={['#1a160e', '#0F0F0F']} className="flex-1">
        <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
          
          {/* HEADER */}
          <View className="px-6 py-8">
            <View className="flex-row items-center mb-2">
              <Sparkles color="#C5A028" size={24} />
              <Text className="text-gold-500 font-geist-bold text-sm tracking-[3px] ml-2 uppercase">Lumiere AI</Text>
            </View>
            <Text className="text-4xl text-white font-geist-bold">Du Chef</Text>
            <Text className="text-stone-400 font-geist-regular mt-2">
              Seu Personal Chef virtual. Crie menus exclusivos baseados no seu momento.
            </Text>
          </View>

          {/* === RENDERIZAÇÃO CONDICIONAL: FORMULÁRIO vs RESULTADOS === */}
          
          {!consultMutation.data ? (
            /* --- FORMULÁRIO DE PREFERÊNCIAS --- */
            <Animated.View entering={FadeInDown.springify()} className="px-6 space-y-8">
              
              {/* 1. MODO (Individual vs Grupo) */}
              <View>
                <Text className="text-white font-geist-bold mb-4 text-lg">Quem vai comer?</Text>
                <View className="flex-row gap-4">
                  <TouchableOpacity 
                    activeOpacity={0.8}
                    onPress={() => setMode('individual')}
                    className={`flex-1 p-4 rounded-2xl border ${mode === 'individual' ? 'bg-gold-500/20 border-gold-500' : 'bg-deep-800 border-white/5'} items-center transition-all`}
                  >
                    <User color={mode === 'individual' ? '#C5A028' : '#78716c'} />
                    <Text className={`mt-2 font-geist-bold ${mode === 'individual' ? 'text-gold-500' : 'text-stone-500'}`}>Solo</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    activeOpacity={0.8}
                    onPress={() => setMode('group')}
                    className={`flex-1 p-4 rounded-2xl border ${mode === 'group' ? 'bg-gold-500/20 border-gold-500' : 'bg-deep-800 border-white/5'} items-center transition-all`}
                  >
                    <Users color={mode === 'group' ? '#C5A028' : '#78716c'} />
                    <Text className={`mt-2 font-geist-bold ${mode === 'group' ? 'text-gold-500' : 'text-stone-500'}`}>Acompanhado</Text>
                  </TouchableOpacity>
                </View>

                {/* Input de Pessoas (Só aparece se for grupo) */}
                {mode === 'group' && (
                  <Animated.View entering={FadeInDown} className="mt-4">
                    <Text className="text-stone-400 text-xs mb-2 uppercase tracking-widest">Quantas Pessoas?</Text>
                    <TextInput 
                      value={guests}
                      onChangeText={setGuests}
                      keyboardType="number-pad"
                      cursorColor="#C5A028"
                      className="bg-deep-800 text-white p-4 rounded-xl border border-white/10 font-geist-bold text-lg"
                      placeholder="Ex: 4"
                      placeholderTextColor="#44403c"
                    />
                  </Animated.View>
                )}
              </View>

              {/* 2. ORÇAMENTO */}
              <View>
                <Text className="text-white font-geist-bold mb-4 text-lg">Investimento Sugerido</Text>
                <View className="flex-row bg-deep-800 p-1 rounded-xl border border-white/5">
                  {(['cheap', 'medium', 'expensive'] as const).map((b) => (
                    <TouchableOpacity
                      key={b}
                      onPress={() => setBudget(b)}
                      className={`flex-1 py-3 rounded-lg items-center ${budget === b ? 'bg-gold-500' : 'transparent'}`}
                    >
                      <Text className={`font-geist-bold ${budget === b ? 'text-deep-900' : 'text-stone-400'}`}>
                        {b === 'cheap' ? 'Econômico' : b === 'medium' ? 'Médio' : 'Luxo'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* 3. RESTRIÇÕES */}
              <View>
                <Text className="text-white font-geist-bold mb-4 text-lg">Saúde & Restrições</Text>
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
                <Text className="text-white font-geist-bold mb-4 text-lg">Estilo de Cozinha</Text>
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

              {/* BOTÃO DE SUBMIT */}
              <TouchableOpacity
                onPress={handleConsult}
                disabled={consultMutation.isPending}
                className="w-full bg-gold-500 py-4 rounded-2xl flex-row justify-center items-center shadow-lg shadow-gold-500/20 mt-6 active:opacity-90"
              >
                {consultMutation.isPending ? (
                  <ActivityIndicator color="#0F0F0F" />
                ) : (
                  <>
                    <Sparkles color="#0F0F0F" size={20} />
                    <Text className="text-deep-900 font-geist-bold ml-2 text-lg uppercase tracking-wider">
                      Consultar Chef
                    </Text>
                  </>
                )}
              </TouchableOpacity>

            </Animated.View>
          ) : (
            
            /* --- LISTA DE SUGESTÕES (RESULTADO DA CONSULTA) --- */
            <Animated.View entering={FadeInRight} className="px-6 pb-20">
              
              <TouchableOpacity 
                onPress={() => consultMutation.reset()} // Limpa os dados e volta pro form
                className="mb-6 flex-row items-center self-start px-3 py-2 rounded-full bg-deep-800 border border-white/5"
              >
                <Text className="text-gold-500 text-sm font-geist-bold">← Nova Consulta</Text>
              </TouchableOpacity>

              <Text className="text-white font-geist-bold text-2xl mb-6">Sugestões do Chef</Text>

              {consultMutation.data.map((suggestion: any, index: number) => {
                const isGeneratingThis = generatingTitle === suggestion.title;
                
                return (
                  <TouchableOpacity
                    key={index}
                    disabled={!!generatingTitle} // Bloqueia outros cliques enquanto um carrega
                    activeOpacity={0.9}
                    onPress={() => handleSelectRecipe(suggestion)}
                    className={`mb-6 bg-deep-800 rounded-3xl overflow-hidden border ${isGeneratingThis ? 'border-gold-500' : 'border-white/10'} shadow-xl`}
                  >
                      {/* Área Visual do Card (Placeholder até gerar a imagem real) */}
                      <View className="h-40 w-full bg-stone-900/50 items-center justify-center relative overflow-hidden">
                          {/* Fundo sutil animado ou estático */}
                          <LinearGradient colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.8)']} className="absolute inset-0 z-10" />
                          
                          {isGeneratingThis ? (
                            <View className="items-center z-20 bg-black/60 p-4 rounded-2xl backdrop-blur-md">
                              <ActivityIndicator size="large" color="#C5A028" />
                              <Text className="text-gold-500 text-xs mt-3 font-bold uppercase tracking-widest animate-pulse">
                                Cozinhando Conceito...
                              </Text>
                            </View>
                          ) : (
                            <View className="items-center opacity-30">
                               <Flame color="#fff" size={48} />
                            </View>
                          )}
                      </View>
                      
                      <View className="p-5">
                          <View className="flex-row justify-between items-start mb-2">
                              <Text className="text-white text-xl font-geist-bold flex-1 mr-2 leading-tight">
                                {suggestion.title}
                              </Text>
                              {suggestion.difficulty && (
                                <View className="bg-gold-500/20 px-2 py-1 rounded border border-gold-500/20">
                                    <Text className="text-gold-500 text-[10px] font-bold uppercase">{suggestion.difficulty}</Text>
                                </View>
                              )}
                          </View>
                          
                          <Text className="text-stone-400 text-sm leading-6 mb-4 font-geist-regular">
                            {suggestion.description}
                          </Text>
                          
                          {!isGeneratingThis && (
                            <View className="flex-row items-center justify-end border-t border-white/5 pt-4">
                                <Text className="text-gold-500 text-sm font-bold mr-2 uppercase tracking-wide">Ver Receita</Text>
                                <ChevronRight color="#C5A028" size={16} />
                            </View>
                          )}
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