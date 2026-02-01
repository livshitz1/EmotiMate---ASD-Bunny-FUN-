import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface EnergyMeterProps {
  energy: number; // 0..100
  language: 'he' | 'en';
}

const EnergyMeter: React.FC<EnergyMeterProps> = ({ energy, language }) => {
  const isHebrew = language === 'he';
  
  const getBatteryColor = () => {
    if (energy >= 80) return 'bg-green-500';
    if (energy >= 40) return 'bg-yellow-400';
    return 'bg-red-500';
  };

  const isLow = energy < 40;

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Battery Tip (Top) */}
      <div className="w-6 h-2 bg-white/30 rounded-t-md mb-[-4px] z-10" />
      
      {/* Main Battery Body */}
      <div className="relative w-14 h-32 border-4 border-white/30 rounded-xl p-1 bg-black/40 shadow-2xl overflow-hidden flex flex-col justify-end">
        {/* Fill Level */}
        <motion.div 
          className={`w-full rounded-lg ${getBatteryColor()} shadow-[0_0_15px_rgba(255,255,255,0.2)]`}
          initial={{ height: '100%' }}
          animate={{ height: `${energy}%` }}
          transition={{ type: 'spring', stiffness: 60, damping: 15 }}
        />

        {/* Glow Effect when low */}
        <AnimatePresence>
          {isLow && (
            <motion.div 
              className="absolute inset-0 bg-red-500/20"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.4, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
        </AnimatePresence>

        {/* Shine highlight */}
        <div className="absolute top-0 left-1/4 w-1/4 h-full bg-white/5 pointer-events-none" />
      </div>

      {/* Label */}
      <div className="flex flex-col items-center">
        <span className={`text-[10px] font-black uppercase tracking-tighter ${isLow ? 'text-red-400 animate-pulse' : 'text-white/60'}`}>
          {isHebrew ? 'רמת אנרגיה' : 'Energy Level'}
        </span>
        <span className="text-sm font-black text-white drop-shadow-md">
          {Math.round(energy)}%
        </span>
      </div>
    </div>
  );
};

export default EnergyMeter;
