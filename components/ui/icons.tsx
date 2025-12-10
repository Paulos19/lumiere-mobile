// components/ui/icons.tsx

import { cn } from "@/lib/utils";
import React from "react";
import { Path, Svg, SvgProps } from "react-native-svg";

export interface IconProps extends SvgProps {
  className?: string;
}

// -----------------------------------------------------------
// Ícone de Chef (Já existia no projeto)
// -----------------------------------------------------------
export function ChefHat({ className, ...props }: IconProps) {
  return (
    <Svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("text-current", className)}
      {...props}
    >
      <Path d="M12 11h9a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-1M5 11v11M1 17a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2M15.5 11c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zM6.5 11c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zM12 2v2M12 11V4" />
    </Svg>
  );
}

// -----------------------------------------------------------
// Ícone de Olho Aberto (Eye) - Para mostrar a senha
// -----------------------------------------------------------
export function Eye({ className, ...props }: IconProps) {
  return (
    <Svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("text-current", className)}
      {...props}
    >
      <Path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <Path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
    </Svg>
  );
}

// -----------------------------------------------------------
// Ícone de Olho Fechado (EyeOff) - Para esconder a senha
// -----------------------------------------------------------
export function EyeOff({ className, ...props }: IconProps) {
  return (
    <Svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("text-current", className)}
      {...props}
    >
      <Path d="M9.88 9.88a3 3 0 1 0 4.24 4.24M10.6 6.6A10 10 0 0 1 22 12c-.58 1.48-1.74 2.85-3.3 3.84m-4.5 2.2a10 10 0 0 1-9.9-7.04c.58-1.48 1.74-2.85 3.3-3.84m.5-1.01a1 1 0 0 0-1.76-1L2 2" />
      <Path d="M2 2l20 20" />
    </Svg>
  );
}

// -----------------------------------------------------------
// Adicione outros ícones do projeto aqui (ex: Home, Settings, etc.)
// -----------------------------------------------------------
// export function Home(...) { ... }