import React from 'react';
import { PetType } from '../types';

interface PetSelectorProps {
  selectedPet: PetType;
  onSelect: (pet: PetType) => void;
}

const PetSelector: React.FC<PetSelectorProps> = ({ selectedPet, onSelect }) => {
  const pets = [
    {
      type: PetType.BUNNY,
      label: 'ארנב',
      icon: '🐰',
      description: 'חבר נאמן וחמוד'
    },
    {
      type: PetType.MAINE_COON,
      label: 'חתול מיינקון',
      icon: '🐱',
      description: 'חתול גדול וחכם'
    },
    {
      type: PetType.DOG,
      label: 'כלב',
      icon: '🐶',
      description: 'חבר נאמן ושמח'
    }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 border-2 border-purple-200">
      <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">🐾 בחר את החבר שלך</h3>
      
      <div className="grid grid-cols-3 gap-3">
        {pets.map((pet) => (
          <button
            key={pet.type}
            onClick={() => onSelect(pet.type)}
            className={`
              p-4 rounded-xl border-2 transition-all transform
              ${selectedPet === pet.type
                ? 'border-purple-500 bg-purple-100 scale-105 shadow-lg'
                : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
              }
            `}
          >
            <div className="text-5xl mb-2">{pet.icon}</div>
            <div className="font-bold text-sm text-gray-800">{pet.label}</div>
            <div className="text-xs text-gray-600 mt-1">{pet.description}</div>
            {selectedPet === pet.type && (
              <div className="mt-2 text-purple-600 text-xs font-semibold">✓ נבחר</div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PetSelector;
