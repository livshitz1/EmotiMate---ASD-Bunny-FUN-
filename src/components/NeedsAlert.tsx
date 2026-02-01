import React from 'react';
import { BunnyState, Emotion, Language } from '../types';
import { translate } from '../i18n/translations';

interface NeedsAlertProps {
  bunny: BunnyState;
  language: Language;
}

const NeedsAlert: React.FC<NeedsAlertProps> = ({ bunny, language }) => {
  const alerts: Array<{ condition: boolean; message: string; icon: string; color: string }> = [
    {
      condition: bunny.hunger < 20,
      message: translate('petVeryHungry', language),
      icon: '🥕',
      color: 'bg-red-100 border-red-400 text-red-800'
    },
    {
      condition: bunny.energy < 20,
      message: translate('petVeryTired', language),
      icon: '😴',
      color: 'bg-blue-100 border-blue-400 text-blue-800'
    },
    {
      condition: bunny.happiness < 30,
      message: translate('petVerySad', language),
      icon: '😢',
      color: 'bg-purple-100 border-purple-400 text-purple-800'
    },
    {
      condition: bunny.hunger < 50 && bunny.hunger >= 20,
      message: translate('petGettingHungry', language),
      icon: '🍽️',
      color: 'bg-orange-100 border-orange-400 text-orange-800'
    },
    {
      condition: bunny.energy < 50 && bunny.energy >= 20,
      message: translate('petGettingTired', language),
      icon: '💤',
      color: 'bg-yellow-100 border-yellow-400 text-yellow-800'
    }
  ];

  const activeAlerts = alerts.filter(alert => alert.condition);

  if (activeAlerts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {activeAlerts.map((alert, index) => (
        <div
          key={index}
          className={`${alert.color} border-2 rounded-xl p-3 flex items-center gap-3 animate-pulse shadow-lg`}
        >
          <span className="text-2xl">{alert.icon}</span>
          <span className="font-bold text-sm flex-1">{alert.message}</span>
        </div>
      ))}
    </div>
  );
};

export default NeedsAlert;
