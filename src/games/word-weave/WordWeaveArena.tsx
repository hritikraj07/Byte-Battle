'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { WordWeavePuzzle, WordLadderPuzzle, WordCategoryPuzzle, Difficulty } from '@/types/puzzle';
import { getRandomPuzzle } from '@/services/puzzleRandomizer';
import { useTimer } from '@/hooks/useTimer';
import { useAudio } from '@/hooks/useAudio';
import { calculateScore, ScoreBreakdown } from '@/services/scoring';
import { saveGameAttempt, db, getOrCreateParticipant } from '@/services/db';
import { GameHUD } from '@/components/common/GameHUD';
import { RoundResultsModal } from '@/components/common/RoundResultsModal';
import { GameLeaderboardModal } from '@/components/leaderboard/GameLeaderboardModal';
import { PlayerNameModal } from '@/components/common/PlayerNameModal';
import { ArrowDown, Check, AlertCircle, Lightbulb, RefreshCw, ArrowRight, Play } from 'lucide-react';

interface WordWeaveArenaProps {
  difficulty?: Difficulty;
  isEventMode?: boolean;
  participantId?: string;
  nickname?: string;
  eventId?: string;
  roundDurationSeconds?: number;
  onFinish?: (score: number) => void;
  onExit?: () => void;
}

