import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BunnyLottie from './BunnyLottie';
import { Language } from '../types';
import { playChimeSound } from './AudioPlayer';

interface FriendshipStickerProps {
  language: Language;
  onClose: () => void;
  onComplete?: (actionId: string) => void;
}

type SocialActionId = 'share' | 'run' | 'blocks' | 'hello' | 'talk' | 'invite' | 'wait_turn';

interface SocialAction {
  id: SocialActionId;
  emoji: string;
  label: { he: string; en: string; ru: string };
}

interface SocialLogItem {
  id: string;
  actionId: SocialActionId;
  timestamp: string;
  date: string;
}

interface SocialStats {
  totalActions: number;
  last7DaysCount: number;
  topAction: SocialActionId | null;
  streakDays: number;
}

const SOCIAL_LOG_KEY = 'emotimate_social_activity_log';
const SOCIAL_STATS_KEY = 'emotimate_social_stats';

const SOCIAL_ACTIONS: SocialAction[] = [
  { id: 'share', emoji: '🤝', label: { he: 'חלקנו בצעצוע', en: 'Shared a toy', ru: 'Поделился игрушкой' } },
  { id: 'run', emoji: '🏃', label: { he: 'רצנו יחד', en: 'Ran together', ru: 'Бегали вместе' } },
  { id: 'blocks', emoji: '🧱', label: { he: 'בנינו בקוביות', en: 'Built with blocks', ru: 'Строили из кубиков' } },
  { id: 'hello', emoji: '👋', label: { he: 'אמרתי שלום', en: 'Said hello', ru: 'Поздоровался' } },
  { id: 'talk', emoji: '🗣️', label: { he: 'דיברנו', en: 'Talked', ru: 'Поговорили' } },
  { id: 'invite', emoji: '🎲', label: { he: 'הזמנתי חבר לשחק', en: 'Invited a friend to play', ru: 'Пригласил друга играть' } },
  { id: 'wait_turn', emoji: '⏳', label: { he: 'חיכיתי לתור שלי', en: 'Waited for my turn', ru: 'Ждал своей очереди' } }
];

const getDateKey = (d = new Date()) => d.toISOString().split('T')[0];

