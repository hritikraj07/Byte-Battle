'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Check, Copy } from 'lucide-react';
import {
  DigitalPersona,
  DEFAULT_PERSONA,
  IdentityBadge,
  IdentityEditor,
} from '@/features/identity';

export default function DigitalIdentityLabPage() {
  const [persona, setPersona] = useState<DigitalPersona>(DEFAULT_PERSONA);
  const [savedToast, setSavedToast] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

  // Load from LocalStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('afterhours_digital_identity');
      if (stored) {
        setPersona(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  const handleSave = () => {
    try {
      localStorage.setItem('afterhours_digital_identity', JSON.stringify(persona));
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 2500);
    } catch {
      // ignore
    }
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(persona, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  return (
    <div className="w-full min-h-screen bg-[#0E0516] text-[#F3E8FF] font-sans selection:bg-[#A855F7] selection:text-white relative overflow-hidden">
      {/* Ambient Deep Plum & Ultraviolet Atmospheric Lighting */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-[#9333EA]/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-[#EC4899]/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header Bar */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6 relative z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#2B1042] pb-6">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-xl bg-[#190A2C] hover:bg-[#281045] border border-[#3B175E] text-[#C084FC] hover:text-white transition-all"
              title="Return to AFTERHOURS Home"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-widest uppercase bg-[#A855F7]/15 text-[#C084FC] border border-[#A855F7]/30">
                  CYBER IDENTITY LAB
                </span>
                <span className="text-xs text-[#9333EA] font-mono">LAB 04</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white mt-1">
                DIGITAL IDENTITY LAB
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#9333EA] hover:bg-[#A855F7] text-white font-mono text-xs font-bold transition-all shadow-[0_0_20px_rgba(147,51,234,0.4)] active:scale-95 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{savedToast ? 'SAVED TO BROWSER!' : 'SAVE PERSONA'}</span>
            </button>
            <button
              onClick={handleCopyJson}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#190A2C] hover:bg-[#281045] border border-[#3B175E] text-[#C084FC] hover:text-white font-mono text-xs transition-all active:scale-95 cursor-pointer"
              title="Copy JSON Payload"
            >
              <Copy className="w-4 h-4" />
              <span>{copiedJson ? 'COPIED' : 'JSON'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Customizer Panel on Left, Holographic Card on Right */}
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7">
            <IdentityEditor persona={persona} setPersona={setPersona} />
          </div>
          <div className="lg:col-span-5">
            <IdentityBadge persona={persona} />
          </div>
        </div>
      </main>
    </div>
  );
}
