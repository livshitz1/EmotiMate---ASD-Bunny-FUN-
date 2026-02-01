import React, { useState, useEffect, useRef } from 'react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import BunnyARScreen from '../screens/BunnyARScreen';
import BunnyLottieSwitcher from './BunnyLottieSwitcher';
import { BunnyState, Emotion } from '../types';
import ErrorBoundary from './ErrorBoundary';

interface BunnyExperienceProps {
  bunny: BunnyState;
  onClose: () => void;
  onMoodChange: (mood: Emotion) => void;
  language: 'he' | 'en';
  activeAccessories?: string[];
  isNightMode?: boolean;
  onPhotoTaken?: (dataUrl: string) => void;
  isCleanupMode?: boolean;
  isTurboChargeMode?: boolean;
  isMealTime?: boolean;
  onEnergyGain?: (amount: number) => void;
}

/**
 * BunnyExperience handles the choice between AR view and a 2D Lottie fallback.
 * Since this is a Capacitor Web app, "AR Support" depends on the browser/device
 * capabilities (WebXR). We provide a way to switch or fallback.
 */
export default function BunnyExperience({ 
  bunny, 
  onClose, 
  onMoodChange,
  language,
  activeAccessories = [],
  isNightMode = false,
  onPhotoTaken,
  isCleanupMode = false,
  isTurboChargeMode = false,
  isMealTime = false,
  onEnergyGain
}: BunnyExperienceProps) {
  const [useAR, setUseAR] = useState(true);
  const hapticTimerRef = useRef<NodeJS.Timeout | null>(null);

  const startHapticHeartbeat = () => {
    if (hapticTimerRef.current || isCleanupMode) return; // Disable heartbeat in cleanup mode
    
    const pulse = () => {
      Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
    };

    pulse();
    hapticTimerRef.current = setInterval(pulse, 800);
  };

  const stopHapticHeartbeat = () => {
    if (hapticTimerRef.current) {
      clearInterval(hapticTimerRef.current);
      hapticTimerRef.current = null;
    }
  };

  useEffect(() => {
    return () => stopHapticHeartbeat();
  }, []);

  return (
    <div 
      className="fixed inset-0 z-[200] bg-black flex flex-col"
      onMouseDown={startHapticHeartbeat}
      onMouseUp={stopHapticHeartbeat}
      onMouseLeave={stopHapticHeartbeat}
      onTouchStart={startHapticHeartbeat}
      onTouchEnd={stopHapticHeartbeat}
    >
      <ErrorBoundary>
        {useAR ? (
          <div className="flex-1 relative">
            <BunnyARScreen 
              bunny={bunny} 
              activeAccessories={activeAccessories}
              language={language} 
              onClose={onClose} 
              onPhotoTaken={onPhotoTaken}
              isCleanupMode={isCleanupMode}
              isTurboChargeMode={isTurboChargeMode}
              isMealTime={isMealTime}
              onEnergyGain={onEnergyGain}
            />
            
            {/* Toggle to switch to 2D Fallback if AR is not working/desired */}
            <button 
              onClick={() => setUseAR(false)}
              className="absolute bottom-32 right-4 z-[210] bg-white/20 backdrop-blur-md text-white text-[10px] px-3 py-2 rounded-full border border-white/20"
            >
              {language === 'he' ? 'עבור לתצוגת דו-ממד' : 'Switch to 2D View'}
            </button>
          </div>
        ) : (
          <div className="flex-1 bg-gradient-to-b from-indigo-900 to-purple-900 flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-md flex flex-col items-center">
              <div className="w-full flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-white">
                  {language === 'he' ? 'הארנב שלי' : 'My Bunny'}
                </h2>
                <button 
                  onClick={onClose}
                  className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-white text-xl"
                >
                  ✕
                </button>
              </div>

              <BunnyLottieSwitcher 
                currentMood={bunny.currentEmotion} 
                onMoodChange={onMoodChange} 
              />

              <button 
                onClick={() => setUseAR(true)}
                className="mt-10 px-8 py-3 bg-purple-600 text-white rounded-full font-bold shadow-lg"
              >
                {language === 'he' ? 'חזור ל-AR ✨' : 'Back to AR ✨'}
              </button>
            </div>
          </div>
        )}
      </ErrorBoundary>
    </div>
  );
}
