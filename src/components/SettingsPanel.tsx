import React from "react";
import { UserSettings } from "../types/settings";

export default function SettingsPanel({
  settings,
  onChange,
}: {
  settings: UserSettings;
  onChange: (next: UserSettings) => void;
}) {
  return (
    <div className="relative bg-gradient-to-br from-white via-blue-50 to-purple-50 p-6 rounded-3xl shadow-2xl border-2 border-blue-300/50 backdrop-blur-sm"
         style={{
           boxShadow: '0 20px 60px rgba(59, 130, 246, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.5) inset',
         }}>
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 via-purple-400/20 to-pink-400/20 rounded-3xl blur-xl -z-10"></div>
      
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent drop-shadow-lg"
            style={{ textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          ⚙️ הגדרות
        </h3>
        <span className="text-sm text-gray-600 font-medium drop-shadow-sm">נעים ונוח לאוזניים</span>
      </div>

      <div className="space-y-4">
        {/* Sound Enabled Toggle */}
        <div className="flex items-center justify-between py-3 px-4 bg-gradient-to-r from-white/80 to-blue-50/80 rounded-xl border-2 border-blue-200/50 shadow-lg"
             style={{ boxShadow: '0 4px 15px rgba(59, 130, 246, 0.2), inset 0 1px 0 rgba(255,255,255,0.8)' }}>
          <div>
            <div className="font-bold text-gray-800 mb-1 drop-shadow-sm">מצב שקט</div>
            <div className="text-xs text-gray-600">מונע הפתעות קוליות</div>
          </div>
          <button
            onClick={() => onChange({ ...settings, soundEnabled: !settings.soundEnabled })}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 transform hover:scale-105 ${
              settings.soundEnabled 
                ? "bg-gradient-to-br from-green-400 to-emerald-500 text-white shadow-lg" 
                : "bg-gradient-to-br from-gray-300 to-gray-400 text-gray-700 shadow-md"
            }`}
            style={settings.soundEnabled ? {
              boxShadow: '0 4px 15px rgba(34, 197, 94, 0.4), inset 0 1px 0 rgba(255,255,255,0.3)',
              textShadow: '0 2px 4px rgba(0,0,0,0.2)'
            } : {
              boxShadow: '0 4px 12px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.5)'
            }}
          >
            {settings.soundEnabled ? "✓ פועל" : "✗ כבוי"}
          </button>
        </div>

        {/* Autoplay Toggle */}
        <div className="flex items-center justify-between py-3 px-4 bg-gradient-to-r from-white/80 to-purple-50/80 rounded-xl border-2 border-purple-200/50 shadow-lg"
             style={{ boxShadow: '0 4px 15px rgba(168, 85, 247, 0.2), inset 0 1px 0 rgba(255,255,255,0.8)' }}>
          <div>
            <div className="font-bold text-gray-800 mb-1 drop-shadow-sm">ניגון אוטומטי</div>
            <div className="text-xs text-gray-600">מומלץ להשאיר כבוי</div>
          </div>
          <button
            onClick={() => onChange({ ...settings, autoplay: !settings.autoplay })}
            disabled={!settings.soundEnabled}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
              settings.autoplay 
                ? "bg-gradient-to-br from-purple-400 to-pink-500 text-white shadow-lg" 
                : "bg-gradient-to-br from-gray-300 to-gray-400 text-gray-700 shadow-md"
            }`}
            style={settings.autoplay && settings.soundEnabled ? {
              boxShadow: '0 4px 15px rgba(168, 85, 247, 0.4), inset 0 1px 0 rgba(255,255,255,0.3)',
              textShadow: '0 2px 4px rgba(0,0,0,0.2)'
            } : {
              boxShadow: '0 4px 12px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.5)'
            }}
          >
            {settings.autoplay ? "✓ פועל" : "✗ כבוי"}
          </button>
        </div>

        {/* Volume Slider */}
        <div className="py-3 px-4 bg-gradient-to-r from-white/80 to-orange-50/80 rounded-xl border-2 border-orange-200/50 shadow-lg"
             style={{ boxShadow: '0 4px 15px rgba(251, 146, 60, 0.2), inset 0 1px 0 rgba(255,255,255,0.8)' }}>
          <div className="flex items-center justify-between mb-2">
            <div className="font-bold text-gray-800 drop-shadow-sm">🔊 ווליום</div>
            <div className="text-sm font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent"
                 style={{ textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
              {Math.round(settings.volume * 100)}%
            </div>
          </div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={settings.volume}
            disabled={!settings.soundEnabled}
            onChange={(e) => onChange({ ...settings, volume: Number(e.target.value) })}
            className="w-full h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: settings.soundEnabled 
                ? `linear-gradient(to right, #f97316 0%, #f97316 ${settings.volume * 100}%, #e5e7eb ${settings.volume * 100}%, #e5e7eb 100%)`
                : 'linear-gradient(to right, #e5e7eb 0%, #e5e7eb 100%)',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
            }}
          />
        </div>
      </div>
    </div>
  );
}
