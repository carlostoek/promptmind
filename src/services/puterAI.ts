// ============================================================================
// PUTER AI SERVICE - Metadata Extraction
// ============================================================================

import type { PromptMetadata, ExtractedData } from '@/types';
import { SUBTYPE_REGISTRY } from '@/types';

// AI Cache for optimization
const AI_CACHE = new Map<string, ExtractedData>();

function hashContent(content: string): string {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString();
}

function normalizeTag(tag: string): string {
  return tag.toLowerCase().trim();
}

function normalizeTags(tags: string[] | string): string[] {
  if (typeof tags === 'string') {
    tags = tags.split(',');
  }
  return tags
    .map(tag => normalizeTag(tag))
    .filter(tag => tag.length > 0)
    .slice(0, 8);
}

function createFallbackMetadata(reason: string): PromptMetadata {
  console.warn('[PuterAI] Using fallback metadata, reason:', reason);
  return {
    type: 'uncategorized',
    subtype: 'unknown',
    confidence: 0,
    tags: [],
    attributes: {},
  };
}

function normalizeAIResponse(raw: string): Partial<ExtractedData> {
  let parsed: any;

  try {
    const cleaned = raw.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    parsed = JSON.parse(cleaned);
  } catch (e) {
    console.warn('[PuterAI] JSON parse failed:', e);
    return {
      title: '',
      description: '',
      metadata: createFallbackMetadata('parse_error')
    };
  }

  const normalized: Partial<ExtractedData> = {
    title: parsed.title || '',
    description: parsed.description || '',
    metadata: {
      type: (parsed.type || 'uncategorized').toLowerCase(),
      subtype: (parsed.subtype || 'other').toLowerCase().trim(),
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.5,
      tags: normalizeTags(parsed.tags || []),
      attributes: parsed.attributes || {}
    }
  };

  // Validate type
  const validTypes = ['image', 'video', 'code', 'uncategorized'];
  if (!validTypes.includes(normalized.metadata!.type)) {
    normalized.metadata!.type = 'uncategorized';
  }

  // Clean attributes
  Object.keys(normalized.metadata!.attributes).forEach(key => {
    if (normalized.metadata!.attributes[key] === null || normalized.metadata!.attributes[key] === undefined) {
      delete normalized.metadata!.attributes[key];
    }
  });

  return normalized;
}

function validateAndRepair(metadata: PromptMetadata): PromptMetadata {
  const repaired = { ...metadata };
  const validTypes = ['image', 'video', 'code', 'uncategorized'] as const;

  // Enforce type validity
  if (!validTypes.includes(repaired.type as any)) {
    repaired.type = 'uncategorized';
  }

  // Enforce subtype against registry
  const validSubtypes = SUBTYPE_REGISTRY[repaired.type] || SUBTYPE_REGISTRY.code;
  if (!validSubtypes.includes(repaired.subtype)) {
    repaired.subtype = 'other';
  }

  // Enforce tags constraints
  if (!Array.isArray(repaired.tags)) {
    repaired.tags = [];
  }
  repaired.tags = repaired.tags.slice(0, 8);

  // Enforce confidence range
  if (typeof repaired.confidence !== 'number' || repaired.confidence < 0 || repaired.confidence > 1) {
    repaired.confidence = 0.5;
  }

  // Ensure attributes is object
  if (typeof repaired.attributes !== 'object' || repaired.attributes === null) {
    repaired.attributes = {};
  }

  return repaired;
}

// ============================================================================
// MAIN EXTRACTION FUNCTION
// ============================================================================

export async function extractAllWithAI(content: string): Promise<ExtractedData> {
  console.log('[PuterAI] Starting extraction for:', content.substring(0, 50) + '...');

  // Check cache first
  const cacheKey = hashContent(content);
  if (AI_CACHE.has(cacheKey)) {
    console.log('[PuterAI] Cache hit');
    return AI_CACHE.get(cacheKey)!;
  }

  const systemPrompt = `You are a metadata extraction AI. Analyze this prompt and return ONLY valid JSON.
NO markdown, NO explanations, NO code blocks. Just raw JSON.

Return this exact structure:
{
  "title": "A short, descriptive title (3-6 words)",
  "description": "A one-sentence description (10-20 words)",
  "type": "image|video|code|uncategorized",
  "subtype": "specific subtype or 'other'",
  "confidence": 0.0-1.0,
  "tags": ["tag1", "tag2", "tag3"],
  "attributes": {
    "key": "value"
  }
}

Guidelines:
- For image prompts: detect photography style, lighting, camera settings, subject
- For video prompts: detect video type, scene description, camera movement
- For code prompts: detect programming language, function type, purpose
- Tags should be relevant keywords (max 8)
- Confidence reflects how certain you are about the classification

Prompt to analyze:
${content}

Remember: Return ONLY JSON, no other text.`;

  try {
    // @ts-ignore - Puter is loaded globally
    if (typeof puter === 'undefined' || !puter.ai?.chat) {
      throw new Error('Puter AI not available');
    }

    console.log('[PuterAI] Calling Puter.AI...');
    // @ts-ignore
    const response = await puter.ai.chat(systemPrompt);

    const responseText = typeof response === 'object'
      ? (response.message?.content || response.content || JSON.stringify(response))
      : response;

    console.log('[PuterAI] Response received:', responseText.substring(0, 200));

    const normalized = normalizeAIResponse(responseText);
    
    const result: ExtractedData = {
      title: normalized.title || content.substring(0, 50) + '...',
      description: normalized.description || '',
      metadata: validateAndRepair(normalized.metadata!)
    };

    // Cache the result
    AI_CACHE.set(cacheKey, result);
    console.log('[PuterAI] Extraction successful:', result);

    return result;
  } catch (e) {
    console.error('[PuterAI] ERROR:', e);
    return {
      title: content.substring(0, 50) + '...',
      description: '',
      metadata: createFallbackMetadata('extraction_failed')
    };
  }
}

export function getConfidenceLevel(confidence: number): 'low' | 'medium' | 'high' {
  if (confidence < 0.4) return 'low';
  if (confidence < 0.7) return 'medium';
  return 'high';
}

export function needsReview(metadata: PromptMetadata): boolean {
  return metadata.confidence < 0.4;
}

export function detectTypeFromContent(content: string): 'image' | 'video' | 'code' | 'uncategorized' {
  const lower = content.toLowerCase();
  if (lower.includes('--ar') || lower.includes('photograph') || lower.includes('shot of') || lower.includes('portrait') || lower.includes('landscape')) {
    return 'image';
  }
  if (lower.includes('function') || lower.includes('```') || lower.includes('const ') || lower.includes('import ') || lower.includes('class ')) {
    return 'code';
  }
  if (lower.includes('video') || lower.includes('footage') || lower.includes('scene') || lower.includes('timelapse')) {
    return 'video';
  }
  return 'uncategorized';
}

// Legacy function for backward compatibility
export async function extractMetadataWithCache(content: string): Promise<PromptMetadata> {
  const extracted = await extractAllWithAI(content);
  return extracted.metadata;
}
