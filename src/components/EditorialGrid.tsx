// ============================================================================
// EDITORIAL GRID - Asymmetric bento-style layout
// ============================================================================

import { motion } from 'framer-motion';
import type { Prompt } from '@/types';

export type CardSize = 'featured' | 'standard' | 'compact';

interface EditorialGridProps {
  prompts: Prompt[];
  renderItem: (prompt: Prompt, size: CardSize, index: number) => React.ReactNode;
  className?: string;
}

/**
 * Determines card size based on prompt importance
 * - Featured: High usage (5+) OR high confidence (0.9+)
 * - Standard: Medium usage (2-4) OR medium confidence (0.7-0.9)
 * - Compact: Everything else
 */
function getCardSize(prompt: Prompt, index: number): CardSize {
  // First card is always featured if there are prompts
  if (index === 0 && prompt.usage_count >= 2) {
    return 'featured';
  }

  const usage = prompt.usage_count;
  const confidence = prompt.metadata?.confidence || 0;

  // Featured criteria
  if (usage >= 5 || confidence >= 0.9) {
    return 'featured';
  }

  // Standard criteria
  if (usage >= 2 || confidence >= 0.7) {
    return 'standard';
  }

  // Compact for everything else
  return 'compact';
}

/**
 * Gets grid column span based on card size and responsive breakpoint
 */
export function getGridClasses(size: CardSize): string {
  switch (size) {
    case 'featured':
      return 'col-span-4 lg:col-span-6 xl:col-span-6';
    case 'standard':
      return 'col-span-4 lg:col-span-4 xl:col-span-4';
    case 'compact':
      return 'col-span-2 lg:col-span-4 xl:col-span-3';
    default:
      return 'col-span-4 lg:col-span-4 xl:col-span-4';
  }
}

export function EditorialGrid({ prompts, renderItem, className = '' }: EditorialGridProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  return (
    <motion.div
      className={`grid grid-cols-4 lg:grid-cols-8 xl:grid-cols-12 gap-3 lg:gap-4 ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {prompts.map((prompt, index) => {
        const size = getCardSize(prompt, index);
        return (
          <motion.div
            key={prompt.id}
            className={getGridClasses(size)}
            variants={{
              hidden: { opacity: 0, y: 30, scale: 0.95 },
              show: {
                opacity: 1,
                y: 0,
                scale: 1,
                transition: {
                  duration: 0.5,
                  ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
                },
              },
            }}
          >
            {renderItem(prompt, size, index)}
          </motion.div>
        );
      })}
    </motion.div>
  );
}

/**
 * Simplified grid for empty/filtered states
 */
export function SimpleGrid({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
      {children}
    </div>
  );
}
