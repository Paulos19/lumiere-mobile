// components/ui/logo.tsx
import { cn } from "@/lib/utils";
import React from "react";
import { Text, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";

interface LogoProps {
  variant?: "full" | "icon" | "text";
  size?: number; // Controla o tamanho do ícone
  className?: string;
}

export function Logo({ variant = "full", size = 64, className }: LogoProps) {
  // Cores do tema (Gold 500)
  const goldColor = "#EAB308"; 

  // Emblema Vetorial: Uma Cloche (tampa de prato) estilizada e minimalista
  const IconComponent = () => (
    <View style={{ width: size, height: size }} className="items-center justify-center">
      <Svg width="100%" height="100%" viewBox="0 0 100 100" fill="none">
        {/* Círculo externo fino */}
        <Circle cx="50" cy="50" r="48" stroke={goldColor} strokeWidth="1.5" opacity="0.8" />
        
        {/* Arco decorativo inferior (base do prato) */}
        <Path 
          d="M25 75 Q50 85 75 75" 
          stroke={goldColor} 
          strokeWidth="2" 
          strokeLinecap="round" 
        />

        {/* Cloche / Letra L abstrata */}
        <Path
          d="M50 25 C35 25 25 40 25 55 V65 H75 V55 C75 40 65 25 50 25 Z"
          stroke={goldColor}
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        
        {/* Detalhe do puxador da Cloche (ponto superior) */}
        <Circle cx="50" cy="20" r="3" fill={goldColor} />
      </Svg>
    </View>
  );

  if (variant === "icon") {
    return (
      <View className={cn("items-center justify-center", className)}>
        <IconComponent />
      </View>
    );
  }

  if (variant === "text") {
    return (
        <View className={cn("items-center", className)}>
            <Text className="text-2xl font-display text-gold-500 tracking-[0.2em]">
            LUMIÈRE
            </Text>
        </View>
    );
  }

  // Variant Full (Default)
  return (
    <View className={cn("items-center gap-4", className)}>
      {/* Container com brilho sutil atrás do logo */}
      <View className="relative">
        <View className="absolute inset-0 bg-gold-500/10 blur-xl rounded-full" />
        <IconComponent />
      </View>

      <View className="items-center">
        <Text className="text-4xl font-display text-gold-500 tracking-[0.25em]">
          LUMIÈRE
        </Text>
        <View className="flex-row items-center gap-2 mt-1 opacity-80">
          <View className="h-[1px] w-8 bg-stone-500" />
          <Text className="text-stone-400 font-serif italic text-sm tracking-widest">
            ATELIER
          </Text>
          <View className="h-[1px] w-8 bg-stone-500" />
        </View>
      </View>
    </View>
  );
}