import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import BunnySelector, { BunnyOption } from './BunnySelector';

interface SettingsProps {
  language: Language;
  onClose: () => void;
  onSettingsChange?: (settings: AppSettings) => void;
  onEmergencyReset?: () => void;
  onFullReset?: () => void;
}

export interface AppSettings {
  bedtimeHour: number; // Hour for bedtime recommendation (21 or 22)
  petBedtimeHour: number; // Hour for pet bedtime recommendation
  morningReminderHour: number; // Hour for morning reminder (default 10:00)
  afternoonReminderHour: number; // Hour for afternoon reminder (default 14:00)
  eveningReminderHour: number; // Hour for evening reminder (default 19:00)
  showRecommendations: boolean; // Whether to show recommendations on timeline
  soundVolume: number; // Sound volume (0-100)
  animationSpeed: 'slow' | 'normal' | 'fast'; // Animation speed
  isQuietMode?: boolean; // Quiet mode
  // Advanced Settings
  homeAddress?: string;
  schoolName?: string;
  sensoryBatteryEnabled?: boolean;
  sensorySensitivityLevel?: number; // 1-10
  morningModeStartHour?: number;
  nightModeStartHour?: number;
  childNickname?: string;
  childAge?: number;
  favoriteReinforcement?: 'sparkles' | 'stars' | 'sound';
  schoolLat?: string;
  schoolLon?: string;
  homeLat?: string;
  homeLon?: string;
}

const DEFAULT_SETTINGS: AppSettings = {
  bedtimeHour: 21,
  petBedtimeHour: 21,
  morningReminderHour: 10,
  afternoonReminderHour: 14,
  eveningReminderHour: 19,
  showRecommendations: true,
  soundVolume: 80,
  animationSpeed: 'normal',
  isQuietMode: false,
  sensoryBatteryEnabled: true,
  sensorySensitivityLevel: 5,
  bunnySpeechEnabled: false,
  morningModeStartHour: 7,
  nightModeStartHour: 20,
  favoriteReinforcement: 'stars',
  childAge: 6
};

