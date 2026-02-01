import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Language } from '../types';

interface ProgressMapProps {
  steps: number;
  goal?: number;
  language: Language;
  showPrize?: boolean;
}

const ProgressMap: React.FC<ProgressMapProps> = ({ steps, goal = 1000, language, showPrize = true }) => {
  const isHebrew = language === 'he';
  const grandPrize = localStorage.getItem('emotimate_grand_prize');
  
  // Normalize progress (0 to 1)
  const progress = Math.min(steps / goal, 1);

  // Define the points of our winding path (SVG coordinates)
  // Viewbox will be 400x200
  const pathPoints = [
    { x: 40, y: 160, icon: '🏠', label: isHebrew ? 'בית' : 'Home' },      // Start
    { x: 120, y: 60, icon: '🌳', label: '100', carrot: true },           // Checkpoint 1 (100 steps)
    { x: 200, y: 140, icon: '🪑', label: '300', carrot: true },          // Checkpoint 2 (300 steps)
    { x: 280, y: 40, icon: '🌸', label: '600', carrot: true },           // Checkpoint 3 (600 steps)
    { x: 360, y: 100, icon: '🏫', label: isHebrew ? 'בית ספר' : 'School' } // End
  ];

  // Create SVG path string
  const svgPath = "M 40 160 C 80 160, 80 60, 120 60 C 160 60, 160 140, 200 140 C 240 140, 240 40, 280 40 C 320 40, 320 100, 360 100";

  // Calculate current bunny position on the path using progress
  // For a cubic bezier path, we'll approximate the position
  const bunnyPos = useMemo(() => {
    // Stage thresholds
    const stages = [0, 0.25, 0.5, 0.75, 1];
    let currentStage = 0;
    for (let i = 0; i < stages.length - 1; i++) {
      if (progress >= stages[i]) currentStage = i;
    }

    const stageProgress = (progress - stages[currentStage]) / (stages[currentStage + 1] - stages[currentStage]);
    const start = pathPoints[currentStage];
    const end = pathPoints[currentStage + 1];

    return {
      x: start.x + (end.x - start.x) * stageProgress,
      y: start.y + (end.y - start.y) * stageProgress
    };
  }, [progress, isHebrew]);

  return (
    <div className="w-full bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10 shadow-xl overflow-hidden relative">
      <h3 className="text-sm font-bold text-indigo-200 mb-4 flex items-center gap-2">
        <span>🗺️</span>
        {isHebrew ? 'הדרך שלי להיום' : 'My Daily Path'}
      </h3>

      <div className="path-container">
        {/* Checkpoints */}
        {pathPoints.map((pt, i) => (
          <div 
            key={i} 
            className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center"
            style={{ left: `${(i / (pathPoints.length - 1)) * 90 + 5}%` }}
          >
            <span className="text-xl mb-1">{pt.icon}</span>
            <span className="text-[8px] font-bold text-white/40">{pt.label}</span>
          </div>
        ))}

        {/* The Animated Bunny */}
        <div 
          className="bunny-marker"
          style={{ left: `${progress * 90 + 2}%` }}
        >
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🐰
          </motion.div>
        </div>
      </div>

      <div className="mt-4 flex justify-between items-center px-2">
        <p className="text-[10px] font-bold text-white/60">
          {isHebrew ? 'התחלה' : 'Start'}
        </p>
        <div className="flex-1 mx-4 h-1 bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-blue-400"
            animate={{ width: `${progress * 100}%` }}
          />
        </div>
        <p className="text-[10px] font-bold text-blue-300">
          {isHebrew ? 'היעד: בית ספר' : 'Goal: School'}
        </p>
      </div>

      {showPrize && grandPrize && (
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mt-4 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-2xl flex items-center gap-3"
        >
          <span className="text-2xl animate-bounce">🎁</span>
          <div className="flex-1">
            <p className="text-[10px] uppercase tracking-widest text-yellow-300 font-black">
              {isHebrew ? 'הפרס שמחכה לך בסוף' : 'The prize waiting at the end'}
            </p>
            <p className="text-sm font-bold text-white">
              {grandPrize}
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ProgressMap;
