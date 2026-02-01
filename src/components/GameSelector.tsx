import React from 'react';
import { Language } from '../types';
import { translate } from '../i18n/translations';

export type GameType = 'ball' | 'puzzle' | 'hide_and_seek';

interface GameSelectorProps {
  onSelect: (game: GameType) => void;
  language: Language;
  onClose?: () => void;
}

const GameSelector: React.FC<GameSelectorProps> = ({ onSelect, language, onClose }) => {
  const games: Array<{ type: GameType; icon: string; label: string; description: string }> = [
    {
      type: 'ball',
      icon: '⚽',
      label: language === Language.HEBREW ? 'כדור' : language === Language.ENGLISH ? 'Ball' : 'Мяч',
      description: language === Language.HEBREW ? 'לשחק בכדור' : language === Language.ENGLISH ? 'Play with ball' : 'Играть с мячом'
    },
    {
      type: 'puzzle',
      icon: '🧩',
      label: language === Language.HEBREW ? 'פאזל' : language === Language.ENGLISH ? 'Puzzle' : 'Пазл',
      description: language === Language.HEBREW ? 'לפתור פאזל יחד' : language === Language.ENGLISH ? 'Solve puzzle together' : 'Решать пазл вместе'
    },
    {
      type: 'hide_and_seek',
      icon: '🫣',
      label: language === Language.HEBREW ? 'מחבואים' : language === Language.ENGLISH ? 'Hide and Seek' : 'Прятки',
      description: language === Language.HEBREW ? 'לשחק מחבואים' : language === Language.ENGLISH ? 'Play hide and seek' : 'Играть в прятки'
    }
  ];

  return (
    <div className="relative bg-gradient-to-br from-white via-blue-50 to-purple-50 rounded-3xl shadow-2xl p-6 border-2 border-blue-300/50 backdrop-blur-sm"
         style={{
           boxShadow: '0 20px 60px rgba(59, 130, 246, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.5) inset',
         }}>
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 via-purple-400/20 to-pink-400/20 rounded-3xl blur-xl -z-10"></div>
      
      <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6 text-center drop-shadow-lg"
          style={{ textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        🎮 {language === Language.HEBREW ? 'בחר משחק' : language === Language.ENGLISH ? 'Choose a Game' : 'Выбери игру'}
      </h3>
      
      <div className="grid grid-cols-3 gap-4">
        {games.map((game) => (
          <button
            key={game.type}
            onClick={() => {
              onSelect(game.type);
              if (onClose) onClose();
            }}
            className="relative group p-5 rounded-2xl border-2 border-blue-300/50 bg-gradient-to-br from-white to-blue-50/50 hover:from-blue-100 hover:to-purple-100 transition-all duration-300 transform hover:scale-110 hover:rotate-1 shadow-lg hover:shadow-2xl"
            style={{
              boxShadow: '0 4px 15px rgba(59, 130, 246, 0.2), inset 0 1px 0 rgba(255,255,255,0.8)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(59, 130, 246, 0.4), inset 0 1px 0 rgba(255,255,255,0.9), 0 0 20px rgba(59, 130, 246, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(59, 130, 246, 0.2), inset 0 1px 0 rgba(255,255,255,0.8)';
            }}
          >
            {/* Glow effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/0 to-purple-400/0 group-hover:from-blue-400/20 group-hover:to-purple-400/20 rounded-2xl transition-all duration-300 blur-sm -z-10"></div>
            
            <div className="text-6xl mb-3 transform transition-transform group-hover:scale-125 group-hover:rotate-12 drop-shadow-lg"
                 style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))' }}>
              {game.icon}
            </div>
            <div className="font-bold text-sm text-gray-800 mb-1 drop-shadow-sm">{game.label}</div>
            <div className="text-xs text-gray-600 mt-1 opacity-80">{game.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default GameSelector;
