import React, { useState } from 'react';

export interface BunnyOption {
  id: number;
  name: string;
  emoji: string;
  image?: string;
}

const bunnies: BunnyOption[] = [
  { id: 1, name: 'רובי', emoji: '🐰' },
  { id: 2, name: 'פופי', emoji: '🐇' },
  { id: 3, name: 'לונה', emoji: '🐈‍⬛' }, // Using different animals as placeholders if they aren't all bunnies
];

interface BunnySelectorProps {
  onSelect?: (bunny: BunnyOption) => void;
}

export default function BunnySelector({ onSelect }: BunnySelectorProps) {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const handleSelect = (bunny: BunnyOption) => {
    setSelectedId(bunny.id);
    if (onSelect) onSelect(bunny);
  };

  return (
    <div className="mt-5 p-4 bg-[#2a2a2a] rounded-xl shadow-lg border border-white/10">
      <h3 className="text-white text-lg font-bold mb-4 flex items-center gap-2">
        <span>🐰</span>
        בחר את החבר שלך
      </h3>
      
      <div className="flex justify-around gap-4">
        {bunnies.map((bunny) => (
          <button
            key={bunny.id}
            onClick={() => handleSelect(bunny)}
            className={`
              flex flex-col items-center p-3 rounded-2xl transition-all duration-200 group
              ${selectedId === bunny.id 
                ? 'bg-[#6aa84f] scale-110 shadow-[0_0_15px_rgba(106,168,79,0.4)]' 
                : 'bg-white/5 hover:bg-white/10'}
            `}
          >
            <div className={`
              text-5xl mb-2 transition-transform duration-300
              ${selectedId === bunny.id ? 'animate-bounce' : 'group-hover:scale-110'}
            `}>
              {bunny.emoji}
            </div>
            <span className={`
              text-sm font-bold transition-colors
              ${selectedId === bunny.id ? 'text-white' : 'text-gray-400 group-hover:text-white'}
            `}>
              {bunny.name}
            </span>
            
            {selectedId === bunny.id && (
              <div className="mt-1 w-2 h-2 bg-white rounded-full animate-pulse"></div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
