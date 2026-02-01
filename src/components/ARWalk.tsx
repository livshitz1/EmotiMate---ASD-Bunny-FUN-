import React, { useEffect, useRef, useState } from 'react';
import { Emotion, Language } from '../types';

interface ARWalkProps {
  language: Language;
  onClose: () => void;
  bunnyMood: Emotion;
}

const ARWalk: React.FC<ARWalkProps> = ({ language, onClose, bunnyMood }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSimulator, setIsSimulator] = useState(false);
  const isHebrew = language === 'he';

  useEffect(() => {
    async function startCamera() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' }, // Use back camera on mobile
          audio: false 
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err: any) {
        console.error("Error accessing camera:", err);
        // Check if it's a simulator (usually failing because of no device or permission)
        if (err.name === 'NotFoundError' || err.name === 'NotAllowedError' || err.name === 'DevicesNotFoundError') {
          console.log("Camera not found or blocked, enabling simulator mode");
          setIsSimulator(true);
        } else {
          setError(isHebrew ? "לא הצלחנו לגשת למצלמה. וודא שנתת הרשאות." : "Could not access camera. Please check permissions.");
        }
      }
    }

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-[#121212] flex flex-col items-center justify-center overflow-hidden">
      {/* Camera Feed or Simulator Background */}
      {isSimulator ? (
        <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-green-900 to-green-600">
           {/* Mock grass/garden pattern */}
           <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
        </div>
      ) : (
        <div className="absolute inset-0 w-full h-full">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className="w-full h-full object-cover"
          />
          {/* Fallback button if camera is just grey/black */}
          <button 
            onClick={() => setIsSimulator(true)}
            className="absolute bottom-32 left-1/2 -translate-x-1/2 bg-white/20 text-white/50 px-4 py-2 rounded-full text-xs"
          >
            {isHebrew ? "המצלמה לא עובדת? לחץ כאן" : "Camera not working? Click here"}
          </button>
        </div>
      )}

      {/* AR Overlay - The Bunny (3D Model with SVG fallback) */}
      <div className="relative z-10 w-full h-96 mt-20 pointer-events-none flex items-center justify-center">
        <div className="w-64 h-64 relative flex items-center justify-center">
          {/* @ts-ignore */}
          <model-viewer
            src="assets/models/bunny-walk.glb"
            autoplay
            animation-name="Walk"
            shadow-intensity="1"
            environment-image="neutral"
            exposure="1.2"
            interaction-prompt="none"
            camera-controls={false}
            auto-rotate
            style={{ width: '100%', height: '100%', backgroundColor: 'transparent' }}
          >
          </model-viewer>
          
          {/* We'll use a simpler fallback if model-viewer fails to load the model after timeout */}
          <div id="svg-fallback" className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0">
             <div className="text-8xl animate-bounce">🐰</div>
          </div>
        </div>
      </div>

      {/* UI Controls */}
      <div className="absolute top-10 left-0 right-0 flex justify-between px-6 z-20">
        <button 
          onClick={onClose}
          className="bg-red-500 text-white p-3 rounded-full shadow-xl font-bold text-xl"
        >
          ✕
        </button>
        <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
          <p className="text-white font-bold">
            {isHebrew ? "טיול עם הארנב 🌳" : "Walking with the Bunny 🌳"}
          </p>
        </div>
      </div>

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-50 p-10 text-center">
          <p className="text-white text-xl font-bold">{error}</p>
          <button 
            onClick={onClose}
            className="mt-6 bg-white text-black px-6 py-2 rounded-xl font-bold"
          >
            {isHebrew ? "סגור" : "Close"}
          </button>
        </div>
      )}

      {/* Instructions Overlay */}
      <div className="absolute bottom-10 left-6 right-6 z-20 text-center">
        <p className="bg-black/50 text-white text-sm py-3 px-6 rounded-2xl backdrop-blur-sm border border-white/10">
          {isHebrew 
            ? "הארנב איתך בחדר! נסה להסתובב איתו 🐰✨" 
            : "The bunny is in the room with you! Try walking around 🐰✨"}
        </p>
      </div>
    </div>
  );
};

export default ARWalk;
