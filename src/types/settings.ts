export type UserSettings = {
  soundEnabled: boolean;  // האם בכלל לנגן קול
  volume: number;        // 0..1
  autoplay: boolean;     // לנגן אוטומטית או רק בלחיצה
};

export const DEFAULT_SETTINGS: UserSettings = {
  soundEnabled: false, // ברירת מחדל: שקט (מומלץ לרגישות שמיעתית)
  volume: 0.4,
  autoplay: false,
};
