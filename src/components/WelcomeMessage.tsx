import React from 'react';
import { Language } from '../types';

interface WelcomeMessageProps {
  language: Language;
  onClose: () => void;
}

const WelcomeMessage: React.FC<WelcomeMessageProps> = ({ language, onClose }) => {
  const getContent = () => {
    switch (language) {
      case Language.HEBREW:
        return {
          title: 'ברוכים הבאים ל-EmotiMate! 🎉',
          subtitle: 'החבר הדיגיטלי שלך לעזרה בתפיסת זמן',
          description: [
            'EmotiMate הוא משחק מיוחד שנועד לעזור לילדים עם אוטיזם להבין ולחוש את הזמן בצורה טובה יותר.',
            '',
            '🎯 הבעיה: זמן הוא מושג מופשט',
            'עבור ילדים אוטיסטים, זמן הוא שקוף - אי אפשר לראות אותו או לגעת בו. מושגים כמו "עוד מעט" או "בעוד 10 דקות" חסרי משמעות רגשית.',
            '',
            '💡 הפתרון: הארנב כ"עוגן זמן" קונקרטי',
            'הארנב לוקח את הזמן המופשט והופך אותו ליצור חי, ויזואלי ובעל צרכים. זה מאפשר לבנות אסוציאציות בין מצב הארנב לבין המצב בעולם האמיתי.',
            '',
            'במשחק תוכלו:',
            '• לטפל בחבר דיגיטלי (ארנב, חתול או כלב)',
            '• לראות את הארנב מגיב לזמן - רעב כשצריך לאכול, עייף כשצריך לנוח',
            '• לבצע משימות יומיות ולקבל נקודות',
            '• לראות טיימרים ויזואליים שמראים כמה זמן נותר',
            '• לקבל תזכורות וסיוע במעברים בין פעילויות',
            '',
            'הארנב הופך את הזמן מאויב בלתי נראה לחבר שאפשר לראות! 🐰'
          ],
          button: 'בואו נתחיל! 🚀'
        };
      case Language.ENGLISH:
        return {
          title: 'Welcome to EmotiMate! 🎉',
          subtitle: 'Your Digital Companion for Time Awareness',
          description: [
            'EmotiMate is a special game designed to help children with autism understand and sense time better.',
            '',
            '🎯 The Problem: Time is Abstract',
            'For autistic children, time is invisible - you can\'t see or touch it. Concepts like "soon" or "in 10 minutes" have no emotional meaning.',
            '',
            '💡 The Solution: The Rabbit as a Concrete "Time Anchor"',
            'The rabbit takes abstract time and turns it into a living, visual creature with needs. This allows building associations between the rabbit\'s state and real-world situations.',
            '',
            'In the game you can:',
            '• Take care of a digital pet (rabbit, cat, or dog)',
            '• See the rabbit respond to time - hungry when it\'s time to eat, tired when it\'s time to rest',
            '• Complete daily tasks and earn points',
            '• See visual timers showing how much time is left',
            '• Get reminders and help with transitions between activities',
            '',
            'The rabbit turns time from an invisible enemy into a visible friend! 🐰'
          ],
          button: "Let's Start! 🚀"
        };
      case Language.RUSSIAN:
        return {
          title: 'Добро пожаловать в EmotiMate! 🎉',
          subtitle: 'Ваш цифровой помощник для восприятия времени',
          description: [
            'EmotiMate — это специальная игра, разработанная для помощи детям с аутизмом лучше понимать и чувствовать время.',
            '',
            '🎯 Проблема: Время абстрактно',
            'Для детей с аутизмом время невидимо - его нельзя увидеть или потрогать. Понятия вроде "скоро" или "через 10 минут" не имеют эмоционального смысла.',
            '',
            '💡 Решение: Кролик как конкретный "якорь времени"',
            'Кролик берет абстрактное время и превращает его в живое, визуальное существо с потребностями. Это позволяет строить ассоциации между состоянием кролика и реальными ситуациями.',
            '',
            'В игре вы можете:',
            '• Заботиться о цифровом питомце (кролик, кошка или собака)',
            '• Видеть, как кролик реагирует на время - голоден, когда пора есть, устал, когда пора отдыхать',
            '• Выполнять ежедневные задачи и зарабатывать очки',
            '• Видеть визуальные таймеры, показывающие, сколько времени осталось',
            '• Получать напоминания и помощь при переходах между активностями',
            '',
            'Кролик превращает время из невидимого врага в видимого друга! 🐰'
          ],
          button: 'Начнем! 🚀'
        };
      default:
        return {
          title: 'Welcome! 🎉',
          subtitle: '',
          description: [],
          button: 'Start'
        };
    }
  };

  const content = getContent();

  return (
    <div className="fixed inset-0 bg-black/60 z-50 overflow-y-auto p-4 py-12 scroll-touch">
      <div className="unity-card rounded-3xl shadow-2xl max-w-2xl w-full p-6 md:p-8 relative animate-fade-in mx-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-3xl font-bold transition-colors z-20 unity-button"
          aria-label="Close"
        >
          ×
        </button>

        {/* Content Wrapper */}
        <div className="text-center">
          {/* Icon */}
          <div className="text-7xl mb-4 animate-bounce-subtle text-glow">
            🐰
          </div>

          {/* Title */}
          <h1 className="text-2xl md:text-4xl font-bold gradient-text mb-2 px-6">
            {content.title}
          </h1>

          {/* Subtitle */}
          <p className="text-lg text-purple-600 mb-6 text-glow-soft">
            {content.subtitle}
          </p>

          {/* Description */}
          <div className={`bg-white/40 backdrop-blur-md border border-white/20 rounded-2xl p-4 md:p-6 mb-6 space-y-2 ${
            language === Language.HEBREW ? 'text-right' : 'text-left'
          }`}>
            {content.description.map((line, index) => (
              <p
                key={index}
                className={`text-gray-800 text-sm md:text-base ${
                  line.startsWith('•') ? (language === Language.HEBREW ? 'mr-4' : 'ml-4') : line === '' ? 'mb-2' : ''
                } ${
                  line.startsWith('EmotiMate') || line.startsWith('במשחק') || line.startsWith('В игре') || 
                  line.startsWith('🎯') || line.startsWith('💡')
                    ? 'font-bold text-purple-800'
                    : ''
                } ${
                  line.startsWith('🎯') || line.startsWith('💡')
                    ? 'text-lg mt-3 text-glow-soft'
                    : ''
                }`}
              >
                {line}
              </p>
            ))}
          </div>

          {/* Features icons */}
          <div className="flex justify-center gap-4 mb-6 text-4xl">
            <span className="text-glow" title={language === Language.HEBREW ? 'טיימר ויזואלי' : language === Language.ENGLISH ? 'Visual Timer' : 'Визуальный таймер'}>⏰</span>
            <span className="text-glow" title={language === Language.HEBREW ? 'משימות יומיות' : language === Language.ENGLISH ? 'Daily Tasks' : 'Ежедневные задачи'}>✅</span>
            <span className="text-glow" title={language === Language.HEBREW ? 'נקודות וגמולים' : language === Language.ENGLISH ? 'Points & Rewards' : 'Очки и награды'}>🏆</span>
            <span className="text-glow" title={language === Language.HEBREW ? 'חבר דיגיטלי' : language === Language.ENGLISH ? 'Digital Pet' : 'Цифровой питомец'}>🐾</span>
          </div>

          {/* Start button */}
          <button
            onClick={onClose}
            className="unity-button unity-glow bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold text-xl py-4 px-8 rounded-full shadow-lg transition-all transform hover:scale-105 mb-2"
          >
            {content.button}
          </button>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-20 h-20 bg-purple-200 rounded-full opacity-20 -z-10 particles"></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-pink-200 rounded-full opacity-20 -z-10 particles"></div>
      </div>

      {/* CSS Animation */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        .scroll-touch {
          -webkit-overflow-scrolling: touch;
        }
      `}</style>
    </div>
  );
};

export default WelcomeMessage;
