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
  stepVideos?: Record<number, string>; 
}

interface RecipeState {
  currentRecipe: Recipe | null;
  savedRecipes: Recipe[];
  isGenerating: boolean;     
  isLoadingList: boolean;    
  generatingStepIndex: number | null; 

  // Actions
  generateRecipe: (data: any) => Promise<void>;
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

  // --- 1. GERAR RECEITA COMPLETA ---
  generateRecipe: async (formData) => {
    set({ isGenerating: true });
    try {
      // 1. Tenta pegar o usuário da memória RAM
      let user = useAuthStore.getState().user;

      // [AUTO-RECUPERAÇÃO] 
      // Se user for nulo na memória, tenta forçar uma leitura do disco
      if (!user || !user.id) {
        console.log("[RecipeStore] Usuário não encontrado na RAM. Tentando recuperar do disco...");
        await useAuthStore.getState().hydrate();
        // Atualiza a variável local após o hydrate
        user = useAuthStore.getState().user;
      }

      // Se AINDA assim for nulo, bloqueia e avisa o usuário
      if (!user || !user.id) {
        console.error("[RecipeStore] Falha crítica: ID do usuário não encontrado.");
        Alert.alert("Sessão Expirada", "Não foi possível identificar seu usuário. Por favor, faça login novamente.");
        set({ isGenerating: false });
        return;
      }
      
      console.log(`[RecipeStore] Enviando requisição para User ID: ${user.id}`);

      const response = await fetch(API_GENERATE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...formData, 
          userId: user.id, // Garante envio do ID recuperado
          userName: user.name, 
          locale: 'pt' 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erro: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Normalização dos dados vindos do N8N/API
      const recipeData = data.recipe || data;
      if (data.imageUrl && !recipeData.imageUrl) {
        recipeData.imageUrl = data.imageUrl;
      }
      
      if (!recipeData.stepVideos) {
        recipeData.stepVideos = {};
      }

      set({ currentRecipe: recipeData });
    } catch (error: any) {
      console.error("[RecipeStore] Erro na geração:", error);
      Alert.alert("Erro", error.message || "Falha ao gerar receita.");
      throw error;
    } finally {
      set({ isGenerating: false });
    }
  },

  // --- 2. SALVAR / REMOVER (TOGGLE) ---
  toggleSaveCurrentRecipe: async () => {
    const { currentRecipe } = get();
    const user = useAuthStore.getState().user; // Pode aplicar a mesma lógica de recuperação aqui se desejar

    if (!currentRecipe || !user) return false;

    try {
      const response = await fetch(API_SAVE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, recipe: currentRecipe }),
      });

      const data = await response.json();
      
      // Atualiza a lista de salvos em background
      get().fetchMyRecipes();
      
      return data.saved; 
    } catch (error) {
      console.error("Erro ao salvar:", error);
      return false;
    }
  },

  // --- 3. LISTAR RECEITAS SALVAS ---
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

  // --- 4. GERAR VÍDEO DO PASSO ---
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