const Settings: React.FC<SettingsProps> = ({ language, onClose, onSettingsChange, onEmergencyReset, onFullReset }) => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('emotimate_app_settings');
    if (saved) {
      try {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      } catch {
        return DEFAULT_SETTINGS;
      }
    }
    return DEFAULT_SETTINGS;
  });

  useEffect(() => {
    // Save settings to localStorage whenever they change
    localStorage.setItem('emotimate_app_settings', JSON.stringify(settings));
    if (onSettingsChange) {
      onSettingsChange(settings);
    }
  }, [settings, onSettingsChange]);

  const getContent = () => {
    switch (language) {
      case Language.HEBREW:
        return {
          title: '⚙️ הגדרות',
          bedtimeLabel: 'שעת שינה מומלצת לילד',
          petBedtimeLabel: 'שעת שינה מומלצת לחיה',
          morningReminderLabel: 'תזכורת בוקר',
          afternoonReminderLabel: 'תזכורת צהריים',
          eveningReminderLabel: 'תזכורת ערב',
          showRecommendationsLabel: 'הצג המלצות על פס הזמן',
          soundVolumeLabel: 'עוצמת קול',
          animationSpeedLabel: 'מהירות אנימציה',
          quietModeLabel: 'מצב שקט (ווליום 20%, דיבור איטי)',
          slow: 'איטי',
          normal: 'רגיל',
          fast: 'מהיר',
          save: 'שמור',
          cancel: 'ביטול',
          recommendationsTitle: 'המלצות על פס הזמן',
          basicSettingsTitle: 'הגדרות בסיסיות',
          advancedSettingsTitle: '⚙️ הגדרות מתקדמות',
          locationTitle: '📍 הגדרות מיקום',
          sensoryTitle: '🔋 ויסות חושי',
          scheduleTitle: '⏰ לוח זמנים',
          profileTitle: '👤 פרופיל הילד',
          homeAddressLabel: 'כתובת הבית',
          schoolNameLabel: 'שם בית הספר / גן',
          sensoryBatteryLabel: 'הפעל סוללת ויסות חושי',
          sensorySensitivityLabel: 'רמת רגישות חושית',
          bunnySpeechLabel: 'דיבור הארנב (TTS)',
          morningHourLabel: 'שעת תחילת מצב בוקר',
          nightHourLabel: 'שעת תחילת מצב לילה',
          childNicknameLabel: 'כינוי הילד',
          reinforcementLabel: 'חיזוק מועדף',
          sparkles: 'נצנצים',
          stars: 'כוכבים',
          sound: 'צלילים',
          emergencyResetLabel: '🏠 אתחול תצוגה',
          fullResetLabel: '🔄 התחלת משחק מחדש (כולל בחירת חיה, גיל ושם)',
          fullResetConfirm: 'האם אתה בטוח שברצונך לאפס את כל המשחק? נחזור למסך הפתיחה לבחירת גיל, שם וחיה מועדפת.',
          fullResetDesc: 'חזרה למסך הפתיחה לבחירה מחדש של גיל, שם וחיה מועדפת'
        };
      case Language.ENGLISH:
        return {
          title: '⚙️ Settings',
          bedtimeLabel: 'Recommended bedtime for child',
          petBedtimeLabel: 'Recommended bedtime for pet',
          morningReminderLabel: 'Morning reminder',
          afternoonReminderLabel: 'Afternoon reminder',
          eveningReminderLabel: 'Evening reminder',
          showRecommendationsLabel: 'Show recommendations on timeline',
          soundVolumeLabel: 'Sound volume',
          animationSpeedLabel: 'Animation speed',
          slow: 'Slow',
          normal: 'Normal',
          fast: 'Fast',
          save: 'Save',
          cancel: 'Cancel',
          recommendationsTitle: 'Timeline Recommendations',
          basicSettingsTitle: 'Basic Settings',
          advancedSettingsTitle: '⚙️ Advanced Settings',
          locationTitle: '📍 Location Settings',
          sensoryTitle: '🔋 Sensory',
          scheduleTitle: '⏰ Schedule',
          profileTitle: '👤 Child Profile',
          homeAddressLabel: 'Home Address',
          schoolNameLabel: 'School/Kindergarten Name',
          sensoryBatteryLabel: 'Enable Sensory Battery',
          sensorySensitivityLabel: 'Sensory Sensitivity Level',
          bunnySpeechLabel: 'Bunny Speech (TTS)',
          morningHourLabel: 'Morning Mode Start Hour',
          nightHourLabel: 'Night Mode Start Hour',
          childNicknameLabel: 'Child\'s Nickname',
          reinforcementLabel: 'Favorite Reinforcement',
          sparkles: 'Sparkles',
          stars: 'Stars',
          sound: 'Sound',
          emergencyResetLabel: '🏠 Reset View',
          fullResetLabel: '🔄 Restart Game (Reset name, age & pet)',
          fullResetConfirm: 'Are you sure you want to restart? You will go back to the onboarding screen to choose age, name, and animal preference.'
        };
      case Language.RUSSIAN:
        return {
          title: '⚙️ Настройки',
          bedtimeLabel: 'Рекомендуемое время сна для ребенка',
          petBedtimeLabel: 'Рекомендуемое время сна для питомца',
          morningReminderLabel: 'Утреннее напоминание',
          afternoonReminderLabel: 'Дневное напоминание',
          eveningReminderLabel: 'Вечернее напоминание',
          showRecommendationsLabel: 'Показывать рекомендации на временной шкале',
          soundVolumeLabel: 'Громкость звука',
          animationSpeedLabel: 'Скорость анимации',
          slow: 'Медленно',
          normal: 'Нормально',
          fast: 'Быстро',
          save: 'Сохранить',
          cancel: 'Отмена',
          recommendationsTitle: 'Рекомендации на временной шкале',
          basicSettingsTitle: 'Основные настройки'
        };
      default:
        return {
          title: '⚙️ Settings',
          bedtimeLabel: 'Bedtime',
          petBedtimeLabel: 'Pet bedtime',
          morningReminderLabel: 'Morning reminder',
          afternoonReminderLabel: 'Afternoon reminder',
          eveningReminderLabel: 'Evening reminder',
          showRecommendationsLabel: 'Show recommendations',
          soundVolumeLabel: 'Sound volume',
          animationSpeedLabel: 'Animation speed',
          slow: 'Slow',
          normal: 'Normal',
          fast: 'Fast',
          save: 'Save',
          cancel: 'Cancel',
          recommendationsTitle: 'Timeline Recommendations',
          basicSettingsTitle: 'Basic Settings'
        };
    }
  };

  const content = getContent();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-t-2xl flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold">{content.title}</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 text-2xl font-bold transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Timeline Recommendations Section */}
          <div className="border-b-2 border-purple-200 pb-4">
            <h3 className="text-xl font-bold text-purple-700 mb-4">{content.recommendationsTitle}</h3>
            
            {/* Show Recommendations Toggle */}
            <div className="mb-4 flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <label className="text-gray-700 font-semibold flex items-center gap-2">
                <span className="text-xl">📅</span>
                {content.showRecommendationsLabel}
              </label>
              <button
                onClick={() => setSettings(prev => ({ ...prev, showRecommendations: !prev.showRecommendations }))}
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  settings.showRecommendations ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.showRecommendations ? 'translate-x-7' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Bedtime Settings */}
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <label className="block text-gray-700 font-semibold mb-2">
                  🌙 {content.bedtimeLabel}
                </label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, bedtimeHour: 21 }))}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      settings.bedtimeHour === 21
                        ? 'bg-blue-500 text-white shadow-lg scale-105'
                        : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-400'
                    }`}
                  >
                    21:00
                  </button>
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, bedtimeHour: 22 }))}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      settings.bedtimeHour === 22
                        ? 'bg-blue-500 text-white shadow-lg scale-105'
                        : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-400'
                    }`}
                  >
                    22:00
                  </button>
                </div>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <label className="block text-gray-700 font-semibold mb-2">
                  🐰 {content.petBedtimeLabel}
                </label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, petBedtimeHour: 21 }))}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      settings.petBedtimeHour === 21
                        ? 'bg-green-500 text-white shadow-lg scale-105'
                        : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-green-400'
                    }`}
                  >
                    21:00
                  </button>
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, petBedtimeHour: 22 }))}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      settings.petBedtimeHour === 22
                        ? 'bg-green-500 text-white shadow-lg scale-105'
                        : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-green-400'
                    }`}
                  >
                    22:00
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Reminder Times Section */}
          <div className="border-b-2 border-purple-200 pb-4">
            <h3 className="text-xl font-bold text-purple-700 mb-4">
              {language === Language.HEBREW ? '⏰ זמני תזכורות' : language === Language.ENGLISH ? '⏰ Reminder Times' : '⏰ Время напоминаний'}
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <label className="text-gray-700 font-semibold">🌅 {content.morningReminderLabel}</label>
                <select
                  value={settings.morningReminderHour}
                  onChange={(e) => setSettings(prev => ({ ...prev, morningReminderHour: parseInt(e.target.value) }))}
                  className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 6).map(hour => (
                    <option key={hour} value={hour}>{hour}:00</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <label className="text-gray-700 font-semibold">☀️ {content.afternoonReminderLabel}</label>
                <select
                  value={settings.afternoonReminderHour}
                  onChange={(e) => setSettings(prev => ({ ...prev, afternoonReminderHour: parseInt(e.target.value) }))}
                  className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                >
                  {Array.from({ length: 8 }, (_, i) => i + 12).map(hour => (
                    <option key={hour} value={hour}>{hour}:00</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between p-3 bg-pink-50 rounded-lg">
                <label className="text-gray-700 font-semibold">🌆 {content.eveningReminderLabel}</label>
                <select
                  value={settings.eveningReminderHour}
                  onChange={(e) => setSettings(prev => ({ ...prev, eveningReminderHour: parseInt(e.target.value) }))}
                  className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                >
                  {Array.from({ length: 6 }, (_, i) => i + 17).map(hour => (
                    <option key={hour} value={hour}>{hour}:00</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Bunny Selector Section */}
          <div className="border-b-2 border-purple-200 pb-4">
            <h3 className="text-xl font-bold text-purple-700 mb-2">🐰 בחירת דמות</h3>
            <BunnySelector onSelect={(bunny) => {
              console.log('Selected bunny:', bunny);
              localStorage.setItem('emotimate_selected_bunny', JSON.stringify(bunny));
            }} />
          </div>

          {/* Basic Settings Section */}
          <div>
            <h3 className="text-xl font-bold text-purple-700 mb-4">{content.basicSettingsTitle}</h3>
            
            {/* Sound Volume */}
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <label className="block text-gray-700 font-semibold mb-2">
                🔊 {content.soundVolumeLabel}: {settings.soundVolume}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.soundVolume}
                onChange={(e) => setSettings(prev => ({ ...prev, soundVolume: parseInt(e.target.value) }))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>

            {/* Quiet Mode Toggle */}
            <div className="mb-4 flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100 shadow-sm">
              <label className="text-gray-700 font-semibold flex items-center gap-2">
                <span className="text-xl">🤫</span>
                <div>
                  <div className="text-sm font-bold text-blue-800">
                    {language === Language.HEBREW ? 'מצב שקט' : 'Quiet Mode'}
                  </div>
                  <div className="text-[10px] text-blue-600">
                    {language === Language.HEBREW ? 'ווליום 20%, דיבור איטי' : '20% volume, slow speech'}
                  </div>
                </div>
              </label>
              <button
                onClick={() => setSettings(prev => ({ ...prev, isQuietMode: !prev.isQuietMode }))}
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  settings.isQuietMode ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.isQuietMode ? 'translate-x-7' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Animation Speed */}
            <div className="p-3 bg-gray-50 rounded-lg">
              <label className="block text-gray-700 font-semibold mb-2">
                ⚡ {content.animationSpeedLabel}
              </label>
              <div className="flex gap-2">
                {(['slow', 'normal', 'fast'] as const).map(speed => (
                  <button
                    key={speed}
                    onClick={() => setSettings(prev => ({ ...prev, animationSpeed: speed }))}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      settings.animationSpeed === speed
                        ? 'bg-purple-500 text-white shadow-lg scale-105'
                        : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-purple-400'
                    }`}
                  >
                    {speed === 'slow' ? content.slow : speed === 'normal' ? content.normal : content.fast}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Advanced Settings Section */}
          <div className="border-t-4 border-gray-100 pt-6 space-y-8">
            <h3 className="text-2xl font-black text-gray-800 flex items-center gap-3">
              <span>{content.advancedSettingsTitle}</span>
            </h3>

            {/* Child Profile Section */}
            <div className="space-y-4 p-4 bg-indigo-50 rounded-2xl border border-indigo-100 shadow-sm">
              <h4 className="text-lg font-bold text-indigo-700 flex items-center gap-2">
                <span>{content.profileTitle}</span>
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-bold text-indigo-600 mb-1">{content.childNicknameLabel}</label>
                  <input
                    type="text"
                    value={settings.childNickname || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, childNickname: e.target.value }))}
                    className="w-full px-4 py-2 rounded-xl border-2 border-indigo-200 focus:border-indigo-500 outline-none"
                    placeholder="..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-indigo-600 mb-1">{content.reinforcementLabel}</label>
                  <div className="flex gap-2">
                    {(['sparkles', 'stars', 'sound'] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => setSettings(prev => ({ ...prev, favoriteReinforcement: type }))}
                        className={`flex-1 py-2 rounded-xl font-bold transition-all ${
                          settings.favoriteReinforcement === type
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'bg-white text-indigo-600 border-2 border-indigo-100'
                        }`}
                      >
                        {type === 'sparkles' ? content.sparkles : type === 'stars' ? content.stars : content.sound}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Location Settings Section */}
            <div className="space-y-4 p-4 bg-orange-50 rounded-2xl border border-orange-100 shadow-sm">
              <h4 className="text-lg font-bold text-orange-700 flex items-center gap-2">
                <span>{content.locationTitle}</span>
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-bold text-orange-600 mb-1">{content.schoolNameLabel}</label>
                  <input
                    type="text"
                    value={settings.schoolName || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, schoolName: e.target.value }))}
                    className="w-full px-4 py-2 rounded-xl border-2 border-orange-200 focus:border-orange-500 outline-none mb-2"
                    placeholder="🏫 ..."
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={settings.schoolLat || ''}
                      onChange={(e) => setSettings(prev => ({ ...prev, schoolLat: e.target.value }))}
                      className="flex-1 px-3 py-1.5 rounded-lg border border-orange-100 text-xs outline-none"
                      placeholder="Lat"
                    />
                    <input
                      type="text"
                      value={settings.schoolLon || ''}
                      onChange={(e) => setSettings(prev => ({ ...prev, schoolLon: e.target.value }))}
                      className="flex-1 px-3 py-1.5 rounded-lg border border-orange-100 text-xs outline-none"
                      placeholder="Lon"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-orange-600 mb-1">{content.homeAddressLabel}</label>
                  <input
                    type="text"
                    value={settings.homeAddress || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, homeAddress: e.target.value }))}
                    className="w-full px-4 py-2 rounded-xl border-2 border-orange-200 focus:border-orange-500 outline-none mb-2"
                    placeholder="📍 ..."
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={settings.homeLat || ''}
                      onChange={(e) => setSettings(prev => ({ ...prev, homeLat: e.target.value }))}
                      className="flex-1 px-3 py-1.5 rounded-lg border border-orange-100 text-xs outline-none"
                      placeholder="Lat"
                    />
                    <input
                      type="text"
                      value={settings.homeLon || ''}
                      onChange={(e) => setSettings(prev => ({ ...prev, homeLon: e.target.value }))}
                      className="flex-1 px-3 py-1.5 rounded-lg border border-orange-100 text-xs outline-none"
                      placeholder="Lon"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Sensory Settings Section */}
            <div className="space-y-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 shadow-sm">
              <h4 className="text-lg font-bold text-emerald-700 flex items-center gap-2">
                <span>{content.sensoryTitle}</span>
              </h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-gray-700 font-semibold">{content.sensoryBatteryLabel}</label>
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, sensoryBatteryEnabled: !prev.sensoryBatteryEnabled }))}
                    className={`relative w-14 h-7 rounded-full transition-colors ${
                      settings.sensoryBatteryEnabled ? 'bg-emerald-500' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${settings.sensoryBatteryEnabled ? 'translate-x-7' : 'translate-x-0'}`} />
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-bold text-emerald-600 mb-2">{content.sensorySensitivityLabel}: {settings.sensorySensitivityLevel}</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={settings.sensorySensitivityLevel || 5}
                    onChange={(e) => setSettings(prev => ({ ...prev, sensorySensitivityLevel: parseInt(e.target.value) }))}
                    className="w-full h-2 bg-emerald-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Voice & Schedule Section */}
            <div className="space-y-4 p-4 bg-amber-50 rounded-2xl border border-amber-100 shadow-sm">
              <h4 className="text-lg font-bold text-amber-700 flex items-center gap-2">
                <span>{content.scheduleTitle}</span>
              </h4>
              <div className="space-y-4">
                {/* Timing Hours */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-white rounded-xl">
                    <label className="block text-xs font-bold text-amber-600 mb-1">🌅 {content.morningHourLabel}</label>
                    <select
                      value={settings.morningModeStartHour}
                      onChange={(e) => setSettings(prev => ({ ...prev, morningModeStartHour: parseInt(e.target.value) }))}
                      className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                    >
                      {Array.from({ length: 6 }, (_, i) => i + 5).map(h => (
                        <option key={h} value={h}>{h}:00</option>
                      ))}
                    </select>
                  </div>
                  <div className="p-3 bg-white rounded-xl">
                    <label className="block text-xs font-bold text-amber-600 mb-1">🌙 {content.nightHourLabel}</label>
                    <select
                      value={settings.nightModeStartHour}
                      onChange={(e) => setSettings(prev => ({ ...prev, nightModeStartHour: parseInt(e.target.value) }))}
                      className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                    >
                      {Array.from({ length: 6 }, (_, i) => i + 18).map(h => (
                        <option key={h} value={h}>{h}:00</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency Reset Prominent */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-6 bg-red-50 rounded-[32px] border-2 border-red-100 flex flex-col items-center text-center space-y-3">
                <div className="text-4xl">🆘</div>
                <h4 className="text-xl font-black text-red-600">{language === Language.HEBREW ? 'זקוקים לאתחול?' : 'Need a Reset?'}</h4>
                <p className="text-sm text-red-400 font-bold">{language === Language.HEBREW ? 'אם התצוגה נתקעה או שרוצים לחזור לדף הבית במהירות' : 'If the screen is stuck or you want to return home quickly'}</p>
                <button
                  onClick={() => {
                    onEmergencyReset?.();
                    onClose();
                  }}
                  className="w-full py-4 bg-white text-red-600 border-b-4 border-red-200 rounded-2xl font-black text-xl active:translate-y-1 active:border-b-0 transition-all"
                >
                  {content.emergencyResetLabel}
                </button>
              </div>

              <div className="p-6 bg-orange-50 rounded-[32px] border-2 border-orange-100 flex flex-col items-center text-center space-y-3">
                <div className="text-4xl">🔄</div>
                <h4 className="text-xl font-black text-orange-600">
                  {language === Language.HEBREW ? 'התחלה מחדש' : 'Restart Game'}
                </h4>
                <p className="text-sm text-orange-400 font-bold">
                  {language === Language.HEBREW 
                    ? 'חזרה למסך הפתיחה לבחירה מחדש של גיל, שם וחיה מועדפת' 
                    : 'Return to opening screen to choose age, name and favorite animal'}
                </p>
                <button
                  onClick={() => {
                    if (window.confirm(content.fullResetConfirm)) {
                      onFullReset?.();
                      onClose();
                    }
                  }}
                  className="w-full py-4 bg-white text-orange-600 border-b-4 border-orange-200 rounded-2xl font-black text-xl active:translate-y-1 active:border-b-0 transition-all"
                >
                  {content.fullResetLabel}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 p-4 rounded-b-2xl flex flex-wrap justify-between items-center gap-3 border-t-2 border-gray-200">
          <div>
            {onEmergencyReset && (
              <button
                onClick={() => {
                  onEmergencyReset();
                  onClose();
                }}
                className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-bold rounded-lg transition-colors flex items-center gap-2"
              >
                🏠 {language === Language.HEBREW ? 'אתחול תצוגה' : 'Reset View'}
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold rounded-lg transition-colors"
            >
              {content.cancel}
            </button>
            <button
              onClick={() => {
                localStorage.setItem('emotimate_app_settings', JSON.stringify(settings));
                onClose();
              }}
              className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-lg transition-all shadow-lg"
            >
              {content.save} ✓
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
