import React, { useState, useEffect } from 'react';
import { Language } from '../types';

interface SelfCareTasksProps {
  language: Language;
  onTaskComplete?: (taskLabel: string, allCompleted: boolean) => void;
  onTasksChange?: (completedIds: number[], totalCount: number) => void;
}

const taskSets = [
  [
    { id: 1, label: { he: "💧 שתיית כוס מים", en: "💧 Drinking a glass of water" } },
    { id: 2, label: { he: "🍃 3 נשימות עמוקות", en: "🍃 3 deep breaths" } },
    { id: 3, label: { he: "🤗 חיבוק עצמי", en: "🤗 Self-hug" } },
    { id: 4, label: { he: "🌈 מחשבה חיובית אחת", en: "🌈 One positive thought" } }
  ],
  [
    { id: 5, label: { he: "🍎 אכילת פרי בריא", en: "🍎 Eating a healthy fruit" } },
    { id: 6, label: { he: "🧘 דקה של שקט", en: "🧘 One minute of silence" } },
    { id: 7, label: { he: "✍️ כתיבת מילה טובה", en: "✍️ Writing a kind word" } },
    { id: 8, label: { he: "🦶 מתיחות קלות", en: "🦶 Gentle stretching" } }
  ],
  [
    { id: 9, label: { he: "🛏️ סידור המיטה", en: "🛏️ Making the bed" } },
    { id: 10, label: { he: "🌞 מבט אל השמיים", en: "🌞 Looking at the sky" } },
    { id: 11, label: { he: "🎶 שמיעת שיר אהוב", en: "🎶 Listening to a favorite song" } },
    { id: 12, label: { he: "🧸 חיבוק לצעצוע/חיית מחמד", en: "🧸 Hugging a toy/pet" } }
  ]
];

export default function SelfCareTasks({ language, onTaskComplete, onTasksChange }: SelfCareTasksProps) {
  const [setIndex, setSetIndex] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('emotimate_task_set_index');
      const parsed = saved ? parseInt(saved) : 0;
      return isNaN(parsed) ? 0 : parsed;
    } catch (e) {
      return 0;
    }
  });

  const safeTaskSets = Array.isArray(taskSets) && taskSets.length > 0 ? taskSets : [[]];
  const safeLength = Math.max(1, safeTaskSets.length);
  const currentTasks = safeTaskSets[setIndex % safeLength] || [];

  const [completed, setCompleted] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('emotimate_self_care_completed');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const lastReset = localStorage.getItem('emotimate_self_care_reset_date');
          const today = new Date().toISOString().split('T')[0];
          if (lastReset !== today) {
            localStorage.setItem('emotimate_self_care_reset_date', today);
            return [];
          }
          return parsed;
        }
      }
    } catch (e) {
      console.error("Error parsing self care completed:", e);
    }
    return [];
  });

  const isHebrew = language === 'he';

  useEffect(() => {
    try {
      const today = new Date().toISOString().split('T')[0];
      localStorage.setItem('emotimate_self_care_completed', JSON.stringify(completed));
      localStorage.setItem('emotimate_task_set_index', setIndex.toString());
      localStorage.setItem('emotimate_self_care_reset_date', today);
      
      if (onTasksChange) {
        onTasksChange(Array.isArray(completed) ? completed : [], currentTasks?.length || 0);
      }
    } catch (e) {
      console.error("Error saving self care state:", e);
    }
  }, [completed, setIndex, onTasksChange, currentTasks?.length]);

  const toggleTask = (id: number) => {
    const isNowCompleted = !completed.includes(id);
    const newCompleted = completed.includes(id) 
      ? completed.filter(t => t !== id) 
      : [...completed, id];
    
    setCompleted(newCompleted);

    // Update App state immediately
    if (onTasksChange) {
      onTasksChange(newCompleted, currentTasks?.length || 0);
    }

    if (onTaskComplete) {
      const task = (currentTasks || []).find(t => t && t.id === id);
      if (task && task.label) {
        // Check if ALL tasks in current set are done
        const allSetDone = Array.isArray(currentTasks) && 
                          currentTasks.length > 0 && 
                          currentTasks.every(t => t && Array.isArray(newCompleted) && newCompleted.includes(t.id));
        onTaskComplete(task.label[isHebrew ? 'he' : 'en'] || '', allSetDone);
      }
    }
  };

  const handleNextSet = () => {
    setSetIndex(prev => prev + 1);
    setCompleted([]);
  };

  return (
    <div className="self-care-container transition-all">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <span>🌸</span>
          {isHebrew ? 'משימות טיפול עצמי' : 'Self-Care Tasks'}
          <span className="text-sm bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full ml-2">
            {isHebrew ? `שלב ${setIndex + 1}` : `Level ${setIndex + 1}`}
          </span>
        </h3>
      </div>
      
      <div className="space-y-3">
        {currentTasks.map(task => {
          const isDone = completed.includes(task.id);
          return (
            <button 
              key={task.id}
              onClick={() => toggleTask(task.id)}
              className={`
                w-full text-right flex items-center p-4 rounded-xl transition-all active:scale-95
                ${isDone 
                  ? 'bg-[#6aa84f] text-white shadow-inner opacity-90' 
                  : 'bg-[#444] text-white hover:bg-[#555] shadow-md'}
              `}
              dir={isHebrew ? 'rtl' : 'ltr'}
            >
              <span className={`font-bold text-lg ${isDone ? 'line-through opacity-80' : ''}`}>
                {isHebrew ? task.label.he : task.label.en}
              </span>
              {isDone && (
                <span className="mr-auto ml-2 text-white font-bold text-xl">✓</span>
              )}
            </button>
          );
        })}
      </div>

      {Array.isArray(currentTasks) && currentTasks.length > 0 && currentTasks.every(t => t && Array.isArray(completed) && completed.includes(t.id)) && (
        <button 
          onClick={handleNextSet}
          className="w-full mt-6 p-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold shadow-lg transform transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 animate-bounce"
        >
          <span>✨</span>
          {isHebrew ? 'לשלב הבא!' : 'Next Level!'}
          <span>🚀</span>
        </button>
      )}
    </div>
  );
}
