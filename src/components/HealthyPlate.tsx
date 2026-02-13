import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BunnyLottie from './BunnyLottie';
import { Emotion, Language } from '../types';

interface HealthyPlateProps {
  language: Language;
  onClose: () => void;
  onReward: (points: number) => void;
  onAction: (text: string) => void;
  onStartAR?: () => void;
}

type FoodCategory = 'veg' | 'fruit' | 'protein' | 'grains' | 'treat';

interface FoodItem {
  id: string;
  icon: string;
  labelHe: string;
  labelEn: string;
  labelRu: string;
  category: FoodCategory;
  meaningHe: string;
  meaningEn: string;
  meaningRu: string;
}

interface PlateItem {
  id: string;
  icon: string;
  category: FoodCategory;
  x: number;
  y: number;
}

const FOOD_ITEMS: FoodItem[] = [
  { id: 'broccoli', icon: '🥦', labelHe: 'ברוקולי', labelEn: 'Broccoli', labelRu: 'Брокколи', category: 'veg', meaningHe: 'עשיר בסיבים ובוויטמינים, עוזר לעיכול.', meaningEn: 'Rich in fiber and vitamins, supports digestion.', meaningRu: 'Богат клетчаткой и витаминами, помогает пищеварению.' },
  { id: 'carrot', icon: '🥕', labelHe: 'גזר', labelEn: 'Carrot', labelRu: 'Морковь', category: 'veg', meaningHe: 'בטא-קרוטן לבריאות העיניים והעור.', meaningEn: 'Beta-carotene for eye and skin health.', meaningRu: 'Бета-каротин для зрения и кожи.' },
  { id: 'cucumber', icon: '🥒', labelHe: 'מלפפון', labelEn: 'Cucumber', labelRu: 'Огурец', category: 'veg', meaningHe: 'מרענן ומוסיף נוזלים לגוף.', meaningEn: 'Hydrating and refreshing.', meaningRu: 'Освежает и помогает гидратации.' },
  { id: 'apple', icon: '🍎', labelHe: 'תפוח', labelEn: 'Apple', labelRu: 'Яблоко', category: 'fruit', meaningHe: 'פרי עשיר בסיבים ונוגדי חמצון.', meaningEn: 'Fruit with fiber and antioxidants.', meaningRu: 'Фрукт с клетчаткой и антиоксидантами.' },
  { id: 'banana', icon: '🍌', labelHe: 'בננה', labelEn: 'Banana', labelRu: 'Банан', category: 'fruit', meaningHe: 'אשלגן שנותן אנרגיה לשרירים.', meaningEn: 'Potassium supports muscle energy.', meaningRu: 'Калий поддерживает энергию мышц.' },
  { id: 'berries', icon: '🫐', labelHe: 'פירות יער', labelEn: 'Berries', labelRu: 'Ягоды', category: 'fruit', meaningHe: 'נוגדי חמצון ותמיכה בריכוז.', meaningEn: 'Antioxidants and focus support.', meaningRu: 'Антиоксиданты и поддержка концентрации.' },
  { id: 'chicken', icon: '🍗', labelHe: 'עוף', labelEn: 'Chicken', labelRu: 'Курица', category: 'protein', meaningHe: 'חלבון לבניית שריר ושובע לאורך זמן.', meaningEn: 'Protein for muscle and satiety.', meaningRu: 'Белок для мышц и насыщения.' },
  { id: 'fish', icon: '🐟', labelHe: 'דג', labelEn: 'Fish', labelRu: 'Рыба', category: 'protein', meaningHe: 'אומגה 3 לתמיכה במוח ובריכוז.', meaningEn: 'Omega-3 supports brain and focus.', meaningRu: 'Омега-3 поддерживает мозг и внимание.' },
  { id: 'egg', icon: '🥚', labelHe: 'ביצה', labelEn: 'Egg', labelRu: 'Яйцо', category: 'protein', meaningHe: 'חלבון מלא עם רכיבים חשובים לגדילה.', meaningEn: 'Complete protein for growth.', meaningRu: 'Полноценный белок для роста.' },
  { id: 'beef', icon: '🥩', labelHe: 'בשר', labelEn: 'Beef', labelRu: 'Говядина', category: 'protein', meaningHe: 'ברזל וחלבון בכמות מאוזנת.', meaningEn: 'Iron and protein in balanced portions.', meaningRu: 'Железо и белок в умеренной порции.' },
  { id: 'rice', icon: '🍚', labelHe: 'אורז', labelEn: 'Rice', labelRu: 'Рис', category: 'grains', meaningHe: 'פחמימה שנותנת אנרגיה לפעילות.', meaningEn: 'Carbohydrate for sustained energy.', meaningRu: 'Углеводы для энергии.' },
  { id: 'bread', icon: '🍞', labelHe: 'לחם', labelEn: 'Bread', labelRu: 'Хлеб', category: 'grains', meaningHe: 'עדיף דגן מלא לשובע ויציבות.', meaningEn: 'Prefer whole grain for steady energy.', meaningRu: 'Лучше цельнозерновой для стабильной энергии.' },
  { id: 'oats', icon: '🥣', labelHe: 'שיבולת שועל', labelEn: 'Oats', labelRu: 'Овсянка', category: 'grains', meaningHe: 'סיבים ואנרגיה יציבה לאורך זמן.', meaningEn: 'Fiber and steady long-term energy.', meaningRu: 'Клетчатка и стабильная энергия.' },
  { id: 'chocolate', icon: '🍫', labelHe: 'שוקולד', labelEn: 'Chocolate', labelRu: 'Шоколад', category: 'treat', meaningHe: 'ממתק - נהנים במידה קטנה.', meaningEn: 'Treat - enjoy in small portions.', meaningRu: 'Сладость — в небольшой порции.' },
  { id: 'candy', icon: '🍬', labelHe: 'סוכריה', labelEn: 'Candy', labelRu: 'Конфета', category: 'treat', meaningHe: 'לכיף, עדיף לא כל יום.', meaningEn: 'For fun, not every day.', meaningRu: 'Для удовольствия, не каждый день.' }
];

