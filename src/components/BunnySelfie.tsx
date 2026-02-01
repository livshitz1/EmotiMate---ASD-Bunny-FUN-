import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Language } from '../types';
import html2canvas from 'html2canvas';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

interface BunnySelfieProps {
  language: Language;
  bunnyComponent: React.ReactNode;
  onSave: (imageData: string) => void;
  onClose: () => void;
}

const BunnySelfie: React.FC<BunnySelfieProps> = ({ language, bunnyComponent, onSave, onClose }) => {
  const isHebrew = language === Language.HEBREW;
  const videoRef = useRef<HTMLVideoElement>(null);
  const captureRef = useRef<HTMLDivElement>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user' }, 
          audio: false 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsCameraReady(true);
        }
      } catch (err) {
        console.error("Camera access denied", err);
        alert(isHebrew ? "אופס! צריך אישור למצלמה כדי להצטלם עם הארנב" : "Oops! Camera permission is needed to take a selfie with the bunny");
        onClose();
      }
    };

    startCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  const takePhoto = async () => {
    if (countdown !== null) return;
    
    setCountdown(3);
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev === 1) {
          clearInterval(timer);
          executeCapture();
          return null;
        }
        return prev ? prev - 1 : null;
      });
    }, 1000);
  };

  const executeCapture = async () => {
    if (!captureRef.current || !videoRef.current) return;

    setFlash(true);
    Haptics.impact({ style: ImpactStyle.Heavy });
    
    setTimeout(async () => {
      try {
        const canvas = document.createElement('canvas');
        const video = videoRef.current!;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          // 1. Draw video frame (mirrored)
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          ctx.setTransform(1, 0, 0, 1, 0, 0);

          // 2. Use html2canvas to capture the bunny and accessories overlay
          // We capture ONLY the overlay div to avoid recursion and video issues
          const overlayElement = captureRef.current!.querySelector('.pointer-events-none') as HTMLElement;
          if (overlayElement) {
            const overlayCanvas = await html2canvas(overlayElement, {
              backgroundColor: null,
              useCORS: true,
              scale: canvas.width / overlayElement.offsetWidth
            });
            
            // 3. Draw overlay onto main canvas
            ctx.drawImage(overlayCanvas, 0, 0, canvas.width, canvas.height);
          }
        }

        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setFlash(false);
        onSave(dataUrl);
      } catch (e) {
        console.error("Capture failed", e);
        setFlash(false);
      }
    }, 100);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[600] bg-black flex flex-col items-center justify-center safe-area-inset-top safe-area-inset-bottom"
    >
      {/* Capture Area */}
      <div 
        ref={captureRef}
        className="relative w-full aspect-[3/4] max-w-md overflow-hidden bg-slate-800 shadow-2xl"
      >
        <video 
          ref={videoRef}
          autoPlay 
          playsInline 
          muted
          className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
        />
        
        {/* Bunny Overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none transform scale-75 mt-20">
          {bunnyComponent}
        </div>

        {/* Countdown */}
        <AnimatePresence>
          {countdown !== null && (
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1.5, opacity: 1 }}
              exit={{ scale: 2, opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <span className="text-white text-9xl font-black drop-shadow-2xl">{countdown}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Flash Effect */}
        <AnimatePresence>
          {flash && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white z-50"
            />
          )}
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="w-full max-w-md p-8 flex justify-between items-center bg-black">
        <button 
          onClick={onClose}
          className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-2xl"
        >
          ✕
        </button>
        
        <button 
          onClick={takePhoto}
          disabled={!isCameraReady || countdown !== null}
          className={`w-20 h-20 rounded-full border-4 border-white flex items-center justify-center p-1 transition-all active:scale-90 ${!isCameraReady ? 'opacity-50' : 'opacity-100'}`}
        >
          <div className="w-full h-full rounded-full bg-white" />
        </button>

        <div className="w-14" /> {/* Spacer */}
      </div>

      <p className="text-white/60 text-sm font-bold animate-pulse pb-4">
        {isHebrew ? 'חייכו! הארנב מוכן לסלפי' : 'Smile! The bunny is ready for a selfie'}
      </p>
    </motion.div>
  );
};

export default BunnySelfie;
