import { Storage } from '@/lib/storage';
import { router } from 'expo-router';
import { create } from 'zustand';

// ------------------------------------------------------------------
// CONFIGURAÇÃO DE API
// ------------------------------------------------------------------
const API_LOGIN_URL = "https://lumieres-mu.vercel.app/api/mobile/auth/login";
const API_REGISTER_URL = "https://lumieres-mu.vercel.app/api/mobile/auth/register";

// ------------------------------------------------------------------
// TIPAGEM
// ------------------------------------------------------------------
interface User {
  id: string;
  name: string;
  email: string;
  preferences?: any;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  
  // Ações
  signIn: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string) => Promise<void>;
  signOut: () => Promise<void>;
  hydrate: () => Promise<void>; 
}

// ------------------------------------------------------------------
// STORE (Zustand)
// ------------------------------------------------------------------
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,

  // --- LOGIN ---
  signIn: async (email, password) => {
    try {
      const response = await fetch(API_LOGIN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Falha ao entrar. Verifique suas credenciais.');
      }

      // Verificação de Segurança
      if (!data.user || !data.user.id) {
        console.error("[Auth] ERRO CRÍTICO: Backend não retornou ID do usuário.", data);
      } else {
        console.log("[Auth] Login realizado. ID:", data.user.id);
      }

      // 1. Salvar sessão segura no dispositivo
      await Storage.setItem('user_session', JSON.stringify(data.user));
      
      // 2. Atualizar estado global
      set({ user: data.user });

      // 3. Redirecionar para o App
      router.replace('/(tabs)'); 

    } catch (error) {
      console.error("[Auth] Erro no login:", error);
      throw error; 
    }
  },

  // --- REGISTRO ---
  register: async (name, email, password) => {
    try {
      const response = await fetch(API_REGISTER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Falha ao criar conta.');
      }

      console.log("[Auth] Registro realizado. ID:", data.user?.id);

      // Auto-Login:
      await Storage.setItem('user_session', JSON.stringify(data.user));
      set({ user: data.user });
      router.replace('/(tabs)');

    } catch (error) {
      console.error("[Auth] Erro no registro:", error);
      throw error;
    }
  },

  // --- LOGOUT ---
  signOut: async () => {
    try {
      await Storage.deleteItem('user_session');
      set({ user: null });
      router.replace('/(auth)/login');
    } catch (error) {
      console.error("Erro ao sair:", error);
    }
  },

  // --- HIDRATAÇÃO (Auto-Login ao abrir o app) ---
  hydrate: async () => {
    set({ isLoading: true });
    try {
      const storedUser = await Storage.getItem('user_session');
      
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        console.log("[Auth] Sessão restaurada para ID:", parsedUser.id);
        set({ user: parsedUser });
        // O router cuida do redirecionamento ou o _layout mostra a tela correta
      } else {
        console.log("[Auth] Nenhuma sessão salva encontrada.");
        set({ user: null });
      }
    } catch (e) {
      console.log('[Auth] Erro ao ler sessão:', e);
      set({ user: null });
    } finally {
      set({ isLoading: false });
    }
  }
}));