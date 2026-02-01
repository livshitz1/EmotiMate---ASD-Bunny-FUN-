import React from 'react';
import BunnyLottie from './BunnyLottie';
import { Emotion } from '../types';

interface BunnyLottieSwitcherProps {
  currentMood: Emotion;
  onMoodChange: (mood: Emotion) => void;
}

export default function BunnyLottieSwitcher({ currentMood, onMoodChange }: BunnyLottieSwitcherProps) {
  const moods = [
    { id: Emotion.HAPPY, label: 'שמח', icon: '😊' },
    { id: Emotion.TIRED, label: 'עייף', icon: '😴' },
    { id: Emotion.HUNGRY, label: 'רעב', icon: '🥕' },
    { id: Emotion.NEUTRAL, label: 'רגוע', icon: '😌' },
  ];

  return (
    <div className="flex flex-col items-center gap-6 p-6 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 shadow-2xl">
      {/* The actual Lottie display component we updated earlier */}
      <BunnyLottie mood={currentMood} />

      {/* Control buttons */}
      <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
        {moods.map((m) => (
          <button
            key={m.id}
            onClick={() => onMoodChange(m.id)}
            className={`py-3 px-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 border-2 ${
              currentMood === m.id
                ? 'bg-purple-600 border-purple-400 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)] scale-105'
                : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
            }`}
          >
            <span>{m.icon}</span>
            {m.label}
          </button>
        ))}
      </div>
    </div>
  );
}
