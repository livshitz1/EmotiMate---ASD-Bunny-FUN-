import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Language, Emotion } from '../types';
import BunnyLottie from './BunnyLottie';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

interface WaterBuddyProps {
  language: Language;
  onClose: () => void;
  onDrink: (cups: number) => void;
  onAction: (text: string) => void;
}

type WaterHistoryMap = Record<string, number>;

interface WaterEvent {
  timestamp: string;
  date: string;
  cupsAfter: number;
}

const DAILY_GOAL = 5;
const INTAKE_KEY = 'emotimate_water_intake';
const RESET_KEY = 'emotimate_water_reset_date';
const HISTORY_KEY = 'emotimate_water_daily_history';
const EVENTS_KEY = 'emotimate_water_events';
const LAST_DRINK_KEY = 'emotimate_water_last_drink_at';

const todayKey = () => new Date().toISOString().split('T')[0];

const parseHistory = (): WaterHistoryMap => {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return {};
    const obj = JSON.parse(raw) as WaterHistoryMap;
    return obj && typeof obj === 'object' ? obj : {};
  } catch {
    return {};
  }
};

const parseEvents = (): WaterEvent[] => {
  try {
    const raw = localStorage.getItem(EVENTS_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as WaterEvent[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
};

export const WaterBuddy: React.FC<WaterBuddyProps> = ({ language, onClose, onDrink, onAction }) => {
  const isHebrew = language === Language.HEBREW;
  const isRussian = language === Language.RUSSIAN;

  const [cupsDrank, setCupsDrank] = useState<number>(() => {
    const saved = localStorage.getItem(INTAKE_KEY);
    const today = todayKey();
    const lastReset = localStorage.getItem(RESET_KEY);
    if (lastReset !== today) return 0;
    const parsed = saved ? parseInt(saved, 10) : 0;
    return Number.isFinite(parsed) ? parsed : 0;
  });

  const [dailyHistory, setDailyHistory] = useState<WaterHistoryMap>(() => parseHistory());
  const [waterEvents, setWaterEvents] = useState<WaterEvent[]>(() => parseEvents());
  const [lastDrinkAt, setLastDrinkAt] = useState<string | null>(() => localStorage.getItem(LAST_DRINK_KEY));

  const [isDrinking, setIsDrinking] = useState(false);
  const [bubbleBurstId, setBubbleBurstId] = useState(0);
  const [cheerText, setCheerText] = useState<string | null>(null);

  const drinkAnimationTimerRef = useRef<number | null>(null);
  const cheerTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const today = todayKey();
    localStorage.setItem(INTAKE_KEY, String(cupsDrank));
    localStorage.setItem(RESET_KEY, today);

    setDailyHistory((prev) => {
      const next = { ...prev, [today]: cupsDrank };
      localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      return next;
    });
  }, [cupsDrank]);

  useEffect(() => {
    localStorage.setItem(EVENTS_KEY, JSON.stringify(waterEvents.slice(0, 500)));
  }, [waterEvents]);

  useEffect(() => {
    if (lastDrinkAt) localStorage.setItem(LAST_DRINK_KEY, lastDrinkAt);
  }, [lastDrinkAt]);

  useEffect(() => {
    return () => {
      if (drinkAnimationTimerRef.current) window.clearTimeout(drinkAnimationTimerRef.current);
      if (cheerTimerRef.current) window.clearTimeout(cheerTimerRef.current);
    };
  }, []);

  const t = useMemo(() => {
    if (isHebrew) {
      return {
        title: 'המים של הארנב',
        subtitle: 'לוחצים כמה שרוצים - כל כוס נספרת',
        drinkBtn: 'שתיתי כוס מים!',
        addMore: 'כוס נוספת +1',
        undo: 'בטל כוס אחת',
        goalReached: 'כל הכבוד! הגעת ליעד היומי 🎉',
        importanceTitle: 'למה מים חשובים לגוף?',
        importanceText: 'מים עוזרים לריכוז, זיכרון, ויסות חום הגוף, עיכול תקין ואנרגיה יציבה לאורך היום.',
        todayData: 'נתוני היום',
        weeklyData: 'מעקב 7 ימים',
        cupsToday: 'כוסות היום',
        remaining: 'נותר ליעד',
        lastDrink: 'שתייה אחרונה',
        streak: 'רצף ימים ביעד',
        none: 'עדיין לא',
        cupWord: 'כוסות',
        sipCheer: ['הידד! כל הכבוד! 💧', 'אלוף! עוד צעד לבריאות ✨', 'מעולה! הגוף מודה לך 🙌']
      };
    }
    if (isRussian) {
      return {
        title: 'Вода кролика',
        subtitle: 'Нажимайте сколько нужно — каждый стакан считается',
        drinkBtn: 'Я выпил стакан воды!',
        addMore: '+1 стакан',
        undo: 'Отменить 1 стакан',
        goalReached: 'Отлично! Дневная цель достигнута 🎉',
        importanceTitle: 'Почему вода важна?',
        importanceText: 'Вода помогает концентрации, памяти, терморегуляции, пищеварению и стабильной энергии.',
        todayData: 'Данные за сегодня',
        weeklyData: 'История за 7 дней',
        cupsToday: 'Стаканов сегодня',
        remaining: 'Осталось до цели',
        lastDrink: 'Последнее питье',
        streak: 'Серия дней с целью',
        none: 'Еще нет',
        cupWord: 'стаканов',
        sipCheer: ['Ура! Отлично! 💧', 'Супер! Еще шаг к здоровью ✨', 'Отлично! Тело благодарит 🙌']
      };
    }
    return {
      title: 'Water Buddy',
      subtitle: 'Tap as needed — every cup is tracked',
      drinkBtn: 'I drank a cup of water!',
      addMore: 'Add +1 cup',
      undo: 'Undo 1 cup',
      goalReached: 'Great job! Daily goal reached 🎉',
      importanceTitle: 'Why is water important?',
      importanceText: 'Water supports focus, memory, body temperature regulation, digestion, and stable daily energy.',
      todayData: 'Today\'s data',
      weeklyData: '7-day tracking',
      cupsToday: 'Cups today',
      remaining: 'Remaining to goal',
      lastDrink: 'Last drink',
      streak: 'Goal streak',
      none: 'Not yet',
      cupWord: 'cups',
      sipCheer: ['Yay! Great job! 💧', 'Awesome! One more healthy step ✨', 'Nice! Your body thanks you 🙌']
    };
  }, [isHebrew, isRussian]);

  const progressHeight = Math.min(100, (cupsDrank / DAILY_GOAL) * 100);
  const remainingToGoal = Math.max(0, DAILY_GOAL - cupsDrank);

  const last7Days = useMemo(() => {
    const res: Array<{ date: string; cups: number }> = [];
    for (let i = 6; i >= 0; i -= 1) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      res.push({ date: key, cups: dailyHistory[key] || 0 });
    }
    return res;
  }, [dailyHistory]);

  const currentStreak = useMemo(() => {
    let streak = 0;
    for (let i = 0; i < 30; i += 1) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      if ((dailyHistory[key] || 0) >= DAILY_GOAL) streak += 1;
      else break;
    }
    return streak;
  }, [dailyHistory]);

  const startDrinkAnimation = () => {
    setIsDrinking(true);
    setBubbleBurstId((prev) => prev + 1);
    if (drinkAnimationTimerRef.current) window.clearTimeout(drinkAnimationTimerRef.current);
    drinkAnimationTimerRef.current = window.setTimeout(() => setIsDrinking(false), 700);
  };

  const showCheer = () => {
    const options = t.sipCheer;
    const msg = options[Math.floor(Math.random() * options.length)];
    setCheerText(msg);
    if (cheerTimerRef.current) window.clearTimeout(cheerTimerRef.current);
    cheerTimerRef.current = window.setTimeout(() => setCheerText(null), 1400);
  };

  const handleDrink = async () => {
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch {
      // ignore on unsupported devices
    }

    const newCups = cupsDrank + 1;
    const nowIso = new Date().toISOString();

    setCupsDrank(newCups);
    setLastDrinkAt(nowIso);
    setWaterEvents((prev) => [{ timestamp: nowIso, date: todayKey(), cupsAfter: newCups }, ...prev].slice(0, 500));

    onDrink(1);
    onAction(
      isHebrew
        ? `שתיתי כוס מים. סך הכל היום: ${newCups} ${t.cupWord}.`
        : isRussian
        ? `Выпит стакан воды. Сегодня всего: ${newCups} ${t.cupWord}.`
        : `Drank one cup of water. Total today: ${newCups} ${t.cupWord}.`
    );

    startDrinkAnimation();
    showCheer();
  };

  const handleUndoCup = async () => {
    if (cupsDrank <= 0) return;
    const newCups = Math.max(0, cupsDrank - 1);
    setCupsDrank(newCups);
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch {
      // ignore
    }
  };

  const formattedLastDrink = useMemo(() => {
    if (!lastDrinkAt) return t.none;
    try {
      const d = new Date(lastDrinkAt);
      if (isHebrew) return d.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
      if (isRussian) return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
      return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return t.none;
    }
  }, [lastDrinkAt, t.none, isHebrew, isRussian]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[130] flex items-center justify-center bg-black/60 backdrop-blur-lg p-4"
    >
      <div className="bg-gradient-to-b from-blue-50 to-white rounded-[32px] p-6 max-w-xl w-full shadow-2xl border-4 border-white relative overflow-hidden max-h-[92vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-6 text-blue-300 hover:text-blue-500 text-2xl z-10">✕</button>

        <h2 className="text-3xl font-black text-blue-600 mb-1 text-center">{t.title}</h2>
        <p className="text-blue-400 mb-5 font-bold text-center text-sm">{t.subtitle}</p>

        <div className="flex items-center justify-center gap-6 mb-5 w-full">
          <div className="relative w-24 h-48 bg-blue-100/30 rounded-3xl border-4 border-blue-200 overflow-hidden shadow-inner">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${progressHeight}%` }}
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-500 to-cyan-300 transition-all duration-500"
            >
              <motion.div
                animate={{ x: [-20, 0, -20] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-4 left-0 w-[200%] h-8 opacity-40 bg-white rounded-full filter blur-sm"
              />
            </motion.div>

            <div className="absolute inset-0 flex flex-col justify-between py-4 px-2 pointer-events-none">
              {[...Array(DAILY_GOAL)].map((_, i) => (
                <div key={i} className="h-0.5 w-3 bg-blue-300/50 rounded-full" />
              ))}
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-blue-900/50 font-black text-xl">{cupsDrank}/{DAILY_GOAL}</span>
            </div>
          </div>

          <div className="relative w-44 h-44">
            <BunnyLottie mood={isDrinking ? Emotion.HAPPY : Emotion.NEUTRAL} animation={isDrinking ? 'satisfied' : 'idle'} />
            <motion.div
              animate={isDrinking ? { y: [18, 0, 18], rotate: [0, -10, 0] } : { y: 18 }}
              transition={{ duration: 0.6 }}
              className="absolute bottom-3 left-1/2 -translate-x-1/2 text-4xl"
            >
              🥤
            </motion.div>

            <AnimatePresence>
              {bubbleBurstId > 0 && isDrinking && (
                <>
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={`${bubbleBurstId}-${i}`}
                      initial={{ opacity: 0, scale: 0.4, y: 0, x: 0 }}
                      animate={{ opacity: [0, 1, 0], scale: [0.7, 1.3, 1], y: -90 - Math.random() * 60, x: (Math.random() - 0.5) * 80 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 1.2, delay: i * 0.07 }}
                      className="absolute top-1/2 left-1/2 text-2xl"
                    >
                      🫧
                    </motion.div>
                  ))}
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        <AnimatePresence>
          {cheerText && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              className="mb-4 bg-blue-500 text-white font-bold text-sm rounded-2xl shadow px-4 py-2 text-center"
            >
              {cheerText}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-2 gap-2 mb-4">
          <motion.button whileTap={{ scale: 0.95 }} onClick={handleDrink} className="py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-black text-lg shadow">
            💧 {t.addMore}
          </motion.button>
          <motion.button whileTap={{ scale: 0.95 }} onClick={handleUndoCup} disabled={cupsDrank <= 0} className="py-4 rounded-2xl bg-gray-100 text-gray-700 font-black text-lg shadow disabled:opacity-50">
            ↩️ {t.undo}
          </motion.button>
        </div>

        <button onClick={handleDrink} className="w-full py-4 rounded-2xl font-black text-xl shadow-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white mb-4">
          {t.drinkBtn}
        </button>

        <div className="bg-white border border-blue-100 rounded-2xl p-3 mb-3">
          <div className="text-sm font-black text-blue-700 mb-2">{t.todayData}</div>
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-700">
            <div className="bg-blue-50 rounded-xl p-2"><span className="font-bold">{t.cupsToday}:</span> {cupsDrank}</div>
            <div className="bg-blue-50 rounded-xl p-2"><span className="font-bold">{t.remaining}:</span> {remainingToGoal}</div>
            <div className="bg-blue-50 rounded-xl p-2"><span className="font-bold">{t.lastDrink}:</span> {formattedLastDrink}</div>
            <div className="bg-blue-50 rounded-xl p-2"><span className="font-bold">{t.streak}:</span> {currentStreak}</div>
          </div>
        </div>

        <div className="bg-white border border-blue-100 rounded-2xl p-3 mb-3">
          <div className="text-sm font-black text-blue-700 mb-2">{t.weeklyData}</div>
          <div className="grid grid-cols-7 gap-1">
            {last7Days.map((d) => {
              const short = d.date.slice(5);
              const height = Math.min(100, Math.round((d.cups / DAILY_GOAL) * 100));
              return (
                <div key={d.date} className="text-center">
                  <div className="h-14 rounded-md bg-blue-50 border border-blue-100 flex items-end p-1">
                    <div className="w-full rounded-sm bg-blue-500" style={{ height: `${Math.max(10, height)}%` }} />
                  </div>
                  <div className="text-[10px] text-gray-500 mt-1">{short}</div>
                  <div className="text-[10px] font-bold text-blue-700">{d.cups}</div>
                </div>
              );
            })}
          </div>
        </div>

        {(cupsDrank >= DAILY_GOAL || cupsDrank > 0) && (
          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-3">
            {cupsDrank >= DAILY_GOAL && <div className="text-green-600 font-black mb-1">{t.goalReached}</div>}
            <div className="text-sm font-black text-indigo-700 mb-1">{t.importanceTitle}</div>
            <p className="text-xs text-indigo-800 leading-relaxed">{t.importanceText}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default WaterBuddy;
