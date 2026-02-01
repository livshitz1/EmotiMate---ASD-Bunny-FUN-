export type RelativeWhen =
  | "NOW"
  | "SOON"
  | "LATER"
  | "AFTER_FOOD"
  | "BEFORE_SLEEP";

export type SensoryTag = "QUIET" | "MOVE" | "SCREEN" | "OUTSIDE";

export type TaskNeed = "FOOD" | "REST" | "FUN" | "CALM";

export type RelativeTask = {
  id: string;
  label: string;
  when: RelativeWhen;
  points: 1 | 2 | 3;
  sensory?: SensoryTag;
  icon?: string;
  need?: TaskNeed; // חדש
};

export const WHEN_LABELS: Record<RelativeWhen, string> = {
  NOW: "עכשיו",
  SOON: "עוד מעט",
  LATER: "אחר כך",
  AFTER_FOOD: "אחרי אוכל",
  BEFORE_SLEEP: "לפני שינה",
};

export const DEFAULT_RELATIVE_TASKS: RelativeTask[] = [
  { id: "breakfast", label: "ארוחת בוקר", when: "NOW", points: 2, sensory: "QUIET", icon: "🥣", need: "FOOD" },
  { id: "brush", label: "צחצוח שיניים", when: "SOON", points: 1, sensory: "QUIET", icon: "🪥", need: "CALM" },
  { id: "outside", label: "יציאה קצרה/אוויר", when: "LATER", points: 2, sensory: "OUTSIDE", icon: "🌿", need: "FUN" },
  { id: "play", label: "משחק רגוע", when: "AFTER_FOOD", points: 2, sensory: "QUIET", icon: "🧩", need: "FUN" },
  { id: "story", label: "סיפור קצר", when: "BEFORE_SLEEP", points: 1, sensory: "QUIET", icon: "📖", need: "REST" },
];
