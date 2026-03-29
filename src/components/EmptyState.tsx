// ============================================================================
// EMPTY STATE COMPONENT
// ============================================================================

import { motion } from 'framer-motion';
import { Sparkles, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  onCreate: () => void;
  hasFilters?: boolean;
  onClearFilters?: () => void;
}

export function EmptyState({ onCreate, hasFilters, onClearFilters }: EmptyStateProps) {
  if (hasFilters) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-12 text-center"
      >
        <div className="w-16 h-16 rounded-full bg-zinc-800/50 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-white mb-2">No matches found</h3>
        <p className="text-sm text-zinc-500 mb-4 max-w-xs">
          Try adjusting your search or filters to find what you're looking for.
        </p>
        {onClearFilters && (
          <Button variant="outline" onClick={onClearFilters} className="border-zinc-700 text-zinc-300">
            Clear Filters
          </Button>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-12 text-center"
    >
      <motion.div
        animate={{ 
          rotate: [0, 5, -5, 0],
          scale: [1, 1.05, 1]
        }}
        transition={{ 
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center mb-6 border border-violet-500/20"
      >
        <Sparkles className="w-10 h-10 text-violet-400" />
      </motion.div>
      
      <h3 className="text-xl font-semibold text-white mb-2">
        Welcome to PromptMind
      </h3>
      <p className="text-sm text-zinc-500 mb-6 max-w-xs leading-relaxed">
        Your AI-powered prompt manager. Add your first prompt and let AI automatically categorize and tag it.
      </p>
      
      <Button 
        onClick={onCreate}
        className="bg-violet-600 hover:bg-violet-700 text-white px-6"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Your First Prompt
      </Button>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <FeatureBadge icon="🤖" text="AI Categorization" />
        <FeatureBadge icon="🏷️" text="Auto Tagging" />
        <FeatureBadge icon="🔍" text="Smart Search" />
      </div>
    </motion.div>
  );
}

function FeatureBadge({ icon, text }: { icon: string; text: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900/80 border border-zinc-800 rounded-full text-xs text-zinc-400">
      <span>{icon}</span>
      {text}
    </span>
  );
}
