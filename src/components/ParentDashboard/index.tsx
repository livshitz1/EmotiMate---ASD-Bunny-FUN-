import React, { useMemo, useState, useEffect } from 'react';
import { Share } from '@capacitor/share';
import { VoiceRecorder, RecordingData, GenericResponse } from 'capacitor-voice-recorder';
import { Language, CalmLog, DiagnosticResult } from '../../types';
import { translate } from '../../i18n/translations';
import WeeklyProgress from './WeeklyProgress';

interface ParentDashboardProps {
  language: Language;
  onClose: () => void;
  weeklyStats?: Record<string, number>;
  bunnyMessage?: string;
  onMissionSet?: (goal: string) => void;
  onOpenWeeklyAlbum?: () => void;
  diagnosticResults?: DiagnosticResult[];
}

const ParentDashboard: React.FC<ParentDashboardProps> = ({ language, onClose, weeklyStats, bunnyMessage, onMissionSet, onOpenWeeklyAlbum, diagnosticResults = [] }) => {
  const isHebrew = language === 'he';
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<string | null>(null);
  const [schoolLat, setSchoolLat] = useState<string>(localStorage.getItem('school_lat') || '');
  const [schoolLng, setSchoolLng] = useState<string>(localStorage.getItem('school_lng') || '');
  const [homeLat, setHomeLat] = useState<string>(localStorage.getItem('home_lat') || '');
  const [homeLng, setHomeLng] = useState<string>(localStorage.getItem('home_lng') || '');
  const [selectedKissMessage, setSelectedKissMessage] = useState<string>('kiss');
  const [grandPrize, setGrandPrize] = useState<string>(localStorage.getItem('emotimate_grand_prize') || '');
  const [softFabricsOnly, setSoftFabricsOnly] = useState<boolean>(() => {
    return localStorage.getItem('emotimate_soft_fabrics_only') === 'true';
  });
  const [collaborativeGoal, setCollaborativeGoal] = useState<string>(() => {
    const saved = localStorage.getItem('current_collaborative_goal');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.text || '';
      } catch (e) { return ''; }
    }
    return '';
  });
  const [targetValue, setTargetValue] = useState<number>(() => {
    const saved = localStorage.getItem('current_collaborative_goal');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return typeof parsed.target === 'number' ? parsed.target : 3;
      } catch (e) { return 3; }
    }
    return 3;
  });

  useEffect(() => {
    // Request permission on mount
    VoiceRecorder.requestAudioRecordingPermission();
    
    // Load existing voice note
    const saved = localStorage.getItem('parent_voice_note');
    if (saved) setRecordedAudio(saved);
  }, []);

  const startRecording = async () => {
    try {
      const result = await VoiceRecorder.startRecording();
      if (result.value) setIsRecording(true);
    } catch (e) {
      console.error("Recording failed to start", e);
    }
  };

  const stopRecording = async () => {
    try {
      const result = await VoiceRecorder.stopRecording();
      if (result.value && result.value.recordDataBase64) {
        const base64 = result.value.recordDataBase64;
        setRecordedAudio(base64);
        localStorage.setItem('parent_voice_note', base64);
        setIsRecording(false);
      }
    } catch (e) {
      console.error("Recording failed to stop", e);
      setIsRecording(false);
    }
  };

  const playPreview = () => {
    if (!recordedAudio) return;
    // Parent voice notes are kept, but we log the attempt per silence policy
    console.log("Playing recorded parent voice note...");
    const audio = new Audio(`data:audio/aac;base64,${recordedAudio}`);
    audio.play();
  };

  const handleSaveLocation = () => {
    localStorage.setItem('school_lat', schoolLat);
    localStorage.setItem('school_lng', schoolLng);
    localStorage.setItem('home_lat', homeLat);
    localStorage.setItem('home_lng', homeLng);
    alert(isHebrew ? 'המיקומים נשמרו!' : 'Locations saved!');
  };

  const handleSendKiss = () => {
    const kissData = {
      type: selectedKissMessage,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('emotimate_last_kiss_sent', JSON.stringify(kissData));
    alert(isHebrew ? 'הנשיקה נשלחה בהצלחה! ❤️' : 'Kiss sent successfully! ❤️');
  };

  const handleSaveGrandPrize = () => {
    localStorage.setItem('emotimate_grand_prize', grandPrize);
    alert(isHebrew ? 'הפרס הגדול נשמר!' : 'Grand prize saved!');
  };

  const toggleSoftFabrics = () => {
    const newValue = !softFabricsOnly;
    setSoftFabricsOnly(newValue);
    localStorage.setItem('emotimate_soft_fabrics_only', String(newValue));
  };

  const handleSaveMission = () => {
    const goal = {
      text: collaborativeGoal,
      target: targetValue,
      current: 0, // Reset progress when new mission is set
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('current_collaborative_goal', JSON.stringify(goal));
    if (onMissionSet) onMissionSet(collaborativeGoal);
    alert(isHebrew ? 'המשימה המיוחדת נשמרה!' : 'Special mission saved!');
  };

  const logs: CalmLog[] = useMemo(() => {
    try {
      const saved = localStorage.getItem('calm_logs');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  }, []);

  const curiositySummary = useMemo(() => {
    try {
      const statsRaw = localStorage.getItem('emotimate_curiosity_stats');
      const logsRaw = localStorage.getItem('emotimate_curiosity_logs');
      const stats = statsRaw ? JSON.parse(statsRaw) : null;
      const logs = logsRaw ? JSON.parse(logsRaw) : [];
      return {
        totalQuestions: Number(stats?.totalQuestions || logs.length || 0),
        voiceQuestions: Number(stats?.voiceQuestions || 0),
        textQuestions: Number(stats?.textQuestions || 0),
        uniqueTopics: Number(stats?.uniqueTopics || 0),
        avgAnswerLength: Number(stats?.avgAnswerLength || 0),
        lastQuestionText: (stats?.lastQuestionText || logs?.[0]?.question || ''),
        recent: Array.isArray(logs) ? logs.slice(0, 5) : []
      };
    } catch {
      return {
        totalQuestions: 0,
        voiceQuestions: 0,
        textQuestions: 0,
        uniqueTopics: 0,
        avgAnswerLength: 0,
        lastQuestionText: '',
        recent: []
      };
    }
  }, []);

  const hasAnyData = (statsValue: unknown, diagnosticsCount: number, curiosityCount: number) => Boolean(statsValue) || diagnosticsCount > 0 || curiosityCount > 0;

  const stats = useMemo(() => {
    if (logs.length === 0) return null;

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const lastWeekLogs = logs.filter(log => new Date(log.timestamp) >= oneWeekAgo);
    const avgDuration = logs.reduce((acc, curr) => acc + curr.duration, 0) / logs.length;

    return {
      lastWeekCount: lastWeekLogs.length,
      avgMinutes: Math.round(avgDuration / 60 * 10) / 10,
      totalSessions: logs.length
    };
  }, [logs]);

  const diagnosticSummary = useMemo(() => {
    if (diagnosticResults.length === 0) return null;

    const completed = diagnosticResults.filter((r) => r.completed).length;
    const latest = diagnosticResults[0];

    return {
      total: diagnosticResults.length,
      completed,
      latest
    };
  }, [diagnosticResults]);

  const diagnosticReport = useMemo(() => {
    if (diagnosticResults.length === 0) return null;

    const moduleOrder: Array<DiagnosticResult['moduleId']> = ['frequency', 'speech', 'intonation', 'responsiveness', 'behavior'];
    const moduleLabel = (id: DiagnosticResult['moduleId']) => {
      if (!isHebrew) {
        return {
          frequency: 'Frequency Mapping',
          speech: 'Speech & Voice',
          intonation: 'Emotional Intonation',
          responsiveness: 'Auditory Responsiveness',
          behavior: 'Behavioral Profile'
        }[id];
      }
      return {
        frequency: 'מיפוי תדרים',
        speech: 'ניתוח דיבור וקול',
        intonation: 'אינטונציה רגשית',
        responsiveness: 'תגובה שמיעתית',
        behavior: 'פרופיל התנהגותי-חושי'
      }[id];
    };

    const modules = moduleOrder.map((moduleId) => {
      const records = diagnosticResults.filter((r) => r.moduleId === moduleId);
      const uniqueSteps = new Set(records.map((r) => r.stepIndex));
      const completedSteps = [...uniqueSteps].filter((n) => n >= 0 && n < 3).length;

      let bonus = 0;
      if (records.some((r) => r.micPermission === 'granted')) bonus += 8;
      if (records.some((r) => typeof r.ambientDb === 'number')) bonus += 6;
      if (records.some((r) => typeof r.lastToneHz === 'number')) bonus += 6;
      if (moduleId === 'speech' && records.some((r) => (r.recordingMs || 0) > 0)) bonus += 10;
      if (moduleId === 'behavior' && records.some((r) => typeof r.behaviorAnswers?.q1 === 'boolean' && typeof r.behaviorAnswers?.q2 === 'boolean')) bonus += 10;
      if (moduleId === 'frequency' && records.some((r) => typeof r.preferredFrequencyHz === 'number' && typeof r.aversiveFrequencyHz === 'number')) bonus += 10;
      if (records.some((r) => (r.videoCapturedMs || 0) > 0)) bonus += 6;
      if (records.some((r) => typeof r.distractionMetrics?.motionScoreAvg === 'number')) bonus += 6;
      if (moduleId === 'speech' && records.some((r) => typeof r.speechAnswers?.heardClearly === 'boolean')) bonus += 6;
      if (records.some((r) => typeof r.liveFeedback?.comfortNow === 'boolean')) bonus += 4;

      const stepScore = Math.round((completedSteps / 3) * 80);
      const score = Math.min(100, stepScore + bonus);
      const lastRecord = records[0];

      return {
        moduleId,
        label: moduleLabel(moduleId),
        score,
        completedSteps,
        totalSteps: 3,
        recordsCount: records.length,
        lastTimestamp: lastRecord?.timestamp || null
      };
    });

    const overallScore = Math.round(modules.reduce((sum, m) => sum + m.score, 0) / modules.length);
    const latestTimestamp = diagnosticResults[0]?.timestamp || null;

    const ambientValues = diagnosticResults.map((r) => r.ambientDb).filter((v): v is number => typeof v === 'number');
    const motionValues = diagnosticResults.map((r) => r.distractionMetrics?.motionScoreAvg).filter((v): v is number => typeof v === 'number');
    const focusLostTotal = diagnosticResults.reduce((sum, r) => sum + (r.distractionMetrics?.focusLostCount || 0), 0);
    const hiddenTotal = diagnosticResults.reduce((sum, r) => sum + (r.distractionMetrics?.hiddenCount || 0), 0);

    const preferredTones = diagnosticResults.map((r) => r.preferredFrequencyHz).filter((v): v is number => typeof v === 'number');
    const aversiveTones = diagnosticResults.map((r) => r.aversiveFrequencyHz).filter((v): v is number => typeof v === 'number');
    const comfortableCount = diagnosticResults.reduce((sum, r) => sum + (r.liveFeedback?.comfortNow === true ? 1 : 0), 0);
    const distractedNowCount = diagnosticResults.reduce((sum, r) => sum + (r.liveFeedback?.distractedNow === true ? 1 : 0), 0);

    const mostCommon = (arr: number[]) => {
      if (arr.length === 0) return null;
      const counts = new Map<number, number>();
      arr.forEach((v) => counts.set(v, (counts.get(v) || 0) + 1));
      let best: number | null = null;
      let max = -1;
      counts.forEach((count, key) => {
        if (count > max) {
          max = count;
          best = key;
        }
      });
      return best;
    };

    return {
      modules,
      overallScore,
      latestTimestamp,
      collectedData: {
        avgAmbientDb: ambientValues.length ? Math.round((ambientValues.reduce((a, b) => a + b, 0) / ambientValues.length) * 10) / 10 : null,
        avgMotionScore: motionValues.length ? Math.round((motionValues.reduce((a, b) => a + b, 0) / motionValues.length) * 10) / 10 : null,
        focusLostTotal,
        hiddenTotal,
        comfortableCount,
        distractedNowCount,
        mostPreferredTone: mostCommon(preferredTones),
        mostAversiveTone: mostCommon(aversiveTones)
      }
    };
  }, [diagnosticResults, isHebrew]);

  const handleExportDiagnosticReport = async () => {
    if (!diagnosticReport) return;

    const modulesText = diagnosticReport.modules
      .map((m) => m.label + ': ' + m.score + '/100 (' + m.completedSteps + '/' + m.totalSteps + ')')
      .join('\n');

    const collected = diagnosticReport.collectedData;
    const collectedText = (isHebrew
      ? '\n\nנתונים שנאספו:' +
        '\nממוצע רעש רקע: ' + (collected.avgAmbientDb ?? '-') + ' dB' +
        '\nממוצע תנועת וידאו: ' + (collected.avgMotionScore ?? '-') +
        '\nאיבודי פוקוס: ' + collected.focusLostTotal +
        '\nמעברים לרקע: ' + collected.hiddenTotal +
        '\nדיווח נעים בזמן אמת: ' + collected.comfortableCount +
        '\nדיווח הסחות בזמן אמת: ' + collected.distractedNowCount +
        '\nתדר מועדף נפוץ: ' + (collected.mostPreferredTone ?? '-') + ' Hz' +
        '\nתדר פחות נעים נפוץ: ' + (collected.mostAversiveTone ?? '-') + ' Hz'
      : '\n\nCollected data:' +
        '\nAvg ambient noise: ' + (collected.avgAmbientDb ?? '-') + ' dB' +
        '\nAvg video motion score: ' + (collected.avgMotionScore ?? '-') +
        '\nFocus-loss events: ' + collected.focusLostTotal +
        '\nBackground switches: ' + collected.hiddenTotal +
        '\nRealtime comfort=yes count: ' + collected.comfortableCount +
        '\nRealtime distracted=yes count: ' + collected.distractedNowCount +
        '\nMost common preferred tone: ' + (collected.mostPreferredTone ?? '-') + ' Hz' +
        '\nMost common less-pleasant tone: ' + (collected.mostAversiveTone ?? '-') + ' Hz');

    const reportText = isHebrew
      ? 'דוח סיום אבחון MeowDiagnostics (RUO)\n' +
        'ציון כולל: ' + diagnosticReport.overallScore + '/100\n' +
        'זמן עדכון אחרון: ' + (diagnosticReport.latestTimestamp ? new Date(diagnosticReport.latestTimestamp).toLocaleString('he-IL') : '-') + '\n\n' +
        'פירוט מודולים:\n' + modulesText + collectedText + '\n\n' +
        'הבהרה: הכלי מיועד למחקר (RUO) ואינו אבחון רפואי.'
      : 'MeowDiagnostics Final Diagnostic Report (RUO)\n' +
        'Overall score: ' + diagnosticReport.overallScore + '/100\n' +
        'Last update: ' + (diagnosticReport.latestTimestamp ? new Date(diagnosticReport.latestTimestamp).toLocaleString('en-US') : '-') + '\n\n' +
        'Module breakdown:\n' + modulesText + collectedText + '\n\n' +
        'Disclaimer: This tool is for research use only and is not a medical diagnostic device.';

    try {
      await Share.share({
        title: isHebrew ? 'דוח סיום אבחון' : 'Final Diagnostic Report',
        text: reportText,
        dialogTitle: isHebrew ? 'ייצוא דוח אבחון' : 'Export Diagnostic Report'
      });
    } catch (e) {
      console.error('Error exporting diagnostic report', e);
    }
  };

  const handleExport = async () => {
    if (!stats && !diagnosticSummary && !diagnosticReport && !curiositySummary.totalQuestions) return;

    const diagnosticText = diagnosticSummary
      ? (isHebrew
          ? `\n\nMeowDiagnostics: ${diagnosticSummary.total} רשומות, ${diagnosticSummary.completed} שלבים הושלמו.`
          : `\n\nMeowDiagnostics: ${diagnosticSummary.total} records, ${diagnosticSummary.completed} completed steps.`)
      : '';

    const curiosityText = curiositySummary.totalQuestions
      ? (isHebrew
          ? `\n\nמועדון הסקרנות: ${curiositySummary.totalQuestions} שאלות (קול: ${curiositySummary.voiceQuestions}, טקסט: ${curiositySummary.textQuestions}), תחומים ייחודיים: ${curiositySummary.uniqueTopics}.`
          : `\n\nCuriosity Club: ${curiositySummary.totalQuestions} questions (voice: ${curiositySummary.voiceQuestions}, text: ${curiositySummary.textQuestions}), unique topics: ${curiositySummary.uniqueTopics}.`)
      : '';

    const summary = isHebrew 
      ? `סיכום שימוש ב-EmotiMate:\nבסך הכל הופעל מצב רגיעה ${stats?.totalSessions || 0} פעמים.\nבשבוע האחרון: ${stats?.lastWeekCount || 0} פעמים.\nזמן ממוצע: ${stats?.avgMinutes || 0} דקות.${diagnosticText}${curiosityText}`
      : `EmotiMate Usage Summary:\nCalm mode used ${stats?.totalSessions || 0} times total.\nLast week: ${stats?.lastWeekCount || 0} times.\nAverage duration: ${stats?.avgMinutes || 0} minutes.${diagnosticText}${curiosityText}`;

    try {
      await Share.share({
        title: isHebrew ? 'דו"ח שימוש EmotiMate' : 'EmotiMate Usage Report',
        text: summary,
        dialogTitle: isHebrew ? 'שתף עם ההורים' : 'Share with parents',
      });
    } catch (e) {
      console.error('Error sharing', e);
    }
  };

  return (
    <div className="fixed inset-0 z-[400] bg-slate-900 text-white p-6 flex flex-col safe-area-inset-top">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-black flex items-center gap-2">
          <span>📊</span>
          {isHebrew ? 'לוח בקרה להורים' : 'Parent Dashboard'}
        </h2>
        <button 
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xl"
        >
          ✕
        </button>
      </div>

      {!hasAnyData(stats, diagnosticResults.length, curiositySummary.totalQuestions) ? (
        <div className="flex-1 flex flex-col items-center justify-center opacity-50">
          <span className="text-6xl mb-4">📈</span>
          <p>{isHebrew ? 'עדיין אין נתונים להצגה' : 'No data available yet'}</p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col space-y-6 overflow-y-auto pr-2 custom-scrollbar">
          {/* Summary Card */}
          <div className="bg-indigo-600/30 rounded-3xl p-6 border border-indigo-400/30 shadow-xl">
            <h3 className="text-lg font-bold mb-4 opacity-80">
              {isHebrew ? 'סיכום שבועי' : 'Weekly Summary'}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-2xl p-4">
                <div className="text-3xl font-black text-indigo-300">{stats?.lastWeekCount ?? 0}</div>
                <div className="text-xs opacity-60">{isHebrew ? 'שימושים השבוע' : 'Sessions this week'}</div>
              </div>
              <div className="bg-white/5 rounded-2xl p-4">
                <div className="text-3xl font-black text-teal-300">{stats?.avgMinutes ?? 0}</div>
                <div className="text-xs opacity-60">{isHebrew ? 'דקות בממוצע' : 'Avg minutes'}</div>
              </div>
            </div>
            {bunnyMessage && (
              <div className="mt-6 p-4 bg-purple-500/20 rounded-2xl border border-purple-400/30 animate-fade-in">
                <div className="flex gap-3">
                  <span className="text-2xl">🐰</span>
                  <p className="text-sm leading-relaxed text-purple-100 font-medium italic">
                    "{bunnyMessage}"
                  </p>
                </div>
              </div>
            )}
            <p className="mt-6 text-sm leading-relaxed italic opacity-90">
              {isHebrew 
                ? `בשבוע האחרון הופעל מצב רגיעה ${stats?.lastWeekCount ?? 0} פעמים. זמן ממוצע: ${stats?.avgMinutes ?? 0} דקות.`
                : `In the last week, Calm Mode was activated ${stats?.lastWeekCount ?? 0} times. Average duration: ${stats?.avgMinutes ?? 0} minutes.`}
            </p>
          </div>

          {diagnosticSummary && (
            <div className="bg-emerald-600/20 rounded-3xl p-6 border border-emerald-400/30 shadow-xl">
              <h3 className="text-lg font-bold mb-4 opacity-90">
                {isHebrew ? 'MeowDiagnostics (RUO)' : 'MeowDiagnostics (RUO)'}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-2xl p-4">
                  <div className="text-3xl font-black text-emerald-200">{diagnosticSummary.total}</div>
                  <div className="text-xs opacity-60">{isHebrew ? 'רשומות אבחון' : 'Diagnostic records'}</div>
                </div>
                <div className="bg-white/5 rounded-2xl p-4">
                  <div className="text-3xl font-black text-teal-200">{diagnosticSummary.completed}</div>
                  <div className="text-xs opacity-60">{isHebrew ? 'שלבים שהושלמו' : 'Completed steps'}</div>
                </div>
              </div>
              <div className="mt-4 text-sm text-emerald-50">
                {isHebrew ? 'נתונים נשמרים מקומית במכשיר תחת: emotimate_diagnostic_results' : 'Data is saved locally on device under: emotimate_diagnostic_results'}
              </div>

              {diagnosticReport && (
                <div className="mt-4 rounded-2xl bg-white/10 p-4 border border-emerald-200/20">
                  <div className="text-sm font-bold mb-2 text-emerald-100">
                    {isHebrew ? 'דוח סיום אבחון (מודולרי)' : 'Final Diagnostic Report (Modular)'}
                  </div>
                  <div className="text-xs mb-3">
                    {isHebrew ? 'ציון כולל' : 'Overall score'}: <span className="font-black">{diagnosticReport.overallScore}/100</span>
                  </div>
                  <div className="mb-3 rounded-xl bg-white/10 p-3 text-xs">
                    <div className="font-semibold mb-1">{isHebrew ? 'נתונים שנאספו' : 'Collected data'}</div>
                    <div>{isHebrew ? 'ממוצע רעש רקע' : 'Avg ambient'}: {diagnosticReport.collectedData.avgAmbientDb ?? '-'} dB</div>
                    <div>{isHebrew ? 'ממוצע תנועת וידאו' : 'Avg video motion'}: {diagnosticReport.collectedData.avgMotionScore ?? '-'}</div>
                    <div>{isHebrew ? 'איבודי פוקוס' : 'Focus-loss events'}: {diagnosticReport.collectedData.focusLostTotal}</div>
                    <div>{isHebrew ? 'מעברים לרקע' : 'Background switches'}: {diagnosticReport.collectedData.hiddenTotal}</div>
                    <div>{isHebrew ? 'דיווח נעים בזמן אמת' : 'Realtime comfort=yes'}: {diagnosticReport.collectedData.comfortableCount}</div>
                    <div>{isHebrew ? 'דיווח הסחות בזמן אמת' : 'Realtime distracted=yes'}: {diagnosticReport.collectedData.distractedNowCount}</div>
                    <div>{isHebrew ? 'תדר מועדף נפוץ' : 'Most common preferred tone'}: {diagnosticReport.collectedData.mostPreferredTone ?? '-'} Hz</div>
                    <div>{isHebrew ? 'תדר פחות נעים נפוץ' : 'Most common less-pleasant tone'}: {diagnosticReport.collectedData.mostAversiveTone ?? '-'} Hz</div>
                  </div>

                  <div className="space-y-2">
                    {diagnosticReport.modules.map((m) => (
                      <div key={m.moduleId} className="bg-white/10 rounded-lg p-2">
                        <div className="flex justify-between text-xs font-semibold mb-1">
                          <span>{m.label}</span>
                          <span>{m.score}/100</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-white/20 overflow-hidden">
                          <div className="h-full bg-emerald-300" style={{ width: m.score + '%' }} />
                        </div>
                        <div className="text-[10px] mt-1 opacity-80">
                          {isHebrew ? ('התקדמות: ' + m.completedSteps + '/' + m.totalSteps) : ('Progress: ' + m.completedSteps + '/' + m.totalSteps)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="mt-4 space-y-2 max-h-48 overflow-y-auto pr-1">
                {diagnosticResults.slice(0, 8).map((r) => (
                  <div key={r.id} className="bg-white/10 rounded-xl p-3 text-xs">
                    <div className="font-bold mb-1">{r.moduleId} • {new Date(r.timestamp).toLocaleString(isHebrew ? 'he-IL' : 'en-US')}</div>
                    <div>Mic: {r.micPermission} | Ambient: {r.ambientDb ?? '-'} dB | Last tone: {r.lastToneHz ?? '-'} Hz</div>
                    <div>Recording: {r.recordingMs ? Math.round(r.recordingMs / 1000) + 's' : '-'} | Video: {r.videoCapturedMs ? Math.round(r.videoCapturedMs / 1000) + 's' : '-'} | Completed: {r.completed ? 'yes' : 'no'}</div>
                    <div>Distraction: focusLost={r.distractionMetrics?.focusLostCount ?? 0}, hidden={r.distractionMetrics?.hiddenCount ?? 0}, motionAvg={r.distractionMetrics?.motionScoreAvg ?? '-'}</div>
                    <div>Realtime: comfort={typeof r.liveFeedback?.comfortNow === 'boolean' ? (r.liveFeedback?.comfortNow ? 'yes' : 'no') : '-'}, distractedNow={typeof r.liveFeedback?.distractedNow === 'boolean' ? (r.liveFeedback?.distractedNow ? 'yes' : 'no') : '-'}</div>
                    {r.moduleId === 'frequency' && (
                      <div>Tone feedback: pleasant={r.preferredFrequencyHz ?? '-'}Hz, less pleasant={r.aversiveFrequencyHz ?? '-'}Hz</div>
                    )}
                    {r.moduleId === 'speech' && (
                      <div>Speech QA: clear={typeof r.speechAnswers?.heardClearly === 'boolean' ? (r.speechAnswers?.heardClearly ? 'yes' : 'no') : '-'}, distracted={typeof r.speechAnswers?.distracted === 'boolean' ? (r.speechAnswers?.distracted ? 'yes' : 'no') : '-'}, repeat={typeof r.speechAnswers?.wantsRepeat === 'boolean' ? (r.speechAnswers?.wantsRepeat ? 'yes' : 'no') : '-'}</div>
                    )}
                    {r.moduleId === 'behavior' && (
                      <div>Behavior: q1={typeof r.behaviorAnswers?.q1 === 'boolean' ? (r.behaviorAnswers?.q1 ? 'yes' : 'no') : '-'}, q2={typeof r.behaviorAnswers?.q2 === 'boolean' ? (r.behaviorAnswers?.q2 ? 'yes' : 'no') : '-'}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-sky-600/20 rounded-3xl p-6 border border-sky-300/30 shadow-xl">
            <h3 className="text-lg font-bold mb-4 opacity-90">
              {isHebrew ? 'מועדון הסקרנות (התפתחות קוגניטיבית)' : 'Curiosity Club (Cognitive Progress)'}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-2xl p-4">
                <div className="text-3xl font-black text-sky-200">{curiositySummary.totalQuestions}</div>
                <div className="text-xs opacity-60">{isHebrew ? 'סה\"כ שאלות' : 'Total questions'}</div>
              </div>
              <div className="bg-white/5 rounded-2xl p-4">
                <div className="text-3xl font-black text-cyan-200">{curiositySummary.uniqueTopics}</div>
                <div className="text-xs opacity-60">{isHebrew ? 'תחומים ייחודיים' : 'Unique topics'}</div>
              </div>
            </div>
            <div className="mt-3 text-sm text-sky-50">
              {isHebrew
                ? `קול: ${curiositySummary.voiceQuestions}, טקסט: ${curiositySummary.textQuestions}, אורך תשובה ממוצע: ${curiositySummary.avgAnswerLength} תווים`
                : `Voice: ${curiositySummary.voiceQuestions}, text: ${curiositySummary.textQuestions}, avg answer length: ${curiositySummary.avgAnswerLength} chars`}
            </div>
            {curiositySummary.lastQuestionText && (
              <div className="mt-3 rounded-xl bg-white/10 p-3 text-sm">
                <div className="font-semibold mb-1">{isHebrew ? 'שאלה אחרונה' : 'Last question'}</div>
                <div>{curiositySummary.lastQuestionText}</div>
              </div>
            )}
            {curiositySummary.recent.length > 0 && (
              <div className="mt-3 max-h-40 overflow-y-auto pr-1 space-y-2">
                {curiositySummary.recent.map((r: any) => (
                  <div key={r.id} className="rounded-lg bg-white/10 p-2 text-xs">
                    <div className="font-semibold">{new Date(r.timestamp).toLocaleString(isHebrew ? "he-IL" : "en-US")}</div>
                    <div>{isHebrew ? 'שאלה' : 'Q'}: {r.question}</div>
                    <div>{isHebrew ? 'מקור' : 'Source'}: {r.source}</div>
                    <div>{isHebrew ? 'נושא' : 'Topic'}: {r.topic}</div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-3 text-xs text-sky-100/80">
              {isHebrew ? 'שמירה מקומית: emotimate_curiosity_logs / emotimate_curiosity_stats' : 'Local storage: emotimate_curiosity_logs / emotimate_curiosity_stats'}
            </div>
          </div>

          {/* Weekly Progress Chart */}
          <WeeklyProgress language={language} weeklyStats={weeklyStats} />

          {/* Log List */}
          <div className="flex-1">
            <h3 className="text-lg font-bold mb-4 opacity-80 border-b border-white/10 pb-2">
              {isHebrew ? 'הקלטת הודעה לילד' : 'Record Voice Note'}
            </h3>
            
            <div className="bg-white/5 rounded-3xl p-6 border border-white/10 flex flex-col items-center gap-4 mb-8">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl shadow-lg transition-all ${isRecording ? 'bg-red-500 animate-pulse scale-110' : 'bg-indigo-600'}`}>
                {isRecording ? '⏹️' : '🎤'}
              </div>
              
              <div className="flex gap-3 w-full">
                {!isRecording ? (
                  <button 
                    onClick={startRecording}
                    className="flex-1 py-3 bg-indigo-600 rounded-2xl font-bold text-sm shadow-lg hover:bg-indigo-500 transition-all"
                  >
                    {isHebrew ? 'התחל הקלטה' : 'Start Recording'}
                  </button>
                ) : (
                  <button 
                    onClick={stopRecording}
                    className="flex-1 py-3 bg-red-500 rounded-2xl font-bold text-sm shadow-lg hover:bg-red-400 transition-all"
                  >
                    {isHebrew ? 'עצור ושמור' : 'Stop & Save'}
                  </button>
                )}
                
                {recordedAudio && !isRecording && (
                  <button 
                    onClick={playPreview}
                    className="flex-1 py-3 bg-white/10 rounded-2xl font-bold text-sm shadow-lg hover:bg-white/20 transition-all border border-white/10"
                  >
                    {isHebrew ? 'השמע דגימה' : 'Play Preview'}
                  </button>
                )}
              </div>
              
              <p className="text-[10px] opacity-40 text-center">
                {isHebrew 
                  ? 'הקלט הודעה מעודדת שהילד יוכל לשמוע כשהוא זקוק לנחמה' 
                  : 'Record an encouraging message the child can hear when they need comfort'}
              </p>
            </div>

            <h3 className="text-lg font-bold mb-4 opacity-80 border-b border-white/10 pb-2">
              {isHebrew ? 'העדפות תחושתיות' : 'Sensory Preferences'}
            </h3>
            
            <div className="bg-white/5 rounded-3xl p-6 border border-white/10 flex flex-col gap-4 mb-8">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-blue-200">
                    {isHebrew ? 'בדים רכים בלבד' : 'Soft Fabrics Only'}
                  </span>
                  <span className="text-[10px] opacity-60">
                    {isHebrew ? 'הארנב יעודד שימוש בבדים נעימים' : 'Bunny will encourage using comfortable fabrics'}
                  </span>
                </div>
                <button 
                  onClick={toggleSoftFabrics}
                  className={`w-12 h-6 rounded-full transition-all relative ${softFabricsOnly ? 'bg-blue-500' : 'bg-white/20'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${softFabricsOnly ? (isHebrew ? 'right-7' : 'left-7') : (isHebrew ? 'right-1' : 'left-1')}`} />
                </button>
              </div>
            </div>

            <h3 className="text-lg font-bold mb-4 opacity-80 border-b border-white/10 pb-2">
              {isHebrew ? 'סיכום שבועי' : 'Weekly Summary'}
            </h3>
            
            <div className="bg-white/5 rounded-3xl p-6 border border-white/10 flex flex-col gap-4 mb-8">
              <p className="text-xs text-amber-200">
                {isHebrew ? 'צפה באלבום ההצלחות של הילד מהשבוע האחרון' : 'View the child\'s success album from the past week'}
              </p>
              
              <button 
                onClick={onOpenWeeklyAlbum}
                className="w-full py-4 bg-amber-600 text-white rounded-2xl font-black text-lg shadow-lg hover:bg-amber-500 active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                <span className="text-2xl">📖</span>
                {isHebrew ? 'פתח אלבום הצלחות' : 'Open Success Album'}
              </button>
            </div>

            <h3 className="text-lg font-bold mb-4 opacity-80 border-b border-white/10 pb-2">
              {isHebrew ? 'הגדרות מיקום' : 'Location Settings'}
            </h3>
            
            <div className="bg-white/5 rounded-3xl p-6 border border-white/10 flex flex-col gap-4 mb-8">
              <p className="text-xs text-indigo-200">
                {isHebrew ? 'הזן קואורדינטות לזיהוי הגעה (בית ספר ובית)' : 'Enter coordinates for arrival detection (School & Home)'}
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase tracking-wider opacity-50 mb-1 block">
                    {isHebrew ? 'בית ספר / גן' : 'School / Kindergarten'}
                  </label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={schoolLat}
                      onChange={(e) => setSchoolLat(e.target.value)}
                      placeholder="Lat"
                      className="flex-1 bg-black/20 border border-white/10 rounded-xl p-3 text-sm focus:border-indigo-500 outline-none"
                    />
                    <input 
                      type="text" 
                      value={schoolLng}
                      onChange={(e) => setSchoolLng(e.target.value)}
                      placeholder="Lng"
                      className="flex-1 bg-black/20 border border-white/10 rounded-xl p-3 text-sm focus:border-indigo-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider opacity-50 mb-1 block">
                    {isHebrew ? 'בית' : 'Home'}
                  </label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={homeLat}
                      onChange={(e) => setHomeLat(e.target.value)}
                      placeholder="Lat"
                      className="flex-1 bg-black/20 border border-white/10 rounded-xl p-3 text-sm focus:border-indigo-500 outline-none"
                    />
                    <input 
                      type="text" 
                      value={homeLng}
                      onChange={(e) => setHomeLng(e.target.value)}
                      placeholder="Lng"
                      className="flex-1 bg-black/20 border border-white/10 rounded-xl p-3 text-sm focus:border-indigo-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              <button 
                onClick={handleSaveLocation}
                className="w-full py-3 bg-teal-600/80 rounded-xl font-bold text-sm hover:bg-teal-600 transition-all mt-2"
              >
                {isHebrew ? 'שמור מיקומים' : 'Save Locations'}
              </button>
            </div>

            <h3 className="text-lg font-bold mb-4 opacity-80 border-b border-white/10 pb-2">
              {isHebrew ? 'שלח חיזוק מרחוק' : 'Send Remote Support'}
            </h3>
            
            <div className="bg-white/5 rounded-3xl p-6 border border-white/10 flex flex-col gap-4 mb-8">
              <p className="text-xs text-rose-200">
                {isHebrew ? 'שלח לילד נשיקה או חיבוק וירטואלי שיופיעו על המסך' : 'Send the child a virtual kiss or hug that will appear on screen'}
              </p>
              
              <select 
                value={selectedKissMessage}
                onChange={(e) => setSelectedKissMessage(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-sm focus:border-rose-500 outline-none text-white"
              >
                <option value="kiss">{isHebrew ? 'נשיקה 💋' : 'Kiss 💋'}</option>
                <option value="hug">{isHebrew ? 'חיבוק 🫂' : 'Hug 🫂'}</option>
                <option value="thinking">{isHebrew ? 'חושב עליך ✨' : 'Thinking of you ✨'}</option>
              </select>

              <button 
                onClick={handleSendKiss}
                className="w-full py-6 bg-rose-600 text-white rounded-2xl font-black text-xl shadow-lg hover:bg-rose-500 active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                <span className="text-3xl">❤️</span>
                {isHebrew ? 'שלח נשיקה' : 'Send a Kiss'}
              </button>
            </div>

            <h3 className="text-lg font-bold mb-4 opacity-80 border-b border-white/10 pb-2">
              {isHebrew ? 'משימה מיוחדת' : 'Special Mission'}
            </h3>
            
            <div className="bg-white/5 rounded-3xl p-6 border border-white/10 flex flex-col gap-4 mb-8">
              <p className="text-xs text-purple-200">
                {isHebrew ? 'הגדר יעד אישי לעבודה משותפת (הורה/מטפל)' : 'Set a personal goal for collaborative work (parent/therapist)'}
              </p>
              <input 
                type="text" 
                value={collaborativeGoal}
                onChange={(e) => setCollaborativeGoal(e.target.value)}
                placeholder={isHebrew ? "למשל: להשתמש במזלג 3 פעמים" : "e.g., To use the fork 3 times"}
                className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-sm focus:border-purple-500 outline-none"
              />
              
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs text-white/60">
                  <span>{isHebrew ? 'יעד (פעמים/צעדים)' : 'Target (times/steps)'}</span>
                  <span className="font-bold text-purple-400">{targetValue}</span>
                </div>
                <input 
                  type="range"
                  min="1"
                  max="20"
                  value={targetValue}
                  onChange={(e) => setTargetValue(parseInt(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
              </div>

              <button 
                onClick={handleSaveMission}
                className="w-full py-3 bg-purple-600/80 rounded-xl font-bold text-sm hover:bg-purple-600 transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <span>🎯</span>
                {isHebrew ? 'שמור משימה' : 'Save Mission'}
              </button>
            </div>

            <h3 className="text-lg font-bold mb-4 opacity-80 border-b border-white/10 pb-2">
              {isHebrew ? 'הפרס הגדול' : 'The Grand Prize'}
            </h3>
            
            <div className="bg-white/5 rounded-3xl p-6 border border-white/10 flex flex-col gap-4 mb-8">
              <p className="text-xs text-yellow-200">
                {isHebrew ? 'מה הילד יקבל כשיגיע לסוף המפה?' : 'What will the child get when they reach the end of the map?'}
              </p>
              <input 
                type="text" 
                value={grandPrize}
                onChange={(e) => setGrandPrize(e.target.value)}
                placeholder={isHebrew ? "למשל: גלידה טעימה 🍦" : "e.g., Delicious Ice Cream 🍦"}
                className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-sm focus:border-yellow-500 outline-none"
              />
              <button 
                onClick={handleSaveGrandPrize}
                className="w-full py-3 bg-yellow-600/80 rounded-xl font-bold text-sm hover:bg-yellow-600 transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <span>🎁</span>
                {isHebrew ? 'שמור פרס' : 'Save Prize'}
              </button>
            </div>

            <h3 className="text-lg font-bold mb-4 opacity-80">
              {isHebrew ? 'היסטוריית שימוש' : 'Usage History'}
            </h3>
            <div className="space-y-3">
              {logs.map((log, i) => (
                <div key={i} className="bg-white/5 rounded-2xl p-4 flex justify-between items-center border border-white/5">
                  <div>
                    <div className="font-bold text-sm">
                      {new Date(log.timestamp).toLocaleDateString(isHebrew ? 'he-IL' : 'en-US')}
                    </div>
                    <div className="text-[10px] opacity-40 uppercase">
                      {new Date(log.timestamp).toLocaleTimeString(isHebrew ? 'he-IL' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <div className="bg-white/10 px-3 py-1 rounded-full text-xs font-mono">
                    {Math.floor(log.duration / 60)}:{String(log.duration % 60).padStart(2, '0')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-auto pt-6 border-t border-white/10 space-y-3">
        <button 
          onClick={handleExportDiagnosticReport}
          disabled={!diagnosticReport}
          className="w-full py-4 bg-emerald-600 text-white font-black text-lg rounded-2xl shadow-xl hover:bg-emerald-500 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-30"
        >
          <span>🧾</span>
          {isHebrew ? 'ייצוא דוח סיום אבחון' : 'Export Final Diagnostic Report'}
        </button>
        <button 
          onClick={handleExport}
          disabled={!stats && !diagnosticSummary && !diagnosticReport}
          className="w-full py-4 bg-teal-600 text-white font-black text-lg rounded-2xl shadow-xl hover:bg-teal-500 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-30"
        >
          <span>📤</span>
          {isHebrew ? 'ייצוא נתונים להורים' : 'Export Logs to Parents'}
        </button>
        <button 
          onClick={onClose}
          className="w-full py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-all"
        >
          {isHebrew ? 'סגור' : 'Close'}
        </button>
      </div>
    </div>
  );
};

export default ParentDashboard;
