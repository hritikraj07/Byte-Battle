'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, RotateCcw, Trophy, Sparkles, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Award, Zap } from 'lucide-react';
import { useAudio } from '@/hooks/useAudio';
import { saveGameAttempt, db, getOrCreateParticipant } from '@/services/db';
import { GameLeaderboardModal } from '@/components/leaderboard/GameLeaderboardModal';

interface Game2048ArenaProps {
  difficulty?: string;
  nickname?: string;
  onExit?: () => void;
}

type Board = number[][];

const BOARD_SIZE = 4;

function createEmptyBoard(): Board {
  return Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(0));
}

function getEmptyCells(board: Board): [number, number][] {
  const empty: [number, number][] = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] === 0) empty.push([r, c]);
    }
  }
  return empty;
}

function spawnRandomTile(board: Board): Board {
  const empty = getEmptyCells(board);
  if (empty.length === 0) return board;
  const [r, c] = empty[Math.floor(Math.random() * empty.length)];
  const newBoard = board.map(row => [...row]);
  newBoard[r][c] = Math.random() < 0.9 ? 2 : 4;
  return newBoard;
}

function slideAndMergeRow(row: number[]): { newRow: number[]; points: number; moved: boolean } {
  const filtered = row.filter(val => val !== 0);
  const result: number[] = [];
  let points = 0;
  let i = 0;

  while (i < filtered.length) {
    if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
      const mergedVal = filtered[i] * 2;
      result.push(mergedVal);
      points += mergedVal;
      i += 2;
    } else {
      result.push(filtered[i]);
      i += 1;
    }
  }

  while (result.length < BOARD_SIZE) {
    result.push(0);
  }

  const moved = result.some((val, idx) => val !== row[idx]);
  return { newRow: result, points, moved };
}

function rotateBoard(board: Board): Board {
  const rotated = createEmptyBoard();
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      rotated[c][BOARD_SIZE - 1 - r] = board[r][c];
    }
  }
  return rotated;
}

function moveLeft(board: Board): { newBoard: Board; points: number; moved: boolean } {
  let moved = false;
  let points = 0;
  const newBoard = board.map(row => {
    const res = slideAndMergeRow(row);
    if (res.moved) moved = true;
    points += res.points;
    return res.newRow;
  });
  return { newBoard, points, moved };
}

function moveRight(board: Board): { newBoard: Board; points: number; moved: boolean } {
  let moved = false;
  let points = 0;
  const newBoard = board.map(row => {
    const reversed = [...row].reverse();
    const res = slideAndMergeRow(reversed);
    if (res.moved) moved = true;
    points += res.points;
    return res.newRow.reverse();
  });
  return { newBoard, points, moved };
}

function moveUp(board: Board): { newBoard: Board; points: number; moved: boolean } {
  // Rotate 270 deg (or rotate 3 times), move left, rotate back
  let rotated = rotateBoard(rotateBoard(rotateBoard(board)));
  const res = moveLeft(rotated);
  const finalBoard = rotateBoard(res.newBoard);
  return { newBoard: finalBoard, points: res.points, moved: res.moved };
}

function moveDown(board: Board): { newBoard: Board; points: number; moved: boolean } {
  let rotated = rotateBoard(board);
  const res = moveLeft(rotated);
  const finalBoard = rotateBoard(rotateBoard(rotateBoard(res.newBoard)));
  return { newBoard: finalBoard, points: res.points, moved: res.moved };
}

function hasLegalMoves(board: Board): boolean {
  if (getEmptyCells(board).length > 0) return true;
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const current = board[r][c];
      if (c + 1 < BOARD_SIZE && board[r][c + 1] === current) return true;
      if (r + 1 < BOARD_SIZE && board[r + 1][c] === current) return true;
    }
  }
  return false;
}

