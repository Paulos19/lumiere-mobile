import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { ChefHat } from '@/components/ui/icons';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/stores/useAuthStore';

// Schema de Validação
const registerSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 letras"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não conferem",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof registerSchema>;

export default function RegisterScreen() {
  const register = useAuthStore((state) => state.register);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' }
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await register(data.name, data.email, data.password);
      // O redirecionamento acontece dentro da store, mas se houver erro cai no catch
    } catch (error: any) {
      Alert.alert("Erro no Cadastro", error.message || "Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-deep-900">
      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <ScrollView className="p-8 flex-grow justify-center">
            
            {/* Header */}
            <View className="items-center mb-10">
              <View className="flex-row items-center gap-2 mb-2">
                 <ChefHat className="text-gold-500 w-8 h-8" />
                 <Text className="text-xl font-display text-gold-500">LUMIÈRE</Text>
              </View>
              <Text className="text-3xl font-display text-white text-center">
                Junte-se ao Atelier
              </Text>
              <Text className="text-stone-400 text-center mt-2">
                Crie sua conta para experiências gastronômicas exclusivas.
              </Text>
            </View>

            {/* Formulário */}
            <View className="gap-5">
              
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Nome Completo"
                    placeholder="Ex: Ana Silva"
                    autoCapitalize="words"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    error={errors.name?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Email"
                    placeholder="seu@email.com"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    error={errors.email?.message}
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

              <Controller
                control={control}
                name="confirmPassword"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Confirmar Senha"
                    placeholder="••••••"
                    secureTextEntry
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    error={errors.confirmPassword?.message}
                  />
                )}
              />

              <Button 
                label={loading ? "Criando conta..." : "Criar Minha Conta"} 
                onPress={handleSubmit(onSubmit)}
                disabled={loading}
                className="mt-4"
              />
            </View>

            {/* Rodapé - Voltar ao Login */}
            <View className="flex-row justify-center mt-8 gap-1">
              <Text className="text-stone-500">Já tem convite?</Text>
              <Link href="/(auth)/login" asChild>
                <Text className="text-gold-500 font-bold">Entrar agora</Text>
              </Link>
            </View>

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}