const CATEGORY_CENTER: Record<FoodCategory, { x: number; y: number }> = {
  veg: { x: -45, y: -45 },
  fruit: { x: 45, y: -45 },
  protein: { x: 45, y: 45 },
  grains: { x: -45, y: 45 },
  treat: { x: 0, y: 78 }
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const getRandomAroundCenter = (category: FoodCategory) => {
  const c = CATEGORY_CENTER[category];
  const spread = category === 'treat' ? 14 : 18;
  return {
    x: clamp(c.x + (Math.random() * 2 - 1) * spread, -74, 74),
    y: clamp(c.y + (Math.random() * 2 - 1) * spread, -74, 86)
  };
};

export const HealthyPlate: React.FC<HealthyPlateProps> = ({ language, onClose, onReward, onAction, onStartAR }) => {
  const [isEating, setIsEating] = useState(false);
  const [speechBubble, setSpeechBubble] = useState<string | null>(null);
  const [onPlate, setOnPlate] = useState<PlateItem[]>([]);
  const [selectedFoodId, setSelectedFoodId] = useState<string>(FOOD_ITEMS[0].id);
  const [categoryFilter, setCategoryFilter] = useState<FoodCategory | 'all'>('all');

  const isHebrew = language === Language.HEBREW;
  const isRussian = language === Language.RUSSIAN;

  const t = useMemo(() => {
    if (isHebrew) {
      return {
        title: 'צלחת מאוזנת חכמה',
        subtitle: 'לומדים מה שייך לאיפה ולמה',
        veg: 'ירקות',
        fruit: 'פירות',
        protein: 'חלבון',
        grains: 'דגנים',
        treat: 'ממתקים',
        all: 'הכל',
        nowPlaying: 'הארנב לומד ואוכל',
        treatHint: 'ממתק = בכמות קטנה, לא במקום ארוחה.',
        heroBite: 'גם אני בוחר ארוחה חכמה!'
      };
    }
    if (isRussian) {
      return {
        title: 'Умная сбалансированная тарелка',
        subtitle: 'Учим что куда относится и почему',
        veg: 'Овощи',
        fruit: 'Фрукты',
        protein: 'Белок',
        grains: 'Злаки',
        treat: 'Сладости',
        all: 'Все',
        nowPlaying: 'Кролик учится и ест',
        treatHint: 'Сладкое — понемногу, не вместо еды.',
        heroBite: 'Я тоже выбираю умную тарелку!'
      };
    }
    return {
      title: 'Smart Balanced Plate',
      subtitle: 'Learn what goes where and why',
      veg: 'Vegetables',
      fruit: 'Fruits',
      protein: 'Protein',
      grains: 'Grains',
      treat: 'Treats',
      all: 'All',
      nowPlaying: 'Bunny is learning and eating',
      treatHint: 'Treat = small portion, not a meal replacement.',
      heroBite: 'I choose a smart balanced meal too!'
    };
  }, [isHebrew, isRussian]);

  const selectedFood = FOOD_ITEMS.find((f) => f.id === selectedFoodId) || FOOD_ITEMS[0];

  const filteredItems = FOOD_ITEMS.filter((f) => categoryFilter === 'all' || f.category === categoryFilter);

  const coreCounts = useMemo(() => {
    const counts = { veg: 0, fruit: 0, protein: 0, grains: 0, treat: 0 };
    onPlate.forEach((i) => {
      counts[i.category] += 1;
    });
    return counts;
  }, [onPlate]);

  const plateFeedback = useMemo(() => {
    const coreReady = coreCounts.veg > 0 && coreCounts.fruit > 0 && coreCounts.protein > 0 && coreCounts.grains > 0;
    if (coreCounts.treat > 2) {
      return isHebrew
        ? 'יש הרבה ממתקים בצלחת. ננסה לאזן עם ירקות/חלבון.'
        : isRussian
        ? 'Слишком много сладкого. Добавьте овощи и белок.'
        : 'There are many treats. Add more veggies/protein for balance.';
    }
    if (coreReady) {
      return isHebrew
        ? 'צלחת מעולה! יש איזון בין כל הקבוצות 👏'
        : isRussian
        ? 'Отлично! Есть баланс всех групп 👏'
        : 'Great plate! All core groups are balanced 👏';
    }
    return isHebrew
      ? 'כדי להגיע לאיזון, הוסף לפחות פריט אחד מכל קבוצה עיקרית.'
      : isRussian
      ? 'Для баланса добавьте минимум по одному продукту из каждой основной группы.'
      : 'For balance, add at least one item from each core group.';
  }, [coreCounts, isHebrew, isRussian]);

  const foodLabel = (food: FoodItem) => (isHebrew ? food.labelHe : isRussian ? food.labelRu : food.labelEn);
  const foodMeaning = (food: FoodItem) => (isHebrew ? food.meaningHe : isRussian ? food.meaningRu : food.meaningEn);

  const handleFoodClick = (food: FoodItem) => {
    const pos = getRandomAroundCenter(food.category);
    const item: PlateItem = {
      id: `${food.id}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      icon: food.icon,
      category: food.category,
      x: pos.x,
      y: pos.y
    };

    setSelectedFoodId(food.id);
    setOnPlate((prev) => [...prev, item]);

    setIsEating(true);
    setSpeechBubble(
      isHebrew
        ? `${food.icon} ${food.labelHe} נכנס ל-${food.category === 'treat' ? 'אזור ממתקים קטן' : food.category === 'veg' ? 'ירקות' : food.category === 'fruit' ? 'פירות' : food.category === 'protein' ? 'חלבון' : 'דגנים'}!`
        : isRussian
        ? `${food.icon} ${food.labelRu} добавлен в правильную зону.`
        : `${food.icon} ${food.labelEn} placed in the correct section.`
    );

    onAction(
      isHebrew
        ? `בחרתי ${food.labelHe}. ${food.meaningHe}`
        : isRussian
        ? `Выбрано: ${food.labelRu}. ${food.meaningRu}`
        : `Selected ${food.labelEn}. ${food.meaningEn}`
    );

    if (food.category !== 'treat') {
      onReward(2);
    }

    setTimeout(() => {
      setIsEating(false);
      setSpeechBubble(null);
    }, 1800);
  };

  const handleHeroBite = () => {
    onReward(5);
    onAction(isHebrew ? 'בנינו צלחת מאוזנת ולמדנו למה כל פריט חשוב.' : isRussian ? 'Мы собрали сбалансированную тарелку и узнали ценность каждого продукта.' : 'We built a balanced plate and learned why each item matters.');
    setSpeechBubble(isHebrew ? 'אלוף! למידה תזונתית = כוח יומיומי 💪' : isRussian ? 'Отлично! Питание и знания = сила 💪' : 'Great! Nutrition + knowledge = daily strength 💪');
    setTimeout(() => setSpeechBubble(null), 2200);
  };

  const categoryLabel = (c: FoodCategory) => {
    if (c === 'veg') return t.veg;
    if (c === 'fruit') return t.fruit;
    if (c === 'protein') return t.protein;
    if (c === 'grains') return t.grains;
    return t.treat;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md"
    >
      <button
        onClick={onClose}
        aria-label={isHebrew ? 'סגור' : isRussian ? 'Закрыть' : 'Close'}
        className="absolute top-[calc(env(safe-area-inset-top)+10px)] right-4 w-12 h-12 rounded-full bg-black/65 text-white text-2xl font-bold z-[200] shadow-xl border border-white/30 hover:bg-black/80 active:scale-95"
      >
        ✕
      </button>

      <div className="bg-gradient-to-b from-sky-100 to-white rounded-[40px] p-6 max-w-xl w-full shadow-2xl border-4 border-white relative overflow-hidden text-center max-h-[92vh] overflow-y-auto">
        <h2 className="text-3xl font-black text-indigo-700 mb-1">{t.title}</h2>
        <p className="text-gray-600 mb-4 font-bold text-sm">{t.subtitle}</p>

        <div className="relative w-72 h-72 mx-auto rounded-full bg-white shadow-inner border-8 border-gray-100 overflow-hidden mb-4">
          <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
            <div className="bg-green-100/60 border-r border-b border-gray-100 flex items-center justify-center text-xs font-black text-green-700/50">{t.veg}</div>
            <div className="bg-red-100/60 border-b border-gray-100 flex items-center justify-center text-xs font-black text-red-700/50">{t.fruit}</div>
            <div className="bg-yellow-100/60 border-r border-gray-100 flex items-center justify-center text-xs font-black text-yellow-700/60">{t.grains}</div>
            <div className="bg-orange-100/60 flex items-center justify-center text-xs font-black text-orange-700/60">{t.protein}</div>
          </div>

          <div className="absolute left-1/2 -translate-x-1/2 bottom-2 text-[10px] px-2 py-1 rounded-full bg-pink-100 text-pink-700 font-black border border-pink-200">
            {t.treat}
          </div>

          <AnimatePresence>
            {onPlate.map((food) => (
              <motion.div
                key={food.id}
                initial={{ scale: 0, opacity: 0, y: -10 }}
                animate={{ scale: 1, opacity: 1, x: food.x, y: food.y }}
                exit={{ scale: 0, opacity: 0 }}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl pointer-events-none"
              >
                {food.icon}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="bg-white border border-indigo-100 rounded-2xl p-3 text-right mb-4">
          <div className="text-xs text-indigo-700 font-bold mb-1">{foodLabel(selectedFood)} • {categoryLabel(selectedFood.category)}</div>
          <div className="text-sm text-gray-700 leading-relaxed">{foodMeaning(selectedFood)}</div>
          {selectedFood.category === 'treat' && (
            <div className="text-xs text-pink-700 font-bold mt-2">{t.treatHint}</div>
          )}
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-3">
          {(['all', 'veg', 'fruit', 'protein', 'grains', 'treat'] as const).map((c) => (
            <button
              key={c}
              onClick={() => setCategoryFilter(c)}
              className={`px-3 py-1 rounded-full text-xs font-black border ${categoryFilter === c ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-indigo-700 border-indigo-200'}`}
            >
              {c === 'all' ? t.all : categoryLabel(c as FoodCategory)}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 mb-4">
          {filteredItems.map((food) => (
            <motion.button
              key={food.id}
              whileTap={{ scale: 0.92 }}
              onClick={() => handleFoodClick(food)}
              className="h-14 bg-white rounded-xl shadow border border-gray-100 text-2xl"
              title={foodLabel(food)}
            >
              {food.icon}
            </motion.button>
          ))}
        </div>

        <div className="text-xs text-indigo-800 font-bold bg-indigo-50 border border-indigo-100 rounded-xl p-2 mb-4">
          {plateFeedback}
        </div>

        <div className="relative mx-auto w-40 h-40 mb-4">
          <BunnyLottie mood={isEating ? Emotion.HAPPY : Emotion.NEUTRAL} animation={isEating ? 'eating' : 'idle'} />
          <AnimatePresence>
            {speechBubble && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.9 }}
                animate={{ opacity: 1, y: -8, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white px-3 py-2 rounded-xl shadow border border-indigo-100 text-[11px] font-bold text-indigo-700 whitespace-nowrap"
              >
                {speechBubble}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {onStartAR && (
          <button
            onClick={onStartAR}
            className="w-full py-3 mb-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold rounded-2xl"
          >
            {isHebrew ? '🎥 בוא נאכל בחדר שלי (AR)' : isRussian ? '🎥 Давайте есть в моей комнате (AR)' : '🎥 Eat in my room (AR)'}
          </button>
        )}

        <button
          onClick={handleHeroBite}
          className="w-full py-4 bg-gradient-to-r from-orange-400 to-red-500 text-white font-black rounded-2xl"
        >
          ⭐ {t.heroBite}
        </button>
      </div>
    </motion.div>
  );
};

export default HealthyPlate;
