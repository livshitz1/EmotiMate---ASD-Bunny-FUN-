import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Language } from '../types';

interface WeatherWidgetProps {
  temp: number | null;
  weatherCode: number | null;
  language: Language;
  onDressed: () => void;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({ 
  temp, 
  weatherCode, 
  language,
  onDressed 
}) => {
  const [isDressed, setIsDressed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const getWeatherIcon = () => {
    if (weatherCode === null) return '☀️';
    if (weatherCode === 0) return '☀️';
    if (weatherCode <= 3) return '⛅';
    if (weatherCode <= 48) return '🌫️';
    if (weatherCode <= 65) return '🌧️';
    if (weatherCode <= 75) return '❄️';
    if (weatherCode <= 82) return '🌦️';
    return '⛈️';
  };

  const getClothingItem = () => {
    if (temp === null) return '🧢';
    if (temp < 18) return '🧣';
    if (temp > 22) return '🕶️';
    return '🧢';
  };

  const item = getClothingItem();
  const weatherIcon = getWeatherIcon();

  const handleDragEnd = (event: any, info: any) => {
    setIsDragging(false);
    // If dropped near the center (the bunny)
    if (Math.abs(info.point.x - window.innerWidth / 2) < 100 && 
        Math.abs(info.point.y - window.innerHeight / 2) < 150) {
      setIsDressed(true);
      onDressed();
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 backdrop-blur-md rounded-3xl p-4 shadow-xl border border-white/20 w-full max-w-[280px]"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-col">
          <span className="text-3xl font-black text-gray-800">{temp !== null ? `${Math.round(temp)}°C` : '--°C'}</span>
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            {language === 'he' ? 'מזג האוויר' : 'Weather'}
          </span>
        </div>
        
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="text-4xl"
        >
          {weatherIcon}
        </motion.div>
      </div>

      {!isDressed ? (
        <div className="flex flex-col items-center gap-3">
          <p className="text-[10px] font-bold text-indigo-600 text-center leading-tight">
            {language === 'he' 
              ? `הארנב צריך ${item === '🧣' ? 'צעיף' : item === '🕶️' ? 'משקפי שמש' : 'כובע'}! גרור אליו:` 
              : `Bunny needs ${item === '🧣' ? 'a scarf' : item === '🕶️' ? 'sunglasses' : 'a hat'}! Drag it:`}
          </p>
          
          <div className="relative w-full h-24 flex items-center justify-center border-2 border-dashed border-indigo-100 rounded-2xl bg-indigo-50/30">
            {/* The Bunny Target */}
            <div className="text-4xl opacity-30 grayscale">🐰</div>
            
            <motion.div
              drag
              dragConstraints={{ left: -100, right: 100, top: -100, bottom: 100 }}
              dragSnapToOrigin
              onDragStart={() => setIsDragging(true)}
              onDragEnd={handleDragEnd}
              whileDrag={{ scale: 1.5, zIndex: 50 }}
              className="absolute text-5xl cursor-grab active:cursor-grabbing z-10 drop-shadow-lg"
            >
              {item}
            </motion.div>
          </div>
          
          <button className="w-full py-2 bg-indigo-500 text-white text-[10px] font-black rounded-full shadow-md animate-pulse">
            {language === 'he' ? 'הלבש אותי!' : 'DRESS ME!'}
          </button>
        </div>
      ) : (
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center p-2 bg-green-50 rounded-2xl border border-green-100"
        >
          <div className="relative text-5xl mb-2">
            🐰
            <span className="absolute top-0 right-0 text-2xl">{item}</span>
          </div>
          <span className="text-[10px] font-black text-green-600">
            {language === 'he' ? 'מוכן ליום!' : 'READY FOR THE DAY!'}
          </span>
          <motion.div 
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="text-xl mt-1"
          >
            ✨⭐✨
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default WeatherWidget;
