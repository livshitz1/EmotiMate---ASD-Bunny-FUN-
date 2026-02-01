import React, { useRef, useState, useEffect } from 'react';
// @google/model-viewer is loaded via script in index.html for stability

interface BunnyARSceneProps {
  modelPath?: string;
  animationName?: string;
  onBunnyClick?: () => void;
  isCleanupMode?: boolean;
}

const BunnyARScene: React.FC<BunnyARSceneProps> = ({ 
  modelPath = '/assets/models/bunny_temp.glb',
  animationName = 'Idle',
  onBunnyClick,
  isCleanupMode = false
}) => {
  const modelRef = useRef<any>(null);
  const [isClicked, setIsClicked] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const currentModel = modelRef.current;
    if (currentModel) {
      const handleError = (error: any) => {
        console.error("Model failed to load:", error);
        setLoadError(true);
      };

      currentModel.addEventListener('error', handleError);
      return () => {
        currentModel.removeEventListener('error', handleError);
      };
    }
  }, [modelPath]);

  // Equivalent to handleClick in Viro
  const handleInteraction = () => {
    setIsClicked(true);
    if (onBunnyClick) onBunnyClick();
    
    // In model-viewer, scaling in AR is usually automatic, 
    // but we can trigger internal animations or change UI states.
    console.log("Bunny clicked! Changing state.");
    
    // If we wanted to change scale programmatically in the 3D view:
    if (modelRef.current) {
      // In model-viewer we use 'scale' as a property that takes a space-separated string
      try {
        modelRef.current.scale = isClicked ? "0.3 0.3 0.3" : "0.25 0.25 0.25";
      } catch (e) {
        console.warn("Could not set model scale:", e);
      }
    }
  };

  if (loadError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-black/40 text-white p-8 text-center backdrop-blur-md">
        <div className="text-6xl mb-4">⚠️</div>
        <h3 className="text-xl font-bold mb-2">שגיאה בטעינת המודל</h3>
        <p className="text-sm opacity-80 mb-6">לא הצלחנו לטעון את הארנב בתלת-ממד. אנא וודא שיש לך חיבור אינטרנט תקין ונסה שוב.</p>
        <button 
          onClick={() => setLoadError(false)}
          className="bg-purple-600 px-6 py-2 rounded-full font-bold hover:bg-purple-700 transition-all"
        >
          נסה שוב
        </button>
      </div>
    );
  }

  const getStatusText = () => {
    if (isCleanupMode) {
      return isClicked ? "כל הכבוד! 🎉" : "לחץ עלי כשסידרת פריט 🧸";
    }
    return isClicked ? "יאמי! איזה כיף ✨" : "הארנב מחכה לגזר 🥕";
  };

  return (
    <div className="w-full h-full relative bg-transparent">
      {/* Equivalent to ViroText - Adjusted top to avoid overlap */}
      <div className="absolute top-32 left-0 right-0 z-20 text-center pointer-events-none px-4">
        <p className="bg-white/95 text-purple-800 px-8 py-4 rounded-2xl inline-block shadow-2xl border-2 border-purple-200 font-bold text-xl animate-bounce">
          {getStatusText()}
        </p>
      </div>

      {/* 
        The 3D/AR Engine
      */}
      {/* @ts-ignore */}
      <model-viewer
        ref={modelRef}
        key={modelPath}
        src={modelPath}
        loading="eager"
        reveal="auto"
        ar
        ar-modes="webxr scene-viewer quick-look"
        ar-scale="fixed"
        camera-controls
        auto-rotate
        shadow-intensity="1"
        environment-image="neutral"
        exposure="2"
        autoplay
        animation-name={animationName}
        onClick={handleInteraction}
        scale="1.5 1.5 1.5"
        camera-target="0m -1m -2m"
        shadow-softness="1"
        power-preference="low-power"
        style={{ 
          width: '100%', 
          height: '100%', 
          backgroundColor: 'transparent',
          '--poster-color': 'transparent'
        } as any}
      >
        <div slot="poster" className="absolute inset-0 flex items-center justify-center text-white/20">
          <div className="text-center">
            <div className="text-6xl mb-4 animate-pulse">🐰</div>
            <p>טוען את הארנב...</p>
          </div>
        </div>

        <button 
          slot="ar-button" 
          className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-10 py-4 rounded-full font-bold shadow-[0_10px_25px_rgba(168,85,247,0.5)] transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2 z-30"
        >
          <span>🐰</span> הצב את הארנב בחדר
        </button>

        <div slot="ar-failure" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/80 p-4 rounded-xl text-white text-center hidden">
          מכשיר זה אינו תומך ב-AR
        </div>
      </model-viewer>

      {/* Small UI hint */}
      <div className="absolute bottom-32 left-0 right-0 text-center pointer-events-none opacity-60">
        <p className="text-white text-xs">לחץ על הארנב כדי ללטף אותו!</p>
      </div>
    </div>
  );
};

export default BunnyARScene;
