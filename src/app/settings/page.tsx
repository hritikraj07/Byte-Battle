'use client';

import React, { useState, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  Play,
  Check,
  Gamepad2,
  Keyboard,
  Smartphone,
  HelpCircle,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { AppSettings, DEFAULT_SETTINGS, getStoredSettings, saveStoredSettings } from '@/services/settings';
import { useAudio } from '@/hooks/useAudio';

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const { playSound } = useAudio();

  useEffect(() => {
    setSettings(getStoredSettings());
  }, []);

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    const updated = saveStoredSettings({ [key]: value });
    setSettings(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 1500);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn text-[#E8E8FF]">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-[#24244A]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <h1 className="font-pixel text-xl sm:text-2xl tracking-tight text-[#00F0FF] uppercase">
              SETTINGS
            </h1>
            <span className="text-[10px] font-sans font-bold px-2.5 py-0.5 rounded-full bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/40">
              AUDIO & CONTROLS
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#8A8AB8] font-sans">
            Sound synthesizers, interface feedback, controls guide, and troubleshooting.
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#00F0FF]/20 border border-[#00F0FF]/50 text-[#00F0FF] text-xs font-mono font-bold animate-fadeIn">
            <Check className="w-3.5 h-3.5" />
            <span>Saved</span>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* Section 1: Audio Controls */}
        <section className="bg-[#0D0D22] border border-[#24244A] rounded-2xl p-6 sm:p-8 shadow-[0_0_24px_-6px_rgba(0,240,255,0.15)]">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#24244A]">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#00F0FF]/10 border border-[#00F0FF]/30 text-[#00F0FF]">
                {settings.isMuted ? <VolumeX className="w-5 h-5 text-[#FF2E97]" /> : <Volume2 className="w-5 h-5" />}
              </div>
              <div>
                <h2 className="font-pixel text-xs sm:text-sm text-[#E8E8FF] uppercase">Audio & Sound FX</h2>
                <p className="text-xs text-[#8A8AB8] font-sans mt-0.5">Synthesizer volumes, sound effects, and acoustic previews</p>
              </div>
            </div>

            <button
              onClick={() => {
                const newMuted = !settings.isMuted;
                updateSetting('isMuted', newMuted);
                if (!newMuted) playSound('click');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-sans font-semibold transition-all ${
                settings.isMuted
                  ? 'bg-[#FF2E97]/20 text-[#FF2E97] border border-[#FF2E97]/50'
                  : 'bg-[#05050D] text-[#8A8AB8] hover:text-white border border-[#24244A] hover:border-[#00F0FF]'
              }`}
            >
              {settings.isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span>{settings.isMuted ? 'Muted' : 'Sound On'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Master Volume */}
            <div>
              <div className="flex justify-between text-xs font-sans mb-2">
                <span className="text-white font-medium">Master Volume</span>
                <span className="text-[#00F0FF] font-pixel text-[10px]">{settings.masterVolume}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.masterVolume}
                disabled={settings.isMuted}
                onChange={(e) => updateSetting('masterVolume', Number(e.target.value))}
                className="w-full accent-[#00F0FF] cursor-pointer disabled:opacity-40"
              />
            </div>

            {/* Music / Beat Volume */}
            <div>
              <div className="flex justify-between text-xs font-sans mb-2">
                <span className="text-white font-medium">Music & Beats</span>
                <span className="text-[#A855F7] font-pixel text-[10px]">{settings.musicVolume}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.musicVolume}
                disabled={settings.isMuted}
                onChange={(e) => updateSetting('musicVolume', Number(e.target.value))}
                className="w-full accent-[#A855F7] cursor-pointer disabled:opacity-40"
              />
            </div>

            {/* SFX Volume */}
            <div>
              <div className="flex justify-between text-xs font-sans mb-2">
                <span className="text-white font-medium">Sound Effects (SFX)</span>
                <span className="text-[#FF2E97] font-pixel text-[10px]">{settings.sfxVolume}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.sfxVolume}
                disabled={settings.isMuted}
                onChange={(e) => updateSetting('sfxVolume', Number(e.target.value))}
                className="w-full accent-[#FF2E97] cursor-pointer disabled:opacity-40"
              />
            </div>
          </div>

          {/* Interface Sounds Toggle */}
          <div className="p-3.5 rounded-xl bg-[#05050D] border border-[#24244A] flex items-center justify-between mb-6">
            <div>
              <span className="text-xs font-semibold text-white block">Interface Click Sounds</span>
              <span className="text-[11px] text-[#8A8AB8] font-sans">
                Acoustic click feedback when tapping buttons and arcade cards
              </span>
            </div>
            <input
              type="checkbox"
              checked={settings.interfaceSounds !== false}
              onChange={(e) => {
                updateSetting('interfaceSounds', e.target.checked);
                if (e.target.checked) playSound('click');
              }}
              className="w-5 h-5 accent-[#00F0FF] cursor-pointer rounded"
            />
          </div>

          {/* Sound Preview Test Buttons */}
          <div className="pt-4 border-t border-[#24244A]">
            <span className="text-[11px] font-pixel text-[#8A8AB8] block mb-3 uppercase tracking-wider">
              Sound FX Test Previews
            </span>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Click', type: 'click' },
                { label: 'Jump', type: 'jump' },
                { label: 'Coin', type: 'coin' },
                { label: 'Correct', type: 'correct' },
                { label: 'Wrong', type: 'wrong' },
                { label: 'Victory', type: 'win' },
              ].map((sound) => (
                <button
                  key={sound.type}
                  onClick={() => playSound(sound.type as unknown as Parameters<typeof playSound>[0])}
                  disabled={settings.isMuted}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#05050D] hover:bg-[#141432] border border-[#24244A] text-xs font-sans font-medium text-[#8A8AB8] hover:text-white transition-all disabled:opacity-40 active:scale-95"
                >
                  <Play className="w-3 h-3 text-[#00F0FF]" />
                  <span>{sound.label}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Section 2: Controls & Input Guide */}
        <section className="bg-[#0D0D22] border border-[#24244A] rounded-2xl p-6 sm:p-8 shadow-[0_0_24px_-6px_rgba(0,240,255,0.15)]">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#24244A]">
            <div className="p-2.5 rounded-xl bg-[#A855F7]/10 border border-[#A855F7]/30 text-[#A855F7]">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-pixel text-xs sm:text-sm text-[#E8E8FF] uppercase">Controls & Input Guide</h2>
              <p className="text-xs text-[#8A8AB8] font-sans mt-0.5">Reference instructions for keyboard, mouse, and touch inputs</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Desktop Keyboard Guide */}
            <div className="p-4 rounded-xl bg-[#05050D] border border-[#24244A]">
              <div className="flex items-center gap-2 mb-3 text-white font-bold text-xs font-sans">
                <Keyboard className="w-4 h-4 text-[#00F0FF]" />
                <span>DESKTOP KEYBOARD CONTROLS</span>
              </div>
              <ul className="text-xs text-[#8A8AB8] font-sans space-y-2">
                <li className="flex justify-between pb-1.5 border-b border-[#24244A]/50">
                  <span className="text-white">Pulse Jumper:</span>
                  <span className="text-[#00F0FF] font-mono font-bold">Space / Up Arrow</span>
                </li>
                <li className="flex justify-between pb-1.5 border-b border-[#24244A]/50">
                  <span className="text-white">Stack Sprint:</span>
                  <span className="text-[#00F0FF] font-mono font-bold">Space / Enter</span>
                </li>
                <li className="flex justify-between pb-1.5 border-b border-[#24244A]/50">
                  <span className="text-white">Pixel Invaders:</span>
                  <span className="text-[#A855F7] font-mono font-bold">Arrows + Space</span>
                </li>
                <li className="flex justify-between pb-1.5 border-b border-[#24244A]/50">
                  <span className="text-white">Maze Runner & Orbit Dodge:</span>
                  <span className="text-[#FFE45E] font-mono font-bold">Arrows / WASD</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-white">Number Blitz & Puzzles:</span>
                  <span className="text-[#00F0FF] font-mono font-bold">Number Keys 1 - 4</span>
                </li>
              </ul>
            </div>

            {/* Mobile & Touch Controls */}
            <div className="p-4 rounded-xl bg-[#05050D] border border-[#24244A]">
              <div className="flex items-center gap-2 mb-3 text-white font-bold text-xs font-sans">
                <Smartphone className="w-4 h-4 text-[#FF2E97]" />
                <span>TOUCH & MOBILE CONTROLS</span>
              </div>
              <ul className="text-xs text-[#8A8AB8] font-sans space-y-2">
                <li className="flex justify-between pb-1.5 border-b border-[#24244A]/50">
                  <span className="text-white">Pulse Jumper:</span>
                  <span className="text-[#00F0FF] font-mono font-bold">Tap screen to jump</span>
                </li>
                <li className="flex justify-between pb-1.5 border-b border-[#24244A]/50">
                  <span className="text-white">Stack Sprint:</span>
                  <span className="text-[#00F0FF] font-mono font-bold">Tap anywhere to drop</span>
                </li>
                <li className="flex justify-between pb-1.5 border-b border-[#24244A]/50">
                  <span className="text-white">Maze Runner & Orbit:</span>
                  <span className="text-[#FFE45E] font-mono font-bold">On-screen D-Pad</span>
                </li>
                <li className="flex justify-between pb-1.5 border-b border-[#24244A]/50">
                  <span className="text-white">Pixel Invaders:</span>
                  <span className="text-[#A855F7] font-mono font-bold">Left/Right + Fire</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-white">Interactive Puzzles:</span>
                  <span className="text-[#00F0FF] font-mono font-bold">Tap options directly</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 3: Troubleshooting & FAQ */}
        <section className="bg-[#0D0D22] border border-[#24244A] rounded-2xl p-6 sm:p-8 shadow-[0_0_24px_-6px_rgba(0,240,255,0.15)]">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#24244A]">
            <div className="p-2.5 rounded-xl bg-[#00F0FF]/10 border border-[#00F0FF]/30 text-[#00F0FF]">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-pixel text-xs sm:text-sm text-[#E8E8FF] uppercase">Troubleshooting & FAQ</h2>
              <p className="text-xs text-[#8A8AB8] font-sans mt-0.5">Offline PWA execution, persistence, and audio troubleshooting</p>
            </div>
          </div>

          <div className="space-y-4 text-xs font-sans text-[#8A8AB8] leading-relaxed">
            <div className="p-4 rounded-xl bg-[#05050D] border border-[#24244A]">
              <div className="flex items-center gap-2 mb-1.5 text-white font-bold">
                <Zap className="w-4 h-4 text-[#00F0FF]" />
                <span>Audio Not Playing?</span>
              </div>
              <p>
                Browsers restrict autoplaying Web Audio until your first user gesture (click or tap). Tap any preview button above or click into any game to initialize the Web Audio context.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#05050D] border border-[#24244A]">
              <div className="flex items-center gap-2 mb-1.5 text-white font-bold">
                <ShieldCheck className="w-4 h-4 text-[#A855F7]" />
                <span>Local IndexedDB Persistence Guarantee</span>
              </div>
              <p>
                All personal best scores and attempt history are stored locally in your device&apos;s browser IndexedDB database. They remain preserved across page reloads without cloud transmission.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#05050D] border border-[#24244A]">
              <div className="flex items-center gap-2 mb-1.5 text-white font-bold">
                <HelpCircle className="w-4 h-4 text-[#FF2E97]" />
                <span>Offline Availability</span>
              </div>
              <p>
                BYTE BATTLE is built with offline-first Progressive Web App (PWA) caching. Click &quot;Install the arcade&quot; on the home page to add the arcade to your home screen or desktop.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
