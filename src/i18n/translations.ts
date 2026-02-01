import { Language } from '../types';

export const translations = {
  [Language.HEBREW]: {
    // General
    appName: 'EmotiMate',
    welcome: 'שלום! אני החבר הדיגיטלי שלך. איך אתה מרגיש היום?',
    
    // Emotions
    happy: 'שמח',
    sad: 'עצוב',
    tired: 'עייף',
    hungry: 'רעב',
    neutral: 'רגוע',
    
    // Time of day
    morning: 'בוקר',
    afternoon: 'צהריים',
    evening: 'ערב',
    night: 'לילה',
    goodMorning: 'בוקר טוב! היום מתחיל! 🌅',
    goodAfternoon: 'צהריים נעימים! ☀️',
    goodEvening: 'ערב טוב! 🌆',
    goodNight: 'לילה טוב! 🌙',
    
    // Tasks
    schedule: 'סדר יום',
    task: 'משימה',
    completed: 'הושלם',
    activeTask: 'משימה פעילה',
    locked: 'נעול',
    now: 'עכשיו!',
    points: 'נקודות',
    subTasks: 'תת-משימות',
    
    // Rewards
    rewards: 'פרסים',
    totalPoints: 'נקודות כולל',
    dailyPoints: 'נקודות יומיות',
    streak: 'רצף ימים',
    achievements: 'הישגים',
    
    // Customization
    customize: 'עיצוב החבר שלך',
    selectPet: 'בחר את החבר שלך',
    bunny: 'ארנב',
    maineCoon: 'חתול מיינקון',
    dog: 'כלב',
    hat: 'כובע',
    bow: 'פפיון',
    clothing: 'ביגוד',
    background: 'רקע',
    color: 'צבע',
    
    // Alerts
    petVeryHungry: 'החבר רעב מאוד! צריך להאכיל אותו!',
    petVeryTired: 'החבר עייף מאוד! צריך לנוח!',
    petVerySad: 'החבר עצוב! צריך לשחק איתו!',
    petGettingHungry: 'החבר מתחיל להיות רעב',
    petGettingTired: 'החבר מתחיל להיות עייף',
    
    // Activity
    dailyActivity: 'פעילות היום',
    tasksCompleted: 'משימות הושלמו',
    lastActivity: 'פעילות אחרונה',
    
    // Messages
    taskCompleted: 'כל הכבוד! סיימת את המשימה: {task}! קיבלת {points} נקודות! 🎉',
    nextTask: 'כל הכבוד! המשימה הבאה שלך: {task} {icon}',
    allTasksCompleted: '🎉 כל הכבוד! סיימת את כל המשימות היום! אתה מדהים! 🌟',
    mustCompleteCurrent: 'עליך לסיים את המשימה הנוכחית לפני שתוכל להתחיל משימה אחרת! 💪',
    
    // Status
    hunger: 'רעב',
    energy: 'אנרגיה',
    happiness: 'שמחה',
    mood: 'מצב רוח',
    
    // Language
    language: 'שפה',
    hebrew: 'עברית',
    english: 'אנגלית',
    russian: 'רוסית',
  },
  
  [Language.ENGLISH]: {
    // General
    appName: 'EmotiMate',
    welcome: 'Hello! I\'m your digital friend. How are you feeling today?',
    
    // Emotions
    happy: 'Happy',
    sad: 'Sad',
    tired: 'Tired',
    hungry: 'Hungry',
    neutral: 'Calm',
    
    // Time of day
    morning: 'Morning',
    afternoon: 'Afternoon',
    evening: 'Evening',
    night: 'Night',
    goodMorning: 'Good morning! The day begins! 🌅',
    goodAfternoon: 'Good afternoon! ☀️',
    goodEvening: 'Good evening! 🌆',
    goodNight: 'Good night! 🌙',
    
    // Tasks
    schedule: 'Daily Schedule',
    task: 'Task',
    completed: 'Completed',
    activeTask: 'Active Task',
    locked: 'Locked',
    now: 'Now!',
    points: 'Points',
    subTasks: 'Sub-tasks',
    
    // Rewards
    rewards: 'Rewards',
    totalPoints: 'Total Points',
    dailyPoints: 'Daily Points',
    streak: 'Day Streak',
    achievements: 'Achievements',
    
    // Customization
    customize: 'Customize Your Friend',
    selectPet: 'Choose Your Friend',
    bunny: 'Bunny',
    maineCoon: 'Maine Coon',
    dog: 'Dog',
    hat: 'Hat',
    bow: 'Bow',
    clothing: 'Clothing',
    background: 'Background',
    color: 'Color',
    
    // Alerts
    petVeryHungry: 'Your friend is very hungry! Need to feed them!',
    petVeryTired: 'Your friend is very tired! Need to rest!',
    petVerySad: 'Your friend is sad! Need to play with them!',
    petGettingHungry: 'Your friend is getting hungry',
    petGettingTired: 'Your friend is getting tired',
    
    // Activity
    dailyActivity: 'Daily Activity',
    tasksCompleted: 'tasks completed',
    lastActivity: 'Last Activity',
    
    // Messages
    taskCompleted: 'Great job! You completed the task: {task}! You got {points} points! 🎉',
    nextTask: 'Great job! Your next task: {task} {icon}',
    allTasksCompleted: '🎉 Amazing! You completed all tasks today! You\'re awesome! 🌟',
    mustCompleteCurrent: 'You must complete the current task before starting another one! 💪',
    
    // Status
    hunger: 'Hunger',
    energy: 'Energy',
    happiness: 'Happiness',
    mood: 'Mood',
    
    // Language
    language: 'Language',
    hebrew: 'Hebrew',
    english: 'English',
    russian: 'Russian',
  },
  
  [Language.RUSSIAN]: {
    // General
    appName: 'EmotiMate',
    welcome: 'Привет! Я твой цифровой друг. Как ты себя чувствуешь сегодня?',
    
    // Emotions
    happy: 'Счастливый',
    sad: 'Грустный',
    tired: 'Усталый',
    hungry: 'Голодный',
    neutral: 'Спокойный',
    
    // Time of day
    morning: 'Утро',
    afternoon: 'День',
    evening: 'Вечер',
    night: 'Ночь',
    goodMorning: 'Доброе утро! День начинается! 🌅',
    goodAfternoon: 'Добрый день! ☀️',
    goodEvening: 'Добрый вечер! 🌆',
    goodNight: 'Спокойной ночи! 🌙',
    
    // Tasks
    schedule: 'Распорядок дня',
    task: 'Задача',
    completed: 'Выполнено',
    activeTask: 'Активная задача',
    locked: 'Заблокировано',
    now: 'Сейчас!',
    points: 'Очки',
    subTasks: 'Подзадачи',
    
    // Rewards
    rewards: 'Награды',
    totalPoints: 'Всего очков',
    dailyPoints: 'Дневные очки',
    streak: 'Дней подряд',
    achievements: 'Достижения',
    
    // Customization
    customize: 'Настройка друга',
    selectPet: 'Выбери своего друга',
    bunny: 'Кролик',
    maineCoon: 'Мейн-кун',
    dog: 'Собака',
    hat: 'Шляпа',
    bow: 'Бант',
    clothing: 'Одежда',
    background: 'Фон',
    color: 'Цвет',
    
    // Alerts
    petVeryHungry: 'Твой друг очень голоден! Нужно покормить!',
    petVeryTired: 'Твой друг очень устал! Нужно отдохнуть!',
    petVerySad: 'Твой друг грустный! Нужно поиграть!',
    petGettingHungry: 'Твой друг начинает голодать',
    petGettingTired: 'Твой друг начинает уставать',
    
    // Activity
    dailyActivity: 'Дневная активность',
    tasksCompleted: 'задач выполнено',
    lastActivity: 'Последняя активность',
    
    // Messages
    taskCompleted: 'Отлично! Ты выполнил задачу: {task}! Получил {points} очков! 🎉',
    nextTask: 'Отлично! Следующая задача: {task} {icon}',
    allTasksCompleted: '🎉 Потрясающе! Ты выполнил все задачи сегодня! Ты молодец! 🌟',
    mustCompleteCurrent: 'Ты должен завершить текущую задачу перед началом другой! 💪',
    
    // Status
    hunger: 'Голод',
    energy: 'Энергия',
    happiness: 'Счастье',
    mood: 'Настроение',
    
    // Language
    language: 'Язык',
    hebrew: 'Иврит',
    english: 'Английский',
    russian: 'Русский',
  }
};

export type TranslationKey = keyof typeof translations[Language.HEBREW];

export const translate = (key: TranslationKey, language: Language, params?: Record<string, string>): string => {
  if (!key) return '';
  const langTranslations = translations[language] || translations[Language.HEBREW];
  let text = (langTranslations as any)[key] || (translations[Language.HEBREW] as any)[key] || key;
  
  // Replace parameters
  if (params && typeof text === 'string') {
    Object.keys(params).forEach(param => {
      text = text.replace(`{${param}}`, params[param] || '');
    });
  }
  
  return text;
};
