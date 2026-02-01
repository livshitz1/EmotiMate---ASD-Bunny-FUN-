import React, { useState, useEffect, useRef } from 'react';
import { Language, PetType } from '../types';

interface BedtimeMusicProps {
  language: Language;
  petType?: PetType;
  onClose: () => void;
  onPetRelaxationChange?: (isRelaxed: boolean) => void;
}

interface MusicTrack {
  id: string;
  name: string;
  nameEn: string;
  nameRu: string;
  duration: number; // in seconds
  frequency: number; // Hz - low frequencies for relaxation
  type: 'ambient' | 'nature' | 'meditation' | 'solfeggio';
  url?: string;
}

const tracks: MusicTrack[] = [
  // --- Synthesized Low Frequencies (Original) ---
  {
    id: '1',
    name: 'גלים מרגיעים',
    nameEn: 'Calming Waves',
    nameRu: 'Успокаивающие волны',
    duration: 180,
    frequency: 60,
    type: 'nature'
  },
  {
    id: '2',
    name: 'יער שקט',
    nameEn: 'Quiet Forest',
    nameRu: 'Тихий лес',
    duration: 240,
    frequency: 40,
    type: 'nature'
  },
  {
    id: '3',
    name: 'גשם עדין',
    nameEn: 'Gentle Rain',
    nameRu: 'Мягкий дождь',
    duration: 200,
    frequency: 50,
    type: 'nature'
  },
  
  // --- 528Hz Solfeggio Frequencies ---
  {
    id: '528-1',
    name: '528Hz - אנרגיה חיובית',
    nameEn: '528Hz - Positive Energy',
    nameRu: '528Гц - Позитивная энергия',
    duration: 600,
    frequency: 528,
    type: 'solfeggio',
    url: 'music/528Hz/432-528-hz-release-negative-energy-and-fresh-start-324585.mp3'
  },
  {
    id: '528-2',
    name: '528Hz - מדיטציה ויוגה',
    nameEn: '528Hz - Meditation & Yoga',
    nameRu: '528Гц - Медитация и йога',
    duration: 480,
    frequency: 528,
    type: 'solfeggio',
    url: 'music/528Hz/528-hz-meditation-ambient-yoga-165627.mp3'
  },
  {
    id: '528-3',
    name: '528Hz - פסנתר מרגיע',
    nameEn: '528Hz - Relaxing Piano',
    nameRu: '528Гц - Расслабляющее пианино',
    duration: 360,
    frequency: 528,
    type: 'solfeggio',
    url: 'music/528Hz/relaxing-piano-on-528-hz-314732.mp3'
  },
  {
    id: '528-4',
    name: '528Hz - גלי תטא',
    nameEn: '528Hz - Theta Waves',
    nameRu: '528Гц - Тета волны',
    duration: 540,
    frequency: 528,
    type: 'solfeggio',
    url: 'music/528Hz/dreamy-tranquilitysoothing-528-hz-theta-sound-waves-316843.mp3'
  },

  // --- 741Hz Solfeggio Frequencies ---
  {
    id: '741-1',
    name: '741Hz - כנפי מלאך',
    nameEn: '741Hz - Angel Wings',
    nameRu: '741Гц - Крылья ангела',
    duration: 420,
    frequency: 741,
    type: 'solfeggio',
    url: 'music/741Hz/01-angel-wings-741hz-308869.mp3'
  },
  {
    id: '741-2',
    name: '741Hz - התחדשות',
    nameEn: '741Hz - Reloading',
    nameRu: '741Гц - Перезагрузка',
    duration: 380,
    frequency: 741,
    type: 'solfeggio',
    url: 'music/741Hz/02-reloading-741hz-308870.mp3'
  },
  {
    id: '741-3',
    name: '741Hz - מים עמוקים',
    nameEn: '741Hz - Deep Water',
    nameRu: '741Гц - Глубокая вода',
    duration: 450,
    frequency: 741,
    type: 'solfeggio',
    url: 'music/741Hz/03-deep-water-741hz-308868.mp3'
  },
  {
    id: '741-4',
    name: '741Hz - איזון צ\'אקרת הגרון',
    nameEn: '741Hz - Throat Chakra Balancing',
    nameRu: '741Гц - Баланс горловой чакры',
    duration: 500,
    frequency: 741,
    type: 'solfeggio',
    url: 'music/741Hz/741hz-throat-chakra-balancing-fostering-honest-expressions-157686.mp3'
  },

  // --- Original Remaining ---
  {
    id: '4',
    name: 'נשימה מרגיעה',
    nameEn: 'Calming Breath',
    nameRu: 'Успокаивающее дыхание',
    duration: 300,
    frequency: 40,
    type: 'meditation'
  },
  {
    id: '5',
    name: 'לילה שקט',
    nameEn: 'Quiet Night',
    nameRu: 'Тихая ночь',
    duration: 360,
    frequency: 45,
    type: 'ambient'
  },
  {
    id: '6',
    name: 'צלילי טבע',
    nameEn: 'Nature Sounds',
    nameRu: 'Звуки природы',
    duration: 240,
    frequency: 55,
    type: 'nature'
  },
  {
    id: '7',
    name: 'מוזיקה מרגיעה',
    nameEn: 'Relaxing Music',
    nameRu: 'Расслабляющая музыка',
    duration: 300,
    frequency: 60,
    type: 'meditation'
  }
];

