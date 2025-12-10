import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as z from 'zod';

// Ícones e Componentes
import { DuChefPreferences, recipeService } from '@/app/services/recipeService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRecipeStore } from '@/stores/useRecipeStore';
import { ArrowRight, CheckCircle2, ChefHat, Sparkles, Utensils, Wallet } from 'lucide-react-native';

// --- SCHEMA DE VALIDAÇÃO ---
const formSchema = z.object({
  guests: z.string().min(1, "Informe o número").regex(/^\d+$/, "Apenas números"),
  budget: z.enum(['cheap', 'medium', 'expensive']),
  restrictions: z.string().optional(),
  cuisine: z.string().min(3, "Defina um estilo"),
});

type DuChefFormSchema = z.infer<typeof formSchema>;

export default function DuChefScreen() {
  const router = useRouter();
  
  // STORE ZUSTAND (Para gerar a receita final e limpar o estado antigo)
  const generateDuChefRecipe = useRecipeStore((state) => state.generateDuChefRecipe);
  
  // ESTADOS LOCAIS
  const [step, setStep] = useState<1 | 2>(1); // 1 = Form, 2 = Sugestões
  const [generatingTitle, setGeneratingTitle] = useState<string | null>(null);
  const [lastPrefs, setLastPrefs] = useState<DuChefPreferences | null>(null);

  // REACT HOOK FORM
  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm<DuChefFormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      guests: '2', 
      budget: 'medium',
      cuisine: '',
      restrictions: ''
    }
  });

  const selectedBudget = watch('budget');

  // MUTATION: CONSULTA (PASSO 1)
  const consultMutation = useMutation({
    mutationFn: recipeService.askDuChef,
    onSuccess: () => {
      setStep(2);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    onError: (error: any) => {
      Alert.alert("Erro no Chef", error.message || "Não foi possível consultar o chef.");
    }
  });

  // SUBMIT DO FORMULÁRIO (GERAR SUGESTÕES)
  const onSubmit = (data: DuChefFormSchema) => {
    // Conversão manual segura
    const guestsNumber = parseInt(data.guests, 10) || 1;

    const prefs: DuChefPreferences = {
      mode: guestsNumber > 1 ? 'group' : 'individual',
      guests: guestsNumber,
      budget: data.budget,
      restrictions: data.restrictions ? data.restrictions.split(',').map(s => s.trim()) : [],
      cuisine: [data.cuisine],
    };
    
    setLastPrefs(prefs);
    consultMutation.mutate(prefs);
  };

  // AÇÃO: SELECIONAR SUGESTÃO E GERAR RECEITA FINAL
  const handleSelectRecipe = async (suggestion: any) => {
    if (generatingTitle || !lastPrefs) return;
    
    // Feedback visual e tátil
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setGeneratingTitle(suggestion.title);

    try {
      // 1. CHAMA A STORE (Isso limpa a receita anterior e gerencia o loading global)
      await generateDuChefRecipe(suggestion.title, lastPrefs);

      // 2. NAVEGA PARA O RESULTADO
      router.push('/recipe/result');

    } catch (error) {
      console.log("Fluxo cancelado ou erro tratado na store");
    } finally {
      // Pequeno delay para evitar flash se o usuário voltar rápido
      setTimeout(() => setGeneratingTitle(null), 500);
    }
  };

  // --- RENDERIZAÇÃO: PASSO 1 (FORMULÁRIO) ---
  if (step === 1) {
    return (
      <View className="flex-1 bg-deep-900">
        <SafeAreaView className="flex-1">
          <ScrollView className="p-6" showsVerticalScrollIndicator={false}>
            
            {/* Header */}
            <View className="items-center mb-8 mt-4">
              <View className="bg-deep-800 p-4 rounded-full mb-4 border border-gold-500/20 shadow-lg shadow-gold-500/10">
                <ChefHat className="text-gold-500 w-12 h-12" />
              </View>
              <Text className="text-3xl font-display text-gold-500 tracking-wider">Du Chef</Text>
              <Text className="text-stone-400 text-center font-serif italic mt-2 px-8">
                "Diga-me a ocasião, e eu desenharei o menu perfeito."
              </Text>
            </View>

            {/* Form */}
            <View className="gap-6 pb-20">
              
              {/* Cozinha */}
              <Controller
                control={control}
                name="cuisine"
                render={({ field: { onChange, value } }) => (
                  <Input 
                    label="Estilo de Cozinha"
                    placeholder="Ex: Italiana, Japonesa..."
                    value={value}
                    onChangeText={onChange}
                    error={errors.cuisine?.message}
                  />
                )}
              />

              {/* Convidados */}
              <Controller
                control={control}
                name="guests"
                render={({ field: { onChange, value } }) => (
                  <View>
                    <Text className="text-gold-400 text-xs font-bold uppercase tracking-widest mb-2">Convidados</Text>
                    <View className="flex-row items-center bg-deep-800 rounded-xl border border-white/10 p-1">
                      <Utensils size={18} className="text-stone-500 ml-3" />
                      <Input 
                        className="bg-transparent border-0 h-10 flex-1 text-white"
                        placeholder="Número de pessoas"
                        keyboardType="numeric"
                        value={value}
                        onChangeText={onChange}
                      />
                    </View>
                    {errors.guests && <Text className="text-red-500 text-xs mt-1">{errors.guests.message}</Text>}
                  </View>
                )}
              />

              {/* Orçamento */}
              <View>
                <Text className="text-gold-400 text-xs font-bold uppercase tracking-widest mb-3">Orçamento</Text>
                <View className="flex-row gap-3">
                  {[
                    { id: 'cheap', label: 'Econômico', icon: Wallet },
                    { id: 'medium', label: 'Médio', icon: Wallet },
                    { id: 'expensive', label: 'Luxo', icon: Sparkles },
                  ].map((opt) => (
                    <TouchableOpacity
                      key={opt.id}
                      onPress={() => setValue('budget', opt.id as any)}
                      className={`flex-1 items-center justify-center p-3 rounded-xl border transition-all ${
                        selectedBudget === opt.id 
                          ? 'bg-gold-500 border-gold-500' 
                          : 'bg-deep-800 border-white/10'
                      }`}
                    >
                      <opt.icon size={20} className={selectedBudget === opt.id ? 'text-deep-900' : 'text-stone-500'} />
                      <Text className={`text-xs font-bold mt-1 ${selectedBudget === opt.id ? 'text-deep-900' : 'text-stone-400'}`}>
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Restrições */}
              <Controller
                control={control}
                name="restrictions"
                render={({ field: { onChange, value } }) => (
                  <Input 
                    label="Restrições (Opcional)"
                    placeholder="Ex: Sem glúten, vegano..."
                    value={value || ''}
                    onChangeText={onChange}
                  />
                )}
              />

              <Button 
                size="lg"
                label={consultMutation.isPending ? "Consultando Chef..." : "Pedir Sugestões"}
                onPress={handleSubmit(onSubmit)}
                disabled={consultMutation.isPending}
                className="mt-4"
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  // --- RENDERIZAÇÃO: PASSO 2 (SUGESTÕES) ---
  return (
    <View className="flex-1 bg-deep-900">
      <SafeAreaView className="flex-1">
        <ScrollView className="p-6" showsVerticalScrollIndicator={false}>
          
          <View className="flex-row items-center justify-between mb-6">
            <TouchableOpacity onPress={() => setStep(1)} className="p-2 bg-deep-800 rounded-full border border-white/10">
               <ArrowRight className="text-stone-400 rotate-180" size={20} />
            </TouchableOpacity>
            <Text className="text-gold-500 font-display text-xl">Sugestões do Chef</Text>
            <View className="w-10" /> 
          </View>

          <Text className="text-stone-400 mb-6 italic text-center">
            "Aqui estão três criações exclusivas para você."
          </Text>

          <View className="gap-6 pb-12">
            {consultMutation.data?.map((suggestion: any, index: number) => {
              const isGeneratingThis = generatingTitle === suggestion.title;
              
              return (
                <TouchableOpacity
                  key={index}
                  disabled={!!generatingTitle}
                  activeOpacity={0.9}
                  onPress={() => handleSelectRecipe(suggestion)}
                  className={`bg-deep-800 rounded-2xl overflow-hidden border transition-all ${
                    isGeneratingThis ? 'border-gold-500 shadow-lg shadow-gold-500/20' : 'border-white/10'
                  }`}
                >
                    {/* Header do Card (View wrapper para segurança do Gradient) */}
                    <View className="h-32 w-full relative justify-center items-center overflow-hidden">
                        <LinearGradient
                          colors={isGeneratingThis ? ['#D4AF37', '#997B1A'] : ['#292524', '#1C1917']}
                          style={{ position: 'absolute', width: '100%', height: '100%' }}
                        />
                        
                        {isGeneratingThis ? (
                          <ActivityIndicator size="large" color="#1C1917" />
                        ) : (
                          <ChefHat size={40} className="text-white/20" />
                        )}
                        
                        {/* Badge de Dificuldade */}
                        {suggestion.difficulty && (
                          <View className="absolute top-3 right-3 bg-black/40 px-3 py-1 rounded-full border border-white/10">
                             <Text className="text-white text-[10px] font-bold uppercase tracking-widest">
                               {suggestion.difficulty}
                             </Text>
                          </View>
                        )}
                    </View>

                    {/* Conteúdo */}
                    <View className="p-5">
                       <Text className={`text-xl font-display mb-2 leading-tight ${isGeneratingThis ? 'text-gold-500' : 'text-white'}`}>
                         {suggestion.title}
                       </Text>
                       <Text className="text-stone-400 text-sm leading-relaxed mb-4">
                         {suggestion.description}
                       </Text>
                       
                       <View className="flex-row items-center justify-between pt-4 border-t border-white/5">
                          <Text className="text-stone-500 text-xs font-bold uppercase tracking-widest">Toque para ver a receita</Text>
                          <CheckCircle2 size={16} className={isGeneratingThis ? "text-gold-500" : "text-stone-600"} />
                       </View>
                    </View>
                </TouchableOpacity>
              );
            })}
          </View>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}