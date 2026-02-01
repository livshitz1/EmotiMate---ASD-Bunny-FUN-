import React from 'react';
import { Achievement, Language } from '../types';
import { ACHIEVEMENTS as ALL_ACHIEVEMENTS } from '../constants';

interface TrophyRoomProps {
  achievements: Achievement[];
  language: Language;
  onClose: () => void;
}

const TrophyRoom: React.FC<TrophyRoomProps> = ({ achievements, language, onClose }) => {
  const isHebrew = language === 'he';

  // Merge current progress with all possible achievements to show locked ones
  const trophyList = ALL_ACHIEVEMENTS.map(baseAchievement => {
    const earned = achievements.find(a => a.id === baseAchievement.id);
    return {
      ...baseAchievement,
      unlocked: !!earned,
      earnedDate: earned?.date || earned?.dateEarned || null // Support different date field names
    };
  });

  return (
    <div className="fixed inset-0 z-[300] bg-indigo-950/95 backdrop-blur-xl flex flex-col p-6 safe-area-inset-top">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-black text-white drop-shadow-md">
          {isHebrew ? 'חדר הגביעים שלי 🏆' : 'My Trophy Room 🏆'}
        </h2>
        <button 
          onClick={onClose}
          className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white text-2xl hover:bg-white/20 transition-all active:scale-90"
        >
          ✕
        </button>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <div className="grid grid-cols-2 gap-4 pb-10">
          {trophyList.map((trophy) => (
            <div 
              key={trophy.id}
              className={`relative rounded-3xl p-5 flex flex-col items-center text-center transition-all duration-500 border-2 ${
                trophy.unlocked 
                  ? 'bg-gradient-to-br from-white/20 to-white/5 border-yellow-400/50 shadow-[0_0_20px_rgba(251,191,36,0.3)] trophy-glow trophy-shimmer' 
                  : 'bg-black/20 border-white/5 opacity-60'
              }`}
            >
              {/* Icon Container */}
              <div className={`text-6xl mb-4 relative ${!trophy.unlocked ? 'grayscale' : 'animate-pulse-slow'}`}>
                {trophy.icon}
                {!trophy.unlocked && (
                  <div className="absolute -top-2 -right-2 bg-black/60 rounded-full w-8 h-8 flex items-center justify-center text-lg border border-white/20 shadow-lg">
                    🔒
                  </div>
                )}
              </div>

              {/* Text Info */}
              <h3 className={`text-lg font-bold mb-1 ${trophy.unlocked ? 'text-white' : 'text-gray-400'}`}>
                {trophy.name}
              </h3>
              
              <p className={`text-xs mb-3 leading-tight ${trophy.unlocked ? 'text-indigo-200' : 'text-gray-500'}`}>
                {trophy.description}
              </p>

              {trophy.unlocked && trophy.earnedDate && (
                <div className="mt-auto px-3 py-1 bg-yellow-400/20 rounded-full border border-yellow-400/30">
                  <span className="text-[10px] font-bold text-yellow-300">
                    {trophy.earnedDate}
                  </span>
                </div>
              )}
              
              {!trophy.unlocked && (
                <div className="mt-auto px-3 py-1 bg-white/5 rounded-full border border-white/5">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    {isHebrew ? 'נעול' : 'Locked'}
                  </span>
                </div>
              )}

              {/* Glow effect for unlocked */}
              {trophy.unlocked && (
                <div className="absolute inset-0 bg-yellow-400/5 rounded-3xl -z-10 blur-xl"></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer / Close */}
      <div className="mt-auto pt-6 border-t border-white/10">
        <button 
          onClick={onClose}
          className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black text-xl rounded-2xl shadow-xl hover:opacity-90 active:scale-[0.98] transition-all"
        >
          {isHebrew ? 'חזרה לארנב שלי ✨' : 'Back to My Bunny ✨'}
        </button>
      </div>

      <style>{`
        .animate-pulse-slow {
          animation: pulse-slow 3s infinite ease-in-out;
        }
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); filter: brightness(1); }
          50% { transform: scale(1.05); filter: brightness(1.2); }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default TrophyRoom;
