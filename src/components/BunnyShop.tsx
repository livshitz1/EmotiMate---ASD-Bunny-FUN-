import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Language } from '../types';

export interface ShopItem {
  id: string;
  icon: string;
  label: string;
  labelEn: string;
  price: number;
  category: 'hat' | 'glasses' | 'bowtie';
}

export const SHOP_ITEMS: ShopItem[] = [
  // Hats
  { id: 'top_hat', icon: '🎩', label: 'כובע צילינדר', labelEn: 'Top Hat', price: 5, category: 'hat' },
  { id: 'party_hat', icon: '🥳', label: 'כובע מסיבה', labelEn: 'Party Hat', price: 3, category: 'hat' },
  { id: 'cowboy_hat', icon: '🤠', label: 'כובע בוקרים', labelEn: 'Cowboy Hat', price: 7, category: 'hat' },
  
  // Glasses
  { id: 'sunglasses', icon: '🕶️', label: 'משקפי שמש', labelEn: 'Sunglasses', price: 4, category: 'glasses' },
  { id: 'cool_glasses', icon: '😎', label: 'משקפיים מגניבים', labelEn: 'Cool Glasses', price: 6, category: 'glasses' },
  
  // Bowties
  { id: 'red_bowtie', icon: '🎀', label: 'פפיון אדום', labelEn: 'Red Bowtie', price: 2, category: 'bowtie' },
  { id: 'blue_bowtie', icon: '👔', label: 'פפיון כחול', labelEn: 'Blue Bowtie', price: 2, category: 'bowtie' },
];

interface BunnyShopProps {
  language: Language;
  currency: number; // This will be totalSelfCareCount as requested
  onPurchase: (item: ShopItem) => void;
  onClose: () => void;
}

const BunnyShop: React.FC<BunnyShopProps> = ({ 
  language, 
  currency, 
  onPurchase, 
  onClose 
}) => {
  const isHebrew = language === Language.HEBREW;
  const [ownedItems, setOwnedItems] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('emotimate_owned_items');
    if (saved) {
      try {
        setOwnedItems(JSON.parse(saved));
      } catch (e) {
        setOwnedItems([]);
      }
    }
  }, []);

  const handleBuy = (item: ShopItem) => {
    if (currency >= item.price && !ownedItems.includes(item.id)) {
      const updatedOwned = [...ownedItems, item.id];
      localStorage.setItem('emotimate_owned_items', JSON.stringify(updatedOwned));
      setOwnedItems(updatedOwned);
      onPurchase(item);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[500] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
    >
      <div className="bg-slate-900 w-full max-w-md rounded-[2rem] border-4 border-purple-500/30 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-6 bg-purple-600/20 border-b border-white/10 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🏪</span>
            <h2 className="text-xl font-black text-white">
              {isHebrew ? 'חנות הארנב' : 'Bunny Shop'}
            </h2>
          </div>
          <div className="bg-yellow-400 px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
            <span className="text-sm">⭐</span>
            <span className="text-lg font-black text-purple-900">{currency}</span>
          </div>
        </div>

        {/* Grid Content */}
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 gap-4">
          {SHOP_ITEMS.map((item) => {
            const isOwned = ownedItems.includes(item.id);
            const canAfford = currency >= item.price;

            return (
              <div 
                key={item.id}
                className={`p-4 rounded-3xl border-2 flex flex-col items-center text-center gap-2 transition-all ${
                  isOwned 
                    ? 'bg-green-500/10 border-green-500/30' 
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <span className="text-5xl mb-2">{item.icon}</span>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-white">
                    {isHebrew ? item.label : item.labelEn}
                  </span>
                  <span className="text-xs text-yellow-400 font-bold">
                    {item.price} ⭐
                  </span>
                </div>
                
                {isOwned ? (
                  <div className="mt-2 py-1 px-4 bg-green-500/20 text-green-400 text-[10px] font-black rounded-full uppercase">
                    {isHebrew ? 'בבעלותך' : 'Owned'}
                  </div>
                ) : (
                  <button
                    disabled={!canAfford}
                    onClick={() => handleBuy(item)}
                    className={`mt-2 w-full py-2 rounded-xl font-black text-xs transition-all ${
                      canAfford 
                        ? 'bg-purple-600 text-white shadow-lg active:scale-95' 
                        : 'bg-white/10 text-white/30 cursor-not-allowed'
                    }`}
                  >
                    {isHebrew ? 'קנה' : 'Buy'}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white/5 border-t border-white/10">
          <button 
            onClick={onClose}
            className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-all"
          >
            {isHebrew ? 'סגור' : 'Close'}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default BunnyShop;
