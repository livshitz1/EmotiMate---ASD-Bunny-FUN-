import React, { useMemo, useState } from 'react';
import { Language } from '../types';

export type FoodType =
  | 'carrot'
  | 'water'
  | 'lettuce'
  | 'apple'
  | 'cucumber'
  | 'berries'
  | 'hay'
  | 'pellets'
  | 'broccoli';

interface FoodSelectorProps {
  onSelect: (food: FoodType) => void;
  language: Language;
  onClose?: () => void;
}

interface FoodOption {
  type: FoodType;
  icon: string;
  labelHe: string;
  labelEn: string;
  labelRu: string;
  descriptionHe: string;
  descriptionEn: string;
  descriptionRu: string;
}

const FOOD_OPTIONS: FoodOption[] = [
  { type: 'carrot', icon: '🥕', labelHe: 'גזר', labelEn: 'Carrot', labelRu: 'Морковь', descriptionHe: 'מזין ובריא', descriptionEn: 'Nutritious and healthy', descriptionRu: 'Питательно и полезно' },
  { type: 'water', icon: '💧', labelHe: 'מים', labelEn: 'Water', labelRu: 'Вода', descriptionHe: 'חשוב לשתייה', descriptionEn: 'Important for hydration', descriptionRu: 'Важно для гидратации' },
  { type: 'lettuce', icon: '🥬', labelHe: 'חסה', labelEn: 'Lettuce', labelRu: 'Салат', descriptionHe: 'טרי ובריא', descriptionEn: 'Fresh and healthy', descriptionRu: 'Свежо и полезно' },
  { type: 'apple', icon: '🍎', labelHe: 'תפוח', labelEn: 'Apple', labelRu: 'Яблоко', descriptionHe: 'מתוק וטעים', descriptionEn: 'Sweet and tasty', descriptionRu: 'Сладко и вкусно' },
  { type: 'cucumber', icon: '🥒', labelHe: 'מלפפון', labelEn: 'Cucumber', labelRu: 'Огурец', descriptionHe: 'קליל ומרענן', descriptionEn: 'Light and refreshing', descriptionRu: 'Легко и свежо' },
  { type: 'berries', icon: '🫐', labelHe: 'פירות יער', labelEn: 'Berries', labelRu: 'Ягоды', descriptionHe: 'טוב לריכוז', descriptionEn: 'Great for focus', descriptionRu: 'Хорошо для концентрации' },
  { type: 'hay', icon: '🌾', labelHe: 'חציר', labelEn: 'Hay', labelRu: 'Сено', descriptionHe: 'מזון בסיס לארנב', descriptionEn: 'Core bunny food', descriptionRu: 'Базовая еда кролика' },
  { type: 'pellets', icon: '🟤', labelHe: 'כופתיות', labelEn: 'Pellets', labelRu: 'Гранулы', descriptionHe: 'תוסף תזונה מאוזן', descriptionEn: 'Balanced supplement', descriptionRu: 'Сбалансированная добавка' },
  { type: 'broccoli', icon: '🥦', labelHe: 'ברוקולי', labelEn: 'Broccoli', labelRu: 'Брокколи', descriptionHe: 'עשיר בויטמינים', descriptionEn: 'Rich in vitamins', descriptionRu: 'Богато витаминами' }
];

const FoodSelector: React.FC<FoodSelectorProps> = ({ onSelect, language, onClose }) => {
  const [selectedFood, setSelectedFood] = useState<FoodType | null>(null);

  const t = useMemo(() => {
    if (language === Language.HEBREW) {
      return {
        title: 'בחר מה להאכיל',
        subtitle: 'האכלה טובה שומרת על ארנב שמח',
        choose: 'בחרתי את זה',
        cancel: 'ביטול'
      };
    }
    if (language === Language.RUSSIAN) {
      return {
        title: 'Выбери, чем кормить',
        subtitle: 'Хорошее кормление делает кролика счастливым',
        choose: 'Выбрать',
        cancel: 'Отмена'
      };
    }
    return {
      title: 'Choose what to feed',
      subtitle: 'Good feeding keeps bunny happy',
      choose: 'Select this',
      cancel: 'Cancel'
    };
  }, [language]);

  const displayLabel = (f: FoodOption) => language === Language.HEBREW ? f.labelHe : language === Language.RUSSIAN ? f.labelRu : f.labelEn;
  const displayDesc = (f: FoodOption) => language === Language.HEBREW ? f.descriptionHe : language === Language.RUSSIAN ? f.descriptionRu : f.descriptionEn;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 border-2 border-orange-200">
      <h3 className="text-xl font-bold text-gray-800 mb-1 text-center">🍽️ {t.title}</h3>
      <p className="text-xs text-gray-500 mb-4 text-center">{t.subtitle}</p>

      <div className="grid grid-cols-3 gap-2 max-h-[52vh] overflow-y-auto pr-1">
        {FOOD_OPTIONS.map((food) => {
          const isSelected = selectedFood === food.type;
          return (
            <button
              key={food.type}
              onClick={() => setSelectedFood(food.type)}
              className={
                'p-3 rounded-xl border-2 transition-all text-center ' +
                (isSelected
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-orange-200 hover:border-orange-400 hover:bg-orange-50')
              }
            >
              <div className="text-3xl mb-1">{food.icon}</div>
              <div className="font-bold text-xs text-gray-800">{displayLabel(food)}</div>
              <div className="text-[10px] text-gray-600 mt-1 leading-tight">{displayDesc(food)}</div>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-2 mt-4">
        <button
          onClick={() => selectedFood && onSelect(selectedFood)}
          disabled={!selectedFood}
          className="p-3 rounded-xl bg-orange-500 text-white font-bold disabled:opacity-50"
        >
          {t.choose}
        </button>
        <button
          onClick={onClose}
          className="p-3 rounded-xl bg-gray-200 text-gray-700 font-bold"
        >
          {t.cancel}
        </button>
      </div>
    </div>
  );
};

export default FoodSelector;
