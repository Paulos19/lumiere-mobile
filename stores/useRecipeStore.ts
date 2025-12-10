import { recipeService } from '@/app/services/recipeService';
import { Alert } from 'react-native';
import { create } from 'zustand';
import { useAuthStore } from './useAuthStore';

// ------------------------------------------------------------------
// CONFIGURAÇÃO DE API
// ------------------------------------------------------------------
const API_BASE = "https://lumieres-mu.vercel.app/api/mobile";
const API_GENERATE_URL = `${API_BASE}/ai/generate`;
const API_SAVE_URL = `${API_BASE}/recipe/save`;
const API_LIST_URL = `${API_BASE}/recipe/list`;
const API_VIDEO_URL = `${API_BASE}/ai/video`;

// ------------------------------------------------------------------
// TIPAGEM
// ------------------------------------------------------------------
export interface Recipe {
  id?: string;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  macros: { calories: string; protein: string; carbs: string; fat: string };
  imageUrl?: string;
  difficulty?: string;
  prepTime?: string;
  platingTips?: string;
  portions?: string;
  category?: string;
  savedAt?: string;
  
  // Mapeamento de índice do passo (0, 1, 2...) para URL do vídeo gerado
  stepVideos?: Record<number, string>; 
}

interface RecipeState {
  currentRecipe: Recipe | null;
  savedRecipes: Recipe[];
  isGenerating: boolean;     // Loading da receita completa
  isLoadingList: boolean;    // Loading da lista de receitas salvas
  generatingStepIndex: number | null; // Qual passo está gerando vídeo agora?

  // Actions
  generateRecipe: (data: any) => Promise<void>; // Fluxo 1: Criação Livre (Ingredientes)
  generateDuChefRecipe: (selectedTitle: string, preferences: any) => Promise<void>; // Fluxo 2: Sugestões Du Chef
  toggleSaveCurrentRecipe: () => Promise<boolean>;
  fetchMyRecipes: () => Promise<void>;
  generateStepVideo: (index: number, stepText: string) => Promise<void>;
  setCurrentRecipe: (recipe: Recipe) => void;
  clearRecipe: () => void;
}

