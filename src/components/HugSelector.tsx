import React from 'react';
import { Language } from '../types';
import { translate } from '../i18n/translations';

export type HugType = 'gentle' | 'strong' | 'cuddle';

interface HugSelectorProps {
  onSelect: (hug: HugType) => void;
  language: Language;
  onClose?: () => void;
}

const HugSelector: React.FC<HugSelectorProps> = ({ onSelect, language, onClose }) => {
  const hugs: Array<{ type: HugType; icon: string; label: string; description: string }> = [
    {
      type: 'gentle',
      icon: '🤗',
      label: language === Language.HEBREW ? 'חיבוק עדין ומלטף' : language === Language.ENGLISH ? 'Gentle Cuddle' : 'Нежные объятия',
      description: language === Language.HEBREW ? 'חיבוק רך ונעים' : language === Language.ENGLISH ? 'Soft and gentle' : 'Мягкий и нежный'
    },
    {
      type: 'strong',
      icon: '💪',
      label: language === Language.HEBREW ? 'חיבוק חזק ואוהב' : language === Language.ENGLISH ? 'Strong Loving Hug' : 'Крепкие объятия',
      description: language === Language.HEBREW ? 'חיבוק מלא אהבה' : language === Language.ENGLISH ? 'Full of love' : 'Полный любви'
    },
    {
      type: 'cuddle',
      icon: '🥰',
      label: language === Language.HEBREW ? 'חיבוק חם ונעים' : language === Language.ENGLISH ? 'Warm Cuddle' : 'Теплые объятия',
      description: language === Language.HEBREW ? 'חיבוק מחמם לב' : language === Language.ENGLISH ? 'Heartwarming' : 'Согревающий сердце'
    }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 border-2 border-pink-200">
      <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
        🤗 {language === Language.HEBREW ? 'בחר סוג חיבוק' : language === Language.ENGLISH ? 'Choose Hug Type' : 'Выбери тип объятий'}
      </h3>
      
      <div className="grid grid-cols-3 gap-3">
        {hugs.map((hug) => (
          <button
            key={hug.type}
            onClick={() => {
              onSelect(hug.type);
              if (onClose) onClose();
            }}
            className="p-4 rounded-xl border-2 border-pink-200 hover:border-pink-400 hover:bg-pink-50 transition-all transform hover:scale-105"
          >
            <div className="text-5xl mb-2">{hug.icon}</div>
            <div className="font-bold text-sm text-gray-800">{hug.label}</div>
            <div className="text-xs text-gray-600 mt-1">{hug.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default HugSelector;
