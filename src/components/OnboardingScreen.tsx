import React, { useState, useEffect, useRef } from 'react';
import { Language, PetType, AudioProfile } from '../types';
import { translate } from '../i18n/translations';

interface OnboardingScreenProps {
  language: Language;
  onComplete: (selectedPet: PetType, audioProfile: AudioProfile, childName: string, childAge: number) => void;
}

interface PetOption {
  type: PetType;
  emoji: string;
  name: { he: string; en: string; ru: string };
  voiceProfile: 'very_low' | 'low' | 'low_mid' | 'mid' | 'mid_high' | 'high' | 'very_high_soft';
  description: { he: string; en: string; ru: string };
  frequencyLabel: { he: string; en: string; ru: string };
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ language, onComplete }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Name, 2: Age, 3: Pet
  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState<number | null>(null);
  const [selectedPet, setSelectedPet] = useState<PetType | null>(null);
  const [isPlaying, setIsPlaying] = useState<{ [key in PetType]?: boolean }>({});
  const [dwellTimes, setDwellTimes] = useState<{ [key in PetType]: number }>({
    [PetType.BUNNY]: 0, [PetType.MAINE_COON]: 0, [PetType.DOG]: 0, [PetType.BEAR]: 0,
    [PetType.BIRD]: 0, [PetType.MOUSE]: 0, [PetType.ELEPHANT]: 0,
  });
  const [interactions, setInteractions] = useState<{ [key in PetType]: number }>({
    [PetType.BUNNY]: 0, [PetType.MAINE_COON]: 0, [PetType.DOG]: 0, [PetType.BEAR]: 0,
    [PetType.BIRD]: 0, [PetType.MOUSE]: 0, [PetType.ELEPHANT]: 0,
  });
  const [avoidedPets, setAvoidedPets] = useState<PetType[]>([]);
  const [lastClickedPet, setLastClickedPet] = useState<PetType | null>(null);
  const [clickTimestamp, setClickTimestamp] = useState<number>(0);
  
  const dwellTimersRef = useRef<{ [key in PetType]?: NodeJS.Timeout }>({});
  const audioRefs = useRef<{ [key in PetType]?: HTMLAudioElement }>({});

  const pets: PetOption[] = [
    { type: PetType.ELEPHANT, emoji: '🐘', name: { he: 'פיל', en: 'Elephant', ru: 'Слон' }, voiceProfile: 'very_low', description: { he: 'עמוק ומרגיע', en: 'Deep and calming', ru: 'Глубокий' }, frequencyLabel: { he: 'תדרים נמוכים מאוד', en: 'Very low', ru: 'Очень низкие' } },
    { type: PetType.DOG, emoji: '🐶', name: { he: 'כלב', en: 'Dog', ru: 'Собака' }, voiceProfile: 'low', description: { he: 'יציב ורגוע', en: 'Steady', ru: 'Спокойный' }, frequencyLabel: { he: 'תדרים נמוכים', en: 'Low', ru: 'Низкие' } },
    { type: PetType.BEAR, emoji: '🐻', name: { he: 'דוב', en: 'Bear', ru: 'Медведь' }, voiceProfile: 'low_mid', description: { he: 'חם ונעים', en: 'Warm', ru: 'Теплый' }, frequencyLabel: { he: 'תדרים נמוכים-בינוניים', en: 'Low-mid', ru: 'Средне-низкие' } },
    { type: PetType.MAINE_COON, emoji: '🐱', name: { he: 'חתול', en: 'Cat', ru: 'Кот' }, voiceProfile: 'mid', description: { he: 'עדין ומתפנק', en: 'Gentle', ru: 'Нежный' }, frequencyLabel: { he: 'תדרים בינוניים', en: 'Mid', ru: 'Средние' } },
    { type: PetType.BIRD, emoji: '🐦', name: { he: 'ציפור', en: 'Bird', ru: 'Птица' }, voiceProfile: 'mid_high', description: { he: 'מלודי ועליז', en: 'Melodic', ru: 'Веселый' }, frequencyLabel: { he: 'תדרים גבוהים', en: 'High', ru: 'Высокие' } },
    { type: PetType.BUNNY, emoji: '🐰', name: { he: 'ארנב', en: 'Rabbit', ru: 'Кролик' }, voiceProfile: 'high', description: { he: 'קופצני ושמח', en: 'Bouncy', ru: 'Прыгучий' }, frequencyLabel: { he: 'תדרים גבוהים מאוד', en: 'Very high', ru: 'Очень высокие' } },
  ];

  const handlePetClick = async (pet: PetOption) => {
    if (!pet || !pet.type) return;
    
    setInteractions(prev => {
      const current = prev || {};
      return { ...current, [pet.type]: (current[pet.type] || 0) + 1 };
    });
    setLastClickedPet(pet.type);
    setClickTimestamp(Date.now());
    
    // Silence: stop all currently playing audio
    if (audioRefs.current) {
      Object.values(audioRefs.current).forEach(audio => { 
        if (audio) { 
          try {
            audio.pause(); 
            audio.currentTime = 0; 
          } catch (e) {}
        } 
      });
    }
    // No more speech generation or playing
    setSelectedPet(pet.type);
  };

  const handleSelect = () => {
    if (!selectedPet) return;
    const pet = pets.find(p => p.type === selectedPet);
    if (!pet) {
      console.error("Selected pet not found in pets list:", selectedPet);
      return;
    }
    onComplete(selectedPet, {
      preferredFrequency: pet.voiceProfile,
      sensitivityLevel: 'none',
      dwellTimes: dwellTimes || {},
      interactions: interactions || {},
      avoidedPets: avoidedPets || [],
      frequencySensitivityMap: {}
    }, childName, childAge || 0);
  };

  const renderStep1 = () => (
    <div className="flex-1 flex flex-col items-center justify-center px-6 animate-fade-in">
      <div className="text-6xl mb-8 animate-bounce">👋</div>
      <h1 className="text-3xl font-bold text-white mb-2 text-center">נעים להכיר!</h1>
      <p className="text-purple-300 opacity-70 mb-10 text-center">איך קוראים לך?</p>
      
      <input
        type="text"
        value={childName}
        onChange={(e) => setChildName(e.target.value)}
        placeholder="השם שלך כאן..."
        className="w-full max-w-md bg-white/10 border-2 border-purple-500/30 rounded-2xl p-5 text-white text-xl text-center outline-none focus:border-purple-500 transition-all"
        autoFocus
      />

      <button
        onClick={() => childName.trim() && setStep(2)}
        disabled={!childName.trim()}
        className={`mt-10 w-full max-w-md bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xl py-5 rounded-2xl shadow-2xl transition-all ${
          !childName.trim() ? 'opacity-50 grayscale cursor-not-allowed' : 'active:scale-95'
        }`}
      >
        המשך 🚀
      </button>
    </div>
  );

  const renderStep2 = () => (
    <div className="flex-1 flex flex-col items-center justify-center px-6 animate-fade-in">
      <div className="text-6xl mb-8 animate-bounce">🎂</div>
      <h1 className="text-3xl font-bold text-white mb-2 text-center">בן כמה אתה?</h1>
      <p className="text-purple-300 opacity-70 mb-10 text-center">זה יעזור לי להכיר אותך טוב יותר</p>
      
      <div className="grid grid-cols-3 gap-4 w-full max-w-md">
        {[3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((age) => (
          <button
            key={age}
            onClick={() => setChildAge(age)}
            className={`p-4 rounded-2xl text-xl font-bold transition-all border-2 ${
              childAge === age 
                ? 'bg-purple-600 border-purple-400 text-white scale-110 shadow-lg' 
                : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
            }`}
          >
            {age}
          </button>
        ))}
      </div>

      <div className="flex gap-4 w-full max-w-md mt-10">
        <button
          onClick={() => setStep(1)}
          className="flex-1 bg-white/10 text-white font-bold py-4 rounded-2xl"
        >
          חזרה
        </button>
        <button
          onClick={() => childAge && setStep(3)}
          disabled={!childAge}
          className={`flex-[2] bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xl py-4 rounded-2xl shadow-2xl transition-all ${
            !childAge ? 'opacity-50 grayscale cursor-not-allowed' : 'active:scale-95'
          }`}
        >
          המשך 🚀
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <>
      <div className="flex-1 overflow-y-auto px-6 pt-10 pb-32 flex flex-col items-center scroll-touch">
        <h1 className="text-3xl font-bold text-white mb-2 text-center">מי יהיה החבר שלך?</h1>
        <p className="text-purple-300 opacity-70 mb-10 text-center">בחר את החבר שלך</p>

        <div className="grid grid-cols-1 gap-4 w-full max-w-md">
          {pets.map((pet) => {
            const isSelected = selectedPet === pet.type;
            const isPlayingNow = isPlaying[pet.type];
            return (
              <div
                key={pet.type}
                onClick={() => { setSelectedPet(pet.type); handlePetClick(pet); }}
                className={`p-5 rounded-3xl transition-all duration-300 flex items-center gap-5 cursor-pointer border-2 ${
                  isSelected ? 'bg-purple-600/30 border-purple-500 scale-[1.02] shadow-[0_0_20px_rgba(168,85,247,0.3)]' : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="text-5xl">{pet.emoji}</div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white">{pet.name.he}</h3>
                  <p className="text-sm text-purple-300 font-medium">{pet.frequencyLabel.he}</p>
                  <p className="text-xs text-gray-400 mt-1">{pet.description.he}</p>
                </div>
                {isPlayingNow && (
                  <div className="w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
                )}
                {isSelected && (
                  <div className="text-green-400 font-bold">✓</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Fixed Bottom Button Area */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#121212] via-[#121212]/90 to-transparent pt-12 z-[60]">
        <div className="max-w-md mx-auto flex gap-4">
          <button
            onClick={() => setStep(2)}
            className="flex-1 bg-white/10 text-white font-bold py-5 rounded-2xl"
          >
            חזרה
          </button>
          {selectedPet && (
            <button
              onClick={handleSelect}
              className="flex-[2] bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xl py-5 rounded-2xl shadow-2xl animate-bounce-subtle active:scale-95 transition-transform"
            >
              זה החבר שלי! 🚀
            </button>
          )}
        </div>
      </div>
    </>
  );

  return (
    <div className="fixed inset-0 bg-[#121212] flex flex-col z-50 overflow-hidden" style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
    </div>
  );
};

export default OnboardingScreen;
