import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BunnyLottie from './BunnyLottie';
import { Geolocation } from '@capacitor/geolocation';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { playDingSound } from './AudioPlayer';

interface CalmCommuteProps {
  language: 'he' | 'en';
  onClose: () => void;
  onDiscovery: (points: number) => void;
  onAction?: (text: string) => void;
}

const DISCOVERY_ITEMS = [
  { id: 'car', icon: '🚗', label: { he: 'מכונית', en: 'Car' } },
  { id: 'tree', icon: '🌳', label: { he: 'עץ', en: 'Tree' } },
  { id: 'dog', icon: '🐶', label: { he: 'כלב', en: 'Dog' } },
  { id: 'sign', icon: '🛑', label: { he: 'תמרור', en: 'Sign' } },
  { id: 'cloud', icon: '☁️', label: { he: 'ענן', en: 'Cloud' } },
];

export const CalmCommute: React.FC<CalmCommuteProps> = ({ 
  language, 
  onClose, 
  onDiscovery,
  onAction 
}) => {
  const [speed, setSpeed] = useState<number>(0); // km/h
  const [isCarTheme, setIsCarTheme] = useState(false);
  const [discoveredItems, setDiscoveredItems] = useState<string[]>([]);
  const [starAnimation, setStarAnimation] = useState<{id: number, x: number, y: number} | null>(null);
  const watchIdRef = useRef<string | null>(null);

  const isHebrew = language === 'he';

  useEffect(() => {
    const startSpeedWatch = async () => {
      try {
        const { state } = await Geolocation.requestPermissions();
        if (state === 'granted') {
          const id = await Geolocation.watchPosition({
            enableHighAccuracy: true,
            timeout: 5000
          }, (position) => {
            if (position?.coords.speed !== null) {
              const speedKmH = (position.coords.speed || 0) * 3.6;
              setSpeed(speedKmH);
              setIsCarTheme(speedKmH > 5);
            }
          });
          watchIdRef.current = id;
        }
      } catch (e) {
        console.error("Geolocation failed in CalmCommute", e);
      }
    };

    startSpeedWatch();

    return () => {
      if (watchIdRef.current) {
        Geolocation.clearWatch({ id: watchIdRef.current });
      }
    };
  }, []);

  const handleDiscovery = (itemId: string, event: React.MouseEvent | React.TouchEvent) => {
    const item = DISCOVERY_ITEMS.find(i => i.id === itemId);
    if (!item) return;

    // Trigger feedback
    Haptics.impact({ style: ImpactStyle.Light });
    
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      playDingSound(ctx);
    } catch (e) {}

    // Show star animation at click position
    const x = 'clientX' in event ? (event as React.MouseEvent).clientX : (event as React.TouchEvent).touches[0].clientX;
    const y = 'clientY' in event ? (event as React.MouseEvent).clientY : (event as React.TouchEvent).touches[0].clientY;
    
    setStarAnimation({ id: Date.now(), x, y });
    setTimeout(() => setStarAnimation(null), 1000);

    setDiscoveredItems(prev => [...prev, itemId]);
    onDiscovery(2); // Award 2 points per discovery

    if (onAction) {
      onAction(isHebrew 
        ? `ראיתי ${item.label.he}! איזה יופי!` 
        : `I saw a ${item.label.en}! How cool!`);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 z-[100] flex flex-col items-center p-6 overflow-hidden transition-colors duration-1000 ${
        isCarTheme ? 'bg-indigo-900' : 'bg-green-100'
      }`}
    >
      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        {isCarTheme ? (
          <div className="absolute bottom-0 w-full h-32 bg-slate-800" />
        ) : (
          <div className="absolute bottom-0 w-full h-32 bg-green-800" />
        )}
      </div>

      {/* Header */}
      <div className="mt-8 text-center z-10">
        <h2 className={`text-3xl font-black drop-shadow-lg ${isCarTheme ? 'text-white' : 'text-green-900'}`}>
          {isHebrew ? 'יוצאים לדרך!' : 'Calm Commute!'}
        </h2>
        <p className={`${isCarTheme ? 'text-white/70' : 'text-green-700'} font-bold`}>
          {isCarTheme 
            ? (isHebrew ? 'אנחנו נוסעים מהר! 🚗' : 'We are driving fast! 🚗')
            : (isHebrew ? 'צועדים בכיף! 🚶' : 'Walking and exploring! 🚶')
          }
        </p>
      </div>

      {/* Main Content */}
      <div className="flex-1 w-full flex flex-col items-center justify-center relative">
        
        {/* Bunny with Magnifying Glass */}
        <div className="relative w-64 h-64 mb-8">
          <BunnyLottie mood="happy" className="w-full h-full" />
          
          <motion.div 
            animate={{ 
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute top-0 right-0 text-6xl"
          >
            🔍
          </motion.div>
        </div>

        {/* Discovery Wheel / Grid */}
        <div className="grid grid-cols-3 gap-4 w-full max-w-sm px-4 z-10">
          {DISCOVERY_ITEMS.map((item) => (
            <motion.button
              key={item.id}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => handleDiscovery(item.id, e)}
              className={`
                relative h-24 rounded-2xl border-4 transition-all flex flex-col items-center justify-center gap-1
                ${isCarTheme 
                  ? 'bg-white/10 border-white/20 text-white' 
                  : 'bg-white border-green-200 text-green-900 shadow-lg'
                }
              `}
            >
              <span className="text-4xl">{item.icon}</span>
              <span className="text-[10px] font-bold opacity-80 uppercase">
                {isHebrew ? item.label.he : item.label.en}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Star Animation */}
      <AnimatePresence>
        {starAnimation && (
          <motion.div
            key={starAnimation.id}
            initial={{ scale: 0, x: starAnimation.x - 20, y: starAnimation.y - 20 }}
            animate={{ scale: [0, 1.5, 0], opacity: [0, 1, 0], y: starAnimation.y - 100 }}
            exit={{ opacity: 0 }}
            className="fixed pointer-events-none text-4xl z-[200]"
          >
            🌟
          </motion.div>
        )}
      </AnimatePresence>

      {/* Close Button */}
      <button 
        onClick={onClose}
        className={`absolute top-6 right-6 w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all backdrop-blur-sm ${
          isCarTheme ? 'bg-white/20 text-white' : 'bg-black/10 text-black'
        }`}
      >
        ✕
      </button>
    </motion.div>
  );
};

export default CalmCommute;
