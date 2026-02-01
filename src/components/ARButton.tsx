import React from 'react';
import { Language } from '../types';

interface ARButtonProps {
  language: Language;
  onClick: () => void;
  disabled?: boolean;
}

const ARButton: React.FC<ARButtonProps> = ({ language, onClick, disabled }) => {
  const isHebrew = language === 'he';

  const handleWalk = () => {
    if (isHebrew) {
      alert("🌳 טיול ארנבי: הארנב יוצא איתך לטיול בחוץ!");
    } else {
      alert("🌳 Bunny Walk: The bunny is going for a walk with you outside!");
    }
    onClick();
  };

  return (
    <button
      onClick={handleWalk}
      disabled={disabled}
      className={`
        w-full p-3.5 rounded-xl mt-5 flex items-center justify-center transition-all active:scale-95
        ${disabled ? 'opacity-50 cursor-not-allowed grayscale bg-gray-500' : 'bg-[#38761d] hover:bg-[#2d5e17] shadow-lg'}
      `}
    >
      <span className="text-white font-bold text-lg">
        🚶‍♂️ {isHebrew ? 'הוצא את הארנב לטיול (AR)' : 'Take the Bunny for a Walk (AR)'}
      </span>
    </button>
  );
};

export default ARButton;
