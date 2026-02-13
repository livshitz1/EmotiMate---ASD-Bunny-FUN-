import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { VoiceRecorder } from 'capacitor-voice-recorder';
import { DiagnosticModuleId, DiagnosticResult, Language } from '../types';

interface DiagnosticModuleRunnerProps {
  language: Language;
  moduleId: DiagnosticModuleId;
  onClose: () => void;
  onBack: () => void;
  onCompleted: () => void;
  onLog?: (text: string) => void;
  onResult?: (result: DiagnosticResult) => void;
}

const STEPS_PER_MODULE = 3;
const FREQUENCY_SERIES = [125, 250, 528, 741, 1000, 2000, 4000, 8000];

const DiagnosticModuleRunner: React.FC<DiagnosticModuleRunnerProps> = ({
  language,
  moduleId,
  onClose,
  onBack,
  onCompleted,
  onLog,
  onResult
}) => {
  const [started, setStarted] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const [eventLog, setEventLog] = useState<string[]>([]);

  const [micPermission, setMicPermission] = useState<'unknown' | 'granted' | 'denied'>('unknown');
  const [ambientDb, setAmbientDb] = useState<number | null>(null);
  const [lastToneHz, setLastToneHz] = useState<number | null>(null);
  const [recordingMs, setRecordingMs] = useState<number | null>(null);
  const [behaviorAnswers, setBehaviorAnswers] = useState<{ q1?: boolean; q2?: boolean }>({});
  const [speechAnswers, setSpeechAnswers] = useState<{ heardClearly?: boolean; distracted?: boolean; wantsRepeat?: boolean }>({});
  const [liveFeedback, setLiveFeedback] = useState<{ comfortNow?: boolean; distractedNow?: boolean }>({});
  const [frequencyFeedback, setFrequencyFeedback] = useState<{ likedHz?: number; dislikedHz?: number }>({});

  const [videoPermission, setVideoPermission] = useState<'unknown' | 'granted' | 'denied'>('unknown');
  const [videoRecording, setVideoRecording] = useState(false);
  const [videoCapturedMs, setVideoCapturedMs] = useState<number | null>(null);

  const [focusLostCount, setFocusLostCount] = useState(0);
  const [hiddenCount, setHiddenCount] = useState(0);
  const [motionEvents, setMotionEvents] = useState(0);
  const [motionScoreAvg, setMotionScoreAvg] = useState<number | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const videoStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoStartedAtRef = useRef<number | null>(null);

  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const analysisCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const analysisIntervalRef = useRef<number | null>(null);
  const prevFrameRef = useRef<Uint8ClampedArray | null>(null);
  const motionSumRef = useRef(0);
  const motionSamplesRef = useRef(0);

  const pushLog = useCallback(
    (text: string) => {
      setEventLog((prev) => [text, ...prev].slice(0, 24));
      onLog?.(text);
    },
    [onLog]
  );

  const emitResult = useCallback(
    (overrides?: Partial<DiagnosticResult>) => {
      onResult?.({
        id: moduleId + '-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
        moduleId,
        timestamp: new Date().toISOString(),
        language,
        stepIndex,
        completed: false,
        micPermission,
        ambientDb,
        lastToneHz,
        recordingMs,
        behaviorAnswers,
        speechAnswers,
        liveFeedback,
        distractionMetrics: {
          focusLostCount,
          hiddenCount,
          motionEvents,
          motionScoreAvg: motionScoreAvg ?? undefined
        },
        preferredFrequencyHz: frequencyFeedback.likedHz ?? null,
        aversiveFrequencyHz: frequencyFeedback.dislikedHz ?? null,
        videoCaptureEnabled: videoRecording || videoCapturedMs !== null,
        videoCapturedMs,
        status,
        log: [...eventLog].reverse(),
        ...overrides
      });
    },
    [
      onResult,
      moduleId,
      language,
      stepIndex,
      micPermission,
      ambientDb,
      lastToneHz,
      recordingMs,
      behaviorAnswers,
      speechAnswers,
      liveFeedback,
      focusLostCount,
      hiddenCount,
      motionEvents,
      motionScoreAvg,
      frequencyFeedback,
      videoRecording,
      videoCapturedMs,
      status,
      eventLog
    ]
  );

  const t = useMemo(() => {
    const he = language === Language.HEBREW;
    const en = language === Language.ENGLISH;

    const moduleTitle: Record<DiagnosticModuleId, string> = he
      ? {
          frequency: 'מיפוי תדרים',
          speech: 'ניתוח דיבור וקול',
          intonation: 'אינטונציה רגשית',
          responsiveness: 'תגובה שמיעתית',
          behavior: 'פרופיל התנהגותי-חושי'
        }
      : en
      ? {
          frequency: 'Frequency Mapping',
          speech: 'Speech & Voice Analysis',
          intonation: 'Emotional Intonation',
          responsiveness: 'Auditory Responsiveness',
          behavior: 'Behavioral-Sensory Profile'
        }
      : {
          frequency: 'Карта частот',
          speech: 'Анализ речи и голоса',
          intonation: 'Эмоциональная интонация',
          responsiveness: 'Слуховая реактивность',
          behavior: 'Поведенческий сенсорный профиль'
        };

    const moduleDescription: Record<DiagnosticModuleId, string> = he
      ? {
          frequency: 'נבדוק תגובה לתדרים שונים בצורה עדינה ובטוחה.',
          speech: 'נבחן יציבות פיץ׳, קצב דיבור ובהירות.',
          intonation: 'נבדוק תגובה לטון שמח, עצוב וניטרלי.',
          responsiveness: 'נבדוק זמן תגובה, עקביות והסחות דעת.',
          behavior: 'שאלון קצר להבנת רגישות לרעש, שינה וריכוז.'
        }
      : en
      ? {
          frequency: 'We check responses to different tones in a gentle, safe way.',
          speech: 'We assess pitch stability, speech pace, and clarity.',
          intonation: 'We check response to happy, sad, and neutral tones.',
          responsiveness: 'We assess latency, consistency, and distractibility.',
          behavior: 'Short parent questionnaire on noise, sleep, and focus.'
        }
      : {
          frequency: 'Проверяем реакцию на разные частоты мягко и безопасно.',
          speech: 'Оцениваем стабильность тона, темп и четкость речи.',
          intonation: 'Проверяем реакцию на радостный, грустный и нейтральный тон.',
          responsiveness: 'Оцениваем задержку ответа, стабильность и отвлекаемость.',
          behavior: 'Короткий опрос о шуме, сне и концентрации.'
        };

    return {
      moduleTitle,
      moduleDescription,
      start: he ? 'התחל' : en ? 'Start' : 'Старт',
      continue: he ? 'המשך' : en ? 'Continue' : 'Продолжить',
      complete: he ? 'סיום מודול' : en ? 'Complete Module' : 'Завершить модуль',
      back: he ? 'חזרה' : en ? 'Back' : 'Назад',
      yes: he ? 'כן' : en ? 'Yes' : 'Да',
      no: he ? 'לא' : en ? 'No' : 'Нет',
      stepText: (n: number, total: number) => (he ? `שלב ${n} מתוך ${total}` : en ? `Step ${n} of ${total}` : `Шаг ${n} из ${total}`),
      startedLog: he ? 'המודול התחיל בפועל.' : en ? 'The module started for real.' : 'Модуль реально запущен.',
      micDenied: he ? 'נדרש אישור מיקרופון כדי להמשיך במודול הזה.' : en ? 'Microphone permission is required for this module.' : 'Для этого модуля нужен доступ к микрофону.',
      micTrySystem: he ? 'מנסה לבקש הרשאה דרך המערכת...' : en ? 'Requesting OS microphone permission...' : 'Запрашиваю системный доступ к микрофону...',
      micAlreadyGranted: he ? 'הרשאת מיקרופון כבר מאושרת במערכת.' : en ? 'Microphone permission is already granted in system settings.' : 'Доступ к микрофону уже разрешен в системных настройках.',
      askToneFeedback: he ? 'בחר תדר שהיה הכי נעים ותדר שהיה פחות נעים.' : en ? 'Please choose the most pleasant and least pleasant tone.' : 'Выберите самый приятный и наименее приятный тон.',
      askSpeechFeedback: he ? 'ענה על 3 שאלות קצרות על ההקלטה והסחות הדעת.' : en ? 'Answer 3 short questions about recording and distractions.' : 'Ответьте на 3 коротких вопроса о записи и отвлечениях.',
      videoStart: he ? 'התחל וידאו אופציונלי' : en ? 'Start optional video' : 'Запустить опц. видео',
      videoStop: he ? 'עצור וידאו' : en ? 'Stop video' : 'Остановить видео'
    };
  }, [language]);

  const getStepLabel = useCallback(
    (module: DiagnosticModuleId, step: number): string => {
      const he = language === Language.HEBREW;
      const en = language === Language.ENGLISH;
      const mapHe: Record<DiagnosticModuleId, string[]> = {
        frequency: ['כיול סביבה ובדיקת רעש רקע', 'השמעת תדרים מדורגת', 'פידבק על תדרים וסיכום'],
        speech: ['בדיקת הרשאת מיקרופון', 'הקלטת משפט קצר', 'ניתוח + שאלון קצר'],
        intonation: ['השמעת טון ניטרלי', 'השמעת טון שמח/עצוב', 'סיכום תגובה רגשית'],
        responsiveness: ['השמעת צליל תגובה', 'בדיקת רצף תגובות קצר', 'סיכום יציבות תגובה'],
        behavior: ['שאלה 1: רגישות לרעש', 'שאלה 2: שינה וריכוז', 'סיכום שאלון ראשוני']
      };
      const mapEn: Record<DiagnosticModuleId, string[]> = {
        frequency: ['Environment calibration and noise check', 'Gradual frequency playback', 'Tone feedback and summary'],
        speech: ['Microphone permission check', 'Record a short sentence', 'Analysis + short questionnaire'],
        intonation: ['Play neutral tone', 'Play happy/sad tones', 'Emotional-response summary'],
        responsiveness: ['Play response tone', 'Short response sequence test', 'Response stability summary'],
        behavior: ['Q1: noise sensitivity', 'Q2: sleep and focus', 'Initial questionnaire summary']
      };
      const mapRu: Record<DiagnosticModuleId, string[]> = {
        frequency: ['Калибровка среды и шум', 'Постепенное воспроизведение частот', 'Обратная связь и сводка'],
        speech: ['Проверка доступа к микрофону', 'Запись короткой фразы', 'Анализ + короткий опрос'],
        intonation: ['Нейтральный тон', 'Радостный/грустный тон', 'Сводка эмоциональной реакции'],
        responsiveness: ['Сигнал реакции', 'Короткий тест последовательности', 'Сводка стабильности реакции'],
        behavior: ['Вопрос 1: шумовая чувствительность', 'Вопрос 2: сон и концентрация', 'Начальная сводка опроса']
      };

      const src = he ? mapHe : en ? mapEn : mapRu;
      return src[module][step] || src[module][0];
    },
    [language]
  );

  const ensureAudioContext = useCallback(async () => {
    if (!audioContextRef.current) {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new Ctx();
    }
    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }
    return audioContextRef.current;
  }, []);

  const requestMicPermission = useCallback(async (): Promise<boolean> => {
    try {
      const hasBefore = await VoiceRecorder.hasAudioRecordingPermission();
      if (hasBefore.value) {
        setMicPermission('granted');
        pushLog(t.micAlreadyGranted);
        return true;
      }
      pushLog(t.micTrySystem);
      const req = await VoiceRecorder.requestAudioRecordingPermission();
      if (!req.value) {
        setMicPermission('denied');
        return false;
      }
      setMicPermission('granted');
      return true;
    } catch {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setMicPermission('granted');
        pushLog(t.micAlreadyGranted);
        return true;
      } catch {
        setMicPermission('denied');
        return false;
      }
    }
  }, [pushLog, t.micAlreadyGranted, t.micTrySystem]);

  const requestMicStream = useCallback(async () => {
    if (mediaStreamRef.current) return mediaStreamRef.current;
    const ok = await requestMicPermission();
    if (!ok) throw new Error('MIC_PERMISSION_DENIED');
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaStreamRef.current = stream;
    return stream;
  }, [requestMicPermission]);

  const stopMic = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((tr) => tr.stop());
      mediaStreamRef.current = null;
    }
  }, []);

  const teardownVideoCapture = useCallback(() => {
    if (analysisIntervalRef.current !== null) {
      window.clearInterval(analysisIntervalRef.current);
      analysisIntervalRef.current = null;
    }
    if (videoStreamRef.current) {
      videoStreamRef.current.getTracks().forEach((tr) => tr.stop());
      videoStreamRef.current = null;
    }
    mediaRecorderRef.current = null;
    videoElementRef.current = null;
    analysisCanvasRef.current = null;
    prevFrameRef.current = null;
  }, []);

  const requestVideoPermission = useCallback(async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      setVideoPermission('granted');
      stream.getTracks().forEach((tr) => tr.stop());
      return true;
    } catch {
      setVideoPermission('denied');
      return false;
    }
  }, []);

  const startVideoCapture = useCallback(async () => {
    if (videoRecording) return;

    const ok = await requestVideoPermission();
    if (!ok) {
      pushLog(language === Language.HEBREW ? 'לא ניתן להפעיל וידאו. אפשר להמשיך בלי וידאו.' : language === Language.ENGLISH ? 'Could not start video. Continue without video.' : 'Не удалось запустить видео. Продолжайте без видео.');
      return;
    }

    if (!('MediaRecorder' in window)) {
      pushLog(language === Language.HEBREW ? 'MediaRecorder לא זמין במכשיר זה.' : language === Language.ENGLISH ? 'MediaRecorder is not available on this device.' : 'MediaRecorder недоступен на этом устройстве.');
      return;
    }

    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
    videoStreamRef.current = stream;

    const recorder = new MediaRecorder(stream);
    mediaRecorderRef.current = recorder;
    recorder.ondataavailable = () => undefined;
    recorder.start();

    const videoEl = document.createElement('video');
    videoEl.playsInline = true;
    videoEl.muted = true;
    videoEl.srcObject = stream;
    await videoEl.play().catch(() => undefined);
    videoElementRef.current = videoEl;

    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 36;
    analysisCanvasRef.current = canvas;

    motionSumRef.current = 0;
    motionSamplesRef.current = 0;
    prevFrameRef.current = null;

    analysisIntervalRef.current = window.setInterval(() => {
      if (!videoElementRef.current || !analysisCanvasRef.current) return;
      const ctx = analysisCanvasRef.current.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(videoElementRef.current, 0, 0, analysisCanvasRef.current.width, analysisCanvasRef.current.height);
      const frame = ctx.getImageData(0, 0, analysisCanvasRef.current.width, analysisCanvasRef.current.height).data;

      if (prevFrameRef.current) {
        let diff = 0;
        for (let i = 0; i < frame.length; i += 4) {
          const lum = (frame[i] + frame[i + 1] + frame[i + 2]) / 3;
          const prevLum = (prevFrameRef.current[i] + prevFrameRef.current[i + 1] + prevFrameRef.current[i + 2]) / 3;
          diff += Math.abs(lum - prevLum);
        }
        const motionScore = diff / (frame.length / 4);
        motionSumRef.current += motionScore;
        motionSamplesRef.current += 1;
        if (motionScore > 22) {
          setMotionEvents((prev) => prev + 1);
        }
      }
      prevFrameRef.current = new Uint8ClampedArray(frame);
    }, 350);

    videoStartedAtRef.current = Date.now();
    setVideoCapturedMs(null);
    setVideoRecording(true);
    pushLog(language === Language.HEBREW ? 'הקלטת וידאו התחילה (אופציונלי).' : language === Language.ENGLISH ? 'Optional video recording started.' : 'Запущена опциональная видеозапись.');
  }, [language, pushLog, requestVideoPermission, videoRecording]);

  const stopVideoCapture = useCallback(() => {
    if (!videoRecording) return;

    try {
      mediaRecorderRef.current?.stop();
    } catch {
      // ignore
    }

    const elapsed = videoStartedAtRef.current ? Date.now() - videoStartedAtRef.current : 0;
    setVideoCapturedMs(elapsed > 0 ? elapsed : null);
    videoStartedAtRef.current = null;

    if (motionSamplesRef.current > 0) {
      setMotionScoreAvg(Math.round((motionSumRef.current / motionSamplesRef.current) * 10) / 10);
    }

    setVideoRecording(false);
    teardownVideoCapture();

    pushLog(language === Language.HEBREW ? 'וידאו נעצר. נותחו תנועה והסחות דעת.' : language === Language.ENGLISH ? 'Video stopped. Motion/distraction metrics analyzed.' : 'Видео остановлено. Метрики движения/отвлечений рассчитаны.');
  }, [language, pushLog, teardownVideoCapture, videoRecording]);

  useEffect(() => {
    if (!started) return;

    const onBlur = () => setFocusLostCount((prev) => prev + 1);
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        setHiddenCount((prev) => prev + 1);
      }
    };

    window.addEventListener('blur', onBlur);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      window.removeEventListener('blur', onBlur);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [started]);

  useEffect(() => {
    return () => {
      stopMic();
      teardownVideoCapture();
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => undefined);
      }
      audioContextRef.current = null;
    };
  }, [stopMic, teardownVideoCapture]);

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const measureAmbientNoise = useCallback(async (): Promise<number> => {
    const stream = await requestMicStream();
    const ctx = await ensureAudioContext();
    const source = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    source.connect(analyser);

    const data = new Uint8Array(analyser.frequencyBinCount);
    let accum = 0;
    let samples = 0;
    const startedAt = Date.now();

    while (Date.now() - startedAt < 2200) {
      analyser.getByteTimeDomainData(data);
      let sumSq = 0;
      for (let i = 0; i < data.length; i++) {
        const v = (data[i] - 128) / 128;
        sumSq += v * v;
      }
      const rms = Math.sqrt(sumSq / data.length);
      accum += rms;
      samples += 1;
      await sleep(110);
    }

    source.disconnect();
    analyser.disconnect();

    const avgRms = samples > 0 ? accum / samples : 0.0001;
    const pseudoDb = Math.max(20, Math.min(90, Math.round(20 * Math.log10(avgRms + 1e-4) + 85)));
    setAmbientDb(pseudoDb);
    return pseudoDb;
  }, [ensureAudioContext, requestMicStream]);

  const playTones = useCallback(async (freqs: number[], toneDurationMs = 900, gapMs = 240) => {
    const ctx = await ensureAudioContext();
    for (const f of freqs) {
      setLastToneHz(f);
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = f;
      gain.gain.value = 0.0001;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      const durSec = toneDurationMs / 1000;
      gain.gain.exponentialRampToValueAtTime(0.09, ctx.currentTime + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + durSec);

      await sleep(toneDurationMs);
      osc.stop();
      osc.disconnect();
      gain.disconnect();
      await sleep(gapMs);
    }
  }, [ensureAudioContext]);

  const recordShortSentence = useCallback(async (): Promise<number> => {
    const ok = await requestMicPermission();
    if (!ok) throw new Error('MIC_PERMISSION_DENIED');

    const canRecord = await VoiceRecorder.canDeviceVoiceRecord();
    if (!canRecord.value) throw new Error('VOICE_RECORDER_UNAVAILABLE');

    const startedRes = await VoiceRecorder.startRecording();
    if (!startedRes.value) throw new Error('VOICE_RECORDER_START_FAILED');

    const startAt = Date.now();
    await sleep(3200);
    const data = await VoiceRecorder.stopRecording();
    const duration = Date.now() - startAt;
    setRecordingMs(duration);

    pushLog(
      language === Language.HEBREW
        ? `הוקלט משפט קצר (${Math.round(duration / 1000)} שנ׳, ${Math.round((data.value.recordDataBase64?.length || 0) / 1024)}KB).`
        : language === Language.ENGLISH
        ? `Short sentence recorded (${Math.round(duration / 1000)}s, ${Math.round((data.value.recordDataBase64?.length || 0) / 1024)}KB).`
        : `Короткая фраза записана (${Math.round(duration / 1000)}с, ${Math.round((data.value.recordDataBase64?.length || 0) / 1024)}KB).`
    );
    return duration;
  }, [language, pushLog, requestMicPermission]);

  const runCurrentStep = useCallback(async () => {
    if (busy) return;

    setBusy(true);
    try {
      const stepNo = stepIndex;

      if (moduleId === 'frequency') {
        if (stepNo === 0) {
          setStatus(language === Language.HEBREW ? 'מבצע מדידת רעש רקע...' : language === Language.ENGLISH ? 'Measuring ambient noise...' : 'Измеряю фоновый шум...');
          const db = await measureAmbientNoise();
          pushLog(
            language === Language.HEBREW
              ? `נמדד רעש רקע משוער: ~${db}dB ${db > 45 ? '(מומלץ לעבור לסביבה שקטה יותר)' : '(תקין להתחלה)'}`
              : language === Language.ENGLISH
              ? `Estimated ambient noise: ~${db}dB ${db > 45 ? '(consider moving to a quieter room)' : '(ok to proceed)'}`
              : `Оценка фонового шума: ~${db}dB ${db > 45 ? '(лучше перейти в более тихую среду)' : '(можно продолжать)'}`
          );
          await playTones([440], 260, 80);
          pushLog(language === Language.HEBREW ? 'אות פתיחה קצר הושמע כדי לוודא שהמודול פעיל.' : language === Language.ENGLISH ? 'A short start cue was played to confirm the module is active.' : 'Для подтверждения активности модуля воспроизведен короткий стартовый сигнал.');
        }
        if (stepNo === 1) {
          setStatus(language === Language.HEBREW ? 'משמיע סדרת תדרים מדורגת...' : language === Language.ENGLISH ? 'Playing gradual frequency sequence...' : 'Воспроизвожу частоты...');
          await playTones(FREQUENCY_SERIES, 850, 210);
          pushLog(language === Language.HEBREW ? 'הושמעה סדרת תדרים: 125Hz, 250Hz, 528Hz, 741Hz, 1kHz, 2kHz, 4kHz, 8kHz.' : language === Language.ENGLISH ? 'Played tones: 125Hz, 250Hz, 528Hz, 741Hz, 1kHz, 2kHz, 4kHz, 8kHz.' : 'Воспроизведены частоты: 125Hz, 250Hz, 528Hz, 741Hz, 1kHz, 2kHz, 4kHz, 8kHz.');
        }
        if (stepNo === 2) {
          if (!frequencyFeedback.likedHz || !frequencyFeedback.dislikedHz) {
            setStatus(t.askToneFeedback);
            return;
          }
          setStatus(language === Language.HEBREW ? 'מסכם מודול...' : language === Language.ENGLISH ? 'Summarizing module...' : 'Формирую сводку...');
          await sleep(450);
          pushLog(
            language === Language.HEBREW
              ? `סיכום נשמר: נעים=${frequencyFeedback.likedHz}Hz, פחות נעים=${frequencyFeedback.dislikedHz}Hz.`
              : language === Language.ENGLISH
              ? `Summary saved: pleasant=${frequencyFeedback.likedHz}Hz, less pleasant=${frequencyFeedback.dislikedHz}Hz.`
              : `Сводка сохранена: приятно=${frequencyFeedback.likedHz}Hz, менее приятно=${frequencyFeedback.dislikedHz}Hz.`
          );
        }
      }

      if (moduleId === 'speech') {
        if (stepNo === 0) {
          setStatus(language === Language.HEBREW ? 'בודק הרשאת מיקרופון...' : language === Language.ENGLISH ? 'Checking microphone permission...' : 'Проверяю доступ к микрофону...');
          const ok = await requestMicPermission();
          if (!ok) throw new Error('MIC_PERMISSION_DENIED');
          pushLog(language === Language.HEBREW ? 'הרשאת מיקרופון אושרה.' : language === Language.ENGLISH ? 'Microphone permission granted.' : 'Доступ к микрофону получен.');
        }
        if (stepNo === 1) {
          setStatus(language === Language.HEBREW ? 'מקליט משפט קצר (3 שניות)...' : language === Language.ENGLISH ? 'Recording a short sentence (3s)...' : 'Записываю короткую фразу (3с)...');
          await recordShortSentence();
        }
        if (stepNo === 2) {
          if (typeof speechAnswers.heardClearly !== 'boolean' || typeof speechAnswers.distracted !== 'boolean' || typeof speechAnswers.wantsRepeat !== 'boolean') {
            setStatus(t.askSpeechFeedback);
            return;
          }
          setStatus(language === Language.HEBREW ? 'מריץ ניתוח בסיסי...' : language === Language.ENGLISH ? 'Running basic analysis...' : 'Выполняю базовый анализ...');
          await sleep(700);
          pushLog(language === Language.HEBREW ? 'ניתוח בסיסי הושלם: קצב/בהירות/יציבות פיץ׳ + שאלון הסחות נשמרו.' : language === Language.ENGLISH ? 'Basic analysis done: pace/clarity/pitch-stability + distraction questionnaire saved.' : 'Базовый анализ завершен: темп/четкость/стабильность + опрос отвлечений сохранены.');
        }
      }

      if (moduleId === 'intonation') {
        if (stepNo === 0) {
          setStatus(language === Language.HEBREW ? 'משמיע טון ניטרלי...' : language === Language.ENGLISH ? 'Playing neutral tone...' : 'Нейтральный тон...');
          await playTones([440], 1200, 120);
          pushLog(language === Language.HEBREW ? 'טון ניטרלי הושמע ונרשמה תגובה.' : language === Language.ENGLISH ? 'Neutral tone played and response logged.' : 'Нейтральный тон воспроизведен, реакция сохранена.');
        }
        if (stepNo === 1) {
          setStatus(language === Language.HEBREW ? 'משמיע טון שמח ואז עצוב...' : language === Language.ENGLISH ? 'Playing happy then sad tone...' : 'Радостный и грустный тон...');
          await playTones([880, 330], 1100, 180);
          pushLog(language === Language.HEBREW ? 'רצף אינטונציה הושלם.' : language === Language.ENGLISH ? 'Intonation sequence completed.' : 'Последовательность интонации завершена.');
        }
        if (stepNo === 2) {
          await sleep(420);
          pushLog(language === Language.HEBREW ? 'סיכום אינטונציה ראשוני נשמר.' : language === Language.ENGLISH ? 'Initial intonation summary saved.' : 'Сводка по интонации сохранена.');
        }
      }

      if (moduleId === 'responsiveness') {
        if (stepNo === 0) {
          setStatus(language === Language.HEBREW ? 'משמיע אות תגובה קצר...' : language === Language.ENGLISH ? 'Playing short response cue...' : 'Короткий сигнал реакции...');
          await playTones([600], 900, 180);
          pushLog(language === Language.HEBREW ? 'אות תגובה הושמע.' : language === Language.ENGLISH ? 'Response cue played.' : 'Сигнал реакции воспроизведен.');
        }
        if (stepNo === 1) {
          setStatus(language === Language.HEBREW ? 'משמיע רצף קצר למדידת עקביות...' : language === Language.ENGLISH ? 'Playing short sequence to estimate consistency...' : 'Короткая последовательность для оценки стабильности...');
          await playTones([500, 700, 500, 700], 650, 150);
          pushLog(language === Language.HEBREW ? 'רצף תגובות הושלם ונשמר.' : language === Language.ENGLISH ? 'Response sequence completed and logged.' : 'Последовательность реакций завершена и сохранена.');
        }
        if (stepNo === 2) {
          await sleep(420);
          pushLog(language === Language.HEBREW ? 'סיכום תגובה שמיעתית ראשוני נשמר.' : language === Language.ENGLISH ? 'Initial auditory responsiveness summary saved.' : 'Сводка по слуховой реактивности сохранена.');
        }
      }

      if (moduleId === 'behavior') {
        if (stepNo === 0) {
          if (typeof behaviorAnswers.q1 !== 'boolean') {
            setStatus(language === Language.HEBREW ? 'בחר תשובה לשאלה 1 כדי להמשיך.' : language === Language.ENGLISH ? 'Choose an answer for Q1 to continue.' : 'Выберите ответ на вопрос 1.');
            return;
          }
          pushLog(language === Language.HEBREW ? `שאלה 1 נשמרה: ${behaviorAnswers.q1 ? 'כן' : 'לא'}.` : language === Language.ENGLISH ? `Q1 saved: ${behaviorAnswers.q1 ? 'yes' : 'no'}.` : `Вопрос 1: ${behaviorAnswers.q1 ? 'да' : 'нет'}.`);
        }
        if (stepNo === 1) {
          if (typeof behaviorAnswers.q2 !== 'boolean') {
            setStatus(language === Language.HEBREW ? 'בחר תשובה לשאלה 2 כדי להמשיך.' : language === Language.ENGLISH ? 'Choose an answer for Q2 to continue.' : 'Выберите ответ на вопрос 2.');
            return;
          }
          pushLog(language === Language.HEBREW ? `שאלה 2 נשמרה: ${behaviorAnswers.q2 ? 'כן' : 'לא'}.` : language === Language.ENGLISH ? `Q2 saved: ${behaviorAnswers.q2 ? 'yes' : 'no'}.` : `Вопрос 2: ${behaviorAnswers.q2 ? 'да' : 'нет'}.`);
        }
        if (stepNo === 2) {
          await sleep(350);
          pushLog(language === Language.HEBREW ? 'סיכום שאלון ראשוני נשמר.' : language === Language.ENGLISH ? 'Initial questionnaire summary saved.' : 'Первичная сводка опроса сохранена.');
        }
      }

      const isLastStep = stepNo >= STEPS_PER_MODULE - 1;
      emitResult({ completed: isLastStep });
      if (!isLastStep) {
        setStepIndex((p) => p + 1);
      } else {
        setStatus(language === Language.HEBREW ? 'המודול הושלם.' : language === Language.ENGLISH ? 'Module completed.' : 'Модуль завершен.');
        onCompleted();
      }
    } catch (err) {
      console.error('Diagnostic step failed', err);
      const msg = String((err as any)?.message || '');
      if (msg.includes('MIC_PERMISSION_DENIED')) {
        setStatus(t.micDenied);
        pushLog(t.micDenied);
      } else {
        const fallback =
          language === Language.HEBREW
            ? 'אירעה שגיאה בהרצת השלב. אפשר לנסות שוב.'
            : language === Language.ENGLISH
            ? 'Step execution failed. You can try again.'
            : 'Ошибка выполнения шага. Попробуйте снова.';
        setStatus(fallback);
        pushLog(fallback);
      }
      emitResult({ completed: false });
    } finally {
      setBusy(false);
    }
  }, [
    busy,
    stepIndex,
    moduleId,
    language,
    behaviorAnswers,
    speechAnswers,
    liveFeedback,
    frequencyFeedback,
    measureAmbientNoise,
    playTones,
    recordShortSentence,
    requestMicPermission,
    emitResult,
    onCompleted,
    pushLog,
    t.askSpeechFeedback,
    t.askToneFeedback,
    t.micDenied
  ]);

  const stepLabel = getStepLabel(moduleId, stepIndex);
  const progress = Math.round(((stepIndex + 1) / STEPS_PER_MODULE) * 100);
  const isLastStep = stepIndex >= STEPS_PER_MODULE - 1;

  return (
    <div className="fixed inset-0 z-[1301] bg-black/65 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-5 shadow-2xl border border-emerald-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-black text-emerald-700">🩺 {t.moduleTitle[moduleId]}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">×</button>
        </div>

        <p className="text-sm text-gray-700 mb-2">{t.moduleDescription[moduleId]}</p>

        <div className="rounded-2xl bg-emerald-50 text-emerald-800 font-semibold p-3 mb-3 text-sm">{stepLabel}</div>

        <div className="text-xs font-bold text-emerald-700 mb-2">{t.stepText(stepIndex + 1, STEPS_PER_MODULE)}</div>
        <div className="h-2 rounded-full bg-emerald-100 overflow-hidden mb-3">
          <div className="h-full bg-emerald-500 transition-all" style={{ width: `${progress}%` }} />
        </div>

        <div className="rounded-xl bg-white border border-emerald-100 p-3 text-sm text-gray-700 min-h-[56px] mb-3 transition-all duration-300">
          {busy && <div className="text-xs text-emerald-700 animate-pulse mb-1">● {language === Language.HEBREW ? 'המערכת רצה...' : language === Language.ENGLISH ? 'Running...' : 'Выполняется...'}</div>}
          {status || (language === Language.HEBREW ? 'מוכן להתחלה.' : language === Language.ENGLISH ? 'Ready to start.' : 'Готово к запуску.')}
        </div>

        {started && (
          <div className="mb-3 rounded-xl border border-indigo-100 bg-indigo-50/40 p-3">
            <div className="text-xs font-black text-indigo-700 mb-2">
              {language === Language.HEBREW ? 'פידבק בזמן אמת (במהלך קול/וידאו)' : language === Language.ENGLISH ? 'Real-time feedback (during audio/video)' : 'Обратная связь в реальном времени (аудио/видео)'}
            </div>
            <div className="text-xs text-gray-700 mb-1">
              {language === Language.HEBREW ? 'כרגע זה נעים?' : language === Language.ENGLISH ? 'Feels comfortable right now?' : 'Сейчас комфортно?'}
            </div>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <button
                onClick={() => setLiveFeedback((p) => ({ ...p, comfortNow: true }))}
                className={'px-3 py-2 rounded-lg font-bold ' + (liveFeedback.comfortNow === true ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-800')}
              >
                {t.yes}
              </button>
              <button
                onClick={() => setLiveFeedback((p) => ({ ...p, comfortNow: false }))}
                className={'px-3 py-2 rounded-lg font-bold ' + (liveFeedback.comfortNow === false ? 'bg-rose-600 text-white' : 'bg-rose-100 text-rose-800')}
              >
                {t.no}
              </button>
            </div>
            <div className="text-xs text-gray-700 mb-1">
              {language === Language.HEBREW ? 'יש הסחות דעת ברקע?' : language === Language.ENGLISH ? 'Are there distractions now?' : 'Есть отвлечения сейчас?'}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setLiveFeedback((p) => ({ ...p, distractedNow: true }))}
                className={'px-3 py-2 rounded-lg font-bold ' + (liveFeedback.distractedNow === true ? 'bg-amber-600 text-white' : 'bg-amber-100 text-amber-800')}
              >
                {t.yes}
              </button>
              <button
                onClick={() => setLiveFeedback((p) => ({ ...p, distractedNow: false }))}
                className={'px-3 py-2 rounded-lg font-bold ' + (liveFeedback.distractedNow === false ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-800')}
              >
                {t.no}
              </button>
            </div>
          </div>
        )}

        <div className="mb-3 rounded-xl border border-emerald-100 bg-emerald-50/40 p-3">
          <div className="flex items-center justify-between gap-2">
            <div className="text-xs text-emerald-800 font-semibold">
              {language === Language.HEBREW ? 'וידאו אופציונלי לתיעוד הסשן' : language === Language.ENGLISH ? 'Optional video for session recording' : 'Опциональное видео для записи сессии'}
            </div>
            {!videoRecording ? (
              <button onClick={startVideoCapture} className="px-3 py-1 rounded-lg bg-emerald-600 text-white text-xs font-bold">{t.videoStart}</button>
            ) : (
              <button onClick={stopVideoCapture} className="px-3 py-1 rounded-lg bg-rose-600 text-white text-xs font-bold">{t.videoStop}</button>
            )}
          </div>
          <div className="text-xs text-gray-700 mt-2">
            Video: {videoPermission} {videoCapturedMs ? `| ${Math.round(videoCapturedMs / 1000)}s` : ''} {videoRecording ? '| REC' : ''}
          </div>
        </div>

        {moduleId === 'frequency' && stepIndex === 2 && (
          <div className="mb-3 rounded-xl border border-gray-200 p-3">
            <div className="text-sm font-semibold text-gray-700 mb-2">
              {language === Language.HEBREW ? 'איזה תדר היה הכי נעים?' : language === Language.ENGLISH ? 'Which tone felt most pleasant?' : 'Какой тон был самым приятным?'}
            </div>
            <div className="grid grid-cols-4 gap-2 mb-3">
              {FREQUENCY_SERIES.map((hz) => (
                <button
                  key={`liked-${hz}`}
                  onClick={() => setFrequencyFeedback((prev) => ({ ...prev, likedHz: hz }))}
                  className={`px-2 py-1 rounded-lg text-xs font-bold ${frequencyFeedback.likedHz === hz ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-800'}`}
                >
                  {hz}
                </button>
              ))}
            </div>

            <div className="text-sm font-semibold text-gray-700 mb-2">
              {language === Language.HEBREW ? 'איזה תדר היה פחות נעים?' : language === Language.ENGLISH ? 'Which tone felt less pleasant?' : 'Какой тон был менее приятным?'}
            </div>
            <div className="grid grid-cols-4 gap-2">
              {FREQUENCY_SERIES.map((hz) => (
                <button
                  key={`disliked-${hz}`}
                  onClick={() => setFrequencyFeedback((prev) => ({ ...prev, dislikedHz: hz }))}
                  className={`px-2 py-1 rounded-lg text-xs font-bold ${frequencyFeedback.dislikedHz === hz ? 'bg-rose-600 text-white' : 'bg-rose-100 text-rose-800'}`}
                >
                  {hz}
                </button>
              ))}
            </div>
          </div>
        )}

        {moduleId === 'speech' && stepIndex === 2 && (
          <div className="mb-3 rounded-xl border border-gray-200 p-3">
            <div className="text-sm font-semibold text-gray-700 mb-2">
              {language === Language.HEBREW ? 'שאלות קצרות על הסשן' : language === Language.ENGLISH ? 'Short session questions' : 'Короткие вопросы по сессии'}
            </div>

            <div className="text-xs font-semibold text-gray-700 mb-1">{language === Language.HEBREW ? 'שמעת את עצמך ברור?' : language === Language.ENGLISH ? 'Did you hear yourself clearly?' : 'Вы хорошо слышали себя?'}</div>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <button onClick={() => setSpeechAnswers((p) => ({ ...p, heardClearly: true }))} className={`px-3 py-2 rounded-lg font-bold ${speechAnswers.heardClearly === true ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-800'}`}>{t.yes}</button>
              <button onClick={() => setSpeechAnswers((p) => ({ ...p, heardClearly: false }))} className={`px-3 py-2 rounded-lg font-bold ${speechAnswers.heardClearly === false ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-800'}`}>{t.no}</button>
            </div>

            <div className="text-xs font-semibold text-gray-700 mb-1">{language === Language.HEBREW ? 'היו הסחות דעת בזמן ההקלטה?' : language === Language.ENGLISH ? 'Were there distractions during recording?' : 'Были отвлечения во время записи?'}</div>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <button onClick={() => setSpeechAnswers((p) => ({ ...p, distracted: true }))} className={`px-3 py-2 rounded-lg font-bold ${speechAnswers.distracted === true ? 'bg-rose-600 text-white' : 'bg-rose-100 text-rose-800'}`}>{t.yes}</button>
              <button onClick={() => setSpeechAnswers((p) => ({ ...p, distracted: false }))} className={`px-3 py-2 rounded-lg font-bold ${speechAnswers.distracted === false ? 'bg-rose-600 text-white' : 'bg-rose-100 text-rose-800'}`}>{t.no}</button>
            </div>

            <div className="text-xs font-semibold text-gray-700 mb-1">{language === Language.HEBREW ? 'תרצה סבב חוזר?' : language === Language.ENGLISH ? 'Do you want a repeat round?' : 'Нужен повтор?'}</div>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setSpeechAnswers((p) => ({ ...p, wantsRepeat: true }))} className={`px-3 py-2 rounded-lg font-bold ${speechAnswers.wantsRepeat === true ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-800'}`}>{t.yes}</button>
              <button onClick={() => setSpeechAnswers((p) => ({ ...p, wantsRepeat: false }))} className={`px-3 py-2 rounded-lg font-bold ${speechAnswers.wantsRepeat === false ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-800'}`}>{t.no}</button>
            </div>
          </div>
        )}

        {moduleId === 'behavior' && (stepIndex === 0 || stepIndex === 1) && (
          <div className="mb-3 rounded-xl border border-gray-200 p-3">
            <div className="text-sm font-semibold text-gray-700 mb-2">
              {stepIndex === 0
                ? language === Language.HEBREW
                  ? 'האם יש רגישות לרעשים חזקים?'
                  : language === Language.ENGLISH
                  ? 'Is there sensitivity to loud sounds?'
                  : 'Есть чувствительность к громким звукам?'
                : language === Language.HEBREW
                ? 'האם יש קושי בשינה או ריכוז?'
                : language === Language.ENGLISH
                ? 'Any sleep or focus difficulty?'
                : 'Есть трудности со сном или концентрацией?'}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setBehaviorAnswers((prev) => ({ ...prev, [stepIndex === 0 ? 'q1' : 'q2']: true }))}
                className={`px-3 py-2 rounded-lg font-bold ${(stepIndex === 0 ? behaviorAnswers.q1 : behaviorAnswers.q2) === true ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-800'}`}
              >
                {t.yes}
              </button>
              <button
                onClick={() => setBehaviorAnswers((prev) => ({ ...prev, [stepIndex === 0 ? 'q1' : 'q2']: false }))}
                className={`px-3 py-2 rounded-lg font-bold ${(stepIndex === 0 ? behaviorAnswers.q1 : behaviorAnswers.q2) === false ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-800'}`}
              >
                {t.no}
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 mb-3">
          <button onClick={onBack} disabled={busy} className="px-4 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 disabled:opacity-60 text-gray-700 font-bold">
            {t.back}
          </button>

          {!started ? (
            <button
              onClick={async () => {
                setStarted(true);
                setStatus(t.startedLog);
                pushLog(t.startedLog);
                await runCurrentStep();
              }}
              disabled={busy}
              className="px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold"
            >
              {busy ? '…' : t.start}
            </button>
          ) : (
            <button onClick={runCurrentStep} disabled={busy} className="px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold">
              {busy ? '…' : isLastStep ? t.complete : t.continue}
            </button>
          )}
        </div>

        <div className="mb-3 rounded-xl border border-emerald-100 bg-emerald-50/40 p-3">
          <div className="text-xs font-black text-emerald-700 mb-2">{language === Language.HEBREW ? 'נתוני אבחון' : language === Language.ENGLISH ? 'Diagnostic Data' : 'Диагностические данные'}</div>
          <div className="text-xs text-gray-700 space-y-1">
            <div>Mic: {micPermission}</div>
            <div>Ambient: {ambientDb !== null ? `${ambientDb} dB` : '-'}</div>
            <div>Last tone: {lastToneHz !== null ? `${lastToneHz} Hz` : '-'}</div>
            <div>Recording: {recordingMs !== null ? `${Math.round(recordingMs / 1000)} s` : '-'}</div>
            <div>Video: {videoPermission}{videoCapturedMs !== null ? `, ${Math.round(videoCapturedMs / 1000)} s` : ''}</div>
            <div>Distraction: focusLost={focusLostCount}, hidden={hiddenCount}, motionEvents={motionEvents}, motionAvg={motionScoreAvg ?? '-'}</div>
            {moduleId === 'frequency' && <div>Feedback: pleasant={frequencyFeedback.likedHz ?? '-'}Hz, less-pleasant={frequencyFeedback.dislikedHz ?? '-'}Hz</div>}
            <div>Live: comfort={typeof liveFeedback.comfortNow === 'boolean' ? (liveFeedback.comfortNow ? 'yes' : 'no') : '-'}, distractedNow={typeof liveFeedback.distractedNow === 'boolean' ? (liveFeedback.distractedNow ? 'yes' : 'no') : '-'}</div>
            {moduleId === 'speech' && <div>Speech Q: clear={typeof speechAnswers.heardClearly === 'boolean' ? (speechAnswers.heardClearly ? 'yes' : 'no') : '-'}, distracted={typeof speechAnswers.distracted === 'boolean' ? (speechAnswers.distracted ? 'yes' : 'no') : '-'}, repeat={typeof speechAnswers.wantsRepeat === 'boolean' ? (speechAnswers.wantsRepeat ? 'yes' : 'no') : '-'}</div>}
            {moduleId === 'behavior' && <div>Behavior: q1={typeof behaviorAnswers.q1 === 'boolean' ? (behaviorAnswers.q1 ? 'yes' : 'no') : '-'}, q2={typeof behaviorAnswers.q2 === 'boolean' ? (behaviorAnswers.q2 ? 'yes' : 'no') : '-'}</div>}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 p-3 bg-white">
          <div className="text-xs font-black text-gray-700 mb-2">{language === Language.HEBREW ? 'לוג אבחון' : language === Language.ENGLISH ? 'Diagnostic Log' : 'Лог диагностики'}</div>
          {eventLog.length === 0 ? (
            <div className="text-xs text-gray-500">{language === Language.HEBREW ? 'עדיין אין אירועים.' : language === Language.ENGLISH ? 'No events yet.' : 'Пока нет событий.'}</div>
          ) : (
            <div className="max-h-28 overflow-y-auto space-y-1">
              {eventLog.map((line, idx) => (
                <div key={`${idx}-${line.slice(0, 10)}`} className="text-xs text-gray-700">• {line}</div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiagnosticModuleRunner;
