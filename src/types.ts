export enum Language {
  HEBREW = 'he',
  ENGLISH = 'en',
  RUSSIAN = 'ru'
}

export enum Emotion {
  HAPPY = 'שמח',
  SAD = 'עצוב',
  TIRED = 'עייף',
  HUNGRY = 'רעב',
  NEUTRAL = 'רגוע',
  VACATION = 'בחופשה'
}

export enum PetType {
  BUNNY = 'bunny',
  MAINE_COON = 'maine_coon',
  DOG = 'dog',
  BEAR = 'bear',
  BIRD = 'bird',
  MOUSE = 'mouse',
  ELEPHANT = 'elephant'
}

export enum TimeOfDay {
  MORNING = 'בוקר',
  AFTERNOON = 'צהריים',
  EVENING = 'ערב',
  NIGHT = 'לילה'
}

export interface BunnyCustomization {
  petType?: PetType;
  hat?: 'none' | 'top_hat' | 'cap' | 'crown' | 'beanie' | 'cowboy' | 'party' | 'wizard';
  bow?: 'none' | 'red_bow' | 'blue_bow' | 'pink_bow' | 'rainbow_bow' | 'gold_bow' | 'flower';
  clothing?: 'none' | 'shirt' | 'jacket' | 'dress' | 'sweater' | 'hoodie' | 'vest' | 'tie';
  background?: 'none' | 'garden' | 'room' | 'park' | 'beach' | 'space' | 'forest' | 'city' | 'mountain' | 'underwater';
  color?: 'default' | 'brown' | 'white' | 'gray' | 'pink' | 'black' | 'orange' | 'yellow';
  glasses?: 'none' | 'sunglasses' | 'reading' | 'cool';
  scarf?: 'none' | 'red_scarf' | 'blue_scarf' | 'rainbow_scarf';
  accessories?: 'none' | 'flower' | 'star' | 'heart_pin' | 'guitar';
}

export interface BunnyState {
  hunger: number; // 0-100 (100 is full)
  energy: number; // 0-100 (100 is energetic)
  happiness: number; // 0-100 (100 is very happy)
  currentEmotion: Emotion;
  customization?: BunnyCustomization;
  currentAnimation?: 'idle' | 'happy' | 'sad' | 'excited' | 'sleepy' | 'eating' | 'playing' | 'satisfied' | 'relaxing' | 'task_completed' | 'sleeping_in_bed' | 'dancing';
}

export type TaskCategory = 'adl' | 'work' | 'social' | 'leisure';

export interface SubTask {
  id: string;
  text: string;
  completed: boolean;
  icon?: string;
  points?: number;
}

export interface ScheduleItem {
  id: string;
  timeOfDay: TimeOfDay;
  timeLabel: string;
  task: string;
  completed: boolean;
  icon: string;
  category?: TaskCategory;
  points?: number;
  subTasks?: SubTask[];
}

export interface UserProfile {
  preferredMusic: string;
  favoriteFoods: string[];
  recentEmotionalTrends: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  imageUrl?: string; // Base64 image
  audioUrl?: string; // Base64 audio
  timestamp: Date;
}

export interface RewardState {
  totalPoints: number;
  dailyPoints: number;
  streak: number; // Consecutive days with completed tasks
  achievements: Achievement[];
  lastResetDate: string; // ISO date string
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedDate?: Date;
}

export interface RoutineReminder {
  id: string;
  time: string; // HH:MM format
  message: string;
  lastTriggered?: Date;
}

export interface AudioProfile {
  preferredFrequency: 'very_low' | 'low' | 'low_mid' | 'mid' | 'mid_high' | 'high' | 'very_high_soft';
  sensitivityLevel: 'none' | 'mild' | 'moderate' | 'severe';
  dwellTimes: { [key in PetType]: number };
  interactions: { [key in PetType]: number };
  avoidedPets: PetType[];
  frequencySensitivityMap?: { [frequency: string]: number }; // Detailed sensitivity per frequency
}

export interface CalmLog {
  timestamp: string;
  duration: number;
  type?: 'calm' | 'daily_wrap_up' | 'story_time_activity' | 'task_completion';
  mood?: 'happy' | 'okay' | 'hard';
  activity?: string;
  label?: string;
  taskId?: string;
  taskLabel?: string;
}

export type DiagnosticModuleId = 'frequency' | 'speech' | 'intonation' | 'responsiveness' | 'behavior';

export interface DiagnosticResult {
  id: string;
  moduleId: DiagnosticModuleId;
  timestamp: string;
  language: Language;
  stepIndex: number;
  completed: boolean;
  micPermission: 'unknown' | 'granted' | 'denied';
  ambientDb?: number | null;
  lastToneHz?: number | null;
  recordingMs?: number | null;
  behaviorAnswers?: {
    q1?: boolean;
    q2?: boolean;
  };
  speechAnswers?: {
    heardClearly?: boolean;
    distracted?: boolean;
    wantsRepeat?: boolean;
  };
  liveFeedback?: {
    comfortNow?: boolean;
    distractedNow?: boolean;
  };
  distractionMetrics?: {
    focusLostCount?: number;
    hiddenCount?: number;
    motionEvents?: number;
    motionScoreAvg?: number;
  };
  preferredFrequencyHz?: number | null;
  aversiveFrequencyHz?: number | null;
  videoCaptureEnabled?: boolean;
  videoCapturedMs?: number | null;
  status?: string;
  log: string[];
}

export interface Photo {
  id: string;
  url: string;
  timestamp: string;
}
