import { Storage } from '@/lib/storage';

// URL DO SEU BACKEND (Ajuste conforme necessário: localhost, IP da rede ou Vercel)
const API_BASE_URL = "https://lumieres-mu.vercel.app/api/mobile";

// --- TIPAGENS ---
export interface RecipeSummary {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  difficulty?: string;
  prepTime?: string;
  savedAt: string;
  category?: string;
  ingredients?: string[];
  instructions?: string[];
}

export interface ChefTip {
  id: string;
  title: string;
  content: string;
  icon: string;
}

export interface DuChefPreferences {
  mode: 'individual' | 'group';
  guests: number;
  budget: 'cheap' | 'medium' | 'expensive';
  restrictions: string[];
  goal?: string;
  cuisine: string[];
}

// ============================================================================
// FUNÇÕES REAIS (API)
// ============================================================================

// 1. Minhas Receitas (Home)
export const fetchMyRecipes = async (): Promise<RecipeSummary[]> => {
  try {
    const sessionStr = await Storage.getItem('user_session');
    if (!sessionStr) throw new Error("Usuário não logado");
    
    const user = JSON.parse(sessionStr);

    const response = await fetch(`${API_BASE_URL}/recipe/list?userId=${user.id}`);
    
    if (!response.ok) {
        throw new Error('Erro ao buscar receitas');
    }
    
    return await response.json();
  } catch (error) {
    console.error("Service Error (MyRecipes):", error);
    throw error;
  }
};

// 2. Consulta Du Chef (Passo 1 - Lista de Ideias)
export const askDuChef = async (prefs: DuChefPreferences) => {
  try {
    const response = await fetch(`${API_BASE_URL}/ai/personal-chef/consult`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...prefs, locale: 'pt' }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Erro na consulta');
    
    return data.suggestions; 
  } catch (error) {
    console.error("Service Consult Error:", error);
    throw error;
  }
};

// 3. Geração Du Chef (Passo 2 - Receita Completa + Imagem)
export const generateFullDuChefRecipe = async (selectedTitle: string, originalPrefs: DuChefPreferences) => {
  try {
    const sessionStr = await Storage.getItem('user_session');
    
    if (!sessionStr) throw new Error("Usuário não logado");
    
    let user;
    try {
        user = JSON.parse(sessionStr);
    } catch (e) {
        throw new Error("Sessão inválida. Faça login novamente.");
    }
    
    console.log("[Service] Gerando receita para User ID:", user.id);

    // Aumente o timeout do fetch se possível, mas o Vercel tem limite fixo
    const response = await fetch(`${API_BASE_URL}/ai/generate`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({
        selectedTitle,
        contextData: originalPrefs,
        locale: 'pt',
        userId: user.id,
        userName: user.name
      }),
    });

    // --- CORREÇÃO DE DEBUG ---
    // Lemos o texto bruto primeiro para ver se é um erro HTML (Timeout) ou vazio
    const textResponse = await response.text();
    
    console.log("[Service] Resposta Bruta (primeiros 100 chars):", textResponse.substring(0, 100));

    if (!textResponse) {
       throw new Error("O servidor retornou uma resposta vazia (Provável Timeout ou Limite de Tamanho).");
    }

    // Tenta parsear o JSON manualmente
    let data;
    try {
        data = JSON.parse(textResponse);
    } catch (e) {
        // Se falhar, verifica se é erro de HTML (comum no Vercel 504/500)
        if (textResponse.includes("<!DOCTYPE html>")) {
            throw new Error("Erro no Servidor (Timeout ou 500). Tente novamente.");
        }
        throw new Error("Resposta inválida do servidor: " + e);
    }

    if (!response.ok) {
        throw new Error(data.error || `Erro HTTP ${response.status}`);
    }

    return data; 

  } catch (error) {
    console.error("Service Generate Error:", error);
    throw error;
  }
};

// ============================================================================
// MOCKS (HOME PAGE)
// ============================================================================

export const fetchCommunityRecipesMock = async (): Promise<RecipeSummary[]> => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  return [
    {
      id: 'mock1',
      title: 'Risoto de Açafrão com Vieiras',
      description: 'Um clássico italiano com um toque sofisticado do mar.',
      imageUrl: 'https://images.unsplash.com/photo-1595295333158-4742f28fbd85?q=80&w=800&auto=format&fit=crop',
      difficulty: 'Intermediário',
      prepTime: '45 min',
      savedAt: new Date().toISOString(),
    },
    {
      id: 'mock2',
      title: 'Bife Wellington Desconstruído',
      description: 'Uma abordagem moderna para um prato tradicional.',
      imageUrl: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?q=80&w=800&auto=format&fit=crop',
      difficulty: 'Chef',
      prepTime: '1h 20m',
      savedAt: new Date().toISOString(),
    },
     {
      id: 'mock3',
      title: 'Tarte Tatin de Pera',
      imageUrl: 'https://images.unsplash.com/photo-1535920527002-b35e96722eb9?q=80&w=800&auto=format&fit=crop',
      difficulty: 'Simples',
      prepTime: '40m',
      savedAt: new Date().toISOString(),
    },
  ];
};

export const fetchChefTipsMock = async (): Promise<ChefTip[]> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  return [
    { id: 'tip1', title: 'Mise en Place', content: 'Organize todos os ingredientes antes de começar.', icon: 'ChefHat' },
    { id: 'tip2', title: 'Selar Carnes', content: 'A frigideira deve estar fumegando para a crosta perfeita.', icon: 'Flame' },
    { id: 'tip3', title: 'Descanso', content: 'Deixe carnes descansarem 5 min após assar.', icon: 'Clock' },
  ];
};