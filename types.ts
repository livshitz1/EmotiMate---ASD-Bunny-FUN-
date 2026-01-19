export enum Emotion {
  HAPPY = 'שמח',
  SAD = 'עצוב',
  TIRED = 'עייף',
  HUNGRY = 'רעב',
  NEUTRAL = 'רגוע'
}

export enum TimeOfDay {
  MORNING = 'בוקר',
  AFTERNOON = 'צהריים',
  EVENING = 'ערב',
  NIGHT = 'לילה'
}

export interface BunnyState {
  hunger: number; // 0-100 (100 is full)
  energy: number; // 0-100 (100 is energetic)
  happiness: number; // 0-100 (100 is very happy)
  currentEmotion: Emotion;
}

export interface ScheduleItem {
  id: string;
  timeOfDay: TimeOfDay;
  timeLabel: string;
  task: string;
  completed: boolean;
  icon: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  imageUrl?: string; // Base64 image
  audioUrl?: string; // Base64 audio
  timestamp: Date;
}