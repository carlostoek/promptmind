// ============================================================================
// ENVIRONMENT CONFIGURATION
// ============================================================================

export const env = {
  OPENROUTER_API_KEY: import.meta.env.VITE_OPENROUTER_API_KEY || '',
  OPENROUTER_MODEL: import.meta.env.VITE_OPENROUTER_MODEL || 'openrouter/free',
} as const;

// Validation
export function validateEnv(): void {
  if (!env.OPENROUTER_API_KEY) {
    console.warn('[Env] OPENROUTER_API_KEY not configured. AI features will not work.');
  }
}
