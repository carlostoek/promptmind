// ============================================================================
// STATS BAR COMPONENT
// ============================================================================

import { motion } from 'framer-motion';
import { TYPE_ICONS } from '@/types';
import type { PromptType } from '@/types';

interface StatsBarProps {
  totalCount: number;
  typeCounts: Record<string, number>;
}

export function StatsBar({ totalCount, typeCounts }: StatsBarProps) {
  const types: PromptType[] = ['image', 'video', 'code', 'uncategorized'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide"
    >
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900/80 border border-zinc-800 rounded-full whitespace-nowrap">
        <span className="text-sm font-semibold text-white">{totalCount}</span>
        <span className="text-xs text-zinc-500">total</span>
      </div>

      {types.map((type) => {
        const count = typeCounts[type] || 0;
        if (count === 0) return null;

        return (
          <div
            key={type}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900/80 border border-zinc-800 rounded-full whitespace-nowrap"
          >
            <span>{TYPE_ICONS[type]}</span>
            <span className="text-sm font-medium text-zinc-300">{count}</span>
          </div>
        );
      })}
    </motion.div>
  );
}
