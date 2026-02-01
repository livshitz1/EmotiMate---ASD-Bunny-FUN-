import React from 'react';
import { RewardState, Achievement } from '../types';

interface RewardsProps {
  rewards: RewardState;
}

const Rewards: React.FC<RewardsProps> = ({ rewards }) => {
  const safeAchievements = (rewards && Array.isArray(rewards.achievements)) ? rewards.achievements : [];
  const unlockedAchievements = safeAchievements.filter(a => a && a.unlocked);
  const lockedAchievements = safeAchievements.filter(a => a && !a.unlocked);

  if (!rewards) return null;

  return (
    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl shadow-lg p-4 border-2 border-yellow-200">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center border-b pb-2 flex items-center justify-center gap-2">
        <span>🏆</span> נקודות והישגים
      </h2>
      
      {/* Points Display */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white rounded-xl p-3 text-center border-2 border-yellow-300">
          <div className="text-3xl font-bold text-yellow-600">{rewards.totalPoints}</div>
          <div className="text-sm text-gray-600 mt-1">נקודות כולל</div>
        </div>
        <div className="bg-white rounded-xl p-3 text-center border-2 border-orange-300">
          <div className="text-3xl font-bold text-orange-600">{rewards.dailyPoints}</div>
          <div className="text-sm text-gray-600 mt-1">נקודות היום</div>
        </div>
      </div>

      {/* Streak */}
      {rewards.streak > 0 && (
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-3 mb-4 text-center border-2 border-purple-300">
          <div className="text-2xl font-bold text-purple-700 flex items-center justify-center gap-2">
            <span>🔥</span> {rewards.streak} ימים רצופים!
          </div>
          <div className="text-xs text-gray-600 mt-1">אתה עושה עבודה מצוינת!</div>
        </div>
      )}

      {/* Achievements */}
      <div className="mt-4">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">הישגים</h3>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {/* Unlocked Achievements */}
          {unlockedAchievements.map((achievement) => (
            <div
              key={achievement.id}
              className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-2 flex items-center gap-3 border-2 border-green-300 animate-pulse"
            >
              <span className="text-2xl">{achievement.icon}</span>
              <div className="flex-1">
                <div className="font-bold text-green-800">{achievement.name}</div>
                <div className="text-xs text-gray-600">{achievement.description}</div>
              </div>
              <span className="text-green-500">✓</span>
            </div>
          ))}
          
          {/* Locked Achievements */}
          {lockedAchievements.map((achievement) => (
            <div
              key={achievement.id}
              className="bg-gray-100 rounded-lg p-2 flex items-center gap-3 border-2 border-gray-300 opacity-60"
            >
              <span className="text-2xl grayscale">{achievement.icon}</span>
              <div className="flex-1">
                <div className="font-bold text-gray-500">{achievement.name}</div>
                <div className="text-xs text-gray-400">{achievement.description}</div>
              </div>
              <span className="text-gray-400">🔒</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Rewards;
