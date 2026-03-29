// ============================================================================
// FLOATING ACTION BUTTON
// ============================================================================

import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FloatingActionButtonProps {
  onClick: () => void;
}

export function FloatingActionButton({ onClick }: FloatingActionButtonProps) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-6 right-6 z-50"
    >
      <Button
        onClick={onClick}
        size="lg"
        className="w-14 h-14 rounded-full bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-600/25"
      >
        <Plus className="w-6 h-6" />
      </Button>
    </motion.div>
  );
}
