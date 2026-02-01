import React, { useMemo } from "react";
import { RelativeTask, WHEN_LABELS, RelativeWhen } from "../types/relativeSchedule";

function groupByWhen(tasks: RelativeTask[]) {
  const order: RelativeWhen[] = ["NOW", "SOON", "LATER", "AFTER_FOOD", "BEFORE_SLEEP"];
  const map = new Map<RelativeWhen, RelativeTask[]>();
  order.forEach((k) => map.set(k, []));
  tasks.forEach((t) => map.get(t.when)?.push(t));
  return { order, map };
}

export default function RelativeSchedule({
  tasks,
  completedIds,
  onComplete,
  progress,
  focusedTaskId, // חדש
}: {
  tasks: RelativeTask[];
  completedIds: Set<string>;
  onComplete: (taskId: string) => void;
  progress: { current: number; goal: number };
  focusedTaskId?: string | null;
}) {
  const { order, map } = useMemo(() => groupByWhen(tasks), [tasks]);

  const pct = Math.min(100, Math.round((progress.current / Math.max(1, progress.goal)) * 100));

  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-gray-800">רצועת זמן</h3>
        <div className="text-xs text-gray-500">בלי שעונים, כן הבנה</div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
          <span>מד זמן</span>
          <span>{pct}%</span>
        </div>
        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-3 bg-green-300" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="space-y-3">
        {order.map((whenKey) => {
          const group = map.get(whenKey) ?? [];
          if (!group.length) return null;

          const isNow = whenKey === "NOW";
          return (
            <div key={whenKey} className={isNow ? "p-3 rounded-xl border-2 border-blue-200 bg-blue-50" : ""}>
              <div className={`font-bold ${isNow ? "text-blue-800" : "text-gray-800"} mb-2`}>
                {WHEN_LABELS[whenKey]}
              </div>

              <div className="grid gap-2">
                {group.map((t) => {
                  const done = completedIds.has(t.id);
                  const focused = focusedTaskId === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => !done && onComplete(t.id)}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-colors text-right ${
                        done
                          ? "bg-green-50 border-green-200 text-green-800"
                          : focused
                          ? "bg-yellow-50 border-yellow-300 text-gray-900"
                          : "bg-white border-gray-200 hover:bg-gray-50 text-gray-800"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-xl">{t.icon ?? "⏳"}</div>
                        <div>
                          <div className="font-semibold">{t.label}</div>
                          <div className="text-xs opacity-70">
                            נקודות זמן: {t.points} {t.sensory ? `• ${tagToHebrew(t.sensory)}` : ""}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm font-bold">{done ? "בוצע" : "סמן"}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function tagToHebrew(tag: string) {
  switch (tag) {
    case "QUIET":
      return "שקט";
    case "MOVE":
      return "תנועה";
    case "SCREEN":
      return "מסך";
    case "OUTSIDE":
      return "בחוץ";
    default:
      return "";
  }
}