export const WordWeaveArena: React.FC<WordWeaveArenaProps> = ({
  difficulty: initialDifficulty = 'easy',
  isEventMode = false,
  participantId: initialParticipantId = '',
  nickname: initialNickname = '',
  eventId = null,
  roundDurationSeconds = 90,
  onFinish,
  onExit = () => window.history.back(),
}) => {
  const { playSound } = useAudio();

  // Difficulty scoped strictly to this arena
  const [difficulty, setDifficulty] = useState<Difficulty>(initialDifficulty);

  // Player Name Confirmation State
  const [confirmedNickname, setConfirmedNickname] = useState<string>(initialNickname);
  const [activeParticipantId, setActiveParticipantId] = useState<string>(initialParticipantId);
  const [nameModalOpen, setNameModalOpen] = useState(false);

  // Dynamic randomized puzzle state
  const [currentPuzzle, setCurrentPuzzle] = useState<WordWeavePuzzle | null>(null);

  // Ladder state
  const [ladderSteps, setLadderSteps] = useState<string[]>([]);
  const [nextLadderInput, setNextLadderInput] = useState('');

  // Category state
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isCategorySolved, setIsCategorySolved] = useState(false);

  // Hints strictly tracked per puzzle ID
  const [hintsUsed, setHintsUsed] = useState(0);

  // Feedback states
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');
  const [canAdvanceNext, setCanAdvanceNext] = useState(false);

  const [isGameOver, setIsGameOver] = useState(false);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const [personalBest, setPersonalBest] = useState(0);

  const [scoreBreakdown, setScoreBreakdown] = useState<ScoreBreakdown>({
    score: 0,
    basePoints: 0,
    timeBonusPoints: 0,
    hintPenaltyPoints: 0,
    elapsedSeconds: 0,
    accuracy: 0,
  });

  // Check if player name has been confirmed
  useEffect(() => {
    if (!confirmedNickname) {
      const remembered = typeof window !== 'undefined' ? localStorage.getItem('bytebattle_remembered_nickname') || '' : '';
      if (remembered) {
        setConfirmedNickname(remembered);
      }
      // Always require confirmation before new game session
      setNameModalOpen(true);
    }
  }, [confirmedNickname]);

  // Pick non-repeating puzzle
  const loadNewPuzzle = useCallback(() => {
    const puzzle = getRandomPuzzle<WordWeavePuzzle>('word-weave', difficulty);
    setCurrentPuzzle(puzzle);
    setHintsUsed(0);
    setFeedback(null);
    setFeedbackMessage('');
    setCanAdvanceNext(false);
    setIsCategorySolved(false);

    if (puzzle && puzzle.type === 'ladder') {
      setLadderSteps([puzzle.startWord]);
      setNextLadderInput('');
    } else if (puzzle && puzzle.type === 'category') {
      setSelectedItems([]);
    }
  }, [difficulty]);

  useEffect(() => {
    loadNewPuzzle();
  }, [loadNewPuzzle]);

  // Load personal best
  useEffect(() => {
    const pId = activeParticipantId || 'practice-user';
    db.personalBests
      .where(['participantId', 'gameId'])
      .equals([pId, 'word-weave'])
      .first()
      .then((pb) => {
        if (pb) setPersonalBest(pb.bestScore);
      })
      .catch(() => {});
  }, [activeParticipantId]);

  const handleTimeout = useCallback(() => {
    if (!currentPuzzle) return;
    playSound('wrong');
    setIsGameOver(true);
    const breakdown = calculateScore({
      difficulty: currentPuzzle.difficulty,
      isCorrect: false,
      timeRemainingSeconds: 0,
      totalRoundSeconds: roundDurationSeconds,
      hintsUsed,
    });
    setScoreBreakdown(breakdown);

    const pId = activeParticipantId || `p-${Date.now()}`;
    const pName = confirmedNickname || 'Player';

    saveGameAttempt({
      id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      eventId,
      participantId: pId,
      nickname: pName,
      gameId: 'word-weave',
      puzzleId: currentPuzzle.id,
      difficulty: currentPuzzle.difficulty,
      isCorrect: false,
      score: 0,
      basePoints: 0,
      timeRemainingSeconds: 0,
      timeBonusPoints: 0,
      hintsUsed,
      hintPenaltyPoints: breakdown.hintPenaltyPoints,
      elapsedSeconds: roundDurationSeconds,
      totalRoundSeconds: roundDurationSeconds,
      completedAt: new Date().toISOString(),
      isPractice: !isEventMode,
    }).catch(console.error);

    if (onFinish) onFinish(0);
  }, [currentPuzzle, eventId, hintsUsed, isEventMode, confirmedNickname, activeParticipantId, onFinish, playSound, roundDurationSeconds]);

  const { secondsLeft, formattedTime, reset, pause, addPenalty } = useTimer({
    initialSeconds: roundDurationSeconds,
    onTimeout: handleTimeout,
    autoStart: !nameModalOpen,
  });

  // Hints strictly tracked per puzzle
  const handleUseHint = () => {
    if (hintsUsed < 2) {
      playSound('click');
      setHintsUsed((prev) => prev + 1);
      addPenalty(5);
    }
  };

  // Name confirmation handler
  const handleConfirmName = async (name: string) => {
    setConfirmedNickname(name);
    try {
      const p = await getOrCreateParticipant(eventId || 'practice-session', name);
      setActiveParticipantId(p.id);
    } catch {
      setActiveParticipantId(`p-${Date.now()}`);
    }
    setNameModalOpen(false);
    reset(roundDurationSeconds);
  };

  // 1. Ladder Flow
  const handleAddLadderStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPuzzle || currentPuzzle.type !== 'ladder') return;
    const ladder = currentPuzzle as WordLadderPuzzle;

    const guess = nextLadderInput.trim().toUpperCase();
    if (!guess) return;

    const currentWord = ladderSteps[ladderSteps.length - 1];

    if (guess.length !== currentWord.length) {
      setFeedbackMessage(`Word must have exactly ${currentWord.length} letters!`);
      playSound('wrong');
      return;
    }

    let diff = 0;
    for (let i = 0; i < currentWord.length; i++) {
      if (currentWord[i] !== guess[i]) diff++;
    }

    if (diff !== 1) {
      setFeedbackMessage('You must change exactly 1 letter from previous word!');
      playSound('wrong');
      return;
    }

    playSound('click');
    const newSteps = [...ladderSteps, guess];
    setLadderSteps(newSteps);
    setNextLadderInput('');
    setFeedbackMessage('');

    if (guess === ladder.targetWord.toUpperCase()) {
      pause();
      playSound('correct');
      setFeedback('correct');

      const breakdown = calculateScore({
        difficulty: ladder.difficulty,
        isCorrect: true,
        timeRemainingSeconds: secondsLeft,
        totalRoundSeconds: roundDurationSeconds,
        hintsUsed,
      });

      setScoreBreakdown(breakdown);
      if (breakdown.score > personalBest) setPersonalBest(breakdown.score);

      const pId = activeParticipantId || `p-${Date.now()}`;
      const pName = confirmedNickname || 'Player';

      saveGameAttempt({
        id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        eventId,
        participantId: pId,
        nickname: pName,
        gameId: 'word-weave',
        puzzleId: ladder.id,
        difficulty: ladder.difficulty,
        isCorrect: true,
        score: breakdown.score,
        basePoints: breakdown.basePoints,
        timeRemainingSeconds: secondsLeft,
        timeBonusPoints: breakdown.timeBonusPoints,
        hintsUsed,
        hintPenaltyPoints: breakdown.hintPenaltyPoints,
        elapsedSeconds: breakdown.elapsedSeconds,
        totalRoundSeconds: roundDurationSeconds,
        completedAt: new Date().toISOString(),
        isPractice: !isEventMode,
      }).catch(console.error);

      setTimeout(() => {
        setIsGameOver(true);
        if (onFinish) onFinish(breakdown.score);
      }, 1000);
    }
  };

  // 2. Category Selection Flow
  const handleToggleCategoryItem = (item: string) => {
    if (isGameOver || !currentPuzzle || currentPuzzle.type !== 'category' || isCategorySolved) return;

    playSound('click');
    setFeedbackMessage('');

    if (selectedItems.includes(item)) {
      setSelectedItems((prev) => prev.filter((i) => i !== item));
    } else {
      if (selectedItems.length < 4) {
        setSelectedItems((prev) => [...prev, item]);
      }
    }
  };

  const handleVerifyCategoryGroup = () => {
    if (!currentPuzzle || currentPuzzle.type !== 'category') return;
    const cat = currentPuzzle as WordCategoryPuzzle;

    if (selectedItems.length !== 4) {
      setFeedbackMessage('Please select exactly 4 related terms to form a group.');
      playSound('wrong');
      return;
    }

    const targetCategory = cat.categories[0];
    const isAllCorrect = targetCategory.items.every((it) => selectedItems.includes(it));

    if (isAllCorrect) {
      pause();
      playSound('correct');
      setIsCategorySolved(true);
      setFeedback('correct');
      setCanAdvanceNext(true);
      setFeedbackMessage(`✓ Correct! All 4 terms belong to ${targetCategory.name}!`);

      const breakdown = calculateScore({
        difficulty: cat.difficulty,
        isCorrect: true,
        timeRemainingSeconds: secondsLeft,
        totalRoundSeconds: roundDurationSeconds,
        hintsUsed,
      });

      setScoreBreakdown(breakdown);
      if (breakdown.score > personalBest) setPersonalBest(breakdown.score);

      const pId = activeParticipantId || `p-${Date.now()}`;
      const pName = confirmedNickname || 'Player';

      saveGameAttempt({
        id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        eventId,
        participantId: pId,
        nickname: pName,
        gameId: 'word-weave',
        puzzleId: cat.id,
        difficulty: cat.difficulty,
        isCorrect: true,
        score: breakdown.score,
        basePoints: breakdown.basePoints,
        timeRemainingSeconds: secondsLeft,
        timeBonusPoints: breakdown.timeBonusPoints,
        hintsUsed,
        hintPenaltyPoints: breakdown.hintPenaltyPoints,
        elapsedSeconds: breakdown.elapsedSeconds,
        totalRoundSeconds: roundDurationSeconds,
        completedAt: new Date().toISOString(),
        isPractice: !isEventMode,
      }).catch(console.error);
    } else {
      playSound('wrong');
      setFeedbackMessage('Not quite. Those 4 items do not form the category. Try deselecting incorrect ones.');
    }
  };

  const handleNextPuzzle = () => {
    loadNewPuzzle();
    reset(roundDurationSeconds);
  };

  const handlePlayAgain = () => {
    loadNewPuzzle();
    reset(roundDurationSeconds);
  };

  if (!currentPuzzle) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-neo-secondary">
        <RefreshCw className="w-8 h-8 animate-spin text-neo-purple mb-2" />
        <span className="font-mono text-xs">Loading Word Arena...</span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 flex flex-col items-center text-neo-text">
      {/* Player Confirmation Modal */}
      <PlayerNameModal
        isOpen={nameModalOpen}
        gameTitle="Word Weave"
        onConfirm={handleConfirmName}
        onCancel={() => {
          setNameModalOpen(false);
          onExit();
        }}
      />

      {/* HUD Header */}
      <div className="w-full mb-6">
        <GameHUD
          gameTitle="Word Weave"
          difficulty={currentPuzzle.difficulty}
          puzzleId={currentPuzzle.id}
          formattedTime={formattedTime}
          secondsLeft={secondsLeft}
          hintsUsed={hintsUsed}
          maxHints={2}
          onUseHint={handleUseHint}
          onExit={onExit}
          onOpenLeaderboard={() => setLeaderboardOpen(true)}
          personalBest={personalBest}
        />
      </div>

      {/* Main Card */}
      <div className="w-full bg-neo-surface border border-neo-border rounded-3xl p-6 sm:p-8 shadow-arcade-card relative">
        {/* Category Pill & Scoped Difficulty Selector */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-neo-border">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-neo-purple/15 text-neo-purple border border-neo-purple/30 uppercase tracking-wider">
              {currentPuzzle.type === 'ladder' ? 'Word Ladder' : 'Semantic Category Clusters'}
            </span>
            <span className="text-xs font-mono text-neo-secondary">ID: {currentPuzzle.id}</span>
          </div>

          {/* Difficulty Selector Scoped Strictly to Word Weave */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-neo-bg border border-neo-border">
            {(['easy', 'medium', 'hard'] as const).map((diff) => (
              <button
                key={diff}
                onClick={() => {
                  setDifficulty(diff);
                  playSound('click');
                }}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase transition-all ${
                  difficulty === diff
                    ? diff === 'easy'
                      ? 'bg-[#3B82F6] text-white font-black shadow-md'
                      : diff === 'medium'
                      ? 'bg-[#22C55E] text-slate-950 font-black shadow-md'
                      : 'bg-[#EF4444] text-white font-black shadow-md'
                    : 'text-neo-secondary hover:text-white'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>

        {/* Prompt */}
        <h2 className="text-lg sm:text-xl font-bold text-white mb-6 leading-relaxed">
          {currentPuzzle.prompt}
        </h2>

        {/* Feedback message banner */}
        {feedbackMessage && (
          <div
            className={`mb-6 p-4 rounded-2xl text-xs sm:text-sm font-mono flex items-center gap-2.5 animate-fadeIn ${
              feedbackMessage.startsWith('✓')
                ? 'bg-neo-lime/15 text-neo-lime border border-neo-lime/40'
                : 'bg-neo-coral/15 text-neo-coral border border-neo-coral/40'
            }`}
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="font-semibold">{feedbackMessage}</span>
          </div>
        )}

        {/* MODE 1: WORD LADDER */}
        {currentPuzzle.type === 'ladder' && (
          <div className="space-y-6">
            <div className="flex flex-col items-center justify-center py-6 px-4 rounded-2xl bg-neo-bg border border-neo-border space-y-3">
              {ladderSteps.map((step, idx) => (
                <React.Fragment key={idx}>
                  <div
                    className={`py-3 px-8 rounded-xl font-mono font-black text-xl tracking-widest text-center shadow-md ${
                      idx === 0
                        ? 'bg-neo-purple/20 border border-neo-purple text-neo-purple'
                        : 'bg-neo-surface border border-neo-border text-white'
                    }`}
                  >
                    {step}
                  </div>
                  {idx < ladderSteps.length && (
                    <ArrowDown className="w-4 h-4 text-neo-secondary" />
                  )}
                </React.Fragment>
              ))}

              {/* Target Word */}
              <div className="py-3 px-8 rounded-xl font-mono font-black text-xl tracking-widest text-center bg-neo-lime/20 border border-neo-lime text-neo-lime shadow-neo-lime">
                {(currentPuzzle as WordLadderPuzzle).targetWord}
              </div>
            </div>

            {/* Input next step */}
            <form onSubmit={handleAddLadderStep} className="flex gap-3">
              <input
                type="text"
                maxLength={(currentPuzzle as WordLadderPuzzle).startWord.length}
                value={nextLadderInput}
                onChange={(e) => setNextLadderInput(e.target.value)}
                placeholder={`Next 1-letter change (${(currentPuzzle as WordLadderPuzzle).startWord.length} letters)`}
                className="flex-1 py-3.5 px-4 rounded-2xl bg-neo-bg border border-neo-border text-white font-mono font-bold text-center uppercase tracking-widest focus:outline-none focus:border-neo-purple"
              />
              <button
                type="submit"
                disabled={!nextLadderInput.trim()}
                className="px-6 py-3.5 rounded-2xl bg-neo-purple hover:bg-purple-500 text-white font-mono font-black text-xs tracking-wider transition-all disabled:opacity-40"
              >
                SUBMIT STEP
              </button>
            </form>
          </div>
        )}

        {/* MODE 2: CATEGORY CLUSTERS */}
        {currentPuzzle.type === 'category' && (
          <div className="space-y-6">
            {/* Shuffled Tiles Matrix: Clearly rendered 8 tiles with spacing */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono text-neo-secondary font-bold uppercase tracking-wider">
                  Select 4 Related Terms
                </span>
                <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full border ${
                  selectedItems.length === 4
                    ? 'bg-neo-lime/20 border-neo-lime text-neo-lime'
                    : 'bg-neo-bg border-neo-border text-neo-secondary'
                }`}>
                  {selectedItems.length} / 4 Selected
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                {(currentPuzzle as WordCategoryPuzzle).allShuffledItems.map((item, idx) => {
                  const isSelected = selectedItems.includes(item);
                  const isTargetItem = (currentPuzzle as WordCategoryPuzzle).categories[0].items.includes(item);

                  return (
                    <button
                      key={idx}
                      onClick={() => handleToggleCategoryItem(item)}
                      disabled={isCategorySolved}
                      className={`min-h-[58px] py-3.5 px-3 rounded-2xl font-mono font-bold text-xs sm:text-sm text-center border transition-all active:scale-95 flex items-center justify-center ${
                        isCategorySolved && isTargetItem
                          ? 'bg-neo-lime text-slate-950 border-neo-lime shadow-neo-lime font-black'
                          : isSelected
                          ? 'bg-neo-purple text-white border-neo-purple shadow-neo-purple ring-2 ring-neo-purple font-black'
                          : 'bg-neo-bg text-slate-200 border-neo-border hover:border-neo-purple/50 hover:bg-neo-cardHover'
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-neo-border">
              {canAdvanceNext ? (
                <button
                  onClick={handleNextPuzzle}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-neo-lime hover:bg-lime-300 text-slate-950 font-black font-mono text-sm tracking-wide shadow-neo-lime flex items-center justify-center gap-2 cursor-pointer transition-all ml-auto animate-bounce"
                >
                  <span>NEXT QUESTION</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <div className="w-full flex items-center justify-between gap-3">
                  <button
                    onClick={() => setSelectedItems([])}
                    disabled={selectedItems.length === 0 || isCategorySolved}
                    className="text-xs font-mono text-neo-secondary hover:text-white disabled:opacity-30 transition-colors"
                  >
                    Clear selection
                  </button>

                  <button
                    onClick={handleVerifyCategoryGroup}
                    disabled={selectedItems.length !== 4 || isCategorySolved}
                    className={`px-8 py-3.5 rounded-2xl font-mono font-black text-sm tracking-wide transition-all shadow-md flex items-center justify-center gap-2 ${
                      selectedItems.length === 4 && !isCategorySolved
                        ? 'bg-neo-purple hover:bg-purple-500 text-white shadow-neo-purple cursor-pointer'
                        : 'bg-neo-bg text-neo-secondary border border-neo-border opacity-40 cursor-not-allowed'
                    }`}
                  >
                    <span>VERIFY GROUP (4/4)</span>
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Progressive Hints Drawer (Strictly resets per puzzle ID) */}
        {hintsUsed > 0 && (
          <div className="mt-6 p-4 rounded-2xl bg-neo-purple/10 border border-neo-purple/30 text-xs font-mono text-slate-300 space-y-2 animate-fadeIn">
            <div className="flex items-center gap-1.5 text-neo-purple font-bold">
              <Lightbulb className="w-4 h-4" />
              <span>HINT TELEMETRY ({hintsUsed}/2 UNLOCKED • PENALTY APPLIED)</span>
            </div>
            {hintsUsed >= 1 && <p>• {currentPuzzle.hints[0]}</p>}
            {hintsUsed >= 2 && <p>• {currentPuzzle.hints[1]}</p>}
          </div>
        )}
      </div>

      {/* Results Modal */}
      <RoundResultsModal
        isOpen={isGameOver}
        isCorrect={feedback === 'correct'}
        scoreBreakdown={scoreBreakdown}
        explanation={currentPuzzle.explanation}
        onPlayAgain={handlePlayAgain}
        onExit={onExit}
        isPractice={!isEventMode}
      />

      {/* Dedicated Independent Leaderboard Modal */}
      <GameLeaderboardModal
        gameId="word-weave"
        gameTitle="Word Weave"
        isOpen={leaderboardOpen}
        onClose={() => setLeaderboardOpen(false)}
        currentParticipantId={activeParticipantId}
      />
    </div>
  );
};
