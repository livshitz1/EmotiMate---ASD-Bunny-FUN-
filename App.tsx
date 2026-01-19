import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BunnyState, Emotion, ScheduleItem, TimeOfDay, ChatMessage } from './types';
import { INITIAL_BUNNY_STATE, INITIAL_SCHEDULE } from './constants';
import { generateEmotiMateResponse, generateBunnyImage, generateBunnySpeech } from './services/geminiService';
import BunnyAvatar from './components/BunnyAvatar';
import VisualSchedule from './components/VisualSchedule';
import Controls from './components/Controls';
import AudioPlayer from './components/AudioPlayer';

const App: React.FC = () => {
  // --- State ---
  const [bunny, setBunny] = useState<BunnyState>(INITIAL_BUNNY_STATE);
  const [schedule, setSchedule] = useState<ScheduleItem[]>(INITIAL_SCHEDULE);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [currentTimeOfDay, setCurrentTimeOfDay] = useState<TimeOfDay>(TimeOfDay.MORNING);

  // Use refs to keep track of mounted state for async operations
  const isMounted = useRef(true);

  // --- Helpers ---
  
  const addMessage = (sender: 'user' | 'bot', text: string, audioUrl?: string) => {
    setChatHistory(prev => [
      ...prev,
      {
        id: Date.now().toString() + Math.random(),
        sender,
        text,
        audioUrl,
        timestamp: new Date()
      }
    ]);
  };

  const determineTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return TimeOfDay.MORNING;
    if (hour >= 12 && hour < 17) return TimeOfDay.AFTERNOON;
    if (hour >= 17 && hour < 20) return TimeOfDay.EVENING;
    return TimeOfDay.NIGHT;
  };

  // --- Effects ---

  useEffect(() => {
    isMounted.current = true;
    setCurrentTimeOfDay(determineTimeOfDay());

    // Initial greeting
    handleInteraction('start', 'שלום! אני הארנב שלך. איך אתה מרגיש היום?');

    return () => {
      isMounted.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Timer to slowly decrease stats (simulated time passage)
  useEffect(() => {
    const timer = setInterval(() => {
      setBunny(prev => ({
        ...prev,
        hunger: Math.max(0, prev.hunger - 1),
        energy: Math.max(0, prev.energy - 1),
        happiness: Math.max(0, prev.happiness - 1),
      }));
    }, 30000); // Every 30 seconds

    return () => clearInterval(timer);
  }, []);

  // Update Emotion based on stats
  useEffect(() => {
    setBunny(prev => {
      let newEmotion = Emotion.NEUTRAL;
      if (prev.hunger < 30) newEmotion = Emotion.HUNGRY;
      else if (prev.energy < 30) newEmotion = Emotion.TIRED;
      else if (prev.happiness < 30) newEmotion = Emotion.SAD;
      else if (prev.happiness > 70 && prev.hunger > 50 && prev.energy > 50) newEmotion = Emotion.HAPPY;
      
      if (prev.currentEmotion !== newEmotion) {
        return { ...prev, currentEmotion: newEmotion };
      }
      return prev;
    });
  }, [bunny.hunger, bunny.energy, bunny.happiness]);

  // --- Handlers ---

  const handleInteraction = async (actionType: string, customInput?: string) => {
    if (isProcessing) return;
    setIsProcessing(true);

    // 1. Update local state immediately for responsiveness
    if (actionType === 'feed') {
      setBunny(prev => ({ ...prev, hunger: Math.min(100, prev.hunger + 30), happiness: prev.happiness + 5 }));
    } else if (actionType === 'sleep') {
      setBunny(prev => ({ ...prev, energy: Math.min(100, prev.energy + 40) }));
    } else if (actionType === 'play') {
      setBunny(prev => ({ ...prev, happiness: Math.min(100, prev.happiness + 20), energy: Math.max(0, prev.energy - 10) }));
    } else if (actionType === 'hug') {
      setBunny(prev => ({ ...prev, happiness: Math.min(100, prev.happiness + 15) }));
    }

    // 2. Add User Message to Chat
    const userText = customInput || `אני רוצה ${actionType === 'feed' ? 'להאכיל אותך' : actionType === 'play' ? 'לשחק איתך' : actionType === 'sleep' ? 'שתלך לישון' : 'לחבק אותך'}`;
    addMessage('user', userText);

    // 3. Call Gemini for Content
    const stateDescription = `Hunger: ${bunny.hunger}, Energy: ${bunny.energy}, Happiness: ${bunny.happiness}, Emotion: ${bunny.currentEmotion}`;
    const recentHistory = chatHistory.slice(-3).map(m => `${m.sender}: ${m.text}`).join('\n');
    
    try {
      // Parallel execution for speed where possible, but text is needed for speech
      const textResponse = await generateEmotiMateResponse(userText, stateDescription, recentHistory);
      
      // Determine prompt for image based on action and resulting emotion
      const imagePromise = generateBunnyImage(actionType === 'start' ? 'waving hello' : actionType, bunny.currentEmotion);
      const audioPromise = generateBunnySpeech(textResponse);

      const [imageUrl, audioBase64] = await Promise.all([imagePromise, audioPromise]);

      if (isMounted.current) {
        if (imageUrl) setCurrentImage(imageUrl);
        addMessage('bot', textResponse, audioBase64 || undefined);
      }
    } catch (e) {
      console.error("Interaction failed", e);
    } finally {
      if (isMounted.current) setIsProcessing(false);
    }
  };

  const toggleTask = (id: string) => {
    setSchedule(prev => {
      const updated = prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
      const task = updated.find(t => t.id === id);
      
      // If task was just completed, trigger a positive reinforcement
      if (task && task.completed && !prev.find(t => t.id === id)?.completed) {
        handleInteraction('task_completed', `סיימתי את המשימה: ${task.task}!`);
      }
      return updated;
    });
  };

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto flex flex-col md:flex-row gap-6">
      
      {/* Left Column: Schedule (Mobile: Bottom, Desktop: Left) */}
      <div className="md:w-1/3 order-2 md:order-1 h-[500px] md:h-auto">
        <VisualSchedule 
          schedule={schedule} 
          onToggleTask={toggleTask} 
          currentTimeOfDay={currentTimeOfDay} 
        />
      </div>

      {/* Right Column: Bunny & Chat (Mobile: Top, Desktop: Right) */}
      <div className="md:w-2/3 order-1 md:order-2 flex flex-col gap-6">
        
        {/* Status Bars */}
        <div className="bg-white p-4 rounded-2xl shadow-sm flex justify-around items-center">
          <div className="text-center">
            <span className="text-2xl block">🥕</span>
            <div className="w-16 h-2 bg-gray-200 rounded-full mt-1 overflow-hidden">
              <div className="h-full bg-orange-400" style={{ width: `${bunny.hunger}%` }}></div>
            </div>
          </div>
          <div className="text-center">
            <span className="text-2xl block">⚡</span>
             <div className="w-16 h-2 bg-gray-200 rounded-full mt-1 overflow-hidden">
              <div className="h-full bg-yellow-400" style={{ width: `${bunny.energy}%` }}></div>
            </div>
          </div>
          <div className="text-center">
            <span className="text-2xl block">💖</span>
             <div className="w-16 h-2 bg-gray-200 rounded-full mt-1 overflow-hidden">
              <div className="h-full bg-pink-400" style={{ width: `${bunny.happiness}%` }}></div>
            </div>
          </div>
        </div>

        {/* Avatar */}
        <BunnyAvatar 
          emotion={bunny.currentEmotion} 
          imageUrl={currentImage} 
          isLoading={isProcessing} 
        />

        {/* Controls */}
        <Controls onAction={handleInteraction} disabled={isProcessing} />

        {/* Chat / Feedback Log */}
        <div className="bg-white rounded-2xl shadow-sm p-4 h-64 overflow-y-auto flex flex-col-reverse gap-3 border border-gray-100">
          {[...chatHistory].reverse().map((msg) => (
            <div 
              key={msg.id} 
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] p-3 rounded-2xl ${
                msg.sender === 'user' 
                  ? 'bg-purple-100 text-purple-900 rounded-bl-none' 
                  : 'bg-gray-100 text-gray-800 rounded-br-none'
              }`}>
                <p className="mb-1">{msg.text}</p>
                {msg.sender === 'bot' && msg.audioUrl && (
                  <AudioPlayer audioBase64={msg.audioUrl} autoplay={msg === chatHistory[chatHistory.length - 1]} />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;