import React, { useEffect, useRef, useCallback, useState } from "react";
import { Haptics, ImpactStyle } from '@capacitor/haptics';

const getEffectiveVolume = (baseVolume: number) => {
  const isQuiet = typeof localStorage !== 'undefined' && localStorage.getItem('emotimate_quiet_mode') === 'true';
  return isQuiet ? 0.2 : baseVolume;
};

/**
 * Creates a sensory-safe bath music environment
 * Combines 741Hz with soft water/underwater sounds
 */
export const playBathMusic = (ctx: AudioContext, volume: number = 0.3) => {
  const now = ctx.currentTime;
  const effectiveVolume = getEffectiveVolume(volume);
  
  // Master gain for safety and consistent volume
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0, now);
  masterGain.gain.linearRampToValueAtTime(effectiveVolume, now + 2); // Slow fade in
  masterGain.connect(ctx.destination);

  // 1. 741Hz Frequency (Solfeggio - Detox/Cleanse)
  const osc = ctx.createOscillator();
  const oscGain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(741, now);
  oscGain.gain.setValueAtTime(0.15, now); // Subtle
  osc.connect(oscGain);
  oscGain.connect(masterGain);
  osc.start(now);

  // 2. Underwater "Brown Noise" (Deeper and softer than white noise)
  const bufferSize = ctx.sampleRate * 5; // 5 seconds of unique noise
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let lastOut = 0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    data[i] = (lastOut + (0.02 * white)) / 1.02;
    lastOut = data[i];
    data[i] *= 3.5; // adjust volume
  }

  const noiseSource = ctx.createBufferSource();
  noiseSource.buffer = buffer;
  noiseSource.loop = true;

  // 3. Low Pass Filter for "Underwater" muffled effect
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(350, now); // Muffled
  filter.Q.setValueAtTime(1, now);

  // 4. LFO for gentle water movement (volume modulation)
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.type = 'sine';
  lfo.frequency.setValueAtTime(0.15, now); // very slow oscillation
  lfoGain.gain.setValueAtTime(0.1, now);
  lfo.connect(lfoGain);
  lfoGain.connect(filter.frequency); // Modulate filter for more "swirly" water sound
  lfo.start(now);

  noiseSource.connect(filter);
  filter.connect(masterGain);
  noiseSource.start(now);

  return {
    stop: () => {
      const stopTime = ctx.currentTime;
      masterGain.gain.linearRampToValueAtTime(0, stopTime + 1); // Fade out
      setTimeout(() => {
        try {
          osc.stop();
          noiseSource.stop();
          lfo.stop();
        } catch (e) {}
      }, 1100);
    }
  };
};

/**
 * Creates an upbeat, rhythmic cleanup song environment
 */
export const playCleanupSong = (ctx: AudioContext, volume: number = 0.4) => {
  const now = ctx.currentTime;
  const effectiveVolume = getEffectiveVolume(volume);
  
  // Master gain
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0, now);
  masterGain.gain.linearRampToValueAtTime(effectiveVolume, now + 1);
  masterGain.connect(ctx.destination);

  // 1. Upbeat Bass Line (Simple rhythmic pulse)
  const createBassPulse = (startTime: number) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(80, startTime);
    osc.frequency.exponentialRampToValueAtTime(40, startTime + 0.1);
    
    gain.gain.setValueAtTime(0.3, startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);
    
    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(startTime);
    osc.stop(startTime + 0.2);
  };

  // 2. High-hat / Shaker (Upbeat rhythm)
  const createShaker = (startTime: number) => {
    const bufferSize = ctx.sampleRate * 0.05;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(5000, startTime);
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.1, startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.05);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);
    noise.start(startTime);
  };

  // 3. Cheerful Melody (Arpeggio)
  const melodyNotes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
  const createMelodyNote = (startTime: number, frequency: number) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, startTime);
    
    gain.gain.setValueAtTime(0.15, startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
    
    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(startTime);
    osc.stop(startTime + 0.4);
  };

  let intervalId: NodeJS.Timeout;
  let tick = 0;
  
  const scheduleRhythm = () => {
    const beatTime = 0.5; // 120 BPM
    const startTime = ctx.currentTime + 0.1;
    
    // Bass on every beat
    createBassPulse(startTime);
    
    // Shaker on every half beat
    createShaker(startTime);
    createShaker(startTime + beatTime / 2);
    
    // Melody on certain ticks
    if (tick % 4 === 0) createMelodyNote(startTime, melodyNotes[0]);
    if (tick % 4 === 1) createMelodyNote(startTime, melodyNotes[1]);
    if (tick % 4 === 2) createMelodyNote(startTime, melodyNotes[2]);
    if (tick % 4 === 3) createMelodyNote(startTime, melodyNotes[3]);
    
    tick++;
  };

  // Start the loop
  intervalId = setInterval(scheduleRhythm, 500);

  return {
    stop: () => {
      const stopTime = ctx.currentTime;
      masterGain.gain.linearRampToValueAtTime(0, stopTime + 1);
    }
  };
};

