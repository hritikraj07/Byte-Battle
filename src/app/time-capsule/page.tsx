'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Clock, Send } from 'lucide-react';
import {
  TimeCapsule,
  INITIAL_CAPSULES,
  CapsuleCard,
  CreateCapsuleModal,
} from '@/features/time-capsule';

export default function TimeCapsulePage() {
  const [capsules, setCapsules] = useState<TimeCapsule[]>(INITIAL_CAPSULES);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [revealedIds, setRevealedIds] = useState<string[]>([]);

  // Load from LocalStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('afterhours_time_capsules');
      if (stored) {
        setCapsules(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  const handleSaveCapsule = (newCapsule: TimeCapsule) => {
    const updated = [newCapsule, ...capsules];
    setCapsules(updated);
    try {
      localStorage.setItem('afterhours_time_capsules', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleDelete = (id: string) => {
    const updated = capsules.filter((c) => c.id !== id);
    setCapsules(updated);
    try {
      localStorage.setItem('afterhours_time_capsules', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const toggleReveal = (id: string) => {
    setRevealedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="w-full min-h-screen bg-[#060814] text-[#C4C8D8] font-sans selection:bg-[#6D5DFC] selection:text-white relative overflow-hidden">
      {/* Cosmic Midnight Starlight Lighting */}
      <div className="absolute top-0 left-1/3 w-[700px] h-[700px] bg-[#6D5DFC]/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-[550px] h-[550px] bg-[#3B82F6]/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Header Bar */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6 relative z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#141A38] pb-6">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-xl bg-[#0D122B] hover:bg-[#161E47] border border-[#1E2756] text-[#818CF8] hover:text-white transition-all"
              title="Return to AFTERHOURS Home"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-widest uppercase bg-[#6D5DFC]/15 text-[#818CF8] border border-[#6D5DFC]/30">
                  COSMIC REPOSITORY
                </span>
                <span className="text-xs text-[#4F46E5] font-mono">LAB 05</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white mt-1">
                TIME CAPSULE
              </h1>
            </div>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#6D5DFC] hover:bg-[#7E70FF] text-white font-mono text-xs font-bold transition-all shadow-[0_0_20px_rgba(109,93,252,0.4)] active:scale-95 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>SEAL NEW CAPSULE</span>
          </button>
        </div>
      </div>

      {/* Main Playfield: Vault Timeline */}
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="max-w-3xl mx-auto space-y-6">
          {capsules.length === 0 ? (
            <div className="p-12 rounded-3xl bg-[#0B1028] border border-[#141A38] text-center my-12">
              <Clock className="w-12 h-12 text-[#6D5DFC] mx-auto mb-3 opacity-60" />
              <h3 className="text-lg font-bold text-white mb-1">Your Vault is Empty</h3>
              <p className="text-xs text-[#8A90B2] max-w-sm mx-auto mb-5">
                Leave a prediction, milestone, or quiet reflection for your future self to uncover years down the line.
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-5 py-2.5 rounded-xl bg-[#6D5DFC] text-white font-bold text-xs cursor-pointer"
              >
                Create First Capsule
              </button>
            </div>
          ) : (
            capsules.map((capsule) => (
              <CapsuleCard
                key={capsule.id}
                capsule={capsule}
                isRevealed={revealedIds.includes(capsule.id)}
                onToggleReveal={toggleReveal}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
      </main>

      {/* Creation Modal */}
      <CreateCapsuleModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleSaveCapsule}
      />
    </div>
  );
}
