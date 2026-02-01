import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Language } from '../types';
import BunnyLottie from './BunnyLottie';

interface HowIFeelModeProps {
  language: Language;
  onClose: () => void;
  onAnalysisComplete: (message: string) => void;
}

export const HowIFeelMode: React.FC<HowIFeelModeProps> = ({ language, onClose, onAnalysisComplete }) => {
  const isHebrew = language === 'he';
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const takePhoto = async () => {
    try {
      setIsCapturing(true);
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
        direction: 'front' // Front camera for facial expressions
      });

      if (image.dataUrl) {
        setCapturedImage(image.dataUrl);
        
        // Simulate analysis delay
        setTimeout(() => {
          const response = isHebrew 
            ? 'אני רואה חיוך! זה אומר שאתה שמח? 😊' 
            : 'I see a smile! Does that mean you are happy? 😊';
          onAnalysisComplete(response);
          setIsCapturing(false);
        }, 2000);
      } else {
        setIsCapturing(false);
      }
    } catch (e) {
      console.error("Camera error:", e);
      setIsCapturing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[400] bg-indigo-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center overflow-hidden">
      <div className="absolute top-6 right-6">
        <button 
          onClick={onClose}
          className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-2xl text-white"
        >
          ✕
        </button>
      </div>

      <AnimatePresence mode="wait">
        {!capturedImage ? (
          <motion.div 
            key="start"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="flex flex-col items-center"
          >
            <div className="mb-8">
              <BunnyLottie animation="excited" />
            </div>
            
            <h2 className="text-3xl font-black text-white mb-4">
              {isHebrew ? 'איך אני מרגיש?' : 'How do I feel?'}
            </h2>
            <p className="text-xl text-indigo-200 mb-8 max-w-xs leading-relaxed">
              {isHebrew 
                ? 'בוא נראה את החיוך היפה שלך! לחץ על הכפתור ונסה לחייך למצלמה.' 
                : 'Let\'s see your beautiful smile! Click the button and try to smile at the camera.'}
            </p>

            <button 
              onClick={takePhoto}
              disabled={isCapturing}
              className={`px-10 py-5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-black text-2xl rounded-full shadow-2xl transition-all active:scale-95 ${isCapturing ? 'opacity-50' : 'hover:scale-105'}`}
            >
              {isCapturing ? (isHebrew ? 'מצלם...' : 'Capturing...') : (isHebrew ? 'אני מוכן! 📸' : 'I am ready! 📸')}
            </button>
          </motion.div>
        ) : (
          <motion.div 
            key="analysis"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center"
          >
            <div className="relative mb-8 w-64 h-64">
              <img 
                src={capturedImage} 
                className="w-full h-full object-cover rounded-[3rem] border-8 border-white/20 shadow-2xl" 
                alt="Captured"
              />
              <div className="absolute inset-0 border-4 border-purple-400 rounded-[3rem] animate-pulse"></div>
              {isCapturing && (
                <div className="absolute inset-0 bg-black/40 rounded-[3rem] flex items-center justify-center">
                  <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>

            <div className="mb-4">
              <BunnyLottie animation="happy" />
            </div>

            <div className="p-6 bg-white rounded-3xl shadow-2xl border-b-8 border-gray-200 max-w-sm">
              <p className="text-2xl font-black text-indigo-900 leading-tight">
                {isHebrew ? 'אני רואה חיוך! זה אומר שאתה שמח? 😊' : 'I see a smile! Does that mean you are happy? 😊'}
              </p>
            </div>
            
            <button 
              onClick={onClose}
              className="mt-8 px-8 py-3 bg-white/10 text-white font-bold rounded-2xl hover:bg-white/20"
            >
              {isHebrew ? 'סיום' : 'Finish'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
