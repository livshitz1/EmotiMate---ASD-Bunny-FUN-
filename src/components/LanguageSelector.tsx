import React from 'react';
import { Language } from '../types';
import { translate } from '../i18n/translations';

interface LanguageSelectorProps {
  currentLanguage: Language;
  onSelect: (language: Language) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ currentLanguage, onSelect }) => {
  const languages = [
    {
      code: Language.HEBREW,
      label: 'עברית',
      flag: '🇮🇱',
      nativeLabel: 'עברית'
    },
    {
      code: Language.ENGLISH,
      label: 'English',
      flag: '🇬🇧',
      nativeLabel: 'English'
    },
    {
      code: Language.RUSSIAN,
      label: 'Русский',
      flag: '🇷🇺',
      nativeLabel: 'Русский'
    }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 border-2 border-purple-200">
      <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
        🌐 {translate('language', currentLanguage)}
      </h3>
      
      <div className="grid grid-cols-3 gap-3">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => onSelect(lang.code)}
            className={`
              p-4 rounded-xl border-2 transition-all transform
              ${currentLanguage === lang.code
                ? 'border-purple-500 bg-purple-100 scale-105 shadow-lg'
                : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
              }
            `}
          >
            <div className="text-4xl mb-2">{lang.flag}</div>
            <div className="font-bold text-sm text-gray-800">{lang.nativeLabel}</div>
            {currentLanguage === lang.code && (
              <div className="mt-2 text-purple-600 text-xs font-semibold">✓</div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSelector;
