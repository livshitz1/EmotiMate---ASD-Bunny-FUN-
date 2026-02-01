import React, { useState, useEffect, useMemo } from 'react';
import { Language } from '../types';
import { translate } from '../i18n/translations';

interface LeaderboardEntry {
  id: string;
  playerName: string;
  totalPoints: number;
  dailyPoints: number;
  streak: number;
  playTime: number; // in minutes
  lastPlayed: string;
  achievements: number;
  achievementIds?: string[]; // IDs of unlocked achievements
  tasksCompleted?: number; // Total tasks completed
  level?: number; // Player level (calculated from points)
}

interface LeaderboardProps {
  language: Language;
  currentPlayerPoints?: number;
  currentPlayerName?: string;
  onUpdate?: () => void; // Callback to refresh leaderboard
}

const Leaderboard: React.FC<LeaderboardProps> = ({ language, currentPlayerPoints, currentPlayerName, onUpdate }) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [sortBy, setSortBy] = useState<'points' | 'time' | 'streak'>('points');

  useEffect(() => {
    loadLeaderboard();
  }, []);

  // Reload when currentPlayerPoints changes (player earned points)
  useEffect(() => {
    if (currentPlayerPoints !== undefined) {
      loadLeaderboard();
    }
  }, [currentPlayerPoints]);

  // Listen for storage changes (when other tabs update leaderboard)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'emotimate_leaderboard') {
        loadLeaderboard();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const loadLeaderboard = () => {
    try {
      const saved = localStorage.getItem('emotimate_leaderboard');
      if (saved) {
        const entries = JSON.parse(saved);
        if (Array.isArray(entries) && entries.length > 0) {
          setLeaderboard(entries);
        } else {
          setLeaderboard([]);
        }
      } else {
        setLeaderboard([]);
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error);
      setLeaderboard([]);
    }
  };

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    
    if (language === Language.HEBREW) {
      if (days > 0) {
        return `${days} ימים ${remainingHours > 0 ? `${remainingHours} שעות` : ''}`;
      }
      if (hours > 0) {
        return `${hours} שעות ${mins > 0 ? `${mins} דקות` : ''}`;
      }
      return `${mins} דקות`;
    } else if (language === Language.ENGLISH) {
      if (days > 0) {
        return `${days}d ${remainingHours > 0 ? `${remainingHours}h` : ''}`;
      }
      if (hours > 0) {
        return `${hours}h ${mins > 0 ? `${mins}m` : ''}`;
      }
      return `${mins}m`;
    } else {
      if (days > 0) {
        return `${days}д ${remainingHours > 0 ? `${remainingHours}ч` : ''}`;
      }
      if (hours > 0) {
        return `${hours}ч ${mins > 0 ? `${mins}м` : ''}`;
      }
      return `${mins}м`;
    }
  };

  const calculateLevel = (points: number): number => {
    // Level calculation: every 100 points = 1 level
    return Math.floor(points / 100) + 1;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (language === Language.HEBREW) {
      if (diffMins < 1) return 'עכשיו';
      if (diffMins < 60) return `לפני ${diffMins} דקות`;
      if (diffHours < 24) return `לפני ${diffHours} שעות`;
      if (diffDays === 1) return 'אתמול';
      if (diffDays < 7) return `לפני ${diffDays} ימים`;
      return date.toLocaleDateString('he-IL');
    } else if (language === Language.ENGLISH) {
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString('en-US');
    } else {
      if (diffMins < 1) return 'Только что';
      if (diffMins < 60) return `${diffMins}м назад`;
      if (diffHours < 24) return `${diffHours}ч назад`;
      if (diffDays === 1) return 'Вчера';
      if (diffDays < 7) return `${diffDays}д назад`;
      return date.toLocaleDateString('ru-RU');
    }
  };

  const sortedLeaderboard = useMemo(() => {
    if (!leaderboard || leaderboard.length === 0) {
      return [];
    }
    return [...leaderboard].sort((a, b) => {
      switch (sortBy) {
        case 'points':
          return b.totalPoints - a.totalPoints;
        case 'time':
          return b.playTime - a.playTime;
        case 'streak':
          return b.streak - a.streak;
        default:
          return 0;
      }
    });
  }, [leaderboard, sortBy]);

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl shadow-2xl p-6 border-2 border-purple-300 max-w-5xl w-full">
      {/* Header */}
      <div className="text-center mb-6">
        <h3 className="text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
          <span className="text-4xl">🏆</span>
          <span>{language === Language.HEBREW ? 'לוח שחקנים' : language === Language.ENGLISH ? 'Leaderboard' : 'Таблица лидеров'}</span>
        </h3>
        <p className="text-sm text-gray-600">
          {language === Language.HEBREW 
            ? 'טורניר שחקנים - מי הכי טוב?'
            : language === Language.ENGLISH
            ? 'Player Tournament - Who\'s the Best?'
            : 'Турнир игроков - Кто лучший?'}
        </p>
      </div>

      {/* Sort Options */}
      <div className="flex gap-2 mb-6 justify-center flex-wrap">
        <button
          onClick={() => setSortBy('points')}
          className={`px-5 py-2.5 rounded-xl font-semibold transition-all transform hover:scale-105 ${
            sortBy === 'points' 
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' 
              : 'bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-300'
          }`}
        >
          ⭐ {language === Language.HEBREW ? 'נקודות' : language === Language.ENGLISH ? 'Points' : 'Очки'}
        </button>
        <button
          onClick={() => setSortBy('time')}
          className={`px-5 py-2.5 rounded-xl font-semibold transition-all transform hover:scale-105 ${
            sortBy === 'time' 
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' 
              : 'bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-300'
          }`}
        >
          ⏱️ {language === Language.HEBREW ? 'זמן משחק' : language === Language.ENGLISH ? 'Play Time' : 'Время игры'}
        </button>
        <button
          onClick={() => setSortBy('streak')}
          className={`px-5 py-2.5 rounded-xl font-semibold transition-all transform hover:scale-105 ${
            sortBy === 'streak' 
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' 
              : 'bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-300'
          }`}
        >
          🔥 {language === Language.HEBREW ? 'רצף ימים' : language === Language.ENGLISH ? 'Streak' : 'Серия дней'}
        </button>
      </div>

      {/* Leaderboard Table */}
      {!leaderboard || leaderboard.length === 0 ? (
        <div className="text-center py-12 text-gray-500 bg-white rounded-xl border-2 border-dashed border-gray-300">
          <div className="text-5xl mb-4">📊</div>
          <p className="text-lg font-semibold">
            {language === Language.HEBREW 
              ? 'אין שחקנים בלוח השחקנים עדיין'
              : language === Language.ENGLISH
              ? 'No players on leaderboard yet'
              : 'Пока нет игроков в таблице лидеров'}
          </p>
          <p className="text-sm mt-2 text-gray-400">
            {language === Language.HEBREW 
              ? 'התחל לשחק כדי להופיע כאן!'
              : language === Language.ENGLISH
              ? 'Start playing to appear here!'
              : 'Начните играть, чтобы появиться здесь!'}
          </p>
          {currentPlayerName && (
            <p className="text-xs mt-4 text-purple-600">
              {language === Language.HEBREW 
                ? `שלום ${currentPlayerName}! המשך לשחק כדי להופיע בלוח השחקנים.`
                : language === Language.ENGLISH
                ? `Hello ${currentPlayerName}! Keep playing to appear on the leaderboard.`
                : `Привет ${currentPlayerName}! Продолжайте играть, чтобы появиться в таблице лидеров.`}
            </p>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden shadow-lg">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-2 p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-sm">
            <div className="col-span-1 text-center">{language === Language.HEBREW ? 'מקום' : language === Language.ENGLISH ? 'Rank' : 'Место'}</div>
            <div className="col-span-3 text-right">{language === Language.HEBREW ? 'שם שחקן' : language === Language.ENGLISH ? 'Player Name' : 'Имя игрока'}</div>
            <div className="col-span-1 text-center">⭐</div>
            <div className="col-span-1 text-center">{language === Language.HEBREW ? 'נקודות יומיות' : language === Language.ENGLISH ? 'Daily' : 'За день'}</div>
            <div className="col-span-1 text-center">⏱️</div>
            <div className="col-span-1 text-center">🔥</div>
            <div className="col-span-1 text-center">🏅</div>
            <div className="col-span-1 text-center">{language === Language.HEBREW ? 'רמה' : language === Language.ENGLISH ? 'Level' : 'Уровень'}</div>
            <div className="col-span-2 text-center">{language === Language.HEBREW ? 'משחק אחרון' : language === Language.ENGLISH ? 'Last Played' : 'Последняя игра'}</div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-200 max-h-[500px] overflow-y-auto">
            {sortedLeaderboard.map((entry, index) => {
              const isTopThree = index < 3;
              const medalEmojis = ['🥇', '🥈', '🥉'];
              const level = entry.level || calculateLevel(entry.totalPoints);
              const isCurrentPlayer = currentPlayerName === entry.playerName;
              
              return (
                <div
                  key={entry.id}
                  className={`
                    grid grid-cols-12 gap-2 p-4 items-center transition-all hover:bg-gray-50
                    ${isTopThree 
                      ? 'bg-gradient-to-r from-yellow-50 via-orange-50 to-yellow-50 border-l-4 border-yellow-400' 
                      : ''
                    }
                    ${isCurrentPlayer ? 'bg-purple-50 border-l-4 border-purple-500' : ''}
                  `}
                >
                  {/* Rank */}
                  <div className="col-span-1 text-center">
                    <div className={`text-2xl font-bold ${isTopThree ? '' : 'text-gray-600'}`}>
                      {isTopThree ? medalEmojis[index] : `#${index + 1}`}
                    </div>
                  </div>

                  {/* Player Name */}
                  <div className="col-span-3 text-right">
                    <div className="font-bold text-lg text-gray-800 flex items-center gap-2 justify-end">
                      {isCurrentPlayer && <span className="text-purple-600 text-xs">👤</span>}
                      <span>{entry.playerName}</span>
                    </div>
                    {entry.tasksCompleted !== undefined && (
                      <div className="text-xs text-gray-500 mt-1">
                        {entry.tasksCompleted} {language === Language.HEBREW ? 'משימות' : language === Language.ENGLISH ? 'tasks' : 'задач'}
                      </div>
                    )}
                  </div>

                  {/* Total Points */}
                  <div className="col-span-1 text-center">
                    <div className="font-bold text-lg text-yellow-600">
                      {entry.totalPoints.toLocaleString()}
                    </div>
                  </div>

                  {/* Daily Points */}
                  <div className="col-span-1 text-center">
                    <div className="text-sm font-semibold text-blue-600">
                      {entry.dailyPoints}
                    </div>
                  </div>

                  {/* Play Time */}
                  <div className="col-span-1 text-center">
                    <div className="text-sm text-gray-700 font-medium">
                      {formatTime(entry.playTime)}
                    </div>
                  </div>

                  {/* Streak */}
                  <div className="col-span-1 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-orange-500">🔥</span>
                      <span className="text-sm font-semibold text-gray-700">{entry.streak}</span>
                    </div>
                  </div>

                  {/* Achievements */}
                  <div className="col-span-1 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-yellow-500">🏅</span>
                      <span className="text-sm font-semibold text-gray-700">{entry.achievements}</span>
                    </div>
                    {Array.isArray(entry.achievementIds) && entry.achievementIds.length > 0 && (
                      <div className="text-xs text-gray-500 mt-1">
                        {entry.achievementIds.slice(0, 3).map(id => {
                          const achievementEmojis: { [key: string]: string } = {
                            'first_task': '🌟',
                            'five_tasks': '⭐',
                            'all_adl': '🏆',
                            'social_skills': '🤝',
                            'work_skills': '📋',
                            'week_streak': '💫'
                          };
                          return achievementEmojis[id] || '🏅';
                        }).join(' ')}
                        {entry.achievementIds.length > 3 && '...'}
                      </div>
                    )}
                  </div>

                  {/* Level */}
                  <div className="col-span-1 text-center">
                    <div className="inline-flex items-center justify-center bg-gradient-to-r from-purple-400 to-pink-400 text-white rounded-full px-3 py-1 text-sm font-bold shadow-md">
                      {language === Language.HEBREW ? 'רמה' : language === Language.ENGLISH ? 'Lv.' : 'Ур.'} {level}
                    </div>
                  </div>

                  {/* Last Played */}
                  <div className="col-span-2 text-center">
                    <div className="text-xs text-gray-600">
                      {formatDate(entry.lastPlayed)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer Stats */}
      {sortedLeaderboard.length > 0 && (
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 border-2 border-gray-200 text-center">
            <div className="text-2xl font-bold text-purple-600">{sortedLeaderboard.length}</div>
            <div className="text-xs text-gray-600 mt-1">
              {language === Language.HEBREW ? 'סה"כ שחקנים' : language === Language.ENGLISH ? 'Total Players' : 'Всего игроков'}
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border-2 border-gray-200 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {sortedLeaderboard[0]?.totalPoints.toLocaleString() || 0}
            </div>
            <div className="text-xs text-gray-600 mt-1">
              {language === Language.HEBREW ? 'שיא נקודות' : language === Language.ENGLISH ? 'Top Score' : 'Лучший счет'}
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border-2 border-gray-200 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {sortedLeaderboard.length > 0 ? Math.max(...sortedLeaderboard.map(e => e.streak || 0), 0) : 0}
            </div>
            <div className="text-xs text-gray-600 mt-1">
              {language === Language.HEBREW ? 'שיא רצף' : language === Language.ENGLISH ? 'Top Streak' : 'Лучшая серия'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
