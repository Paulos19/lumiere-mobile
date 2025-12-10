// app/(auth)/register.tsx
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Logo } from '@/components/ui/logo'; // Nova Logo
import { useAuthStore } from '@/stores/useAuthStore';

const registerSchema = z.object({
  name: z.string().min(2, "Nome muito curto"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
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
    } catch (error: any) {
      Alert.alert("Erro no Cadastro", error.message || "Tente novamente.");
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
          <ScrollView 
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
            className="p-8"
            keyboardShouldPersistTaps="handled"
          >
            
            {/* Header com Logo - Versão Compacta ou Full dependendo do gosto */}
            {/* Aqui optei pela Full mas com texto adaptado abaixo */}
            <View className="items-center mb-10">
              <Logo variant="icon" size={60} className="mb-4" />
              <Text className="text-3xl font-display text-white text-center">
                Junte-se ao <Text className="text-gold-500">Lumière</Text>
              </Text>
              <Text className="text-stone-400 text-center mt-2 px-4 leading-relaxed">
                Crie sua conta para acessar experiências gastronômicas exclusivas.
              </Text>
            </View>

            {/* Formulário */}
            <View className="gap-5 w-full max-w-md self-center">
              
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

            {/* Rodapé */}
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