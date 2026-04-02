// ============================================================================
// SEARCH & FILTER COMPONENT - Simplified without Radix UI
// ============================================================================

import { useState } from 'react';
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface SearchFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedType: string;
  onTypeChange: (type: string) => void;
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  availableTags: string[];
  resultCount: number;
  totalCount: number;
}

const TYPES = [
  { value: '', label: 'All' },
  { value: 'image', label: '📷 Image' },
  { value: 'video', label: '🎬 Video' },
  { value: 'code', label: '💻 Code' },
  { value: 'uncategorized', label: '❓ Other' },
];

export function SearchFilter({
  searchQuery,
  onSearchChange,
  selectedType,
  onTypeChange,
  selectedTags,
  onTagToggle,
  availableTags,
  resultCount,
  totalCount
}: SearchFilterProps) {
  const [showFilters, setShowFilters] = useState(false);

  const hasActiveFilters = selectedType || selectedTags.length > 0;

  const clearFilters = () => {
    onTypeChange('');
    selectedTags.forEach(tag => onTagToggle(tag));
  };

  return (
    <div className="space-y-3">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <Input
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search prompts..."
          className="pl-10 pr-10 bg-zinc-900/80 border-zinc-800 text-white placeholder:text-zinc-500"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 text-zinc-500"
            onClick={() => onSearchChange('')}
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>

      {/* Filter Toggle & Stats */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="text-zinc-400 hover:text-white"
        >
          <SlidersHorizontal className="w-4 h-4 mr-2" />
          Filters
          <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-2 bg-violet-500/20 text-violet-400">
              Active
            </Badge>
          )}
        </Button>
        <span className="text-xs text-zinc-500">
          {resultCount} of {totalCount}
        </span>
      </div>

      {/* Expandable Filters */}
      {showFilters && (
        <div className="space-y-3 pt-1">
          {/* Type Filter - Simple buttons */}
          <div>
            <label className="text-xs text-zinc-500 mb-1.5 block">Type</label>
            <div className="flex flex-wrap gap-1.5">
              {TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => onTypeChange(type.value)}
                  className={`
                    text-xs px-2.5 py-1 rounded-full transition-all
                    ${selectedType === type.value
                      ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                      : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:border-zinc-600'
                    }
                  `}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tags Filter */}
          {availableTags.length > 0 && (
            <div>
              <label className="text-xs text-zinc-500 mb-1.5 block">Tags</label>
              <div className="flex flex-wrap gap-1.5">
                {availableTags.slice(0, 15).map((tag) => (
                  <button
                    key={tag}
                    onClick={() => onTagToggle(tag)}
                    className={`
                      text-xs px-2.5 py-1 rounded-full transition-all
                      ${selectedTags.includes(tag)
                        ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                        : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:border-zinc-600'
                      }
                    `}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-zinc-500 hover:text-white w-full"
            >
              <X className="w-3 h-3 mr-2" />
              Clear all filters
            </Button>
          )}
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-1.5">
          {selectedType && (
            <Badge
              variant="secondary"
              className="bg-zinc-800 text-zinc-300 cursor-pointer hover:bg-zinc-700"
              onClick={() => onTypeChange('')}
            >
              {selectedType} <X className="w-3 h-3 ml-1" />
            </Badge>
          )}
          {selectedTags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="bg-violet-500/20 text-violet-400 cursor-pointer hover:bg-violet-500/30"
              onClick={() => onTagToggle(tag)}
            >
              #{tag} <X className="w-3 h-3 ml-1" />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
