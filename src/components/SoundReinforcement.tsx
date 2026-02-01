import React, { useEffect, useRef } from 'react';

interface SoundReinforcementProps {
  trigger: 'task_complete' | 'achievement' | 'points' | 'pop' | 'fanfare' | null;
  onComplete?: () => void;
  volume?: number;
}

/**
 * Generates positive reinforcement sounds using Web Audio API
 * Creates celebratory tones when tasks are completed
 */
const SoundReinforcement: React.FC<SoundReinforcementProps> = ({ trigger, onComplete, volume = 0.3 }) => {
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (!trigger) return;

    // Use a local variable to prevent multiple triggers if onComplete changes
    let isMounted = true;

    // Initialize AudioContext if needed
    if (!audioContextRef.current) {
      const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
      if (AudioContextClass) {
        audioContextRef.current = new AudioContextClass();
      }
    }

    const ctx = audioContextRef.current;
    if (ctx) {
      const now = ctx.currentTime;

      // Create a celebratory sound sequence
      const playTone = (frequency: number, startTime: number, duration: number, type: OscillatorType = 'sine') => {
        if (!ctx) return;
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = type;

        // Envelope for smooth sound
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      };

      switch (trigger) {
        case 'task_complete':
          // Success chime: ascending notes
          playTone(523.25, now, 0.1); // C5
          playTone(659.25, now + 0.1, 0.1); // E5
          playTone(783.99, now + 0.2, 0.2); // G5
          break;

        case 'achievement':
          // Achievement fanfare: multiple notes
          playTone(523.25, now, 0.15); // C5
          playTone(659.25, now + 0.1, 0.15); // E5
          playTone(783.99, now + 0.2, 0.15); // G5
          playTone(1046.50, now + 0.3, 0.3); // C6
          break;

        case 'points':
          // Points earned: quick chime
          playTone(659.25, now, 0.08); // E5
          playTone(783.99, now + 0.05, 0.1); // G5
          break;

        case 'fanfare':
          // Victory Fanfare: Triad chord
          playTone(523.25, now, 0.2, 'square'); // C5
          playTone(659.25, now + 0.1, 0.2, 'square'); // E5
          playTone(783.99, now + 0.2, 0.2, 'square'); // G5
          playTone(1046.50, now + 0.3, 0.5, 'square'); // C6
          break;

        case 'pop':
          // Bubble pop: quick high frequency tone with fast decay
          playTone(1200, now, 0.05, 'sine');
          break;

        case 'transition' as any:
          // Smooth transition sound: sliding filter or frequency
          playTone(440, now, 0.3, 'sine'); // A4
          playTone(554.37, now + 0.1, 0.3, 'sine'); // C#5
          break;

        case 'heartbeat' as any:
          // Heartbeat thump-thump
          playTone(60, now, 0.1, 'sine'); // Very low thump
          playTone(55, now + 0.1, 0.15, 'sine'); // Slightly lower second thump
          break;
      }
    }

    // Call onComplete after sound finishes
    const timer = setTimeout(() => {
      if (isMounted && onComplete) {
        onComplete();
      }
    }, 600);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [trigger, onComplete]);

  // This component doesn't render anything
  return null;
};

export default SoundReinforcement;
