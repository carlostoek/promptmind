// ============================================================================
// HEADER COMPONENT
// ============================================================================

import { motion } from 'framer-motion';
import { Sparkles, Download, Upload, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HeaderProps {
  onExport: () => void;
  onImport: () => void;
  onClearAll: () => void;
  promptCount: number;
}

export function Header({ onExport, onImport, onClearAll, promptCount }: HeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800"
    >
      <div className="max-w-3xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white leading-tight">PromptMind</h1>
              <p className="text-xs text-zinc-500">AI-Powered Prompt Manager</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800">
                <DropdownMenuItem onClick={onExport} className="text-zinc-300 focus:text-white focus:bg-zinc-800">
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onImport} className="text-zinc-300 focus:text-white focus:bg-zinc-800">
                  <Upload className="w-4 h-4 mr-2" />
                  Import Data
                </DropdownMenuItem>
                {promptCount > 0 && (
                  <DropdownMenuItem 
                    onClick={onClearAll} 
                    className="text-rose-400 focus:text-rose-400 focus:bg-rose-500/10"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear All ({promptCount})
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
