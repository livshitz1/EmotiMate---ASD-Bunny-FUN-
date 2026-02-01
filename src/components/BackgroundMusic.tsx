import React, { useState, useEffect, useRef } from 'react';
import { Language } from '../types';

interface BackgroundMusicProps {
  language: Language;
  onClose: () => void;
  show: boolean;
  onSelectTrack?: (trackPath: string) => void;
  onSelectAmbientSound?: (soundPath: string) => void;
  isPlayAll?: boolean;
  onTogglePlayAll?: (value: boolean) => void;
  isRepeat?: boolean;
  onToggleRepeat?: (value: boolean) => void;
  sleepTimer?: number | null;
  onStartSleepTimer?: (minutes: number) => void;
  isQuietMode?: boolean;
  isAROpen?: boolean;
}

interface Track {
  id: string;
  titleHe: string;
  titleEn: string;
  url?: string;
  category: '528Hz' | '741Hz' | 'Synth' | 'Nature';
  descriptionHe: string;
  descriptionEn: string;
  icon: string;
}

const MUSIC_TRACKS: Track[] = [
  // 741Hz - Detox, Mental Clarity, Spiritual Awakening
  {
    id: '741_detox',
    titleHe: '741Hz - ניקוי רעלים',
    titleEn: '741Hz - Detox',
    url: '/music/741Hz/741hz-throat-chakra-balancing-fostering-honest-expressions-157686.mp3',
    category: '741Hz',
    descriptionHe: 'תדר לניקוי רעלים מהתודעה ומהגוף.',
    descriptionEn: 'Frequency for detoxifying mind and body.',
    icon: '🧘'
  },
  {
    id: '741_clarity',
    titleHe: '741Hz - בהירות מחשבתית',
    titleEn: '741Hz - Mental Clarity',
    url: '/music/741Hz/03-deep-water-741hz-308868.mp3',
    category: '741Hz',
    descriptionHe: 'תדר לטיהור המחשבה וריכוז.',
    descriptionEn: 'Frequency for clearing thoughts and focus.',
    icon: '✨'
  },
  {
    id: '741_awakening',
    titleHe: '741Hz - התעוררות רוחנית',
    titleEn: '741Hz - Spiritual Awakening',
    url: '/music/741Hz/01-angel-wings-741hz-308869.mp3',
    category: '741Hz',
    descriptionHe: 'תדר לעידוד ביטוי עצמי והתעוררות.',
    descriptionEn: 'Frequency for encouraging self-expression and awakening.',
    icon: '🌅'
  },
  // 528Hz - Love, DNA repair, Transformation
  {
    id: '528_love',
    titleHe: '528Hz - תדר האהבה',
    titleEn: '528Hz - Love Frequency',
    url: '/music/528Hz/528hz-274962.mp3',
    category: '528Hz',
    descriptionHe: 'תדר האהבה והטרנספורמציה.',
    descriptionEn: 'Love and transformation frequency.',
    icon: '💖'
  },
  {
    id: '528_dna',
    titleHe: '528Hz - תיקון DNA',
    titleEn: '528Hz - DNA Repair',
    url: '/music/528Hz/528hz-frequency-ambient-music-meditationcalmingzenspiritual-music-237574.mp3',
    category: '528Hz',
    descriptionHe: 'תדר המסייע בתיקון ה-DNA ואיזון פנימי.',
    descriptionEn: 'Frequency for DNA repair and inner balance.',
    icon: '🧬'
  },
  {
    id: '528_piano',
    titleHe: '528Hz - פסנתר מרגיע',
    titleEn: '528Hz - Relaxing Piano',
    url: '/music/528Hz/relaxing-piano-on-528-hz-314732.mp3',
    category: '528Hz',
    descriptionHe: 'פסנתר עדין בתדר 528Hz.',
    descriptionEn: 'Gentle piano in 528Hz frequency.',
    icon: '🎹'
  },
  // Synthesized
  {
    id: 'brown_noise',
    titleHe: 'גלים/מים (Brown Noise)',
    titleEn: 'Waves (Brown Noise)',
    category: 'Synth',
    descriptionHe: 'רעש חום המדמה מפל מים או רוח חזקה. מעולה להרגעת רעשי רקע.',
    descriptionEn: 'Brown noise simulating a waterfall or heavy wind. Great for blocking background noise.',
    icon: '🌊'
  },
  {
    id: 'piano_synth',
    titleHe: 'פסנתר איטי (432Hz)',
    titleEn: 'Slow Piano (432Hz)',
    category: 'Synth',
    descriptionHe: 'פסנתר המיוצר מתמטית בתדר 432Hz להרמוניה עם הטבע.',
    descriptionEn: 'Mathematically generated piano at 432Hz for harmony with nature.',
    icon: '🎵'
  }
];

