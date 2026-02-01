import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Language } from '../types';
import { translate } from '../i18n/translations';

interface PuzzleGameProps {
  language: Language;
  onComplete: () => void;
  onClose: () => void;
  soundEnabled?: boolean;
  volume?: number;
}

type Difficulty = 'easy' | 'medium' | 'hard';

const PUZZLE_SETS: { [key in Difficulty]: string[] } = {
  easy: ['🐰', '🥕', '🌙', '⭐'],
  medium: ['🐰', '🥕', '🌙', '⭐', '🌺', '🦋'],
  hard: ['🐰', '🥕', '🌙', '⭐', '🌺', '🦋', '🌈', '🎈', '🎁']
};

const PuzzleGame: React.FC<PuzzleGameProps> = ({ 
  language, 
  onComplete, 
  onClose,
  soundEnabled = true,
  volume = 0.4
}) => {
  const [pieces, setPieces] = useState<Array<{ id: number; emoji: string; position: number }>>([]);
  const [selectedPiece, setSelectedPiece] = useState<number | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [lastMoveFeedback, setLastMoveFeedback] = useState<'good' | 'bad' | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showDifficultySelector, setShowDifficultySelector] = useState(true); // Fix Bug 1: Track if difficulty selector should be shown
  const audioContextRef = useRef<AudioContext | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Fix Bug 1: Track animation timeout

  const correctOrder = PUZZLE_SETS[difficulty];

  // Initialize AudioContext for sound effects
  const initAudioContext = useCallback(async () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioContextRef.current;
    
    // Resume if suspended (required by browser autoplay policies)
    if (ctx.state === 'suspended') {
      try {
        await ctx.resume();
      } catch (e) {
        console.log('Could not resume AudioContext:', e);
      }
    }
    
    return ctx;
  }, []);

  // Play sound effect
  const playSound = useCallback(async (type: 'swap' | 'success' | 'error' | 'complete') => {
    // Don't play if sound is disabled
    if (!soundEnabled) {
      return;
    }

    try {
      const ctx = await initAudioContext();
      const now = ctx.currentTime;
      
      // Use user's volume setting, clamped between 0 and 1
      const userVolume = Math.max(0, Math.min(1, volume));

      const playTone = (frequency: number, startTime: number, duration: number, toneType: OscillatorType = 'sine', toneVolume: number = 0.2) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = toneType;

        // Apply user volume to the tone volume
        const finalVolume = toneVolume * userVolume;

        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(finalVolume, startTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      };

      switch (type) {
        case 'swap':
          playTone(440, now, 0.1, 'sine', 0.15); // A4 - swap sound
          break;
        case 'success':
          playTone(523.25, now, 0.1, 'sine', 0.2); // C5
          playTone(659.25, now + 0.05, 0.1, 'sine', 0.2); // E5
          break;
        case 'error':
          playTone(200, now, 0.15, 'sawtooth', 0.15); // Low error sound
          break;
        case 'complete':
          // Victory fanfare
          playTone(523.25, now, 0.15); // C5
          playTone(659.25, now + 0.1, 0.15); // E5
          playTone(783.99, now + 0.2, 0.15); // G5
          playTone(1046.50, now + 0.3, 0.3); // C6
          break;
      }
    } catch (error) {
      console.log('Sound playback error (silently ignored):', error);
      // Silently fail if audio context can't be created or played
    }
  }, [initAudioContext, soundEnabled, volume]);

  // Initialize puzzle
  const initializePuzzle = useCallback(() => {
    // Fix Bug 1: Cancel any pending animation timeout
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }
    
    const emojis = [...PUZZLE_SETS[difficulty]];
    let shuffled = [...emojis].sort(() => Math.random() - 0.5);
    
    // Ensure it's actually shuffled and not in the correct order at start
    while (shuffled.every((emoji, idx) => emoji === emojis[idx])) {
      shuffled = [...emojis].sort(() => Math.random() - 0.5);
    }

    const initialPieces = shuffled.map((emoji, index) => ({
      id: index,
      emoji: emoji,
      position: index
    }));
    setPieces(initialPieces);
    setSelectedPiece(null);
    setIsCompleted(false);
    setMoves(0);
    setTimeElapsed(0);
    setScore(0);
    setLastMoveFeedback(null);
    setIsTimerActive(false);
    setIsAnimating(false);
  }, [difficulty]);

  useEffect(() => {
    // Only auto-initialize if difficulty selector is not shown (game has started)
    if (!showDifficultySelector) {
      initializePuzzle();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty, showDifficultySelector]); // Re-initialize when difficulty changes and game has started

  // Timer effect
  useEffect(() => {
    if (isTimerActive && !isCompleted) {
      timerIntervalRef.current = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isTimerActive, isCompleted]);

  const handlePieceClick = (index: number) => {
    if (isCompleted || isAnimating) return;

    // Start timer on first move
    if (!isTimerActive && moves === 0) {
      setIsTimerActive(true);
    }

    if (selectedPiece === null) {
      setSelectedPiece(index);
      playSound('swap');
    } else if (selectedPiece === index) {
      // Clicking the same piece deselects it
      setSelectedPiece(null);
    } else {
      setIsAnimating(true);
      playSound('swap');

      // Fix Bug 1: Cancel any previous animation timeout
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }

      // Swap pieces with animation delay
      animationTimeoutRef.current = setTimeout(() => {
        const newPieces = [...pieces];
        const temp = newPieces[selectedPiece];
        newPieces[selectedPiece] = newPieces[index];
        newPieces[index] = temp;
        setPieces(newPieces);
        setSelectedPiece(null);
        
        // Fix Bug 2: Get updated values using functional updates
        setMoves(prevMoves => {
          const newMoves = prevMoves + 1;
          
          setTimeElapsed(prevTime => {
            const currentTime = prevTime;
            
            // Check if puzzle is solved
            const currentOrder = newPieces.map(p => p.emoji);
            const isSolved = currentOrder.every((emoji, idx) => emoji === correctOrder[idx]);

            // Calculate score based on moves and time (using updated values)
            if (isSolved) {
              setIsTimerActive(false);
              const baseScore = 1000;
              const moveBonus = Math.max(0, 500 - (newMoves * 10)); // Use newMoves instead of moves from closure
              const timeBonus = Math.max(0, 500 - (currentTime * 5)); // Use currentTime instead of timeElapsed from closure
              const difficultyMultiplier = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 1.5 : 2;
              const finalScore = Math.floor((baseScore + moveBonus + timeBonus) * difficultyMultiplier);
              setScore(finalScore);
              setIsCompleted(true);
              playSound('complete');
              setTimeout(() => {
                onComplete();
              }, 2000);
            } else {
              // Check if move improved the puzzle
              const beforeOrder = pieces.map(p => p.emoji);
              const beforeCorrect = beforeOrder.filter((emoji, idx) => emoji === correctOrder[idx]).length;
              const afterCorrect = currentOrder.filter((emoji, idx) => emoji === correctOrder[idx]).length;
              
              if (afterCorrect > beforeCorrect) {
                setLastMoveFeedback('good');
                playSound('success');
                setScore(prev => prev + 10);
              } else {
                setLastMoveFeedback('bad');
                playSound('error');
              }

              setTimeout(() => {
                setLastMoveFeedback(null);
              }, 800);
            }
            
            setIsAnimating(false);
            animationTimeoutRef.current = null; // Clear ref when animation completes
            return currentTime;
          });
          
          return newMoves;
        });
        animationTimeoutRef.current = null; // Clear ref when animation completes
      }, 200); // Animation delay
    }
  };

  const resetPuzzle = () => {
    setShowDifficultySelector(true); // Show difficulty selector again on reset
    // Clear pieces first, then initialize will happen when difficulty is selected
    setPieces([]);
    setSelectedPiece(null);
    setIsCompleted(false);
    setMoves(0);
    setTimeElapsed(0);
    setScore(0);
    setLastMoveFeedback(null);
    setIsTimerActive(false);
    setIsAnimating(false);
  };

  const changeDifficulty = (newDifficulty: Difficulty) => {
    setDifficulty(newDifficulty);
    // Start the game when difficulty is selected
    setShowDifficultySelector(false);
    // If it was already the same difficulty, the useEffect won't trigger, so we manually init
    if (newDifficulty === difficulty) {
      initializePuzzle();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative bg-gradient-to-br from-white via-blue-50 to-purple-50 rounded-3xl shadow-2xl p-6 border-2 border-blue-300/50 max-w-md w-full backdrop-blur-sm"
         style={{
           boxShadow: '0 20px 60px rgba(59, 130, 246, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.5) inset',
         }}>
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 via-purple-400/20 to-pink-400/20 rounded-3xl blur-xl -z-10"></div>
      
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent drop-shadow-lg"
            style={{ textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          🧩 {language === Language.HEBREW ? 'משחק פאזל' : language === Language.ENGLISH ? 'Puzzle Game' : 'Игра-пазл'}
        </h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-red-500 text-2xl transition-all duration-200 hover:scale-110 hover:rotate-90 w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-100"
          style={{ textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
        >
          ✕
        </button>
      </div>

      {/* Stats Bar */}
      {!isCompleted && (
        <div className="grid grid-cols-3 gap-3 mb-4 text-sm">
          <div className="relative bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl p-3 text-center text-white shadow-lg transform transition-all hover:scale-105"
               style={{ boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4), inset 0 1px 0 rgba(255,255,255,0.3)' }}>
            <div className="text-xs opacity-90 mb-1 font-medium">
              {language === Language.HEBREW ? 'ניקוד' : language === Language.ENGLISH ? 'Score' : 'Счет'}
            </div>
            <div className="font-bold text-xl drop-shadow-md">{score}</div>
          </div>
          <div className="relative bg-gradient-to-br from-green-400 to-green-600 rounded-xl p-3 text-center text-white shadow-lg transform transition-all hover:scale-105"
               style={{ boxShadow: '0 4px 15px rgba(34, 197, 94, 0.4), inset 0 1px 0 rgba(255,255,255,0.3)' }}>
            <div className="text-xs opacity-90 mb-1 font-medium">
              {language === Language.HEBREW ? 'מהלכים' : language === Language.ENGLISH ? 'Moves' : 'Ходы'}
            </div>
            <div className="font-bold text-xl drop-shadow-md">{moves}</div>
          </div>
          <div className="relative bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl p-3 text-center text-white shadow-lg transform transition-all hover:scale-105"
               style={{ boxShadow: '0 4px 15px rgba(168, 85, 247, 0.4), inset 0 1px 0 rgba(255,255,255,0.3)' }}>
            <div className="text-xs opacity-90 mb-1 font-medium">
              {language === Language.HEBREW ? 'זמן' : language === Language.ENGLISH ? 'Time' : 'Время'}
            </div>
            <div className="font-bold text-xl drop-shadow-md">{formatTime(timeElapsed)}</div>
          </div>
        </div>
      )}

      {/* Difficulty Selector or Puzzle Content */}
      {showDifficultySelector ? (
        <div className="mb-6 p-6 bg-blue-50/50 rounded-2xl border-2 border-dashed border-blue-200">
          <p className="text-lg text-blue-800 mb-4 text-center font-bold">
            {language === Language.HEBREW ? 'בחר רמת קושי כדי להתחיל:' : language === Language.ENGLISH ? 'Pick difficulty to start:' : 'Выбери сложность:'}
          </p>
          <div className="flex flex-col gap-3">
            {(['easy', 'medium', 'hard'] as Difficulty[]).map((diff) => (
              <button
                key={diff}
                onClick={() => changeDifficulty(diff)}
                className="group relative px-6 py-4 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 bg-white border-2 border-blue-200 hover:border-blue-500 hover:shadow-xl flex items-center justify-between"
              >
                <span className="text-2xl">
                  {diff === 'easy' ? '🌱' : diff === 'medium' ? '🌿' : '🌳'}
                </span>
                <span className="text-xl text-gray-800">
                  {language === Language.HEBREW 
                    ? diff === 'easy' ? 'קל (4 חלקים)' : diff === 'medium' ? 'בינוני (6 חלקים)' : 'קשה (9 חלקים)'
                    : language === Language.ENGLISH
                    ? diff.charAt(0).toUpperCase() + diff.slice(1)
                    : diff === 'easy' ? 'Легко' : diff === 'medium' ? 'Средне' : 'Сложно'}
                </span>
                <span className="text-blue-400 group-hover:translate-x-1 transition-transform">◀</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Feedback Message */}
          {lastMoveFeedback && (
            <div className={`mb-3 text-center font-bold text-lg animate-bounce ${
              lastMoveFeedback === 'good' 
                ? 'text-green-600' 
                : 'text-red-600'
            }`}>
              {lastMoveFeedback === 'good' 
                ? (language === Language.HEBREW ? '✓ מצוין!' : '✓ Great!')
                : (language === Language.HEBREW ? '✗ נסה שוב' : '✗ Try again')}
            </div>
          )}

          {isCompleted ? (
            <div className="text-center py-8 relative">
              {/* ... victory screen ... */}
              <div className="text-7xl mb-4 animate-bounce">🎉</div>
              <h4 className="text-3xl font-bold text-green-600 mb-3">
                {language === Language.HEBREW ? 'כל הכבוד!' : 'Great Job!'}
              </h4>
              <p className="text-lg text-gray-700 mb-6">
                {language === Language.HEBREW ? 'סיימת את הפאזל בהצלחה!' : 'You solved the puzzle!'}
              </p>
              <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-6 text-white shadow-xl">
                <div className="text-5xl font-bold mb-1">{score}</div>
                <div className="text-sm opacity-90">{language === Language.HEBREW ? 'נקודות' : 'Points'}</div>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-4 text-center bg-white/50 py-2 rounded-lg">
                {language === Language.HEBREW 
                  ? 'לחץ על שני חלקים כדי להחליף ביניהם'
                  : 'Click two pieces to swap them'}
              </p>

          {/* Puzzle Pieces - strictly one row */}
          <div className="flex flex-row justify-center gap-2 mb-6 min-h-[100px] overflow-x-auto pb-2 no-scrollbar">
            {pieces.map((piece, index) => (
              <button
                key={`piece-${piece.id}-${index}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handlePieceClick(index);
                }}
                disabled={isAnimating}
                className={`
                  flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl border-2 transition-all duration-300 transform flex items-center justify-center
                  ${selectedPiece === index 
                    ? 'border-blue-500 bg-blue-100 scale-110 shadow-2xl z-10 ring-2 ring-blue-300/50' 
                    : 'border-white bg-white hover:border-blue-300 hover:scale-105 shadow-md'
                  }
                `}
              >
                <div className="text-2xl sm:text-3xl drop-shadow-sm pointer-events-none">{piece.emoji}</div>
              </button>
            ))}
          </div>

          {/* Correct Order Hint - Also in a row */}
          <div className="bg-white/60 rounded-2xl p-4 mb-6 border border-blue-100 shadow-inner">
            <p className="text-xs text-gray-500 mb-3 text-center font-bold uppercase tracking-wider">
              {language === Language.HEBREW ? 'הסדר הנכון (משמאל לימין):' : 'Goal (Left to Right):'}
            </p>
            <div className="flex flex-row justify-center gap-2">
              {correctOrder.map((emoji, idx) => (
                <div 
                  key={idx} 
                  className={`w-10 h-10 flex items-center justify-center text-2xl transition-all duration-300 rounded-lg ${
                    pieces[idx]?.emoji === emoji 
                      ? 'bg-green-100 border-2 border-green-400 scale-110' 
                      : 'bg-gray-100 border border-gray-200 opacity-40 grayscale'
                  }`}
                >
                  {emoji}
                </div>
              ))}
            </div>
          </div>

              <button
                onClick={resetPuzzle}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 rounded-xl transition-all active:scale-95"
              >
                {language === Language.HEBREW ? 'חזרה לבחירת קושי' : 'Back to Difficulty'}
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default PuzzleGame;
