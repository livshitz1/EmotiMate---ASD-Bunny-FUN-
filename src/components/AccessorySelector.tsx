import React from 'react';
import { translate } from '../i18n/translations';
import { Language } from '../types';
import { SHOP_ITEMS } from './BunnyShop';

interface AccessorySelectorProps {
  language: Language;
  currentAccessory: string;
  unlockedItems: string[];
  onSelect: (accessory: string) => void;
  onOpenShop: () => void;
  onClose: () => void;
}

export default function AccessorySelector({ 
  language, 
  currentAccessory, 
  unlockedItems,
  onSelect, 
  onOpenShop,
  onClose 
}: AccessorySelectorProps) {
  const isHebrew = language === Language.HEBREW;

  const baseAccessories = [
    { id: 'none', icon: '❌', label: isHebrew ? 'ללא' : 'None' },
  ];

  // Map shop items to accessory format
  const shopAccessories = SHOP_ITEMS.map(item => ({
    id: item.id,
    icon: item.icon,
    label: isHebrew ? item.label : item.labelEn,
    isLocked: !unlockedItems.includes(item.id)
  }));

  const allAccessories = [...baseAccessories, ...shopAccessories];

  return (
    <div className="bg-white/95 backdrop-blur-md p-6 rounded-3xl shadow-2xl border-4 border-purple-200 w-full max-w-sm flex flex-col max-h-[80vh]">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-black text-purple-900">
          {isHebrew ? 'ארון האביזרים' : 'Accessory Closet'}
        </h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-bold">✕</button>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <div className="grid grid-cols-3 gap-3">
          {allAccessories.map((acc) => (
            <button
              key={acc.id}
              disabled={(acc as any).isLocked}
              onClick={() => onSelect(acc.id)}
              className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 relative ${
                currentAccessory === acc.id
                  ? 'border-purple-500 bg-purple-50 shadow-md'
                  : (acc as any).isLocked
                    ? 'border-gray-100 bg-gray-50 opacity-40 grayscale cursor-not-allowed'
                    : 'border-transparent bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <span className="text-3xl">{acc.icon}</span>
              <span className="text-[9px] font-black text-gray-600 uppercase leading-tight h-5 flex items-center">{acc.label}</span>
              
              {(acc as any).isLocked && (
                <div className="absolute top-1 right-1 text-xs">🔒</div>
              )}
            </button>
          ))}
        </div>
      </div>
      
      <div className="mt-6 flex flex-col gap-3">
        <button 
          onClick={onOpenShop}
          className="w-full py-4 bg-yellow-400 hover:bg-yellow-500 text-purple-900 font-black rounded-2xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <span>🏪</span>
          {isHebrew ? 'חנות האביזרים' : 'Bunny Shop'}
        </button>
        <button 
          onClick={onClose}
          className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl active:scale-95 transition-all"
        >
          {isHebrew ? 'סגור' : 'Close'}
        </button>
      </div>
    </div>
  );
}
