import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Haptics, NotificationType } from '@capacitor/haptics';
import { playKissSound } from './AudioPlayer';

interface KissAnimationProps {
  onComplete?: () => void;
}

const KissAnimation: React.FC<KissAnimationProps> = ({ onComplete }) => {
  const [hearts, setHearts] = useState<{ id: number; x: number; delay: number; scale: number }[]>([]);

  useEffect(() => {
    // Generate 7-10 random hearts
    const count = Math.floor(Math.random() * 4) + 7;
    const newHearts = Array.from({ length: count }).map((_, i) => ({
      id: i,
      x: Math.random() * 80 + 10, // 10% to 90% width
      delay: Math.random() * 0.5,
      scale: Math.random() * 0.5 + 0.8
    }));
    setHearts(newHearts);

    // Play sound and haptics
    const playEffects = async () => {
      try {
        const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
        if (AudioContextClass) {
          const ctx = new AudioContextClass();
          playKissSound(ctx);
        }
        await Haptics.notification({ type: NotificationType.Success });
      } catch (e) {
        console.warn("Effects failed", e);
      }
    };

    playEffects();

    // Auto-complete after animation
    const timer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 3500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[600] pointer-events-none overflow-hidden">
      <AnimatePresence>
        {hearts.map((heart) => (
          <motion.div
            key={heart.id}
            initial={{ 
              opacity: 0, 
              y: '110vh', 
              x: `${heart.x}vw`,
              scale: 0 
            }}
            animate={{ 
              opacity: [0, 1, 1, 0],
              y: '-10vh',
              x: [
                `${heart.x}vw`, 
                `${heart.x + (Math.random() * 20 - 10)}vw`, 
                `${heart.x + (Math.random() * 20 - 10)}vw`, 
                `${heart.x}vw`
              ],
              scale: heart.scale,
              rotate: [0, -20, 20, 0]
            }}
            transition={{ 
              duration: 3, 
              delay: heart.delay,
              ease: "easeOut"
            }}
            className="absolute text-6xl"
          >
            💖
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default KissAnimation;