const TILE_STYLES: Record<number, { bg: string; text: string; border: string; glow: string }> = {
  2: { bg: 'bg-[#121B30]', text: 'text-[#00F0FF]', border: 'border-[#00F0FF]/40', glow: 'shadow-[0_0_12px_rgba(0,240,255,0.2)]' },
  4: { bg: 'bg-[#142342]', text: 'text-[#38BDF8]', border: 'border-[#38BDF8]/50', glow: 'shadow-[0_0_12px_rgba(56,189,248,0.25)]' },
  8: { bg: 'bg-[#25173F]', text: 'text-[#E879F9]', border: 'border-[#C084FC]/60', glow: 'shadow-[0_0_14px_rgba(192,132,252,0.3)]' },
  16: { bg: 'bg-[#311746]', text: 'text-[#F472B6]', border: 'border-[#F472B6]/70', glow: 'shadow-[0_0_16px_rgba(244,114,182,0.35)]' },
  32: { bg: 'bg-[#3F1735]', text: 'text-[#FB7185]', border: 'border-[#FB7185]/70', glow: 'shadow-[0_0_18px_rgba(251,113,133,0.4)]' },
  64: { bg: 'bg-[#4C1720]', text: 'text-[#F87171]', border: 'border-[#F87171]/80', glow: 'shadow-[0_0_20px_rgba(248,113,113,0.45)]' },
  128: { bg: 'bg-[#3E250A]', text: 'text-[#FBBF24]', border: 'border-[#FBBF24]/80', glow: 'shadow-[0_0_22px_rgba(251,191,36,0.5)]' },
  256: { bg: 'bg-[#3A2D0A]', text: 'text-[#FDE047]', border: 'border-[#FDE047]', glow: 'shadow-[0_0_24px_rgba(253,224,71,0.55)]' },
  512: { bg: 'bg-[#0E3D20]', text: 'text-[#4ADE80]', border: 'border-[#4ADE80]', glow: 'shadow-[0_0_26px_rgba(74,222,128,0.6)]' },
  1024: { bg: 'bg-[#064E3B]', text: 'text-[#34D399]', border: 'border-[#34D399]', glow: 'shadow-[0_0_28px_rgba(52,211,153,0.7)]' },
  2048: { bg: 'bg-gradient-to-br from-[#FF8B3D] to-[#FF2E97]', text: 'text-white', border: 'border-white', glow: 'shadow-[0_0_35px_rgba(255,46,151,0.85)]' },
};