/**
 * Creates a "Cheering" sound effect
 */
export const playCheeringSound = (ctx: AudioContext, volume: number = 0.5) => {
  const now = ctx.currentTime;
  const effectiveVolume = getEffectiveVolume(volume);
  
  const createCheerPart = (freq: number, startTime: number, duration: number) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, startTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.2, startTime + duration);

    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(15, startTime);
    lfoGain.gain.setValueAtTime(freq * 0.05, startTime);
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(effectiveVolume * 0.2, startTime + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(freq * 1.5, startTime);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    lfo.start(startTime);
    osc.stop(startTime + duration);
    lfo.stop(startTime + duration);
  };

  // Layered "voices" for cheering
  for (let i = 0; i < 8; i++) {
    const baseFreq = 300 + Math.random() * 400;
    const startOffset = Math.random() * 0.2;
    createCheerPart(baseFreq, now + startOffset, 1.5 + Math.random());
  }
};

/**
 * Creates a magical "chime" sound effect
 */
export const playChimeSound = (ctx: AudioContext, volume: number = 0.4) => {
  const now = ctx.currentTime;
  const effectiveVolume = getEffectiveVolume(volume);
  
  const playNote = (freq: number, startTime: number, duration: number, vol: number) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);
    
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(vol, startTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(startTime);
    osc.stop(startTime + duration);
  };

  // High-pitched magical notes
  playNote(1567.98, now, 0.5, effectiveVolume); // G6
  playNote(1975.53, now + 0.1, 0.5, effectiveVolume * 0.8); // B6
  playNote(2349.32, now + 0.2, 0.5, effectiveVolume * 0.6); // D7
};

/**
 * Creates a soft "water drop" sound effect
 */
export const playWaterDropSound = (ctx: AudioContext, volume: number = 0.4) => {
  const now = ctx.currentTime;
  const effectiveVolume = getEffectiveVolume(volume);
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(600, now);
  osc.frequency.exponentialRampToValueAtTime(1200, now + 0.05);
  osc.frequency.exponentialRampToValueAtTime(400, now + 0.15);

  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(effectiveVolume, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.3);
};

/**
 * Creates a triumphant "Ta-da!" fanfare sound
 */
export const playTaDaSound = (ctx: AudioContext, volume: number = 0.5) => {
  const now = ctx.currentTime;
  const effectiveVolume = getEffectiveVolume(volume);
  
  const playNote = (freq: number, startTime: number, duration: number, vol: number) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, startTime);
    
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(vol, startTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(startTime);
    osc.stop(startTime + duration);
  };

  // C4, E4, G4, C5 (Arpeggio)
  playNote(261.63, now, 0.2, effectiveVolume);
  playNote(329.63, now + 0.1, 0.2, effectiveVolume);
  playNote(392.00, now + 0.2, 0.2, effectiveVolume);
  playNote(523.25, now + 0.3, 0.6, effectiveVolume);
};

/**
 * Creates a "Whoosh" sound effect
 */
