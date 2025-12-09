import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import React from 'react';
import { Pressable, Text } from 'react-native';

const buttonVariants = cva(
  "flex-row items-center justify-center rounded-md px-4 py-3 gap-2 disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-gold-500 active:bg-gold-400", // Estilo principal
        destructive: "bg-red-500 text-white hover:bg-red-600",
        outline: "border border-gold-500/50 bg-transparent active:bg-deep-800",
        secondary: "bg-deep-800 active:bg-deep-700",
        ghost: "bg-transparent active:bg-deep-800/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-12",
        sm: "h-9 px-3",
        lg: "h-14 px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const textVariants = cva("font-bold text-sm tracking-widest uppercase", {
  variants: {
    variant: {
      default: "text-deep-900", // Texto escuro no fundo dourado
      destructive: "text-destructive-foreground",
      outline: "text-gold-500",
      secondary: "text-gold-400",
      ghost: "text-stone-400",
      link: "text-primary",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

interface ButtonProps
  extends React.ComponentPropsWithoutRef<typeof Pressable>,
    VariantProps<typeof buttonVariants> {
  label?: string;
  textClass?: string;
}

export function Button({ 
  className, 
  variant, 
  size, 
  label, 
  children, 
  textClass,
  ...props 
}: ButtonProps) {
  return (
    <Pressable
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {({ pressed }) => (
        <>
          {/* Se passar Children (ex: ícone + texto), renderiza children. Se for só texto, usa label */}
          {children ? (
            children
          ) : (
            <Text className={cn(textVariants({ variant }), textClass)}>
              {label}
            </Text>
          )}
        </>
      )}
    </Pressable>
  );
}