const BackgroundMusic: React.FC<BackgroundMusicProps> = ({ 
  language, 
  onClose, 
  show, 
  onSelectTrack,
  onSelectAmbientSound,
  isPlayAll = false,
  onTogglePlayAll,
  isRepeat = false,
  onToggleRepeat,
  sleepTimer = null,
  onStartSleepTimer,
  isQuietMode = false,
  isAROpen = false
}) => {
  const [currentTrackId, setCurrentTrackId] = useState<string>(() => {
    return localStorage.getItem('emotimate_background_track_id') || 'off';
  });
  const [currentAmbientId, setCurrentAmbientId] = useState<string>(() => {
    return localStorage.getItem('emotimate_ambient_track_id') || 'off';
  });
  const [activeCategory, setActiveCategory] = useState<'528Hz' | '741Hz' | 'Synth'>('741Hz');
  const [volume, setVolume] = useState<number>(() => {
    const saved = localStorage.getItem('emotimate_background_volume');
    return saved ? parseFloat(saved) : 0.3;
  });
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  
  // Automatically pause if AR is open
  useEffect(() => {
    if (isAROpen && isPlaying) {
      setIsPlaying(false);
      stopAllSounds();
    }
  }, [isAROpen]);
  
  // Apply quiet mode volume
  const effectiveVolume = isQuietMode ? 0.2 : volume;

  const audioContextRef = useRef<AudioContext | null>(null);
  const brownNoiseSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const pianoOscillatorRef = useRef<OscillatorNode[]>([]);
  const gainNodeRef = useRef<GainNode | null>(null);
  const lfoRef = useRef<OscillatorNode | null>(null);
  const pianoIntervalRef = useRef<number | null>(null);
  const audioFileRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      stopAllSounds();
    };
  }, []);

  useEffect(() => {
    if (isPlaying && currentTrackId !== 'off') {
      playSound();
    } else {
      if (audioContextRef.current && audioContextRef.current.state === 'running') {
        audioContextRef.current.suspend();
      }
      if (audioFileRef.current) {
        audioFileRef.current.pause();
      }
      stopAllSounds();
    }
  }, [isPlaying, currentTrackId]);

  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = effectiveVolume;
    }
    if (audioFileRef.current) {
      audioFileRef.current.volume = effectiveVolume;
    }
  }, [effectiveVolume]);

  const initAudioContext = () => {
    if (!audioContextRef.current) {
      const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
      audioContextRef.current = new AudioContextClass();
    }
    return audioContextRef.current;
  };

  const stopAllSounds = () => {
    // Stop synthesized sounds
    if (brownNoiseSourceRef.current) {
      try {
        brownNoiseSourceRef.current.stop();
        brownNoiseSourceRef.current.disconnect();
        brownNoiseSourceRef.current = null;
      } catch (e) {}
    }
    
    pianoOscillatorRef.current.forEach(osc => {
      try {
        osc.stop();
        osc.disconnect();
      } catch (e) {}
    });
    pianoOscillatorRef.current = [];
    
    if (lfoRef.current) {
      try {
        lfoRef.current.stop();
        lfoRef.current.disconnect();
        lfoRef.current = null;
      } catch (e) {}
    }
    
    if (pianoIntervalRef.current) {
      clearInterval(pianoIntervalRef.current);
      pianoIntervalRef.current = null;
    }

    // Stop audio file
    if (audioFileRef.current) {
      audioFileRef.current.pause();
      audioFileRef.current.currentTime = 0;
    }
  };

  const createBrownNoiseBuffer = (ctx: AudioContext): AudioBuffer => {
    const bufferSize = ctx.sampleRate * 5;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5;
    }
    return buffer;
  };

  const generatePiano432Hz = (audioContext: AudioContext, masterGain: GainNode): void => {
    if (pianoIntervalRef.current) clearInterval(pianoIntervalRef.current);
    const baseFreq = 432;
    const notes = [baseFreq, baseFreq * 1.2599, baseFreq * 1.4983];
    const playChord = () => {
      const now = audioContext.currentTime;
      const duration = 2.5;
      notes.forEach((freq, index) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        const startTime = now + index * 0.1;
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.2, startTime + 0.3);
        gain.gain.linearRampToValueAtTime(0.2, startTime + duration - 0.3);
        gain.gain.linearRampToValueAtTime(0, startTime + duration);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(startTime);
        osc.stop(startTime + duration);
        pianoOscillatorRef.current.push(osc);
        osc.onended = () => {
          pianoOscillatorRef.current = pianoOscillatorRef.current.filter(o => o !== osc);
        };
      });
    };
    playChord();
    pianoIntervalRef.current = window.setInterval(() => {
      if (isPlaying && currentTrackId === 'piano_synth' && audioContext.state === 'running') {
        playChord();
      }
    }, 3000);
  };

  const playSound = async () => {
    const track = MUSIC_TRACKS.find(t => t.id === currentTrackId);
    if (!track) return;

    try {
      const audioContext = initAudioContext();
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      if (track.url) {
        // Play external MP3 file
        if (!audioFileRef.current) {
          audioFileRef.current = new Audio();
        }
        
        // Use the full URL to avoid issues with relative paths in some environments
        const fullUrl = window.location.origin + track.url;
        if (audioFileRef.current.src !== fullUrl) {
          audioFileRef.current.src = track.url;
          audioFileRef.current.loop = true;
        }
        audioFileRef.current.volume = effectiveVolume;
        
        try {
          await audioFileRef.current.play();
        } catch (playError) {
          console.error("Audio file play failed, attempting resume:", playError);
          // If first attempt fails, resume context and try once more
          await audioContext.resume();
          try {
            await audioFileRef.current.play();
          } catch (secondError) {
            console.error("Second attempt failed:", secondError);
            setIsPlaying(false);
          }
        }
      } else {
        // Play synthesized sound
        if (!gainNodeRef.current) {
          gainNodeRef.current = audioContext.createGain();
          gainNodeRef.current.gain.value = effectiveVolume;
          gainNodeRef.current.connect(audioContext.destination);
        }

        if (currentTrackId === 'brown_noise' && !brownNoiseSourceRef.current) {
          const buffer = createBrownNoiseBuffer(audioContext);
          const source = audioContext.createBufferSource();
          source.buffer = buffer;
          source.loop = true;
          source.connect(gainNodeRef.current);
          source.start();
          brownNoiseSourceRef.current = source;
        } else if (currentTrackId === 'piano_synth' && pianoOscillatorRef.current.length === 0) {
          generatePiano432Hz(audioContext, gainNodeRef.current);
          if (!lfoRef.current) {
            const lfo = audioContext.createOscillator();
            const lfoGain = audioContext.createGain();
            lfo.frequency.value = 0.3;
            lfoGain.gain.value = 0.02;
            lfo.connect(lfoGain);
            lfoGain.connect(gainNodeRef.current.gain);
            lfo.start();
            lfoRef.current = lfo;
          }
        }
      }
    } catch (error) {
      console.error('Error in playSound:', error);
      setIsPlaying(false);
    }
  };

  const handlePlayPause = () => {
    if (currentTrackId === 'off') return;
    if (!isPlaying) {
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  };

  const handleTrackSelect = (trackId: string) => {
    setCurrentTrackId(trackId);
    localStorage.setItem('emotimate_background_track_id', trackId);
    setIsPlaying(false);
    stopAllSounds();
    
    const track = MUSIC_TRACKS.find(t => t.id === trackId);
    if (onSelectTrack) {
      if (track?.url) {
        onSelectTrack(track.url);
      } else if (trackId === 'off') {
        onSelectTrack('');
      }
    }
    
    // סוגר את המודל לאחר בחירה
    onClose();
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    localStorage.setItem('emotimate_background_volume', newVolume.toString());
  };

  const isHebrew = language === Language.HEBREW;
  const currentTrack = MUSIC_TRACKS.find(t => t.id === currentTrackId);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 font-sans text-right" dir={isHebrew ? 'rtl' : 'ltr'}>
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col relative overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white relative">
          <button
            onClick={onClose}
            className={`absolute top-4 ${isHebrew ? 'left-4' : 'right-4'} text-white/80 hover:text-white text-3xl font-bold transition-colors`}
          >
            ×
          </button>
          <h3 className="text-3xl font-bold text-center mb-1 drop-shadow-md">
            {isHebrew ? 'מוזיקת רקע וריפוי' : 'Healing & Calm Music'}
          </h3>
          <p className="text-purple-100 text-center text-sm opacity-90">
            {isHebrew ? 'צלילים לוויסות חושי, ריכוז ורוגע' : 'Sounds for sensory regulation, focus and calm'}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Controls: Play All and Repeat */}
          <div className="flex gap-4 p-4 bg-gray-50 rounded-2xl shadow-sm border border-gray-100">
            <button
              onClick={() => onTogglePlayAll?.(!isPlayAll)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold transition-all ${
                isPlayAll
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-white text-gray-500 hover:text-purple-400 border border-gray-100'
              }`}
            >
              <span className="text-xl">🔁</span>
              {isHebrew ? 'נגן הכל' : 'Play All'}
            </button>
            <button
              onClick={() => onToggleRepeat?.(!isRepeat)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold transition-all ${
                isRepeat
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white text-gray-500 hover:text-indigo-400 border border-gray-100'
              }`}
            >
              <span className="text-xl">🔂</span>
              {isHebrew ? 'חזרה' : 'Repeat'}
            </button>
          </div>

          {/* Sleep Timer Section */}
          <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100 space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-purple-900 flex items-center gap-2">
                <span>🌙</span> {isHebrew ? 'טיימר שינה' : 'Sleep Timer'}
              </h4>
              {sleepTimer !== null && (
                <span className="timer-badge !static !translate-x-0 !translate-y-0 text-xs font-bold">
                  {sleepTimer} {isHebrew ? 'דק׳ נותרו' : 'min left'}
                </span>
              )}
            </div>
            <div className="flex gap-2">
              {[15, 30, 45, 60].map(mins => (
                <button
                  key={mins}
                  onClick={() => onStartSleepTimer?.(mins)}
                  className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${
                    sleepTimer === mins
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-white text-purple-600 border border-purple-200 hover:bg-purple-100'
                  }`}
                >
                  {mins}{isHebrew ? ' דק׳' : 'm'}
                </button>
              ))}
            </div>
          </div>

          {/* Category Selector */}
          <div className="flex flex-wrap justify-center gap-2 p-1 bg-gray-100 rounded-2xl">
            {(['528Hz', '741Hz', 'Synth'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex-1 min-w-[80px] py-3 px-4 rounded-xl font-bold transition-all ${
                  activeCategory === cat
                    ? 'bg-white text-purple-600 shadow-md scale-100'
                    : 'text-gray-500 hover:text-purple-400'
                }`}
              >
                {cat === 'Synth' ? (isHebrew ? 'סינטטי' : 'Synth') : cat}
              </button>
            ))}
          </div>

          {/* Tracks Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {MUSIC_TRACKS.filter(t => t.category === activeCategory).map((track) => {
              const isActive = currentTrackId === track.id;
              return (
                <button
                  key={track.id}
                  onClick={() => handleTrackSelect(track.id)}
                  className={`flex items-start p-4 rounded-2xl border-2 transition-all ${
                    isActive
                      ? 'border-purple-500 bg-purple-50 shadow-inner'
                      : 'border-gray-100 hover:border-purple-200 bg-gray-50/50'
                  }`}
                >
                  <div className={`text-3xl ${isHebrew ? 'ml-4' : 'mr-4'} bg-white p-3 rounded-xl shadow-sm`}>{track.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-800 truncate">
                      {isHebrew ? track.titleHe : track.titleEn}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 leading-relaxed">
                      {isHebrew ? track.descriptionHe : track.descriptionEn}
                    </div>
                  </div>
                </button>
              );
            })}
            
            {/* Off Button */}
            <button
              onClick={() => handleTrackSelect('off')}
              className={`flex items-center p-4 rounded-2xl border-2 transition-all sm:col-span-2 ${
                currentTrackId === 'off'
                  ? 'border-red-500 bg-red-50 shadow-inner'
                  : 'border-gray-100 hover:border-red-200 bg-gray-50/50'
              }`}
            >
              <div className={`text-3xl ${isHebrew ? 'ml-4' : 'mr-4'} bg-white p-3 rounded-xl shadow-sm`}>🔇</div>
              <div className="font-bold text-gray-800">
                {isHebrew ? 'שקט מוחלט' : 'Complete Silence'}
              </div>
            </button>
          </div>

          {/* Controls Section */}
          {currentTrackId !== 'off' && (
            <div className="bg-purple-50 p-6 rounded-3xl space-y-6 shadow-sm border border-purple-100">
              <div className={`flex items-center justify-between ${isHebrew ? 'flex-row' : 'flex-row-reverse'}`}>
                <div className={`flex items-center gap-3 ${isHebrew ? 'flex-row' : 'flex-row-reverse'}`}>
                  <span className="text-3xl">{currentTrack?.icon}</span>
                  <div>
                    <div className="font-bold text-purple-900">
                      {isHebrew ? currentTrack?.titleHe : currentTrack?.titleEn}
                    </div>
                    <div className="text-xs text-purple-600">
                      {isHebrew ? 'מנגן כעת' : 'Now Playing'}
                    </div>
                  </div>
                </div>
                <button
                  onClick={handlePlayPause}
                  className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl shadow-lg transition-all transform hover:scale-110 active:scale-95 ${
                    isPlaying ? 'bg-red-500 shadow-red-200' : 'bg-green-500 shadow-green-200'
                  }`}
                >
                  {isPlaying ? '⏸️' : '▶️'}
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm font-bold text-purple-900">
                  <span>{isHebrew ? 'עוצמת קול' : 'Volume'}</span>
                  <span>{Math.round(volume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-full h-3 bg-purple-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
              </div>
            </div>
          )}

          {/* Educational Footer */}
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-[11px] text-gray-500">
            <h4 className="font-bold text-gray-700 mb-2 flex items-center gap-2">
              <span>💡</span> {isHebrew ? 'הידעת?' : 'Did you know?'}
            </h4>
            <p className="leading-relaxed">
              {activeCategory === '528Hz' && (isHebrew 
                ? 'תדר 528Hz נחשב ל"תדר האהבה". הוא עוזר להפחתת מתח, איזון רגשי ושיפור הריכוז אצל ילדים עם רגישות חושית.'
                : '528Hz is known as the "Love Frequency". It helps reduce stress, balance emotions and improve focus for children with sensory sensitivity.')}
              {activeCategory === '741Hz' && (isHebrew
                ? 'תדר 741Hz ידוע ביכולתו לנקות את המחשבה ולעודד ביטוי עצמי. הוא מעולה לזמני למידה או יצירה.'
                : '741Hz is known for its ability to clear the mind and encourage self-expression. It is great for learning or creative times.')}
              {activeCategory === 'Synth' && (isHebrew
                ? 'צלילים אלו מיוצרים מתמטית כדי לספק מעטפת שמע קבועה ומרגיעה שחוסמת רעשי רקע מטרידים.'
                : 'These sounds are mathematically generated to provide a steady, calming audio cocoon that blocks distracting background noise.')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackgroundMusic;
