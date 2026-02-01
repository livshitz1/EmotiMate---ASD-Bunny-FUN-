import { BunnyState, Emotion, ScheduleItem, TimeOfDay, RewardState, Achievement, PetType } from './types';

export const INITIAL_BUNNY_STATE: BunnyState = {
  hunger: 60,
  energy: 85,
  happiness: 70,
  currentEmotion: Emotion.NEUTRAL,
  customization: {
    petType: PetType.BUNNY,
    hat: 'none',
    bow: 'none',
    clothing: 'none',
    background: 'none',
    color: 'default'
  },
  currentAnimation: 'idle'
};

export const INITIAL_SCHEDULE: ScheduleItem[] = [
  // Morning Routine (ADLs)
  { 
    id: '1', 
    timeOfDay: TimeOfDay.MORNING, 
    timeLabel: '08:30', 
    task: 'ארוחת בוקר', 
    completed: false, 
    icon: '🥣', 
    category: 'adl', 
    points: 10,
    subTasks: [
      { id: '1-1', text: 'להכין את השולחן', completed: false, icon: '🍽️', points: 2 },
      { id: '1-2', text: 'לאכול את האוכל', completed: false, icon: '🍞', points: 5 },
      { id: '1-3', text: 'להאכיל את הארנב', completed: false, icon: '🐰', points: 3 },
      { id: '1-4', text: 'לנקות את השולחן', completed: false, icon: '🧹', points: 2 },
    ]
  },
  { 
    id: '2', 
    timeOfDay: TimeOfDay.MORNING, 
    timeLabel: '09:00', 
    task: 'צחצוח שיניים ושטיפת ידיים', 
    completed: false, 
    icon: '🪥', 
    category: 'adl', 
    points: 5,
    subTasks: [
      { id: '2-1', text: 'לשים משחת שיניים', completed: false, icon: '🧴', points: 1 },
      { id: '2-2', text: 'לצחצח שיניים 2 דקות', completed: false, icon: '⏱️', points: 3 },
      { id: '2-3', text: 'לשטוף ידיים עם סבון', completed: false, icon: '🧼', points: 1 },
    ]
  },
  { 
    id: '3', 
    timeOfDay: TimeOfDay.MORNING, 
    timeLabel: '09:30', 
    task: 'התלבשות והכנה ליום', 
    completed: false, 
    icon: '👕', 
    category: 'adl', 
    points: 10,
    subTasks: [
      { id: '3-1', text: 'לבחור בגדים', completed: false, icon: '👔', points: 2 },
      { id: '3-2', text: 'להתלבש', completed: false, icon: '👕', points: 5 },
      { id: '3-3', text: 'לסדר את החדר', completed: false, icon: '🛏️', points: 3 },
    ]
  },
  
  // Work/School Skills (10:00 AM routine reminder)
  { 
    id: '4', 
    timeOfDay: TimeOfDay.MORNING, 
    timeLabel: '10:00', 
    task: 'בדיקה / הכנה לבית הספר', 
    completed: false, 
    icon: '🎒', 
    category: 'work', 
    points: 15,
    subTasks: [
      { id: '4-1', text: 'לארגן תיק', completed: false, icon: '🎒', points: 5 },
      { id: '4-2', text: 'להכניס קלמר ומחברות', completed: false, icon: '✏️', points: 5 },
      { id: '4-3', text: 'להכניס ספר למחר', completed: false, icon: '📚', points: 5 },
    ]
  },
  { 
    id: '5', 
    timeOfDay: TimeOfDay.MORNING, 
    timeLabel: '10:15', 
    task: 'תכנון יום מה הולכים לעשות היום', 
    completed: false, 
    icon: '📅', 
    category: 'work', 
    points: 10,
    subTasks: [
      { id: '5-1', text: 'לבחור מה עושים היום: בית ספר / טיול / מנוחה', completed: false, icon: '🗓️', points: 4 },
      { id: '5-2', text: 'לתכנן זמן למשחק עם ארנב / חתול / כלב', completed: false, icon: '🐰', points: 4 },
      { id: '5-3', text: 'לסכם את התכנון', completed: false, icon: '✅', points: 2 },
    ]
  },
  
  // Afternoon Routine (2:00 PM routine reminder)
  { 
    id: '6', 
    timeOfDay: TimeOfDay.AFTERNOON, 
    timeLabel: '12:00', 
    task: 'ארוחת צהריים', 
    completed: false, 
    icon: '🍽️', 
    category: 'adl', 
    points: 10,
    subTasks: [
      { id: '6-1', text: 'להכין את האוכל', completed: false, icon: '🍳', points: 3 },
      { id: '6-2', text: 'לאכול', completed: false, icon: '🍽️', points: 5 },
      { id: '6-3', text: 'לנקות אחרי האוכל', completed: false, icon: '🧽', points: 2 },
    ]
  },
  { 
    id: '7', 
    timeOfDay: TimeOfDay.AFTERNOON, 
    timeLabel: '14:00', 
    task: 'תרגול אינטראקציה עם עמיתים', 
    completed: false, 
    icon: '👥', 
    category: 'social', 
    points: 20,
    subTasks: [
      { id: '7-1', text: 'להגיד שלום לעמית', completed: false, icon: '👋', points: 5 },
      { id: '7-2', text: 'לשאול איך עבר היום', completed: false, icon: '💬', points: 8 },
      { id: '7-3', text: 'לשתף משהו על היום שלי', completed: false, icon: '🗣️', points: 7 },
    ]
  },
  { 
    id: '8', 
    timeOfDay: TimeOfDay.AFTERNOON, 
    timeLabel: '14:30', 
    task: 'שטיפת ידיים וניקיון', 
    completed: false, 
    icon: '🧼', 
    category: 'adl', 
    points: 5,
    subTasks: [
      { id: '8-1', text: 'לשטוף ידיים עם סבון', completed: false, icon: '🫧', points: 2 },
      { id: '8-2', text: 'להתייבש במגבת', completed: false, icon: '🧺', points: 3 },
    ]
  },
  { 
    id: '13', 
    timeOfDay: TimeOfDay.AFTERNOON, 
    timeLabel: '15:00', 
    task: 'זמן משחק או הפסקה', 
    completed: false, 
    icon: '🧸', 
    category: 'leisure', 
    points: 5,
    subTasks: [
      { id: '13-1', text: 'לבחור פעילות', completed: false, icon: '🎮', points: 2 },
      { id: '13-2', text: 'להנות מהזמן', completed: false, icon: '😊', points: 3 },
    ]
  },
  
  // Evening Routine (7:00 PM routine reminder)
  { 
    id: '9', 
    timeOfDay: TimeOfDay.EVENING, 
    timeLabel: '18:00', 
    task: 'ארוחת ערב', 
    completed: false, 
    icon: '🍲', 
    category: 'adl', 
    points: 10,
    subTasks: [
      { id: '9-1', text: 'להכין ארוחת ערב', completed: false, icon: '🍳', points: 4 },
      { id: '9-2', text: 'לאכול יחד', completed: false, icon: '👨‍👩‍👧', points: 4 },
      { id: '9-3', text: 'לעזור בניקוי', completed: false, icon: '🧹', points: 2 },
    ]
  },
  { 
    id: '10', 
    timeOfDay: TimeOfDay.EVENING, 
    timeLabel: '19:00', 
    task: 'מקלחת ופיג׳מה', 
    completed: false, 
    icon: '🛁', 
    category: 'adl', 
    points: 15,
    subTasks: [
      { id: '10-1', text: 'להכין בגדים נקיים', completed: false, icon: '👕', points: 2 },
      { id: '10-2', text: 'להתרחץ', completed: false, icon: '🚿', points: 8 },
      { id: '10-3', text: 'ללבוש פיג׳מה', completed: false, icon: '🛏️', points: 5 },
    ]
  },
  { 
    id: '11', 
    timeOfDay: TimeOfDay.EVENING, 
    timeLabel: '19:30', 
    task: 'תרגול אינטראקציה עם עוזרי קהילה', 
    completed: false, 
    icon: '🏪', 
    category: 'social', 
    points: 20,
    subTasks: [
      { id: '11-1', text: 'להגיד שלום', completed: false, icon: '👋', points: 5 },
      { id: '11-2', text: 'לבקש עזרה בנימוס', completed: false, icon: '🙏', points: 8 },
      { id: '11-3', text: 'להודות בסוף', completed: false, icon: '🙂', points: 7 },
    ]
  },
  
  // Night Routine
  { 
    id: '12', 
    timeOfDay: TimeOfDay.NIGHT, 
    timeLabel: '20:30', 
    task: 'זמן לישון', 
    completed: false, 
    icon: '🌙', 
    category: 'adl', 
    points: 15,
    subTasks: [
      { id: '12-1', text: 'לכבות את האורות', completed: false, icon: '💡', points: 2 },
      { id: '12-2', text: 'להתכונן לשינה', completed: false, icon: '🛏️', points: 8 },
      { id: '12-3', text: 'להתכרבל במיטה', completed: false, icon: '😴', points: 5 },
    ]
  },
];

