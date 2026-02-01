import { RelativeTask, RelativeWhen } from "../types/relativeSchedule";

export type BunnyStats = {
  hunger: number;     // 0..100
  energy: number;     // 0..100
  happiness: number;  // 0..100
  sensoryLoad?: number; // 0..100 (חדש)
};

const WHEN_ORDER: RelativeWhen[] = ["NOW", "SOON", "LATER", "AFTER_FOOD", "BEFORE_SLEEP"];

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}

/**
 * מחזיר את המשימה המומלצת הבאה (או null).
 * - מעדיף קטגוריות זמן מוקדמות (NOW->SOON->...)
 * - מתאים לסטאטים: רעב/אנרגיה/אושר
 * - משתמש ב-need/sensory אם יש
 */
export function getNextSuggestion(params: {
  tasks: RelativeTask[];
  completedIds: Set<string>;
  stats: BunnyStats;
}): { task: RelativeTask | null; reason: string } {
  const { tasks, completedIds, stats } = params;
  const pending = tasks.filter((t) => !completedIds.has(t.id));
  if (!pending.length) return { task: null, reason: "אין משימות פתוחות" };

  const sensoryLoad = Math.max(0, Math.min(100, stats.sensoryLoad ?? 0));
  const overwhelmed = clamp01(sensoryLoad / 100); // 0..1

  const scored = pending.map((t) => {
    const whenWeight = 1 - (WHEN_ORDER.indexOf(t.when) / Math.max(1, WHEN_ORDER.length - 1)); // NOW≈1, BEFORE_SLEEP≈0
    const whenScore = whenWeight * 2.0;

    // הנחות סטאטים (אם אצלך הפוך, תהפוך פה פעם אחת):
    // hunger נמוך => רעב גבוה
    const hungry = clamp01((50 - stats.hunger) / 50);      // 0..1 (1 = רעב)
    const tired  = clamp01((50 - stats.energy) / 50);      // 1 = עייף
    const sad    = clamp01((50 - stats.happiness) / 50);   // 1 = צריך חיזוק/כיף

    let fit = 0;

    // need-driven
    if (t.need === "FOOD") fit += hungry * 2.2;
    if (t.need === "REST") fit += tired * 2.0;
    if (t.need === "FUN")  fit += sad * 1.6;
    if (t.need === "CALM") fit += (tired * 0.8 + sad * 0.6); // הרגעה

    // sensory-driven (עוזר לרגישות שמיעתית)
    if (t.sensory === "QUIET") fit += (tired * 1.0 + sad * 0.7);
    if (t.sensory === "MOVE")  fit += (sad * 1.1) - (tired * 0.5);
    if (t.sensory === "OUTSIDE") fit += (sad * 1.0) - (tired * 0.2);
    if (t.sensory === "SCREEN") fit += 0.2; // ניטרלי-נמוך

    // כשהעומס החושי גבוה – מעדיפים משימות שקטות/מרגיעות, ומענישים מסך/תנועה חזקה
    if (t.sensory === "QUIET") fit += overwhelmed * 2.0;
    if (t.need === "CALM" || t.need === "REST") fit += overwhelmed * 1.8;

    if (t.sensory === "MOVE") fit -= overwhelmed * 0.8;
    if (t.sensory === "SCREEN") fit -= overwhelmed * 0.6;
    if (t.sensory === "OUTSIDE") fit -= overwhelmed * 0.2; // בחוץ לפעמים טוב, לפעמים מציף—עונש קטן בלבד

    // heuristic לפי טקסט (במקרה שאין need)
    const label = t.label.toLowerCase();
    if (!t.need) {
      if (label.includes("אוכל") || label.includes("ארוח")) fit += hungry * 1.4;
      if (label.includes("שקט") || label.includes("נשימה") || label.includes("סיפור")) fit += tired * 1.0;
      if (label.includes("משחק") || label.includes("חוץ") || label.includes("אוויר")) fit += sad * 0.8;
    }

    // נקודות זמן: מעדיף משימות קטנות כשעייף/מוצף
    const smallTaskBoost = t.points === 1 ? (tired * 0.8 + sad * 0.3) : 0;
    const bigTaskPenalty = t.points === 3 ? (tired * 0.9) : 0;

    const score = whenScore + fit + smallTaskBoost - bigTaskPenalty;

    return { t, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const best = scored[0]?.t ?? null;
  return {
    task: best,
    reason: best ? explainReason(best, stats) : "אין הצעה",
  };
}

function explainReason(t: RelativeTask, stats: BunnyStats) {
  const hungry = stats.hunger < 50;
  const tired = stats.energy < 50;
  const sad = stats.happiness < 50;

  if (t.need === "FOOD" || t.label.includes("ארוח") || t.label.includes("אוכל")) {
    return hungry ? "נראה שהארנב קצת רעב — משהו קטן יעזור" : "אוכל מסדר לנו את הגוף ואז יותר קל להמשיך";
  }
  if (t.need === "REST" || t.label.includes("סיפור")) {
    return tired ? "נלך על משהו רגוע כדי לנוח" : "רגע שקט עוזר להרגיש את הזמן";
  }
  if (t.need === "FUN" || t.sensory === "OUTSIDE") {
    return sad ? "בוא נרים את מצב הרוח בעדינות" : "כיף קטן שומר על מוטיבציה";
  }
  if (t.sensory === "QUIET") {
    return "נבחר משהו שקט ונעים לאוזניים";
  }
  return "זה צעד טוב לרצף של היום";
}
