import React from 'react';
import { BunnyState, Language } from '../types';

interface BunnyStatusProps {
  bunny: BunnyState;
  language: Language;
}

const BunnyStatus: React.FC<BunnyStatusProps> = ({ bunny, language }) => {
  const hunger = bunny?.hunger || 0;
  const energy = bunny?.energy || 0;
  const happiness = bunny?.happiness || 0;

  return (
    <div className="unity-card p-4 rounded-2xl flex justify-around items-center">
      <div className="text-center group cursor-help" title={language === 'he' ? 'רעב' : 'Hunger'}>
        <span className="text-2xl block mb-1 group-hover:scale-120 transition-transform text-glow" aria-label="Hunger">🥕</span>
        <div className="w-20 h-3 bg-black/20 rounded-full overflow-hidden shadow-inner border border-white/10">
          <div 
            className={`h-full transition-all duration-1000 ${hunger < 20 ? 'bg-red-500 animate-pulse' : 'bg-orange-400'} unity-glow`} 
            style={{ width: `${Math.max(0, Math.min(100, hunger))}%` }}
          ></div>
        </div>
        <span className="text-[10px] font-bold text-gray-700 mt-1 block">{Math.round(hunger)}%</span>
      </div>

      <div className="text-center group cursor-help" title={language === 'he' ? 'אנרגיה' : 'Energy'}>
        <span className="text-2xl block mb-1 group-hover:scale-120 transition-transform text-glow" aria-label="Energy">⚡</span>
        <div className="w-20 h-3 bg-black/20 rounded-full overflow-hidden shadow-inner border border-white/10">
          <div 
            className={`h-full transition-all duration-1000 ${energy < 20 ? 'bg-red-500 animate-pulse' : 'bg-yellow-400'} unity-glow`} 
            style={{ width: `${Math.max(0, Math.min(100, energy))}%` }}
          ></div>
        </div>
        <span className="text-[10px] font-bold text-gray-700 mt-1 block">{Math.round(energy)}%</span>
      </div>

      <div className="text-center group cursor-help" title={language === 'he' ? 'אושר' : 'Happiness'}>
        <span className="text-2xl block mb-1 group-hover:scale-120 transition-transform text-glow" aria-label="Happiness">💖</span>
        <div className="w-20 h-3 bg-black/20 rounded-full overflow-hidden shadow-inner border border-white/10">
          <div 
            className={`h-full transition-all duration-1000 ${happiness < 30 ? 'bg-red-500 animate-pulse' : 'bg-pink-400'} unity-glow`} 
            style={{ width: `${Math.max(0, Math.min(100, happiness))}%` }}
          ></div>
        </div>
        <span className="text-[10px] font-bold text-gray-700 mt-1 block">{Math.round(happiness)}%</span>
      </div>
    </div>
  );
};

export default BunnyStatus;
