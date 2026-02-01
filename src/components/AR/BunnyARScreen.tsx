import React, { useState, useEffect } from 'react';
import Bunny3DViewer from './Bunny3DViewer';
import { Camera } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';

interface BunnyARScreenProps {
  onClose: () => void;
  language: 'he' | 'en';
}

const BunnyARScreen: React.FC<BunnyARScreenProps> = ({ onClose, language }) => {
  const [activeModel, setActiveModel] = useState<'idle' | 'eating' | 'walk'>('idle');
  const isHebrew = language === 'he';

  // בתוך הקומפוננטה, לפני הפעלת ה-AR:
  const checkARPermissions = async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        const status = await Camera.checkPermissions();
        if (status.camera !== 'granted') {
          await Camera.requestPermissions({ permissions: ['camera'] });
        }
      } catch (e) {
        console.warn("Camera permissions check failed:", e);
      }
    }
  };

  useEffect(() => {
    checkARPermissions();
  }, []);

  const models = {
    idle: {
      path: '/bunny_temp.glb', 
      label: isHebrew ? 'מנוחה' : 'Idle',
      icon: '🐰',
      animation: 'Idle'
    },
    eating: {
      path: '/bunny-eating.glb',
      label: isHebrew ? 'אוכל' : 'Eating',
      icon: '🥕',
      animation: 'Eat'
    },
    walk: {
      path: '/bunny-walk.glb',
      label: isHebrew ? 'הליכה' : 'Walking',
      icon: '🌳',
      animation: 'Walk'
    }
  };

  return (
    <div className="fixed inset-0 z-[150] bg-black/90 backdrop-blur-xl flex flex-col text-white font-sans" dir={isHebrew ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="p-6 flex justify-between items-center border-b border-white/10">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          {isHebrew ? 'עולם התלת-ממד של הארנב' : 'Bunny 3D World'}
        </h2>
        <button 
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-2xl hover:bg-white/20 transition-all"
        >
          ✕
        </button>
      </div>

      {/* Main Viewer Area */}
      <div className="flex-1 p-4 flex flex-col items-center justify-center">
        <div className="w-full max-w-lg aspect-square">
          <Bunny3DViewer 
            modelPath={models[activeModel].path}
            animationName={models[activeModel].animation}
          />
        </div>
        
        <p className="mt-6 text-center text-gray-400 text-sm max-w-xs">
          {isHebrew 
            ? 'לחץ על הכפתור כדי להכניס את הארנב למציאות רבודה (AR) אצלך בחדר!' 
            : 'Click the button to bring the bunny into Augmented Reality (AR) in your room!'}
        </p>
      </div>

      {/* Model Selector Tabs */}
      <div className="p-8 bg-black/40 border-t border-white/10">
        <div className="flex justify-center gap-4">
          {(Object.keys(models) as Array<keyof typeof models>).map((key) => (
            <button
              key={key}
              onClick={() => setActiveModel(key)}
              className={`flex-1 max-w-[120px] p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                activeModel === key 
                  ? 'border-purple-500 bg-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.4)]' 
                  : 'border-white/10 bg-white/5 hover:bg-white/10'
              }`}
            >
              <span className="text-3xl">{models[key].icon}</span>
              <span className="text-xs font-bold">{models[key].label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BunnyARScreen;