export const playWhooshSound = (ctx: AudioContext, volume: number = 0.4) => {
  const now = ctx.currentTime;
  const effectiveVolume = getEffectiveVolume(volume);
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(800, now);
  osc.frequency.exponentialRampToValueAtTime(100, now + 0.3);

  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(effectiveVolume, now + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.3);
};

/**
 * Creates a "Ding" bell sound effect
 */
export const playDingSound = (ctx: AudioContext, volume: number = 0.4) => {
  const now = ctx.currentTime;
  const effectiveVolume = getEffectiveVolume(volume);
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(1200, now);
  osc.frequency.exponentialRampToValueAtTime(1000, now + 0.2);

  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(effectiveVolume, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.5);
};

/**
 * Creates a gentle "water splash" sound effect
 */
export const playWaterSplashSound = (ctx: AudioContext, volume: number = 0.4) => {
  const now = ctx.currentTime;
  const effectiveVolume = getEffectiveVolume(volume);
  
  // Create noise source for splashing sound
  const bufferSize = ctx.sampleRate * 0.5;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(1200, now);
  filter.Q.setValueAtTime(1, now);
  
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(effectiveVolume, now + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
  
  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  
  noise.start(now);
  noise.stop(now + 0.5);
};

/**
 * Creates a soft "Mwah" kiss sound effect
 */
export const playKissSound = (ctx: AudioContext, volume: number = 0.4) => {
  const now = ctx.currentTime;
  const effectiveVolume = getEffectiveVolume(volume);
  
  // High frequency "pop" for the kiss smack
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.type = 'sine';
  osc.frequency.setValueAtTime(800, now);
  osc.frequency.exponentialRampToValueAtTime(1600, now + 0.05);
  osc.frequency.exponentialRampToValueAtTime(400, now + 0.1);
  
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(effectiveVolume, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.start(now);
  osc.stop(now + 0.2);
};

/**
 * Creates a calming sleep environment tuned to 432Hz
 * Combines 432Hz base frequency with soothing pink noise
 */
export const playSleepSound = (ctx: AudioContext, volume: number = 0.3) => {
  const now = ctx.currentTime;
  const effectiveVolume = getEffectiveVolume(volume);
  
  // Master gain for safety and consistent volume
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0, now);
  masterGain.gain.linearRampToValueAtTime(effectiveVolume, now + 3); // Very slow fade in
  masterGain.connect(ctx.destination);

  // 1. 432Hz "Miracle" Frequency (Warm sine/triangle mix)
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const oscGain = ctx.createGain();
  
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(432, now);
  
  osc2.type = 'triangle';
  osc2.frequency.setValueAtTime(216, now); // Octave below for warmth
  
  oscGain.gain.setValueAtTime(0.1, now);
  
  osc1.connect(oscGain);
  osc2.connect(oscGain);
  oscGain.connect(masterGain);
  
  osc1.start(now);
  osc2.start(now);

  // 2. Pink Noise (Deep and soothing, better for sleep than white noise)
  const bufferSize = ctx.sampleRate * 5; 
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let b0, b1, b2, b3, b4, b5, b6;
  b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
  
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.96900 * b2 + white * 0.1538520;
    b3 = 0.86650 * b3 + white * 0.3104856;
    b4 = 0.55000 * b4 + white * 0.5329522;
    b5 = -0.7616 * b5 - white * 0.0168980;
    data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
    data[i] *= 0.11; // (roughly) compensate for gain
    b6 = white * 0.115926;
  }

  const noiseSource = ctx.createBufferSource();
  noiseSource.buffer = buffer;
  noiseSource.loop = true;

  // 3. Low Pass Filter for a "muffled" nighttime feel
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(400, now);
  filter.Q.setValueAtTime(1, now);

  // 4. Slow volume LFO to simulate gentle breathing
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.type = 'sine';
  lfo.frequency.setValueAtTime(0.12, now); // Very slow breath (about 8 seconds per cycle)
  lfoGain.gain.setValueAtTime(0.05, now);
  
  lfo.connect(lfoGain);
  lfoGain.connect(masterGain.gain);
  lfo.start(now);

  noiseSource.connect(filter);
  filter.connect(masterGain);
  noiseSource.start(now);

  return {
    stop: () => {
      const stopTime = ctx.currentTime;
      masterGain.gain.cancelScheduledValues(stopTime);
      masterGain.gain.setValueAtTime(masterGain.gain.value, stopTime);
      masterGain.gain.linearRampToValueAtTime(0, stopTime + 5); // Long 5s fade out
      
      setTimeout(() => {
        try {
          osc1.stop();
          osc2.stop();
          noiseSource.stop();
          lfo.stop();
        } catch (e) {}
      }, 5100);
    }
  };
};