const parseLog = (): SocialLogItem[] => {
  try {
    const raw = localStorage.getItem(SOCIAL_LOG_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as SocialLogItem[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
};

const computeStats = (log: SocialLogItem[]): SocialStats => {
  const now = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(now.getDate() - 6);

  const counts = new Map<SocialActionId, number>();
  log.forEach((item) => counts.set(item.actionId, (counts.get(item.actionId) || 0) + 1));

  let topAction: SocialActionId | null = null;
  let topCount = -1;
  counts.forEach((value, key) => {
    if (value > topCount) {
      topAction = key;
      topCount = value;
    }
  });

  const last7DaysCount = log.filter((item) => new Date(item.timestamp) >= sevenDaysAgo).length;

  const uniqueDays = new Set(log.map((item) => item.date));
  let streakDays = 0;
  for (let i = 0; i < 30; i += 1) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = getDateKey(d);
    if (uniqueDays.has(key)) streakDays += 1;
    else break;
  }

  return {
    totalActions: log.length,
    last7DaysCount,
    topAction,
    streakDays
  };
};

const getRecommendation = (actionId: SocialActionId | null, language: Language) => {
  const isHebrew = language === Language.HEBREW;
  const isRussian = language === Language.RUSSIAN;

  if (!actionId) {
    if (isHebrew) return 'נסה היום פעולה חברתית קטנה: לומר שלום או להזמין חבר למשחק.';
    if (isRussian) return 'Попробуйте маленький социальный шаг: поздороваться или пригласить друга.';
    return 'Try one small social step today: say hello or invite a friend.';
  }

  const table: Record<SocialActionId, { he: string; en: string; ru: string }> = {
    share: {
      he: 'שיתוף הוא כוח. בפעם הבאה נסו גם לבקש תור בצורה רגועה.',
      en: 'Sharing is great. Next step: politely ask for your turn.',
      ru: 'Делиться — отлично. Следующий шаг: вежливо попросить свою очередь.'
    },
    run: {
      he: 'פעילות משותפת מצוינת. הוסיפו גם רגע דיבור קצר אחרי המשחק.',
      en: 'Great joint activity. Add a short chat after playing.',
      ru: 'Отличная совместная активность. Добавьте короткий разговор после игры.'
    },
    blocks: {
      he: 'בנייה משותפת מעודדת שיתוף פעולה. נסו לחלק תפקידים בבנייה הבאה.',
      en: 'Building together boosts teamwork. Try assigning roles next time.',
      ru: 'Совместное строительство развивает командность. Попробуйте распределить роли.'
    },
    hello: {
      he: 'מעולה שאמרת שלום. בשלב הבא אפשר לשאול שאלה קצרה.',
      en: 'Great that you said hello. Next step: ask one short question.',
      ru: 'Отлично, что вы поздоровались. Следующий шаг — задать короткий вопрос.'
    },
    talk: {
      he: 'שיחה היא צעד חשוב. נסו גם להקשיב בתור ולהגיב במילה טובה.',
      en: 'Talking is important. Next: take turns listening and give a kind response.',
      ru: 'Разговор важен. Далее — слушать по очереди и отвечать доброжелательно.'
    },
    invite: {
      he: 'הזמנה יזומה מעולה. אם החבר עסוק, אפשר להציע זמן חלופי.',
      en: 'Great initiative inviting a friend. If they are busy, suggest another time.',
      ru: 'Отличная инициатива пригласить друга. Если занят — предложите другое время.'
    },
    wait_turn: {
      he: 'המתנה לתור היא מיומנות חברתית חזקה. כל הכבוד!',
      en: 'Waiting your turn is a strong social skill. Great job!',
      ru: 'Ожидание своей очереди — сильный социальный навык. Отлично!'
    }
  };

  return isHebrew ? table[actionId].he : isRussian ? table[actionId].ru : table[actionId].en;
};

export const FriendshipSticker: React.FC<FriendshipStickerProps> = ({ language, onClose, onComplete }) => {
  const isHebrew = language === Language.HEBREW;
  const isRussian = language === Language.RUSSIAN;
  const [selectedAction, setSelectedAction] = useState<SocialActionId | null>(null);
  const [showAnimation, setShowAnimation] = useState(false);
  const [savedToast, setSavedToast] = useState<string | null>(null);
  const [stats, setStats] = useState<SocialStats>(() => computeStats(parseLog()));

  const audioContextRef = useRef<AudioContext | null>(null);
  const animationTimeoutRef = useRef<number | null>(null);
  const toastTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) window.clearTimeout(animationTimeoutRef.current);
      if (toastTimeoutRef.current) window.clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  const actionLabel = (id: SocialActionId) => {
    const found = SOCIAL_ACTIONS.find((a) => a.id === id);
    if (!found) return id;
    if (isHebrew) return found.label.he;
    if (isRussian) return found.label.ru;
    return found.label.en;
  };

  const recommendation = useMemo(() => getRecommendation(stats.topAction, language), [stats.topAction, language]);

  const handleSelectAction = (id: SocialActionId) => {
    if (selectedAction) return;

    try {
      if (!audioContextRef.current) {
        const Ctx = window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new Ctx();
      }
      playChimeSound(audioContextRef.current, 0.35);
    } catch {
      // ignore audio failures
    }

    setSelectedAction(id);
    setShowAnimation(true);

    const nowIso = new Date().toISOString();
    const item: SocialLogItem = {
      id: `social-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      actionId: id,
      timestamp: nowIso,
      date: getDateKey()
    };

    const prev = parseLog();
    const next = [item, ...prev].slice(0, 800);
    localStorage.setItem(SOCIAL_LOG_KEY, JSON.stringify(next));

    const nextStats = computeStats(next);
    setStats(nextStats);
    localStorage.setItem(SOCIAL_STATS_KEY, JSON.stringify(nextStats));

    setSavedToast(
      isHebrew
        ? `נשמר: ${actionLabel(id)} ✅`
        : isRussian
        ? `Сохранено: ${actionLabel(id)} ✅`
        : `Saved: ${actionLabel(id)} ✅`
    );

    if (toastTimeoutRef.current) window.clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = window.setTimeout(() => setSavedToast(null), 1400);

    if (animationTimeoutRef.current) window.clearTimeout(animationTimeoutRef.current);
    animationTimeoutRef.current = window.setTimeout(() => {
      setShowAnimation(false);
      onComplete?.(id);
    }, 900);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[600] overflow-hidden flex flex-col items-center justify-center p-6 bg-gradient-to-b from-sky-300 to-blue-500"
    >
      <button onClick={onClose} className="absolute top-6 right-6 text-white/70 hover:text-white text-3xl z-50 p-2">✕</button>

      <div className="text-center mb-6 relative z-10">
        <h2 className="text-4xl font-black text-white drop-shadow-md mb-2">
          {isHebrew ? 'זמן חברים!' : isRussian ? 'Время друзей!' : 'Friend Time!'}
        </h2>
        <p className="text-white/90 font-bold text-lg">
          {isHebrew ? 'מה עשינו יחד היום?' : isRussian ? 'Что мы сделали вместе сегодня?' : 'What did we do together today?'}
        </p>
      </div>

      <div className="relative w-full max-w-md h-48 flex items-end justify-center gap-2 mb-6">
        <div className="w-40 h-40 relative z-10"><BunnyLottie animation="idle" /></div>
        <div className="w-28 h-28 relative z-10 mb-2 transform scale-x-[-1]"><BunnyLottie animation="idle" /></div>
        <div className="absolute bottom-0 w-64 h-8 bg-green-500/30 blur-xl rounded-full" />
      </div>

      <AnimatePresence>
        {showAnimation && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 pointer-events-none z-[610] flex items-center justify-center"
          >
            <div className="text-8xl">💖</div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {savedToast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-3 bg-white text-blue-700 font-bold px-4 py-2 rounded-2xl shadow-lg z-20"
          >
            {savedToast}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-3 gap-3 w-full max-w-md px-2 relative z-10 mb-4">
        {SOCIAL_ACTIONS.map((action) => (
          <motion.button
            key={action.id}
            whileHover={!selectedAction ? { scale: 1.05 } : {}}
            whileTap={!selectedAction ? { scale: 0.95 } : {}}
            onClick={() => handleSelectAction(action.id)}
            disabled={!!selectedAction}
            className={`flex flex-col items-center p-3 rounded-2xl transition-all shadow-md ${
              selectedAction === action.id
                ? 'bg-white scale-105 ring-2 ring-yellow-300'
                : selectedAction
                ? 'bg-white/30 opacity-60'
                : 'bg-white/95 hover:bg-white'
            }`}
          >
            <span className="text-3xl mb-1">{action.emoji}</span>
            <span className="text-[11px] font-black text-gray-800 text-center leading-tight">
              {isHebrew ? action.label.he : isRussian ? action.label.ru : action.label.en}
            </span>
          </motion.button>
        ))}
      </div>

      <div className="w-full max-w-md bg-white/90 rounded-2xl p-3 text-xs text-blue-900 shadow-lg mb-2">
        <div className="font-black mb-1">{isHebrew ? 'נתונים חברתיים' : isRussian ? 'Социальные данные' : 'Social Data'}</div>
        <div>{isHebrew ? 'סה״כ פעולות' : isRussian ? 'Всего действий' : 'Total actions'}: <span className="font-bold">{stats.totalActions}</span></div>
        <div>{isHebrew ? '7 ימים אחרונים' : isRussian ? 'За 7 дней' : 'Last 7 days'}: <span className="font-bold">{stats.last7DaysCount}</span></div>
        <div>{isHebrew ? 'רצף ימים פעילים' : isRussian ? 'Серия активных дней' : 'Active-day streak'}: <span className="font-bold">{stats.streakDays}</span></div>
        <div>{isHebrew ? 'פעולה מובילה' : isRussian ? 'Топ действие' : 'Top action'}: <span className="font-bold">{stats.topAction ? actionLabel(stats.topAction) : (isHebrew ? 'אין עדיין' : isRussian ? 'Пока нет' : 'No data yet')}</span></div>
      </div>

      <div className="w-full max-w-md bg-indigo-50/95 rounded-2xl p-3 text-xs text-indigo-900 shadow-lg">
        <div className="font-black mb-1">{isHebrew ? 'המלצה חברתית להמשך' : isRussian ? 'Социальная рекомендация' : 'Social recommendation'}</div>
        <div>{recommendation}</div>
      </div>
    </motion.div>
  );
};

export default FriendshipSticker;
