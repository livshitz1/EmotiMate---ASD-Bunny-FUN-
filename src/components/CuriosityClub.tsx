import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BunnyLottie from './BunnyLottie';
import { Language } from '../types';
import { generateEmotiMateResponse, getGeminiClientStatus, buildLocalCuriosityAnswer } from '../services/geminiService';

interface CuriosityClubProps {
  language: Language;
  onClose: () => void;
  bunnyState: string;
}

interface CuriosityLogEntry {
  id: string;
  timestamp: string;
  question: string;
  answer: string;
  source: 'text' | 'voice';
  language: Language;
  topic: string;
  aiConfigured: boolean;
  answerLength: number;
}

const CURIOSITY_LOG_KEY = 'emotimate_curiosity_logs';
const CURIOSITY_STATS_KEY = 'emotimate_curiosity_stats';

const QUICK_QUESTIONS = [
  { id: 'space', emoji: '🪐', label: { he: 'חלל', en: 'Space', ru: 'Космос' } },
  { id: 'dinosaurs', emoji: '🦕', label: { he: 'דינוזאורים', en: 'Dinosaurs', ru: 'Динозавры' } },
  { id: 'sea', emoji: '🌊', label: { he: 'ים', en: 'Sea', ru: 'Море' } },
  { id: 'insects', emoji: '🐞', label: { he: 'חרקים', en: 'Insects', ru: 'Насекомые' } },
  { id: 'animals', emoji: '🦁', label: { he: 'חיות', en: 'Animals', ru: 'Животные' } },
  { id: 'body', emoji: '🧠', label: { he: 'גוף האדם', en: 'Human Body', ru: 'Тело человека' } },
  { id: 'plants', emoji: '🌳', label: { he: 'צמחים', en: 'Plants', ru: 'Растения' } },
  { id: 'weather', emoji: '⛈️', label: { he: 'מזג אוויר', en: 'Weather', ru: 'Погода' } },
  { id: 'robots', emoji: '🤖', label: { he: 'רובוטים', en: 'Robots', ru: 'Роботы' } },
  { id: 'food', emoji: '🍕', label: { he: 'אוכל', en: 'Food', ru: 'Еда' } },
];

const getLangTag = (language: Language): 'he' | 'en' | 'ru' => {
  if (language === Language.ENGLISH) return 'en';
  if (language === Language.RUSSIAN) return 'ru';
  return 'he';
};

const detectTopic = (query: string): string => {
  const q = query.toLowerCase();
  if (q.includes('חלל') || q.includes('space') || q.includes('кос')) return 'space';
  if (q.includes('דינוז') || q.includes('dino') || q.includes('диноз')) return 'dinosaurs';
  if (q.includes('ים') || q.includes('sea') || q.includes('ocean') || q.includes('мор')) return 'sea';
  if (q.includes('חרק') || q.includes('insect') || q.includes('насеком')) return 'insects';
  if (q.includes('מזג') || q.includes('weather') || q.includes('погод')) return 'weather';
  if (q.includes('רובוט') || q.includes('robot') || q.includes('робот')) return 'robots';
  if (q.includes('גוף') || q.includes('body') || q.includes('мозг') || q.includes('тело')) return 'body';
  if (q.includes('אוכל') || q.includes('food') || q.includes('еда')) return 'food';
  if (q.includes('חיה') || q.includes('animal') || q.includes('живот')) return 'animals';
  if (q.includes('צמח') || q.includes('plant') || q.includes('растен')) return 'plants';
  return 'general';
};

const saveCuriosityEntry = (entry: CuriosityLogEntry) => {
  try {
    const logs: CuriosityLogEntry[] = JSON.parse(localStorage.getItem(CURIOSITY_LOG_KEY) || '[]');
    const nextLogs = [entry, ...logs].slice(0, 200);
    localStorage.setItem(CURIOSITY_LOG_KEY, JSON.stringify(nextLogs));

    const uniqueTopics = new Set(nextLogs.map((l) => l.topic));
    const voiceCount = nextLogs.filter((l) => l.source === 'voice').length;
    const avgAnswerLength = Math.round(nextLogs.reduce((sum, l) => sum + l.answerLength, 0) / Math.max(nextLogs.length, 1));

    localStorage.setItem(CURIOSITY_STATS_KEY, JSON.stringify({
      totalQuestions: nextLogs.length,
      voiceQuestions: voiceCount,
      textQuestions: nextLogs.length - voiceCount,
      uniqueTopics: uniqueTopics.size,
      avgAnswerLength,
      lastQuestionAt: entry.timestamp,
      lastQuestionText: entry.question,
      lastSource: entry.source
    }));
  } catch (err) {
    console.error('Failed to persist curiosity data', err);
  }
};

