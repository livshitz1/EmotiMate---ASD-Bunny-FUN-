import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SerenityBubbleProps {
  id: number;
  x: number;
  y: number;
  size: number;
  onTap: (id: number, x: number, y: number) => void;
}

export const SerenityBubble: React.FC<SerenityBubbleProps> = ({ id, x, y, size, onTap }) => {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0, y: 50 }}
      animate={{ 
        scale: 1, 
        opacity: 0.7, 
        y: [0, -20, 0],
        x: [0, 10, -10, 0]
      }}
      exit={{ scale: 1.5, opacity: 0 }}
      transition={{
        y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
        x: { duration: 4, repeat: Infinity, ease: "easeInOut" },
        opacity: { duration: 0.3 }
      }}
      onClick={() => onTap(id, x, y)}
      className="serenity-bubble absolute z-[200] cursor-pointer flex items-center justify-center"
      style={{ 
        left: x - size/2, 
        top: y - size/2, 
        width: size, 
        height: size 
      }}
    >
      <div className="w-1/2 h-1/2 bg-white/20 rounded-full blur-[2px]" />
    </motion.div>
  );
};

interface BubbleExplosionProps {
  x: number;
  y: number;
}

export const BubbleExplosion: React.FC<BubbleExplosionProps> = ({ x, y }) => {
  return (
    <div className="absolute z-[250] pointer-events-none" style={{ left: x, top: y }}>
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
          animate={{ 
            scale: 0, 
            x: Math.cos(i * 45 * Math.PI/180) * 100, 
            y: Math.sin(i * 45 * Math.PI/180) * 100,
            opacity: 0 
          }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="absolute w-3 h-3 bg-blue-300 rounded-full blur-[1px]"
        />
      ))}
    </div>
  );
};
