'use client';

import React, { useState, useMemo } from 'react';
import { Search, Compass } from 'lucide-react';
import { RADAR_ITEMS, CATEGORIES } from './radarData';
import { RadarCard } from './RadarCard';

export const RadarFeed: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);

  const filteredItems = useMemo(() => {
    return RADAR_ITEMS.filter((item) => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.abstract.toLowerCase().includes(q) ||
        item.tags.some((t) => t.toLowerCase().includes(q)) ||
        item.sourceOrg.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  const toggleBookmark = (id: string) => {
    setBookmarkedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div>
      {/* Search & Category Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-6">
        {/* Search Box */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#059669] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search breakthroughs, research labs, or quantum topics..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#082015] border border-[#0D3823] text-sm text-white placeholder-[#059669] focus:outline-none focus:ring-2 focus:ring-[#10B981]"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-sans transition-all flex-shrink-0 ${
                  isSelected
                    ? 'bg-[#10B981] text-[#04150E] font-bold shadow-[0_0_16px_rgba(16,185,129,0.35)]'
                    : 'bg-[#082015] border border-[#0D3823] text-[#A7F3D0] hover:text-white hover:border-[#10B981]/50'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Intelligence Cards Grid */}
      {filteredItems.length === 0 ? (
        <div className="p-12 rounded-3xl bg-[#082015] border border-[#0D3823] text-center max-w-md mx-auto my-12">
          <Compass className="w-10 h-10 text-[#059669] mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">No Radar Matches</h3>
          <p className="text-xs text-[#6EE7B7] mb-4">
            No intelligence reports match your search criteria. Try clearing search keywords.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="px-4 py-2 rounded-xl bg-[#10B981] text-[#04150E] font-bold text-xs"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <RadarCard
              key={item.id}
              item={item}
              isBookmarked={bookmarkedIds.includes(item.id)}
              onToggleBookmark={toggleBookmark}
            />
          ))}
        </div>
      )}
    </div>
  );
};
