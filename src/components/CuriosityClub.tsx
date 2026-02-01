import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BunnyLottie from './BunnyLottie';
import { Language } from '../types';
import { generateEmotiMateResponse } from '../services/geminiService';

interface CuriosityClubProps {
  language: Language;
  onClose: () => void;
  bunnyState: string;
}

const QUICK_QUESTIONS = [
  { id: 'space', emoji: '🪐', label: { he: 'חלל', en: 'Space' } },
  { id: 'dinosaurs', emoji: '🦕', label: { he: 'דינוזאורים', en: 'Dinosaurs' } },
  { id: 'sea', emoji: '🌊', label: { he: 'ים', en: 'Sea' } },
  { id: 'insects', emoji: '🐞', label: { he: 'חרקים', en: 'Insects' } },
  { id: 'animals', emoji: '🦁', label: { he: 'חיות', en: 'Animals' } },
  { id: 'body', emoji: '🧠', label: { he: 'גוף האדם', en: 'Human Body' } },
  { id: 'plants', emoji: '🌳', label: { he: 'צמחים', en: 'Plants' } },
  { id: 'weather', emoji: '⛈️', label: { he: 'מזג אוויר', en: 'Weather' } },
  { id: 'robots', emoji: '🤖', label: { he: 'רובוטים', en: 'Robots' } },
  { id: 'food', emoji: '🍕', label: { he: 'אוכל', en: 'Food' } },
];

