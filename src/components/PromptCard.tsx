// ============================================================================
// PROMPT CARD COMPONENT
// ============================================================================

import { useState } from 'react';
import { Copy, Edit2, Trash2, Sparkles, TrendingUp, Expand, Minimize2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { Prompt, PromptType } from '@/types';
import { TYPE_COLORS, TYPE_ICONS } from '@/types';
import { getConfidenceLevel } from '@/services/openrouterAI';

interface PromptCardProps {
  prompt: Prompt;
  onCopy: (id: string) => void;
  onEdit: (prompt: Prompt) => void;
  onDelete: (id: string) => void;
  onTagClick?: (tag: string) => void;
  score?: number;
}

export function PromptCard({ prompt, onCopy, onEdit, onDelete, onTagClick, score }: PromptCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const type = prompt.metadata?.type || 'uncategorized';
  const colors = TYPE_COLORS[type as PromptType];
  const icon = TYPE_ICONS[type as PromptType];
  const confidenceLevel = getConfidenceLevel(prompt.metadata?.confidence || 0);

  const handleTagClick = (e: React.MouseEvent, tag: string) => {
    e.stopPropagation();
    onTagClick?.(tag);
  };

  const isLongContent = prompt.content.length > 150;

  return (
    <div className="transition-all duration-200 hover:scale-[1.01]">
      <Card className="group relative overflow-hidden bg-zinc-900/80 border-zinc-800 hover:border-zinc-700 transition-all">
        {/* Confidence Indicator */}
        <div className={`absolute top-0 left-0 w-1 h-full ${
          confidenceLevel === 'high' ? 'bg-emerald-500' :
          confidenceLevel === 'medium' ? 'bg-amber-500' : 'bg-rose-500'
        }`} />

        <CardContent className="p-4 pl-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary" className={`${colors.bg} ${colors.text} border ${colors.border}`}>
                <span className="mr-1">{icon}</span>
                {type}
              </Badge>
              {prompt.metadata?.subtype && prompt.metadata.subtype !== 'other' && (
                <Badge variant="outline" className="text-zinc-400 border-zinc-700">
                  {prompt.metadata.subtype}
                </Badge>
              )}
              {score !== undefined && score > 0 && (
                <Badge variant="secondary" className="bg-blue-500/10 text-blue-400">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {score}
                </Badge>
              )}
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-zinc-400 hover:text-white"
                onClick={() => onCopy(prompt.id)}
              >
                <Copy className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-zinc-400 hover:text-white"
                onClick={() => onEdit(prompt)}
              >
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-zinc-400 hover:text-rose-400"
                onClick={() => onDelete(prompt.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Title & Description */}
          <h3 className="text-lg font-semibold text-white mb-1 line-clamp-1">
            {prompt.title}
          </h3>
          {prompt.description && (
            <p className="text-sm text-zinc-400 mb-3 line-clamp-2">
              {prompt.description}
            </p>
          )}

          {/* Content Preview - Expandable */}
          <div
            className={`bg-zinc-950/50 rounded-lg p-3 mb-3 relative group/content transition-all ${
              isExpanded ? 'max-h-[400px] overflow-y-auto' : 'max-h-32'
            }`}
          >
            <pre className="text-sm text-zinc-300 font-mono whitespace-pre-wrap break-words">
              {isExpanded ? prompt.content : prompt.content.slice(0, 200)}
              {!isExpanded && prompt.content.length > 200 && '...'}
            </pre>

            {/* Expand/Collapse Button */}
            {isLongContent && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="absolute bottom-2 right-2 h-7 px-2 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white opacity-0 group-hover/content:opacity-100 transition-opacity"
              >
                {isExpanded ? (
                  <>
                    <Minimize2 className="w-3 h-3 mr-1" />
                    Collapse
                  </>
                ) : (
                  <>
                    <Expand className="w-3 h-3 mr-1" />
                    Expand
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Tags - Clickable */}
          {prompt.metadata?.tags && prompt.metadata.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {prompt.metadata.tags.slice(0, 4).map((tag, idx) => (
                <button
                  key={idx}
                  onClick={(e) => handleTagClick(e, tag)}
                  className="text-xs px-2 py-0.5 bg-zinc-800 text-zinc-400 rounded-full hover:bg-violet-500/20 hover:text-violet-400 transition-colors cursor-pointer"
                >
                  #{tag}
                </button>
              ))}
              {prompt.metadata.tags.length > 4 && (
                <span className="text-xs px-2 py-0.5 bg-zinc-800 text-zinc-500 rounded-full">
                  +{prompt.metadata.tags.length - 4}
                </span>
              )}
            </div>
          )}

          {/* Footer Info */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-800">
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <Sparkles className="w-3 h-3" />
              <span>{Math.round((prompt.metadata?.confidence || 0) * 100)}% confidence</span>
            </div>
            {prompt.usage_count > 0 && (
              <span className="text-xs text-zinc-500">
                Used {prompt.usage_count} {prompt.usage_count === 1 ? 'time' : 'times'}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
