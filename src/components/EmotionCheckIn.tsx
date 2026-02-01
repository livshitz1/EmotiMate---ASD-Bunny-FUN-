import React from 'react';
import { Language } from '../types';

interface EmotionCheckInProps {
  language: Language;
  onSelect: (emotion: string) => void;
  disabled?: boolean;
}

const emotions = [
  { id: 'happy', emoji: '😊', label: { he: 'שמח/ה', en: 'Happy' }, color: 'bg-yellow-100 hover:bg-yellow-200 border-yellow-300' },
  { id: 'excited', emoji: '🤩', label: { he: 'נרגש/ת', en: 'Excited' }, color: 'bg-pink-100 hover:bg-pink-200 border-pink-300' },
  { id: 'sad', emoji: '😢', label: { he: 'עצוב/ה', en: 'Sad' }, color: 'bg-blue-100 hover:bg-blue-200 border-blue-300' },
  { id: 'tired', emoji: '😴', label: { he: 'עייף/ה', en: 'Tired' }, color: 'bg-purple-100 hover:bg-purple-200 border-purple-300' },
  { id: 'calm', emoji: '😌', label: { he: 'רגוע/ה', en: 'Calm' }, color: 'bg-green-100 hover:bg-green-200 border-green-300' },
  { id: 'anxious', emoji: '😰', label: { he: 'לחוץ/ה', en: 'Anxious' }, color: 'bg-orange-100 hover:bg-orange-200 border-orange-300' },
];

const EmotionCheckIn: React.FC<EmotionCheckInProps> = ({ language, onSelect, disabled }) => {
  const isHebrew = language === 'he';

  return (
    <div className="bg-white/90 backdrop-blur-sm p-6 rounded-3xl shadow-lg border-2 border-purple-100 w-full">
      <h3 className="text-xl font-bold text-purple-800 mb-4 text-center">
        {isHebrew ? 'איך את/ה מרגיש/ה עכשיו?' : 'How are you feeling right now?'}
      </h3>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {emotions.map((emotion) => (
          <button
            key={emotion.id}
            onClick={() => onSelect(emotion.label[isHebrew ? 'he' : 'en'])}
            disabled={disabled}
            className={`
              flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all transform hover:scale-105 active:scale-95
              ${emotion.color}
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <span className="text-3xl mb-1">{emotion.emoji}</span>
            <span className="text-sm font-bold text-gray-700">
              {isHebrew ? emotion.label.he : emotion.label.en}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default EmotionCheckIn;
