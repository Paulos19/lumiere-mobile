import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import React from 'react'; // Remova { useState } se não estiver usando mais localmente
import { Controller, useForm } from 'react-hook-form';
import { Alert, Keyboard, ScrollView, Text, View } from 'react-native'; // Adicione Keyboard
import { SafeAreaView } from 'react-native-safe-area-context';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { ChefLoading } from '@/components/ui/chef-loading'; // <--- Importe aqui
import { ChefHat } from '@/components/ui/icons';
import { Input } from '@/components/ui/input';
import { useRecipeStore } from '@/stores/useRecipeStore';

// ... (Schema mantém igual) ...
const formSchema = z.object({
  ingredients: z.string().min(3, "Diga-me o que você tem disponível"),
  goal: z.enum(["loss", "maintain", "gain"]),
  restrictions: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function CreateRecipeScreen() {
  const router = useRouter();
  const generateRecipe = useRecipeStore((state) => state.generateRecipe);
  const isGenerating = useRecipeStore((state) => state.isGenerating);

  const { control, handleSubmit, setValue, watch } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { goal: 'maintain', ingredients: '' }
  });

  const selectedGoal = watch('goal');

  const onSubmit = async (data: FormData) => {
    Keyboard.dismiss(); // Fecha o teclado para a animação ficar bonita
    try {
      await generateRecipe(data);
      router.push('/recipe/result');
    } catch (error) {
      Alert.alert("Erro na Cozinha", "O Chef não conseguiu criar a receita agora. Tente novamente.");
    }
  };

  // --- SE ESTIVER GERANDO, MOSTRA O LOADING ---
  if (isGenerating) {
    return <ChefLoading />;
  }
  // --------------------------------------------

  return (
    <View className="flex-1 bg-deep-900">
      <SafeAreaView className="flex-1">
        <ScrollView className="p-6 pb-24">
          
          {/* Header */}
          <View className="flex-row items-center justify-between mb-8">
            <Button variant="ghost" label="Voltar" onPress={() => router.back()} />
            <ChefHat className="text-gold-500" />
          </View>

          <Text className="text-3xl font-display text-gold-500 mb-2">Atelier Pessoal</Text>
          <Text className="text-stone-400 font-serif italic mb-8">
            Conte-me seus objetivos e o que tem na despensa.
          </Text>

          {/* ... (Resto do formulário mantém idêntico ao anterior) ... */}
          
          {/* Seletor de Objetivo */}
          <Text className="text-gold-400 text-sm font-bold uppercase tracking-widest mb-3">Objetivo</Text>
          <View className="flex-row gap-2 mb-6">
            {[
              { id: 'loss', label: 'Perder' },
              { id: 'maintain', label: 'Manter' },
              { id: 'gain', label: 'Ganhar' }
            ].map((option) => (
              <Button
                key={option.id}
                onPress={() => setValue('goal', option.id as any)}
                variant={selectedGoal === option.id ? 'default' : 'outline'}
                className="flex-1 h-10"
                label={option.label}
              />
            ))}
          </View>

          {/* Ingredientes */}
          <Controller
            control={control}
            name="ingredients"
            render={({ field: { onChange, onBlur, value } }) => (
              <View className="mb-6">
                <Text className="text-gold-400 text-sm font-bold uppercase tracking-widest mb-3">Ingredientes</Text>
                <Input
                  multiline
                  numberOfLines={4}
                  placeholder="Ex: Tenho frango, batata doce, brócolis..."
                  className="h-32 text-top align-top"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              </View>
            )}
          />

          {/* Restrições */}
          <Controller
            control={control}
            name="restrictions"
            render={({ field: { onChange, onBlur, value } }) => (
              <View className="mb-8">
                <Input
                  label="Restrições (Opcional)"
                  placeholder="Ex: Sem glúten, sem lactose..."
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              </View>
            )}
          />

          <Button 
            size="lg"
            label="Criar Menu Exclusivo" // Texto fixo agora, já que a tela muda
            onPress={handleSubmit(onSubmit)}
          />

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}