// ------------------------------------------------------------------
// STORE
// ------------------------------------------------------------------
export const useRecipeStore = create<RecipeState>((set, get) => ({
  currentRecipe: null,
  savedRecipes: [],
  isGenerating: false,
  isLoadingList: false,
  generatingStepIndex: null,

  // --- 1. GERAR RECEITA (FLUXO LIVRE: INGREDIENTES) ---
  generateRecipe: async (formData) => {
    // Limpa a receita anterior para forçar a tela de Loading
    set({ currentRecipe: null, isGenerating: true });
    
    try {
      // 1. Recuperação de Sessão (Auth Check)
      let user = useAuthStore.getState().user;

      if (!user || !user.id) {
        console.log("[Store] Recuperando sessão para Criação Livre...");
        await useAuthStore.getState().hydrate();
        user = useAuthStore.getState().user;
      }

      if (!user || !user.id) {
        Alert.alert("Sessão Expirada", "Por favor, faça login novamente.");
        set({ isGenerating: false });
        return; 
      }
      
      console.log(`[Store] Iniciando geração livre para: ${user.name}`);

      // 2. Chamada Direta
      const response = await fetch(API_GENERATE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...formData, 
          userId: user.id, 
          userName: user.name, 
          locale: 'pt' 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erro: ${response.status}`);
      }
      
      const data = await response.json();
      
      // 3. Normalização
      const recipeData = data.recipe || data;
      
      if (!recipeData.title) throw new Error("Receita incompleta retornada pela IA.");

      if (data.imageUrl && !recipeData.imageUrl) {
        recipeData.imageUrl = data.imageUrl;
      }
      if (!recipeData.stepVideos) {
        recipeData.stepVideos = {};
      }

      set({ currentRecipe: recipeData });

    } catch (error: any) {
      console.error("[Store] Erro GenerateRecipe:", error);
      Alert.alert("Erro", error.message || "Falha ao criar receita.");
      throw error;
    } finally {
      set({ isGenerating: false });
    }
  },

  // --- 2. GERAR RECEITA DU CHEF (ATUALIZADO E SEGURO) ---
  generateDuChefRecipe: async (selectedTitle, preferences) => {
    // Define estado de loading
    set({ currentRecipe: null, isGenerating: true });

    try {
      // 1. Recuperação de Sessão
      let user = useAuthStore.getState().user;
      
      if (!user || !user.id) {
        console.log("[Store] Recuperando sessão para Du Chef...");
        await useAuthStore.getState().hydrate();
        user = useAuthStore.getState().user;
      }

      if (!user || !user.id) {
         throw new Error("Usuário não autenticado");
      }

      console.log(`[Store] Gerando prato selecionado: "${selectedTitle}"`);

      // 2. Chama o Service
      const data = await recipeService.generateFullDuChefRecipe(selectedTitle, preferences);

      // 3. Normalização
      const recipeData = data.recipe || data;

      if (!recipeData.title) {
         throw new Error("Dados inválidos recebidos do Personal Chef.");
      }

      if (data.imageUrl && !recipeData.imageUrl) recipeData.imageUrl = data.imageUrl;
      if (!recipeData.stepVideos) recipeData.stepVideos = {};

      // 4. Atualiza o Estado com Sucesso
      set({ currentRecipe: recipeData, isGenerating: false });

    } catch (error: any) {
      console.error("[Store] Erro Du Chef:", error);
      // NÃO usamos Alert aqui. A UI (du-chef.tsx) tratará o erro.
      set({ isGenerating: false });
      throw error;
    }
  },

  // --- 3. SALVAR / REMOVER (TOGGLE) ---
  toggleSaveCurrentRecipe: async () => {
    const { currentRecipe } = get();
    const user = useAuthStore.getState().user;

    if (!currentRecipe || !user) return false;

    try {
      const response = await fetch(API_SAVE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, recipe: currentRecipe }),
      });

      const data = await response.json();
      
      // Atualiza a lista em background
      get().fetchMyRecipes();
      
      return data.saved; // true = salvou, false = removeu
    } catch (error) {
      console.error("Erro ao salvar:", error);
      return false;
    }
  },

  // --- 4. LISTAR RECEITAS SALVAS ---
  fetchMyRecipes: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    set({ isLoadingList: true });
    try {
      const response = await fetch(`${API_LIST_URL}?userId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        set({ savedRecipes: data });
      }
    } catch (error) {
      console.error("Erro ao buscar lista:", error);
    } finally {
      set({ isLoadingList: false });
    }
  },

  // --- 5. GERAR VÍDEO DO PASSO ---
  generateStepVideo: async (index, stepText) => {
    const { currentRecipe } = get();
    const user = useAuthStore.getState().user;
    
    if (!currentRecipe || !user) return;

    set({ generatingStepIndex: index });

    try {
      const response = await fetch(API_VIDEO_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stepText,
          recipeTitle: currentRecipe.title,
          locale: 'pt',
          userId: user.id
        }),
      });

      if (!response.ok) throw new Error("Falha na API de vídeo");

      const data = await response.json();

      console.log(`[Store] URL do Vídeo passo ${index}:`, data.videoUrl ? "OK" : "Vazio");

      if (data.videoUrl) {
        const updatedVideos = { 
          ...currentRecipe.stepVideos, 
          [index]: data.videoUrl 
        };
        
        const updatedRecipe = { 
          ...currentRecipe, 
          stepVideos: updatedVideos 
        };
        
        set({ currentRecipe: updatedRecipe });
      }
    } catch (error) {
      console.error("Erro ao gerar vídeo:", error);
      throw error;
    } finally {
      set({ generatingStepIndex: null });
    }
  },

  // Helpers
  setCurrentRecipe: (recipe) => set({ currentRecipe: recipe }),
  clearRecipe: () => set({ currentRecipe: null })
}));