// ============================================================================
// PROMPT STORE - State Management
// ============================================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Prompt, SearchFilters, ScoredPrompt } from '@/types';
import { TAG_SYNONYMS } from '@/types';
import { extractAllWithAI, detectTypeFromContent } from '@/services/puterAI';

interface PromptState {
  prompts: Prompt[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  addPrompt: (content: string) => Promise<void>;
  updatePrompt: (id: string, updates: Partial<Prompt>) => Promise<void>;
  deletePrompt: (id: string) => Promise<void>;
  duplicatePrompt: (id: string) => Promise<void>;
  incrementUsage: (id: string) => void;
  
  // Search & Filter
  searchPrompts: (query: string, filters?: SearchFilters) => ScoredPrompt[];
  getPromptById: (id: string) => Prompt | undefined;
  getAllTags: () => string[];
  getPromptsByType: (type: string) => Prompt[];
  
  // Storage
  loadFromStorage: () => Promise<void>;
  saveToStorage: () => Promise<void>;
  exportData: () => string;
  importData: (json: string) => Promise<void>;
}

function generateUniqueId(): string {
  return 'prompt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function migrateLegacyPrompt(prompt: any): Prompt {
  if (!prompt.schemaVersion || prompt.schemaVersion < 2) {
    return {
      ...prompt,
      schemaVersion: 2,
      metadata: {
        type: prompt.type || detectTypeFromContent(prompt.content) || 'uncategorized',
        subtype: prompt.subtype || 'other',
        tags: prompt.tags || [],
        confidence: 1.0,
        attributes: prompt.attributes || {}
      }
    };
  }
  return prompt;
}

function scorePrompt(prompt: Prompt, query: string): number {
  if (!query || query.trim() === '') {
    return 1;
  }

  const q = query.toLowerCase().trim();
  const words = q.split(/\s+/).filter(w => w.length > 0);

  let score = 0;

  // Title match (weight: 3)
  const titleLower = prompt.title.toLowerCase();
  words.forEach(word => {
    if (titleLower.includes(word)) {
      score += 3;
    }
  });

  // Tags match (weight: 2)
  const tags = prompt.metadata?.tags || [];
  tags.forEach(tag => {
    words.forEach(word => {
      if (tag.toLowerCase().includes(word)) {
        score += 2;
      }
    });
  });

  // Description match (weight: 1)
  const descLower = (prompt.description || '').toLowerCase();
  words.forEach(word => {
    if (descLower.includes(word)) {
      score += 1;
    }
  });

  // Content match (weight: 1)
  const contentLower = prompt.content.toLowerCase();
  words.forEach(word => {
    if (contentLower.includes(word)) {
      score += 1;
    }
  });

  // Expand with synonyms
  words.forEach(word => {
    Object.entries(TAG_SYNONYMS).forEach(([canonical, synonyms]) => {
      if (synonyms.includes(word) && titleLower.includes(canonical)) {
        score += 2;
      }
    });
  });

  return score;
}

export const usePromptStore = create<PromptState>()(
  persist(
    (set, get) => ({
      prompts: [],
      isLoading: false,
      error: null,

      addPrompt: async (content: string) => {
        set({ isLoading: true, error: null });
        try {
          const extracted = await extractAllWithAI(content);
          
          const newPrompt: Prompt = {
            schemaVersion: 2,
            id: generateUniqueId(),
            title: extracted.title,
            description: extracted.description,
            content,
            metadata: extracted.metadata,
            created: new Date().toISOString(),
            updated: new Date().toISOString(),
            usage_count: 0
          };

          set(state => ({
            prompts: [newPrompt, ...state.prompts],
            isLoading: false
          }));

          // Save to Puter.kv if available
          try {
            // @ts-ignore
            if (typeof puter !== 'undefined' && puter.kv?.set) {
              // @ts-ignore
              await puter.kv.set('prompts', JSON.stringify(get().prompts));
            }
          } catch (e) {
            console.warn('Failed to save to Puter.kv:', e);
          }
        } catch (error) {
          set({ error: 'Failed to extract metadata', isLoading: false });
          throw error;
        }
      },

      updatePrompt: async (id: string, updates: Partial<Prompt>) => {
        set(state => ({
          prompts: state.prompts.map(p => 
            p.id === id 
              ? { ...p, ...updates, updated: new Date().toISOString() }
              : p
          )
        }));
        await get().saveToStorage();
      },

      deletePrompt: async (id: string) => {
        set(state => ({
          prompts: state.prompts.filter(p => p.id !== id)
        }));
        await get().saveToStorage();
      },

      duplicatePrompt: async (id: string) => {
        const prompt = get().prompts.find(p => p.id === id);
        if (!prompt) return;

        const duplicated: Prompt = {
          ...prompt,
          id: generateUniqueId(),
          title: prompt.title + ' (Copy)',
          created: new Date().toISOString(),
          updated: new Date().toISOString(),
          usage_count: 0
        };

        set(state => ({
          prompts: [duplicated, ...state.prompts]
        }));
        await get().saveToStorage();
      },

      incrementUsage: (id: string) => {
        set(state => ({
          prompts: state.prompts.map(p => 
            p.id === id 
              ? { ...p, usage_count: p.usage_count + 1 }
              : p
          )
        }));
      },

      searchPrompts: (query: string, filters?: SearchFilters): ScoredPrompt[] => {
        let results = get().prompts.map(p => ({ ...p, score: scorePrompt(p, query) }));

        // Apply filters
        if (filters?.type) {
          results = results.filter(p => p.metadata?.type === filters.type);
        }
        if (filters?.subtype) {
          results = results.filter(p => p.metadata?.subtype === filters.subtype);
        }
        if (filters?.tags && filters.tags.length > 0) {
          results = results.filter(p => {
            const promptTags = p.metadata?.tags || [];
            return filters.tags!.some(tag => promptTags.includes(tag));
          });
        }
        if (filters?.advanced) {
          const adv = filters.advanced;
          if (adv.angle) {
            results = results.filter(p => p.metadata?.attributes?.angle === adv.angle);
          }
          if (adv.shot_type) {
            results = results.filter(p => p.metadata?.attributes?.shot_type === adv.shot_type);
          }
          if (adv.lens) {
            results = results.filter(p => p.metadata?.attributes?.lens === adv.lens);
          }
          if (adv.pose) {
            results = results.filter(p => {
              const promptPose = p.metadata?.attributes?.pose || '';
              return promptPose.toLowerCase().includes(adv.pose!.toLowerCase());
            });
          }
          if (adv.location) {
            results = results.filter(p => {
              const promptLocation = p.metadata?.attributes?.location || '';
              return promptLocation.toLowerCase().includes(adv.location!.toLowerCase());
            });
          }
          if (adv.lighting) {
            results = results.filter(p => p.metadata?.attributes?.lighting === adv.lighting);
          }
        }

        // Filter out zero scores if there's a query
        if (query && query.trim() !== '') {
          results = results.filter(r => r.score > 0);
        }

        // Sort by score DESC
        results.sort((a, b) => b.score - a.score);

        return results;
      },

      getPromptById: (id: string) => {
        return get().prompts.find(p => p.id === id);
      },

      getAllTags: (): string[] => {
        const allTags = new Set<string>();
        get().prompts.forEach(p => {
          (p.metadata?.tags || []).forEach(tag => allTags.add(tag));
        });
        return Array.from(allTags).sort();
      },

      getPromptsByType: (type: string): Prompt[] => {
        return get().prompts.filter(p => p.metadata?.type === type);
      },

      loadFromStorage: async () => {
        try {
          // @ts-ignore
          if (typeof puter !== 'undefined' && puter.kv?.get) {
            // @ts-ignore
            const stored = await puter.kv.get('prompts');
            if (stored) {
              const parsed = JSON.parse(stored).map(migrateLegacyPrompt);
              set({ prompts: parsed });
            }
          }
        } catch (e) {
          console.warn('Failed to load from Puter.kv:', e);
        }
      },

      saveToStorage: async () => {
        try {
          // @ts-ignore
          if (typeof puter !== 'undefined' && puter.kv?.set) {
            // @ts-ignore
            await puter.kv.set('prompts', JSON.stringify(get().prompts));
          }
        } catch (e) {
          console.warn('Failed to save to Puter.kv:', e);
        }
      },

      exportData: (): string => {
        return JSON.stringify(get().prompts, null, 2);
      },

      importData: async (json: string) => {
        try {
          const parsed = JSON.parse(json).map(migrateLegacyPrompt);
          set({ prompts: parsed });
          await get().saveToStorage();
        } catch (e) {
          throw new Error('Invalid JSON format');
        }
      }
    }),
    {
      name: 'promptmind-storage',
      partialize: (state) => ({ prompts: state.prompts })
    }
  )
);
