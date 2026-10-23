'use client';

import React from 'react';
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

export default function GamePlayPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const gameId = (params?.game as string) || 'pattern-shift';
  const difficulty = searchParams.get('diff') || 'easy';

  const handleExit = () => {
    router.push('/games');
  };

  const renderGame = () => {
    switch (gameId) {
      case 'pattern-shift':
        return <PatternShiftArena difficulty={difficulty as 'easy' | 'medium' | 'hard'} onExit={handleExit} />;
      case 'word-weave':
        return <WordWeaveArena difficulty={difficulty as 'easy' | 'medium' | 'hard'} onExit={handleExit} />;
      case 'pulse-jumper':
        return <PulseJumperArena difficulty={difficulty} onExit={handleExit} />;
      case 'reflex-rush':
        return <ReflexRushArena difficulty={difficulty} onExit={handleExit} />;
      case 'memory-matrix':
        return <MemoryMatrixArena difficulty={difficulty} onExit={handleExit} />;
      case 'color-clash':
        return <ColorClashArena difficulty={difficulty} onExit={handleExit} />;
      case 'orbit-dodge':
        return <OrbitDodgeArena difficulty={difficulty} onExit={handleExit} />;
      case 'stack-sprint':
        return <StackSprintArena difficulty={difficulty} onExit={handleExit} />;
      case 'number-blitz':
        return <NumberBlitzArena difficulty={difficulty} onExit={handleExit} />;
      case 'maze-runner':
        return <MazeRunnerArena difficulty={difficulty} onExit={handleExit} />;
      case 'pixel-invaders':
        return <PixelInvadersArena difficulty={difficulty} onExit={handleExit} />;
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
    <div className="fixed inset-0 w-screen h-[100dvh] overflow-hidden select-none bg-[#05050D] z-50 flex flex-col justify-center items-center">
      {renderGame()}
    </div>
  );
}