export const CuriosityClub: React.FC<CuriosityClubProps> = ({ language, onClose, bunnyState }) => {
  const isHebrew = language === 'he';
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [isAsking, setIsAsking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [suggestedNext, setSuggestedNext] = useState<typeof QUICK_QUESTIONS[0] | null>(null);
  
  // Use refs to keep recognition instance stable and avoid loops
  const recognitionRef = useRef<any>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition && !recognitionRef.current) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        
        recognition.onstart = () => {
          if (isMounted.current) setIsRecording(true);
        };

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript && isMounted.current) {
            setQuestion(transcript);
            handleAsk(transcript);
          }
        };

        recognition.onend = () => {
          if (isMounted.current) setIsRecording(false);
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          if (isMounted.current) {
            setIsRecording(false);
            if (event.error !== 'no-speech' && event.error !== 'aborted') {
              setAnswer(isHebrew ? 'אופס! היתה בעיה עם המיקרופון. נסה שוב או הקלד שאלה.' : 'Oops! Microphone error. Try again or type your question.');
            }
          }
        };

        recognitionRef.current = recognition;
      } catch (e) {
        console.error('Speech recognition setup failed:', e);
      }
    }

    return () => {
      isMounted.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, []);

  // Update language separately
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = isHebrew ? 'he-IL' : 'en-US';
    }
  }, [isHebrew]);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      setAnswer(isHebrew ? 'המיקרופון לא נתמך בדפדפן זה.' : 'Speech recognition not supported.');
      return;
    }

    if (isRecording) {
      try { recognitionRef.current.stop(); } catch (e) {}
    } else {
      try {
        setAnswer(null);
        setQuestion('');
        setSuggestedNext(null);
        recognitionRef.current.start();
        
        // Haptic feedback
        import('@capacitor/haptics').then(m => 
          m.Haptics.impact({ style: (import('@capacitor/haptics').ImpactStyle as any).Light })
        ).catch(() => {});
      } catch (err) {
        console.error('Mic start error:', err);
        setIsRecording(false);
      }
    }
  };

  const handleAsk = async (query: string) => {
    if (!query.trim() || isAsking) return;
    setIsAsking(true);
    setAnswer(null);
    setSuggestedNext(null);
    
    try {
      const response = await generateEmotiMateResponse(
        `curiosity_question:${query}`,
        bunnyState,
        '', 
        `The child is in the Curiosity Club and asked: ${query}. Explain this topic simply and enthusiastically for a child.`
      );
      
      if (isMounted.current) {
        setAnswer(response);
        // Suggest a random next topic
        const remaining = QUICK_QUESTIONS.filter(q => !query.toLowerCase().includes(q.label.en.toLowerCase()));
        const next = remaining[Math.floor(Math.random() * remaining.length)];
        setSuggestedNext(next);
      }
    } catch (e) {
      console.error('Error asking bunny:', e);
      if (isMounted.current) {
        setAnswer(isHebrew ? 'אופס, אני צריך רגע לחשוב על זה שוב...' : 'Oops, I need a moment to think about that again...');
      }
    } finally {
      if (isMounted.current) setIsAsking(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[600] overflow-hidden flex flex-col items-center justify-start p-6 bg-gradient-to-b from-indigo-500 to-purple-700"
    >
      <button 
        onClick={onClose}
        className="absolute top-12 right-6 text-white bg-white/20 hover:bg-white/30 w-12 h-12 rounded-full flex items-center justify-center text-2xl z-50 shadow-lg backdrop-blur-md transition-all"
      >
        ✕
      </button>

      <div className="text-center mb-6 relative z-10 mt-16">
        <h2 className="text-4xl font-black text-white drop-shadow-md mb-2 flex items-center justify-center gap-3">
          <span>🎓</span>
          {isHebrew ? 'מועדון הסקרנות' : 'Curiosity Club'}
        </h2>
        <p className="text-indigo-100 font-bold text-lg px-4">
          {isHebrew ? 'מה תרצה לגלות היום?' : 'What would you like to discover today?'}
        </p>
      </div>

      <div className="relative w-full max-w-md h-48 flex items-center justify-center mb-8">
        <div className="w-48 h-48 relative">
          <BunnyLottie animation="idle" />
          <motion.div 
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="absolute -top-4 left-1/2 -translate-x-1/2 text-6xl pointer-events-none select-none"
          >
            🎓
          </motion.div>
          <motion.div 
            animate={{ rotate: [0, 10, -10, 0], x: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute bottom-4 -right-4 text-5xl pointer-events-none select-none"
          >
            🔍
          </motion.div>
        </div>
      </div>

      <div className="w-full max-w-md bg-white/10 backdrop-blur-md rounded-3xl p-6 mb-8 border border-white/20 shadow-2xl relative z-10">
        <div className="flex gap-3 mb-6">
          <input 
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAsk(question)}
            placeholder={isHebrew ? 'שאל אותי משהו...' : 'Ask me something...'}
            className="flex-1 bg-white/20 border-2 border-white/30 rounded-2xl px-4 py-3 text-white placeholder:text-white/50 outline-none focus:border-yellow-400 font-bold"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleRecording}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg transition-all ${
              isRecording ? 'bg-red-500 animate-pulse' : 'bg-blue-500 hover:bg-blue-400'
            }`}
          >
            {isRecording ? '⏹️' : '🎤'}
          </motion.button>
        </div>

        <div className="flex overflow-x-auto gap-3 pb-2 no-scrollbar">
          {QUICK_QUESTIONS.map((q) => (
            <motion.button
              key={q.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setQuestion(isHebrew ? `ספר לי על ${q.label.he}` : `Tell me about ${q.label.en}`);
                handleAsk(isHebrew ? `ספר לי על ${q.label.he}` : `Tell me about ${q.label.en}`);
              }}
              className="flex flex-col items-center gap-1 p-3 bg-white/10 rounded-2xl border border-white/20 hover:bg-white/30 transition-all min-w-[80px]"
            >
              <span className="text-3xl">{q.emoji}</span>
              <span className="text-[10px] font-black text-white uppercase whitespace-nowrap">{isHebrew ? q.label.he : q.label.en}</span>
            </motion.button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {(isAsking || answer || isRecording) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[700] bg-black/40 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              className="w-full max-w-md bg-white rounded-[2.5rem] p-6 shadow-2xl flex flex-col max-h-[75vh] relative"
            >
              {!isAsking && !isRecording && (
                <button 
                  onClick={() => setAnswer(null)}
                  className="absolute -top-4 -right-4 w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg text-xl z-[710]"
                >
                  ✕
                </button>
              )}

              <div className="overflow-y-auto flex-1 pr-2 custom-scrollbar">
                {isRecording ? (
                  <div className="flex flex-col items-center justify-center h-full py-6 gap-6" onClick={toggleRecording}>
                    <div className="relative">
                      <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }} className="absolute inset-0 bg-blue-400 rounded-full" />
                      <div className="relative w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-4xl shadow-lg cursor-pointer">🎤</div>
                    </div>
                    <p className="text-blue-900 font-black text-xl text-center animate-pulse">{isHebrew ? 'אני מקשיב... דבר אלי!' : 'I am listening... Speak to me!'}</p>
                    <p className="text-gray-400 text-sm font-bold italic text-center px-4">{isHebrew ? '(לחץ על העיגול הכחול כשתסיים לדבר)' : '(Tap the blue circle when finished speaking)'}</p>
                  </div>
                ) : isAsking ? (
                  <div className="flex flex-col items-center justify-center h-full py-10 gap-6">
                    <div className="flex gap-3">
                      <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1, repeat: Infinity }} className="w-4 h-4 bg-indigo-500 rounded-full" />
                      <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} className="w-4 h-4 bg-purple-500 rounded-full" />
                      <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} className="w-4 h-4 bg-pink-500 rounded-full" />
                    </div>
                    <p className="text-indigo-900 font-black italic text-xl text-center">{isHebrew ? 'הארנב בודק בספרים שלו...' : 'The bunny is checking his books...'}</p>
                  </div>
                ) : (
                  <div className="prose prose-indigo max-w-none pb-2">
                    <p className="text-lg sm:text-xl font-bold text-gray-800 leading-relaxed text-center" dir={isHebrew ? 'rtl' : 'ltr'}>{answer}</p>
                    {suggestedNext && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 p-4 bg-indigo-50 rounded-2xl border-2 border-indigo-100 flex flex-col items-center gap-3">
                        <p className="text-indigo-600 font-black text-sm uppercase tracking-wider">{isHebrew ? 'רוצה לדעת עוד?' : 'Want to know more?'}</p>
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => {
                          const q = isHebrew ? `ספר לי על ${suggestedNext.label.he}` : `Tell me about ${suggestedNext.label.en}`;
                          setQuestion(q);
                          handleAsk(q);
                        }} className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-indigo-200 text-indigo-700 font-bold">
                          <span className="text-2xl">{suggestedNext.emoji}</span>
                          <span>{isHebrew ? suggestedNext.label.he : suggestedNext.label.en}</span>
                        </motion.button>
                      </motion.div>
                    )}
                  </div>
                )}
              </div>
              
              {!isAsking && !isRecording && (
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-center shrink-0">
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setAnswer(null)} className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black text-lg shadow-lg shadow-indigo-200 w-full">
                    {isHebrew ? 'הבנתי! ✨' : 'Got it! ✨'}
                  </motion.button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CuriosityClub;
