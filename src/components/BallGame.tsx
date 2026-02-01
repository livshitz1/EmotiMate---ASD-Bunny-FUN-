import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Language } from '../types';

interface BallGameProps {
  language: Language;
  onComplete: () => void;
  onClose: () => void;
}

const BallGame: React.FC<BallGameProps> = ({ language, onComplete, onClose }) => {
  const [ballPos, setBallPos] = useState({ x: 100, y: 100 });
  const [hits, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [isGameOver, setIsGameOver] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isHebrew = language === 'he';

  const moveBall = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const padding = 60;
      const nextX = Math.random() * (rect.width - padding);
      const nextY = Math.random() * (rect.height - padding);
      setBallPos({ x: nextX, y: nextY });
    }
  }, []);

  useEffect(() => {
    if (hasStarted && timeLeft > 0 && !isGameOver) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (hasStarted && timeLeft === 0) {
      setIsGameOver(true);
      setTimeout(onComplete, 2000);
    }
  }, [hasStarted, timeLeft, isGameOver, onComplete]);

  const handleStart = () => {
    setHasStarted(true);
    moveBall();
  };

  const handleBallClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isGameOver || !hasStarted) return;
    setScore(prev => prev + 1);
    moveBall();
  };

  return (
    <div className="relative bg-gradient-to-br from-blue-500 to-indigo-700 rounded-3xl shadow-2xl p-6 border-4 border-white/20 max-w-md w-full overflow-hidden text-white" dir={isHebrew ? 'rtl' : 'ltr'}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-bold">⚽ {isHebrew ? 'משחק כדור' : 'Ball Game'}</h3>
        <button onClick={onClose} className="text-white/60 hover:text-white text-2xl transition-transform hover:rotate-90">✕</button>
      </div>

      <div className="flex justify-between bg-black/20 backdrop-blur-md rounded-xl p-3 mb-4 font-bold border border-white/10">
        <div>{isHebrew ? 'נקודות:' : 'Score:'} {hits}</div>
        <div>{isHebrew ? 'זמן:' : 'Time:'} {timeLeft}s</div>
      </div>

      <div 
        ref={containerRef}
        className="h-72 bg-white/10 rounded-2xl relative overflow-hidden border-2 border-white/20 cursor-pointer"
        onClick={() => {
          if (hasStarted && !isGameOver) {
            // Optional: Penalty for missing the ball
          }
        }}
      >
        {!hasStarted ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <p className="text-lg font-bold text-center px-4">
              {isHebrew ? 'לחץ על הכדור כמה שיותר פעמים!' : 'Click the ball as many times as you can!'}
            </p>
            <button 
              onClick={handleStart}
              className="bg-white text-blue-600 px-8 py-3 rounded-full font-bold text-xl shadow-lg hover:scale-110 transition-transform active:scale-95"
            >
              {isHebrew ? 'מתחילים!' : 'Start!'}
            </button>
          </div>
        ) : !isGameOver ? (
          <button
            onClick={handleBallClick}
            className="absolute w-16 h-16 bg-white rounded-full flex items-center justify-center text-4xl shadow-2xl transition-all duration-150 hover:scale-110 active:scale-75 select-none"
            style={{ 
              left: ballPos.x, 
              top: ballPos.y,
              filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.5))'
            }}
          >
            ⚽
          </button>
        ) : (
          <div className="flex flex-col items-center justify-center h-full animate-bounce">
            <div className="text-6xl mb-2">🎉</div>
            <div className="text-3xl font-bold">{isHebrew ? 'כל הכבוד!' : 'Great Job!'}</div>
            <div className="text-xl opacity-90 mt-2">{isHebrew ? `צברת ${hits} נקודות` : `You got ${hits} points`}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BallGame;
