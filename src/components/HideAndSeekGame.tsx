import React, { useState, useEffect, useCallback } from 'react';
import { Language } from '../types';

interface HideAndSeekGameProps {
  language: Language;
  onComplete: () => void;
  onClose: () => void;
}

const HideAndSeekGame: React.FC<HideAndSeekGameProps> = ({ language, onComplete, onClose }) => {
  const [hidingPlace, setHidingPlace] = useState(0);
  const [found, setFound] = useState(false);
  const [round, setRound] = useState(1);
  const [hasStarted, setHasStarted] = useState(false);
  const maxRounds = 3;
  const isHebrew = language === 'he';

  const nextRound = useCallback(() => {
    if (round < maxRounds) {
      setHidingPlace(Math.floor(Math.random() * 4));
      setFound(false);
      setRound(prev => prev + 1);
    } else {
      setTimeout(onComplete, 1500);
    }
  }, [round, onComplete]);

  const handleStart = () => {
    setHidingPlace(Math.floor(Math.random() * 4));
    setHasStarted(true);
  };

  const handlePlaceClick = (index: number) => {
    if (!hasStarted || found) return;
    if (index === hidingPlace) {
      setFound(true);
      setTimeout(nextRound, 1500);
    }
  };

  const places = ['🌳', '🏠', '📦', '🌻'];

  return (
    <div className="relative bg-gradient-to-br from-green-500 to-teal-700 rounded-3xl shadow-2xl p-6 border-4 border-white/20 max-w-md w-full text-white overflow-hidden" dir={isHebrew ? 'rtl' : 'ltr'}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-bold">🫣 {isHebrew ? 'מחבואים' : 'Hide and Seek'}</h3>
        <button onClick={onClose} className="text-white/60 hover:text-white text-2xl transition-transform hover:rotate-90">✕</button>
      </div>

      <div className="bg-black/20 backdrop-blur-md rounded-xl p-3 mb-6 text-center font-bold border border-white/10">
        {isHebrew ? `סיבוב ${round} מתוך ${maxRounds}` : `Round ${round} of ${maxRounds}`}
      </div>

      <div className="relative h-72 bg-white/10 rounded-2xl p-4 border-2 border-white/20">
        {!hasStarted ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="text-6xl animate-bounce">🐰</div>
            <p className="text-lg font-bold text-center">
              {isHebrew ? 'הארנב עומד להתחבא... מוכן למצוא אותו?' : 'The bunny is going to hide... Ready to find him?'}
            </p>
            <button 
              onClick={handleStart}
              className="bg-white text-green-600 px-8 py-3 rounded-full font-bold text-xl shadow-lg hover:scale-110 transition-all active:scale-95"
            >
              {isHebrew ? 'כן! בוא נשחק' : "Yes! Let's play"}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 h-full">
            {places.map((icon, index) => (
              <button
                key={index}
                onClick={() => handlePlaceClick(index)}
                className={`
                  relative bg-white/5 rounded-2xl flex items-center justify-center text-6xl 
                  transition-all duration-300 hover:bg-white/15 active:scale-95 border-2 border-white/5
                  ${found && index === hidingPlace ? 'bg-yellow-400/30 border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.4)]' : ''}
                `}
              >
                <span className={`${found && index === hidingPlace ? 'opacity-40 blur-sm' : ''}`}>{icon}</span>
                {found && index === hidingPlace && (
                  <div className="absolute inset-0 flex items-center justify-center animate-bounce text-6xl drop-shadow-xl">
                    🐰
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 text-center h-8">
        <p className="text-lg font-bold">
          {hasStarted && (
            found 
              ? (isHebrew ? 'מצאת אותי! ✨' : 'Found me! ✨') 
              : (isHebrew ? 'איפה אני מתחבא?' : 'Where am I hiding?')
          )}
        </p>
      </div>
    </div>
  );
};

export default HideAndSeekGame;