export const Game2048Arena: React.FC<Game2048ArenaProps> = ({
  difficulty = 'medium',
  nickname: initialNickname = '',
  onExit = () => window.history.back(),
}) => {
  const { playSound } = useAudio();
  const [board, setBoard] = useState<Board>(createEmptyBoard);
  const [score, setScore] = useState(0);
  const [personalBest, setPersonalBest] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [hasWon2048, setHasWon2048] = useState(false);
  const [keepPlayingAfterWin, setKeepPlayingAfterWin] = useState(false);
  const [movesCount, setMovesCount] = useState(0);
  const [highestTile, setHighestTile] = useState(2);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);

  const [playerName, setPlayerName] = useState(initialNickname || 'Player');
  const [participantId, setParticipantId] = useState('practice-user');
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  // Initialize participant
  useEffect(() => {
    const active = initialNickname || (typeof window !== 'undefined' ? sessionStorage.getItem('bytebattle_active_player') || 'CyberSlidr' : 'CyberSlidr');
    setPlayerName(active);
    getOrCreateParticipant('practice-session', active)
      .then((p) => setParticipantId(p.id))
      .catch(() => setParticipantId(`p-${Date.now()}`));
  }, [initialNickname]);

  // Load High Score
  useEffect(() => {
    async function loadBest() {
      try {
        const pb = await db.personalBests
          .where(['participantId', 'gameId'])
          .equals([participantId, 'game-2048'])
          .first();
        if (pb) setPersonalBest(pb.bestScore);
      } catch {
        // ignore
      }
    }
    loadBest();
  }, [participantId]);

  // Start fresh game
  const startNewGame = useCallback(() => {
    let b = createEmptyBoard();
    b = spawnRandomTile(b);
    b = spawnRandomTile(b);
    setBoard(b);
    setScore(0);
    setMovesCount(0);
    setHighestTile(4);
    setIsGameOver(false);
    setHasWon2048(false);
    setKeepPlayingAfterWin(false);
  }, []);

  useEffect(() => {
    startNewGame();
  }, [startNewGame]);

  // Commit game attempt on Game Over
  const handleGameOver = useCallback((finalScore: number, finalMoves: number) => {
    setIsGameOver(true);
    playSound('wrong');

    if (finalScore > personalBest) {
      setPersonalBest(finalScore);
    }

    saveGameAttempt({
      id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      eventId: 'practice-session',
      participantId,
      nickname: playerName,
      gameId: 'game-2048',
      puzzleId: '2048-board',
      difficulty: 'medium',
      isCorrect: true,
      score: finalScore,
      basePoints: finalScore,
      timeRemainingSeconds: 0,
      timeBonusPoints: 0,
      hintsUsed: 0,
      hintPenaltyPoints: 0,
      elapsedSeconds: Math.max(10, finalMoves * 2),
      totalRoundSeconds: 300,
      completedAt: new Date().toISOString(),
      isPractice: true,
    }).catch(console.error);
  }, [participantId, personalBest, playerName, playSound]);

  // Move handler
  const handleMove = useCallback((direction: 'left' | 'right' | 'up' | 'down') => {
    if (isGameOver) return;

    let res: { newBoard: Board; points: number; moved: boolean };
    switch (direction) {
      case 'left': res = moveLeft(board); break;
      case 'right': res = moveRight(board); break;
      case 'up': res = moveUp(board); break;
      case 'down': res = moveDown(board); break;
    }

    if (!res.moved) return;

    if (res.points > 0) {
      playSound('correct');
    } else {
      playSound('click');
    }

    const nextBoard = spawnRandomTile(res.newBoard);
    const newScore = score + res.points;
    const nextMoves = movesCount + 1;

    // Check maximum tile
    let maxT = highestTile;
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (nextBoard[r][c] > maxT) maxT = nextBoard[r][c];
      }
    }

    setBoard(nextBoard);
    setScore(newScore);
    setMovesCount(nextMoves);
    setHighestTile(maxT);

    if (newScore > personalBest) {
      setPersonalBest(newScore);
    }

    // Check 2048 victory condition
    if (maxT >= 2048 && !hasWon2048 && !keepPlayingAfterWin) {
      setHasWon2048(true);
      playSound('win');
    }

    // Check game over
    if (!hasLegalMoves(nextBoard)) {
      handleGameOver(newScore, nextMoves);
    }
  }, [board, handleGameOver, hasWon2048, highestTile, isGameOver, keepPlayingAfterWin, movesCount, personalBest, playSound, score]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd', 'W', 'A', 'S', 'D'].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') handleMove('up');
      else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') handleMove('down');
      else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') handleMove('left');
      else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') handleMove('right');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleMove]);

  // Touch Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    const threshold = 32;
    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > threshold) handleMove('right');
      else if (dx < -threshold) handleMove('left');
    } else {
      if (dy > threshold) handleMove('down');
      else if (dy < -threshold) handleMove('up');
    }
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="fixed inset-0 w-screen h-[100dvh] z-50 bg-[#080714] flex flex-col select-none overflow-hidden touch-none text-[#E8E8FF]"
    >
      {/* Leaderboard Modal */}
      <GameLeaderboardModal
        isOpen={leaderboardOpen}
        onClose={() => setLeaderboardOpen(false)}
        gameId="game-2048"
        gameTitle="2048 Neo"
        currentParticipantId={participantId}
      />

      {/* TOP HUD */}
      <header className="h-16 px-4 sm:px-6 flex items-center justify-between bg-[#0E0C22]/85 backdrop-blur-md border-b border-[#24244A] flex-shrink-0 z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={onExit}
            className="p-2.5 rounded-xl bg-[#141432] hover:bg-[#1E1E45] border border-[#24244A] text-[#8A8AB8] hover:text-white transition-colors"
            title="Exit to Games"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black font-mono text-[#00F0FF] tracking-wider uppercase">
                2048 NEO
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#FF2E97]/15 text-[#FF2E97] border border-[#FF2E97]/30 uppercase">
                Endless Mode
              </span>
            </div>
            <span className="text-[10px] font-mono text-[#8A8AB8] hidden sm:inline">
              Swipe or use Arrow keys / WASD to merge tiles
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 font-mono">
          <div className="text-right">
            <span className="text-[10px] text-[#8A8AB8] uppercase block leading-none">Score</span>
            <span className="text-xl sm:text-2xl font-black text-[#00F0FF] leading-tight">{score}</span>
          </div>

          <div className="text-right hidden sm:block">
            <span className="text-[10px] text-[#8A8AB8] uppercase block leading-none">High Score</span>
            <span className="text-xl sm:text-2xl font-black text-[#FFE45E] leading-tight">{personalBest}</span>
          </div>

          <button
            onClick={() => setLeaderboardOpen(true)}
            className="p-2.5 rounded-xl bg-[#141432] hover:bg-[#1E1E45] border border-[#24244A] text-[#8A8AB8] hover:text-white transition-colors"
            title="Leaderboard"
          >
            <Trophy className="w-5 h-5 text-[#FFE45E]" />
          </button>
        </div>
      </header>

      {/* ARENA PLAYFIELD */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 relative z-10">
        {/* Board Container */}
        <div className="relative p-3.5 sm:p-4 rounded-3xl bg-[#0E0C22] border-2 border-[#3D2E70] shadow-[0_0_40px_rgba(36,27,74,0.6)]">
          {/* 4x4 Grid Matrix */}
          <div className="grid grid-cols-4 gap-2.5 sm:gap-3.5">
            {board.map((row, r) =>
              row.map((val, c) => {
                const style = val > 0 ? TILE_STYLES[val] || {
                  bg: 'bg-gradient-to-br from-[#701A75] to-[#EC4899]',
                  text: 'text-white',
                  border: 'border-white',
                  glow: 'shadow-[0_0_30px_rgba(236,72,153,0.8)]',
                } : null;

                return (
                  <div
                    key={`${r}-${c}`}
                    className={`w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-2xl flex items-center justify-center font-mono font-black transition-all ${
                      val === 0
                        ? 'bg-[#151230]/70 border border-[#2A2352]/50'
                        : `${style?.bg} ${style?.text} border-2 ${style?.border} ${style?.glow} scale-100 animate-scaleIn`
                    }`}
                  >
                    {val > 0 && (
                      <span
                        className={`tracking-tight ${
                          val >= 1024
                            ? 'text-lg sm:text-xl md:text-2xl'
                            : val >= 128
                            ? 'text-xl sm:text-2xl md:text-3xl'
                            : 'text-2xl sm:text-3xl md:text-4xl'
                        }`}
                      >
                        {val}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* 2048 Victory Modal (Can Continue to Endless) */}
          {hasWon2048 && !keepPlayingAfterWin && (
            <div className="absolute inset-0 bg-[#080714]/90 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center p-6 text-center animate-fadeIn z-30">
              <Award className="w-14 h-14 text-[#FFE45E] mb-2 animate-bounce" />
              <h2 className="text-2xl sm:text-3xl font-black font-mono text-[#FFE45E] mb-1 uppercase tracking-tight">
                2048 ACHIEVED!
              </h2>
              <p className="text-xs text-[#8A8AB8] font-mono mb-6 max-w-xs">
                Incredible computational synthesis! You merged the legendary 2048 tile.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setKeepPlayingAfterWin(true)}
                  className="px-5 py-2.5 rounded-xl bg-[#00F0FF] text-[#05050D] font-mono font-bold text-xs shadow-[0_0_16px_rgba(0,240,255,0.4)] hover:bg-[#38BDF8]"
                >
                  KEEP PLAYING (ENDLESS)
                </button>
                <button
                  onClick={startNewGame}
                  className="px-4 py-2.5 rounded-xl bg-[#141432] border border-[#24244A] text-white font-mono font-bold text-xs hover:bg-[#1E1E45]"
                >
                  NEW GAME
                </button>
              </div>
            </div>
          )}

          {/* Game Over Modal */}
          {isGameOver && (
            <div className="absolute inset-0 bg-[#080714]/92 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center p-6 text-center animate-fadeIn z-30">
              <Zap className="w-14 h-14 text-[#FF2E97] mb-2" />
              <h2 className="text-2xl sm:text-3xl font-black font-mono text-[#FF2E97] mb-1 uppercase tracking-tight">
                NO LEGAL MOVES!
              </h2>
              <p className="text-xs text-[#8A8AB8] font-mono mb-4">
                Peak tile reached: <strong className="text-[#FFE45E] font-bold">{highestTile}</strong> • Final score:
              </p>
              <div className="text-4xl font-black font-mono text-[#00F0FF] mb-6">
                {score} pts
              </div>
              <div className="flex gap-3">
                <button
                  onClick={startNewGame}
                  className="px-5 py-2.5 rounded-xl bg-[#00F0FF] text-[#05050D] font-mono font-bold text-xs shadow-[0_0_16px_rgba(0,240,255,0.4)] hover:bg-[#38BDF8] flex items-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>PLAY AGAIN</span>
                </button>
                <button
                  onClick={onExit}
                  className="px-4 py-2.5 rounded-xl bg-[#141432] border border-[#24244A] text-white font-mono font-bold text-xs hover:bg-[#1E1E45]"
                >
                  BACK TO GAMES
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Action Bar Below Grid: New Game + Move Controls */}
        <div className="flex items-center gap-4 mt-6">
          <button
            onClick={startNewGame}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#141432] hover:bg-[#1E1E45] border border-[#24244A] text-xs font-mono font-bold text-[#8A8AB8] hover:text-white transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>RESET BOARD</span>
          </button>
        </div>

        {/* Mobile / Screen Arrow Pad */}
        <div className="mt-4 flex flex-col items-center gap-1.5 sm:hidden">
          <button
            onClick={() => handleMove('up')}
            className="w-12 h-12 rounded-xl bg-[#141432] border border-[#24244A] flex items-center justify-center text-white active:bg-[#00F0FF] active:text-[#05050D]"
            aria-label="Move Up"
          >
            <ChevronUp className="w-6 h-6" />
          </button>
          <div className="flex gap-4">
            <button
              onClick={() => handleMove('left')}
              className="w-12 h-12 rounded-xl bg-[#141432] border border-[#24244A] flex items-center justify-center text-white active:bg-[#00F0FF] active:text-[#05050D]"
              aria-label="Move Left"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() => handleMove('down')}
              className="w-12 h-12 rounded-xl bg-[#141432] border border-[#24244A] flex items-center justify-center text-white active:bg-[#00F0FF] active:text-[#05050D]"
              aria-label="Move Down"
            >
              <ChevronDown className="w-6 h-6" />
            </button>
            <button
              onClick={() => handleMove('right')}
              className="w-12 h-12 rounded-xl bg-[#141432] border border-[#24244A] flex items-center justify-center text-white active:bg-[#00F0FF] active:text-[#05050D]"
              aria-label="Move Right"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
