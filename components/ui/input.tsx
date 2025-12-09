import { cn } from "@/lib/utils";
import * as React from "react";
import { Text, TextInput, View } from "react-native";

export interface InputProps
  extends React.ComponentPropsWithoutRef<typeof TextInput> {
  label?: string;
  error?: string;
}

const Input = React.forwardRef<React.ElementRef<typeof TextInput>, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    // Definir cor do placeholder baseado no tema (aqui fixei cores do tema escuro do Lumière)
    const placeholderColor = "#78716c"; // stone-500

    return (
      <View className="w-full gap-1.5">
        {label && (
          <Text className="text-gold-400 text-sm font-medium tracking-wide">
            {label}
          </Text>
        )}
        <TextInput
          ref={ref}
          className={cn(
            "h-12 w-full rounded-md border border-white/10 bg-deep-900 px-3 py-2 text-stone-200 placeholder:text-stone-500",
            "focus:border-gold-500 focus:bg-deep-800", // Efeito de foco
            error && "border-red-500",
            className
          )}
          placeholderTextColor={placeholderColor}
          {...props}
        />
        {error && <Text className="text-red-500 text-xs">{error}</Text>}
      </View>
    );
  }
);
Input.displayName = "Input";

export { Input };
