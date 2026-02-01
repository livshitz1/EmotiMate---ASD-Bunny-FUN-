import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Language, BunnyState } from '../types';
import { AppSettings } from './Settings';

// Mock UnityView component configuration
const UNITY_CONFIG = {
  frameworkPath: 'ios/App/App/Unity/Framework',
  dataUrl: 'ios/App/App/Unity/Data.json',
  loaderUrl: 'ios/App/App/Unity/Loader.js',
};

interface UnityARScreenProps {
  language: Language;
  bunny: BunnyState;
  settings: AppSettings;
  onClose: () => void;
  onError: (error: string) => void;
}

const UnityARScreen: React.FC<UnityARScreenProps> = ({ language, bunny, settings, onClose, onError }) => {
  const isHebrew = language === Language.HEBREW;
  const unityContainerRef = useRef<HTMLDivElement>(null);
  const unityInstanceRef = useRef<any>(null);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [isUnityReady, setIsUnityReady] = useState(false);

  // Sync Settings to Unity
  useEffect(() => {
    // Listener for Unity readiness signal
    (window as any).onUnityReady = () => {
      console.log("Unity AR Signal: Ready!");
      setIsUnityReady(true);
      unityInstanceRef.current = { ready: true }; // Mock instance for checks
    };

    return () => {
      delete (window as any).onUnityReady;
    };
  }, []);

  useEffect(() => {
    if (isUnityReady) {
      console.log("Syncing Settings to Unity...");
      const syncData = {
        safeZones: {
          home: settings.homeAddress,
          school: settings.schoolName
        },
        audio: {
          muteVoice: true, // Permanent Silence Policy
          volume: settings.soundVolume
        }
      };
      
      // Post message to Unity (example methodology)
      // window.SendMessage('Bridge', 'SyncSettings', JSON.stringify(syncData));
      console.log("Unity Sync Data:", syncData);
    }
  }, [settings.homeAddress, settings.schoolName, settings.bunnySpeechEnabled, settings.soundVolume]);

  useEffect(() => {
    // Logic to initialize Unity Scene
    console.log("Initializing Unity AR Scene...");

    // Timeout for Unity loading (10 seconds)
    const timer = setTimeout(() => {
      if (!isUnityReady) {
        setLoadingTimeout(true);
      }
    }, 10000);

    // Simulate potential failure
    const checkSupport = () => {
      if (!window.WebGLRenderingContext) {
        onError("WebGL not supported");
      }
    };
    checkSupport();

    return () => {
      clearTimeout(timer);
      console.log("Cleaning up Unity AR Scene...");
    };
  }, [onError]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[1000] bg-black"
    >
      {/* Unity Iframe/Container */}
      <div ref={unityContainerRef} className="w-full h-full">
        {isUnityReady ? (
          <div className="w-full h-full bg-transparent flex items-center justify-center">
             {/* Unity Surface (from ios/App/App/Unity) */}
             <div className="text-white opacity-20 text-xs">Unity Active Surface (Framework: /ios/App/App/Unity)</div>
          </div>
        ) : loadingTimeout ? (
          <div className="flex flex-col items-center justify-center h-full text-white p-6 bg-slate-900">
            <div className="text-6xl mb-4">⚠️</div>
            <p className="text-xl font-bold mb-4 text-center">
              {isHebrew ? 'החיבור ליוניטי נכשל' : 'Unity Connection Failed'}
            </p>
            <p className="text-sm text-gray-400 mb-8 text-center">
              {isHebrew ? 'אנא וודאו שקבצי ה-Build נמצאים בתיקיית ios/App/App/Unity' : 'Ensure Unity build files are in ios/App/App/Unity folder'}
            </p>
            <div className="flex flex-col gap-4 w-full max-w-xs">
              <button 
                onClick={() => window.location.reload()}
                className="px-6 py-4 bg-indigo-600 rounded-2xl font-bold text-lg shadow-xl active:scale-95 transition-all"
              >
                {isHebrew ? 'נסה שוב' : 'Retry'}
              </button>
              <button 
                onClick={onClose}
                className="px-6 py-4 bg-white/10 rounded-2xl font-bold text-lg active:scale-95 transition-all"
              >
                {isHebrew ? 'חזור ל-2D' : 'Back to 2D'}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-white">
            <div className="text-6xl mb-4 animate-spin">✨</div>
            <p className="text-xl font-bold">
              {isHebrew ? 'טוען עולם AR של יוניטי...' : 'Loading Unity AR World...'}
            </p>
            <div className="mt-8 text-center opacity-60 text-sm">
              <p>{isHebrew ? 'וודאו שאתם באזור בטוח' : 'Ensure you are in a Safe Zone'}</p>
              <p>{isHebrew ? 'הארנב יופיע כשנמצא דשא או מים' : 'Bunny spawns when grass/water is found'}</p>
            </div>
          </div>
        )}
      </div>

      {/* Control Overlay */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start">
        <div className="bg-black/40 backdrop-blur-md p-4 rounded-2xl border border-white/10">
          <h2 className="text-xl font-black text-white">Unity AR</h2>
        </div>
        <button 
          onClick={onClose}
          className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center text-white text-2xl shadow-xl"
        >
          ✕
        </button>
      </div>
    </motion.div>
  );
};

export default UnityARScreen;