export const CuriosityClub: React.FC<CuriosityClubProps> = ({ language, onClose, bunnyState }) => {
  const isHebrew = language === Language.HEBREW;
  const isRussian = language === Language.RUSSIAN;
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [isAsking, setIsAsking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [suggestedNext, setSuggestedNext] = useState<typeof QUICK_QUESTIONS[0] | null>(null);
  const [lastAskedQuestion, setLastAskedQuestion] = useState('');
  const [lastInputMode, setLastInputMode] = useState<'text' | 'voice' | null>(null);
  const [sessionQuestionCount, setSessionQuestionCount] = useState(0);

  const recognitionRef = useRef<any>(null);
  const isMounted = useRef(true);
  const geminiStatus = getGeminiClientStatus();

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
          const transcript = event?.results?.[0]?.[0]?.transcript || '';
          if (transcript && isMounted.current) {
            setQuestion(transcript);
            setLastAskedQuestion(transcript);
            setLastInputMode('voice');
            handleAsk(transcript, 'voice');
          }
        };

        recognition.onend = () => {
          if (isMounted.current) setIsRecording(false);
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event?.error);
          if (isMounted.current) {
            setIsRecording(false);
            if (event?.error !== 'no-speech' && event?.error !== 'aborted') {
              setAnswer(
                isHebrew
                  ? 'אופס, היתה בעיה במיקרופון. אפשר לנסות שוב או להקליד שאלה.'
                  : isRussian
                  ? 'Упс, проблема с микрофоном. Можно попробовать снова или ввести вопрос.'
                  : 'Oops, microphone issue. Try again or type your question.'
              );
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
        } catch (e) {
          // ignore
        }
      }
    };
  }, [isHebrew, isRussian]);

  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = isHebrew ? 'he-IL' : isRussian ? 'ru-RU' : 'en-US';
    }
  }, [isHebrew, isRussian]);

  const requestAudioPermissionForWeb = async (): Promise<boolean> => {
    try {
      if (!navigator?.mediaDevices?.getUserMedia) return false;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
      return true;
    } catch (err) {
      console.warn('getUserMedia audio permission failed:', err);
      return false;
    }
  };

  const toggleRecording = async () => {
    if (!recognitionRef.current) {
      setAnswer(
        isHebrew
          ? 'המיקרופון לא נתמך במכשיר זה. אפשר להקליד שאלה.'
          : isRussian
          ? 'Микрофон не поддерживается на этом устройстве. Можно ввести вопрос.'
          : 'Speech recognition is not supported on this device. You can type your question.'
      );
      return;
    }

    if (isRecording) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
      return;
    }

    try {
      setAnswer(null);
      setSuggestedNext(null);

      await requestAudioPermissionForWeb();
      recognitionRef.current.start();

      import('@capacitor/haptics')
        .then((m) => m.Haptics.impact({ style: (import('@capacitor/haptics').ImpactStyle as any).Light }))
        .catch(() => {});
    } catch (err) {
      console.error('Mic start error:', err);
      setIsRecording(false);
      setAnswer(
        isHebrew
          ? 'לא הצלחתי להתחיל האזנה. אפשר לנסות שוב או להקליד שאלה.'
          : isRussian
          ? 'Не удалось начать запись. Попробуйте снова или введите вопрос.'
          : 'Could not start listening. Try again or type your question.'
      );
    }
  };

  const handleAsk = async (rawQuery: string, source: 'text' | 'voice' = 'text') => {
    const query = rawQuery.trim();
    if (!query || isAsking) return;

    setIsAsking(true);
    setAnswer(null);
    setSuggestedNext(null);
    setLastAskedQuestion(query);
    setLastInputMode(source);

    try {
      const response = await Promise.race<string>([
        generateEmotiMateResponse(
          `curiosity_question:${query}`,
          bunnyState,
          '',
          `The child is in the Curiosity Club and asked: ${query}. Explain this topic simply and enthusiastically for a child.`
        ),
        new Promise<string>((_, reject) => setTimeout(() => reject(new Error('CURIOSITY_TIMEOUT')), 12000))
      ]);

      let finalAnswer = response;
      if (response.includes('תן לי רגע לבדוק בספרים שלי') || response.includes('זו שאלה מצוינת!')) {
        finalAnswer = buildLocalCuriosityAnswer(query, getLangTag(language));
      }

      if (isMounted.current) {
        setAnswer(finalAnswer);
        setSessionQuestionCount((n) => n + 1);

        const remaining = QUICK_QUESTIONS.filter((q) => !query.toLowerCase().includes((q.label.en || '').toLowerCase()));
        const next = remaining[Math.floor(Math.random() * remaining.length)] || QUICK_QUESTIONS[0];
        setSuggestedNext(next);

        saveCuriosityEntry({
          id: `curiosity_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          timestamp: new Date().toISOString(),
          question: query,
          answer: finalAnswer,
          source,
          language,
          topic: detectTopic(query),
          aiConfigured: geminiStatus.configured,
          answerLength: finalAnswer.length
        });
      }
    } catch (e) {
      console.error('Error asking curiosity question:', e);
      const fallback = buildLocalCuriosityAnswer(query, getLangTag(language));
      if (isMounted.current) {
        setAnswer(fallback);
        setSessionQuestionCount((n) => n + 1);

        saveCuriosityEntry({
          id: `curiosity_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          timestamp: new Date().toISOString(),
          question: query,
          answer: fallback,
          source,
          language,
          topic: detectTopic(query),
          aiConfigured: geminiStatus.configured,
          answerLength: fallback.length
        });
      }
    } finally {
      if (isMounted.current) setIsAsking(false);
    }
  };

  const headerTitle = isHebrew ? 'מועדון הסקרנות' : isRussian ? 'Клуб любопытства' : 'Curiosity Club';
  const subtitle = isHebrew ? 'מה תרצה לגלות היום?' : isRussian ? 'Что ты хочешь узнать сегодня?' : 'What would you like to discover today?';

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
          {headerTitle}
        </h2>
        <p className="text-indigo-100 font-bold text-lg px-4">{subtitle}</p>
      </div>

      <div className="relative w-full max-w-md h-44 flex items-center justify-center mb-6">
        <div className="w-40 h-40 relative">
          <BunnyLottie animation="idle" />
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="absolute -top-4 left-1/2 -translate-x-1/2 text-5xl pointer-events-none select-none"
          >
            🎓
          </motion.div>
        </div>
      </div>

      <div className="w-full max-w-md bg-white/10 backdrop-blur-md rounded-3xl p-5 mb-6 border border-white/20 shadow-2xl relative z-10">
        <div className="mb-3 text-xs text-white/85 bg-black/20 rounded-xl p-2 border border-white/20">
          {geminiStatus.configured
            ? (isHebrew ? 'מצב AI: API מוגדר. אם הרשת זמינה תתקבל תשובה מלאה.' : isRussian ? 'AI: API настроен. При доступной сети ответ будет полнее.' : 'AI mode: API configured. With network, answers are richer.')
            : (isHebrew ? 'מצב AI: מפתח API חסר, לכן נעשה שימוש בתשובות מקומיות.' : isRussian ? 'AI: ключ API отсутствует, используется локальный режим.' : 'AI mode: API key missing, using local fallback answers.')}
        </div>

        <div className="flex gap-3 mb-4">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setLastInputMode('text');
                handleAsk(question, 'text');
              }
            }}
            placeholder={isHebrew ? 'שאל אותי משהו...' : isRussian ? 'Задай вопрос...' : 'Ask me something...'}
            className="flex-1 bg-white/20 border-2 border-white/30 rounded-2xl px-4 py-3 text-white placeholder:text-white/50 outline-none focus:border-yellow-400 font-bold"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleRecording}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg transition-all ${
              isRecording ? 'bg-red-500 animate-pulse' : 'bg-blue-500 hover:bg-blue-400'
            }`}
            title={isHebrew ? 'שאלה קולית' : isRussian ? 'Голосовой вопрос' : 'Voice question'}
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
                const prompt = isHebrew
                  ? `ספר לי על ${q.label.he}`
                  : isRussian
                  ? `Расскажи про ${q.label.ru}`
                  : `Tell me about ${q.label.en}`;
                setQuestion(prompt);
                setLastInputMode('text');
                handleAsk(prompt, 'text');
              }}
              className="flex flex-col items-center gap-1 p-3 bg-white/10 rounded-2xl border border-white/20 hover:bg-white/30 transition-all min-w-[80px]"
            >
              <span className="text-3xl">{q.emoji}</span>
              <span className="text-[10px] font-black text-white whitespace-nowrap">
                {isHebrew ? q.label.he : isRussian ? q.label.ru : q.label.en}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      <div className="w-full max-w-md text-[11px] text-indigo-100 bg-black/15 rounded-2xl p-3 border border-white/20">
        {isHebrew ? `נשמרו ${sessionQuestionCount} שאלות בסשן הזה. נתונים נשמרים תחת: ${CURIOSITY_LOG_KEY}, ${CURIOSITY_STATS_KEY}` : isRussian ? `В этой сессии сохранено вопросов: ${sessionQuestionCount}. Ключи хранения: ${CURIOSITY_LOG_KEY}, ${CURIOSITY_STATS_KEY}` : `Saved ${sessionQuestionCount} questions in this session. Storage keys: ${CURIOSITY_LOG_KEY}, ${CURIOSITY_STATS_KEY}`}
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
                    <p className="text-blue-900 font-black text-xl text-center animate-pulse">
                      {isHebrew ? 'אני מקשיב... דבר אלי!' : isRussian ? 'Я слушаю... говори!' : 'I am listening... Speak to me!'}
                    </p>
                    <p className="text-gray-400 text-sm font-bold italic text-center px-4">
                      {isHebrew ? '(לחץ על העיגול הכחול כשתסיים לדבר)' : isRussian ? '(Нажми на синий круг, когда закончишь)' : '(Tap the blue circle when finished speaking)'}
                    </p>
                  </div>
                ) : isAsking ? (
                  <div className="flex flex-col items-center justify-center h-full py-10 gap-6">
                    <div className="flex gap-3">
                      <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1, repeat: Infinity }} className="w-4 h-4 bg-indigo-500 rounded-full" />
                      <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} className="w-4 h-4 bg-purple-500 rounded-full" />
                      <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} className="w-4 h-4 bg-pink-500 rounded-full" />
                    </div>
                    <p className="text-indigo-900 font-black italic text-xl text-center">
                      {isHebrew ? 'הארנב בודק וענה לך בעוד רגע...' : isRussian ? 'Кролик проверяет и скоро ответит...' : 'The bunny is checking and will reply soon...'}
                    </p>
                  </div>
                ) : (
                  <div className="prose prose-indigo max-w-none pb-2">
                    {lastInputMode === 'voice' && lastAskedQuestion && (
                      <div className="mb-4 rounded-xl bg-indigo-50 border border-indigo-200 p-3 text-sm">
                        <div className="font-bold text-indigo-700 mb-1">{isHebrew ? 'שאלה שזוהתה מהמיקרופון' : isRussian ? 'Распознанный голосовой вопрос' : 'Recognized voice question'}</div>
                        <div className="text-indigo-900" dir={isHebrew ? 'rtl' : 'ltr'}>{lastAskedQuestion}</div>
                      </div>
                    )}
                    <p className="text-lg sm:text-xl font-bold text-gray-800 leading-relaxed text-center" dir={isHebrew ? 'rtl' : 'ltr'}>{answer}</p>
                    {suggestedNext && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 p-4 bg-indigo-50 rounded-2xl border-2 border-indigo-100 flex flex-col items-center gap-3">
                        <p className="text-indigo-600 font-black text-sm uppercase tracking-wider">{isHebrew ? 'רוצה לדעת עוד?' : isRussian ? 'Хочешь узнать еще?' : 'Want to know more?'}</p>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            const q = isHebrew
                              ? `ספר לי על ${suggestedNext.label.he}`
                              : isRussian
                              ? `Расскажи про ${suggestedNext.label.ru}`
                              : `Tell me about ${suggestedNext.label.en}`;
                            setQuestion(q);
                            setLastInputMode('text');
                            handleAsk(q, 'text');
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-indigo-200 text-indigo-700 font-bold"
                        >
                          <span className="text-2xl">{suggestedNext.emoji}</span>
                          <span>{isHebrew ? suggestedNext.label.he : isRussian ? suggestedNext.label.ru : suggestedNext.label.en}</span>
                        </motion.button>
                      </motion.div>
                    )}
                  </div>
                )}
              </div>

              {!isAsking && !isRecording && (
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-center shrink-0">
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setAnswer(null)} className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black text-lg shadow-lg shadow-indigo-200 w-full">
                    {isHebrew ? 'הבנתי! ✨' : isRussian ? 'Понял! ✨' : 'Got it! ✨'}
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
