import React, { useState, useEffect } from 'react';
import { ScheduleItem, TimeOfDay, TaskCategory, Language } from '../types';
import TaskTimer from './TaskTimer';
import VisualTimer from './VisualTimer';

interface VisualScheduleProps {
  schedule: ScheduleItem[];
  onToggleTask: (id: string) => void;
  onToggleSubTask?: (taskId: string, subTaskId: string) => void;
  currentTimeOfDay: TimeOfDay;
  currentActiveTaskId?: string | null;
  language?: Language;
  currentTime: Date;
}

const categoryColors: Record<TaskCategory, string> = {
  adl: 'bg-blue-100 text-blue-700 border-blue-300',
  work: 'bg-purple-100 text-purple-700 border-purple-300',
  social: 'bg-pink-100 text-pink-700 border-pink-300',
  leisure: 'bg-yellow-100 text-yellow-700 border-yellow-300',
};

const categoryLabels: Record<TaskCategory, string> = {
  adl: 'יומיום',
  work: 'עבודה',
  social: 'חברתי',
  leisure: 'פנאי',
};

const VisualSchedule: React.FC<VisualScheduleProps> = ({ schedule, onToggleTask, onToggleSubTask, currentTimeOfDay, currentActiveTaskId, language = Language.HEBREW, currentTime }) => {
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  
  // Filter relevant tasks to reduce clutter, or show all with highlighting
  const currentTasks = schedule;

  const toggleExpand = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  const handleSubTaskClick = (taskId: string, subTaskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleSubTask) {
      onToggleSubTask(taskId, subTaskId);
    }
  };

  const getCompletedSubTasksCount = (item: ScheduleItem) => {
    if (!item || !Array.isArray(item.subTasks)) return 0;
    return item.subTasks.filter(st => st && st.completed).length;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 h-full overflow-y-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center border-b pb-2 flex items-center justify-center gap-2">
        <span>📅</span> סדר יום
      </h2>
      <div className="space-y-3">
        {currentTasks.map((item) => {
          const isCurrentTime = item.timeOfDay === currentTimeOfDay;
          const category = item.category || 'adl';
          const isExpanded = expandedTasks.has(item.id);
          const hasSubTasks = Array.isArray(item.subTasks) && item.subTasks.length > 0;
          const completedSubTasks = getCompletedSubTasksCount(item);
          const totalSubTasks = Array.isArray(item.subTasks) ? item.subTasks.length : 0;
          
          const isActive = currentActiveTaskId === item.id;
          const isLocked = currentActiveTaskId !== null && currentActiveTaskId !== item.id && !item.completed;
          
          return (
            <div key={item.id} className="space-y-2">
              <div 
                onClick={() => {
                  if (!isLocked) {
                    onToggleTask(item.id);
                  }
                }}
                className={`
                  relative rounded-xl border-2 transition-all duration-300
                  ${item.completed ? 'bg-green-50 border-green-200 opacity-70' : 'bg-white'}
                  ${isActive && !item.completed ? 'border-purple-500 ring-4 ring-purple-300 scale-[1.02] shadow-lg cursor-pointer' : ''}
                  ${!isActive && !item.completed && !isLocked ? 'border-gray-100 hover:bg-gray-50 cursor-pointer' : ''}
                  ${isLocked ? 'border-gray-200 bg-gray-100 opacity-50 cursor-not-allowed' : ''}
                `}
              >
                {/* Visual Timer for Active Tasks */}
                {isActive && !item.completed && (
                  <div className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 border-b-2 border-purple-200">
                    <VisualTimer task={item} currentTime={currentTime} language={language} isActive={true} />
                  </div>
                )}
                
                <div className="flex items-center p-3">
                  <div className="text-3xl ml-3">{item.icon}</div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-2">
                        <h3 className={`font-bold ${item.completed ? 'text-green-700 line-through' : 'text-gray-800'}`}>
                          {item.task}
                        </h3>
                        {item.category && (
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${categoryColors[category]}`}>
                            {categoryLabels[category]}
                          </span>
                        )}
                        {hasSubTasks && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-300">
                            {completedSubTasks}/{totalSubTasks} תת-משימות
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-1 rounded-md">{item.timeLabel}</span>
                        {hasSubTasks && (
                          <button
                            onClick={(e) => toggleExpand(item.id, e)}
                            className="text-gray-500 hover:text-gray-700 transition-colors"
                          >
                            {isExpanded ? '▼' : '▶'}
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        {isActive && !item.completed && (
                          <p className="text-xs text-purple-600 font-semibold animate-pulse bg-purple-100 px-2 py-1 rounded-full">✨ משימה פעילה</p>
                        )}
                        {isLocked && (
                          <p className="text-xs text-gray-500 font-semibold bg-gray-200 px-2 py-1 rounded-full">🔒 נעול</p>
                        )}
                        {!isActive && !isLocked && isCurrentTime && !item.completed && (
                          <p className="text-xs text-purple-600 font-semibold animate-pulse">✨ עכשיו!</p>
                        )}
                        {!item.completed && !isLocked && !isActive && (
                          <TaskTimer task={item} currentTime={currentTime} />
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {item.points && !item.completed && (
                          <span className="text-xs font-bold text-yellow-600 flex items-center gap-1">
                            <span>⭐</span> {item.points} נקודות
                          </span>
                        )}
                        {item.completed && item.points && (
                          <span className="text-xs font-bold text-green-600 flex items-center gap-1">
                            <span>✓</span> +{item.points} נקודות
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {item.completed && (
                  <div className="absolute left-3 bg-green-500 text-white rounded-full p-1 animate-bounce">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                )}
              </div>
              
              {/* Sub-tasks */}
              {isExpanded && Array.isArray(item.subTasks) && item.subTasks.length > 0 && (
                <div className="mr-4 space-y-2 border-r-2 border-blue-200 pr-2">
                  {item.subTasks.map((subTask) => (
                    <div
                      key={subTask.id}
                      onClick={(e) => handleSubTaskClick(item.id, subTask.id, e)}
                      className={`
                        flex items-center p-2 rounded-lg border cursor-pointer transition-all
                        ${subTask.completed ? 'bg-green-50 border-green-200 opacity-70' : 'bg-gray-50 hover:bg-gray-100 border-gray-200'}
                      `}
                    >
                      <div className="flex items-center gap-2 flex-1">
                        {subTask.icon && <span className="text-xl">{subTask.icon}</span>}
                        <span className={`text-sm ${subTask.completed ? 'text-green-700 line-through' : 'text-gray-700'}`}>
                          {subTask.text}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {subTask.points && !subTask.completed && (
                          <span className="text-xs font-bold text-yellow-600">+{subTask.points}</span>
                        )}
                        {subTask.completed && (
                          <span className="text-green-500">✓</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VisualSchedule;