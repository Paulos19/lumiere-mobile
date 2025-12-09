import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Text, View } from 'react-native'; // Adicione Image se quiser logo
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { ChefHat } from '@/components/ui/icons';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/stores/useAuthStore';

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

type FormData = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const signIn = useAuthStore((state) => state.signIn);
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' }
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await signIn(data.email, data.password);
    } catch (error: any) {
      Alert.alert("Erro", error.message || "Falha ao entrar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-deep-900 justify-center p-8">
      
      {/* Cabeçalho */}
      <View className="items-center mb-12">
        <View className="bg-deep-800 p-4 rounded-full mb-4 border border-gold-500/20">
          <ChefHat className="text-gold-500 w-16 h-16" />
        </View>
        <Text className="text-3xl font-display text-gold-500 tracking-wider">
          LUMIÈRE
        </Text>
        <Text className="text-stone-400 font-serif italic mt-2">
          Sua cozinha, elevada.
        </Text>
      </View>

      {/* Formulário */}
      <View className="gap-6">
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Email"
              placeholder="seu@email.com"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.email?.message}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Senha"
              placeholder="••••••"
              secureTextEntry
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.password?.message}
            />
          )}
        />

        <Button 
          label={loading ? "Entrando..." : "Acessar Atelier"} 
          onPress={handleSubmit(onSubmit)}
          disabled={loading}
          className="mt-4"
        />

        <View className="flex-row justify-center mt-4 gap-1">
          <Text className="text-stone-500">Ainda não é membro?</Text>
          <Link href="/(auth)/register" asChild>
            <Text className="text-gold-500 font-bold">Solicitar acesso</Text>
          </Link>
        </View>
      </View>
    </View>
  );
}