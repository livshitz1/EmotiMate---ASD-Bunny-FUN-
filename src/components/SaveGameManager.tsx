import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { translate } from '../i18n/translations';

interface SavedGame {
  id: string;
  name: string;
  savedAt: string;
  data: any;
}

interface SaveGameManagerProps {
  language: Language;
  onSave: (name: string) => void;
  onLoad: (gameData: any) => void;
  onNewGame: () => void;
}

const SaveGameManager: React.FC<SaveGameManagerProps> = ({ language, onSave, onLoad, onNewGame }) => {
  const [savedGames, setSavedGames] = useState<SavedGame[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [saveName, setSaveName] = useState('');

  useEffect(() => {
    loadSavedGames();
  }, []);

  const loadSavedGames = () => {
    const saved = localStorage.getItem('emotimate_saved_games');
    if (saved) {
      try {
        setSavedGames(JSON.parse(saved));
      } catch {
        setSavedGames([]);
      }
    }
  };

  const handleSave = () => {
    if (saveName.trim()) {
      onSave(saveName.trim());
      setSaveName('');
      setShowSaveDialog(false);
      loadSavedGames();
    }
  };

  const handleLoad = (game: SavedGame) => {
    onLoad(game.data);
    setShowLoadDialog(false);
  };

  const handleDelete = (id: string) => {
    const updated = savedGames.filter(g => g.id !== id);
    setSavedGames(updated);
    localStorage.setItem('emotimate_saved_games', JSON.stringify(updated));
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 border-2 border-purple-200">
      <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
        💾 {language === Language.HEBREW ? 'ניהול משחקים' : language === Language.ENGLISH ? 'Game Management' : 'Управление играми'}
      </h3>

      <div className="space-y-3">
        <button
          onClick={() => setShowSaveDialog(true)}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
        >
          {language === Language.HEBREW ? '💾 שמור משחק' : language === Language.ENGLISH ? '💾 Save Game' : '💾 Сохранить игру'}
        </button>

        <button
          onClick={() => setShowLoadDialog(true)}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
        >
          {language === Language.HEBREW ? '📂 טען משחק' : language === Language.ENGLISH ? '📂 Load Game' : '📂 Загрузить игру'}
        </button>

        <button
          onClick={onNewGame}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
        >
          {language === Language.HEBREW ? '🔄 התחל משחק חדש' : language === Language.ENGLISH ? '🔄 New Game' : '🔄 Новая игра'}
        </button>
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h4 className="text-lg font-bold mb-4">
              {language === Language.HEBREW ? 'שמור משחק' : language === Language.ENGLISH ? 'Save Game' : 'Сохранить игру'}
            </h4>
            <input
              type="text"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder={language === Language.HEBREW ? 'הכנס שם למשחק...' : language === Language.ENGLISH ? 'Enter game name...' : 'Введите название игры...'}
              className="w-full border-2 border-gray-300 rounded-lg p-3 mb-4"
              onKeyPress={(e) => e.key === 'Enter' && handleSave()}
            />
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg"
              >
                {language === Language.HEBREW ? 'שמור' : language === Language.ENGLISH ? 'Save' : 'Сохранить'}
              </button>
              <button
                onClick={() => {
                  setShowSaveDialog(false);
                  setSaveName('');
                }}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg"
              >
                {language === Language.HEBREW ? 'ביטול' : language === Language.ENGLISH ? 'Cancel' : 'Отмена'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Load Dialog */}
      {showLoadDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <h4 className="text-lg font-bold mb-4">
              {language === Language.HEBREW ? 'טען משחק' : language === Language.ENGLISH ? 'Load Game' : 'Загрузить игру'}
            </h4>
            {savedGames.length === 0 ? (
              <p className="text-gray-600 text-center py-4">
                {language === Language.HEBREW ? 'אין משחקים שמורים' : language === Language.ENGLISH ? 'No saved games' : 'Нет сохраненных игр'}
              </p>
            ) : (
              <div className="space-y-2">
                {savedGames.map((game) => (
                  <div
                    key={game.id}
                    className="flex items-center justify-between p-3 border-2 border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="font-bold text-gray-800">{game.name}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(game.savedAt).toLocaleString(language === Language.HEBREW ? 'he-IL' : language === Language.ENGLISH ? 'en-US' : 'ru-RU')}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleLoad(game)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                      >
                        {language === Language.HEBREW ? 'טען' : language === Language.ENGLISH ? 'Load' : 'Загрузить'}
                      </button>
                      <button
                        onClick={() => handleDelete(game.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                      >
                        {language === Language.HEBREW ? 'מחק' : language === Language.ENGLISH ? 'Delete' : 'Удалить'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={() => setShowLoadDialog(false)}
              className="w-full mt-4 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg"
            >
              {language === Language.HEBREW ? 'סגור' : language === Language.ENGLISH ? 'Close' : 'Закрыть'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SaveGameManager;
