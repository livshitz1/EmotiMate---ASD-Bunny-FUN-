import React, { useEffect, useRef } from 'react';

interface AudioPlayerProps {
  audioBase64: string | null;
  autoplay?: boolean;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioBase64, autoplay = true }) => {
  const audioContextRef = useRef<AudioContext | null>(null);

  // Helper to decode base64 string to byte array
  const decodeBase64 = (base64: string) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  // Helper to decode raw PCM into an AudioBuffer
  const decodeAudioData = async (
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number = 24000, 
    numChannels: number = 1
  ): Promise<AudioBuffer> => {
    // Note: The Gemini TTS usually returns raw PCM.
    // We assume 16-bit PCM (Int16).
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        // Convert Int16 to Float32 [-1.0, 1.0]
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  };

  const playAudio = async () => {
    if (!audioBase64) return;

    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      
      const ctx = audioContextRef.current;
      // Resume context if suspended (browser policy)
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      const bytes = decodeBase64(audioBase64);
      const audioBuffer = await decodeAudioData(bytes, ctx);
      
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.start(0);

    } catch (e) {
      console.error("Audio playback error:", e);
    }
  };

  useEffect(() => {
    if (autoplay && audioBase64) {
      playAudio();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioBase64]);

  if (!audioBase64) return null;

  return (
    <button 
      onClick={playAudio}
      className="text-sm bg-blue-100 text-blue-600 px-3 py-1 rounded-full hover:bg-blue-200 transition-colors flex items-center gap-2"
    >
      <span>🔊</span> השמע הודעה
    </button>
  );
};

export default AudioPlayer;