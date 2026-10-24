'use client';

import React, { Suspense } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
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

function GamePlayContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

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
      {/* Universal Floating Top-Middle Quit Button */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
        <button
          onClick={handleExit}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#0D0D22]/90 hover:bg-[#1E1E3F] border border-[#FF2E97]/70 text-[#FF2E97] hover:text-white font-pixel text-[10px] tracking-wider transition-all shadow-[0_0_16px_rgba(255,46,151,0.35)] active:scale-95 cursor-pointer backdrop-blur-md"
          title="Quit to Games Menu"
          aria-label="Quit game and return to games"
        >
          <span className="text-xs">✕</span>
          <span>QUIT GAME</span>
        </button>
      </div>

      {renderGame()}
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
