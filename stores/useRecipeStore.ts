import { create } from 'zustand';
import { useAuthStore } from './useAuthStore';

// ------------------------------------------------------------------
// CONFIGURAÇÃO DE API
// ------------------------------------------------------------------
const API_BASE = "https://lumieres-mu.vercel.app/api/mobile";
const API_GENERATE_URL = `${API_BASE}/ai/generate`;
const API_SAVE_URL = `${API_BASE}/recipe/save`;
const API_LIST_URL = `${API_BASE}/recipe/list`;
const API_VIDEO_URL = `${API_BASE}/ai/video`; // Rota de geração de vídeo

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
      const user = useAuthStore.getState().user;
      
      const response = await fetch(API_GENERATE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...formData, 
          userId: user?.id, 
          userName: user?.name, 
          locale: 'pt' 
        }),
      });

      if (!response.ok) throw new Error(`Erro: ${response.status}`);
      
      const data = await response.json();
      
      // Normalização dos dados vindos do N8N/API
      const recipeData = data.recipe || data;
      if (data.imageUrl && !recipeData.imageUrl) {
        recipeData.imageUrl = data.imageUrl;
      }
      
      // Inicializa stepVideos vazio se não vier
      if (!recipeData.stepVideos) {
        recipeData.stepVideos = {};
      }

      set({ currentRecipe: recipeData });
    } catch (error) {
      console.error("Erro na geração da receita:", error);
      throw error;
    } finally {
      set({ isGenerating: false });
    }
  },

  // --- 2. SALVAR / REMOVER (TOGGLE) ---
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
      
      // Atualiza a lista de salvos em background para manter consistência
      get().fetchMyRecipes();
      
      return data.saved; // Retorna true se salvou, false se removeu
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

      console.log(`[Store] URL do Vídeo recebida para passo ${index}:`, data.videoUrl);

      if (data.videoUrl) {
        // Atualiza imutavelmente o mapa de vídeos
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