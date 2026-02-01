import React, { useState, useEffect, useRef } from 'react';
import { Language } from '../types';
import { translate } from '../i18n/translations';

interface BreathingExerciseProps {
  language: Language;
  onClose: () => void;
}

type BreathingPhase = 'inhale' | 'hold' | 'exhale' | 'ready';

const BreathingExercise: React.FC<BreathingExerciseProps> = ({ language, onClose }) => {
  const [phase, setPhase] = useState<BreathingPhase>('ready');
  const [timeRemaining, setTimeRemaining] = useState<number>(7);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [cycleCount, setCycleCount] = useState<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const phaseDuration = 7; // seconds

  useEffect(() => {
    if (isActive && phase !== 'ready') {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            // Move to next phase
            if (phase === 'inhale') {
              setPhase('hold');
              return phaseDuration;
            } else if (phase === 'hold') {
              setPhase('exhale');
              return phaseDuration;
            } else if (phase === 'exhale') {
              setCycleCount((prev) => prev + 1);
              setPhase('inhale');
              return phaseDuration;
            }
            return phaseDuration;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, phase]);

  const startExercise = () => {
    setIsActive(true);
    setPhase('inhale');
    setTimeRemaining(phaseDuration);
    setCycleCount(0);
  };

  const stopExercise = () => {
    setIsActive(false);
    setPhase('ready');
    setTimeRemaining(phaseDuration);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const resetExercise = () => {
    stopExercise();
    setCycleCount(0);
  };

  const getPhaseText = (): string => {
    switch (phase) {
      case 'inhale':
        return language === Language.HEBREW 
          ? 'קח אוויר...'
          : language === Language.ENGLISH
          ? 'Breathe in...'
          : 'Вдох...';
      case 'hold':
        return language === Language.HEBREW
          ? 'החזק...'
          : language === Language.ENGLISH
          ? 'Hold...'
          : 'Задержи...';
      case 'exhale':
        return language === Language.HEBREW
          ? 'הוצא אוויר...'
          : language === Language.ENGLISH
          ? 'Breathe out...'
          : 'Выдох...';
      default:
        return language === Language.HEBREW
          ? 'מוכן להתחיל'
          : language === Language.ENGLISH
          ? 'Ready to start'
          : 'Готов начать';
    }
  };

  const getPhaseEmoji = (): string => {
    switch (phase) {
      case 'inhale':
        return '🌬️';
      case 'hold':
        return '⏸️';
      case 'exhale':
        return '💨';
      default:
        return '🧘';
    }
  };

  // Calculate scale for breathing animation
  const getScale = (): number => {
    if (phase === 'ready') return 1;
    if (phase === 'inhale') {
      // Scale from 1 to 1.3 over 7 seconds
      const progress = (phaseDuration - timeRemaining) / phaseDuration;
      return 1 + (0.3 * progress);
    }
    if (phase === 'hold') {
      return 1.3; // Hold at expanded size
    }
    if (phase === 'exhale') {
      // Scale from 1.3 to 1 over 7 seconds
      const progress = (phaseDuration - timeRemaining) / phaseDuration;
      return 1.3 - (0.3 * progress);
    }
    return 1;
  };

  // Calculate opacity for breathing animation
  const getOpacity = (): number => {
    if (phase === 'ready') return 0.6;
    if (phase === 'inhale' || phase === 'exhale') {
      // Pulse opacity during breathing
      const progress = (phaseDuration - timeRemaining) / phaseDuration;
      return 0.6 + (0.4 * Math.sin(progress * Math.PI));
    }
    return 1;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl shadow-2xl p-8 max-w-md w-full border-2 border-purple-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <span>🧘</span>
            <span>
              {language === Language.HEBREW 
                ? 'תרגיל נשימה'
                : language === Language.ENGLISH
                ? 'Breathing Exercise'
                : 'Дыхательное упражнение'}
            </span>
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Breathing Circle Animation */}
        <div className="flex flex-col items-center justify-center mb-8">
          <div
            className="relative rounded-full bg-gradient-to-br from-blue-400 to-purple-400 shadow-lg transition-all duration-1000 ease-in-out"
            style={{
              width: `${200 * getScale()}px`,
              height: `${200 * getScale()}px`,
              opacity: getOpacity(),
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-2">{getPhaseEmoji()}</div>
                <div className="text-4xl font-bold text-white">
                  {timeRemaining}
                </div>
              </div>
            </div>
          </div>
          
          {/* Phase Text */}
          <div className="mt-6 text-center">
            <div className="text-2xl font-bold text-gray-800 mb-2">
              {getPhaseText()}
            </div>
            {cycleCount > 0 && (
              <div className="text-sm text-gray-600">
                {language === Language.HEBREW
                  ? `מחזור ${cycleCount}`
                  : language === Language.ENGLISH
                  ? `Cycle ${cycleCount}`
                  : `Цикл ${cycleCount}`}
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ease-linear ${
                phase === 'inhale' ? 'bg-blue-500' :
                phase === 'hold' ? 'bg-yellow-500' :
                phase === 'exhale' ? 'bg-green-500' :
                'bg-gray-400'
              }`}
              style={{ width: `${((phaseDuration - timeRemaining) / phaseDuration) * 100}%` }}
            />
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-lg p-4 mb-6 border border-gray-200">
          <div className="text-sm text-gray-700 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-blue-500">🌬️</span>
              <span>
                {language === Language.HEBREW
                  ? 'קח אוויר לאט במשך 7 שניות'
                  : language === Language.ENGLISH
                  ? 'Breathe in slowly for 7 seconds'
                  : 'Медленно вдохните в течение 7 секунд'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-yellow-500">⏸️</span>
              <span>
                {language === Language.HEBREW
                  ? 'החזק את הנשימה למשך 7 שניות'
                  : language === Language.ENGLISH
                  ? 'Hold your breath for 7 seconds'
                  : 'Задержите дыхание на 7 секунд'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">💨</span>
              <span>
                {language === Language.HEBREW
                  ? 'הוצא אוויר לאט במשך 7 שניות'
                  : language === Language.ENGLISH
                  ? 'Breathe out slowly for 7 seconds'
                  : 'Медленно выдохните в течение 7 секунд'}
              </span>
            </div>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex gap-3">
          {!isActive ? (
            <button
              onClick={startExercise}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold py-3 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg"
            >
              {language === Language.HEBREW
                ? '▶ התחל'
                : language === Language.ENGLISH
                ? '▶ Start'
                : '▶ Начать'}
            </button>
          ) : (
            <>
              <button
                onClick={stopExercise}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg"
              >
                {language === Language.HEBREW
                  ? '⏸ עצור'
                  : language === Language.ENGLISH
                  ? '⏸ Pause'
                  : '⏸ Пауза'}
              </button>
              <button
                onClick={resetExercise}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg"
              >
                {language === Language.HEBREW
                  ? '↻ איפוס'
                  : language === Language.ENGLISH
                  ? '↻ Reset'
                  : '↻ Сброс'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BreathingExercise;