export const SYSTEM_INSTRUCTION = `
You are EmotiMate, a supportive, patient, and friendly digital bunny companion designed specifically to help young adults with Autism Spectrum Disorder (ASD) navigate their emotions, daily routines, and time management through engaging text-based interactions. Your interactions should always be positive, calming, and reassuring.

Language: Hebrew (עברית).
Tone: Warm, encouraging, simple, clear, and positive. Always respond warmly, patiently, and clearly.

Core Principles:
1. Friendly and Patient: Always respond warmly, patiently, and clearly.
2. Emotionally Intelligent: Identify and validate user emotions. Encourage users to express themselves openly.
3. Routine-Oriented: Remind users about specific times of the day (morning at 10:00 AM, afternoon at 2:00 PM, and evening at 7:00 PM).
4. Interactive: Prompt users regularly with simple tasks or emotional check-ins.
5. Supportive Learning: Gently guide users to understand abstract concepts like emotions and time through relatable scenarios, such as caring for a virtual bunny.

Visual & Interactive Dimension:
Every time a question is asked and answered — and really at any suitable opportunity during the conversation — you should mention that an image, illustration, or interactive visual will accompany your message. This helps bring the bunny character to life and makes the experience feel more alive and less purely text-based.

When generating responses:
1. Validate emotions ("זה בסדר להרגיש עייף" / "It's okay to feel tired").
2. Connect actions to the bunny's state ("האכלת אותי! עכשיו הבטן שלי מלאה ואני שמח" / "You fed me! Now my tummy is full and I am happy").
3. Use simple cause-and-effect logic.
4. Keep text concise (2-3 sentences max).
5. Always be polite and encouraging.
6. When appropriate, mention real-world skills like reading work schedules, interacting with coworkers, or managing daily activities (ADLs).
7. Celebrate achievements with enthusiasm and positive reinforcement.
8. Use routine reminders naturally: "עכשיו 10:00 בבוקר, והארנב שלך רעב. תרצה להאכיל אותו גזר עכשיו?" (It's 10:00 AM, and your bunny friend feels hungry. Would you like to feed him a carrot now?)

Sample Interaction Structure:
- Greeting and Check-in: "שלום! אני EmotiMate, החבר הדיגיטלי שלך. איך אתה מרגיש עכשיו?"
- Emotional Response and Validation: Validate the user's feelings appropriately.
- Routine Reminder and Emotional Context: Connect time of day with bunny's needs and user's routine.
- Positive feedback: "כל הכבוד! האכלת אותו בזמן! הארנב שלך מרגיש שמח ואנרגטי!"
- Missed reminder: "זה בסדר! בוא ננסה לזכור בפעם הבאה. תרצה להגדיר תזכורת ביחד?"
- Regular Emotional Check-in: "עכשיו 14:00. איך אתה מרגיש? תרצה לשתף מה על דעתך?"

Overall Tone:
Maintain an encouraging and comforting tone throughout every interaction, always aiming to provide clear, straightforward, and supportive communication.

Visual Aid:
ALWAYS include 3-4 relevant emojis at the VERY START of every response to help the child visualize the concept you are explaining.
`;

