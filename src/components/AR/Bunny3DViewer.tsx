import React, { useState, useRef, useEffect } from 'react';
import '@google/model-viewer';

interface Bunny3DViewerProps {
  modelPath: string;
  iosModelPath?: string;
  animationName?: string;
  autoPlay?: boolean;
}

const Bunny3DViewer: React.FC<Bunny3DViewerProps> = ({ 
  modelPath, 
  iosModelPath, 
  animationName, 
  autoPlay = true 
}) => {
  const modelRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const viewer = modelRef.current;
    if (!viewer) return;

    const handleLoad = () => {
      console.log("Model loaded successfully:", modelPath);
      setIsLoading(false);
      setHasError(false);
    };

    const handleError = (error: any) => {
      console.error("Error loading 3D model:", modelPath, error);
      setIsLoading(false);
      setHasError(true);
    };

    // Add manual event listeners for web components in React
    viewer.addEventListener('load', handleLoad);
    viewer.addEventListener('error', handleError);

    // Reset state on path change
    setIsLoading(true);
    setHasError(false);

    // Safety timeout: if it takes more than 10 seconds, show error
    const timer = setTimeout(() => {
      // Check if it's still loading
      setIsLoading(prev => {
        if (prev) {
          console.warn("Loading timed out for:", modelPath);
          setHasError(true);
          return false;
        }
        return false;
      });
    }, 10000);

    return () => {
      viewer.removeEventListener('load', handleLoad);
      viewer.removeEventListener('error', handleError);
      clearTimeout(timer);
    };
  }, [modelPath]);

  return (
    <div className="w-full h-full min-h-[300px] relative bg-gradient-to-b from-purple-900/40 to-black/20 rounded-3xl overflow-hidden border border-white/10 shadow-2xl flex items-center justify-center">
      
      {/* Loading Indicator */}
      {isLoading && !hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-black/40 backdrop-blur-sm">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-purple-300 font-bold animate-pulse text-center px-4">
            טוען את הארנב...<br/>
            <span className="text-[10px] opacity-60 font-normal">מחפש את הקובץ: {modelPath.split('/').pop()}</span>
          </p>
        </div>
      )}

      {/* Error Message */}
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-black/60 p-6 text-center">
          <span className="text-5xl mb-4">⚠️</span>
          <p className="text-white font-bold mb-2">הקובץ לא נמצא</p>
          <div className="text-gray-300 text-xs space-y-3 bg-black/40 p-4 rounded-2xl border border-white/10">
            <p>האפליקציה מחפשת את המודל בנתיב:</p>
            <code className="block bg-white/10 p-2 rounded break-all text-purple-300">
              public/{modelPath.split('/').pop()}
            </code >
            <p className="text-[10px] text-gray-400">
              וודא שהעלית את קבצי ה-GLB לתיקיית public הראשית.<br/>
            </p>
          </div>
        </div>
      )}

      {/* The 3D Engine */}
      {/* @ts-ignore */}
      <model-viewer
        key={modelPath}
        ref={modelRef}
        src={modelPath}
        ios-src={iosModelPath}
        alt="A 3D model of the bunny"
        ar
        ar-modes="webxr scene-viewer quick-look"
        ar-scale="fixed"
        camera-controls
        auto-rotate
        shadow-intensity="1"
        environment-image="neutral"
        exposure="2"
        scale="1.5 1.5 1.5"
        camera-target="0m -1m -2m"
        shadow-intensity="1"
        shadow-softness="1"
        autoplay
        animation-name={animationName}
        power-preference="low-power"
        style={{ width: '100%', height: '100%', backgroundColor: 'transparent' }}
      >
        {!isLoading && !hasError && (
          <button 
            slot="ar-button" 
            className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-full font-bold shadow-xl transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2 z-30"
          >
            <span>✨</span> ראה את הארנב בחדר
          </button>
        )}
      </model-viewer>
      
      <div className="absolute top-4 right-4 pointer-events-none opacity-50 z-10">
        <div className="text-[10px] text-white bg-black/40 px-2 py-1 rounded-md">3D MODE</div>
      </div>
    </div>
  );
};

export default Bunny3DViewer;