/**
 * Creates a soft, rhythmic snoring/breathing sound
 */
export const playSnoringSound = (ctx: AudioContext, volume: number = 0.2) => {
  const now = ctx.currentTime;
  const effectiveVolume = getEffectiveVolume(volume);
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0, now);
  masterGain.gain.linearRampToValueAtTime(effectiveVolume, now + 1);
  masterGain.connect(ctx.destination);

  const bufferSize = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  noise.loop = true;

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(200, now);

  const breathingGain = ctx.createGain();
  breathingGain.gain.setValueAtTime(0.1, now);

  const lfo = ctx.createOscillator();
  lfo.type = 'sine';
  lfo.frequency.setValueAtTime(0.2, now); // Slow breath every 5s
  
  const lfoGain = ctx.createGain();
  lfoGain.gain.setValueAtTime(0.1, now);
  
  lfo.connect(lfoGain);
  lfoGain.connect(breathingGain.gain);
  
  noise.connect(filter);
  filter.connect(breathingGain);
  breathingGain.connect(masterGain);
  
  noise.start(now);
  lfo.start(now);

  return {
    stop: () => {
      const stopTime = ctx.currentTime;
      masterGain.gain.linearRampToValueAtTime(0, stopTime + 1);
      setTimeout(() => {
        try {
          noise.stop();
          lfo.stop();
        } catch (e) {}
      }, 1100);
    }
  };
};

