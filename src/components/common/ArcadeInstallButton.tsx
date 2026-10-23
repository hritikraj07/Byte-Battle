'use client';

import React from 'react';
import { Download, Check, Share, X, Sparkles } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';

export const ArcadeInstallButton: React.FC = () => {
  const {
    isInstalled,
    showIOSGuide,
    setShowIOSGuide,
    installMessage,
    triggerInstall,
  } = usePWA();

  return (
    <div className="flex flex-col items-center relative z-20 my-4">
      <button
        type="button"
        onClick={triggerInstall}
        className="arcade-install-btn group"
        aria-label="Install the arcade — plays offline"
      >
        {isInstalled ? (
          <Check className="w-4 h-4 text-[#00F0FF]" />
        ) : (
          <Download className="w-4 h-4 text-[#00F0FF] group-hover:translate-y-0.5 transition-transform" />
        )}
        <span>{isInstalled ? 'Installed' : 'Install the arcade'}</span>
        <span className="badge-offline">plays offline</span>
      </button>

      {/* Floating feedback message */}
      {installMessage && (
        <div className="mt-3 max-w-md px-4 py-2.5 rounded-xl bg-[#0D0D22] border border-[#00F0FF]/60 text-xs font-mono text-[#E8E8FF] shadow-[0_0_20px_rgba(0,240,255,0.3)] animate-fadeIn text-center">
          {installMessage}
        </div>
      )}

      {/* iOS Installation Instruction Modal */}
      {showIOSGuide && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
          onClick={() => setShowIOSGuide(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-[#0D0D22] border border-[#00F0FF] p-6 shadow-[0_0_40px_rgba(0,240,255,0.3)] relative text-[#E8E8FF]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowIOSGuide(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-[#8A8AB8] hover:text-white bg-[#101023] border border-[#24244A]"
              aria-label="Close installation guide"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-[#00F0FF]" />
              <h3 className="font-pixel text-xs text-[#00F0FF] uppercase tracking-wide">
                Install on iOS
              </h3>
            </div>

            <p className="text-xs text-[#8A8AB8] mb-4 leading-relaxed font-sans">
              To install BYTE BATTLE on your iPhone or iPad for offline arcade play:
            </p>

            <ol className="space-y-2.5 text-xs font-mono text-[#E8E8FF] bg-[#05050D] p-3.5 rounded-xl border border-[#24244A]">
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#00F0FF]/20 text-[#00F0FF] flex items-center justify-center font-bold text-[10px]">
                  1
                </span>
                <span>Tap the <Share className="w-3.5 h-3.5 inline mx-1 text-[#00F0FF]" /> Share button</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#00F0FF]/20 text-[#00F0FF] flex items-center justify-center font-bold text-[10px]">
                  2
                </span>
                <span>Scroll down and select <strong>&quot;Add to Home Screen&quot;</strong></span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#00F0FF]/20 text-[#00F0FF] flex items-center justify-center font-bold text-[10px]">
                  3
                </span>
                <span>Tap <strong>Add</strong> in the top right corner</span>
              </li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
};
