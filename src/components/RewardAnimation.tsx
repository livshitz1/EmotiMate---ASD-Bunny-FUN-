import React, { useEffect, useState } from 'react';
import { Language } from '../types';
import { translate } from '../i18n/translations';

interface RewardAnimationProps {
  points: number;
  taskName: string;
  onComplete: () => void;
  language: Language;
  type?: 'task' | 'achievement';
}

const RewardAnimation: React.FC<RewardAnimationProps> = ({ 
  points, 
  taskName, 
  onComplete, 
  language,
  type = 'task'
}) => {
  const [show, setShow] = useState(true);
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setShow(false);
    setTimeout(() => {
      onComplete();
    }, 300); // Wait for fade out animation
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, 4000); // Show for 4 seconds

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  const isAchievement = type === 'achievement';
  const isHebrew = language === Language.HEBREW;

  return (
    <div 
      className={`fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[1000] transition-opacity duration-200 ${isClosing ? 'opacity-0' : 'opacity-100'}`}
      onClick={handleClose}
    >
      <div 
        className={`bg-gradient-to-br from-yellow-400 via-orange-400 to-pink-400 rounded-[3rem] p-10 shadow-[0_0_50px_rgba(251,191,36,0.6)] border-4 border-white/40 transform transition-all duration-200 ${isClosing ? 'scale-75 opacity-0' : 'scale-100'}`}
        onClick={handleClose}
      >
        <div className="text-center relative max-w-sm">
          {/* Confetti effect */}
          <div className="absolute inset-0 overflow-visible pointer-events-none">
            {[...Array(40)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-confetti-v2"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `0%`,
                  fontSize: `${15 + Math.random() * 25}px`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random() * 3}s`,
                  opacity: 0
                }}
              >
                {['🎉', '⭐', '🎊', '✨', '🥇', '🥕'][Math.floor(Math.random() * 6)]}
              </div>
            ))}
          </div>
          
          <div className="relative z-10">
            <div className={`text-9xl mb-6 ${isAchievement ? 'animate-bounce-high' : 'animate-bounce'}`}>
              {isAchievement ? '🥇' : '🎉'}
            </div>
            
            <h2 className="text-4xl font-black text-white mb-4 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
              {isAchievement 
                ? (isHebrew ? 'הישג חדש שוחרר!' : 'Achievement Unlocked!')
                : (isHebrew ? 'כל הכבוד!' : 'Great Job!')}
            </h2>

            <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 mb-6 shadow-2xl border-2 border-yellow-200">
              <p className="text-2xl font-bold text-purple-700 mb-2">
                {isAchievement ? taskName : (isHebrew ? `סיימת: ${taskName}` : `Completed: ${taskName}`)}
              </p>
              
              {isAchievement && isHebrew && (
                <p className="text-lg text-gray-700 leading-relaxed font-medium mt-4 border-t border-gray-100 pt-4">
                  וואו! אני כל כך גאה בך! התמדת 3 ימים ברצף וקיבלת מדליית זהב!
                </p>
              )}
              {isAchievement && !isHebrew && (
                <p className="text-lg text-gray-700 leading-relaxed font-medium mt-4 border-t border-gray-100 pt-4">
                  Wow! I'm so proud of you! You've stayed consistent for 3 days and earned a gold medal!
                </p>
              )}

              {!isAchievement && (
                <div className="text-4xl font-black text-yellow-600 flex items-center justify-center gap-2 mt-2">
                  <span>⭐</span>
                  <span>+{points}</span>
                </div>
              )}
            </div>

            <button
              onClick={handleClose}
              className="bg-white text-orange-500 font-black text-xl py-4 px-12 rounded-full hover:bg-yellow-50 transition-all shadow-[0_10px_20px_rgba(0,0,0,0.2)] hover:scale-110 active:scale-95 border-b-4 border-orange-200"
            >
              {isHebrew ? 'יש! איזה כיף!' : 'Awesome!'}
            </button>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes bounce-high {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-50px) scale(1.1); }
        }
        @keyframes confetti-v2 {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 0;
          }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% {
            transform: translateY(400px) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-bounce-high {
          animation: bounce-high 1.5s infinite ease-in-out;
        }
        .animate-confetti-v2 {
          animation: confetti-v2 linear infinite;
        }
      `}</style>
    </div>
  );
};

export default RewardAnimation;
