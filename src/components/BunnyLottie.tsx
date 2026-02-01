import React, { useEffect, useState, useRef } from 'react';
import Lottie, { LottieRefCurrentProps } from 'lottie-react';
import { Emotion } from '../types';

// Static imports for stability in Capacitor
import bunnyIdleData from '../assets/lottie/bunny_idle.json';
import bunnyEatingData from '../assets/lottie/bunny_eating.json';
import bunnySleepingData from '../assets/lottie/bunny_sleeping.json';
import bunnyExcitedData from '../assets/lottie/bunny_excited.json';

const LOTTIE_MAP: Record<string, any> = {
  bunny_idle: bunnyIdleData,
  bunny_eating: bunnyEatingData,
  bunny_sleeping: bunnySleepingData,
  bunny_excited: bunnyExcitedData,
};

interface BunnyLottieProps {
  mood?: Emotion;
  animation?: string;
  onPress?: () => void;
  onAnimationEnd?: () => void;
}

export default function BunnyLottie({ 
  mood = Emotion.NEUTRAL, 
  animation,
  onPress,
  onAnimationEnd
}: BunnyLottieProps) {
  const [animationData, setAnimationData] = useState<any>(null);
  const [speed, setSpeed] = useState(1);
  const lottieRef = useRef<LottieRefCurrentProps>(null);

  useEffect(() => {
    let fileName = 'bunny_idle';
    
    // Reset speed when animation changes
    setSpeed(1);
    
    // Priority to specific animation state
    if (animation === 'eating') fileName = 'bunny_eating';
    else if (animation === 'stretching' || animation === 'waking_up') fileName = 'bunny_excited';
    else if (animation === 'sleeping' || mood === Emotion.TIRED || mood === Emotion.VACATION) fileName = 'bunny_sleeping';
    else if (animation === 'excited' || mood === Emotion.HAPPY) fileName = 'bunny_excited';
    else if (mood === Emotion.SAD) fileName = 'bunny_idle'; 

    const data = LOTTIE_MAP[fileName];
    
    // Lottie files must be an object with a layers array to be valid
    // We add even more safety checks for Safari/Capacitor
    let isValidLottie = false;
    try {
      isValidLottie = !!(data && 
                        typeof data === 'object' && 
                        'v' in data && // Lottie files usually have a version
                        'fr' in data && // frame rate
                        'layers' in data && 
                        Array.isArray(data.layers) &&
                        data.layers.length > 0);
    } catch (e) {
      console.warn("Error validating Lottie data:", e);
      isValidLottie = false;
    }

    if (isValidLottie) {
      setAnimationData(data);
    } else {
      console.warn("Lottie data invalid or empty for:", fileName);
      // Try to fall back to idle if it's valid
      const idleData = LOTTIE_MAP['bunny_idle'];
      let isIdleValid = false;
      try {
        isIdleValid = !!(idleData && 
                        typeof idleData === 'object' && 
                        'layers' in idleData && 
                        Array.isArray(idleData.layers) &&
                        idleData.layers.length > 0);
      } catch (e) {
        isIdleValid = false;
      }
      
      if (fileName !== 'bunny_idle' && isIdleValid) {
        setAnimationData(idleData);
      } else {
        setAnimationData(null);
      }
    }
  }, [mood, animation]);

  const handleInteraction = () => {
    if (onPress) onPress();
  };

  const handleDoubleClick = () => {
    // Speed up the animation on double-tap
    setSpeed(prev => (prev === 1 ? 2.5 : 1));
    console.log("Animation speed boosted!");
  };

  if (!animationData) {
    // Fallback to static image or emoji if Lottie fails
    const moodKey = mood === Emotion.HAPPY || animation === 'excited' ? 'happy' : 
                   mood === Emotion.TIRED || animation === 'sleeping' ? 'sleepy' :
                   mood === Emotion.SAD ? 'sad' : 'neutral';
    
    return (
      <div 
        className="flex flex-col items-center justify-center my-5 cursor-pointer active:scale-95 transition-transform unity-glow animate-bounce-subtle"
        onClick={handleInteraction}
        onDoubleClick={handleDoubleClick}
      >
        <div className="w-[250px] h-[250px] bg-white/5 rounded-full flex items-center justify-center border-4 border-white/10 overflow-hidden relative">
          <img 
            src={`/assets/bunny/bunny-${moodKey}.png`} 
            alt="Bunny Fallback"
            className="w-4/5 h-4/5 object-contain"
            onError={(e) => {
              // If image also fails, show emoji
              e.currentTarget.style.display = 'none';
              const parent = e.currentTarget.parentElement;
              if (parent) {
                const emoji = document.createElement('span');
                emoji.className = 'text-8xl';
                emoji.innerText = '🐰';
                parent.appendChild(emoji);
              }
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
             <div className="particles"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="flex flex-col items-center justify-center my-5 cursor-pointer active:scale-95 transition-transform unity-glow animate-bounce-subtle bunny-lottie-container"
      onClick={handleInteraction}
      onDoubleClick={handleDoubleClick}
    >
      <div className="w-[250px] h-[250px] relative">
        {/* Particle effect behind the bunny */}
        <div className="absolute inset-0 particles opacity-30 pointer-events-none"></div>
        
        <Lottie
          lottieRef={lottieRef}
          animationData={animationData}
          loop={true}
          autoPlay={true}
          className="w-full h-full relative z-10"
          speed={speed}
        />
        
        {speed > 1 && (
          <div className="absolute -top-2 -right-2 bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse shadow-lg z-20">
            FAST! ⚡
          </div>
        )}
      </div>
    </div>
  );
}