const BedtimeMusic: React.FC<BedtimeMusicProps> = ({ language, petType, onClose, onPetRelaxationChange }) => {
  const [currentTrack, setCurrentTrack] = useState<MusicTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [relaxationLevel, setRelaxationLevel] = useState<number>(0); // 0-100
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const audioFileRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const relaxationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      stopMusic();
    };
  }, []);

  const generateCalmingSound = (frequency: number, duration: number, trackType: string): void => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }
      
      audioContextRef.current = audioContext;

      const oscillator1 = audioContext.createOscillator();
      oscillator1.type = 'sine';
      oscillator1.frequency.value = frequency;

      const oscillator2 = audioContext.createOscillator();
      oscillator2.type = 'sine';
      oscillator2.frequency.value = frequency * 2;

      const oscillator3 = audioContext.createOscillator();
      oscillator3.type = 'sine';
      oscillator3.frequency.value = frequency * 3;

      const lfo = audioContext.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = 0.1;

      const lfoGain = audioContext.createGain();
      lfoGain.gain.value = 1.5;

      const gainNode1 = audioContext.createGain();
      gainNode1.gain.value = 0.12;
      
      const gainNode2 = audioContext.createGain();
      gainNode2.gain.value = 0.04;
      
      const gainNode3 = audioContext.createGain();
      gainNode3.gain.value = 0.02;

      const filter = audioContext.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 400;
      filter.Q.value = 0.3;

      lfo.connect(lfoGain);
      lfoGain.connect(oscillator1.frequency);
      lfoGain.connect(oscillator2.frequency);
      
      oscillator1.connect(gainNode1);
      oscillator2.connect(gainNode2);
      oscillator3.connect(gainNode3);
      
      gainNode1.connect(filter);
      gainNode2.connect(filter);
      gainNode3.connect(filter);
      
      filter.connect(audioContext.destination);

      oscillatorRef.current = oscillator1;
      gainNodeRef.current = gainNode1;

      oscillator1.start(0);
      oscillator2.start(0);
      oscillator3.start(0);
      lfo.start(0);

      let currentRelaxation = 0;
      const relaxationInterval = setInterval(() => {
        currentRelaxation = Math.min(100, currentRelaxation + 0.3);
        setRelaxationLevel(currentRelaxation);
        if (onPetRelaxationChange) {
          onPetRelaxationChange(currentRelaxation > 30);
        }
      }, 200);

      relaxationIntervalRef.current = relaxationInterval;

      setTimeout(() => {
        try {
          oscillator1.stop();
          oscillator2.stop();
          oscillator3.stop();
          lfo.stop();
        } catch (e) {}
        stopMusic();
      }, duration * 1000);
    } catch (error) {
      console.error("Error generating calming sound:", error);
    }
  };

  const stopMusic = () => {
    if (oscillatorRef.current) {
      try {
        oscillatorRef.current.stop();
      } catch (e) {}
      oscillatorRef.current = null;
    }
    if (audioFileRef.current) {
      audioFileRef.current.pause();
      audioFileRef.current.src = '';
      audioFileRef.current = null;
    }
    if (gainNodeRef.current) {
      gainNodeRef.current = null;
    }
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch (e) {}
      audioContextRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (relaxationIntervalRef.current) {
      clearInterval(relaxationIntervalRef.current);
      relaxationIntervalRef.current = null;
    }
    setIsPlaying(false);
    setCurrentTrack(null);
    setTimeRemaining(0);
    setRelaxationLevel(0);
    if (onPetRelaxationChange) {
      onPetRelaxationChange(false);
    }
  };

  const playTrack = (track: MusicTrack) => {
    stopMusic();
    setCurrentTrack(track);
    setTimeRemaining(track.duration);
    setIsPlaying(true);

    if (track.url) {
      const audio = new Audio(track.url);
      audio.loop = true;
      audio.play().catch(err => console.error("Error playing audio file:", err));
      audioFileRef.current = audio;
      
      // Still simulate relaxation level increase
      let currentRelaxation = 0;
      const relaxationInterval = setInterval(() => {
        currentRelaxation = Math.min(100, currentRelaxation + 0.3);
        setRelaxationLevel(currentRelaxation);
        if (onPetRelaxationChange) {
          onPetRelaxationChange(currentRelaxation > 30);
        }
      }, 200);
      relaxationIntervalRef.current = relaxationInterval;
    } else {
      generateCalmingSound(track.frequency, track.duration, track.type);
    }

    intervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          stopMusic();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTrackName = (track: MusicTrack): string => {
    if (language === Language.HEBREW) return track.name;
    if (language === Language.ENGLISH) return track.nameEn;
    return track.nameRu;
  };

  const getPetEmoji = (): string => {
    switch (petType) {
      case PetType.MAINE_COON: return '🐱';
      case PetType.DOG: return '🐶';
      default: return '🐰';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl shadow-2xl p-8 max-w-2xl w-full border-2 border-indigo-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <span>🌙</span>
            <span>
              {language === Language.HEBREW ? 'מוזיקה לפני השינה' : language === Language.ENGLISH ? 'Bedtime Music' : 'Музыка перед сном'}
            </span>
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">✕</button>
        </div>

        <div className="bg-white rounded-xl p-4 mb-6 border-2 border-indigo-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-3xl">{getPetEmoji()}</span>
              <span className="font-semibold text-gray-700">
                {language === Language.HEBREW ? 'רמת רגיעה' : language === Language.ENGLISH ? 'Relaxation Level' : 'Уровень расслабления'}
              </span>
            </div>
            <span className="text-lg font-bold text-indigo-600">{Math.round(relaxationLevel)}%</span>
          </div>
          <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 transition-all duration-500" style={{ width: `${relaxationLevel}%` }} />
          </div>
        </div>

        {isPlaying && currentTrack && (
          <div className="bg-indigo-100 rounded-xl p-4 mb-6 border-2 border-indigo-300">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-lg text-indigo-800 mb-1">{getTrackName(currentTrack)}</div>
                <div className="text-sm text-indigo-600">{formatTime(timeRemaining)} {language === Language.HEBREW ? 'נותר' : language === Language.ENGLISH ? 'remaining' : 'осталось'}</div>
              </div>
              <div className="text-4xl animate-pulse">🎵</div>
            </div>
            <div className="mt-3 w-full h-2 bg-indigo-200 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${((currentTrack.duration - timeRemaining) / currentTrack.duration) * 100}%` }} />
            </div>
          </div>
        )}

        <div className="space-y-3 mb-6 max-h-64 overflow-y-auto pr-2">
          {tracks.map((track) => (
            <button
              key={track.id}
              onClick={() => playTrack(track)}
              disabled={isPlaying && currentTrack?.id === track.id}
              className={`w-full p-4 rounded-xl border-2 transition-all text-right ${isPlaying && currentTrack?.id === track.id ? 'bg-indigo-200 border-indigo-400 shadow-lg' : 'bg-white border-gray-200 hover:border-indigo-300 hover:bg-indigo-50'} ${isPlaying && currentTrack?.id !== track.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="flex items-center justify-between">
                <div className="text-2xl">{isPlaying && currentTrack?.id === track.id ? '🎵' : (track.type === 'solfeggio' ? '✨' : '🎶')}</div>
                <div className="flex-1 mr-3">
                  <div className="font-bold text-gray-800">{getTrackName(track)}</div>
                  <div className="text-sm text-gray-600">{formatTime(track.duration)} • {track.frequency}Hz</div>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          {isPlaying ? (
            <button onClick={stopMusic} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg">
              {language === Language.HEBREW ? '⏹ עצור' : language === Language.ENGLISH ? '⏹ Stop' : '⏹ Стоп'}
            </button>
          ) : (
            <div className="flex-1 text-center text-gray-500 text-sm">
              {language === Language.HEBREW ? 'בחר רצועה להתחיל' : language === Language.ENGLISH ? 'Select a track to start' : 'Выберите трек для начала'}
            </div>
          )}
        </div>

        <div className="mt-4 bg-indigo-50 rounded-lg p-3 border border-indigo-200">
          <div className="text-xs text-gray-700 space-y-1">
            <div className="font-semibold mb-2">{language === Language.HEBREW ? 'ℹ️ מידע על המוזיקה:' : language === Language.ENGLISH ? 'ℹ️ About the Music:' : 'ℹ️ О музыке:'}</div>
            <div>• {language === Language.HEBREW ? 'תדרי סולפז\'יו (528Hz, 741Hz) - תדרים עתיקים המסייעים לריפוי, איזון והרגעה' : 'Solfeggio frequencies (528Hz, 741Hz) - ancient frequencies for healing and balance'}</div>
            <div>• {language === Language.HEBREW ? '528Hz ידוע בתור "תדר האהבה" המסייע בהפחתת מתח וחרדה' : '528Hz is known as the "Love frequency" helping reduce stress'}</div>
            <div>• {language === Language.HEBREW ? '741Hz מסייע בניקוי רעלים רגשיים ושיפור הביטוי העצמי' : '741Hz helps emotional detox and self-expression'}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BedtimeMusic;