interface AudioPlayerProps {
  audioBase64?: string | null;
  src?: string | null;
  autoplay?: boolean;
  enabled?: boolean;
  volume?: number; // 0..1
  onEnded?: (isLooping: boolean) => void;
  isFadingOut?: boolean;
  onFadeOutComplete?: () => void;
  isFadingIn?: boolean;
  fadeInDuration?: number;
  isCalmMode?: boolean;
  isMorningMode?: boolean;
  loop?: boolean;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioBase64,
  src,
  autoplay = false,
  enabled = false,
  volume = 0.4,
  onEnded,
  isFadingOut = false,
  onFadeOutComplete,
  isFadingIn = false,
  fadeInDuration = 5000,
  isCalmMode = false,
  isMorningMode = false,
  loop = false,
}) => {
  const [isLooping, setIsLooping] = useState(loop);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioTagRef = useRef<HTMLAudioElement | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const fadeInIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hapticIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const morningHapticIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Sync internal loop state with prop
  useEffect(() => {
    setIsLooping(loop);
  }, [loop]);

  // Haptic heartbeat synced with 741Hz/Calm rhythm
  useEffect(() => {
    if (isCalmMode && enabled) {
      const triggerPulse = async () => {
        try {
          // Night mode uses even lighter haptics
          await Haptics.impact({ style: ImpactStyle.Light });
          
          // Generate a subtle heartbeat sound using Web Audio API if context exists
          if (audioContextRef.current) {
            const ctx = audioContextRef.current;
            const now = ctx.currentTime;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(60, now);
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.1, now + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
            
            osc.start(now);
            osc.stop(now + 0.2);
            
            // Second "thump"
            const osc2 = ctx.createOscillator();
            const gain2 = ctx.createGain();
            osc2.connect(gain2);
            gain2.connect(ctx.destination);
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(50, now + 0.15);
            gain2.gain.setValueAtTime(0, now + 0.15);
            gain2.gain.linearRampToValueAtTime(0.08, now + 0.16);
            gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
            osc2.start(now + 0.15);
            osc2.stop(now + 0.35);
          }
        } catch (e) {}
      };

      // Initial pulse
      triggerPulse();
      
      // Set interval for constant sensory feedback (800ms)
      hapticIntervalRef.current = setInterval(triggerPulse, 800);
    } else {
      if (hapticIntervalRef.current) {
        clearInterval(hapticIntervalRef.current);
        hapticIntervalRef.current = null;
      }
    }

    return () => {
      if (hapticIntervalRef.current) {
        clearInterval(hapticIntervalRef.current);
      }
    };
  }, [isCalmMode, enabled]);

  // Morning Mode Haptic Tap (every 2s)
  useEffect(() => {
    if (isMorningMode && enabled) {
      const triggerTap = async () => {
        try {
          await Haptics.impact({ style: ImpactStyle.Light });
        } catch (e) {}
      };

      triggerTap();
      morningHapticIntervalRef.current = setInterval(triggerTap, 2000);
    } else {
      if (morningHapticIntervalRef.current) {
        clearInterval(morningHapticIntervalRef.current);
        morningHapticIntervalRef.current = null;
      }
    }

    return () => {
      if (morningHapticIntervalRef.current) {
        clearInterval(morningHapticIntervalRef.current);
      }
    };
  }, [isMorningMode, enabled]);

  // Fade out effect
  useEffect(() => {
    if (isFadingOut) {
      const startVolume = audioTagRef.current ? audioTagRef.current.volume : (gainNodeRef.current ? gainNodeRef.current.gain.value : volume);
      let currentVolume = startVolume;
      const duration = 10000; // 10 seconds
      const interval = 100; // update every 100ms
      const steps = duration / interval;
      const decrement = startVolume / steps;

      fadeIntervalRef.current = setInterval(() => {
        currentVolume -= decrement;
        
        if (currentVolume <= 0) {
          currentVolume = 0;
          if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
          
          if (audioTagRef.current) {
            audioTagRef.current.pause();
            audioTagRef.current.volume = 0;
          }
          if (gainNodeRef.current) {
            gainNodeRef.current.gain.value = 0;
          }
          if (sourceNodeRef.current) {
            try { sourceNodeRef.current.stop(); } catch(e) {}
          }
          
          if (onFadeOutComplete) onFadeOutComplete();
        } else {
          if (audioTagRef.current) {
            audioTagRef.current.volume = currentVolume;
          }
          if (gainNodeRef.current) {
            gainNodeRef.current.gain.value = currentVolume;
          }
        }
      }, interval);
    } else {
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
      }
    }

    return () => {
      if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
    };
  }, [isFadingOut, volume, onFadeOutComplete]);

  // Fade in effect
  useEffect(() => {
    if (isFadingIn && enabled && (audioBase64 || src)) {
      let currentVolume = 0;
      const targetVolume = volume;
      const duration = fadeInDuration;
      const interval = 100;
      const steps = duration / interval;
      const increment = targetVolume / steps;

      if (audioTagRef.current) audioTagRef.current.volume = 0;
      if (gainNodeRef.current) gainNodeRef.current.gain.value = 0;

      fadeInIntervalRef.current = setInterval(() => {
        currentVolume += increment;
        if (currentVolume >= targetVolume) {
          currentVolume = targetVolume;
          if (fadeInIntervalRef.current) clearInterval(fadeInIntervalRef.current);
        }

        if (audioTagRef.current) {
          audioTagRef.current.volume = currentVolume;
        }
        if (gainNodeRef.current) {
          gainNodeRef.current.gain.value = currentVolume;
        }
      }, interval);
    }

    return () => {
      if (fadeInIntervalRef.current) clearInterval(fadeInIntervalRef.current);
    };
  }, [isFadingIn, enabled, audioBase64, src, volume, fadeInDuration]);

  const playAudio = useCallback(async () => {
    if (!enabled) return;

    // Standard HTML5 Audio for files from the /741Hz or /music folder
    if (src && audioTagRef.current) {
      try {
        // Stop current playback if any
        audioTagRef.current.pause();
        audioTagRef.current.currentTime = 0;
        
        // Update source and play
        audioTagRef.current.volume = Math.max(0, Math.min(1, volume));
        audioTagRef.current.loop = isLooping;
        await audioTagRef.current.play();
        console.log(`Playing audio file from src: ${src} (loop: ${isLooping})`);
        return;
      } catch (srcError) {
        console.error("Error playing audio from src:", srcError);
      }
    }

    if (!audioBase64) return;

    try {
      // Initialize AudioContext if needed
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext ||
          (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      
      // Resume if suspended (required by browser autoplay policies)
      if (ctx.state === "suspended") {
        await ctx.resume();
      }

      // Decode base64 to bytes
      const binaryString = atob(audioBase64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Use AudioContext.decodeAudioData() to handle compressed formats (MP3, WAV, etc.)
      // This automatically detects and decodes the audio format
      const audioBuffer = await ctx.decodeAudioData(bytes.buffer);

      // Create source and connect to gain node for volume control
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.loop = isLooping;
      sourceNodeRef.current = source;

      // Gain node for volume control and smooth playback
      const gain = ctx.createGain();
      gain.gain.value = Math.max(0, Math.min(1, volume));
      gainNodeRef.current = gain;

      source.connect(gain);
      gain.connect(ctx.destination);

      source.start(0);

      // Web Audio API doesn't have a built-in 'ended' event that works like HTML5 Audio for loops,
      // but for single plays we can use onended.
      source.onended = () => {
        if (!source.loop && onEnded) {
          onEnded(false);
        }
      };
    } catch (e) {
      console.error("Audio playback error:", e);
      // Fallback: try using HTMLAudioElement with data URL
      try {
        const formats = ['audio/mp3', 'audio/wav', 'audio/ogg', 'audio/webm', 'audio/mpeg'];
        for (const format of formats) {
          try {
            const audioDataUrl = `data:${format};base64,${audioBase64}`;
            const audio = new Audio(audioDataUrl);
            audio.volume = Math.max(0, Math.min(1, volume));
            audio.loop = isLooping;
            await audio.play();
            console.log(`Audio played successfully using HTMLAudioElement with format ${format}`);
            return;
          } catch (formatError) {
            continue;
          }
        }
      } catch (fallbackError) {
        console.error("Fallback audio playback also failed:", fallbackError);
      }
    }
  }, [enabled, audioBase64, src, volume, isLooping, onEnded]);

  useEffect(() => {
    if (autoplay && enabled && (audioBase64 || src)) {
      playAudio();
    }
  }, [autoplay, enabled, audioBase64, src, playAudio]);

  // Update loop state if it changes during playback
  useEffect(() => {
    if (audioTagRef.current) {
      audioTagRef.current.loop = isLooping;
    }
    if (sourceNodeRef.current) {
      sourceNodeRef.current.loop = isLooping;
    }
  }, [isLooping]);

  if (!audioBase64 && !src) return null;

  if (!enabled) return (
    <div className="text-xs text-gray-500">מצב שקט פעיל — אין ניגון קול</div>
  );

  return (
    <div className="flex items-center gap-2">
      {/* Hidden audio tag for src playback */}
      {src && (
        <audio 
          ref={audioTagRef} 
          src={src} 
          loop={isLooping} 
          onEnded={() => onEnded && onEnded(isLooping)}
        />
      )}

      <button
        onClick={playAudio}
        className="text-sm bg-blue-100 text-blue-600 px-3 py-1 rounded-full hover:bg-blue-200 transition-colors flex items-center gap-2"
      >
        <span>🔊</span> השמע הודעה
      </button>
      
      <button
        onClick={() => setIsLooping(!isLooping)}
        className={`p-1.5 rounded-full transition-all ${
          isLooping 
            ? 'bg-purple-100 text-purple-600 shadow-sm' 
            : 'bg-gray-100 text-gray-400 opacity-60'
        }`}
        title={isLooping ? 'ביטול לופ' : 'הפעל לופ'}
      >
        <span className="text-sm">🔁</span>
      </button>
    </div>
  );
};

export default AudioPlayer;
