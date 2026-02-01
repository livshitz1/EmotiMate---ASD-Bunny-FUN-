import React, { useState, useEffect, useRef } from 'react';
import BunnyARScene from '../scenes/BunnyARScene';
import { BunnyState, Photo } from '../types';
import BunnyStatus from '../components/BunnyStatus';
import { SerenityBubble, BubbleExplosion } from '../components/TurboChargeAR';
import { Haptics, NotificationType, ImpactStyle } from '@capacitor/haptics';
import { motion, AnimatePresence } from 'framer-motion';
import { getAccessoryStyle } from '../utils/accessoryUtils';

interface BunnyARScreenProps {
  onClose: () => void;
  language?: 'he' | 'en';
  bunny: BunnyState;
  activeAccessories?: string[];
  onPhotoTaken?: (dataUrl: string) => void;
  isCleanupMode?: boolean;
  isTurboChargeMode?: boolean;
  isMealTime?: boolean;
  onEnergyGain?: (amount: number) => void;
}

/**
 * BunnyARScreen serves as the "Navigator" for our AR experience.
 */
const BunnyARScreen: React.FC<BunnyARScreenProps> = ({ 
  onClose, 
  language = 'he', 
  bunny, 
  activeAccessories = [], 
  onPhotoTaken,
  isCleanupMode = false,
  isTurboChargeMode = false,
  onEnergyGain
}) => {
  const isHebrew = language === 'he';
  const animations = {
    Idle: { anim: 'Idle', model: 'bunny_idle', icon: '🐰', label: isHebrew ? 'מנוחה' : 'Idle' },
    Eat: { anim: 'Eat', model: 'bunny_idle', icon: '🥕', label: isHebrew ? 'אוכל' : 'Eat' },
    Walk: { anim: 'Walk', model: 'bunny_walk', icon: '🚶', label: isHebrew ? 'הליכה' : 'Walk' }
  };

  const [activeAnimation, setActiveAnimation] = useState<'Idle' | 'Eat' | 'Walk'>('Idle');
  const [showError, setShowError] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  
  // Cleanup Mode States
  const [cleanupTimeLeft, setCleanupTimeLeft] = useState(120);
  const [toysCollected, setToysCollected] = useState(0);
  const [heartBursts, setHeartBursts] = useState<{id: number, x: number, y: number}[]>([]);

  // Turbo Charge States
  const [bubbles, setBubbles] = useState<{id: number, x: number, y: number, size: number}[]>([]);
  const [explosions, setExplosions] = useState<{id: number, x: number, y: number}[]>([]);

  // Meal Time States
  const [placedFood, setPlacedFood] = useState<{id: number, type: 'carrot' | 'apple', x: number, y: number}[]>([]);
  const [selectedFoodType, setSelectedFoodType] = useState<'carrot' | 'apple' | null>(null);

  useEffect(() => {
    if (isCleanupMode) {
      const timer = setInterval(() => {
        setCleanupTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isCleanupMode]);

  // Bubble Spawn Logic
  useEffect(() => {
    if (isTurboChargeMode) {
      const spawnInterval = setInterval(() => {
        if (bubbles.length < 8) {
          const newBubble = {
            id: Date.now() + Math.random(),
            x: Math.random() * (window.innerWidth - 100) + 50,
            y: Math.random() * (window.innerHeight - 300) + 150,
            size: Math.random() * 40 + 60
          };
          setBubbles(prev => [...prev, newBubble]);
        }
      }, 1500);
      return () => clearInterval(spawnInterval);
    } else {
      setBubbles([]);
    }
  }, [isTurboChargeMode, bubbles.length]);

  const handleBubbleTap = (id: number, x: number, y: number) => {
    const isQuiet = typeof localStorage !== 'undefined' && localStorage.getItem('emotimate_quiet_mode') === 'true';
    setBubbles(prev => prev.filter(b => b.id !== id));
    
    // Trigger effects
    const explosionId = Date.now();
    setExplosions(prev => [...prev, { id: explosionId, x, y }]);
    
    Haptics.impact({ style: ImpactStyle.Light });
    
    try {
      const audio = new Audio('/sounds/plink.mp3');
      audio.volume = isQuiet ? 0.2 : 0.4;
      audio.play().catch(() => {});
    } catch (e) {}

    if (onEnergyGain) onEnergyGain(5);

    setTimeout(() => {
      setExplosions(prev => prev.filter(exp => exp.id !== explosionId));
    }, 1000);
  };

  const handlePlaceFood = (event: React.MouseEvent | React.TouchEvent) => {
    const isQuiet = typeof localStorage !== 'undefined' && localStorage.getItem('emotimate_quiet_mode') === 'true';
    if (!isMealTime || !selectedFoodType) return;

    let x, y;
    if ('touches' in event) {
      x = event.touches[0].clientX;
      y = event.touches[0].clientY;
    } else {
      x = (event as React.MouseEvent).clientX;
      y = (event as React.MouseEvent).clientY;
    }

    const newFood = {
      id: Date.now(),
      type: selectedFoodType,
      x,
      y
    };

    setPlacedFood(prev => [...prev, newFood]);
    Haptics.impact({ style: ImpactStyle.Medium });
    
    try {
      const audio = new Audio('/sounds/pop.mp3');
      audio.volume = isQuiet ? 0.2 : 0.3;
      audio.play().catch(() => {});
    } catch (e) {}
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!document.querySelector('model-viewer')) {
        setShowError(true);
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleBunnyClick = () => {
    const isQuiet = typeof localStorage !== 'undefined' && localStorage.getItem('emotimate_quiet_mode') === 'true';
    if (isCleanupMode) {
      setToysCollected(prev => prev + 1);
      
      // Create heart burst at center of screen (bunny position)
      const id = Date.now();
      setHeartBursts(prev => [...prev, { id, x: window.innerWidth / 2, y: window.innerHeight / 2 }]);
      
      // Play sound and haptics
      Haptics.notification({ type: NotificationType.Success });
      
      try {
        const audio = new Audio('/sounds/points.mp3');
        audio.volume = isQuiet ? 0.2 : 0.5;
        audio.play().catch(e => console.warn("Audio playback failed", e));
      } catch (e) {}
      
      // Remove burst after animation
      setTimeout(() => {
        setHeartBursts(prev => prev.filter(h => h.id !== id));
      }, 2000);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCapture = async () => {
    const modelViewer = document.querySelector('model-viewer') as any;
    if (!modelViewer) return;

    try {
      setIsCapturing(true);
      await Haptics.notification({ type: NotificationType.Success });

      // 1. Capture model-viewer base image
      const baseDataUrl = modelViewer.toDataURL('image/jpeg', 0.8);
      
      // 2. Create a temporary canvas to merge accessories
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error("Could not get canvas context");

      // Load base image
      const baseImg = new Image();
      baseImg.src = baseDataUrl;
      await new Promise(resolve => baseImg.onload = resolve);

      canvas.width = baseImg.width;
      canvas.height = baseImg.height;
      ctx.drawImage(baseImg, 0, 0);

      // 3. Draw accessories
      // Accessories are rendered in screen-space relative to the bunny container.
      // In AR, the bunny is also centered in the screen usually if we follow the same layout.
      // But actually, in BunnyARScreen, the model-viewer is full screen.
      // We will render them on top of the model-viewer in the UI, and here we draw them on the canvas.
      
      for (const itemId of activeAccessories) {
        try {
          const accImg = new Image();
          accImg.src = `/assets/bunny/accessories/${itemId}.png`;
          await new Promise((resolve, reject) => {
            accImg.onload = resolve;
            accImg.onerror = resolve; // Continue even if one fails
          });

          if (accImg.complete && accImg.naturalWidth > 0) {
            const style = getAccessoryStyle(itemId);
            // Convert percentage styles to pixel positions on the canvas
            // Example style: { top: '5%', left: '50%', transform: 'translateX(-50%)', width: '120px' }
            
            let w = 0;
            if (typeof style.width === 'string' && style.width.endsWith('px')) {
              w = parseInt(style.width) * (canvas.width / 400); // Scale relative to design width
            } else {
              w = canvas.width * 0.3; // Default
            }
            
            const h = (accImg.naturalHeight / accImg.naturalWidth) * w;
            
            let x = 0;
            if (style.left === '50%') {
              x = (canvas.width / 2) - (w / 2);
            } else if (typeof style.left === 'string' && style.left.endsWith('%')) {
              x = (parseInt(style.left) / 100) * canvas.width;
            }

            let y = 0;
            if (typeof style.top === 'string' && style.top.endsWith('%')) {
              y = (parseInt(style.top) / 100) * canvas.height;
            } else if (typeof style.bottom === 'string' && style.bottom.endsWith('%')) {
              y = canvas.height - ((parseInt(style.bottom) / 100) * canvas.height) - h;
            }

            ctx.drawImage(accImg, x, y, w, h);
          }
        } catch (e) {
          console.warn(`Failed to draw accessory ${itemId}`, e);
        }
      }

      const finalDataUrl = canvas.toDataURL('image/jpeg', 0.8);
      
      const newPhoto: Photo = {
        id: Date.now().toString(),
        url: finalDataUrl,
        timestamp: new Date().toISOString()
      };

      // Save to localStorage photo_album as requested
      const savedAlbum = localStorage.getItem('photo_album') || '[]';
      const album = JSON.parse(savedAlbum);
      album.unshift(newPhoto);
      localStorage.setItem('photo_album', JSON.stringify(album.slice(0, 50)));

      if (onPhotoTaken) onPhotoTaken(dataUrl);
      
      // Visual feedback (flash)
      setTimeout(() => setIsCapturing(false), 200);
      
      alert(language === 'he' ? 'התמונה נשמרה באלבום! 📸' : 'Photo saved to album! 📸');
    } catch (e) {
      console.error("Capture failed", e);
      setIsCapturing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] bg-[#121212] flex flex-col text-white font-sans overflow-hidden">
      <div className="flex-1 relative flex flex-col">
        
        {/* Header Overlay */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start z-[160] pointer-events-auto" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 1rem)' }}>
          <div className="bg-black/40 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-white/10 shadow-2xl flex items-center gap-4">
            <h2 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {isHebrew ? 'עולם ה-AR' : 'AR World'}
            </h2>
            
            {/* Camera Button */}
            <button 
              onClick={handleCapture}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-xl transition-all active:scale-90 border border-white/20"
              title={isHebrew ? 'צלם תמונה' : 'Take Photo'}
            >
              📸
            </button>
          </div>
          <button 
            onClick={onClose}
            className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center text-2xl hover:bg-red-600 transition-all shadow-2xl border-2 border-white/20 active:scale-90"
          >
            ✕
          </button>
        </div>

        {/* Flash Effect */}
        <AnimatePresence>
          {isCapturing && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white z-[300]"
            />
          )}
        </AnimatePresence>

        {/* Status Overlay */}
        <div className="absolute top-24 left-0 right-0 px-6 z-[160] pointer-events-none" style={{ top: 'calc(env(safe-area-inset-top) + 4.5rem)' }}>
          <div className="max-w-md mx-auto scale-90 origin-top opacity-90">
            <BunnyStatus bunny={bunny} language={language as any} />
          </div>
        </div>

        {/* The AR Scene Navigator */}
        <div 
          className="flex-1 relative"
          onClick={handlePlaceFood}
          onTouchStart={handlePlaceFood}
        >
          <BunnyARScene 
            animationName={activeAnimation === 'Eat' ? 'Eat' : (activeAnimation === 'Walk' ? 'Walk' : 'Idle')} 
            modelPath={activeAnimation === 'Walk' ? '/assets/models/bunny_walk.glb' : '/assets/models/bunny_idle.glb'}
            onBunnyClick={handleBunnyClick}
          />

          {/* Placed Food Icons */}
          <AnimatePresence>
            {placedFood.map((food) => (
              <motion.div
                key={food.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                className="absolute pointer-events-none z-[158] text-5xl"
                style={{ left: food.x - 25, top: food.y - 25 }}
              >
                {food.type === 'carrot' ? '🥕' : '🍎'}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Accessory Overlays */}
          <div className="absolute inset-0 pointer-events-none z-[155] flex items-center justify-center">
            <div className="relative w-full h-full max-w-md mx-auto">
              <AnimatePresence>
                {activeAccessories.map((itemId) => (
                  <motion.img
                    key={itemId}
                    src={`/assets/bunny/accessories/${itemId}.png`}
                    className="absolute pointer-events-none"
                    style={getAccessoryStyle(itemId)}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ 
                      opacity: 1, 
                      scale: 1,
                      y: [0, -4, 0] 
                    }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{
                      y: {
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }
                    }}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Navigation / Interaction Controls at bottom */}
        {!isCleanupMode && !isMealTime ? (
          <div className="p-8 bg-black/60 border-t border-white/10 backdrop-blur-md z-50">
            <div className="flex justify-center gap-4 max-w-md mx-auto">
              {(Object.keys(animations) as Array<keyof typeof animations>).map((key) => (
                <button
                  key={key}
                  onClick={() => setActiveAnimation(key)}
                  className={`flex-1 p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                    activeAnimation === key 
                      ? 'border-purple-500 bg-purple-500/30 shadow-[0_0_25px_rgba(168,85,247,0.5)] scale-105' 
                      : 'border-white/10 bg-white/5 hover:bg-white/10 opacity-60'
                  }`}
                >
                  <span className="text-3xl">{animations[key].icon}</span>
                  <span className="text-xs font-bold uppercase tracking-wider">{animations[key].label}</span>
                </button>
              ))}
            </div>
          </div>
        ) : isMealTime ? (
          <div className="p-8 bg-green-900/80 border-t border-white/20 backdrop-blur-md z-50 text-center">
            <div className="flex flex-col items-center gap-4 max-w-md mx-auto">
              <h3 className="text-xl font-black text-white">
                {language === 'he' ? 'בוא נאכל יחד!' : 'Meal Time!'} 🍽️
              </h3>
              <p className="text-sm text-green-200 font-bold mb-2">
                {language === 'he' ? 'בחר אוכל ולחץ על הצלחת שלך כדי להניח אותו:' : 'Pick food and tap your plate to place it:'}
              </p>
              <div className="flex justify-center gap-6">
                <button 
                  onClick={() => setSelectedFoodType('carrot')}
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center text-4xl transition-all border-4 ${selectedFoodType === 'carrot' ? 'border-orange-400 bg-orange-400/20 scale-110' : 'border-white/10 bg-white/5'}`}
                >
                  🥕
                </button>
                <button 
                  onClick={() => setSelectedFoodType('apple')}
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center text-4xl transition-all border-4 ${selectedFoodType === 'apple' ? 'border-red-400 bg-red-400/20 scale-110' : 'border-white/10 bg-white/5'}`}
                >
                  🍎
                </button>
              </div>
              {placedFood.length > 0 && (
                <button 
                  onClick={() => setPlacedFood([])}
                  className="mt-2 text-xs text-white/60 underline"
                >
                  {language === 'he' ? 'נקה צלחת' : 'Clear Plate'}
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="p-8 bg-blue-900/80 border-t border-white/20 backdrop-blur-md z-50 text-center">
            <div className="flex flex-col items-center gap-4 max-w-md mx-auto">
              <h3 className="text-xl font-black text-white">
                {isHebrew ? 'אספת כבר:' : 'Collected:'} {toysCollected} 🧸
              </h3>
              <p className="text-sm text-blue-200 font-bold">
                {isHebrew ? 'לחץ על הארנב כשאתה מסיים לסדר פריט!' : 'Click on the bunny when you finish tidying an item!'}
              </p>
            </div>
          </div>
        )}

        {/* Cleanup Mode Timer Overlay */}
        {isCleanupMode && (
          <div className="absolute top-24 left-1/2 -translate-x-1/2 z-[170] pointer-events-none">
            <div className="bg-white/10 backdrop-blur-xl px-8 py-4 rounded-3xl border-4 border-white/30 shadow-[0_0_30px_rgba(255,255,255,0.2)] flex flex-col items-center">
              <span className="text-4xl font-black text-white font-mono drop-shadow-lg">
                {formatTime(cleanupTimeLeft)}
              </span>
              <span className="text-[10px] font-black text-blue-300 uppercase tracking-widest mt-1">
                {isHebrew ? 'זמן לסדר' : 'Cleanup Timer'}
              </span>
            </div>
          </div>
        )}

        {/* Heart Bursts */}
        <AnimatePresence>
          {heartBursts.map((h) => (
            <motion.div
              key={h.id}
              initial={{ opacity: 0, scale: 0, y: 0 }}
              animate={{ 
                opacity: [0, 1, 0], 
                scale: [0.5, 2, 1.5], 
                y: -300,
                x: (Math.random() - 0.5) * 200
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="absolute pointer-events-none z-[400] text-6xl"
              style={{ left: h.x, top: h.y }}
            >
              ❤️
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Serenity Bubbles (Turbo Charge AR) */}
        <AnimatePresence>
          {bubbles.map((b) => (
            <SerenityBubble
              key={b.id}
              id={b.id}
              x={b.x}
              y={b.y}
              size={b.size}
              onTap={handleBubbleTap}
            />
          ))}
        </AnimatePresence>

        {/* Bubble Explosions */}
        <AnimatePresence>
          {explosions.map((exp) => (
            <BubbleExplosion
              key={exp.id}
              x={exp.x}
              y={exp.y}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default BunnyARScreen;
