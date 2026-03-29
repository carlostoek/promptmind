// ============================================================================
// APP COMPONENT - PromptMind AI
// ============================================================================

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePromptStore } from '@/store/promptStore';
import { Header } from '@/components/Header';
import { SearchFilter } from '@/components/SearchFilter';
import { StatsBar } from '@/components/StatsBar';
import { PromptCard } from '@/components/PromptCard';
import { PromptModal } from '@/components/PromptModal';
import { EmptyState } from '@/components/EmptyState';
import { FloatingActionButton } from '@/components/FloatingActionButton';
import { Toast } from '@/components/Toast';
import { useToast } from '@/hooks/useToast';
import type { Prompt, ScoredPrompt } from '@/types';
import './App.css';

function App() {
  // State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Store
  const { 
    prompts, 
    addPrompt, 
    updatePrompt, 
    deletePrompt, 
    incrementUsage,
    searchPrompts,
    getAllTags,
    loadFromStorage,
    exportData,
    importData
  } = usePromptStore();

  const { toast, showToast, hideToast } = useToast();

  // Check if Puter is loaded
  useEffect(() => {
    const checkPuter = () => {
      // @ts-ignore
      if (typeof puter !== 'undefined') {
        loadFromStorage();
      } else {
        setTimeout(checkPuter, 500);
      }
    };
    checkPuter();
  }, [loadFromStorage]);

  // Derived state
  const availableTags = useMemo(() => getAllTags(), [getAllTags, prompts]);
  
  const filteredPrompts = useMemo(() => {
    return searchPrompts(searchQuery, {
      type: selectedType as any,
      tags: selectedTags
    });
  }, [searchPrompts, searchQuery, selectedType, selectedTags, prompts]);

  const typeCounts = useMemo(() => {
    return prompts.reduce((acc, p) => {
      const type = p.metadata?.type || 'uncategorized';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [prompts]);

  // Handlers
  const handleCreate = useCallback(async (content: string, metadata?: any) => {
    if (!content.trim()) return;

    setIsProcessing(true);
    try {
      if (editingPrompt) {
        // Update existing prompt
        await updatePrompt(editingPrompt.id, {
          content,
          title: metadata?.title || editingPrompt.title,
          description: metadata?.description || editingPrompt.description,
          metadata: metadata?.metadata || editingPrompt.metadata
        });
        showToast('Prompt updated successfully!', 'success');
      } else {
        // Create new prompt with AI extraction
        await addPrompt(content);
        showToast('Prompt saved with AI metadata!', 'success');
      }
      setIsModalOpen(false);
      setEditingPrompt(null);
      setExtractedData(null);
    } catch (error) {
      console.error('Error saving prompt:', error);
      showToast('Failed to save prompt', 'error');
    } finally {
      setIsProcessing(false);
    }
  }, [editingPrompt, addPrompt, updatePrompt, showToast]);

  const handleEdit = useCallback((prompt: Prompt) => {
    setEditingPrompt(prompt);
    setExtractedData({
      title: prompt.title,
      description: prompt.description,
      metadata: prompt.metadata
    });
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('Are you sure you want to delete this prompt?')) return;
    
    try {
      await deletePrompt(id);
      showToast('Prompt deleted', 'success');
    } catch (error) {
      showToast('Failed to delete prompt', 'error');
    }
  }, [deletePrompt, showToast]);

  const handleCopy = useCallback(async (id: string) => {
    const prompt = prompts.find(p => p.id === id);
    if (!prompt) return;

    try {
      await navigator.clipboard.writeText(prompt.content);
      incrementUsage(id);
      showToast('Copied to clipboard!', 'success');
    } catch (error) {
      showToast('Failed to copy', 'error');
    }
  }, [prompts, incrementUsage, showToast]);

  const handleExport = useCallback(() => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `promptmind-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Data exported successfully!', 'success');
  }, [exportData, showToast]);

  const handleImport = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        await importData(text);
        showToast('Data imported successfully!', 'success');
      } catch (error) {
        showToast('Failed to import data', 'error');
      }
    };
    input.click();
  }, [importData, showToast]);

  const handleClearAll = useCallback(async () => {
    if (!confirm(`Are you sure you want to delete all ${prompts.length} prompts? This cannot be undone.`)) return;
    
    try {
      for (const prompt of prompts) {
        await deletePrompt(prompt.id);
      }
      showToast('All prompts cleared', 'success');
    } catch (error) {
      showToast('Failed to clear prompts', 'error');
    }
  }, [prompts, deletePrompt, showToast]);

  const handleTagToggle = useCallback((tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  }, []);

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedType('');
    setSelectedTags([]);
  }, []);

  const hasFilters = !!(searchQuery || selectedType || selectedTags.length > 0);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <Header 
        onExport={handleExport}
        onImport={handleImport}
        onClearAll={handleClearAll}
        promptCount={prompts.length}
      />

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-6">
        {/* Stats */}
        {prompts.length > 0 && (
          <div className="mb-4">
            <StatsBar totalCount={prompts.length} typeCounts={typeCounts} />
          </div>
        )}

        {/* Search & Filter */}
        {prompts.length > 0 && (
          <div className="mb-6">
            <SearchFilter
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedType={selectedType}
              onTypeChange={setSelectedType}
              selectedTags={selectedTags}
              onTagToggle={handleTagToggle}
              availableTags={availableTags}
              resultCount={filteredPrompts.length}
              totalCount={prompts.length}
            />
          </div>
        )}

        {/* Prompts List */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredPrompts.length > 0 ? (
              filteredPrompts.map((prompt, index) => (
                <motion.div
                  key={prompt.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <PromptCard
                    prompt={prompt}
                    onCopy={handleCopy}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    score={(prompt as ScoredPrompt).score}
                  />
                </motion.div>
              ))
            ) : (
              <EmptyState
                onCreate={() => setIsModalOpen(true)}
                hasFilters={hasFilters}
                onClearFilters={hasFilters ? clearFilters : undefined}
              />
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Floating Action Button */}
      {prompts.length > 0 && (
        <FloatingActionButton onClick={() => {
          setEditingPrompt(null);
          setExtractedData(null);
          setIsModalOpen(true);
        }} />
      )}

      {/* Modal */}
      <PromptModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPrompt(null);
          setExtractedData(null);
        }}
        onSave={handleCreate}
        prompt={editingPrompt}
        isProcessing={isProcessing}
        extractedData={extractedData}
      />

      {/* Toast */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </div>
  );
}

export default App;
