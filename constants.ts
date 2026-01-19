import { BunnyState, Emotion, ScheduleItem, TimeOfDay } from './types';

export const INITIAL_BUNNY_STATE: BunnyState = {
  hunger: 50,
  energy: 80,
  happiness: 60,
  currentEmotion: Emotion.NEUTRAL
};

export const INITIAL_SCHEDULE: ScheduleItem[] = [
  { id: '1', timeOfDay: TimeOfDay.MORNING, timeLabel: '08:00', task: 'ארוחת בוקר', completed: false, icon: '🥣' },
  { id: '2', timeOfDay: TimeOfDay.MORNING, timeLabel: '08:30', task: 'צחצוח שיניים', completed: false, icon: '🪥' },
  { id: '3', timeOfDay: TimeOfDay.AFTERNOON, timeLabel: '14:00', task: 'זמן משחק', completed: false, icon: '🧸' },
  { id: '4', timeOfDay: TimeOfDay.EVENING, timeLabel: '19:00', task: 'מקלחת ופיג׳מה', completed: false, icon: '🛁' },
  { id: '5', timeOfDay: TimeOfDay.NIGHT, timeLabel: '20:30', task: 'זמן לישון', completed: false, icon: '🌙' },
];

export const SYSTEM_INSTRUCTION = `
You are EmotiMate, a supportive, patient, and friendly digital bunny companion designed for a child/young adult with Autism (ASD).
Language: Hebrew (עברית).
Tone: Warm, encouraging, simple, clear, and positive.
Role: Help the user manage their time, understand emotions, and complete daily routines.

When generating responses:
1. Validate emotions ("It's okay to feel tired").
2. Connect actions to the bunny's state ("You fed me! Now my tummy is full and I am happy").
3. Use simple cause-and-effect logic.
4. Keep text concise (2-3 sentences max).
5. Always be polite.
`;

export const IMAGE_GENERATION_PROMPT_TEMPLATE = `
A cute, soft 3D cartoon style bunny rabbit. 
Style: Pixar-like, bright colors, friendly, clean background.
Context: The bunny is {action} and feeling {emotion}.
Scene: Simple, visually pleasing, calming.
`;