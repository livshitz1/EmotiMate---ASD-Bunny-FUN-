import React from 'react';
import { ScheduleItem, TimeOfDay } from '../types';

interface VisualScheduleProps {
  schedule: ScheduleItem[];
  onToggleTask: (id: string) => void;
  currentTimeOfDay: TimeOfDay;
}

const VisualSchedule: React.FC<VisualScheduleProps> = ({ schedule, onToggleTask, currentTimeOfDay }) => {
  
  // Filter relevant tasks to reduce clutter, or show all with highlighting
  const currentTasks = schedule; 

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 h-full overflow-y-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center border-b pb-2">סדר יום</h2>
      <div className="space-y-3">
        {currentTasks.map((item) => {
          const isCurrentTime = item.timeOfDay === currentTimeOfDay;
          
          return (
            <div 
              key={item.id}
              onClick={() => onToggleTask(item.id)}
              className={`
                relative flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all duration-300
                ${item.completed ? 'bg-green-50 border-green-200 opacity-70' : 'bg-white hover:bg-gray-50'}
                ${!item.completed && isCurrentTime ? 'border-purple-500 ring-2 ring-purple-200 scale-[1.02]' : 'border-gray-100'}
              `}
            >
              <div className="text-3xl ml-3">{item.icon}</div>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                   <h3 className={`font-bold ${item.completed ? 'text-green-700 line-through' : 'text-gray-800'}`}>
                    {item.task}
                  </h3>
                  <span className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-1 rounded-md">{item.timeLabel}</span>
                </div>
                {isCurrentTime && !item.completed && (
                  <p className="text-xs text-purple-600 font-semibold mt-1">עכשיו!</p>
                )}
              </div>
              
              {item.completed && (
                <div className="absolute left-3 bg-green-500 text-white rounded-full p-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
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