'use client';

import React, { useState } from 'react';
import { Clock } from 'lucide-react';
import { TimeCapsule } from './capsuleData';

interface CreateCapsuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (capsule: TimeCapsule) => void;
}

export const CreateCapsuleModal: React.FC<CreateCapsuleModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<'prediction' | 'letter' | 'goal' | 'reflection'>('letter');
  const [targetDate, setTargetDate] = useState('2030-01-01');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const newCapsule: TimeCapsule = {
      id: `cap-${Date.now()}`,
      title: title.trim(),
      content: content.trim(),
      category,
      createdAt: new Date().toISOString(),
      unlockDate: new Date(targetDate).toISOString(),
      isCustomLocked: true,
    };

    onSave(newCapsule);
    setTitle('');
    setContent('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-[#0B1028] border border-[#1E2756] shadow-2xl space-y-5 animate-scaleIn">
        <div className="flex items-center justify-between pb-3 border-b border-[#141A38]">
          <div className="flex items-center gap-2 text-white font-bold text-lg">
            <Clock className="w-5 h-5 text-[#6D5DFC]" />
            <span>Seal A Time Capsule</span>
          </div>
          <button
            onClick={onClose}
            className="text-[#8A90B2] hover:text-white text-lg p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-[#818CF8] uppercase mb-1 font-bold">
              Capsule Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Reflections Before The Quantum Leap"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 rounded-xl bg-[#060814] border border-[#1E2756] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6D5DFC]"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-[#818CF8] uppercase mb-1 font-bold">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full p-3 rounded-xl bg-[#060814] border border-[#1E2756] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6D5DFC]"
            >
              <option value="letter">Letter to Future Self</option>
              <option value="prediction">Future Prediction</option>
              <option value="goal">Personal Milestone</option>
              <option value="reflection">Philosophical Reflection</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono text-[#818CF8] uppercase mb-1 font-bold">
              Unlock Date
            </label>
            <input
              type="date"
              required
              value={targetDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full p-3 rounded-xl bg-[#060814] border border-[#1E2756] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6D5DFC]"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-[#818CF8] uppercase mb-1 font-bold">
              Message Body
            </label>
            <textarea
              required
              rows={4}
              placeholder="What do you want your future self to remember about this moment?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-3 rounded-xl bg-[#060814] border border-[#1E2756] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6D5DFC] resize-none leading-relaxed"
            />
          </div>

          <div className="flex gap-3 pt-3">
            <button
              type="submit"
              className="flex-1 py-3 rounded-xl bg-[#6D5DFC] hover:bg-[#7E70FF] text-white font-mono text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              SEAL IN VAULT
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-xl bg-[#060814] border border-[#1E2756] text-[#8A90B2] text-xs font-mono cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
