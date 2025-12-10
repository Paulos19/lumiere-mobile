// components/ui/input.tsx

import { cn } from "@/lib/utils";
import * as React from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { Eye, EyeOff } from './icons'; // Presumindo que os ícones Eye/EyeOff estão disponíveis

export interface InputProps
  extends React.ComponentPropsWithoutRef<typeof TextInput> {
  label?: string;
  error?: string;
}

const Input = React.forwardRef<React.ElementRef<typeof TextInput>, InputProps>(
  ({ className, label, error, secureTextEntry, ...props }, ref) => {
    
    // Estado para controle de visibilidade da senha
    const [isPasswordVisible, setIsPasswordVisible] = React.useState(false);
    
    // Determinar se é um campo de senha que pode ser alternado
    const isPassword = secureTextEntry;

    // A cor do placeholder foi mantida como uma constante para consistência
    const placeholderColor = "#78716c"; // stone-500

    return (
      <View className="w-full gap-1.5">
        {label && (
          <Text className="text-gold-400 text-sm font-medium tracking-wide">
            {label}
          </Text>
        )}
        <View className="relative">
          <TextInput
            ref={ref}
            className={cn(
              "h-12 w-full rounded-md border border-white/10 bg-deep-900 px-3 py-2 pr-12 text-stone-200 placeholder:text-stone-500", // Aumentei o padding à direita (pr-12) para o ícone
              "focus:border-gold-500 focus:bg-deep-800", // Efeito de foco
              error && "border-red-500",
              className
            )}
            placeholderTextColor={placeholderColor}
            // Controla a visibilidade: Se for senha E não estiver visível, usa secureTextEntry
            secureTextEntry={isPassword && !isPasswordVisible} 
            {...props}
          />

          {/* Botão de alternância de visibilidade (Apenas para campos de senha) */}
          {isPassword && (
            <Pressable
              onPress={() => setIsPasswordVisible(prev => !prev)}
              className="absolute right-0 top-0 bottom-0 justify-center px-3"
            >
              {isPasswordVisible ? (
                <Eye className="w-5 h-5 text-stone-400" />
              ) : (
                <EyeOff className="w-5 h-5 text-stone-600" />
              )}
            </Pressable>
          )}

        </View>
        {error && <Text className="text-red-500 text-xs">{error}</Text>}
      </View>
    );
  }
);
Input.displayName = "Input";

export { Input };
