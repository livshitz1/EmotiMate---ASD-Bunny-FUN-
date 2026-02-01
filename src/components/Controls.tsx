import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ControlsProps {
  onAction: (action: string, foodType?: string, gameType?: string, hugType?: string) => void;
  disabled: boolean;
  onFeedClick?: () => void;
  onPlayClick?: () => void;
  onHugClick?: () => void;
  onBreathingClick?: () => void;
  onMusicClick?: () => void;
  onBackgroundMusicClick?: () => void;
  onBedtimeStoryClick?: () => void;
  onHealthyPlateClick?: () => void;
  onWaterBuddyClick?: () => void;
  onGratitudeClick?: () => void;
  onFriendshipClick?: () => void;
  onCuriosityClick?: () => void;
  onHelperClick?: () => void;
  language?: 'he' | 'en' | 'ru';
}

const Controls: React.FC<ControlsProps> = ({ 
  onAction, 
  disabled, 
  onFeedClick, 
  onPlayClick, 
  onHugClick, 
  onBreathingClick, 
  onMusicClick, 
  onBackgroundMusicClick, 
  onBedtimeStoryClick,
  onHealthyPlateClick,
  onWaterBuddyClick, 
  onGratitudeClick,
  onFriendshipClick,
  onCuriosityClick,
  onHelperClick,
  language = 'he' 
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftSparkle, setShowLeftSparkle] = useState(false);
  const [showRightSparkle, setShowRightSparkle] = useState(false);

  useEffect(() => {
    // Initial nudge animation
    if (scrollRef.current) {
      setTimeout(() => {
        if (scrollRef.current) {
          // Nudge by 10 pixels as requested
          // Note: in RTL, scrolling "left" means increasing the scroll position (or decreasing if it's negative)
          // We'll nudge a bit to show movement
          const isRTL = language === 'he';
          const nudgeAmount = isRTL ? -10 : 10;
          
          scrollRef.current.scrollTo({ left: nudgeAmount, behavior: 'smooth' });
          setTimeout(() => {
            if (scrollRef.current) {
              scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
            }
          }, 500);
        }
      }, 1500);
    }

    // Scroll listener for sparkles
    const handleScroll = () => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        const isRTL = language === 'he';
        
        if (isRTL) {
          // In RTL, scrollLeft is 0 at far right, and negative as we scroll left
          const absScrollLeft = Math.abs(scrollLeft);
          const hasMoreLeft = absScrollLeft < (scrollWidth - clientWidth - 10);
          const hasMoreRight = absScrollLeft > 10;
          
          setShowLeftSparkle(hasMoreLeft);
          setShowRightSparkle(hasMoreRight);
        } else {
          // In LTR, scrollLeft is 0 at far left
          const hasMoreRight = scrollLeft < (scrollWidth - clientWidth - 10);
          const hasMoreLeft = scrollLeft > 10;
          
          setShowRightSparkle(hasMoreRight);
          setShowLeftSparkle(hasMoreLeft);
        }
      }
    };

    const scrollEl = scrollRef.current;
    if (scrollEl) {
      scrollEl.addEventListener('scroll', handleScroll);
      // Initial check
      handleScroll();
    }
    return () => scrollEl?.removeEventListener('scroll', handleScroll);
  }, []);

  const getLabel = (key: string): string => {
    const labels: { [key: string]: { [lang: string]: string } } = {
      feed: { he: 'להאכיל', en: 'Feed', ru: 'Кормить' },
      play: { he: 'לשחק', en: 'Play', ru: 'Играть' },
      sleep: { he: 'לישון', en: 'Sleep', ru: 'Спать' },
      hug: { he: 'לחבק', en: 'Hug', ru: 'Обнять' },
      breathing: { he: 'נשימה', en: 'Breathe', ru: 'Дышать' },
      music: { he: 'מוזיקה', en: 'Music', ru: 'Музыка' },
      backgroundMusic: { he: 'מוזיקת רקע', en: 'Background', ru: 'Фוновая' },
      bedtimeStory: { he: 'סיפור', en: 'Story', ru: 'Сказка' },
      healthyPlate: { he: 'צלחת', en: 'Plate', ru: 'Тарелка' },
      waterBuddy: { he: 'מים', en: 'Water', ru: 'Вода' },
      gratitude: { he: 'תודה', en: 'Thanks', ru: 'Спасибо' },
      friendship: { he: 'חברים', en: 'Friends', ru: 'Друзья' },
      curiosity: { he: 'סקרנות', en: 'Curiosity', ru: 'Любопытство' },
      helper: { he: 'עוזר קטן', en: 'Helper', ru: 'Помощник' },
    };
    return labels[key]?.[language] || labels[key]?.he || key;
  };

  const buttons = [
    { label: getLabel('feed'), icon: '🥕', action: 'feed', color: 'from-orange-400 to-red-500', isFeed: true },
    { label: getLabel('healthyPlate'), icon: '🥦', action: 'healthyPlate', color: 'from-green-400 to-emerald-500', isHealthyPlate: true },
    { label: getLabel('waterBuddy'), icon: '💧', action: 'waterBuddy', color: 'from-blue-400 to-indigo-500', isWaterBuddy: true },
    { label: getLabel('gratitude'), icon: '✨', action: 'gratitude', color: 'from-yellow-400 to-amber-500', isGratitude: true },
    { label: getLabel('friendship'), icon: '🤝', action: 'friendship', color: 'from-blue-400 to-indigo-500', isFriendship: true },
    { label: getLabel('curiosity'), icon: '🎓', action: 'curiosity', color: 'from-purple-400 to-indigo-600', isCuriosity: true },
    { label: getLabel('helper'), icon: '✨', action: 'helper', color: 'from-teal-400 to-emerald-600', isHelper: true },
    { label: getLabel('play'), icon: '⚽', action: 'play', color: 'from-blue-400 to-cyan-500', isPlay: true },
    { label: getLabel('sleep'), icon: '🛌', action: 'sleep', color: 'from-indigo-400 to-purple-500' },
    { label: getLabel('hug'), icon: '❤️', action: 'hug', color: 'from-pink-400 to-rose-500', isHug: true },
    { label: getLabel('breathing'), icon: '🧘', action: 'breathing', color: 'from-green-400 to-emerald-500', isBreathing: true },
    { label: getLabel('music'), icon: '🎶', action: 'music', color: 'from-purple-400 to-indigo-500', isMusic: true },
    { label: getLabel('bedtimeStory'), icon: '📖', action: 'bedtimeStory', color: 'from-amber-400 to-orange-500', isBedtimeStory: true },
  ];

  return (
    <div className="flex flex-col w-full relative">
      <div 
        ref={scrollRef}
        className="flex overflow-x-auto flex-nowrap whitespace-nowrap scrollbar-hide w-full gap-3 px-4 py-2"
      >
        {buttons.map((btn, index) => (
          <button
            key={btn.action}
            onClick={() => {
              if ((btn as any).isBreathing && onBreathingClick) onBreathingClick();
              else if ((btn as any).isFeed && onFeedClick) onFeedClick();
              else if ((btn as any).isHealthyPlate && onHealthyPlateClick) onHealthyPlateClick();
              else if ((btn as any).isWaterBuddy && onWaterBuddyClick) onWaterBuddyClick();
              else if ((btn as any).isGratitude && onGratitudeClick) onGratitudeClick();
              else if ((btn as any).isFriendship && onFriendshipClick) onFriendshipClick();
              else if ((btn as any).isCuriosity && onCuriosityClick) onCuriosityClick();
              else if ((btn as any).isHelper && onHelperClick) onHelperClick();
              else if ((btn as any).isPlay && onPlayClick) onPlayClick();
              else if ((btn as any).isHug && onHugClick) onHugClick();
              else if ((btn as any).isMusic && onMusicClick) onMusicClick();
              else if ((btn as any).isBackgroundMusic && onBackgroundMusicClick) onBackgroundMusicClick();
              else if ((btn as any).isBedtimeStory && onBedtimeStoryClick) onBedtimeStoryClick();
              else onAction(btn.action);
            }}
            disabled={disabled}
            className={`
              relative group bg-gradient-to-br ${btn.color}
              border-b-2 border-black/20 active:border-b-0 active:translate-y-0.5
              p-4 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105
              shadow-md unity-button unity-glow w-[100px] h-[100px] flex-shrink-0
            `}
          >
            {/* Sparkle effect for icons when partially hidden */}
            {((index < 2 && showRightSparkle) || (index > buttons.length - 3 && showLeftSparkle)) && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: [0, 1, 0],
                  scale: [0.5, 1.2, 0.8],
                  rotate: [0, 45, 90]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  delay: (index % 2) * 0.5
                }}
                className="absolute -top-1 -left-1 text-xl z-20 pointer-events-none"
              >
                ✨
              </motion.div>
            )}

            <span className="text-3xl drop-shadow-md transform transition-transform group-hover:scale-110 text-glow"
                  style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}>
              {btn.icon}
            </span>
            <span className="font-bold text-[10px] text-white uppercase tracking-wider">
              {btn.label}
            </span>
          </button>
        ))}
      </div>
      
      {/* Scroll Dots Indicator */}
      <div className="flex justify-center gap-1.5 mt-1 mb-2">
        <div className="w-1.5 h-1.5 bg-white/20 rounded-full" />
        <div className="w-1.5 h-1.5 bg-white/20 rounded-full" />
        <div className="w-4 h-1.5 bg-white/80 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
      </div>
    </div>
  );
};

export default Controls;
