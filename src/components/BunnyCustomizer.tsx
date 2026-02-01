import React from 'react';
import { BunnyCustomization, PetType } from '../types';
import PetSelector from './PetSelector';

interface BunnyCustomizerProps {
  customization: BunnyCustomization;
  onCustomize: (customization: BunnyCustomization) => void;
}

const BunnyCustomizer: React.FC<BunnyCustomizerProps> = ({ customization, onCustomize }) => {
  const hats = [
    { id: 'none', label: 'ללא', icon: '🚫' },
    { id: 'top_hat', label: 'כובע צילינדר', icon: '🎩' },
    { id: 'cap', label: 'כובע בייסבול', icon: '🧢' },
    { id: 'crown', label: 'כתר', icon: '👑' },
    { id: 'beanie', label: 'כובע צמר', icon: '🎄' },
    { id: 'cowboy', label: 'כובע קאובוי', icon: '🤠' },
    { id: 'party', label: 'כובע מסיבה', icon: '🎉' },
    { id: 'wizard', label: 'כובע קוסם', icon: '🧙' },
  ];

  const bows = [
    { id: 'none', label: 'ללא', icon: '🚫' },
    { id: 'red_bow', label: 'פפיון אדום', icon: '🎀' },
    { id: 'blue_bow', label: 'פפיון כחול', icon: '💙' },
    { id: 'pink_bow', label: 'פפיון ורוד', icon: '💗' },
    { id: 'rainbow_bow', label: 'פפיון קשת', icon: '🌈' },
    { id: 'gold_bow', label: 'פפיון זהב', icon: '✨' },
    { id: 'flower', label: 'פרח', icon: '🌸' },
  ];

  const clothing = [
    { id: 'none', label: 'ללא', icon: '🚫' },
    { id: 'shirt', label: 'חולצה', icon: '👕' },
    { id: 'jacket', label: 'מעיל', icon: '🧥' },
    { id: 'dress', label: 'שמלה', icon: '👗' },
    { id: 'sweater', label: 'סוודר', icon: '🧶' },
    { id: 'hoodie', label: 'הודי', icon: '🧥' },
    { id: 'vest', label: 'אפוד', icon: '👔' },
    { id: 'tie', label: 'עניבה', icon: '👔' },
  ];

  const backgrounds = [
    { id: 'none', label: 'ללא', icon: '🚫' },
    { id: 'garden', label: 'גן', icon: '🌳' },
    { id: 'room', label: 'חדר', icon: '🏠' },
    { id: 'park', label: 'פארק', icon: '🌲' },
    { id: 'beach', label: 'חוף', icon: '🏖️' },
    { id: 'space', label: 'חלל', icon: '🌌' },
    { id: 'forest', label: 'יער', icon: '🌲' },
    { id: 'city', label: 'עיר', icon: '🏙️' },
    { id: 'mountain', label: 'הר', icon: '⛰️' },
    { id: 'underwater', label: 'תחת המים', icon: '🌊' },
  ];

  const colors = [
    { id: 'default', label: 'ברירת מחדל', icon: '🐰' },
    { id: 'brown', label: 'חום', icon: '🤎' },
    { id: 'white', label: 'לבן', icon: '🤍' },
    { id: 'gray', label: 'אפור', icon: '🩶' },
    { id: 'pink', label: 'ורוד', icon: '💗' },
    { id: 'black', label: 'שחור', icon: '🖤' },
    { id: 'orange', label: 'כתום', icon: '🧡' },
    { id: 'yellow', label: 'צהוב', icon: '💛' },
  ];

  const glasses = [
    { id: 'none', label: 'ללא', icon: '🚫' },
    { id: 'sunglasses', label: 'משקפי שמש', icon: '🕶️' },
    { id: 'reading', label: 'משקפי קריאה', icon: '👓' },
    { id: 'cool', label: 'משקפיים מגניבים', icon: '😎' },
  ];

  const scarves = [
    { id: 'none', label: 'ללא', icon: '🚫' },
    { id: 'red_scarf', label: 'צעיף אדום', icon: '🧣' },
    { id: 'blue_scarf', label: 'צעיף כחול', icon: '💙' },
    { id: 'rainbow_scarf', label: 'צעיף קשת', icon: '🌈' },
  ];

  const accessories = [
    { id: 'none', label: 'ללא', icon: '🚫' },
    { id: 'flower', label: 'פרח', icon: '🌸' },
    { id: 'star', label: 'כוכב', icon: '⭐' },
    { id: 'heart_pin', label: 'סיכת לב', icon: '💖' },
    { id: 'guitar', label: 'גיטרה', icon: '🎸' },
  ];

  const updateCustomization = (key: keyof BunnyCustomization, value: string) => {
    onCustomize({ ...customization, [key]: value as any });
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 border-2 border-purple-200">
      <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">🎨 עיצוב החבר שלך</h3>
      
      <div className="space-y-4">
        {/* Pet Type Selector */}
        <div>
          <PetSelector
            selectedPet={customization.petType || PetType.BUNNY}
            onSelect={(petType) => onCustomize({ ...customization, petType })}
          />
        </div>
        
        <div className="border-t border-gray-200 pt-4">
        {/* Hat Selection */}
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-2 block">כובע:</label>
          <div className="grid grid-cols-4 gap-2">
            {hats.map((hat) => (
              <button
                key={hat.id}
                onClick={() => updateCustomization('hat', hat.id)}
                className={`p-2 rounded-lg border-2 transition-all ${
                  customization.hat === hat.id
                    ? 'border-purple-500 bg-purple-100 scale-105'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <div className="text-2xl">{hat.icon}</div>
                <div className="text-xs mt-1">{hat.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Bow Selection */}
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-2 block">פפיון:</label>
          <div className="grid grid-cols-4 gap-2">
            {bows.map((bow) => (
              <button
                key={bow.id}
                onClick={() => updateCustomization('bow', bow.id)}
                className={`p-2 rounded-lg border-2 transition-all ${
                  customization.bow === bow.id
                    ? 'border-purple-500 bg-purple-100 scale-105'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <div className="text-2xl">{bow.icon}</div>
                <div className="text-xs mt-1">{bow.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Clothing Selection */}
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-2 block">ביגוד:</label>
          <div className="grid grid-cols-4 gap-2">
            {clothing.map((item) => (
              <button
                key={item.id}
                onClick={() => updateCustomization('clothing', item.id)}
                className={`p-2 rounded-lg border-2 transition-all ${
                  customization.clothing === item.id
                    ? 'border-purple-500 bg-purple-100 scale-105'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <div className="text-2xl">{item.icon}</div>
                <div className="text-xs mt-1">{item.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Background Selection */}
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-2 block">רקע:</label>
          <div className="grid grid-cols-5 gap-2">
            {backgrounds.map((bg) => (
              <button
                key={bg.id}
                onClick={() => updateCustomization('background', bg.id)}
                className={`p-2 rounded-lg border-2 transition-all ${
                  customization.background === bg.id
                    ? 'border-purple-500 bg-purple-100 scale-105'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <div className="text-2xl">{bg.icon}</div>
                <div className="text-xs mt-1">{bg.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Color Selection */}
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-2 block">צבע:</label>
          <div className="grid grid-cols-4 gap-2">
            {colors.map((color) => (
              <button
                key={color.id}
                onClick={() => updateCustomization('color', color.id)}
                className={`p-2 rounded-lg border-2 transition-all ${
                  customization.color === color.id
                    ? 'border-purple-500 bg-purple-100 scale-105'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <div className="text-2xl">{color.icon}</div>
                <div className="text-xs mt-1">{color.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Glasses Selection */}
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-2 block">משקפיים:</label>
          <div className="grid grid-cols-4 gap-2">
            {glasses.map((glass) => (
              <button
                key={glass.id}
                onClick={() => updateCustomization('glasses', glass.id)}
                className={`p-2 rounded-lg border-2 transition-all ${
                  customization.glasses === glass.id
                    ? 'border-purple-500 bg-purple-100 scale-105'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <div className="text-2xl">{glass.icon}</div>
                <div className="text-xs mt-1">{glass.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Scarf Selection */}
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-2 block">צעיף:</label>
          <div className="grid grid-cols-4 gap-2">
            {scarves.map((scarf) => (
              <button
                key={scarf.id}
                onClick={() => updateCustomization('scarf', scarf.id)}
                className={`p-2 rounded-lg border-2 transition-all ${
                  customization.scarf === scarf.id
                    ? 'border-purple-500 bg-purple-100 scale-105'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <div className="text-2xl">{scarf.icon}</div>
                <div className="text-xs mt-1">{scarf.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Accessories Selection */}
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-2 block">אביזרים:</label>
          <div className="grid grid-cols-4 gap-2">
            {accessories.map((accessory) => (
              <button
                key={accessory.id}
                onClick={() => updateCustomization('accessories', accessory.id)}
                className={`p-2 rounded-lg border-2 transition-all ${
                  customization.accessories === accessory.id
                    ? 'border-purple-500 bg-purple-100 scale-105'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <div className="text-2xl">{accessory.icon}</div>
                <div className="text-xs mt-1">{accessory.label}</div>
              </button>
            ))}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default BunnyCustomizer;
