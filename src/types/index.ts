// ============================================================================
// TYPES & INTERFACES - PromptMind AI
// ============================================================================

export type PromptType = 'image' | 'video' | 'code' | 'uncategorized';

export type ImageSubtype = 'portrait' | 'landscape' | 'product' | 'macro' | 'street' | 'abstract' | 'other';
export type VideoSubtype = 'interview' | 'b-roll' | 'timelapse' | 'tutorial' | 'documentary' | 'other';
export type CodeSubtype = 'function' | 'class' | 'api' | 'script' | 'component' | 'query' | 'other';
export type Subtype = ImageSubtype | VideoSubtype | CodeSubtype | 'other' | 'unknown';

export interface PromptMetadata {
  type: PromptType;
  subtype: Subtype;
  confidence: number;
  tags: string[];
  attributes: Record<string, string>;
}

export interface Prompt {
  schemaVersion: number;
  id: string;
  title: string;
  description: string;
  content: string;
  metadata: PromptMetadata;
  created: string;
  updated: string;
  usage_count: number;
}

export interface ExtractedData {
  title: string;
  description: string;
  metadata: PromptMetadata;
}

export interface SearchFilters {
  type?: PromptType;
  subtype?: string;
  tags?: string[];
  advanced?: AdvancedFilters;
}

export interface AdvancedFilters {
  angle?: string;
  shot_type?: string;
  lens?: string;
  pose?: string;
  orientation?: string;
  framing?: string;
  location?: string;
  lighting?: string;
  time?: string;
}

export interface ScoredPrompt extends Prompt {
  score: number;
}

// Constants
export const SUBTYPE_REGISTRY: Record<PromptType, string[]> = {
  image: ['portrait', 'landscape', 'product', 'macro', 'street', 'abstract', 'other'],
  video: ['interview', 'b-roll', 'timelapse', 'tutorial', 'documentary', 'other'],
  code: ['function', 'class', 'api', 'script', 'component', 'query', 'other'],
  uncategorized: ['other']
};

export const TAG_SYNONYMS: Record<string, string[]> = {
  portrait: ['portrait', 'headshot', 'face', 'person'],
  landscape: ['landscape', 'scenery', 'nature', 'outdoor'],
  code: ['code', 'programming', 'script', 'development']
};

export const TYPE_ICONS: Record<PromptType, string> = {
  image: '📷',
  video: '🎬',
  code: '💻',
  uncategorized: '❓'
};

export const TYPE_COLORS: Record<PromptType, { bg: string; text: string; border: string }> = {
  image: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
  video: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30' },
  code: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  uncategorized: { bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/30' }
};
