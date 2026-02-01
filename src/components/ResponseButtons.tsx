import React from 'react';

interface ResponseButtonsProps {
  onSelect: (response: string) => void;
  questionType?: 'emotion' | 'general' | 'action' | 'quiet';
}

const ResponseButtons: React.FC<ResponseButtonsProps> = ({ onSelect, questionType = 'emotion' }) => {
  const quietOptions = [
    { text: 'לצייר', emoji: '🎨', value: 'quiet_mode_select:drawing' },
    { text: 'לשחק בקוביות', emoji: '🧱', value: 'quiet_mode_select:blocks' },
    { text: 'לקרוא ספר', emoji: '📖', value: 'quiet_mode_select:reading' },
    { text: 'לפתור פאזל', emoji: '🧩', value: 'quiet_mode_select:puzzle' },
  ];

  const emotionOptions = [
    { text: 'שמח', emoji: '😊', value: 'אני מרגיש שמח היום!' },
    { text: 'רגוע', emoji: '😌', value: 'אני מרגיש רגוע היום' },
    { text: 'עייף', emoji: '😴', value: 'אני מרגיש עייף היום' },
    { text: 'נרגש', emoji: '🤩', value: 'אני מרגיש נרגש היום!' },
  ];

  const actionOptions = [
    { text: 'בוא נשחק', emoji: '⚽', value: 'play' },
    { text: 'אני רעב', emoji: '🥕', value: 'feed' },
    { text: 'בא לי חיבוק', emoji: '❤️', value: 'hug' },
    { text: 'בוא ננשום', emoji: '🧘', value: 'breathing' },
    { text: 'אולי נטייל?', emoji: '🌳', value: 'walk' },
  ];

  const generalOptions = [
    { text: 'כן, בטח!', emoji: '✨', value: 'כן' },
    { text: 'משחק בועות!', emoji: '🫧', value: 'turbo' },
    { text: 'לא עכשיו', emoji: '👋', value: 'לא' },
    { text: 'אולי אחר כך', emoji: '⏳', value: 'אולי' },
  ];

  const getOptions = () => {
    if (questionType === 'action') return actionOptions;
    if (questionType === 'emotion') return emotionOptions;
    if (questionType === 'quiet') return quietOptions;
    return generalOptions;
  };

  const options = getOptions();

  return (
    <div className="mt-1 p-2 bg-purple-50/50 rounded-xl border border-purple-100">
      <div className="flex flex-wrap gap-1.5 justify-center">
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => onSelect(option.value)}
            className="bg-white hover:bg-purple-100 border border-purple-200 rounded-full px-3 py-1.5 flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 shadow-sm"
          >
            <span className="text-base">{option.emoji}</span>
            <span className="text-xs font-bold text-purple-700">{option.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ResponseButtons;