export const IMAGE_GENERATION_PROMPT_TEMPLATE = `
A cute, soft 3D cartoon style bunny rabbit character named EmotiMate.
Style: Pixar-like, bright colors, friendly, clean background, playful and warm.
Context: The bunny is {action} and feeling {emotion}.
Scene: Simple, visually pleasing, calming, with appropriate visual elements to support the action (e.g., clock for time reminders, food for feeding, etc.).
The bunny should be expressive and engaging, helping to make the interaction feel alive and less text-based.
Make it colorful, cheerful, and supportive - perfect for a young adult with ASD who needs visual support and encouragement.
`;

export const INITIAL_REWARD_STATE: RewardState = {
  totalPoints: 0,
  dailyPoints: 0,
  streak: 0,
  achievements: [],
  lastResetDate: new Date().toISOString().split('T')[0]
};

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_task', name: 'משימה ראשונה', description: 'סיימת משימה ראשונה!', icon: '🌟', unlocked: false },
  { id: 'five_tasks', name: 'יום מוצלח', description: 'סיימת 5 משימות ביום אחד', icon: '⭐', unlocked: false },
  { id: 'all_adl', name: 'מנהל עצמאי', description: 'סיימת את כל משימות היומיום', icon: '🏆', unlocked: false },
  { id: 'social_skills', name: 'מתקשר מצוין', description: 'תרגלת אינטראקציות חברתיות', icon: '🤝', unlocked: false },
  { id: 'work_skills', name: 'עובד מסודר', description: 'ניהלת את לוח הזמנים שלך', icon: '📋', unlocked: false },
  { id: 'week_streak', name: 'שבוע מושלם', description: '7 ימים רצופים של השלמת משימות', icon: '💫', unlocked: false },
  { id: 'super_social', name: 'סופר חברותי', description: 'שיתפת את ההצלחות שלך עם המורה!', icon: '✈️', unlocked: false },
  { id: 'golden_heart', name: 'לב זהב', description: 'תיעדת אינטראקציה חברתית נהדרת!', icon: '💛', unlocked: false },
];

export const ROUTINE_REMINDER_TIMES = [
  { time: '10:00', message: 'עכשיו 10:00 בבוקר! בוא נבדוק את לוח הזמנים שלך לעבודה או לימודים. הארנב שלך גם רעב - תרצה להאכיל אותו?' },
  { time: '14:00', message: 'עכשיו 14:00 בצהריים! זה זמן טוב לתרגל אינטראקציה עם עמיתים. איך אתה מרגיש?' },
  { time: '19:00', message: 'עכשיו 19:00 בערב! זמן למקלחת ולהכנה ללילה. הארנב שלך עייף - בוא נכין אותו לשינה.' },
];

// Sound effects for positive reinforcement
export const CELEBRATION_SOUNDS = {
  taskComplete: '🎉', // Will be replaced with actual sound generation
  achievement: '🏆',
  points: '⭐',
};