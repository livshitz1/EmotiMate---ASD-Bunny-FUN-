import React, { useState } from 'react';
import './BunnyAvatar.css';

interface BunnyAvatarProps {
  mood?: string;
  accessory?: string;
  size?: number;
  onPress?: () => void;
  onTrophyClick?: () => void;
}

import BunnyLottie from './BunnyLottie';
import { motion, AnimatePresence } from 'framer-motion';

export default function BunnyAvatar({ 
  mood = 'neutral', 
  accessory = 'none',
  size = 200,
  onPress,
  onTrophyClick
}: BunnyAvatarProps) {
  const [imageError, setImageError] = useState(false);
  const [showKisses, setShowKisses] = useState(false);

  React.useEffect(() => {
    const handleKisses = () => {
      setShowKisses(true);
      setTimeout(() => setShowKisses(false), 5000);
    };
    window.addEventListener('emotimate_show_kisses', handleKisses);
    return () => window.removeEventListener('emotimate_show_kisses', handleKisses);
  }, []);

  // Map emotional states to component moods
  const safeMood = (mood || 'neutral').toLowerCase();
  let displayMood = safeMood;
  let moodKey: 'happy' | 'sad' | 'sleepy' | 'excited' | 'neutral' = 'neutral';

  if (safeMood.includes('שמח') || safeMood.includes('happy')) {
    displayMood = 'happy';
    moodKey = 'happy';
  } else if (safeMood.includes('חופשה') || safeMood.includes('vacation')) {
    displayMood = 'sleepy';
    moodKey = 'sleepy';
  } else if (safeMood.includes('עייף') || safeMood.includes('tired')) {
    displayMood = 'sleepy';
    moodKey = 'sleepy';
  } else if (safeMood.includes('עצוב') || safeMood.includes('sad')) {
    displayMood = 'sad';
    moodKey = 'sad';
  } else if (safeMood.includes('נרגש') || safeMood.includes('excited')) {
    displayMood = 'excited';
    moodKey = 'excited';
  } else {
    displayMood = 'neutral';
    moodKey = 'happy'; // Default image to happy if neutral
  }

  const imagePath = `assets/bunny/bunny-${moodKey}.png`;
  const accessoryPath = accessory !== 'none' ? `assets/bunny/accessories/${accessory}.png` : null;

  return (
    <div 
      className="bunny-avatar-wrapper flex flex-col items-center py-6 cursor-pointer active:scale-95 transition-transform unity-glow animate-bounce-subtle"
      onClick={onPress}
      style={{ transform: `scale(${size / 200})` }}
    >
      <div className="relative" style={{ width: '120px', height: '160px' }}>
        {/* Trophy button overlay */}
        {onTrophyClick && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onTrophyClick();
            }}
            className="absolute -top-4 -right-8 z-30 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center text-2xl shadow-lg border-2 border-white/40 animate-bounce active:scale-90 transition-transform"
          >
            🏆
          </button>
        )}

        {/* Particle effect behind the bunny */}
        <div className="absolute inset-0 particles opacity-20 pointer-events-none scale-150"></div>

        {/* Kiss Hearts Animation */}
        <AnimatePresence>
          {showKisses && (
            <div className="absolute inset-0 z-40 pointer-events-none">
              {[...Array(10)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, opacity: 0, x: 0, y: 40 }}
                  animate={{ 
                    scale: [1, 1.5, 1], 
                    opacity: [0, 1, 0],
                    x: (Math.random() - 0.5) * 200,
                    y: -200 - Math.random() * 100
                  }}
                  transition={{ 
                    duration: 2 + Math.random() * 2,
                    delay: i * 0.3,
                    ease: "easeOut"
                  }}
                  className="absolute left-1/2 text-4xl"
                >
                  💋
                </motion.div>
              ))}
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={`heart-${i}`}
                  initial={{ scale: 0, opacity: 0, x: 0, y: 40 }}
                  animate={{ 
                    scale: [1, 1.2, 1], 
                    opacity: [0, 1, 0],
                    x: (Math.random() - 0.5) * 150,
                    y: -150 - Math.random() * 100
                  }}
                  transition={{ 
                    duration: 2.5 + Math.random() * 2,
                    delay: i * 0.4,
                    ease: "easeOut"
                  }}
                  className="absolute left-1/2 text-3xl"
                >
                  ❤️
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
        
        {!imageError ? (
          <>
            <img 
              src={imagePath} 
              alt={`Bunny ${mood}`}
              className="w-full h-full object-contain relative z-10"
              onError={() => setImageError(true)}
            />
                  {accessoryPath && (
              <img 
                src={accessoryPath} 
                alt={accessory}
                className="absolute top-0 left-0 w-full h-full object-contain pointer-events-none z-20"
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
            )}
          </>
        ) : (
          /* Fallback to the beautiful CSS bunny if images are missing */
          <div className={`bunny bunny--${displayMood} relative z-10`}>
            <div className="ears">
              <div className="ear left" />
              <div className="ear right" />
            </div>
            <div className="face">
              <div className="eyes" />
              <div className="cheeks" />
              <div className="smile" />
              {accessory === 'glasses' && <div className="glasses" />}
              {accessory === 'hat' && <div className="hat" />}
              {accessory === 'guitar' && <div className="guitar" />}
              {accessory === 'scarf' && <div className="scarf-css" />}
              {accessory === 'headphones' && <div className="headphones-css" />}
              {accessory === 'backpack' && <div className="backpack-css" />}
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-6 bg-black/30 backdrop-blur-sm px-6 py-1.5 rounded-full border border-white/10 shadow-lg">
        <p className="text-white font-bold text-sm tracking-wide">
          {mood}
        </p>
      </div>
    </div>
  );
}
