// ============================================================================
// PROMPT MODAL COMPONENT - Create/Edit Prompts
// ============================================================================

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Loader2, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Prompt, PromptType } from '@/types';
import { SUBTYPE_REGISTRY } from '@/types';
import { getConfidenceLevel } from '@/services/puterAI';

interface PromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (content: string, metadata?: any) => void;
  prompt?: Prompt | null;
  isProcessing?: boolean;
  extractedData?: {
    title: string;
    description: string;
    metadata: {
      type: PromptType;
      subtype: string;
      confidence: number;
      tags: string[];
      attributes: Record<string, string>;
    };
  } | null;
}

export function PromptModal({ 
  isOpen, 
  onClose, 
  onSave, 
  prompt, 
  isProcessing = false,
  extractedData 
}: PromptModalProps) {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<PromptType>('uncategorized');
  const [subtype, setSubtype] = useState('other');
  const [tags, setTags] = useState('');
  const [showMetadata, setShowMetadata] = useState(false);

  const isEditing = !!prompt;
  const confidenceLevel = extractedData ? getConfidenceLevel(extractedData.metadata.confidence) : 'high';

  useEffect(() => {
    if (isOpen) {
      if (prompt) {
        setContent(prompt.content);
        setTitle(prompt.title);
        setDescription(prompt.description || '');
        setType(prompt.metadata?.type || 'uncategorized');
        setSubtype(prompt.metadata?.subtype || 'other');
        setTags((prompt.metadata?.tags || []).join(', '));
        setShowMetadata(true);
      } else {
        setContent('');
        setTitle('');
        setDescription('');
        setType('uncategorized');
        setSubtype('other');
        setTags('');
        setShowMetadata(false);
      }
    }
  }, [isOpen, prompt]);

  useEffect(() => {
    if (extractedData && !isEditing) {
      setTitle(extractedData.title);
      setDescription(extractedData.description);
      setType(extractedData.metadata.type);
      setSubtype(extractedData.metadata.subtype);
      setTags(extractedData.metadata.tags.join(', '));
      setShowMetadata(true);
    }
  }, [extractedData, isEditing]);

  const handleSave = () => {
    const metadata = {
      type,
      subtype,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      confidence: extractedData?.metadata.confidence || 1.0,
      attributes: extractedData?.metadata.attributes || {}
    };
    onSave(content, { title, description, metadata });
  };

  const availableSubtypes = SUBTYPE_REGISTRY[type] || SUBTYPE_REGISTRY.uncategorized;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-violet-400" />
              <h2 className="text-lg font-semibold text-white">
                {isEditing ? 'Edit Prompt' : 'New Prompt'}
              </h2>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-zinc-400">
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-4 overflow-y-auto max-h-[calc(90vh-140px)]">
            {/* Prompt Content */}
            <div className="mb-4">
              <Label className="text-zinc-300 mb-2 block">Prompt Content</Label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter your prompt here... The AI will extract all metadata automatically."
                className="min-h-[120px] bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-600 resize-none"
              />
              {!isEditing && (
                <p className="text-xs text-zinc-500 mt-2 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  AI will auto-generate title, description, and tags
                </p>
              )}
            </div>

            {/* Processing State */}
            {isProcessing && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="flex items-center justify-center gap-2 py-4 text-violet-400"
              >
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>AI is analyzing your prompt...</span>
              </motion.div>
            )}

            {/* Metadata Section */}
            <AnimatePresence>
              {showMetadata && !isProcessing && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 border-t border-zinc-800 pt-4"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-zinc-300">Extracted Metadata</h3>
                    {extractedData && (
                      <Badge 
                        variant="secondary" 
                        className={`
                          ${confidenceLevel === 'high' ? 'bg-emerald-500/10 text-emerald-400' :
                            confidenceLevel === 'medium' ? 'bg-amber-500/10 text-amber-400' :
                            'bg-rose-500/10 text-rose-400'}
                        `}
                      >
                        {Math.round(extractedData.metadata.confidence * 100)}% confidence
                      </Badge>
                    )}
                  </div>

                  {/* Title */}
                  <div>
                    <Label className="text-zinc-400 text-xs mb-1 block">Title</Label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="bg-zinc-950 border-zinc-800 text-white"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <Label className="text-zinc-400 text-xs mb-1 block">Description</Label>
                    <Input
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="bg-zinc-950 border-zinc-800 text-white"
                    />
                  </div>

                  {/* Type & Subtype */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-zinc-400 text-xs mb-1 block">Type</Label>
                      <Select value={type} onValueChange={(v) => {
                        setType(v as PromptType);
                        setSubtype('other');
                      }}>
                        <SelectTrigger className="bg-zinc-950 border-zinc-800 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-zinc-800">
                          <SelectItem value="image">📷 Image</SelectItem>
                          <SelectItem value="video">🎬 Video</SelectItem>
                          <SelectItem value="code">💻 Code</SelectItem>
                          <SelectItem value="uncategorized">❓ Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-zinc-400 text-xs mb-1 block">Subtype</Label>
                      <Select value={subtype} onValueChange={setSubtype}>
                        <SelectTrigger className="bg-zinc-950 border-zinc-800 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-zinc-800">
                          {availableSubtypes.map((sub) => (
                            <SelectItem key={sub} value={sub}>
                              {sub.charAt(0).toUpperCase() + sub.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <Label className="text-zinc-400 text-xs mb-1 block">Tags (comma separated)</Label>
                    <Input
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="tag1, tag2, tag3"
                      className="bg-zinc-950 border-zinc-800 text-white"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 p-4 border-t border-zinc-800">
            <Button variant="ghost" onClick={onClose} className="text-zinc-400">
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={!content.trim() || isProcessing}
              className="bg-violet-600 hover:bg-violet-700 text-white"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  {isEditing ? 'Save Changes' : 'Save Prompt'}
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
