// app/(auth)/login.tsx

import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Alert,
  Keyboard, // Importado para ajudar aDismissOnTap
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Logo } from '@/components/ui/logo';
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
    Keyboard.dismiss(); // Esconde o teclado ao submeter
    try {
      await signIn(data.email, data.password);
    } catch (error: any) {
      Alert.alert("Acesso Negado", error.message || "Verifique suas credenciais");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-deep-900">
      <SafeAreaView className="flex-1">
        {/* KeyboardAvoidingView: Ajusta a tela quando o teclado sobe */}
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : -200} // Ajuste fino para Android
        >
          {/* ScrollView: Permite a rolagem para evitar que o conteúdo fique coberto */}
          <ScrollView 
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
            className="p-8"
            keyboardShouldPersistTaps="handled"
            scrollEnabled={true} // Garante que a rolagem funcione se o teclado aparecer
          >
            
            {/* Logo */}
            <View className="mb-16">
              <Logo variant="full" size={80} />
            </View>

            {/* Formulário */}
            <View className="gap-6 w-full max-w-md self-center">
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Email"
                    placeholder="exemplo@lumiere.com"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    error={errors.email?.message}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                )}
              />

              <View>
                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="Senha"
                      placeholder="••••••••"
                      secureTextEntry // ESSENCIAL: Ativa o novo visualizador de senha
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      error={errors.password?.message}
                    />
                  )}
                />
                <View className="items-end mt-2">
                  <Text className="text-stone-500 text-xs">Esqueceu a senha?</Text>
                </View>
              </View>

              <Button 
                label={loading ? "Autenticando..." : "Entrar no Atelier"} 
                onPress={handleSubmit(onSubmit)}
                disabled={loading}
                className="mt-2"
              />

              <View className="flex-row justify-center mt-6 gap-1">
                <Text className="text-stone-500">Ainda não é membro?</Text>
                <Link href="/(auth)/register" asChild>
                  <Text className="text-gold-500 font-bold">Solicitar convite</Text>
                </Link>
              </View>
            </View>

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}