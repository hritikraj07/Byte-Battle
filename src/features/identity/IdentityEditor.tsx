'use client';

import React, { useState } from 'react';
import { Shield, Check } from 'lucide-react';
import {
  DigitalPersona,
  ARCHETYPES,
  ACCENTS,
  GLYPHS,
} from './identityData';

interface IdentityEditorProps {
  persona: DigitalPersona;
  setPersona: React.Dispatch<React.SetStateAction<DigitalPersona>>;
}

export const IdentityEditor: React.FC<IdentityEditorProps> = ({
  persona,
  setPersona,
}) => {
  const [skillInput, setSkillInput] = useState('');

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (skillInput.trim() && persona.skills.length < 6) {
      setPersona((prev) => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()],
      }));
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (idx: number) => {
    setPersona((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== idx),
    }));
  };

  return (
    <div className="p-6 sm:p-7 rounded-3xl bg-[#170928]/90 border border-[#2B1042] shadow-xl space-y-5">
      <h2 className="text-base font-mono font-bold uppercase tracking-wider text-[#C084FC] flex items-center gap-2">
        <Shield className="w-4 h-4" />
        <span>Identity Parameters</span>
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-mono text-[#A855F7] uppercase mb-1.5 font-bold">
            Display Name
          </label>
          <input
            type="text"
            value={persona.displayName}
            onChange={(e) =>
              setPersona((prev) => ({ ...prev, displayName: e.target.value }))
            }
            className="w-full p-3 rounded-xl bg-[#0D0418] border border-[#3B175E] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#A855F7]"
          />
        </div>

        <div>
          <label className="block text-xs font-mono text-[#A855F7] uppercase mb-1.5 font-bold">
            Callsign Code
          </label>
          <input
            type="text"
            value={persona.callsign}
            onChange={(e) =>
              setPersona((prev) => ({ ...prev, callsign: e.target.value }))
            }
            className="w-full p-3 rounded-xl bg-[#0D0418] border border-[#3B175E] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#A855F7]"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-mono text-[#A855F7] uppercase mb-1.5 font-bold">
          Futuristic Archetype
        </label>
        <select
          value={persona.archetype}
          onChange={(e) =>
            setPersona((prev) => ({ ...prev, archetype: e.target.value }))
          }
          className="w-full p-3 rounded-xl bg-[#0D0418] border border-[#3B175E] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#A855F7]"
        >
          {ARCHETYPES.map((arch) => (
            <option key={arch} value={arch} className="bg-[#0D0418] text-white">
              {arch}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-mono text-[#A855F7] uppercase mb-1.5 font-bold">
          Bio / Manifesto
        </label>
        <textarea
          rows={3}
          value={persona.bio}
          onChange={(e) =>
            setPersona((prev) => ({ ...prev, bio: e.target.value }))
          }
          className="w-full p-3 rounded-xl bg-[#0D0418] border border-[#3B175E] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#A855F7] resize-none leading-relaxed"
        />
      </div>

      {/* Accent Color Picker */}
      <div>
        <label className="block text-xs font-mono text-[#A855F7] uppercase mb-2 font-bold">
          Identity Accent Glow
        </label>
        <div className="flex items-center gap-3 flex-wrap">
          {ACCENTS.map((acc) => (
            <button
              key={acc.hex}
              onClick={() =>
                setPersona((prev) => ({ ...prev, accentColor: acc.hex }))
              }
              className={`w-9 h-9 rounded-xl transition-all flex items-center justify-center border-2 ${
                persona.accentColor === acc.hex
                  ? 'border-white scale-110 shadow-lg'
                  : 'border-transparent opacity-70 hover:opacity-100'
              }`}
              style={{ backgroundColor: acc.hex }}
              title={acc.name}
            >
              {persona.accentColor === acc.hex && (
                <Check className="w-4 h-4 text-black" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Avatar Glyph Grid */}
      <div>
        <label className="block text-xs font-mono text-[#A855F7] uppercase mb-2 font-bold">
          Holographic Cyber Glyph
        </label>
        <div className="grid grid-cols-6 gap-2">
          {GLYPHS.map((glyph, idx) => (
            <button
              key={idx}
              onClick={() =>
                setPersona((prev) => ({ ...prev, glyphId: idx }))
              }
              className={`h-11 rounded-xl text-lg font-bold transition-all border flex items-center justify-center ${
                persona.glyphId === idx
                  ? 'bg-[#A855F7]/30 border-[#A855F7] text-white shadow-[0_0_12px_#A855F7]'
                  : 'bg-[#0D0418] border-[#3B175E] text-[#C084FC] hover:border-[#A855F7]'
              }`}
            >
              {glyph}
            </button>
          ))}
        </div>
      </div>

      {/* Skills / Focus Chips */}
      <div>
        <label className="block text-xs font-mono text-[#A855F7] uppercase mb-1.5 font-bold">
          Specializations ({persona.skills.length}/6)
        </label>
        <div className="flex flex-wrap gap-2 mb-3">
          {persona.skills.map((skill, sIdx) => (
            <span
              key={sIdx}
              className="px-3 py-1 rounded-lg text-xs font-mono bg-[#0D0418] border border-[#3B175E] text-[#E9D5FF] flex items-center gap-1.5"
            >
              <span>{skill}</span>
              <button
                onClick={() => handleRemoveSkill(sIdx)}
                className="text-[#9333EA] hover:text-white"
              >
                ×
              </button>
            </span>
          ))}
        </div>

        {persona.skills.length < 6 && (
          <form onSubmit={handleAddSkill} className="flex gap-2">
            <input
              type="text"
              placeholder="Add focus tag (e.g., Orbital Mechanics)"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              className="flex-1 p-2.5 rounded-xl bg-[#0D0418] border border-[#3B175E] text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#A855F7]"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-[#281045] hover:bg-[#3B175E] text-xs font-mono font-bold text-[#E9D5FF]"
            >
              ADD
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
