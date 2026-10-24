'use client';

import React, { Suspense, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { Info } from 'lucide-react';
import { PatternShiftArena } from '@/games/pattern-shift/PatternShiftArena';
import { WordWeaveArena } from '@/games/word-weave/WordWeaveArena';
import { PulseJumperArena } from '@/games/pulse-jumper/PulseJumperArena';
import { ReflexRushArena } from '@/games/reflex-rush/ReflexRushArena';
import { MemoryMatrixArena } from '@/games/memory-matrix/MemoryMatrixArena';
import { ColorClashArena } from '@/games/color-clash/ColorClashArena';
import { OrbitDodgeArena } from '@/games/orbit-dodge/OrbitDodgeArena';
import { StackSprintArena } from '@/games/stack-sprint/StackSprintArena';
import { NumberBlitzArena } from '@/games/number-blitz/NumberBlitzArena';
import { MazeRunnerArena } from '@/games/maze-runner/MazeRunnerArena';
import { PixelInvadersArena } from '@/games/pixel-invaders/PixelInvadersArena';
import { Game2048Arena } from '@/games/game-2048/Game2048Arena';
import { HowToPlayModal } from '@/components/common/HowToPlayModal';

function GamePlayContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [showHowToPlay, setShowHowToPlay] = useState(false);

  const gameId = (params?.game as string) || 'pattern-shift';
  const difficulty = searchParams.get('diff') || 'easy';
  const player = searchParams.get('player') || searchParams.get('name') || '';

  const handleExit = () => {
    router.push('/games');
  };

  const renderGame = () => {
    switch (gameId) {
      case 'pattern-shift':
        return <PatternShiftArena difficulty={difficulty as 'easy' | 'medium' | 'hard'} nickname={player} onExit={handleExit} />;
      case 'word-weave':
        return <WordWeaveArena difficulty={difficulty as 'easy' | 'medium' | 'hard'} nickname={player} onExit={handleExit} />;
      case 'pulse-jumper':
        return <PulseJumperArena difficulty={difficulty} nickname={player} onExit={handleExit} />;
      case 'reflex-rush':
        return <ReflexRushArena difficulty={difficulty} nickname={player} onExit={handleExit} />;
      case 'memory-matrix':
        return <MemoryMatrixArena difficulty={difficulty} nickname={player} onExit={handleExit} />;
      case 'color-clash':
        return <ColorClashArena difficulty={difficulty} nickname={player} onExit={handleExit} />;
      case 'orbit-dodge':
        return <OrbitDodgeArena difficulty={difficulty} nickname={player} onExit={handleExit} />;
      case 'stack-sprint':
        return <StackSprintArena difficulty={difficulty} nickname={player} onExit={handleExit} />;
      case 'number-blitz':
        return <NumberBlitzArena difficulty={difficulty} nickname={player} onExit={handleExit} />;
      case 'maze-runner':
        return <MazeRunnerArena difficulty={difficulty} nickname={player} onExit={handleExit} />;
      case 'pixel-invaders':
        return <PixelInvadersArena difficulty={difficulty} nickname={player} onExit={handleExit} />;
      case 'game-2048':
        return <Game2048Arena difficulty={difficulty} nickname={player} onExit={handleExit} />;
      default:
        return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 font-sans text-[#E8E8FF]">
            <h2 className="font-pixel text-lg text-white mb-2 uppercase">Arena Not Active</h2>
            <p className="text-[#8A8AB8] mb-6 max-w-md font-sans">
              This challenge is not part of the active BYTE BATTLE arcade roster. Pick one of our active arcade games.
            </p>
            <button
              onClick={() => router.push('/games')}
              className="py-3 px-6 rounded-full bg-[#00F0FF] text-[#05050D] font-pixel text-xs shadow-[0_0_16px_rgba(0,240,255,0.4)]"
            >
              Explore Active Arcade
            </button>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 w-screen h-[100dvh] overflow-hidden select-none bg-[#05050D] z-50 flex flex-col justify-center items-center relative">
      <div className="scanlines" aria-hidden="true" />

      {/* Floating Universal How-to-Play Info Button */}
      <button
        onClick={() => setShowHowToPlay(true)}
        className="fixed top-3.5 right-4 z-50 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0E1322]/90 hover:bg-[#1E293B] border border-[#00F0FF]/50 text-[#00F0FF] hover:text-white text-xs font-mono font-bold shadow-[0_0_14px_rgba(0,240,255,0.3)] transition-all cursor-pointer backdrop-blur-md"
        title="View game instructions, controls and scoring rules"
      >
        <Info className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">HOW TO PLAY</span>
        <span className="sm:hidden">INFO</span>
      </button>

      {renderGame()}

      {/* Universal Instructions Modal */}
      <HowToPlayModal
        isOpen={showHowToPlay}
        gameId={gameId}
        onClose={() => setShowHowToPlay(false)}
      />
    </div>
  );
}

export default function GamePlayPage() {
  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 w-screen h-[100dvh] bg-[#05050D] z-50 flex flex-col justify-center items-center font-pixel text-xs text-[#00F0FF]">
          LOADING ARENA...
        </div>
      }
    >
      <GamePlayContent />
    </Suspense>
  );
}
