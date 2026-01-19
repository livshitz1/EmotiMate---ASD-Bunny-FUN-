import React from 'react';

interface ControlsProps {
  onAction: (action: string) => void;
  disabled: boolean;
}

const Controls: React.FC<ControlsProps> = ({ onAction, disabled }) => {
  const buttons = [
    { label: 'להאכיל', icon: '🥕', action: 'feed', color: 'bg-orange-100 text-orange-600 hover:bg-orange-200 border-orange-200' },
    { label: 'לשחק', icon: '⚽', action: 'play', color: 'bg-blue-100 text-blue-600 hover:bg-blue-200 border-blue-200' },
    { label: 'לישון', icon: '🛌', action: 'sleep', color: 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200 border-indigo-200' },
    { label: 'לחבק', icon: '❤️', action: 'hug', color: 'bg-pink-100 text-pink-600 hover:bg-pink-200 border-pink-200' },
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {buttons.map((btn) => (
        <button
          key={btn.action}
          onClick={() => onAction(btn.action)}
          disabled={disabled}
          className={`
            ${btn.color} border-b-4 active:border-b-0 active:translate-y-1
            p-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          <span className="text-4xl">{btn.icon}</span>
          <span className="font-bold text-lg">{btn.label}</span>
        </button>
      ))}
    </div>
  );
};

export default Controls;