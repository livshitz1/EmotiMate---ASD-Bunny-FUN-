import React, { useMemo, useState, useEffect } from 'react';
import { Share } from '@capacitor/share';
import { VoiceRecorder, RecordingData, GenericResponse } from 'capacitor-voice-recorder';
import { Language, CalmLog } from '../../types';
import { translate } from '../../i18n/translations';
import WeeklyProgress from './WeeklyProgress';

interface ParentDashboardProps {
  language: Language;
  onClose: () => void;
  weeklyStats?: Record<string, number>;
  bunnyMessage?: string;
  onMissionSet?: (goal: string) => void;
  onOpenWeeklyAlbum?: () => void;
}

const ParentDashboard: React.FC<ParentDashboardProps> = ({ language, onClose, weeklyStats, bunnyMessage, onMissionSet, onOpenWeeklyAlbum }) => {
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

  const handleExport = async () => {
    if (!stats) return;

    const summary = isHebrew 
      ? `סיכום שימוש ב-EmotiMate:\nבסך הכל הופעל מצב רגיעה ${stats.totalSessions} פעמים.\nבשבוע האחרון: ${stats.lastWeekCount} פעמים.\nזמן ממוצע: ${stats.avgMinutes} דקות.`
      : `EmotiMate Usage Summary:\nCalm mode used ${stats.totalSessions} times total.\nLast week: ${stats.lastWeekCount} times.\nAverage duration: ${stats.avgMinutes} minutes.`;

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

      {!stats ? (
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
                <div className="text-3xl font-black text-indigo-300">{stats.lastWeekCount}</div>
                <div className="text-xs opacity-60">{isHebrew ? 'שימושים השבוע' : 'Sessions this week'}</div>
              </div>
              <div className="bg-white/5 rounded-2xl p-4">
                <div className="text-3xl font-black text-teal-300">{stats.avgMinutes}</div>
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
                ? `בשבוע האחרון הופעל מצב רגיעה ${stats.lastWeekCount} פעמים. זמן ממוצע: ${stats.avgMinutes} דקות.`
                : `In the last week, Calm Mode was activated ${stats.lastWeekCount} times. Average duration: ${stats.avgMinutes} minutes.`}
            </p>
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
          onClick={handleExport}
          disabled={!stats}
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
