'use client';

import React from 'react';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { RadarArticle } from './radarData';

interface RadarCardProps {
  item: RadarArticle;
  isBookmarked: boolean;
  onToggleBookmark: (id: string) => void;
}

export const RadarCard: React.FC<RadarCardProps> = ({
  item,
  isBookmarked,
  onToggleBookmark,
}) => {
  return (
    <div className="p-6 rounded-3xl bg-[#082015]/90 border border-[#0D3823] hover:border-[#10B981]/60 transition-all flex flex-col justify-between shadow-xl group hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]">
      <div>
        {/* Meta Header */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 uppercase">
            {item.categoryLabel}
          </span>
          <button
            onClick={() => onToggleBookmark(item.id)}
            className="p-1.5 rounded-lg text-[#059669] hover:text-[#10B981] transition-colors"
            title={isBookmarked ? 'Remove Bookmark' : 'Save Brief'}
          >
            {isBookmarked ? (
              <BookmarkCheck className="w-4 h-4 text-[#A3E635]" />
            ) : (
              <Bookmark className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Title */}
        <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-[#A7F3D0] transition-colors leading-snug mb-3">
          {item.title}
        </h3>

        {/* Abstract */}
        <p className="text-xs text-[#A7F3D0]/80 leading-relaxed mb-5">
          {item.abstract}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {item.tags.map((tag, tIdx) => (
            <span
              key={tIdx}
              className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-[#04150E] text-[#6EE7B7] border border-[#0D3823]"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Footer & TRL Gauge */}
      <div className="pt-4 border-t border-[#0D3823] space-y-2.5">
        <div className="flex items-center justify-between text-[11px] font-mono text-[#059669]">
          <span>{item.sourceOrg}</span>
          <span className="text-[#A7F3D0]">{item.date}</span>
        </div>

        {/* Technology Readiness Level Indicator (TRL 1-9) */}
        <div className="flex items-center justify-between gap-2 bg-[#04150E] p-2 rounded-xl border border-[#0D3823]/80">
          <span className="text-[10px] font-mono text-[#6EE7B7]">
            Maturity: <strong>TRL-{item.trlLevel}</strong>
          </span>
          <div className="flex gap-1">
            {Array.from({ length: 9 }).map((_, lIdx) => (
              <div
                key={lIdx}
                className={`w-1.5 h-3 rounded-xs ${
                  lIdx < item.trlLevel ? 'bg-[#10B981]' : 'bg-[#0D3823]'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
