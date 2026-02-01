import React from 'react';
import { Language } from '../types';
import { translate } from '../i18n/translations';

export type FoodType = 'carrot' | 'water' | 'lettuce' | 'apple';

interface FoodSelectorProps {
  onSelect: (food: FoodType) => void;
  language: Language;
  onClose?: () => void;
}

const FoodSelector: React.FC<FoodSelectorProps> = ({ onSelect, language, onClose }) => {
  const foods: Array<{ type: FoodType; icon: string; label: string; description: string }> = [
    {
      type: 'carrot',
      icon: '🥕',
      label: language === Language.HEBREW ? 'גזר' : language === Language.ENGLISH ? 'Carrot' : 'Морковь',
      description: language === Language.HEBREW ? 'מזין ובריא' : language === Language.ENGLISH ? 'Nutritious and healthy' : 'Питательный и полезный'
    },
    {
      type: 'water',
      icon: '💧',
      label: language === Language.HEBREW ? 'מים' : language === Language.ENGLISH ? 'Water' : 'Вода',
      description: language === Language.HEBREW ? 'חשוב לשתייה' : language === Language.ENGLISH ? 'Important for hydration' : 'Важно для гидратации'
    },
    {
      type: 'lettuce',
      icon: '🥬',
      label: language === Language.HEBREW ? 'חסה' : language === Language.ENGLISH ? 'Lettuce' : 'Салат',
      description: language === Language.HEBREW ? 'טרי ובריא' : language === Language.ENGLISH ? 'Fresh and healthy' : 'Свежий и полезный'
    },
    {
      type: 'apple',
      icon: '🍎',
      label: language === Language.HEBREW ? 'תפוח' : language === Language.ENGLISH ? 'Apple' : 'Яблоко',
      description: language === Language.HEBREW ? 'מתוק וטעים' : language === Language.ENGLISH ? 'Sweet and tasty' : 'Сладкий и вкусный'
    }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 border-2 border-orange-200">
      <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
        🍽️ {language === Language.HEBREW ? 'בחר מה להאכיל' : language === Language.ENGLISH ? 'Choose what to feed' : 'Выбери, чем кормить'}
      </h3>
      
      <div className="grid grid-cols-2 gap-3">
        {foods.map((food) => (
          <button
            key={food.type}
            onClick={() => {
              onSelect(food.type);
              if (onClose) onClose();
            }}
            className="p-4 rounded-xl border-2 border-orange-200 hover:border-orange-400 hover:bg-orange-50 transition-all transform hover:scale-105"
          >
            <div className="text-5xl mb-2">{food.icon}</div>
            <div className="font-bold text-sm text-gray-800">{food.label}</div>
            <div className="text-xs text-gray-600 mt-1">{food.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default FoodSelector;
