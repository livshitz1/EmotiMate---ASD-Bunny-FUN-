import React, { useState } from 'react';
import { Language } from '../types';

interface TimeBlindnessExplanationProps {
  language: Language;
  onClose: () => void;
}

const TimeBlindnessExplanation: React.FC<TimeBlindnessExplanationProps> = ({ language, onClose }) => {
  const [currentStep, setCurrentStep] = useState<number>(0);

  const getContent = () => {
    switch (language) {
      case Language.HEBREW:
        return {
          title: 'איך הארנב עוזר להבין זמן? 🐰',
          steps: [
            {
              title: 'הבעיה: זמן הוא מושג מופשט',
              icon: '⏰',
              content: [
                'עבור רוב האנשים, זמן הוא משהו ש"מרגישים".',
                'אבל עבור ילדים אוטיסטים, הזמן הוא שקוף - אי אפשר לראות אותו, לגעת בו או להחזיק אותו.',
                'מושגים כמו "עוד מעט" או "בעוד 10 דקות" חסרי משמעות רגשית.',
                'הילד חי ב-"עכשיו" נצחי.'
              ],
              animation: '👁️'
            },
            {
              title: 'הפתרון: הארנב כ"עוגן זמן"',
              icon: '🐰',
              content: [
                'הארנב לוקח את הזמן המופשט והופך אותו ליצור חי, ויזואלי ובעל צרכים.',
                'כשהארנב רעב - גם אני צריך לאכול.',
                'כשהארנב עייף - גם אני צריך לנוח.',
                'הארנב הופך את הזמן לחבר שאפשר לראות!'
              ],
              animation: '💡'
            },
            {
              title: 'אסוציאציה של צרכים ביולוגיים',
              icon: '🥕',
              content: [
                'במקום להגיד "עכשיו 13:00, זמן לאכול",',
                'המערכת משתמשת בארנב: "הארנב רעב!"',
                'זה יוצר הזדהות: "אם הארנב רעב, גם אני צריך לאכול".',
                'הטיפול בארנב הופך לטריגר לטיפול בעצמך.'
              ],
              animation: '🤝'
            },
            {
              title: 'ויזואליזציה של זמן אוזל',
              icon: '⏳',
              content: [
                'כשמשחקים, הארנב עושה פעולה והאנרגיה שלו יורדת.',
                'כשהבר נגמר, הארנב "מתעייף" וצריך לנוח.',
                'זה לא שההורה "הרשע" לקח את המשחק,',
                'אלא שהזמן פשוט נגמר - זה אובייקטיבי!'
              ],
              animation: '📊'
            },
            {
              title: 'הכנה למעברים',
              icon: '🔄',
              content: [
                '5 דקות לפני שצריך לצאת, הארנב מתחיל "להתארגן".',
                'מופיע עליו תיק גב או שהוא מחזיק מפתח.',
                'שינוי הצורה של הארנב מאותת: "המצב משתנה".',
                'הילד רואה את הארנב מוכן ומבין שגם הוא צריך להיות מוכן.'
              ],
              animation: '🎒'
            },
            {
              title: 'לסיכום',
              icon: '✨',
              content: [
                'הארנב לא מלמד לקרוא שעון (ידע טכני),',
                'אלא מלמד לחוש את קצב היום דרך אמפתיה, ויזואליזציה ומשחק.',
                'הארנב הופך את הזמן מאויב בלתי נראה לחבר שאפשר לראות!',
                ''
              ],
              animation: '🎉'
            }
          ],
          next: 'הבא',
          prev: 'הקודם',
          close: 'סגור'
        };
      case Language.ENGLISH:
        return {
          title: 'How Does the Rabbit Help Understand Time? 🐰',
          steps: [
            {
              title: 'The Problem: Time is Abstract',
              icon: '⏰',
              content: [
                'For most people, time is something we "feel".',
                'But for autistic children, time is invisible - you can\'t see, touch, or hold it.',
                'Concepts like "soon" or "in 10 minutes" have no emotional meaning.',
                'The child lives in an eternal "now".'
              ],
              animation: '👁️'
            },
            {
              title: 'The Solution: Rabbit as "Time Anchor"',
              icon: '🐰',
              content: [
                'The rabbit takes abstract time and turns it into a living, visual creature with needs.',
                'When the rabbit is hungry - I need to eat too.',
                'When the rabbit is tired - I need to rest too.',
                'The rabbit turns time into a friend you can see!'
              ],
              animation: '💡'
            },
            {
              title: 'Association of Biological Needs',
              icon: '🥕',
              content: [
                'Instead of saying "It\'s 1 PM, time to eat",',
                'The system uses the rabbit: "The rabbit is hungry!"',
                'This creates empathy: "If the rabbit is hungry, I need to eat too".',
                'Caring for the rabbit becomes a trigger for self-care.'
              ],
              animation: '🤝'
            },
            {
              title: 'Visualization of Time Running Out',
              icon: '⏳',
              content: [
                'When playing, the rabbit performs an action and its energy decreases.',
                'When the bar ends, the rabbit "gets tired" and needs to rest.',
                'It\'s not that the parent "took away" the game,',
                'But that time simply ran out - it\'s objective!'
              ],
              animation: '📊'
            },
            {
              title: 'Preparing for Transitions',
              icon: '🔄',
              content: [
                '5 minutes before leaving, the rabbit starts "getting ready".',
                'A backpack appears or it holds a key.',
                'The rabbit\'s shape change signals: "The situation is changing".',
                'The child sees the rabbit ready and understands they need to be ready too.'
              ],
              animation: '🎒'
            },
            {
              title: 'Summary',
              icon: '✨',
              content: [
                'The rabbit doesn\'t teach reading clocks (technical knowledge),',
                'But teaches feeling the rhythm of the day through empathy, visualization, and play.',
                'The rabbit turns time from an invisible enemy into a visible friend!',
                ''
              ],
              animation: '🎉'
            }
          ],
          next: 'Next',
          prev: 'Previous',
          close: 'Close'
        };
      case Language.RUSSIAN:
        return {
          title: 'Как кролик помогает понять время? 🐰',
          steps: [
            {
              title: 'Проблема: Время абстрактно',
              icon: '⏰',
              content: [
                'Для большинства людей время - это то, что мы "чувствуем".',
                'Но для детей с аутизмом время невидимо - его нельзя увидеть, потрогать или удержать.',
                'Понятия вроде "скоро" или "через 10 минут" не имеют эмоционального смысла.',
                'Ребенок живет в вечном "сейчас".'
              ],
              animation: '👁️'
            },
            {
              title: 'Решение: Кролик как "якорь времени"',
              icon: '🐰',
              content: [
                'Кролик берет абстрактное время и превращает его в живое, визуальное существо с потребностями.',
                'Когда кролик голоден - мне тоже нужно есть.',
                'Когда кролик устал - мне тоже нужно отдыхать.',
                'Кролик превращает время в друга, которого можно видеть!'
              ],
              animation: '💡'
            },
            {
              title: 'Ассоциация биологических потребностей',
              icon: '🥕',
              content: [
                'Вместо "Сейчас час дня, пора есть",',
                'Система использует кролика: "Кролик голоден!"',
                'Это создает эмпатию: "Если кролик голоден, мне тоже нужно есть".',
                'Забота о кролике становится триггером для заботы о себе.'
              ],
              animation: '🤝'
            },
            {
              title: 'Визуализация уходящего времени',
              icon: '⏳',
              content: [
                'Во время игры кролик выполняет действие, и его энергия уменьшается.',
                'Когда полоса заканчивается, кролик "устает" и нужен отдых.',
                'Не родитель "забрал" игру,',
                'А время просто закончилось - это объективно!'
              ],
              animation: '📊'
            },
            {
              title: 'Подготовка к переходам',
              icon: '🔄',
              content: [
                'За 5 минут до выхода кролик начинает "собираться".',
                'Появляется рюкзак или он держит ключ.',
                'Изменение формы кролика сигнализирует: "Ситуация меняется".',
                'Ребенок видит готового кролика и понимает, что ему тоже нужно быть готовым.'
              ],
              animation: '🎒'
            },
            {
              title: 'Итог',
              icon: '✨',
              content: [
                'Кролик не учит читать часы (технические знания),',
                'А учит чувствовать ритм дня через эмпатию, визуализацию и игру.',
                'Кролик превращает время из невидимого врага в видимого друга!',
                ''
              ],
              animation: '🎉'
            }
          ],
          next: 'Далее',
          prev: 'Назад',
          close: 'Закрыть'
        };
      default:
        return {
          title: 'How Does the Rabbit Help?',
          steps: [],
          next: 'Next',
          prev: 'Previous',
          close: 'Close'
        };
    }
  };

  const content = getContent();
  const currentStepData = content.steps[currentStep];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full p-8 relative animate-fade-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-3xl font-bold transition-colors"
          aria-label="Close"
        >
          ×
        </button>

        {/* Title */}
        <h2 className="text-3xl font-bold text-purple-600 mb-6 text-center">
          {content.title}
        </h2>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / content.steps.length) * 100}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1 text-center">
            {currentStep + 1} / {content.steps.length}
          </p>
        </div>

        {/* Current Step Content */}
        {currentStepData && (
          <div className="text-center mb-6">
            {/* Icon Animation */}
            <div className="text-7xl mb-4 animate-bounce" style={{ animationDuration: '1.5s' }}>
              {currentStepData.icon}
            </div>
            
            {/* Step Title */}
            <h3 className="text-2xl font-bold text-purple-700 mb-4">
              {currentStepData.title}
            </h3>

            {/* Content */}
            <div className={`bg-purple-50 rounded-2xl p-6 space-y-3 ${
              language === Language.HEBREW ? 'text-right' : 'text-left'
            }`}>
              {currentStepData.content.map((line, index) => (
                <p
                  key={index}
                  className={`text-gray-700 ${
                    line === '' ? 'mb-2' : ''
                  } ${
                    line.startsWith('הארנב') || line.startsWith('The rabbit') || line.startsWith('Кролик')
                      ? 'font-semibold text-purple-600 text-lg'
                      : ''
                  }`}
                >
                  {line}
                </p>
              ))}
            </div>

            {/* Animation Icon */}
            <div className="mt-4 text-4xl animate-pulse">
              {currentStepData.animation}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className={`px-6 py-3 rounded-full font-bold transition-all ${
              currentStep === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-purple-300 hover:bg-purple-400 text-purple-700'
            }`}
          >
            ← {content.prev}
          </button>

          {currentStep < content.steps.length - 1 ? (
            <button
              onClick={() => setCurrentStep(Math.min(content.steps.length - 1, currentStep + 1))}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-full transition-all transform hover:scale-105"
            >
              {content.next} →
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold rounded-full transition-all transform hover:scale-105"
            >
              {content.close} ✓
            </button>
          )}
        </div>
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
      `}</style>
    </div>
  );
};

export default TimeBlindnessExplanation;
