import React, { useEffect, useState } from 'react';
import { PetType, Language } from '../types';

interface HugAnimationProps {
  petType?: PetType;
  language: Language;
  hugType: 'gentle' | 'strong' | 'cuddle';
  onComplete: () => void;
}

const HugAnimation: React.FC<HugAnimationProps> = ({ petType, language, hugType, onComplete }) => {
  const [animationPhase, setAnimationPhase] = useState<'approaching' | 'hugging' | 'hugged' | 'separating'>('approaching');
  const [showHearts, setShowHearts] = useState<boolean>(false);
  const [hugIntensity, setHugIntensity] = useState<number>(0);

  useEffect(() => {
    // Animation sequence with longer timing for better visibility
    const timer1 = setTimeout(() => setAnimationPhase('hugging'), 800);
    const timer2 = setTimeout(() => {
      setAnimationPhase('hugged');
      setShowHearts(true);
      setHugIntensity(1);
    }, 1500);
    const timer3 = setTimeout(() => {
      setHugIntensity(1.2); // Stronger hug
    }, 2000);
    const timer4 = setTimeout(() => {
      setAnimationPhase('separating');
      setShowHearts(false);
      setHugIntensity(0);
    }, 3500);
    const timer5 = setTimeout(() => {
      onComplete();
    }, 4000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
    };
  }, [onComplete]);

  const getPetEmoji = (): string => {
    switch (petType) {
      case PetType.MAINE_COON:
        return '🐱';
      case PetType.DOG:
        return '🐶';
      default:
        return '🐰';
    }
  };

  const getHugIntensity = (): string => {
    switch (hugType) {
      case 'gentle':
        return 'gentle';
      case 'strong':
        return 'strong';
      case 'cuddle':
        return 'warm';
      default:
        return 'gentle';
    }
  };

  // Calculate positions based on animation phase - more dramatic movement
  const getPetPosition = (): { x: number; y: number; scale: number; rotation: number } => {
    switch (animationPhase) {
      case 'approaching':
        return { x: 200, y: 0, scale: 1, rotation: 0 };
      case 'hugging':
        return { x: 15, y: -10, scale: 1.25, rotation: -8 };
      case 'hugged':
        return { x: -5, y: -20, scale: 1.4, rotation: -10 };
      case 'separating':
        return { x: 120, y: 0, scale: 1, rotation: 0 };
      default:
        return { x: 0, y: 0, scale: 1, rotation: 0 };
    }
  };

  const getChildPosition = (): { x: number; y: number; scale: number; rotation: number } => {
    switch (animationPhase) {
      case 'approaching':
        return { x: -200, y: 0, scale: 1, rotation: 0 };
      case 'hugging':
        return { x: -15, y: -10, scale: 1.25, rotation: 8 };
      case 'hugged':
        return { x: 5, y: -20, scale: 1.4, rotation: 10 };
      case 'separating':
        return { x: -120, y: 0, scale: 1, rotation: 0 };
      default:
        return { x: 0, y: 0, scale: 1, rotation: 0 };
    }
  };

  const petPos = getPetPosition();
  const childPos = getChildPosition();

  // Calculate hug squeeze effect
  const hugSqueeze = animationPhase === 'hugged' ? hugIntensity : 0;
  const hugRotation = animationPhase === 'hugged' ? (Math.sin(Date.now() / 200) * 3) : 0;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200 flex items-center justify-center z-50">
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Arms around hug effect - multiple circles */}
        {animationPhase === 'hugged' && (
          <>
            <div 
              className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-15"
              style={{
                width: '180px',
                height: '180px',
                borderRadius: '50%',
                border: '10px solid rgba(255, 192, 203, 0.7)',
                animation: 'pulse 0.6s ease-in-out infinite',
              }}
            />
            <div 
              className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-15"
              style={{
                width: '220px',
                height: '220px',
                borderRadius: '50%',
                border: '6px solid rgba(255, 182, 193, 0.5)',
                animation: 'pulse 0.8s ease-in-out infinite',
                animationDelay: '0.2s',
              }}
            />
          </>
        )}

        {/* Child */}
        <div
          className="absolute z-20"
          style={{
            left: '50%',
            top: '50%',
            transform: `translate(calc(-50% + ${childPos.x}px), calc(-50% + ${childPos.y}px)) scale(${childPos.scale + hugSqueeze * 0.1}) rotate(${childPos.rotation + hugRotation}deg)`,
            transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
            transformOrigin: 'center center',
          }}
        >
          <div 
            className={`text-9xl ${
              animationPhase === 'hugged' ? 'animate-pulse' : animationPhase === 'approaching' ? 'animate-bounce' : ''
            }`}
            style={{ 
              animationDuration: animationPhase === 'hugged' ? '0.6s' : '0.8s',
              filter: animationPhase === 'hugged' ? 'drop-shadow(0 0 30px rgba(255,192,203,1)) brightness(1.1)' : 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))',
              transform: animationPhase === 'hugged' ? `scale(${1 + Math.sin(Date.now() / 300) * 0.05})` : 'scale(1)',
            }}
          >
            👶
          </div>
        </div>

        {/* Pet */}
        <div
          className="absolute z-20"
          style={{
            left: '50%',
            top: '50%',
            transform: `translate(calc(-50% + ${petPos.x}px), calc(-50% + ${petPos.y}px)) scale(${petPos.scale + hugSqueeze * 0.1}) rotate(${petPos.rotation - hugRotation}deg)`,
            transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
            transformOrigin: 'center center',
          }}
        >
          <div 
            className={`text-9xl ${
              animationPhase === 'hugged' ? 'animate-pulse' : animationPhase === 'approaching' ? 'animate-bounce' : ''
            }`}
            style={{ 
              animationDuration: animationPhase === 'hugged' ? '0.6s' : '0.8s',
              filter: animationPhase === 'hugged' ? 'drop-shadow(0 0 30px rgba(255,192,203,1)) brightness(1.1)' : 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))',
              transform: animationPhase === 'hugged' ? `scale(${1 + Math.sin(Date.now() / 300 + Math.PI) * 0.05})` : 'scale(1)',
            }}
          >
            {getPetEmoji()}
          </div>
        </div>

        {/* Hearts Animation - More dramatic */}
        {showHearts && (
          <>
            {/* Rotating hearts around */}
            {[...Array(16)].map((_, i) => {
              const angle = (i * 22.5) * (Math.PI / 180);
              const radius = 120 + Math.sin(Date.now() / 500 + i) * 20;
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * radius;
              return (
                <div
                  key={i}
                  className="absolute text-5xl z-30"
                  style={{
                    left: `calc(50% + ${x}px)`,
                    top: `calc(50% + ${y}px)`,
                    transform: `translate(-50%, -50%) rotate(${angle * (180 / Math.PI)}deg)`,
                    animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
                    animationDelay: `${i * 0.1}s`,
                  }}
                >
                  ❤️
                </div>
              );
            })}
            {/* Floating hearts */}
            {[...Array(8)].map((_, i) => (
              <div
                key={`float-${i}`}
                className="absolute text-4xl z-30"
                style={{
                  left: `${45 + (i % 4) * 3}%`,
                  top: `${40 + Math.floor(i / 4) * 10}%`,
                  animation: `floatUp 2s ease-out infinite`,
                  animationDelay: `${i * 0.2}s`,
                }}
              >
                💖
              </div>
            ))}
            {/* Central hugging emoji */}
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30">
              <div className="text-8xl animate-pulse" style={{ animationDuration: '0.8s' }}>
                🤗
              </div>
            </div>
            {/* Big hearts around */}
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-25 flex items-center gap-4">
              <div className="text-6xl animate-pulse" style={{ animationDelay: '0s', transform: 'translateX(-80px)' }}>
                💕
              </div>
              <div className="text-6xl animate-pulse" style={{ animationDelay: '0.4s', transform: 'translateX(80px)' }}>
                💕
              </div>
            </div>
          </>
        )}

        {/* Hug Message */}
        <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 z-30">
          <div 
            className="bg-white rounded-2xl p-6 shadow-2xl border-4 border-pink-400"
            style={{
              animation: animationPhase === 'hugged' ? 'bounce 0.6s ease-in-out infinite' : 'none',
            }}
          >
            <div className="text-2xl font-bold text-pink-600 text-center">
              {language === Language.HEBREW
                ? `חיבוק ${getHugIntensity() === 'gentle' ? 'עדין' : getHugIntensity() === 'strong' ? 'חזק' : 'חם'}! 🤗`
                : language === Language.ENGLISH
                ? `${getHugIntensity() === 'gentle' ? 'Gentle' : getHugIntensity() === 'strong' ? 'Strong' : 'Warm'} Hug! 🤗`
                : `${getHugIntensity() === 'gentle' ? 'Нежные' : getHugIntensity() === 'strong' ? 'Крепкие' : 'Теплые'} объятия! 🤗`}
            </div>
          </div>
        </div>

        {/* CSS Animations */}
        <style>{`
          @keyframes floatUp {
            0% {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
            100% {
              opacity: 0;
              transform: translateY(-100px) scale(1.5);
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default HugAnimation;
