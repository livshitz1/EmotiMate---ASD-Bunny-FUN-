import React from 'react';
import { motion } from 'framer-motion';

interface SensoryBatteryProps {
  energy: number; // 0..100
  language: 'he' | 'en';
}

const SensoryBattery: React.FC<SensoryBatteryProps> = ({ energy, language }) => {
  const isLow = energy < 30;
  const isCritical = energy < 15;
  const isHebrew = language === 'he';

  const getBatteryColor = () => {
    if (isCritical) return 'bg-red-500';
    if (isLow) return 'bg-orange-400';
    return 'bg-green-400';
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-16 h-8 border-2 border-white/30 rounded-md p-0.5 flex items-center shadow-lg bg-black/20">
        {/* Battery Fill */}
        <motion.div 
          className={`h-full rounded-sm ${getBatteryColor()}`}
          initial={{ width: '100%' }}
          animate={{ width: `${energy}%` }}
          transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        />
        
        {/* Battery Tip */}
        <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-1.5 h-3 bg-white/30 rounded-r-sm" />
        
        {/* Critical Flash Overlay */}
        {isCritical && (
          <motion.div 
            className="absolute inset-0 bg-red-500 rounded-sm"
            animate={{ opacity: [0, 0.4, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}
      </div>
      
      <span className="text-[10px] font-black text-white/70 uppercase tracking-widest flex items-center gap-1">
        <span>⚡</span>
        {isHebrew ? 'אנרגיה חושית' : 'Sensory Energy'}
      </span>
    </div>
  );
};

export default SensoryBattery;
